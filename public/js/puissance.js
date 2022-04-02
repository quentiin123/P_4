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
  }
  


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
        td.dataset.la_colonne = j;
      }
    }
    this.element.innerHTML = '';
    this.element.appendChild(table);
  }
  
  set(li, la_colonne, player) {
    // On colore la case en fonction du tour actuel
    this.plateau[li][la_colonne] = player;
    // On incrémente le coup
    this.nb_coup++;
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
        this.reset();
        this.render();
      }
      return;
    }

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
      }
    }
  }

  /* 
   Cette fonction vérifie si le coup  est un coup gagnant.
   
   Elle renvoie true si gagné par le joueur, false sinon
 */
  win(li, la_colonne, player) {
    // Horizontal
    let count = 0;
    for (let j = 0; j < this.colonne; j++) {
      count = (this.plateau[li][j] == player) ? count+1 : 0;
      if (count >= 4) return true;
    }
    // Vertical
    count = 0;
    for (let i = 0; i < this.lignes; i++) {
      count = (this.plateau[i][la_colonne] == player) ? count+1 : 0;
      if (count >= 4) return true;
    }
    // Diagonal
    count = 0;
    let shift = li - la_colonne;
    for (let i = Math.max(shift, 0); i < Math.min(this.lignes, this.colonne + shift); i++) {
      count = (this.plateau[i][i - shift] == player) ? count+1 : 0;
      if (count >= 4) return true;
    }
    // Anti-diagonal
    count = 0;
    shift = li + la_colonne;
    for (let i = Math.max(shift - this.colonne + 1, 0); i < Math.min(this.lignes, shift + 1); i++) {
      console.log(i,shift-i,shift)
      count = (this.plateau[i][shift - i] == player) ? count+1 : 0;
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



var game = document.getElementById('jouer');    // On récupère l'élément sur lequel on veut détecter le clic
game.addEventListener('click', function(event) {        // On écoute l'événement click
event.preventDefault();  


// On initialise le plateau et on visualise dans le DOM
// (dans la balise d'identifiant `game`).
let p4 = new Puissance4('#game');




var newGame=document.createElement("button");                                               
game.style.display="none";
newGame.innerHTML ="<button type='submit' class='button' >Rejouer!</button>";
document.getElementById ('positionnement_rejouer').appendChild(newGame);



//Si un des joueurs veut recommencer la partie
newGame.addEventListener('click',function(eventbis){
p4.reset();
p4.render();
eventbis.stopPropagation();

    


})

}
)