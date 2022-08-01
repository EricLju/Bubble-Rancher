//bub_scene_play.js - The actual game.

//Store some text positions up here so I could easily change them.
var MUTE_BUTTON_POSITION = {x: 60, y: 14};
var AIR_REMAINING_TEXT_POSITION = {x: 160, y:15};
var TANKS_LEFT_TEXT_POSITION = {x: 330, y:15};
var VOLUME_TEXT_POSITION = {x: 508, y:15};
var LEVEL_TEXT_POSITION = {x: 211, y:470};
var SCORE_TEXT_POSITION = {x: 422, y:470};

//Enemy trapped bonus
var TRAP_TIME = 150; //Minimum time since last collision to count an enemy as trapped.
var TRAP_COUNT = 50; //Number of collisions less than TRAP_TIME to consider an enemy trapped.

//Fade out the inflate sound. I think this sounds better then an abrupt .stop()
function fadeStopInflate(){
  //'fade' event is fired by howler when a fade completes. Stop the sound at the
  //end of a fade so that it doesn't loop. Howler doesn't reset the seek position
  //automatically at the end of a fade.
  audioInflate.on('fade', function(){ audioInflate.stop();});
  //200ms fade out time was what I thought sounded good.
  audioInflate.fade(0.1, 0, 200);
}

//Effect that creates many small bubble particles that are thrown out from a 
//center position
function effectBubblePop(container, positionX, positionY, radius, numberOfParticles){
  //Spread the particles evenly around a circle
  var thetaDivision = (2 * Math.PI) / numberOfParticles;

  for(var i = 0; i < numberOfParticles; i++){
    var tempBubble = createBubble(randomFloat(0.02, 0.04));

    //calculate a point at the edge of the radius of the circle
    var newParticalTheta = thetaDivision * i;
    var newParticalPositionX = positionX + radius * Math.cos(newParticalTheta);
    var newParticalPositionY = positionY + radius * Math.sin(newParticalTheta);
    //Generate a random distance from the center of the circle. This is so
    //they don't all start out at the same distance from the center.
    var randomDistance = randomFloat(0, radius);
    tempBubble.position.x = positionX + randomDistance * Math.cos(newParticalTheta);
    tempBubble.position.y = positionY + randomDistance * Math.sin(newParticalTheta);

    addPhysicsBubble(tempBubble, 0.05);
    //Add velocity to the current bubble.
    var directionX = newParticalPositionX - positionX;
    var directionY = newParticalPositionY - positionY;
    var magitude = Math.sqrt((directionX * directionX) + (directionY * directionY));
    var normalx = directionX / magitude;
    tempBubble.vx = normalx * 200;
    tempBubble.vy = -1 * randomFloat(70,200);
    container.addChild(tempBubble);
  }
}

//Add matterjs boarder walls to the play area.
function createPlayAreaWalls(){
  var matterWallDown  = Matter.Bodies.rectangle(320, 480, 640, 60,  { isStatic: true });
  var matterWallUp    = Matter.Bodies.rectangle(320, 0,   640, 80,  { isStatic: true });
  var matterWallLeft  = Matter.Bodies.rectangle(0,   240, 60,  480, { isStatic: true });
  var matterWallRight = Matter.Bodies.rectangle(640, 240, 60,  480, { isStatic: true });
  //Add a label so that we can identify what type of object they are later.
  matterWallDown.label = "wall";
  matterWallUp.label = "wall";
  matterWallLeft.label = "wall";
  matterWallRight.label = "wall";
  Matter.Composite.add(engine.world, [matterWallDown, matterWallUp, matterWallLeft, matterWallRight]);
}

//We don't want the enemies to move as a typical physics object. Update them every frame
//so that they always move in a straight line at a constant speed.
function updateKeepEnemysMoving(enemy){
  //Calculate the current direction vector.
  var mag = Math.sqrt((enemy.velocity.x * enemy.velocity.x) + (enemy.velocity.y * enemy.velocity.y));
  var normalx = enemy.velocity.x / mag;
  var normaly = enemy.velocity.y / mag;
  //Reset velocity every frame so that matterjs doesn't dampen the speed.
  Matter.Body.setVelocity(enemy, { x: (normalx * enemy.desiredSpeed), y: (normaly * enemy.desiredSpeed) });
  //Counteract gravity effect since we cant just disable it.
  Matter.Body.applyForce(enemy, {x: 0, y: 0}, {x: (-engine.gravity.x * engine.gravity.scale * enemy.mass), y: (-engine.gravity.y * engine.gravity.scale * enemy.mass)});
}

