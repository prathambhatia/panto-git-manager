import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import GitLabStrategy from 'passport-gitlab2';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK || 'http://localhost:4000/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const provider = 'github';
    const providerId = String(profile.id);
    let user = await prisma.user.findUnique({ where: { providerId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          provider,
          providerId,
          name: profile.displayName || profile.username,
          email: (profile.emails && profile.emails[0] && profile.emails[0].value) || null,
          avatarUrl: (profile._json && profile._json.avatar_url) || null,
          accessToken
        }
      });
    } else {
      user = await prisma.user.update({ where: { id: user.id }, data: { accessToken }});
    }
    return done(null, user);
  } catch (err) {
    done(err);
  }
}));

passport.use(new GitLabStrategy({
  clientID: process.env.GITLAB_CLIENT_ID,
  clientSecret: process.env.GITLAB_CLIENT_SECRET,
  callbackURL: process.env.GITLAB_CALLBACK || 'http://localhost:4000/auth/gitlab/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const provider = 'gitlab';
    const providerId = String(profile.id);
    let user = await prisma.user.findUnique({ where: { providerId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          provider,
          providerId,
          name: profile.displayName || profile.username,
          email: (profile.emails && profile.emails[0] && profile.emails[0].value) || null,
          avatarUrl: (profile._json && profile._json.avatar_url) || null,
          accessToken
        }
      });
    } else {
      user = await prisma.user.update({ where: { id: user.id }, data: { accessToken }});
    }
    return done(null, user);
  } catch (err) {
    done(err);
  }
}));
