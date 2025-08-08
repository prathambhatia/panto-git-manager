import express from 'express';
import passport from 'passport';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bodyParser from 'body-parser';
import { authRouter } from './routes/auth.js';
import { apiRouter } from './routes/api.js';

dotenv.config();
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: process.env.JWT_SECRET || 'dev', resave:false, saveUninitialized:false }));
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/auth', authRouter);
app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.send({ ok:true, message: 'SDE Assignment Backend' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log('Remember to run `npx prisma migrate deploy` or `npx prisma migrate dev --name init` to create DB.');
});
