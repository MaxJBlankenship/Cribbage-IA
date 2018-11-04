var handSorted = [5,5,5,5,10];
var score = 0;
for(var i = 0; i < handSorted.length; i++){
    if(handSorted[i].getNum() == handSorted[i + 1].getNum()){
        score += 3;
        if(handSorted[i].getNum() == handSorted[i + 2].getNum()){
            score += 3;
            if(handSorted[i].getNum() == handSorted[i + 3].getNum()){
                score += 6;
            }
        }
    }
}
console.log("score is: " + score);
