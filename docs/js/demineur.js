//-----------------------------------------
//--------définitions des niveaux----------
//-----------------------------------------
let beginnerLevel = {
    cols: 9,
    rows: 9,
    bombAmount: 10,
    id: "beginner"
};

let intermediateLevel = {
    cols: 19,
    rows: 19,
    bombAmount: 40,
    id: "intermediate"
};

let expertLevel = {
    cols: 30,
    rows: 16,
    bombAmount: 99,
    id: "expert"
};

//-----------------------------------------
//----------niveau par défaut--------------
//-----------------------------------------
let level = beginnerLevel;

//-----------------------------------------
//gestion du choix de niveau via les boutons
//-----------------------------------------
let buttons = document.getElementById('level-select').children; //on récupère les boutons
for(button of buttons) {  //pour chaque bouton
    button.addEventListener('click', function(e){ //on attend le clic
        e.preventDefault; //on annule le comportement par défaut sur le lien
        stopTimer(); //on arrête le chrono s'il tournait
        choixLevel = this.id; //on récupère l'id du bouton

        let parent = this.parentElement;
        let enfants = parent.children;

       switch(choixLevel){ //en fonction du bouton
            case "beginner" :
                for(let i=0;i<enfants.length; i++){ //on supprime la classe active partout
                    enfants[i].classList.remove('active');
                }
                this.classList.add('active'); //on ajoute la classe active sur le bouton cliqué
                start(beginnerLevel); // on démarre le niveau sélection
                break;
            case "intermediate" :
                for(let i=0;i<enfants.length; i++){
                    enfants[i].classList.remove('active');
                }
                this.classList.add('active');
                start(intermediateLevel);
                break;
            case "expert" :
                for(let i=0;i<enfants.length; i++){
                    enfants[i].classList.remove('active');
                }
                this.classList.add('active');
                start(expertLevel);
                break;
            default:
                start(beginnerLevel);
       }
    });
}

//-----------------------------------------
//-------déclaration des variables---------
//-----------------------------------------
let cols = level.cols; //colonnes
let rows = level.rows; //lignes
let bombAmount = level.bombAmount; //nombre de bombes - sera modifié
let bombAmountInit = level.bombAmount; //nombre de bombes - pour la réinitialisation
let mineCount = 0; //nombre de mines voisines
let remaining = cols*rows; //nombre de cases non révélées restantes
let grid = createBoard(cols, rows); //création du tableau 
var chrono;
let time = 0;
let status = 1;

const board = document.getElementById('board'); //plateau de jeu
const smiley = document.getElementById('start'); //bouton siley
const mineCounter = document.getElementById('mine-counter'); //compteur de mines restantes
const timer = document.getElementById('timer'); //chrono

//-----------------------------------------
//-------Création d'un tableau 2D----------
//-----------------------------------------
function createBoard(cols, rows) {
    var arr = new Array(rows);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(cols);
    }
    return arr;
}

//-----------------------------------------
//--------initialisation du jeu------------
//-----------------------------------------
function init(level){
    status = 1;
    document.getElementById('result').textContent = "";
    timer.textContent = 0;
    cols = level.cols;
    rows = level.rows;
    bombAmount = level.bombAmount;
    bombAmountInit = level.bombAmount;
    remaining = cols*rows;
    smiley.style.backgroundImage = "url('img/smiley.png')";
    document.getElementById('mine-counter').textContent = bombAmount;

    grid = createBoard(cols, rows); //on créé le tableau

    //on remplit le tableau avec les cases
    for (let i=0; i<rows; i++){
        for (let j=0; j< cols; j++){
            grid[i][j] = new Cell(i,j);
        }
    }

    //création d'un tableau avec tous les emplacements de bombes possibles
    let bombOptions = [];
    for(let i=0; i<rows; i++){
        for(let j=0; j<cols;j++){
            bombOptions.push([i,j]);
        }
    }

    //pour chaque bombe à placer on assigne aléatoirement une option de bombe
    for(let b = 0; b < bombAmount; b++){
        let randomOption = Math.floor(Math.random()*bombOptions.length);
        let i = bombOptions[randomOption][0];
        let j = bombOptions[randomOption][1];

        //supprime cette option des emplacements possibles
        bombOptions.splice(randomOption, 1);

        grid[i][j].bombed = true;
    }

    //calcul du nombre de voisin de chaque case
    for (let i=0; i<rows; i++){
        for (let j=0; j< cols; j++){
            grid[i][j].countNeighbor();
        }
    }
    drawBoard(); //on injecte tout dans le html
    playGame(); //on surveille les clics 
}

