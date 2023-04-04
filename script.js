
let val = 0;
let speed = 0.5;
let counter = 0;
function rotateItem(item, interval) {

  if (val < 3 && val > -3){
    item.style.transform = "rotate(" + val + "deg)";
    item.style.webkitTransform = "rotate(" + val + "deg)";
    item.style.mozTransform = "rotate(" + val + "deg)";
    val += speed;
    counter +=1;
  }else{
    if (val > 0){
      speed *= -1;
      val -= 1;
    }else{
      speed *= -1;
      val += 1;
    }
    
  }

  if(counter >= 50){
    clearInterval(interval);
    val = 0;
    counter = 0;
    item.style.transform = "rotate(" + val + "deg)";
    item.style.webkitTransform = "rotate(" + val + "deg)";
    item.style.mozTransform = "rotate(" + val + "deg)";
  }
  
}

var intervalList = new Array();

function mouseOut(id){

  for(var elem in intervalList){
    if(elem.id = id){
      clearInterval(elem);
      var index = intervalList.indexOf(elem);
      intervalList.splice(index, 1);
    }
  }
}

function rotItem (id){
  var interval = setInterval(() => rotateItem(document.getElementById(id), interval), 2);
  intervalList.push(interval);
}




