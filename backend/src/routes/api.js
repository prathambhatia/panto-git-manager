import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import simpleGit from 'simple-git';
import fs from 'fs';
import os from 'os';
import path from 'path';

dotenv.config();
const prisma = new PrismaClient();
export const apiRouter = express.Router();

// Middleware: Auth
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing token' });

  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid auth header' });

  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    req.userId = payload.id; // @ts-ignore
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /repos
apiRouter.get('/repos', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  let repos = await prisma.repo.findMany({ where: { userId: user.id } });
  if (repos.length > 0) return res.json({ repos });

  try {
    let items;
    if (user.provider === 'github') {
      const r = await axios.get('https://api.github.com/user/repos?per_page=200', {
        headers: {
          Authorization: 'token ' + user.accessToken,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      items = r.data.map(i => ({
        provider: 'github',
        providerRepoId: String(i.id),
        name: i.name,
        fullName: i.full_name,
        url: i.html_url,
        stars: i.stargazers_count,
        defaultBranch: i.default_branch,
      }));
    } else if (user.provider === 'gitlab') {
      const r = await axios.get('https://gitlab.com/api/v4/projects?membership=true&per_page=200', {
        headers: { Authorization: 'Bearer ' + user.accessToken },
      });
      items = r.data.map(i => ({
        provider: 'gitlab',
        providerRepoId: String(i.id),
        name: i.path,
        fullName: i.path_with_namespace,
        url: i.web_url,
        stars: i.star_count,
        defaultBranch: i.default_branch,
      }));
    } else {
      return res.status(400).json({ error: 'Unsupported provider' });
    }

    // Upsert using the compound unique key
    for (const it of items) {
      await prisma.repo.upsert({
        where: {
          provider_providerRepoId: {
            provider: it.provider,
            providerRepoId: it.providerRepoId,
          },
        },
        update: { ...it, userId: user.id },
        create: { ...it, userId: user.id },
      });
    }

    repos = await prisma.repo.findMany({ where: { userId: user.id } });
    return res.json({ repos });
  } catch (err) {
    console.error(err?.response?.data || err);
    return res.status(500).json({ error: 'Failed to fetch repos', detail: err?.message });
  }
});

// POST /repo/:id/toggle
apiRouter.post('/repo/:id/toggle', authMiddleware, async (req, res) => {
  const repoId = Number(req.params.id);
  if (Number.isNaN(repoId)) return res.status(400).json({ error: 'Invalid repo ID' });

  const repo = await prisma.repo.findUnique({ where: { id: repoId } });
  if (!repo || repo.userId !== req.userId) return res.status(404).json({ error: 'Repo not found or unauthorized' });

  const updated = await prisma.repo.update({
    where: { id: repoId },
    data: { autoReview: !repo.autoReview },
  });
  res.json({ repo: updated });
});

// GET /repo/:id/stats
apiRouter.get('/repo/:id/stats', authMiddleware, async (req, res) => {
  const repoId = Number(req.params.id);
  if (Number.isNaN(repoId)) return res.status(400).json({ error: 'Invalid repo ID' });

  const repo = await prisma.repo.findUnique({ where: { id: repoId } });
  if (!repo || repo.userId !== req.userId) return res.status(404).json({ error: 'Repo not found or unauthorized' });

  const stats = {
    stars: repo.stars,
    defaultBranch: repo.defaultBranch || 'main',
    autoReview: repo.autoReview,
  };

  try {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-'));
    const git = simpleGit(tmp);
    await git.clone(repo.url, tmp, ['--depth', '1', '--branch', stats.defaultBranch]);

    const exts = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.m', '.h', '.cs', '.html', '.css', '.scss', '.json', '.md'];
    let total = 0;
    function walk(dir) {
      for (const it of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, it.name);
        if (it.isDirectory()) {
          if (['.git', 'node_modules', 'venv', '__pycache__'].includes(it.name)) continue;
          walk(p);
        } else if (exts.includes(path.extname(it.name).toLowerCase())) {
          total += fs.readFileSync(p, 'utf8').split('\n').length;
        }
      }
    }
    walk(tmp);
    fs.rmSync(tmp, { recursive: true, force: true });
    stats.totalLines = total;
  } catch {
    stats.totalLines = null;
  }

  res.json({ stats });
});

// GET /profile
apiRouter.get('/profile', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { repos: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    provider: user.provider,
    totalRepos: user.repos.length,
    autoReviewEnabled: user.repos.filter(r => r.autoReview).length,
  });
});

// POST /logout
apiRouter.post('/logout', authMiddleware, (_req, res) => {
  res.json({ ok: true });
});
