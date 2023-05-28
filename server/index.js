const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messagesRoutes');
const socket = require('socket.io')

const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use('/api/auth', userRoutes);
app.use('/api/messages', messageRoutes);


mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDb connected..")
}).catch((err) => {
    console.log(`Error: ${err.message}`)
});

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
})

const io = socket(server, {
    cors: {
        origin: ["http://localhost:3000","https://ramble-6crf.onrender.com"],
        credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.message);
        }
    })
})