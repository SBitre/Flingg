const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

const connectedUsers = new Map(); // userId -> socketId

const initSocket = (io) => {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('No token'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'flingg_secret_key');
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    connectedUsers.set(userId, socket.id);
    console.log(`Socket connected: ${userId}`);

    // Join a chat room
    socket.on('join_room', (matchId) => {
      socket.join(matchId);
    });

    // Leave a chat room
    socket.on('leave_room', (matchId) => {
      socket.leave(matchId);
    });

    // Send a message
    socket.on('send_message', async (data) => {
      const { matchId, content } = data;

      if (!matchId || !content || !content.trim()) return;

      // Verify the user belongs to this match
      const userIds = matchId.split('_');
      if (!userIds.includes(userId)) return;

      try {
        const message = new Message({
          matchId,
          sender: userId,
          content: content.trim(),
        });

        await message.save();
        await message.populate('sender', 'name photos');

        // Emit to all users in the room
        io.to(matchId).emit('new_message', message);
      } catch (err) {
        console.error('Socket send_message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { matchId, isTyping } = data;
      socket.to(matchId).emit('user_typing', { userId, isTyping });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      console.log(`Socket disconnected: ${userId}`);
    });
  });
};

module.exports = { initSocket };
