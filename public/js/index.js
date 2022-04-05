const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


//création de l'objet player qui identifie un client (coté jeu, pas coté chat)

const player = {

    host:  false,

  roomId: "",
  username: "",
  socketId: "",
  playedCells: "",
  turn: "",
  color: "red",
  win: false


};



// On récupère le pseudo et la salle à partir de l'URL 
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

player.username =username;
 player.roomId =room ;









// sert à déclencher l'évt capté par io.on() coté serveur
const socket = io();


//on attribue les valeurs au player object



player.socketId=socket.id; //undefined ?
//pour savoir si hôte ou pas: récup la liste des joueurs dans la cellule, si vide t'es le hote-> attente d'évt pour le début du jeu (2joeuur)


console.log(player);




// Join chatroom
socket.emit('joinRoom', { username, room });




// On récupère les pseudo et salle 
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);



  const game_area=document.getElementById("game_area");
  if(users.length<2){
    game_area.style.display="none";
    window.alert("Veuillez attendre qu'un deuxième jouer arrive dans le salon")
    player.host=true;
  } 
  if(users.length===2){

    //console.log("on peut jouer dans la room numéro "+room);


    //on va lancer le jeu à partir de là:

    //on affiche le board
    game_area.style.display="";
    
    //idée: premier dans la salle-> hôte, si tu es le seul tu deviens l'hôte.
    /*l'hôte commence, il crée pour cela l'objet puissance 4
    l'idée c'est de lier tout le fichier puissance4 içi

    si tour==1, l'hôte joue

      
    */
  } 




});




// Message du serveur 
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});




chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // On récupère le texte du message 
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Envoie du message au serveur 
  socket.emit('chatMessage', msg);


  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Affichage du message sur le DOM 
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

// Ajout de la salle sur le DOM 
function outputRoomName(room) {
  roomName.innerText = room;
}

// Ajout des joueurs sur le DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prévient l'utilisateur de la sortie de la room 
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Voulez-vous quitter la salle de jeu?');
  if (leaveRoom) {


    window.location = '../index.html';
    player.roomId="";
    player.host=false;


  } else {
  }
});






//Ici va se trouver l'implémentation du jeu:

class Puissance4 {
  /*
   Crée un plateau de Jeu de dimension 6*7 (par défaut) 
   */
  constructor(elt_id, lignes=6, colonne=7) {
    // Nombre de lignes et de colonnes
    this.lignes = lignes;
    this.colonne = colonne;
    //On initialise le plateau
    // tableau 2D qui contient un entier
    //   0: case vide
    //   1: pion du joueur 1
    //   2: pion du joueur 2
    this.plateau = Array(this.lignes);
    for (let i = 0; i < this.lignes; i++) {
      this.plateau[i] = Array(this.colonne).fill(0);
    }
    // un entier: 1 ou 2 (le numéro du prochain joueur)
    this.tour = 1;
    // Nombre de coups joués
    this.nb_coup = 0;
    /* un entier indiquant le gagnant:
        null: la partie continue
           0: la partie est nulle
           1: joueur 1 a gagné
           2: joueur 2 a gagné
    */
    this.gagnant = null;

    // L'élément du DOM où se fait l'affichage
    this.element = document.querySelector(elt_id);
    // On ajoute le gestionnaire d'événements pour gérer le click
    //

    this.element.addEventListener('click', (event) => this.handle_click(event));
    // On fait l'affichage du plateau





    this.render();
  };
  




  /* Affiche le plateau de jeu dans le DOM */
  render() {
    let table = document.createElement('table');
    //Les indices pour le jeu vont de bas en haut 
    for (let i = this.lignes - 1; i >= 0; i--) {
      let tr = table.appendChild(document.createElement('tr'));
      for (let j = 0; j < this.colonne; j++) {
        let td = tr.appendChild(document.createElement('td'));



        let colour = this.plateau[i][j];
        if (colour)
          td.className = 'player' + colour;


        //ligne à changer
        td.dataset.la_colonne = j;


      }

    }
    this.element.innerHTML = '';
    this.element.appendChild(table);
  }
  
  set(li, la_colonne, playerColor) {
    
    // On incrémente le coup
    this.nb_coup++;
    // On colore la case en fonction du tour actuel
    this.plateau[li][la_colonne] = playerColor;
  }

  /* Cette fonction ajoute un pion dans une colonne */
  play(la_colonne) {
    // Trouver la première case libre dans la colonne
    let li;
    for (let i = 0; i < this.lignes; i++) {
      if (this.plateau[i][la_colonne] == 0) {
        li = i;
        break;
      }
    }
    if (li === undefined) {
      return null;
    } else {
      // Effectuer le coup
      this.set(li, la_colonne, this.tour);
      // Renvoyer la ligne où on a joué
      return li;
    }
  }
  