//If the user starts a new bubble, point the crab at the players pointer.
function updateCrabAttack(enemy){
  //If new user bubble
  if(lastExpand == false && curExpand == true){
     var localCoordsPosition = pixiApplication.renderer.plugins.interaction.mouse.global;
     //Get direction vector from crab to mouse pointer
     var directionX = localCoordsPosition.x - enemy.position.x;
     var directionY = localCoordsPosition.y - enemy.position.y;
     //Normalize the direction vector
     var mag = Math.sqrt((directionX * directionX) + (directionY * directionY));
     var normalx = directionX / mag;
     var normaly = directionY / mag;
     //Change the enemies direction
     Matter.Body.setVelocity(enemy, { x: (normalx * enemy.desiredSpeed), y: (normaly * enemy.desiredSpeed) });
  }
}

//The fish enemy will randomly change direction
function updateFishMovement(enemy){
  enemy.changeDirectionTimeout -= deltaTime;
  if(enemy.changeDirectionTimeout <= 0){
    //Generate a random new direction
    var randVal = Math.random() * (2 * Math.PI);
    var normalx = Math.cos(randVal);
    var normaly = Math.sin(randVal);
    Matter.Body.setVelocity(enemy, { x: (normalx * enemy.desiredSpeed), y: (normaly * enemy.desiredSpeed) });
    //Fish will change direction again in 1 to 5 seconds.
    enemy.changeDirectionTimeout = randomFloat(1, 5);
  }
}

//Make the sea mine flash red.
function updateSeaMine(enemy){
  enemy.alarmTimeout -= deltaTime;
  if(enemy.alarmTimeout <= 0){
    if(enemy.alarmState == false){
      enemy.pixiCallback.tint = 0xFF0000;
      enemy.alarmState = true;
    } else {
      enemy.pixiCallback.tint = 0xFFFFFF;
      enemy.alarmState = false;
    }
    enemy.alarmTimeout = 0.5;
  }
}

//Update the pixi object position to the matter object position 
function updatePixiPosition(matterObject){
  matterObject.pixiCallback.position.x = matterObject.position.x;
  matterObject.pixiCallback.position.y = matterObject.position.y;
}

//Rotate the pixi sprite in the direction it is currently traveling. Used for the
//fish and crab enemy.
function updateRotatePixiSpriteToTravelDirection(matterObject){
  var mag = Math.sqrt((matterObject.velocity.x * matterObject.velocity.x) + (matterObject.velocity.y * matterObject.velocity.y));
  normalx = matterObject.velocity.x / mag;
  normaly = matterObject.velocity.y / mag;
  matterObject.pixiCallback.rotation = Math.atan2(normaly,normalx);
}

//Mark enemies as static to stop matterjs from moving them.
function pauseEnemys(currentObject){
  if(currentObject.label == "enemy"){
    currentObject.isStatic = true;
  }
}

//Resume enemy movement
function unpauseEnemys(currentObject){
  if(currentObject.label == "enemy"){
    currentObject.isStatic = false;
  }
}

//Per frame update of play objects.
function updatePlayObject(currentObject, index){
  //Enemies
  if(currentObject.label == "enemy"){
    if(currentObject.enemyType == "spike_ball"){
      updateKeepEnemysMoving(currentObject);
      currentObject.pixiCallback.rotation += currentObject.pixiCallback.rotationRate * deltaTime;
      updatePixiPosition(currentObject);
      currentObject.lastUpdateACollision = false;
    }
    if(currentObject.enemyType == "crab"){
      updateKeepEnemysMoving(currentObject);
      updateCrabAttack(currentObject);
      updateRotatePixiSpriteToTravelDirection(currentObject);
      updatePixiPosition(currentObject);
    }
    if(currentObject.enemyType == "fish"){
      updateKeepEnemysMoving(currentObject);
      updateFishMovement(currentObject);
      updateRotatePixiSpriteToTravelDirection(currentObject);
      updatePixiPosition(currentObject);
    }
    if(currentObject.enemyType == "mine"){
      updateKeepEnemysMoving(currentObject);
      updateSeaMine(currentObject);
      updatePixiPosition(currentObject);
    }
  }
  //Bubbles in play area.
  if(currentObject.label == "bubble"){
    updatePixiPosition(currentObject);
  }
  //Current player bubble
  if(currentObject.label == "player_bubble"){
    updatePixiPosition(currentObject);
  }
}

