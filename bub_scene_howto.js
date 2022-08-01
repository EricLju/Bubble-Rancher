//bub_scene_howto.js - A tutorial on how to play the game. The tutorial is split
//into multiple frames. Only one frame is visible at a time. The user clicks
//buttons to change frames.

class Bubble_Scene_HowTo extends Bubble_Scene {
  constructor(parent) {
    super(parent);
    //Current frame that is visible.
    this.currentTutorialFrame = 0;
    //Reset play variables
    scenePlay.setLevel(1);
    //Remove enemies spawned by setLevel
    scenePlay.removeAllPlayObjects();

    //Title text
    this.containerHowToTitle = buildBubbleText("Tutorial");
    this.containerHowToTitle.pivot.x = this.containerHowToTitle.width / 2;
    this.containerHowToTitle.scale = {x: 0.8, y:0.8}
    this.containerHowToTitle.position = {x: (gameWidth / 2), y: 325};
    
    this.numberTutorialFrames = 4;
    //Tutorial will act like a flipbook. Each page/frame will be on its own
    //pixi container.
    this.tutFrame0 = new PIXI.Container(); //Blow bubble
    this.tutFrame1 = new PIXI.Container(); //Avoid enemies
    this.tutFrame2 = new PIXI.Container(); //Release bubbles
    this.tutFrame3 = new PIXI.Container(); //Goal
    //Any frame other then the first one will start invisible.
    this.tutFrame1.visible = false;
    this.tutFrame2.visible = false;
    this.tutFrame3.visible = false;

    this.pixiStage.addChild(this.tutFrame0);
    this.pixiStage.addChild(this.tutFrame1);
    this.pixiStage.addChild(this.tutFrame2);
    this.pixiStage.addChild(this.tutFrame3);

    //Buttons
    this.buttonMenu = createButton("Main Menu", this.buttonClickMainMenuHowTo.bind(this), styleSmallTitle);
    this.buttonMenu.position = {x: (gameWidth * 0.25), y: (gameHeight - 70)};
	  this.pixiStage.addChild(this.buttonMenu);

    this.buttonBack = createButton("Back", this.buttonClickPreviousTutorial.bind(this), styleSmallTitle);
    this.buttonBack.position = {x: (gameWidth * 0.53), y: (gameHeight - 70)};
    this.buttonBack.backgroundSprite.tint = TINT_BUTTON_INACTIVE;
	  this.pixiStage.addChild(this.buttonBack);

    this.buttonNext = createButton("Next", this.buttonClickNextTutorial.bind(this), styleSmallTitle);
    this.buttonNext.position = {x: (gameWidth * 0.75), y: (gameHeight - 70)};
	  this.pixiStage.addChild(this.buttonNext);

    //Initialize each frame in its own function
    this.initTutorialFrame0();
    this.initTutorialFrame1();
    this.initTutorialFrame2();
    this.initTutorialFrame3();
    
    //Add the title on top of the tutorial frames.
    this.pixiStage.addChild(this.containerHowToTitle);

    //Keep track of if we already called showScene on scenePlay for the tutorial.
    this.showing = false;
  }
  
  initTutorialFrame0(){
    var textTutorial = new PIXI.Text(
      'Click and hold the right\n' +
      'mouse button inside the\n' +
      'roped play area to start\n' +
      'blowing a bubble.', styleSmallTitle);
		textTutorial.position = {x: 60, y: 60};
    this.tutFrame0.addChild(textTutorial);

    //A bubble inflating demo.
    this.scalingBubble = createBubble(0.1);
    this.scalingBubble.position = {x: 470, y: 190};
	  this.tutFrame0.addChild(this.scalingBubble);
  	var tempScuba = createScubaTank(0.2);
    //Rotate about 16 degrees to match the mouse pointer rotation.
    tempScuba.rotation = toRadians(-16);
    tempScuba.position = this.scalingBubble.position;
    this.tutFrame0.addChild(tempScuba);

    var tempMouse = createMouseLeftClick(1.2);
    tempMouse.position = {x:200, y:250};
    this.tutFrame0.addChild(tempMouse);

    //Show the user that they should be clicking in the play area by highlighting
    //the areas outside the play area in red.
    var graphicsRedFill = new PIXI.Graphics();
    graphicsRedFill.beginFill(0xff0000);
    graphicsRedFill.alpha = 0.5;
    var leftRightOffset = 25;
    var topOffset = 35;
    var bottomOffset = 25;
    //left
    graphicsRedFill.drawRect(0, 0, leftRightOffset, gameHeight);
    //right
    graphicsRedFill.drawRect((gameWidth - leftRightOffset), 0, gameWidth, gameHeight);
    //top
    graphicsRedFill.drawRect(leftRightOffset, 0, (gameWidth - (leftRightOffset * 2)), topOffset);
    //bottom
    graphicsRedFill.drawRect(leftRightOffset, (gameHeight - bottomOffset), (gameWidth - (leftRightOffset * 2)), bottomOffset);
    this.tutFrame0.addChild(graphicsRedFill);
  }

