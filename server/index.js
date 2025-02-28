import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './src/config/db.config.js';
import configureSocket from './src/config/socket.io.config.js';
import authRoutes from './src/routes/auth.routes.js';
import messageRoutes from './src/routes/message.routes.js';
import userRoutes from './src/routes/user.routes.js';
import cors from 'cors';
import path from 'path';

dotenv.config();

connectDB();

const app = express();
const httpServer = createServer(app);
const io = configureSocket(httpServer);

const __dirname = path.resolve();

const PORT = process.env.PORT || 5000;
app.use(cors(
  {
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
));
// Middleware with increased limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// CORS configuration if needed
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Make io available in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, './client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});