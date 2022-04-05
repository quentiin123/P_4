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


app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Puissance 4 Chat';

// On démarre le chat dès qu'un client se connecte
io.on('connection', socket => {



  socket.on('joinRoom', ({ username, room }) => {  //évt joinRoom, qui va donc donner les info de la room pour un joueur

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);
    


    // Message de Bienvenue 
    socket.emit('message', formatMessage(botName, 'Bienvenue sur Puissance 4'));

    // Message quand un utilisateur se connecte 
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} a rejoint la partie`)
      );

    // On envoie les infos de la room et du user 
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)




    });

  });

  // On récupère les messages côté serveur 
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Evennement de déconnexion d'un utilisateur
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} a quitté la partie`)
      );    

      // Envoie des infos update de la room 
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    socket.to(user.room).emit("reset");
    }
  });


//On va gérer le jeu à partir d'en dessous:

socket.on('playerData',(player)=>{

  console.log(player.username);
});

socket.on("reset",()=>{

  const user = getCurrentUser(socket.id);
    //console.log("colonne: "+colonne+" ligne: "+ligne);
  
    socket.to(user.room).emit("reset");

})
socket.on('Coup ennemi Joué',({colonne, ligne,room})=>{

    const user = getCurrentUser(socket.id);
    //console.log("colonne: "+colonne+" ligne: "+ligne);
  
    socket.to(user.room).emit('Coup ennemi Reçu',{colonne: colonne,ligne : ligne}); //on utilise socket.to.emit pour que l'autre joueur uniquement reçoive l'évt;
});

});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => console.log(`Le serveur est sur le port : ${PORT}`));