class Bubble_Scene_Play extends Bubble_Scene {
  constructor(parent) {
    super(parent);
    this.gameAirLeft = 50;
    this.gameBubblesLeft = 50;
    this.gameTanksLeft = 2;
    this.gameFilledVolume = 0.0;
    this.gameLevel = 1;
    this.gameTotalArea = 0;
    this.gameRoundTime = 0;
    this.gameTotalScore = 0;
    this.gameLevelEnemies = 0;
    this.levelScore = 0;
    this.playAreaX = 30;
    this.playAreaY = 40
    this.playWidth = 580;
    this.playHeight = 410;
    //Currently inflating bubble scale.
    this.curScale = MIN_BUBBLE_SCALE;
    this.matterCurrentBubble = null;
    //Update text when true
    this.textDirty = false;
    //Container for effects that don't interact with play objects.
    this.effectContainer = new PIXI.Container();
    //Play bubbles and enemies.
    this.playContainer = new PIXI.Container();
    //In tutorial mode when true.
    this.tutorial = false;
    
    //Register an event handler to handle matterjs object collisions. 
    Matter.Events.on(engine, 'collisionStart', this.collisionEventHandler.bind(this));

    createPlayAreaWalls();
    
    //Flip gravity so that it act like buoyancy.
    engine.gravity.y = -1;

    //Background
    this.spriteBackground = new PIXI.Sprite(PIXI.loader.resources.texBackground01.texture);
	  this.spriteBackground.scale = new PIXI.Point(0.32, 0.32);//TODO: Just resize this image
	  this.spriteBackground.tint = 0x009AC9;
    addWaterTinting(this.spriteBackground);
    //Using the background sprite to handle user interaction
    this.spriteBackground.interactive = true;
    this.spriteBackground.mousedown = this.interactMouseDown;
    this.spriteBackground.mouseup = this.interactMouseUp;
    //Also have to check if the mouse button is release while off the canvas.
    this.spriteBackground.mouseupoutside = this.interactMouseUp;
	  this.pixiStage.addChild(this.spriteBackground);
    
    //Top of screen UI.
    this.buttonAudio2 = createAudioButton(this.buttonClickMutePlay, 0.13);
    this.buttonAudio2.position = MUTE_BUTTON_POSITION;
	  this.pixiStage.addChild(this.buttonAudio2);

    this.textAirLeft = pixiTextHelper('Air Remaining: ' + this.gameAirLeft.toFixed(2), styleGeneralText1, AIR_REMAINING_TEXT_POSITION, this.pixiStage);
    this.textTanksLeft = pixiTextHelper('Tanks Remaining: ' + this.gameTanksLeft.toFixed(0), styleGeneralText1, TANKS_LEFT_TEXT_POSITION, this.pixiStage);
    this.textVolumeFilled = pixiTextHelper('Volume Filled: ' + this.gameFilledVolume.toFixed(2), styleGeneralText1, VOLUME_TEXT_POSITION, this.pixiStage);
    
    //Bottom of screen UI
    this.textLevel = pixiTextHelper('Level: ' + this.gameLevel, styleScoreText, LEVEL_TEXT_POSITION, this.pixiStage);
    this.textScore = pixiTextHelper('Score: ' + this.gameTotalScore, styleScoreText, SCORE_TEXT_POSITION, this.pixiStage);

    //Add a rope border around the play area.
    var ropePlayBorder = pixiRopeBorder({x: this.playAreaX, y: this.playAreaY}, {x: this.playWidth, y: this.playHeight}, 5, 5);
    this.pixiStage.addChild(ropePlayBorder);

    //Calculate the total area of the play area.
    this.gameTotalArea = this.playWidth * this.playHeight;

    this.pixiStage.addChild(this.playContainer);
    this.pixiStage.addChild(this.effectContainer);
  }
  
//BUG:"Uncaught TypeError: this.matterCurrentBubble is undefined" multi-hits when close together? not a game braking bug
  collisionEventHandler(event){
    var pairs = event.pairs;
    //For each pair
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];
      var labelA = pair.bodyA.label;
      var labelB = pair.bodyB.label;
    