  handle_click(event) {
    // Vérifier si la partie est encore en cours, sinon on demande au joueur s'il veut rejouer
    if (this.gagnant !== null) {
      if (window.confirm("Game over!\n\nDo you want to restart?")) {
        socket.emit("reset");
        this.reset();
        this.render();
      }
      return;
    }



     if((player.host==true&&this.tour==1)||(player.host==false&&this.tour==2)){//si ct'est ton tour
    let la_colonne = event.target.dataset.la_colonne;
    if (la_colonne !== undefined) {
      //on convertit la variable contenue dans le dataset car c'est une chaine de caractère initialement
      la_colonne = parseInt(la_colonne);
      let li = this.play(parseInt(la_colonne));
      
      if (li === null) {
        window.alert("la colonne est pleine!");
      } else {
        // Vérifier s'il y a un gagnant, ou si la partie est finie
        if (this.win(li, la_colonne, this.tour)) {
          this.gagnant = this.tour;
        } else if (this.nb_coup >= this.lignes * this.columns) {
          this.gagnant = 0;
        }

        // Passer le tour : 3 - 2 = 1, 3 - 1 = 2
        this.tour = 3 - this.tour;

        // Mettre à jour l'affichage
        this.render()
        
        //Au cours de l'affichage, pensez eventuellement, à afficher un 
        //message si la partie est finie...
        switch (this.gagnant) {
          case 0: 
            window.alert("Match nul!!"); 
            break;
          case 1:
            window.alert("Player 1 Gagne"); 
            break;
          case 2:
            window.alert("Player 2 Gagne"); 
            break;
        }
      };
    //On va envoyer l'information du chgt de tour au serveur plus la case joué:
    socket.emit('Coup ennemi Joué',  {colonne: la_colonne,ligne: li,room: player.roomId});
      console.log("la colonne envoyé est: "+la_colonne);
      console.log("la ligne envoyé est: "+li);

    }




    }
     else{

    window.alert("Ce n'est pas votre tour! Veuillez attendre");
    }

  }
  /* 
   Cette fonction vérifie si le coup  est un coup gagnant.
   
   Elle renvoie true si gagné par le joueur, false sinon
 */
  win(li, la_colonne, playerColor) {
    // Horizontal
    let count = 0;
    for (let j = 0; j < this.colonne; j++) {
      count = (this.plateau[li][j] == playerColor) ? count+1 : 0;
      if (count >= 4) return true;
    }
    // Vertical
    count = 0;
    for (let i = 0; i < this.lignes; i++) {
      count = (this.plateau[i][la_colonne] == playerColor) ? count+1 : 0;
      if (count >= 4) return true;
    }
    // Diagonal
    count = 0;
    let shift = li - la_colonne;
    for (let i = Math.max(shift, 0); i < Math.min(this.lignes, this.colonne + shift); i++) {
      count = (this.plateau[i][i - shift] == playerColor) ? count+1 : 0;
      if (count >= 4) return true;
    }
    // Anti-diagonal
    count = 0;
    shift = li + la_colonne;
    for (let i = Math.max(shift - this.colonne + 1, 0); i < Math.min(this.lignes, shift + 1); i++) {
      
      count = (this.plateau[i][shift - i] == playerColor) ? count+1 : 0;
      if (count >= 4) return true;
    }
    
    return false;
  }

  // Cette fonction vide le plateau et remet à zéro l'état
  reset() {
    for (let i = 0; i < this.lignes; i++) {
      for (let j = 0; j < this.colonne; j++) {
        this.plateau[i][j] = 0;
      }
    }
    this.nb_coup = 0;
    this.gagnant = null;

    
  }
}

/*

var game = document.getElementById('jouer');    // On récupère l'élément sur lequel on veut détecter le clic
game.addEventListener('click', function(event) {        // On écoute l'événement click
event.preventDefault();  
*/

// On initialise le plateau et on visualise dans le DOM
// (dans la balise d'identifiant `game`).



//if player.host=true then

let p4 = new Puissance4('#game_area');


//on recoit les coordonnée du dernier coup ennemi joué, tour++, 
    socket.on('Coup ennemi Reçu',({colonne, ligne})=>{

      //console.log("on a reçu le coup ennemi");

     // console.log("la colonne recu par l'ennemi est: "+colonne);
     // console.log("la ligne recu par l'ennemi est: "+ligne);
      p4.set(ligne,colonne,p4.tour);
      if (p4.win(ligne, colonne, p4.tour)) {
          p4.gagnant = p4.tour;
        } else if (p4.nb_coup >= p4.lignes * p4.columns) {
          p4.gagnant = 0;
        }//sinon gagnant est undefined donc la partie continue


      p4.tour=3-p4.tour;

      // Mettre à jour l'affichage
        p4.render()
        
        //Au cours de l'affichage, pensez eventuellement, à afficher un 
        //message si la partie est finie...
        switch (p4.gagnant) {
          case 0: 
            window.alert("Match nul!!"); 
            break;
          case 1:
            window.alert("Player 1 Gagne"); 
            break;
          case 2:
            window.alert("Player 2 Gagne"); 
            break;
        }
      
      

    });

    socket.on("reset", ()=>{

      p4.reset();
      p4.render();

    })
