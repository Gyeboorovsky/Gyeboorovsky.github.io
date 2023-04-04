
var cardIds = [
    "pastSimple",
    "pastContinuous",
    "pastPerfect",
    "pastPerfectContinuous",
    "presentSimple",
    "presentContinuous",
    "presentPerfect",
    "presentPerfectContinuous",
    "futureSimple",
    "futureContinuous",
    "futurePerfect",
    "futurePerfectContinuous"
]

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function rotate(cardIds){
    id = getRandomInt(0, 11);
    var card = document.getElementById(cardIds[id]);
    speed = 0;
    alignAllCards(cardIds);
    var interval = setInterval(() => move(card, interval), 1);

    function alignAllCards(cardIds){
        for(var i = 0; i < cardIds.length; i++){
            var card = document.getElementById(cardIds[id])
            card.style.transform = "rotate(" + 0 + "deg)";
            card.style.webkitTransform = "rotate(" + 0 + "deg)";
            card.style.mozTransform = "rotate(" + 0 + "deg)";
        }
    }

    function move(card, interval){

        if(speed < 360){
            card.style.transform = "rotate(" + speed + "deg)";
            card.style.webkitTransform = "rotate(" + speed + "deg)";
            card.style.mozTransform = "rotate(" + speed + "deg)";

            speed += 5;
        }
        else{
            clearInterval(interval);
            speed = 0;

            card.style.transform = "rotate(" + speed + "deg)";
            card.style.webkitTransform = "rotate(" + speed + "deg)";
            card.style.mozTransform = "rotate(" + speed + "deg)";
        }
            
    }
}

setInterval(() => rotate(cardIds), 3000);