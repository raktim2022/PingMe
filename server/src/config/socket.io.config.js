import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.utils.js';

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);

    // Join personal room
    socket.join(socket.userId);

    // Update user status
    socket.broadcast.emit('user:online', socket.userId);

    // Handle private messages
    socket.on('message:send', async (data) => {
      const { receiverId, message } = data;
      io.to(receiverId).emit('message:receive', {
        ...message,
        sender: socket.userId
      });
    });

    // Handle typing status
    socket.on('typing:start', (receiverId) => {
      io.to(receiverId).emit('typing:start', socket.userId);
    });

    socket.on('typing:stop', (receiverId) => {
      io.to(receiverId).emit('typing:stop', socket.userId);
    });

    // Handle message reactions
    socket.on('message:react', async ({ messageId, receiverId, reaction, timestamp }) => {
      try {
        // Broadcast to everyone in the chat except the sender
        socket.broadcast.to(receiverId).emit('message:reaction', {
          messageId,
          userId: socket.userId,
          reaction,
          timestamp
        });
      } catch (error) {
        console.error('Reaction broadcast error:', error);
      }
    });

    // Handle read receipts
    socket.on('message:read', (data) => {
      const { messageId, senderId } = data;
      io.to(senderId).emit('message:seen', {
        messageId,
        userId: socket.userId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);
      socket.broadcast.emit('user:offline', socket.userId);
    });
  });

  return io;
};

export default configureSocket;