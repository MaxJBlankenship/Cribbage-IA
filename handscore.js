var handSorted = [4,5,6,6,7];
var score = 0;
for(var i = 0; i < handSorted.length; i++){
    if(handSorted[i] + 1 == handSorted[i + 1]  && handSorted[i + 1]  != null){
        //score += 1;
        if(handSorted[i] + 2  == handSorted[i + 2] && handSorted[i + 2]  != null){
            score += 3;
            if(handSorted[i] + 3 == handSorted[i + 3] && handSorted[i + 3]  != null){
                score += 1;
                if(handSorted[i] + 4 == handSorted[i + 4] && handSorted[i + 4]  != null){
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