//--------------------------------------------------------------
//----------réinitialisation au clic sur le smiley--------------
//--------------------------------------------------------------
function restart() {
    stopTimer(); //on arrete le chrono

    //en fonction du niveau en cours on le relance
    level = document.getElementsByClassName('active')[0].id; 
    if(level == "beginner") {
        start(beginnerLevel);
    } else if(level == "intermediate") {
        start(intermediateLevel);
    } else {
        start(expertLevel);
    }
}

//---------------------------------------
//----------début du niveau--------------
//---------------------------------------
function start(level) {
    deleteBoard(); //on supprime la partie en cours
    init(level); //on reinitialise le jeu
}

//-------------------------------------------------------
//----------création des cases pour le html--------------
//-------------------------------------------------------
function drawBoard() {
    board.style.width = cols * 20 + 'px';
    board.style.height = rows *20 + 'px';
    let frag = document.createDocumentFragment();
    for (let i=0; i<rows; i++){
        for (let j=0; j< cols; j++){
            let newDiv = document.createElement('div');
            newDiv.classList.add('case');
            let id = i + '_' + j;
            newDiv.setAttribute('id', id );
            frag.appendChild(newDiv);
        }
    }
    board.appendChild(frag);    
}

//-------------------------------------------------------------
//----------pour chaque case on surveille le clic--------------
//-------------------------------------------------------------
function playGame(){
    for (let i=0; i<rows; i++){
        for (let j=0; j< cols; j++){
            grid[i][j].click();
        }
    }
}

//-----------------------------------------------------
//----------suppression du tableau (html)--------------
//-----------------------------------------------------
function deleteBoard() {
    if(document.getElementById('board').children) {
        for (let i=0; i<rows; i++){
            for (let j=0; j< cols; j++){
                let id = i + '_' + j;
                let el = document.getElementById(id);
                board.removeChild(el);
            }
        }
    }
    
}

//------------------------------------------
//----------création d'un case--------------
//------------------------------------------
function Cell(row, col) {
    this.row = row;  //position Y 
    this.col = col;  //position X
    this.id = this.row + '_' + this.col; //création d'un id y_x 
    this.bombed = false; //si miné
    this.neighbor = ""; //nombre de voisins
    this.revealed = false; //si révélée
}

//--------------------------------------------------------
//----------récupération du nombre de voisins-------------
//--------------------------------------------------------
Cell.prototype.countNeighbor = function() {
    let mineCount = 0;
    for(let i = this.row-1; i <= this.row+1; i++){
        for(let j = this.col-1; j <= this.col+1; j++){
            if(i >= 0 && i <= rows-1 && j >= 0 && j <= cols-1){
                if(grid[i][j].bombed){
                    mineCount++;
                } 
            }
        }
    }
    this.neighbor = mineCount;
    return mineCount;
}

//------------------------------------------------------
//----------révélation clic droit + gauche--------------
//------------------------------------------------------
Cell.prototype.bigReveal = function() {
    if(this.countFlags() === this.neighbor) { //si nombre drapeaux voisins = nombre de mines voisines
        this.revealNeighbor(); //on révèle tout 
    } 
}

//-----------------------------------------------------
//----------comptage des drapeaux voisins--------------
//-----------------------------------------------------
Cell.prototype.countFlags = function() {
    let flagCount = 0;
    for(let i = this.row-1; i <= this.row+1; i++){
        for(let j = this.col-1; j <= this.col+1; j++){
            if(i >= 0 && i <= rows-1 && j >= 0 && j <= cols-1){
                let id = i + '_' + j;
                if(document.getElementById(id).classList.contains('flag')){
                    flagCount++;
                }
            }
        }
    }
    return flagCount;
}

//--------------------------------------------
//----------révélation des cases--------------
//--------------------------------------------
Cell.prototype.reveal = function(){
    this.revealed = true; //on révèle la case
    remaining--; //on enleve une case restante à dévoiler
    document.getElementById(this.id).classList.add('clicked'); //ajout de la classe clicked pour affichage html

    // on indique le nombre de mines autour (sauf 0)
    if(this.neighbor !== 0){
        document.getElementById(this.id).textContent = this.neighbor;
        let classCss = "neighbor" + this.neighbor;
        document.getElementById(this.id).classList.add(classCss);
    } 

    //si case vide (=0)
    if(this.neighbor == 0){
        this.revealNeighbor(); //on revele les voisins 
    }
}

//----------------------------------------------
//----------révélation des voisins--------------
//----------------------------------------------
Cell.prototype.revealNeighbor = function () {
    //pour chaque voisin
    for(let i = this.row-1; i <= this.row+1; i++){
        for(let j = this.col-1; j <= this.col+1; j++){
            if(i >= 0 && i <= rows-1 && j >= 0 && j <= cols-1){
                //s'il n'a pas de bombe et n'est pas révélé
                if(!grid[i][j].bombed && !grid[i][j].revealed){
                    this.revealed = true; //on le revele
                    grid[i][j].reveal(); //puis on vérifie ses voisins
                } 
                //s'il est miné mais pas flagué
                if(grid[i][j].bombed && !document.getElementById(grid[i][j].id).classList.contains('flag')) {
                    document.getElementById(grid[i][j].id).classList.add('mine');
                    console.log('err');
                    this.endGame(false);
                }
                //s'il est flagué mais pas miné
                if(!grid[i][j].bombed && document.getElementById(grid[i][j].id).classList.contains('flag')) {
                    document.getElementById(grid[i][j].id).classList.add('flag-error');
                    document.getElementById(grid[i][j].id).textContent = "";
                    this.revealAllBombs();
                    stopTimer();
                    console.log('err2');
                    this.endGame(false);
                }
            }
        }
    }
    if(remaining === bombAmountInit && status !== 0){
        this.endGame(true);
    }
}

//----------------------------------------------
//----------révélation des bombes---------------
//----------------------------------------------
Cell.prototype.revealAllBombs = function () {
    smiley.style.backgroundImage = "url('img/smiley-dead.png')";
    for (let i=0; i<rows; i++){
        for (let j=0; j< cols; j++){
            if(grid[i][j].bombed){
                let id = i + '_' + j;
                document.getElementById(grid[i][j].id).classList.add('answer');
            }
        }
    }
}

//------------------------------------------
//----------gestion des clics---------------
//------------------------------------------
Cell.prototype.click = function() {
    let clicked = document.getElementById(this.id); //on récupère l'id de la case cliquée

    // on initialise les boutons pour préparer le clic siumultané
    let leftButtonDown = false;
    let rightButtonDown = false;
    
    //gestion du click droit
    clicked.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if(clicked.classList.contains('flag') && status !== 0){  //si déjà un drapeau
            clicked.classList.remove('flag'); //on enleve le drapeau
            bombAmount++; //on remet la mine dans le compteur de mines
            mineCounter.textContent = bombAmount; //on met à jour le compteur de mines
        } else if(!clicked.classList.contains('flag') && status !== 0) { //si pas de drapeau & partie en cours
            if(!this.revealed){ //si la case n'est pas déjà révélée
                clicked.classList.add('flag'); //on ajoute le drapeau
                bombAmount--; //on supprime une mine du compteur de mines
                mineCounter.textContent = bombAmount; //on met à jour le compteur de mines
            }
        }
    });

    //gestion du click gauche
    clicked.addEventListener('click', () => {
        if(remaining == cols*rows){
            startTimer();
        }
        if(!clicked.classList.contains('flag')){ //si pas de drapeau
            if(this.bombed){ //si bombe
                document.getElementById(this.id).classList.add('mine'); //on affiche la mine explosée
                smiley.style.backgroundImage = "url('img/smiley-dead.png')"; //on affiche le smiley mort
                this.endGame(false); //on termine la partie(défaite)
            } else { //si pas de bombe
                if(remaining !== bombAmountInit && !this.revealed) { //si cases restantes !== nombre total de mines et si la case n'est pas déjà révélée
                    document.getElementById(this.id).classList.add('clicked'); //on ajoute le style cliqué
                    this.reveal(); //on révèle la case
                }
            }
        }
        if(remaining == bombAmountInit  && status !== 0){
            this.endGame(true);
        }
    });

    //gestion mouse down & up
    clicked.addEventListener('mousedown', (e) => {
        if(!this.revealed && status !== 0) {
            smiley.style.backgroundImage = "url('img/smiley-o.png')";
        }
        //
        if(e.button === 0 && status !== 0) { //left click
            leftButtonDown = true;
        }
        if(e.button === 2 && status !== 0) { //right click
            rightButtonDown = true;
        }
        if (leftButtonDown && rightButtonDown && status !== 0) {
            this.bigReveal();
        }
    });

    clicked.addEventListener('mouseup', (e) => {
        if(!this.revealed && status !== 0) {
            smiley.style.backgroundImage = "url('img/smiley.png')";
        }
        if(e.button === 0 && status !== 0) { //left click
            leftButtonDown = false;
        }
        if(e.button === 2 && status !== 0) { //right click
            rightButtonDown = false;
        }
    });
}    

