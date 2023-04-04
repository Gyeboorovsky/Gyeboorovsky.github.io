Arrival()

function Arrival(){
        
    var descriptionPosition = 800;
    var videoPosition = -800;
    var distancePerStep = 10;

    var interval = setInterval(() => move(interval), 10);

    function move(interval){
        if(descriptionPosition > -distancePerStep){
            document.getElementById("rightSide").style.left = descriptionPosition + 'px';
            descriptionPosition -= distancePerStep;
        }else{
            clearInterval(interval);
        }

        if(videoPosition < distancePerStep){
            document.getElementById("leftSide").style.left = videoPosition + 'px';
            videoPosition += distancePerStep;
        }else{
            clearInterval(interval);
        }
    }
}