      if(labelA == "player_bubble" || labelB == "player_bubble"){
        //Currently inflating bubble collision with an enemy.
        if(labelA == "enemy" || labelB == "enemy"){
          fadeStopInflate();
          audioPop01.play();
          effectBubblePop(this.effectContainer, this.matterCurrentBubble.position.x, this.matterCurrentBubble.position.y, this.matterCurrentBubble.pixiCallback.radius, 10);
          //Remove the player bubble from pixijs and matterjs
          this.playContainer.removeChild(this.matterCurrentBubble.pixiCallback);
          Matter.Composite.remove(engine.world, this.matterCurrentBubble);
          this.matterCurrentBubble = undefined;
          //Lose a life
          this.gameTanksLeft--;
          //If we are in tutorial mode then make it so that the user can't lose.
          if(this.tutorial == true){
            if(this.gameTanksLeft < 1){
              this.gameTanksLeft = 3;
            }
          }
          //Update text
          this.textDirty = true;
          //reset expansion into the waiting state
          curExpand = false;
          lastExpand = false;
          //Check if the enemy was a sea mine. If it is then spawn a bunch of
          //spikeballs.
          if(labelA == "enemy"){
            var enemyBody = pair.bodyA;
          } else {
            var enemyBody = pair.bodyB;
          }
          if(enemyBody.enemyType == "mine"){
            //Remove the sea mine sprite and matterjs object
            this.playContainer.removeChild(enemyBody.pixiCallback);
            Matter.Composite.remove(engine.world, enemyBody);
            this.addOpponent("spike_ball", enemyBody.position.x, enemyBody.position.y, 5);
            this.addOpponent("spike_ball", enemyBody.position.x, enemyBody.position.y, 4);
            this.addOpponent("spike_ball", enemyBody.position.x, enemyBody.position.y, 3);
            this.addOpponent("spike_ball", enemyBody.position.x, enemyBody.position.y, 3);
          }
        }
        //If the player bubble collided with another bubble then just stop
        //inflation.
        if(labelA == "bubble" || labelB == "bubble"){
          curExpand = false;
          lastExpand = true;
        }
      }

