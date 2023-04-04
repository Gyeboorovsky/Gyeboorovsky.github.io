


function actionsOnHover (id){
  let val = 0;
  let rotationSpeed = 0.5;
  let counter = 0;
  var intervalList = new Array();

  var interval = setInterval(() => buzzingItem(document.getElementById(id), interval), 2);
  intervalList.push(interval);

  function buzzingItem(item, interval) {

    if (val < 3 && val > -3){
      item.style.transform = "rotate(" + val + "deg)";
      item.style.webkitTransform = "rotate(" + val + "deg)";
      item.style.mozTransform = "rotate(" + val + "deg)";
      val += rotationSpeed;
      counter +=1;
    }else{
      if (val > 0){
        rotationSpeed *= -1;
        val -= 1;
      }else{
        rotationSpeed *= -1;
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
}




