const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const swipeRoutes = require('./routes/swipe');
const matchRoutes = require('./routes/matches');
const messageRoutes = require('./routes/messages');
const { initSocket } = require('./socket');

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swipe', swipeRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Flingg API is running 🔥' });
});

// Init Socket.io
initSocket(io);

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flingg';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`✓ Flingg server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });
