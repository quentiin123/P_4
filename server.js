const path = require('path');
const http = require('http');
const express = require('express');








const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Puissance 4 Chat';

// Run when client connects
io.on('connection', socket => {



  socket.on('joinRoom', ({ username, room }) => {  //évt joinRoom, qui va donc donner les info de la room pour un joueur

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);
    


    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Bienvenue sur Puissance 4'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} a rejoint la partie`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)




    });

  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} a quitté la partie`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });


//On va gérer le jeu à partir d'en dessous:

socket.on('playerData',(player)=>{

  console.log(player.username);
});




});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => console.log(`Le serveur est sur le port : ${PORT}`));
