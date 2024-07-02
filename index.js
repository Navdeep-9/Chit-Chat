import http from 'http';

import express from 'express';
import {Server} from 'socket.io'

import {formatMessage} from './middelwares/message.js';
import { userJoin, getCurrentUser, userleave,
    getRoomUsers } from './middelwares/user.js';

const app = express();
app.use(express.static('public'))
const port = 4567
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app)

const io = new Server(server);


io.on('connection', function (socket) {

    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        console.log('user-connected');

        socket.emit('message', formatMessage(`${user.username}`, `${user.username} !! Welcome To Chit-Chat`))

        //broadcast
        socket.broadcast.to(user.room).emit('message', formatMessage(`${user.username}`, `${user.username} has connected`))



        //send users and rooms info

        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        })

        //show messages
        socket.on('chatMessage', function (data) {
            io.to(user.room).emit('message', formatMessage(user.username, data))
        })
        //disconnect
        socket.on('disconnect', function () {
            const user = userleave(socket.id)

            if (user) {
                io.to(user.room).emit('message', formatMessage(user.username, `${user.username} left the chat`))
            }
            
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        })
        })
    })
})

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/chatroom', (req, res) => {
    res.render('chat')
})

server.listen(port, () => {
    console.log(`server is ready at http://localhost:${port}`);
})



