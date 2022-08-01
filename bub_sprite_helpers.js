//bub_sprite_helpers.js - Common pixijs functions.

var TINT_BUTTON_NONE = 0xFFFFFF;
var TINT_BUTTON_HOVER = 0xe1f0f6;
var TINT_BUTTON_CLICK = 0x99d6eb;
var TINT_BUTTON_INACTIVE = 0x80c0d0;

//Create a pixi sprite with the given scale and set the anchor/pivot point in
//the center.
function standardSprite(resource, scale){
  var tempSprite = new PIXI.Sprite(PIXI.loader.resources[resource].texture);
	tempSprite.scale = {x: scale, y: scale};
	tempSprite.anchor = {x: 0.5,y:0.5};
  return tempSprite;
}

function createBubble(scale){
  return standardSprite('texBubble01', scale);
}

function createOpponentSpikeBall(scale){
  return standardSprite('spikeball01', scale);
}

function createOpponentCrab(scale){
  return standardSprite('crab01', scale);
}

function createOpponentFish(scale){
  return standardSprite('fish02', scale);
}

function createOpponentSeaMine(scale){
  return standardSprite('seamine01', scale);
}

function createMouseLeftClick(scale){
  return standardSprite('mouseLeftClick', scale);
}

function pixiFish(scale, parent){
  var tempSprite = standardSprite('fish01', scale);
	parent.addChild(tempSprite);
  return tempSprite;
}

function createScubaTank(scale){
  var tempPixi = new PIXI.Sprite(PIXI.loader.resources.texScubaTank1.texture);
  //Keep the anchor at 0,0.
	tempPixi.scale = {x: scale, y: scale};
  return tempPixi;
}

//Red arrow sprite. Anchor is set at the tip of the arrow. Rotation in degrees.
function createArrow(scale, position, rotation, pixiParent){
  var tempPixi = new PIXI.Sprite(PIXI.loader.resources.arrow01.texture);
	tempPixi.scale = {x: scale, y: scale};
  tempPixi.position = position;
  tempPixi.rotation = toRadians(rotation);
	tempPixi.anchor.y = 0.5;
  pixiParent.addChild(tempPixi);
  return tempPixi;
}

//Take a string and build the bubble text as seen as the scene titles.
function buildBubbleText(text){
  var spacing = 65;
  //Container for the whole string
  var tempContainerString = new PIXI.Container();
  //For each character in the string.
  for(var i = 0; i < text.length; i++){
    //Container for just the current character.
    var tempContainerCharacter = new PIXI.Container();
    //If the current character is a space then skip a spot.
    if(text.charAt(i) == " "){
      continue;
    }

    //Do the text character first so that it looks like it is inside the bubble.
    var tempText = new PIXI.Text(text.charAt(i), styleTitleText);
    tempText.anchor = {x: 0.5, y: 0.5};
    tempText.position.x = (tempText.width / 2) + (i * spacing);
	  tempText.position.y = tempText.height / 2;
    tempContainerCharacter.addChild(tempText);

    //Position a bubble sprite over the letter.
    //Make the scale slightly random so it doesn't look to samey. 
    var tempTitleBubble = createBubble(randomFloat(0.155, 0.185));
    tempTitleBubble.position = tempText.position;
    //Add the bubble sprite to the character container.
    tempContainerCharacter.addChild(tempTitleBubble);
    //Add the bobbing physics to the current character.
    addPhysicsTitleBubble(tempContainerCharacter);
    //Add the current character to the whole string container.
    tempContainerString.addChild(tempContainerCharacter);
  }

  return tempContainerString;
}

//Function to shorten adding text to a pixi container.
function pixiTextHelper(stringText, style, position, containerParent){
  var textTemp = new PIXI.Text(stringText, style);
  //Keep the text sharp by using nearest neighbour scaling.
	textTemp.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  textTemp.anchor = {x: 0.5, y: 0.5}
  textTemp.position = position;
  containerParent.addChild(textTemp);
  return textTemp;
}

//On mouse over a button.
function buttonMouseOver(mouseData){
  //If the button is inactive, don't mess with the tint.
	if(this.tint != TINT_BUTTON_INACTIVE){
    this.tint = TINT_BUTTON_HOVER;
  }
  audioClick5.play();
}

//On the mouse moving off a button.
function buttonMouseOut(mouseData){
  //If the button is inactive, don't mess with the tint.
	if(this.tint != TINT_BUTTON_INACTIVE){
    this.tint = TINT_BUTTON_NONE; 
  }
}

//On mouse button is down but not clicked.
function buttonMouseDown(mouseData){
  //If the button is inactive, don't mess with the tint.
	if(this.tint != TINT_BUTTON_INACTIVE){
    this.tint = TINT_BUTTON_CLICK;
  }
}

//On mouse button release.
function buttonMouseUp(mouseData){
  //If the button is inactive, don't mess with the tint.
  if(this.tint != TINT_BUTTON_INACTIVE){
    //I'm expecting the mouse to still be over the button
    this.tint = TINT_BUTTON_HOVER;
  }
}