  initTutorialFrame1(){
    var textTutorial = new PIXI.Text(
      'Avoid enemies while your\n' + 
      'bubble is expanding.\n\n' +
      'You will lose a tank if you\n' +
      'hit an enemy while your\n' +
      'bubble is expanding.', styleSmallTitle);
		textTutorial.position = {x: 50, y: 110};
  	this.tutFrame1.addChild(textTutorial);
    //Draw a red caution circle around enemies to imply they are bad guys.
    var graphicsRedCircle = new PIXI.Graphics();
    graphicsRedCircle.lineStyle(15, 0xFF0000, 0.5);
    graphicsRedCircle.beginFill(0x0, 0);
    graphicsRedCircle.drawCircle(465, 190, 110);
    graphicsRedCircle.endFill();
    this.tutFrame1.addChild(graphicsRedCircle);
    //Arrow pointing at the Tanks Left: text
    createArrow(0.4, {x:300, y:30}, 100, this.tutFrame1);
  }

  initTutorialFrame2(){
    var textTutorial = new PIXI.Text(
      'Release the right mouse\n' +
      'button to stop blowing\n' +
      'the current bubble.\n\n' +
      'Every bubble will use one Air Remaining point.\n\n' + 
      'The bubble will now be safe from enemies and the\n' +
      'play Volume Filled will be updated.\n', styleSmallTitle);
		textTutorial.anchor = {x: 0.5, y:0};
    textTutorial.position = {x: (gameWidth/2), y: 60};
  	this.tutFrame2.addChild(textTutorial);
    //Arrows pointing at Air Remaining and Volume Filled.
    createArrow(0.4, {x:120, y:30}, 90, this.tutFrame2);
    createArrow(0.4, {x:530, y:30}, 90, this.tutFrame2);
  }

  initTutorialFrame3(){
    //Some green and red rectangles to show the user how much they have to fill up.
    var graphicsGreenFill = new PIXI.Graphics();
    graphicsGreenFill.beginFill(0x00FF00);
    graphicsGreenFill.alpha = 0.5;
    graphicsGreenFill.drawRect(scenePlay.playAreaX, scenePlay.playAreaY, (scenePlay.playWidth * 0.66), scenePlay.playHeight);
    graphicsGreenFill.beginFill(0xFF0000);
    graphicsGreenFill.alpha = 0.3;
    graphicsGreenFill.drawRect((scenePlay.playAreaX + (scenePlay.playWidth * 0.66)), scenePlay.playAreaY, scenePlay.playWidth * 0.34, scenePlay.playHeight);
    this.tutFrame3.addChild(graphicsGreenFill);

    var textTutorial = new PIXI.Text(
      'Fill %66 of the play area\n' +
      'to pass the level.\n\n' +
      'If you run out of Tanks Left or Air Remaining\n' +
      'then the game will end.\n\n' + 
      'The goal is to get as high of a \n' +
      'score as possible.\n', styleSmallTitle);
    textTutorial.anchor = {x: 0.5, y:0};
		textTutorial.position = {x: (gameWidth / 2), y: 60};
  	this.tutFrame3.addChild(textTutorial);
    
    //arrow pointing to the volume filled text.
    createArrow(0.4, {x: 530, y: 30}, 100, this.tutFrame3);
  }

