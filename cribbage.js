


//PLAYER INPUT, ONE CARD, DO NOT REMOVE FROM DECK OR ADD TO HAND. USE ONLY BY SERVER DISPLAY TO USER.
//DONE: decide who is the dealer.
/*
var p1Card = crib.cDeck.genRandomCard(1)[0];
var p2Card =


 crib.cDeck.genRandomCard(1)[0];
if(p1Card.getNum() < p2Card.getNum()){
    console.log("player 1 is DEALER!");
}else if (p1Card.getNum() > p2Card.getNum()){
    console.log("player 2 is DEALER!");
} else if (p1Card.getNum() = p2Card.getNum()){
    console.log("DRAW AGAIN!");
    //
}*/



class Cribbage{
    constructor(p1,p2,cDeck){
        this.p1 = p1;
        this.p2 = p2;
        this.cDeck = cDeck;
        this.crib = [];
    }
    //6s 6d 7s 8s | 3s
    //scores 15
    generateTurnUp(){
        this.turnUp = this.cDeck.getRandomCard(1)[0];
        console.log("turned up card is " +this.turnUp.getID()+"!");
    }
    boardcantGo(){//called by client at start of turn, broadcastemit(cards) function callback if true, player is prompted to say go, else player can make a play
        //iterate through hand, adding each card to sum of board to see if it adds to over 31, if so return false
    }
    boardPlayCard(card){ //called by client, broadcastemit(cards.getcard(clicked),this.nameetc) function with callback if false, display "invalid card."
        //check if card is legal
        //if legal vv
        //delete card from hand
        //add card to board
        //iterate through board cards and turnup
        //return score of play
        return
    }
    addToCrib(card){
        if(this.crib.length < 4){
            this.crib.push(card);
            console.log(card.getID() + "ADDED TO CRIB!");
        }
    }




