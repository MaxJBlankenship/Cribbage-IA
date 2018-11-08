var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();
var server = app.listen(3000);

var io = require('socket.io').listen(server);

var users = [];
var inqueue = [];
var rooms = [];
var roomcount = 0;
var games = [];
class Cribbage {
    constructor(p1, p2, cDeck) {
        this.p1 = p1;
        this.p2 = p2;
        this.cDeck = cDeck;
        this.crib = [];
        this.pCards = [];
        this.crib1 = 0;
        this.crib2 = 0;
        this.isCrib = 0; //iscrib 0 means player1 is dealer, iscrib 1 player2 is dealer
        //this.isTurn = 0;
        this.newindex = 0;
        this.dCards = [];
        this.thirtyone = false;
        this.reTurn = 1; //boolean such that the var type will be binary
    }

    //ORDER OF FUNCTIONS:
    //1. Initialize a new Cribbage() w parameters
    //2. crib.genereateFirtTurn
    //3. when card is clicked, call function playcard() w pname and card returning true and false works
    //4. when return true, call getscore, get this from server
    //5. at the beginning of every turn, check for go then process likewise
    //6s 6d 7s 8s | 3s
    //scores 15
    handSort(arr) {
        //this is literally jsut bubblesort lol
        for (var i = arr.length - 1; i >= 0; i--) {
            for (var j = 1; j <= i; j++) {
                if (arr[j - 1] > arr[j]) {
                    var temp = arr[j - 1];
                    arr[j - 1] = arr[j];
                    arr[j] = temp;
                }
            }
        }
        return arr;
    }
    addScore(score, pName) {
        if (pName == this.p1.getName()) {
            this.p1.score += score;
        } else if (pName == this.p2.getName()) {
            this.p2.score += score;
        }
    }
    generateFirstTurn(prenum) {
        if (prenum != null) {
            if (prenum % 2 == 0) {
                this.reTurn = 1;
            } else {
                this.return = 2;
            }
        } else {
            this.reTurn += Math.round(Math.random()); //number is incremented by 0 or 1, randomizing it, basically
        }
        if (this.reTurn % 2 == 0) {
            this.isCrib = 1;
            //player 2 can only play on even turns
        } else {
            this.isCrib = 2;
            //player 1 can only play on odd turns
        }
        this.turnUp = this.cDeck.getRandomCard(1)[0]; //turn up card is generated here too
        console.log("TURNUPCARD GENERATED!!! : " + this.turnUp.oid);
        console.log("test for version control...");
    }
    nextTurn() {
        this.reTurn += 1;
    }
    getBoardSum() { //necessary to collect to check if 31 can be accomplished or nah

        var t1 = 0;
        for (var i = 0; i < this.pCards.length; i++) {
            t1 += this.pCards[i].getNum();
        }
        return t1;
    }
    killCards() { //necessary so it doesnt interfere with the rest of the algorithms called when empty or is up to 31
        this.dCards = this.pCards.slice(); //sets the contents of dCards as pCards without passing as reference
        this.pCards = []; //kills all pcards to be turned into darkened dcards
    }
    getDeadCards() {
        return this.dCards;
    }
    checkCardGo(card, pName) {
        console.log("checking for go initiated, checking: " + card.getNum() + " + " + this.getBoardSum());
        if (card.getNum() + this.getBoardSum() <= 31) {
            console.log("LESS THAN 31 DETECTED! its FINE!");
            return true;
        }
        console.log("MORE THAN 31 DETECTED! BAD BAD BAD!");
        return false;
    }
    checkHand(pName) { //USE THIS SHIT INSTEAD
        console.log("checkhand Called!!!!");
        if (pName == this.p1.getName()) {
            var hand = this.p2.getHand();
        } else {
            var hand = this.p1.getHand();
        }
        var t1 = this.getBoardSum();
        for (var i = 0; i < hand.length; i++) {
            if (t1 + hand[i].getNum() <= 31) {
                console.log("saul goodman");
                return true; //if any of the cards here can be used, stop checking!
            }
        }
        //must then call go
        console.log("lmao no cards left buddy");
        return false; //if all cards go over 31, can't play it
    }
    isTurn(pName) { //checks to see whose turn it is
        /// <summary> Pass 1 to check p1, Pass 2 to check p2. </summary>
        console.log("player: " + pName + "has attempted to play on turn: " + this.reTurn);
        if (this.reTurn % 2 == 0 && pName == this.p2.getName()) {
            console.log("and should be allowed!");
            return true;
        }
        if (this.reTurn % 2 == 1 && pName == this.p1.getName()) {
            console.log("and should be allowed!");
            return true;
        }
        console.log("and should not be allowed!");
        return false;
    }
    scoreRun(arr) { //checks for runs
        var score = 0;
        console.log("Arr is this case:: " + arr);
        var handSorted = [];
        /*
        for(var i = 0; i < arr.length; i++){
            handSorted.push(arr[i]);
        }*/
        handSorted = this.handSort(handSorted);
        for(var i = 0; i < handSorted.length; i++){
            if(handSorted[i].getNum() + 1 == handSorted[i + 1].getNum()  && handSorted[i + 1]  != null){
                //score += 1;
                if(handSorted[i].getNum() + 2  == handSorted[i + 2].getNum() && handSorted[i + 2]  != null){
                    score += 3;
                    if(handSorted[i].getNum() + 3 == handSorted[i + 3].getNum() && handSorted[i + 3]  != null){
                        score += 1;
                        if(handSorted[i].getNum() + 4 == handSorted[i + 4].getNum() && handSorted[i + 4]  != null){
                            score += 1;
                            i += 4;
                        } else {
                            i += 3;
                        }
                    } else {
                        i += 2
                    }
                } else {
                    i += 1;
                }
            }
        }
        return score;
    }
    isEmpty() {
        if (this.p1.getHand().length == 0 & this.p2.getHand().length == 0) {
            return true;
        }
        return false;
    }
    checkLegalCard(card, pName) {
        if (this.isTurn(pName)) {
            if (this.checkCardGo(card,pName)) {
                return true; // this still means its totally fine
            }
        }
        return false;
    }
    callGo(pName) { //this function means the other person has to call go, giving the passed person 1 point
        console.log("Call for go!!");
        if (pName == this.p1.getName()) {
            this.addScore(1, this.p1.getName());
        } else {
            this.addScore(1, this.p2.getName());
        }
    }
    getCardFromPlayer(cardIndex, pName) {
        console.log("crib card index : " + cardIndex);
        console.log("");
        if (pName == this.p1.getName()) {
            var pHand = this.p1.getHand();
            return pHand[cardIndex];
        } else {
            var pHand = this.p2.getHand();
            return pHand[cardIndex];
        }
    }
    handCheckForGo(pName) {
        //check through both players, see if each card
        if (pName == this.p1.getName()) {
            var handSorted = this.handSort(this.p2.getHand());
            for (var i = 0; i < this.p2.getHand().length; i++) {
                if (!this.checkCardGo(handSorted[i])) {
                    return false;
                }
            }
        } else if (pName == this.p2.getName()) {
            var handSorted = this.handSort(this.p1.getHand());
            for (var i = 0; i < this.p1.getHand().length; i++) {
                if (!this.checkCardGo(handSorted[i])) {
                    return false;
                }
            }
        }
        return true;
    }
    cardHasBeenPlayed(card, pName) {
        if (pName == this.p1.getName()) {
            this.p1.removeFromHand(card.oid);
        } else if (pName == this.p2.getName()) {
            this.p2.removeFromHand(card.oid);
        }
    }
    playCard(card, pName) { //this scores the card and adds it to pCards, called by server.
        console.log("PLAYCARD CALLED! player: " + pName + " attempted to play: " + card.oid);
        //console.log("crib length: " + this.crib.length);
        //console.log("check legal card: " + this.checkLegalCard(card,pName));
        if (this.crib.length < 4) {
            if (this.crib1 < 2 && pName == this.p1.getName()) {
                this.crib.push(card);
                this.crib1++;
                console.log("Card successfully added to crib!");
                this.cardHasBeenPlayed(card, pName);
                return true;
            } else if (this.crib2 < 2 && pName == this.p2.getName()) {
                this.crib.push(card);
                this.crib2++;
                console.log("Card successfully added to crib!");
                this.cardHasBeenPlayed(card, pName);
                return true;
            }
        }
        if (this.checkLegalCard(card, pName)) { //before pushing score board with card.
            this.addScore(this.scorePlay(card), pName);
            this.pCards.push(card);
            this.cardHasBeenPlayed(card, pName);
            console.log("now that card has been added, board sum is:" + this.getBoardSum());
            if (this.getBoardSum() == 31){
                console.log("wow player needed that exact card!! GO CALLED!!");
                this.callGo(pName);
                this.killCards();
                //this.nextTurn();
            }
            this.nextTurn(); //next turn is called twice if go is called.
            console.log("Card successfully played!! Turn is: " + this.reTurn);
            console.log("player 1 hand is now: " + this.p1.getHand());
            console.log("player 2 hand is now: " + this.p2.getHand());
            //this.addScore(this.scorePlay(card), pName);
            if(this.otherPlayerCantGo(pName)){
                this.callGo(pName);
                this.killCards();
                //this.nextTurn();
            }
            return true;
        }
        return false;
    }
    otherPlayerCantGo(pName){
        console.log("comparing pName: " + pName + " with p1: " + this.p1.name);
        if(this.p1.name == pName){
            //check player2's hand.
            var handforCheck = this.p2.getHand().slice();
            console.log("comparing LENGTH,  handforcheck: " + handforCheck.length + " with hand: " + this.p2.getHand().length);
            for(var i = 0; i < this.p2.getHand().length; i++){
                if(this.getBoardSum() + handforCheck[i].getNum() <= 31){
                    return false;
                }
            }
            return true;
        } else {
            var handforCheck = this.p1.getHand().slice();
            console.log("comparing LENGTH,  handforcheck: " + handforCheck.length + " with hand: " + this.p1.getHand().length);
            for(var i = 0; i < this.p1.getHand().length; i++){
                if(this.getBoardSum() + handforCheck[i].getNum() <= 31){
                    return false;
                }
            }
            return true;
        }
    }
    scorePlay(card) {
        var score = 0;
        if(this.getBoardSum() > 0){
            if (this.getBoardSum() + card.getNum() == 31) {
                score += 1;
            }
            if (this.getBoardSum() + card.getNum() == 15) {
                score += 2;
            }
            var cardlist = this.pCards.push(card);
            score += this.scoreRun(cardlist);
            var cardsuite = this.pCards.pop();
            var prevcardsuite = this.pCards.pop();
            console.log("card suite : " + cardsuite.getNum() + " p cards top suite : " + prevcardsuite.getNum());
            if (cardsuite.getRealNum() == prevcardsuite.getRealNum()) {
                score += 2;
            }
            this.pCards.push(prevcardsuite);
        }
        return score;
    } 
    boardCheckPCards(){ //true means the round ended. use this to check if any of the players won yet.
        if(this.isTurn(this.p1.name) && this.p1.hand.length == 0){
            if(this.p2.hand > 0){
                this.p2.score++;
            }
            return true;
        } else if(this.isTurn(this.p2.name) && this.p2.hand.length == 0){
            if(this.p1.hand > 0){
                this.p1.score++;
            }
            return true;
        }
        return false;
    }
    scoreHand(hand, isCrib) {
        //isCrib, 1  : crib check
        //isCrib, 0  : hand check

        //RUN CHECK

        //FIFTEEN CHECK
        var handSorted = hand.push(this.turnUp);

        score += this.scoreRun(handSorted);
        //score += this.scoreRun(handSorted);
        var result = []; //full list of bitstrings
        var score = 0;
        result.length = 0;
        for (var t = 0; t < Math.pow(2, handSorted.length); t++) {
            var combo = []; //temp bitstring of bits
            for (var w = 0; w < handSorted.length; w++) {
                //shift bit and and it with 1
                if (((t >> w) & 1))
                    combo.push(1);
                else
                    combo.push(0);
            }
            //console.log(combo);
            result.push(combo);
            //console.log("combo: " + t + " added! :: " + combo);
        }
        //console.log("RESULT LENGTH!! : "+ result.length);
        for (var r = 0; r < result.length; r++) {
            console.log("tofif reset");
            var tofif = 0;
            var addtofif = 0;
            for (var v = 0; v < result[r].length; v++) {
                if (result[r][v] == 1) {
                    if (parseInt(handSorted[v].getNum()) > 10) {
                        addtofif = 10;
                    } else {
                        addtofif = parseInt(handSorted[v].getNum());
                    }
                    console.log("adding " + tofif + " with " + addtofif);
                    tofif += addtofif;
                    //console.log("result r: " + result[r] + " slot v:" +  handforscore[v].getNum());
                }
            }
            //console.log("fift check is " + this.tofif);
            if (tofif == 15) {
                tofif = 0;
                console.log("fifteen sum found!");
                score += 2;
            }
        }
        
        //PAIRS, TRIPLES AND QUADRUPLES CHECK
        var score = 0;
        for(var i = 0; i < handSorted.length; i++){
            if(handSorted[i]  == handSorted[i + 1].getRealNum()  && handSorted[i + 1].getRealNum()  != null){
                score += 2;
                if(handSorted[i]  == handSorted[i + 2].getRealNum() && handSorted[i + 2].getRealNum()  != null){
                    score += 4;
                    if(handSorted[i]  == handSorted[i + 3].getRealNum() && handSorted[i + 3].getRealNum()  != null){
                        score += 6;
                        i += 3;
                    } else {
                        i += 2
                    }
                } else {
                    i += 1;
                }
            }
        }
        console.log("score is: " + score);
        
        //UNIQUE RUNS CHECK

        for(var i = 0; i < handSorted.length; i++){
            if(handSorted[i].getRealNum() + 1 == handSorted[i + 1].getRealNum()  && handSorted[i + 1]  != null){
                //score += 1;
                if(handSorted[i].getRealNum() + 2  == handSorted[i + 2].getRealNum() && handSorted[i + 2]  != null){
                    score += 3;
                    if(handSorted[i].getRealNum() + 3 == handSorted[i + 3].getRealNum() && handSorted[i + 3]  != null){
                        score += 1;
                        if(handSorted[i].getRealNum() + 4 == handSorted[i + 4].getRealNum() && handSorted[i + 4]  != null){
                            score += 1;
                            i += 4;
                        } else {
                            i += 3;
                        }
                    } else {
                        i += 2
                    }
                } else {
                    i += 1;
                }
            }
        }
        console.log("score is: " + score);
        
        //FLUSH CHECK
        var flushhand = this.handSort(hand);
        var flushsuite = flushhand[0].getSuite();
        var flushpoints = 4;
        switch (isCrib) {
            case 1: //1 means crib check which indicates that a flush of all cards is required for a flush/
                flushsuite = handSorted[0].getSuite();
                for(var i = 0; i < handSorted.length; i++){
                    if(handSorted[i].getSuite() != flushsuite){
                        flushpoints = 0;
                    }
                }
                break;
        
            default:
                var flushhand = this.handSort(hand);
                var flushsuite = flushhand[0].getSuite();
                var flushpoints = 4;
                for(var i = 0; i < flushhand.length; i++){
                    if(flushhand[i].getSuite() != flushsuite){
                        flushpoints = 0;
                    }
                }
                break;
        }
        score += flushpoints;

        //KNOB CHECK

        for(var i = 0; i < flushhand.length; i++){
            if(flushhand[i].getRealNum() == 11){
                if(flushhand[i].getSuite() == this.turnUp.getSuite()){
                    score += 1;
                }
            }
        }

        //RETURN SCORE
        console.log("SCORE IS: " + score);
        return score;
    }   
}
class Player{
    constructor(name, hand){
        this.name = name;
        //console.log(this.name);
        this.hand = hand;
        //console.log(this.hand);
        this.score = 0;
        this.savedHand = hand.slice();
        this.pID = 0;
        //console.log("hand saved! : "+ this.savedHand);
    }
    pPlayCard(pHandIndex){//hand id is string
        //console.log(this.name + " is looking for " + this.hand[0].getID());
        this.chosen = this.hand[pHandIndex];
        //console.log(this.name + " is going to play: " + this.hand[pHandIndex].getID());
        return this.chosen;
    }
    removeFromHandIndex(handIndex){
        this.savedHand.push(this.hand[handIndex]);
        this.hand.splice(handIndex,1);
        //console.log(this.name + "'s hand right now! : " + this.hand);
        //console.log(this.name + "'s SAVED hand right now! : " + this.savedHand);
    }
    getSavedHand(){
        console.log("SAVED HAND: " + this.savedHand);
        return this.savedHand;
    }
    removeFromHand(rHandID) {
        console.log("will attempt to remove card: + " + rHandID);
        for(var i = 0; i < this.hand.length;i++){ //search hand for card ID
            if(this.hand[i].oid == rHandID){
                this.savedHand.push(this.hand[i]);
                this.hand.splice(i,1);
            }
        }
    }
    addHand(nCard){ //push a passed card to the hand array
        this.hand.push(nCard.getID());
        //console.log(this.hand);
    }
    getHand() { //return hand array, returns as list of strings
        //console.log(this.name + ": Get hand called!!! : " + this.hand);
        return this.hand;
    }
    getName(){
        return this.name;
    }
    getScore(){
        return this.score;
    }
    setHand(nHand){
        this.savedHand = [];
        this.savedHand.length = 0;
        this.hand = nHand;
    }
    findHand(handID){
        for(var i = 0; i < this.hand.length;i++){ //search hand for card ID
            if(this.hand[i].getID() == handID){
                return i;
            }
        }
    }
}
class Suite {
    constructor(suiteName){
        this.suiteName = suiteName;
        this.values = ["1","2","3","4","5","6","7","8","9","10","11","12","13"];
        this.valcount = 13;
        this.isEmpty = false;
    }
    newCard(){ //draw random card
        if(this.valcount > 0){
            this.randomID = Math.floor(Math.random() * this.valcount);
            //console.log(this.randomID); //testing purposes
            this.valID = this.values[this.randomID];
            //console.log(this.valID);
            this.suiteID = this.suiteName;
            this.valcount--;
            this.values.splice(this.randomID,1);
            this.ncard = new Card(this.suiteID,this.valID);
            return this.ncard;
        }else{
            this.isEmpty = true;
            return this.ncard = new Card("empty!");
        }
    }
}
class Deck {
    constructor(){
        this.Hearts = new Suite("Hearts");
        this.Spades = new Suite("Spades");
        this.Diamond = new Suite("Diamond");
        this.Clubs = new Suite("Clubs");
        this.suiteCount = 4;
        this.Suites = [this.Diamond,this.Spades,this.Hearts,this.Clubs];
    }
    genRandomCard(numCards){
            //console.log("Generating " + numCards + " cards!");
            var tempHand = [];
            for(this.nc = 0; this.nc < numCards; this.nc++){
                //console.log("THERE ARE THESE MANY SUITES LEFT:"+ this.suiteCount);
                this.randomSuite = Math.floor(Math.random() * this.suiteCount);
                this.rCard = this.Suites[this.randomSuite].newCard();
                tempHand.push(this.rCard);
                console.log(this.rCard.getID());
            }
            return tempHand;
    }
    getRandomCard(numCards){
        //console.log("Getting " + numCards + " cards!");
        var tempHand = [];
        for(this.nc = 0; this.nc < numCards; this.nc++){
            for(this.i = 0; this.i < this.Suites.length; this.i++){
                if(this.Suites[this.i].valcount <= 0){
                    this.suiteCount--;
                    this.Suites.splice(this.i,1);
                }
            }
            //console.log("THERE ARE THESE MANY SUITES LEFT:"+ this.suiteCount);
            this.randomSuite = Math.floor(Math.random() * this.suiteCount);
            this.rCard = this.Suites[this.randomSuite].newCard();
            tempHand.push(this.rCard);
            console.log(this.rCard.getID());
        }
        return tempHand;
    }
}
class Card {//card name is a string
    constructor(suiteID, numID){
        this.turnOver = false;
        this.suiteID = suiteID;
        this.numID = numID;
        this.oid = this.suiteID + " "+ this.numID;
        //console.log(this.oid + " card created!")
        this.id = this.oid;
    }
    getID(){
        return this.id;
    }
    getSuite(){
        return this.suiteID;
    }
    getNum() {
        var num = parseInt(this.numID);
        if (num > 10) {
            num = 10;
        }
        return num;
    }
    getRealNum(){
        return this.numID;
    }
    turnOver(){
        if(this.turnOver){
            this.id = this.oid;
            this.turnOver = false;
        }else{
            this.id = "Back";
            this.turnOver = true;
        }
        return;
    }
}



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use("/images",express.static(__dirname + "/images"));
app.use("/views",express.static(__dirname + "/views"));
app.use("/lobby",index);
app.use("/images/cards",express.static(__dirname + "/images/cards"));
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


