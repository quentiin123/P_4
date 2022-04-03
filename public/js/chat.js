const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});



//on va insérer ici le code pour gérer les parties
//création de l'objet player qui identifie un client

const player = {

    /*host:  false*/

    //roomId: "",
  username: "",
  socketId: "",
  playedCells: "",
  turn: "",
  color: "red",
  win: false


};







// sert à déclencher l'évt capté par io.on() coté serveur
const socket = io();


//on attribue les valeurs au player object


player.username=username;
//player.roomId=room;
player.socketId=socket.id; //undefined ?
//pour savoir si hôte ou pas: récup la liste des joueurs dans la cellule, si vide t'es le hote-> attente d'évt pour le début du jeu (2joeuur)


console.log(player);




// Join chatroom
socket.emit('joinRoom', { username, room });




// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);



  const game_area=document.getElementById("game_area");
  if(users.length<2){
    game_area.style.display="none";
    window.alert("Veuillez attendre qu'un deuxième jouer arrive dans le salon")
  } 
  if(users.length===2){

    //console.log("on peut jouer dans la room numéro "+room);


    //on va lancer le jeu à partir de là:

    
    game_area.style.display="";
    console.log(game_area);

  }




});




// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});



// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {


    window.location = '../index.html';
    player.roomId="";


  } else {
  }
});