    scoreHand(hand){
        var handforscore = [];
        console.log("SHOULD RESET: "+handforscore.length);
        this.handscore = 0;
        handforscore = hand;
        console.log("HAND LENGTH ADDED: "+handforscore.length);
        handforscore.push(this.turnUp);
        console.log("TURNUP LENGTH ADDED: "+handforscore.length);
        console.log(this.turnUp);
        console.log(hand);
        // $check how many permutations(with turnup) sum to 15 (this.handscore += 2*(numSums))
        //DONE ALL RUNS INCLUDE TUC ALWAYS
        //DONE $check for 4 length runs (this.handscore += 4)
        //DONE $!if no 4 length runs check for 3 length runs, mark first 3 it encounters (this.handscore += 3)
        //DONE $check for pairs (this.handscore += 2*(numPairs)) pairs can repeat individual nums
        //DONE $check for flush, only 4 of same suit scores 4
        //DONE $!5 if TUC suite is same(this.handscore += 5) else, (this.handscore += 4)
        //DONE $one for his knob rule +1 if TUC is same suite as Jack suite
        //NOTDONE crib implementation

        //crib evaluation includes turnup card, only evaluate for player whose crib applies.
        //during evaluation phase scoreHand is called twice, once with players hand and turn up, another with the crib and turn up

        var result = []; //full list of bitstrings
        result.length = 0;
        for(var t = 0; t<Math.pow(2,handforscore.length); t++){
            var combo = []; //temp bitstring of bits
            for(var w=0; w<handforscore.length; w++){
                //shift bit and and it with 1
                if(((t >> w) & 1))
                    combo.push(1);
                 else
                    combo.push(0);
            }
            //console.log(combo);
            result.push(combo);
            //console.log("combo: " + t + " added! :: " + combo);
        }
        console.log("RESULT LENGTH!! : "+ result.length);
        for(var r = 0; r < result.length; r++){
            this.tofif = 0;
            for(var v = 0; v < result[r].length; v++){
                if(result[r][v] == 1){
                    if(parseInt(handforscore[v].getNum()) > 10){
                        this.addtofif = 10;
                    } else {
                        this.addtofif = parseInt(handforscore[v].getNum());
                    }
                    this.tofif += this.addtofif;
                }
            }
            if(this.tofif == 15){
                this.tofif = 0;
                //console.log("fifteen sum found!");
                this.handscore += 2;
            }
        }

        for(var i = 0; i < handforscore.length; i++){
            for(var x = 0; x < handforscore.length; x++){
                if(handforscore[i].getNum() == handforscore[x].getNum() && x != i){
                    this.handscore += 1;
                    console.log("pair found! : " + handforscore[i].getID() + " and " + handforscore[x].getID());
                }
            }
        }
        //check for 4 run
        var run4 = false;
        for(var j = 0; j < 1; j++){
            for(var h = 0 + j; h < handforscore.length+(-1+j); h++){
                if(handforscore[h+1].getNum()==handforscore[h].getNum()){
                    run4 = true;
                    console.log("four run found!");
                } else {
                    run4 = false;
                    console.log("four run not found!");
                    break;
                }
            }
        }
        //check for 3 run
        if(run4){
            this.handscore += 4;
        }else{
            var run3 = false;
            for(var k = 0; k < 2; k++){
                for(var z = 0 + k; z < handforscore.length+(-2+k); z++){
                    if(handforscore[z+1].getNum()==handforscore[z].getNum()){
                        run3 = true;
                        console.log("three run found!");
                    } else {
                        run3 = false;
                        console.log("three run not found!");
                        break;
                    }
                }
            }
            if(run3){
                this.handscore += 3;
            }
        }
        //flush
        var flush = false;
        var flushsuite = handforscore[0].getSuite();
        for(var u = 0; u < handforscore.length; u++){
            if(handforscore[u] == flushsuite){
                flush = true;
            }else{
                flush = false;
            }
        }
        if(handforscore[handforscore.length-1].getSuite() == flushsuite && flush){
            this.handscore += 5;
            console.log("Found full flush!!");
        }else if(flush){
            this.handscore += 4;
            console.log("Found hand flush!!");
        }
        var knob = false;
        for(var w = 0; w < handforscore.length-1; w++){
            if(handforscore[w].getNum() == "11" && handforscore[w].getSuite() == this.turnUp.getSuite()){
                knob = true;
                //console.log("KNOB FOUND! turn up card: " + this.turnUp.getID() + " with " + handforscore[w].getID());
                break;
            }
        }
        if(knob){
            this.handscore += 1;
        }
        //handforscore.shift();
        hand.pop();
        return this.handscore;
    }
}
class Player{
    constructor(name, hand, score){
        this.name = name;
        console.log(this.name);
        this.hand = hand;
        console.log(this.hand);
        this.score = score;
    }
    pPlayCard(pHandIndex){//hand id is string
        //console.log(this.name + " is looking for " + this.hand[0].getID());
        this.chosen = this.hand[pHandIndex];
        console.log(this.name + " is going to play: " + this.hand[pHandIndex].getID());
        return this.chosen;
    }
    removeFromHand(rHandID){
        for(var i = 0; i < this.hand.length;i++){ //search hand for card ID
            if(this.hand[i].getID() == rHandID){
                this.hand.splice(i,1);
            }
        }
    }
    addHand(nCard){ //push a passed card to the hand array
        this.hand.push(nCard.getID());
        //console.log(this.hand);
    }
    getHand(){ //return hand array, returns as list of strings
        return this.hand;
    }
    getName(){
        return this.name;
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
            console.log("Generating " + numCards + " cards!");
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
        console.log("Getting " + numCards + " cards!");
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
    getNum(){
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
console.log("Adding player cards to crib...");
//PLAYER INPUT, TWO CARDS REMOVE FROM HAND. REPLACE FIRST 0 and 1 BY pCHOICE1, pCHOICE2!!!console.log("Hello pals!");
console.log("Generating deck...");
var dDeck = new Deck();
console.log("Deck created! deck suiteCount: " + dDeck.suiteCount);
console.log("Generating Players...");
var p1 = new Player("Agario",dDeck.getRandomCard(6));
console.log("Card " + p1.pPlayCard(1).getID() + " chosen!!");
console.log("Player 1 created!");
var p2 = new Player("Domo",dDeck.getRandomCard(6));
console.log("Player 2 created!");
console.log("player 1: "+p1.getName()+ " player 2: "+p2.getName());
console.log("Generating Game...");
var crib = new Cribbage(p1,p2,dDeck);
console.log("Game Generated!");
crib.addToCrib(p1.pPlayCard(0));
p1.removeFromHand(p1.pPlayCard(0).getID());
crib.addToCrib(p1.pPlayCard(1));
p1.removeFromHand(p1.pPlayCard(1).getID());
crib.addToCrib(p2.pPlayCard(0));
p2.removeFromHand(p2.pPlayCard(0).getID());
crib.addToCrib(p2.pPlayCard(1));
p2.removeFromHand(p2.pPlayCard(1).getID());
console.log("Players have added two cards to the crib each! fourth card is "+ crib.crib[3].getID());
crib.generateTurnUp();
console.log("Crib score is(DEALER GETS THESE POINTS.): "+ crib.scoreHand(crib.crib));
console.log(p1.getHand());
console.log("1st CHECK: player 1's current score would be... " + crib.scoreHand(p1.getHand()) + " points!");
console.log(p1.getHand());
console.log("1st CHECK: player 2's current score would be... " + crib.scoreHand(p2.getHand()) + " points!");
console.log(p2.getHand());

//todo: counter, whenever