//error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
console.log("Loading. . . \n");
console.log("CRIBBAGE LOADED! \n");
console.log(" ███▄ ▄███▓ ▄▄▄      ▒██   ██▒       ▄▄▄▄   \n▓██▒▀█▀ ██▒▒████▄    ▒▒ █ █ ▒░      ▓█████▄ \n▓██    ▓██░▒██  ▀█▄  ░░  █   ░      ▒██▒ ▄██\n▒██    ▒██ ░██▄▄▄▄██  ░ █ █ ▒       ▒██░█▀  \n▒██▒   ░██▒ ▓█   ▓██▒▒██▒ ▒██▒      ░▓█  ▀█▓\n░ ▒░   ░  ░ ▒▒   ▓▒█░▒▒ ░ ░▓ ░      ░▒▓███▀▒\n░  ░      ░  ▒   ▒▒ ░░░   ░▒ ░      ▒░▒   ░ \n░      ░     ░   ▒    ░    ░         ░    ░ \n       ░         ░  ░ ░    ░         ░      \n                                          ░ \n");

io.sockets.on("connection", function(socket){
    var nickname;
    socket.on("set nickname", function(data, callback){
        if (data in users || data.length >= 19) {
            callback(false);
        } else {
            callback(true);
            socket.nickname = data;
            users[socket.nickname] = socket;
            io.sockets.emit('usernames',Object.keys(users));
            console.log("user: " + socket.nickname + " has connected.");
            console.log(Object.keys(users));
        }
    });
    socket.on("send message", function(data, callback){
        var msg = data.trim();
        var name = msg.substring(6);
        if(msg === "/play"){
            callback(true);
            //io.sockets.users[name].emit("queue");
            //HERE ENTER QUEUE, MATCH WITH OTHER PLAYER! DO THIS AFTER 1v1 is DONE.
        } else if(msg.substr(0,6)==="/play "){
            if(name in users && name != socket.nickname){
                callback(true);
                socket.emit("challenge");
                users[name].emit("challenged", socket.nickname);
                //console.log("message sent good. FROM: "+socket.nickname+" TO: "+name);
            }else{
                callback(false);
            }
        }else if(msg.includes((":elegiggle:").toLowerCase())){
            io.sockets.emit("new message", {msg: data.replace(":elegiggle:","<img src = 'images/giggle.png'>"), name: socket.nickname});
        } else if(msg.includes((":pogchamp:").toLowerCase())){
            io.sockets.emit("new message", {msg: data.replace(":pogchamp:","<img src = 'images/champ.png'>"), name: socket.nickname});
        }else if(msg.includes((":monkas:").toLowerCase())){
            io.sockets.emit("new message", {msg: data.replace(":monkas:","<img src = 'images/worried.png'>"), name: socket.nickname});
        }else if(msg.includes((":pepehands:").toLowerCase())){
            io.sockets.emit("new message", {msg: data.replace(":pepehands:","<img src = 'images/why.png'>"), name: socket.nickname});
        }else {
            callback(true);
            io.sockets.emit("new message", {msg: data, name: socket.nickname});
            console.log("chat message:" + data);
        }
    });
    socket.on("draw card",function(data){
        //io.sockets.in(rooms[data.roomcount]).emit("cardDrawn",{whichPlayer: data.player,games[data.roomcount]});
        ///THIS NEEDS TO BE DONE. NEEDS REFERRAL TO GAME NUMBER AnD GAME OBJECT FOR CARD DRAW AND CONSISTENT DRAWLIST
    });
    socket.on("playCard", function (data, callback) {
        //data> pname: players name, cardIndex: card index of play, 
        //callback> false if card is invalid option, true if card is valid to use
        console.log("card index : " + data.cardIndex);
        //console.log("card index - 1 : " + data.cardIndex - 1);
        console.log("p1's hand length: " + games[data.room].p1.getHand().length);
        console.log("p2's hand length: " + games[data.room].p2.getHand().length);
        //console.log("player: " + data.pname + " tried to play: " + games[data.room].getCardFromPlayer(data.cardIndex, data.name).oid + "in room: " + data.room);
        if ((games[data.room].crib.length < 4 && games[data.room].crib1 < 2 && data.pname == games[data.room].p1.name)) {
            io.sockets.in(rooms[data.room]).emit("cribUpdate", { cribCardID: games[data.room].getCardFromPlayer(data.cardIndex, games[data.room].p1.name).oid, pname: data.pname });
        } else if ((games[data.room].crib.length < 4 && games[data.room].crib2 < 2 && data.pname == games[data.room].p2.name)) {
            io.sockets.in(rooms[data.room]).emit("cribUpdate", { cribCardID: games[data.room].getCardFromPlayer(data.cardIndex, games[data.room].p2.name).oid, pname: data.pname });
        }
        callback(games[data.room].playCard(games[data.room].getCardFromPlayer(data.cardIndex, data.pname), data.pname));
        console.log("DCARDS LENGTH: " + games[data.room].dCards.length);
        console.log("PCARDS LENGTH: " + games[data.room].dCards.length);
        io.sockets.in(rooms[data.room]).emit("gameStateUpdate", { p1Cards: games[data.room].p1.getHand(), p2Cards: games[data.room].p2.getHand(), turnUpCard: games[data.room].turnUp, p1Score: games[data.room].p1.getScore(), p2Score: games[data.room].p2.getScore(), pCards: games[data.room].pCards, dCards: games[data.room].dCards });
        console.log("p1's hand length: " + games[data.room].p1.getHand().length);
        console.log("p2's hand length: " + games[data.room].p2.getHand().length);
        if(games[data.room].boardCheckPCards()){
            console.log("MATCH IS OVERRRR!!!");
            //fix this wtf
            //console.log("GAME FULL p1 saved hand: " + games[data.roomNum].p1.getSavedHand());
            //console.log("GAME FULL p2 saved hand: " + games[data.roomNum].p1.getSavedHand());
            games[data.room].p1.score += games[data.room].scoreHand(games[data.room].p1.getSavedHand());
            games[data.room].p2.score += games[data.room].scoreHand(games[data.room].p2.getSavedHand());
            //games[data.room].newRound();
            //console.log("board is full!!!!");
            newRound(data.room);
        }
        //callback(games[data.room].playCard(games[data.room].getCardFromPlayer(data.cardIndex, data.pname), data.pname))
        //on the exception that call go is needed, turn will be incremented anyway and is done automatically
    });
    function newRound(roomNum){
        console.log("NEW ROUND BEGINNING!...");
        console.log("Generating new deck...");
        var dDeck = new Deck();
        //console.log("Refreshing Players...");
        //console.log("Players deck refereshed!!");
        //console.log("player 1: "+p1.getName()+ " player 2: "+p2.getName());
        //console.log("Generating Game...");
        games[roomNum].p1.setHand(dDeck.getRandomCard(6));
        games[roomNum].p2.setHand(dDeck.getRandomCard(6));
        //console.log(games[roomNum].p1.name + " hand is: " + gamesp);
        var crib = new Cribbage(games[roomNum].p1, games[roomNum].p2, dDeck);
        crib.generateFirstTurn(games[roomNum].isCrib);
        games[roomNum] = crib;
        //console.log("Game Generated!");
        //io.sockets.in(rooms[roomNum]).emit("newRoundRoom",{player1: games[roomNum].p1.getName(), player2: games[roomNum].p2.getName(), roomCount: roomNum, isCrib: games[roomNum].isCrib});
        //io.sockets.rooms[roomcount].counter = 0;
        //console.log("NEW ROUND IN ROOM:" + rooms[roomNum]);
        io.sockets.in(rooms[roomNum]).emit("welcomeToRoom", { player1: games[roomNum].p1.getName(), player2: games[roomNum].p2.getName(), roomCount: roomNum, isCrib: crib.isCrib });
        io.sockets.in(rooms[roomNum]).emit("gameStateUpdate", { p1Cards: games[roomNum].p1.getHand(), p2Cards: games[roomNum].p2.getHand(), turnUpCard: crib.turnUp, p1Score: games[roomNum].p1.getScore(), p2Score: games[roomNum].p2.getScore(), pCards: crib.pCards, dCards: crib.dCards});
    }
    socket.on("accept",function(data){
        console.log("accepted request FROM: "+data+" TO: " + socket.nickname);
        console.log("Hello pals!");
        console.log("Generating deck...");
        var dDeck = new Deck();
        console.log("Deck created! deck suiteCount: " + dDeck.suiteCount);
        console.log("Generating Players...");
        var p1 = new Player(socket.nickname,dDeck.getRandomCard(6));
        //console.log("Card " + p1.pPlayCard(1).getID() + " chosen!!");
        console.log("Player 1 created! : "+p1.getName());
        var p2 = new Player(data,dDeck.getRandomCard(6));
        console.log("Player 2 created! : "+p2.getName());
        console.log("Generating Game...");
        var crib = new Cribbage(p1,p2,dDeck);
        console.log("Game Generated!");

        rooms.push(""+roomcount);
        socket.join(rooms[roomcount]);
        users[data].join(rooms[roomcount]);
        //console.log("IN ROOM1:" + rooms[roomcount]);

        crib.generateFirstTurn();
        //welcomeToRoom passes player names and thus assignment, room number, also isCrib.
        //gameStateUpdate passes an object containing the following things, p1Cards, p2Cards, turnUpCard, p1Score, p2Score, pCards, and thus dCards as well.
        io.sockets.in(rooms[roomcount]).emit("welcomeToRoom", { player1: p1.getName(), player2: p2.getName(), roomCount: roomcount, isCrib: crib.isCrib });
        io.sockets.in(rooms[roomcount]).emit("gameStateUpdate", { p1Cards: p1.getHand(), p2Cards: p2.getHand(), turnUpCard: crib.turnUp, p1Score: p1.getScore(), p2Score: p2.getScore(), pCards: crib.pCards, dCards: crib.getDeadCards() });
        games.push(crib);
        console.log("games list updated! : " + games);
        //io.sockets.in(rooms[roomcount]).emit("setTurnUp",games[roomcount].turnUp);
        //console.log("SET TURN UP CALLED : " + games[roomcount].turnUp.oid);
        //io.sockets.in(rooms[roomcount]).emit("updateScore",{p1Score: p1.getScore(),p2Score: p2.getScore()});
        //io.sockets.in(rooms[roomcount]).emit("updatePlay",{pCards: games[roomcount].boardGetpCards(),dCards: games[roomcount].boardGetdCards()});
        //console.log("new game starring: player 1 as "+p1.getName()+"with player 2 as "+p2.getName());
        roomcount++;
        //console.log(roomcount);
    });

    socket.on("test", function(data){
        console.log("works");
    });

    socket.on("disconnect", function(data){
        if(!socket.nickname) return;

        socket.broadcast.emit('user disconnected',socket.nickname);
        delete users[socket.nickname];
        io.sockets.emit('usernames',Object.keys(users));
    });
    socket.on("testData", function(data){
        console.log("data works on this end, got: " + data);
    });
});
