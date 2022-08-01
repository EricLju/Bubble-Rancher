//bub_helpers.js - Utility functions.

//Generate random float value from min to max. Includes min, excludes max.
//min - minimum value
//max - maximum value
//returns float value between min and max. Includes min, excludes max.
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

//Convert degrees to radians.
function toRadians(degrees){
  return degrees * 0.0174533;
}

//Build a displayable string from a given number of seconds;
//ex. number 68 is converted to string "1m 8s"
function secondsToDisplyString(seconds){
  var tempDisplayString;

  //Split seconds into minutes and remaining seconds.
  var tempMinutesOnly = Math.trunc(seconds / 60);
  var tempSecondsOnly = Math.round(seconds % 60);

  //If greater than 1 minute, display "x min y sec" else display "x seconds"
  if(tempMinutesOnly > 0){
    tempDisplayString = tempMinutesOnly + " min  " + tempSecondsOnly + " sec";
  } else {
    tempDisplayString = tempSecondsOnly + " seconds";
  }

  return tempDisplayString;
}

//For debugging but ended up using this to draw a border around some text containers
//Draw a box around a container
function debugDrawBoxAroundContainer(container, parent, color=0x00FF00){
  var graphics = new PIXI.Graphics();
  var bounds = container.getBounds();

  graphics.lineStyle(1, color, 1);
  graphics.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
  parent.addChild(graphics);
}

//For debugging
//Draw a point at the given position.
function debugDrawPointAtPoint(position, parent, color=0x00FF00){
  var graphics = new PIXI.Graphics();

  graphics.lineStyle(0);
  graphics.beginFill(color, 1);
  graphics.drawCircle(position.x, position.y, 5);
  graphics.endFill();
  parent.addChild(graphics);
}

//For debugging
//Draw a line from position1 to position2
//parent - pixi container that the line will be added to.
function debugDrawLine(position1, position2, parent, color=0x00FF00){
  var graphics = new PIXI.Graphics();

  graphics.lineStyle(1, color, 1);
  graphics.moveTo(position1.x, position1.y);
  graphics.lineTo(position2.x, position2.y);
  parent.addChild(graphics);
}