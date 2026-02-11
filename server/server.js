require("dotenv").config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const GroupMessage = require('./models/GroupMessage');
const PrivateMessage = require('./models/PrivateMessage');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

const onlineUsers = {}; 
const ROOMS = ['devops', 'cloud computing', 'covid19', 'sports', 'nodeJS'];

io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.on('register_user', ({ username }) => {
    socket.username = username;
    onlineUsers[username] = socket.id;

    // send updated online list to everyone
    io.emit('online_users', Object.keys(onlineUsers));
  });
  
  socket.on('join_room', ({ room, username }) => {
    socket.join(room);
    socket.currentRoom = room;
    socket.username = username;
  });

  socket.on('leave_room', () => {
    if (socket.currentRoom) {
      //  tell others in the room that this user stopped typing
      socket.to(socket.currentRoom).emit('typing_indicator', {
        username: socket.username,
        isTyping: false,
      });

      socket.leave(socket.currentRoom);
      socket.currentRoom = null;
    }
  });

  socket.on('send_group_message', async ({ room, from_user, message }) => {
    const msg = new GroupMessage({ room, from_user, message });
    await msg.save();
    io.to(room).emit('receive_group_message', msg);
  });

  socket.on('send_private_message', async ({ from_user, to_user, message }) => {
    const msg = new PrivateMessage({ from_user, to_user, message });
    await msg.save();

    // send back to sender (so they see it in their UI)
    socket.emit('receive_private_message', msg);

    // send to receiver if online
    const toSocketId = onlineUsers[to_user];
    if (toSocketId) {
      io.to(toSocketId).emit('receive_private_message', msg);
    }
  });


  socket.on('typing', ({ room, username, isTyping }) => {
    socket.to(room).emit('typing_indicator', { username, isTyping });
  });

  socket.on("logout_user", ({ username }) => {
    if (username && onlineUsers[username]) {
      delete onlineUsers[username];
      io.emit("online_users", Object.keys(onlineUsers));
    }
    // Optional: also clear on the socket object
    if (socket.username === username) {
      socket.username = null;
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);

    if (socket.username) {
      delete onlineUsers[socket.username];
      io.emit('online_users', Object.keys(onlineUsers));
    }

    if (socket.currentRoom) {
      socket.to(socket.currentRoom).emit('typing_indicator', {
        username: socket.username,
        isTyping: false,
      });
    }
  });

});

// Connect to Mongo & start server ONLY after successful connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
