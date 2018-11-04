var handSorted = this.handSort(hand);
        score += this.scoreRun(handSorted);
        var result = []; //full list of bitstrings
        result.length = 0;
        for (var t = 0; t < Math.pow(2, hand.length); t++) {
            var combo = []; //temp bitstring of bits
            for (var w = 0; w < hand.length; w++) {
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
            this.tofif = 0;
            for (var v = 0; v < result[r].length; v++) {
                if (result[r][v] == 1) {
                    if (parseInt(handSorted[v]) > 10) {
                        this.addtofif = 10;
                    } else {
                        this.addtofif = parseInt(handSorted[v]);
                    }
                    this.tofif += this.addtofif;
                    //console.log("result r: " + result[r] + " slot v:" +  handforscore[v].getNum());
                }
            }
            //console.log("fift check is " + this.tofif);
            if (this.tofif == 15) {
                this.tofif = 0;
                console.log("fifteen sum found!");
                score += 2;
            }
        }