//TODO: construct button from left/middle/right sections to prevent warping of edges
//Create a standard bubble button.
function createButton(text, onClickFunction, textStyle=styleButtonText){
	var tempContainer = new PIXI.Container();
	var tempSprite = new PIXI.Sprite(PIXI.loader.resources.texButton1.texture);
  tempSprite.scale = {x: 0.5, y: 0.5};
  //Interaction event handlers
	tempSprite.interactive = true;
  tempSprite.mouseover = buttonMouseOver;
  tempSprite.mouseout = buttonMouseOut;
  tempSprite.mousedown = buttonMouseDown;
  tempSprite.mouseup = buttonMouseUp;
  tempSprite.click = onClickFunction;
  //Touch events. I didn't really end up supporting touch based input.
  tempSprite.touchstart = buttonMouseOver;
  tempSprite.touchend = buttonMouseOut;
  tempSprite.tap = onClickFunction;
  
  var tempText = new PIXI.Text(text, textStyle);
  tempText.anchor = {x: 0.5, y: 0.5};
  //Set the size of the button sprite so that it is large enough to contain the
  //text 
  tempSprite.width = tempText.width + 60;
  tempSprite.height = tempText.height + 26;
  //Center the text in the button sprite.
  tempText.position.x = tempSprite.width/2;
	tempText.position.y = tempSprite.height/2;
  //Add the button sprite then text over top of it.
  tempContainer.addChild(tempSprite);
  tempContainer.addChild(tempText);
  //Position button from the center
  tempContainer.pivot = {x: (tempContainer.width / 2), y: (tempContainer.height / 2)};
  //Save an easy to acess reference to the button sprite so that we can tint it later.
  tempContainer.backgroundSprite = tempSprite;

	return tempContainer;
}

//Special texture, no text, mute button
function createAudioButton(onClickFunction, scale){
	var tempSprite = new PIXI.Sprite(PIXI.loader.resources.buttonAudioOn.texture);
  tempSprite.pivot = {x: (tempSprite.width / 2), y: (tempSprite.height / 2)};
  tempSprite.scale = {x: scale, y: scale};
	//Interaction event handlers
  tempSprite.interactive = true;
  tempSprite.mouseover = buttonMouseOver;
  tempSprite.mouseout = buttonMouseOut;
  tempSprite.mousedown = buttonMouseDown;
  tempSprite.mouseup = buttonMouseUp;
  tempSprite.click = onClickFunction;
  tempSprite.touchstart = buttonMouseOver;
  tempSprite.touchend = buttonMouseOut;
  tempSprite.tap = onClickFunction;
  
	return tempSprite;
}

//Create a rope sprite of the given lenght using a repeating sprite.
function pixiTiledRope(length, scale){
  //Rope texture is repeating on the x-axis.
  var tempRope = new PIXI.TilingSprite(PIXI.loader.resources.rope01.texture, length, 44);
  tempRope.tileScale = scale;
  //Scale the sprite height to match the change in scale.
  tempRope.height = tempRope.height * scale.y;
  tempRope.pivot.y = tempRope.height / 2;

  return tempRope;
}

//End caps to hide the rope border edges.
function pixiWoodPost(position, scale, parent){
  var tempSprite = standardSprite('woodpost02', scale);
  tempSprite.position = position;
	parent.addChild(tempSprite);
  return tempSprite;
}

//Use the rope and woodpost textures to create a border box.
function pixiRopeBorder(position, size, ropeOffset=0, postOffset=0){
  var tempBorderContainer = new PIXI.Container();
  
  //Top
  var topRope = pixiTiledRope(size.x, {x: 0.5, y: 0.4});
  topRope.position.x = position.x;
  topRope.position.y = position.y - ropeOffset;
  tempBorderContainer.addChild(topRope);
  //Bottom
  var bottomRope = pixiTiledRope(size.x, {x: 0.5, y: 0.4});
  bottomRope.position.x = position.x;
  bottomRope.position.y = position.y + size.y + ropeOffset;
  tempBorderContainer.addChild(bottomRope);
  //Left
  var leftRope = pixiTiledRope(size.y, {x: 0.5, y: 0.4});
  leftRope.position.x = position.x - ropeOffset;
  leftRope.position.y = position.y;
  leftRope.rotation = Math.PI / 2;
  tempBorderContainer.addChild(leftRope);
  //Right
  var rightRope = pixiTiledRope(size.y, {x: 0.5, y: 0.4});
  rightRope.position.x = position.x + size.x + ropeOffset;
  rightRope.position.y = position.y;
  rightRope.rotation = Math.PI / 2;
  tempBorderContainer.addChild(rightRope);

  //Wood Posts
  //Top Left
  pixiWoodPost({x: (position.x - postOffset), y: (position.y - postOffset)}, 0.25, tempBorderContainer);
  //Top Right
  pixiWoodPost({x: (position.x + size.x + postOffset), y: (position.y - postOffset)}, 0.25, tempBorderContainer);
  //Bottom Left
  pixiWoodPost({x: (position.x - postOffset), y: (position.y + size.y + postOffset)}, 0.25, tempBorderContainer);
  //Bottom Right
  pixiWoodPost({x: (position.x + size.x + postOffset), y: (position.y + size.y + postOffset)}, 0.25, tempBorderContainer);

  return tempBorderContainer;
}

//Create a tiled sprite using the partially transparent fill texture.
//position - Position to place upper right corner of sprite - Key value object with x and y keys
//size - Width and height of sprite - Key value object with x and y keys
//tint - Pixi tint to apply  - Value of 0x000000 to 0xFFFFFF
function pixiTiledAlphaFill(position, size, tint){
  var tempSprite = new PIXI.TilingSprite(PIXI.loader.resources.alphafill01.texture, size.x, size.y);
  tempSprite.position.x = position.x;
  tempSprite.position.y = position.y;
  tempSprite.tint = tint;
  return tempSprite;
}