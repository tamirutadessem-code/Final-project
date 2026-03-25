import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Create logs directory safely
const logsDir = path.join(process.cwd(), 'logs');

try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true, mode: 0o755 });
  }
} catch (error) {
  console.warn('⚠️ Could not create logs directory, logging to console only');
}

// Only use file transport if directory exists
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

// Try to add file transport if directory exists
try {
  if (fs.existsSync(logsDir)) {
    transports.push(
      new winston.transports.File({ 
        filename: path.join(logsDir, 'error.log'), 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: path.join(logsDir, 'combined.log') 
      })
    );
  }
} catch (error) {
  console.warn('⚠️ File logging disabled:', error);
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});

export default logger;