      if(labelA == "enemy" || labelB == "enemy"){
        //Run the same code over both bodies of the pair
        for(var currentEnemy of [pair.bodyA, pair.bodyB]){
          if(currentEnemy.label == "enemy"){
          
            //Give player bonus points if they trap an enemy in a small space.
            //Detection of trapped enemies is detected using a fighting up-down
            //counter. If time between collisions is below a threshold then the
            //counter is incremented. If above a threshold then the counter is
            //decremented. If the counter reaches high enough to a preset value
            //then the enemy is considered trapped.

            //Currently only handling an enemy being trapped once. If it's already
            //been trapped, skip it.
            if(currentEnemy.wasTrapped == false){
              var currentTime = Date.now();
              //Check it's not the first collision
              if(currentEnemy.lastCollisionTime != 0){
                //Time in milliseconds since last collision
                var tempDeltaLast = currentTime - currentEnemy.lastCollisionTime;
                if(tempDeltaLast <= TRAP_TIME){
                  currentEnemy.trapCount++;
                  if(currentEnemy.trapCount >= TRAP_COUNT){
                    currentEnemy.wasTrapped = true;
                    this.giveBonus("ENEMY TRAPPED +5 POINTS", 5);
                  }
                } else {
                  //Decay the trap counter a little faster on non-frequent
                  //collisions
                  currentEnemy.trapCount -= 3;
                  if(currentEnemy.trapCount < 0){
                    currentEnemy.trapCount = 0;
                  }
                }
              }
              currentEnemy.lastCollisionTime = currentTime;
            }
          }
        }
      }
    }
  }

  //Per frame runner to update text elements if they have changed.
  updateText(){
    if(this.textDirty == true){
      this.textAirLeft.text = 'Air Remaining: ' + this.gameBubblesLeft;
      this.textTanksLeft.text = 'Tanks Left: ' + this.gameTanksLeft.toFixed(0);
      this.textVolumeFilled.text = 'Volume Filled: ' + ((this.gameFilledVolume / this.gameTotalArea) * 100).toFixed(1) + "%";
      this.textLevel.text = 'Level: ' + this.gameLevel;
      this.textScore.text = 'Score: ' + (this.gameTotalScore + this.levelScore);
      this.textDirty = false;
    }
  }

  //Add an enemy to the play area.
  addOpponent(enemyType, locationX, locationY, desiredSpeed){
    //PixiJS object
    switch(enemyType){
      case "spike_ball":
        var tempOpponent = createOpponentSpikeBall(0.15);
        tempOpponent.rotationRate = 1;
        break;
      case "crab":
        var tempOpponent = createOpponentCrab(0.32);
        break;
      case "fish":
        var tempOpponent = createOpponentFish(0.25);
        break;
      case "mine":
        var tempOpponent = createOpponentSeaMine(0.25);
        break;
    }
    tempOpponent.position = {x: locationX, y: locationY};
    tempOpponent.radius = (tempOpponent.getBounds().width * 0.5) / 2;
    this.playContainer.addChild(tempOpponent);

    //Matterjs object
    var matterCircle = Matter.Bodies.circle(locationX, locationY, tempOpponent.radius);
    matterCircle.desiredSpeed = desiredSpeed;
    matterCircle.label = "enemy";
    matterCircle.enemyType = enemyType;
    //Per enemy type matterjs variables
    switch(enemyType){
      case "spike_ball":
        break;
      case "crab":
        break;
      case "fish":
        matterCircle.changeDirectionTimeout = Math.floor(randomFloat(1, 5));
        break;
      case "mine":
        matterCircle.alarmTimeout = 0.5;
        matterCircle.alarmState = false;
        break;
    }
    //Slapping on a whole bunch of matterjs options to try to get matterjs to
    //stop dampening the velocity.
    matterCircle.friction = 0;
    matterCircle.frictionAir = 0;
    matterCircle.frictionStatic = 0;
    matterCircle.restitution = 1;
    matterCircle.inertia = Infinity;
    Matter.Body.setMass(matterCircle, 0.0001);
    //Trap bonus variables
    matterCircle.lastCollisionTime = 0;
    matterCircle.trapCount = 0;
    matterCircle.wasTrapped = false;
    //Get the enemy moving in a random direction. The per frame runners will
    //set the enemy to the correct speed.
    Matter.Body.setVelocity(matterCircle, { x: randomFloat(-0.5, 0.5), y: randomFloat(-0.5, 0.5) });
    matterCircle.pixiCallback = tempOpponent;
    Matter.Composite.add(engine.world, matterCircle);
  }

  //Remove all play objects from the play area.
  removeAllPlayObjects(){
    //Make sure the enemies aren't marked as static so that we can call
    //Matter.Composite.clear without clearing the walls.
    this.unpauseEnemies();
    //Remove all play objects
    var tempBodyList = Matter.Composite.allBodies(engine.world);
    //For each body in the body list.
    for(var i = 0; i <tempBodyList.length; i++){
      if(tempBodyList[i].label == "bubble" || tempBodyList[i].label == "enemy"){
        tempBodyList[i].pixiCallback.parent.removeChild(tempBodyList[i].pixiCallback);
        tempBodyList[i].pixiCallback.destroy();
        tempBodyList[i].pixiCallback = null;
      }
    }
    Matter.Composite.clear(engine.world, true);
  }

  //Set the game level
  setLevel(level){
    //reset all play variables
    this.levelScore = 0;
    this.curScale = MIN_BUBBLE_SCALE;
    this.matterCurrentBubble = null;
    //Update text next frame
    this.textDirty = true;
    this.gameRoundTime = 0;
    //Set the inflation state to waiting.
    curExpand = false;
    lastExpand = false;

    this.removeAllPlayObjects();

    //Remove everything on the effects layer
    var tempChildEffects = this.effectContainer.removeChildren();
    for(var i = 0; i < tempChildEffects.length; i++){
      tempChildEffects[i].destroy();
    }

    //set play variables
    var levelSelection;
    //Select the next level in the list. If the user has progressed past the last
    //level then select a random level. Make sure it isn't the same one the user 
    //just played.
    if(level <= levelList.length){
      levelSelection = level - 1;
    } else {
      do {
        levelSelection = Math.floor(randomFloat(2, levelList.length));
      } while (levelSelection == this.gameLevel)
    }
    var selectedLevel = levelList[levelSelection];
    this.gameBubblesLeft = levelList[levelSelection].playerBubbles;
    this.gameTanksLeft = selectedLevel.playerTanks;
    this.gameFilledVolume = 0.0;
    this.gameLevel = level;

    //add enemies
    this.gameLevelEnemies = 0;
    for(var currentEnemyType of levelList[levelSelection].enemyList){
      for(var i = 0; i < currentEnemyType.enemyNumber; i++){
        //Find a random point in the play area.
        var tempMinX = this.playAreaX + 15;
        var tempMaxX = this.playAreaX + this.playWidth - 15;
        var tempMinY = this.playAreaY + 15;
        var tempMaxY = this.playAreaY + this.playHeight - 15;
        var tempX = Math.floor(randomFloat(tempMinX, tempMaxX));
        var tempY = Math.floor(randomFloat(tempMinY, tempMaxY));
        //Generate a random speed in the given desired range.
        var tempSpeed = randomFloat(currentEnemyType.enemyMinSpeed, currentEnemyType.enemyMaxSpeed);
        this.addOpponent(currentEnemyType.enemyType, tempX, tempY, tempSpeed);
        this.gameLevelEnemies++;
      }
    }
  }

  //Check if a point is in the play area.
  isPointInPlayArea(position){
    //Check X min
    if(position.x < this.playAreaX){
      return false;
    }
    //Check X max
    if(position.x >= this.playAreaX + this.playWidth){
      return false;
    }
    //Check Y min
    if(position.y < this.playAreaY){
      return false;
    }
    //Check Y max
    if(position.y >= this.playAreaY + this.playHeight){
      return false;
    }
    //Passed min/max tests. Point is in area.
    return true;
  }

  //Force a point into the play area if it is outside the play area.
  forcePointIntoPlayArea(position, offsetToForce){
    var tempPoint;
    tempPoint.x = position.x;
    tempPoint.y = position.y;

    //Check X min
    if(position.x < this.playAreaX){
      tempPoint.x = this.playAreaX + offsetToForce;
    }
    //Check X max
    if(position.x >= this.playAreaX + this.playWidth){
      tempPoint.x = this.playAreaX + this.playWidth - offsetToForce;
    }
    //Check Y min
    if(position.y < this.playAreaY){
      tempPoint.y = this.playAreaY + offsetToForce;
    }
    //Check Y max
    if(position.y >= this.playAreaY + this.playHeight){
      tempPoint.y = this.playAreaY + this.playHeight - offsetToForce;
    }

    return tempPoint;
  }

  //Force a circle into the play area if it is outside the play area
  forceSphereIntoPlayArea(position, radius){
    var tempPosition = {x:position.x, y:position.y};

    //Check X min
    if((position.x - radius) < this.playAreaX){
      tempPosition.x = this.playAreaX + radius;
    }
    //Check X max
    if((position.x + radius) >= (this.playAreaX + this.playWidth)){
      tempPosition.x = this.playAreaX + this.playWidth - radius;
    }
    //Check Y min
    if((position.y - radius) < this.playAreaY){
      tempPosition.y = this.playAreaY + radius;
    }
    //Check Y max
    if((position.y + radius) >= (this.playAreaY + this.playHeight)){
      tempPosition.y = this.playAreaY + this.playHeight - radius;
    }

    return tempPosition;
  }

  //Check to see if the given point is inside of a matterjs bubble.
  isPointInPlayBubble(point){
    var tempBodyList = Matter.Composite.allBodies(engine.world);
    //For each body in the body list.
    for(var i = 0; i <tempBodyList.length; i++){
      if(tempBodyList[i].label == "bubble"){
        //distance between two points = sqrt((x2-x1)^2 + (y2-y1)^2)
        var tempDistance = Math.sqrt(Math.pow((point.x - tempBodyList[i].position.x),2) + Math.pow((point.y - tempBodyList[i].position.y), 2))
        //If the distance from the point to the center of the bubble is less
        //than the radius of the bubble then the point is inside the bubble.
        if(tempDistance < tempBodyList[i].pixiCallback.radius){
          return true;
        }
      }
    }
    return false;
  }

  pauseEnemies(){
    Matter.Composite.allBodies(engine.world).forEach(pauseEnemys);
  }

  unpauseEnemies(){
    Matter.Composite.allBodies(engine.world).forEach(unpauseEnemys);
  }

  //Run a bonus effect and give extra points to a player.
  giveBonus(text, points){
    this.levelScore += points;
    this.textDirty = true;
    var textBonus = new PIXI.Text(text, styleScoreText);
    //Origin at bottom center of text 
	  textBonus.anchor = {x: 0.5, y: 1.0};
    textBonus.position = {x: (gameWidth / 2), y:(gameHeight * 0.98)};
    addPhysicsBubble(textBonus, 0.85);
    textBonus.vy = -100;
    this.effectContainer.addChild(textBonus);
    audioBonus.volume(0.5);
    audioBonus.play();
  }

  //Check to make sure the mute button texture is in the right state.
  checkMute(button){
    if(audioMute == true){
      if(button.texture != PIXI.loader.resources.buttonAudioOff.texture){
        button.setTexture(PIXI.loader.resources.buttonAudioOff.texture);
      }
    } else {
      if(button.texture != PIXI.loader.resources.buttonAudioOn.texture){
        button.setTexture(PIXI.loader.resources.buttonAudioOn.texture);
      }
    }
  }

  //On mute button click
  buttonClickMutePlay(){
    if(audioMute == false){
      audioMute = true;
      Howler.mute(true);
    } else {
      audioMute = false;
      Howler.mute(false);
      audioPop01.play();
    }
  }

  interactMouseDown(){
    curExpand = true;
  }

  interactMouseUp(){
    curExpand = false;
  }

  //Called every animation frame.
  update(){
    //Get the mouse position 
	  var localCoordsPosition = pixiApplication.renderer.plugins.interaction.mouse.global;

    this.gameRoundTime += deltaTime;
    
    //Make sure the mute button is in the correct state.
    this.checkMute(this.buttonAudio2);

    //New player bubble
    if(lastExpand == false && curExpand == true){ 
      if(this.gameBubblesLeft > 0){
        //Make sure the user is trying to start a bubble in a valid area.
        if(this.isPointInPlayArea(localCoordsPosition) == true && this.isPointInPlayBubble(localCoordsPosition) == false){
          //Add a bubble at the minimum scale
          this.curScale = MIN_BUBBLE_SCALE;
    	    var tempBubble = createBubble(this.curScale);
          tempBubble.radius = tempBubble.getBounds().width / 2;
          this.matterCurrentBubble = Matter.Bodies.circle(localCoordsPosition.x, localCoordsPosition.y, tempBubble.radius);
          this.matterCurrentBubble.pixiCallback = tempBubble;
          this.matterCurrentBubble.label = "player_bubble";
          this.playContainer.addChild(tempBubble);
          Matter.Composite.add(engine.world, this.matterCurrentBubble);
          audioInflate.volume(0.1);
          //Slow down the inflation audio so that it lasts as long as the largest
          //possible bubble.
          audioInflate.rate(0.5);
          audioInflate.play();
        } else {
          //Waiting state
          curExpand = false;
          lastExpand = false;
        }
        
      }
    }
    //Continue blowing player bubble
	  if(lastExpand == true && curExpand == true){ 
  	    var tempPixiBubble = this.matterCurrentBubble.pixiCallback;
        //Increase the size of the bubble.
    	  this.curScale += 0.005;
    	  tempPixiBubble.scale.x = this.curScale;
    	  tempPixiBubble.scale.y = this.curScale;
        tempPixiBubble.radius = tempPixiBubble.getBounds().width / 2;
        
        //Make sure the mouse position with the new bubble radius is still in the
        //play area.
        localCoordsPosition = this.forceSphereIntoPlayArea(localCoordsPosition, tempPixiBubble.radius)
    	  //Remove the old matterjs circle and replace it with a slightly larger one.
        Matter.Composite.remove(engine.world, this.matterCurrentBubble);
        this.matterCurrentBubble = Matter.Bodies.circle(localCoordsPosition.x, localCoordsPosition.y, tempPixiBubble.radius);
        this.matterCurrentBubble.pixiCallback = tempPixiBubble;
        this.matterCurrentBubble.label = "player_bubble";
        Matter.Composite.add(engine.world, this.matterCurrentBubble);
        //Stop expansion if the bubble is at its maximum size.
        var tempBubbleDiameter = tempPixiBubble.radius * 2;
        if(tempBubbleDiameter >= this.playHeight || tempBubbleDiameter >= this.playWidth){
          lastExpand = true;
          curExpand = false;
        }
    }

    //Stop blowing player bubble
    if(lastExpand == true && curExpand == false){ 
      //Stop the inflation sound.
      fadeStopInflate();
      

    	this.gameBubblesLeft = this.gameBubblesLeft - 1;
      this.textDirty = true;

      //If matterCurrentBubble is not undefined then user stopped inflating
      //a valid bubble.
      if(this.matterCurrentBubble != undefined){
        //Bloop sound to signify a successful bubble.
        audioBloop.volume(0.4);
        audioBloop.play();

        //If the player bubble is super large then give the player a bonus.
        if(this.matterCurrentBubble.area > 130100){
          this.giveBonus("MEGA BUBBLE +10 POINTS", 10);
        }
        
        //Update the total filled volume with the size of the new player bubble.
        this.gameFilledVolume = this.gameFilledVolume + this.matterCurrentBubble.area;
    	  //Change the label to just be a regular bubble.
        this.matterCurrentBubble.label = "bubble";
        //Stop tracking this bubble
    	  this.matterCurrentBubble = undefined;
      }
    }

    this.updateText();
    updatePhysics(this.pixiStage); 
    updatePhysics(this.effectContainer);

    //Check play conditions
    //player has filled enough of the play area to complete the level
    if(((this.gameFilledVolume / this.gameTotalArea) * 100) >= 66 && this.tutorial == false){
      //Pause this scene but don't hide it.
      this.active = false;
      //Set the inflation state to waiting.
      curExpand = false;
      lastExpand = false;
      
      //Calculate score
      //points for time (min time 6 seconds, max time 2 minutes)
      //TODO: remove hard coded values for time. try to come up with something better
      //If it took the player more then 2 minutes to finish then they don't get
      //any time based points.
      if(this.gameRoundTime <= 120){
        //score = "max allowable points" * "0 to 1 range between the minimum time and maximum allowed time to complete a level"
        //I just guessed that the fastest that a level could be completed was 
        //6 seconds.
        this.levelScore += 100 * (1 - ((this.gameRoundTime - 6)  / 120) );
        //Don't care about fractional points. Drop them.
        this.levelScore = Math.trunc(this.levelScore);
      }
      //points for lives left
      this.levelScore += this.gameTanksLeft * 10;
      //points for bubbles left
      this.levelScore += this.gameBubblesLeft * 1;
      //points for difficulty
      this.levelScore += this.gameLevelEnemies * 5;
      this.gameTotalScore += this.levelScore;

      //Update and show the next level scene.
      sceneNextLevel.setTime(secondsToDisplyString(this.gameRoundTime));
      sceneNextLevel.setBubblesLeft(this.gameBubblesLeft.toString());
      sceneNextLevel.setTanksLeft(this.gameTanksLeft.toString());
      sceneNextLevel.setTotalScore(this.gameTotalScore.toString());
      sceneNextLevel.setLevelScore(this.levelScore.toString());
      audioPassedLevel.volume(0.5);
      audioPassedLevel.play();
      sceneNextLevel.showStage();
  }
  
  //player has run out of tanks or bubbles
  if(this.gameTanksLeft < 1 || this.gameBubblesLeft < 1){
    //Update and show the game over scene.
    sceneGameOver.setLevelsCompleted(scenePlay.gameLevel - 1);
    sceneGameOver.setTotalScore(this.gameTotalScore + this.levelScore);
    sceneGameOver.checkAndSetHighScore(this.gameTotalScore + this.levelScore);
    this.active = false;
    curExpand = false;
    lastExpand = false;
    audioGameOver.volume(0.5);
    audioGameOver.play();
    sceneGameOver.showStage();
    this.gameTotalScore = 0;
  }

  //Run per frame updaters for all play objects
  Matter.Composite.allBodies(engine.world).forEach(updatePlayObject);
  
  lastExpand = curExpand;

  removeOldSprites(this.playContainer);
  removeOldSprites(this.effectContainer);
  }
};