  //On main menu button click
  buttonClickMainMenuHowTo(mouseData){
    audioPop01.play();
    //Not showing the tutorial play area anymore
    this.showing = false;
    sceneHowTo.hideStage();
    scenePlay.hideStage();
    //Turn off tutorial mode
    scenePlay.tutorial = false;
    sceneMainMenu.showStage();
  }

  //On button previous click. Cycle to the previous tutorial frame.
  buttonClickPreviousTutorial(){
    //If we are already at the first frame, do nothing.
    if(this.currentTutorialFrame == 0){
      return;
    }
    audioPop01.play();
    //Every change in frame, reset all play variables.
    scenePlay.setLevel(1);
    scenePlay.removeAllPlayObjects();
    this.setTutorialFrame(this.currentTutorialFrame, --this.currentTutorialFrame);
  }

  //On button next click. Cycle to the next tutorial frame.
  buttonClickNextTutorial(){
    //If we are already at the last frame, do nothing.
    if(this.currentTutorialFrame == (this.numberTutorialFrames - 1)){
      return;
    }
    audioPop01.play();
    //Every change in frame, reset all play variables.
    scenePlay.setLevel(1);
    scenePlay.removeAllPlayObjects();
    this.setTutorialFrame(this.currentTutorialFrame, ++this.currentTutorialFrame);
  }
 
  //Run entry/exit code when the tutorial frame is switched.
  setTutorialFrame(lastFrameNumber, newFrameNumber){
    //run on Exiting a frame
    switch(lastFrameNumber){
      case 0:
        //Not on the first frame. Back button now active
        this.buttonBack.backgroundSprite.tint = TINT_BUTTON_NONE;
        this.tutFrame0.visible = false;
      break;
      case 1:
        this.tutFrame1.visible = false;
      break;
      case 2:
        this.tutFrame2.visible = false;
      break;
      case 3:
        this.tutFrame3.visible = false;
        //Not on the last frame. Next button now active.
        this.buttonNext.backgroundSprite.tint = TINT_BUTTON_NONE;
      break;
    }
    //Run on entry to a frame
    switch(newFrameNumber){
      case 0:
        //First frame. Can't go back any further. Make the back button inactive.
        this.buttonBack.backgroundSprite.tint = TINT_BUTTON_INACTIVE;
        this.tutFrame0.visible = true;
      break;
      case 1:
        //Add some enemies to the scene. Enemies are placed in a diamond around
        //a center point.
        var centerPosition = {x: 465, y: 190}
        var offset = 60;
        scenePlay.addOpponent("spike_ball", centerPosition.x, centerPosition.y - offset, 0.001);
        scenePlay.addOpponent("fish", centerPosition.x - offset, centerPosition.y, 0.001);
        scenePlay.addOpponent("crab", centerPosition.x + offset, centerPosition.y, 0.001);
        scenePlay.addOpponent("mine", centerPosition.x, centerPosition.y + offset, 0.001);
        scenePlay.pauseEnemies();
        this.tutFrame1.visible = true;
      break;
      case 2:
        this.tutFrame2.visible = true;
      break;
      case 3:
        this.tutFrame3.visible = true;
        //On the last frame. Make the next button inactive.
        this.buttonNext.backgroundSprite.tint = TINT_BUTTON_INACTIVE;
      break;
    }
  }

  //Called every animation frame.
  update(){
    //Only call showStage once on tutorial entry.
    if(this.showing == false){
      scenePlay.showStage();
      this.showing = true;
    }

    //The blowing bubble on the first tutorial frame
    if(this.tutFrame0.visible == true){
      this.scalingBubble.scale.x += 0.06 * deltaTime;
      this.scalingBubble.scale.y += 0.06 * deltaTime;
      //If the bubble is too big, restart the animation
      if(this.scalingBubble.scale.x > 0.7){
        this.scalingBubble.scale.x = 0.1;
        this.scalingBubble.scale.y = 0.1;
      }
    }
    
    updatePhysics(this.containerHowToTitle);
  }
};