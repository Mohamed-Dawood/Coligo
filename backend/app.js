import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import logger from './utils/logger.js';
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import scheduleRouter from './routes/schedule.js';
import coursesRouter from './routes/courses.js';
import gradebookRouter from './routes/gradebook.js';
import performanceRouter from './routes/performance.js';
import announcementRouter from './routes/announcement.js';
import quizRouter from './routes/quiz.js';
import testRouter from './routes/test.js';
import { notFound } from './middleware/notFound.js';
import { connectDB } from './db/connectDB.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:5173', // Vite default port
      'http://localhost:5174', // Vite alternate port
      'http://localhost:3000', // Frontend development port
      'http://192.168.1.3:3000', // Your local IP
      'https://coligo-frontend.vercel.app', // Add your Vercel deployment URL
      'https://coligo-frontend.netlify.app', // Add your Netlify deployment URL
      /\.vercel\.app$/, // Allow all Vercel subdomains
      /\.netlify\.app$/, // Allow all Netlify subdomains
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(logger);
dotenv.config();

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/schedule', scheduleRouter);
app.use('/api/v1/courses', coursesRouter);
app.use('/api/v1/gradebook', gradebookRouter);
app.use('/api/v1/performance', performanceRouter);
app.use('/api/v1/announcements', announcementRouter);
app.use('/api/v1/quizzes', quizRouter);
app.use('/api/v1/test', testRouter);

// Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8001;

const dbUrl = process.env.DB_URL.replace(
  '<db_password>',
  process.env.DB_PASSWORD
);

const start = () => {
  app.listen(PORT, async () => {
    try {
      await connectDB(dbUrl);
      console.log(`App is running on port ${PORT}...`);
    } catch (error) {
      console.log('Server failed to start', error);
      process.exit(1);
    }
  });
};
start();
