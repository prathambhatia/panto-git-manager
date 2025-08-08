import express from 'express';
import passport from 'passport';
import '../passport-setup.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const authRouter = express.Router();

// start oauth with github
authRouter.get('/github', passport.authenticate('github', { scope: [ 'user:email', 'repo' ] }));

authRouter.get('/github/callback', passport.authenticate('github', { failureRedirect: '/auth/fail' }), (req, res) => {
  // issue JWT and redirect to frontend with token
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
  const redirect = (process.env.FRONTEND_URL || 'http://localhost:3000') + '/auth/success?token=' + token;
  res.redirect(redirect);
});

authRouter.get('/gitlab', passport.authenticate('gitlab', { scope: [ 'read_user', 'read_api' ] }));
authRouter.get('/gitlab/callback', passport.authenticate('gitlab', { failureRedirect: '/auth/fail' }), (req, res) => {
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
  const redirect = (process.env.FRONTEND_URL || 'http://localhost:3000') + '/auth/success?token=' + token;
  res.redirect(redirect);
});

authRouter.get('/fail', (req, res) => {
  res.send({ ok:false, message: 'Auth failed' });
});