//------------------------------
//-------Fin de partie----------
//------------------------------
Cell.prototype.endGame = function(win) {
    status = 0; //changement du status pour arreter le jeu
    if(win) { //si victoire
        stopTimer(); 
        //stop du chrono et affichage du résultat
        let resultat = "Félicitations, votre temps est de " + convertTime(time);
        document.getElementById('result').textContent = resultat;
        smiley.style.backgroundImage = "url('img/smiley-win.png')";

        for (let i=0; i<rows; i++){
            for (let j=0; j< cols; j++){
                //pour chaque case restante non révélée
                if(!grid[i][j].revealed){
                    let id = i + '_' + j;
                    //on affiche le drapeau
                    document.getElementById(id).classList.add('flag');
                }
            }
        }
    } else if (!win) { //si défaite
        stopTimer();
        for (let i=0; i<rows; i++){
            for (let j=0; j< cols; j++){
                //on revele tout
                this.revealed = true; 
                let id = i + '_' + j;
                if(!grid[i][j].bombed) {
                    if(document.getElementById(id).classList.contains('flag')){
                        document.getElementById(id).classList.add('flag-error');
                    } else {
                        document.getElementById(id).classList.add('clicked');
                        let classCss = "neighbor" + grid[i][j].neighbor;
                        document.getElementById(id).classList.add(classCss);
                        if(grid[i][j].neighbor !== 0){
                            document.getElementById(id).textContent = grid[i][j].neighbor;
                        }
                    }
                } else {
                    if(!document.getElementById(id).classList.contains('flag')){
                        document.getElementById(id).classList.add('mine');
                    }
                }
            }
            
        }
    }
}

//--------------------------------
//-------Début du chrono----------
//--------------------------------
function startTimer(){
    time = 0;
    chrono = setInterval(() => {
        time++;
        timer.textContent = time;
    }, 1000);
}

//--------------------------------
//-------Arrêt du chrono----------
//--------------------------------
function stopTimer(){
    clearInterval(chrono);
}

//--------------------------------------------
//-------Conversion sec en min + sec----------
//--------------------------------------------
function convertTime(tempsMesure){
        let minutes = Math.floor(tempsMesure / 60);
        let secondes = tempsMesure % 60;
        let min = "minutes";
        let sec = "secondes";
        let temps;
        if(minutes === 0){
            temps = secondes + ' ' + sec;
            return temps;
        }
        if(secondes === 1) {
            sec = "seconde";
        }
        if(minutes === 1 ) {
            min = "minute";
        }
        if(secondes === 0) {
            temps = minutes + ' ' + min;
            return temps;
        }
        
        temps = minutes + ' ' + min + ' et ' + secondes + ' ' + sec;
        return temps;
}


