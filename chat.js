const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

let connectedUser = []

io.on('connection', (socket) => {
    const username = socket.handshake.query.token || null;
    console.log(username + ' connected');
    connectedUser.push(username)
    io.emit('userConnect', {username: username, onlineUser: connectedUser})

    socket.on('chatMessage', (msg) => {
        socket.on('whisperName', (whisperName) => {
            io.emit('chatMessage', {username: username, receiver: whisperName, text: msg});
        });
        socket.on('broadcast', (username) => {
            io.emit('chatMessage', {username: username, text: msg});
        });

        console.log('message: ' + msg);
    });

    socket.on('userTyping', (username) => {
        io.emit('userTyping', {username: username});
    })

    socket.on('disconnect', () => {
        console.log(username + ' disconnected');
        const index = connectedUser.indexOf(username);
        if (index !== -1) {
            connectedUser.splice(index, 1);
            io.emit('userDisconnect', {username: username})

        }
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});