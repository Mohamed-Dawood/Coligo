import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const logsDirectory = path.join(process.cwd(), 'logs');

// Ensure the logs directory exists
fs.mkdirSync(logsDirectory, { recursive: true });

// Create a write stream in append mode
const accessLogStream = fs.createWriteStream(
  path.join(logsDirectory, 'access.log'),
  {
    flags: 'a',
  }
);

// Morgan middleware configured to write logs to access.log
const logger =
  process.env.NODE_ENV === 'production'
    ? morgan('combined', { stream: accessLogStream })
    : morgan('dev');

export default logger;
