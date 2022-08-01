//bub_scene_next_level.js - Next level screen will be a pop over window over the
//main play area.

class Bubble_Scene_Next_Level extends Bubble_Scene {
  constructor(parent) {
	  super(parent);
    //The next level pop over will be 66% the size of the game screen. I just
    //thought this size looked good.
	  var containerWidth = gameWidth * 0.66;
	  var containerHeight = gameHeight * 0.66;

    //Cover the play area background with a tint to make the pop over stand out
    //more.
    var tintedBackground = pixiTiledAlphaFill({x:0,y:0}, {x:gameWidth, y:gameHeight}, 0x1F1F1F);
    this.pixiStage.addChild(tintedBackground);

    //"Root" container of the actual next level window 
    var windowContainer = new PIXI.Container();
    this.pixiStage.addChild(windowContainer);
	
    //Background of the window. Tint and scale chosen for looks.
    var spriteNextLevelBackground = new PIXI.TilingSprite(PIXI.loader.resources.woodplanks01.texture, containerWidth, containerHeight);
	  spriteNextLevelBackground.tint = 0xCFCFCF;
    spriteNextLevelBackground.tileScale = {x: 0.7, y: 0.8};
	  windowContainer.addChild(spriteNextLevelBackground);
	
    var halfContainer = {x:(containerWidth / 2), y:(containerHeight / 2)};

    //Main title text of window: "Level Complete"
    this.containerTitle1 = buildBubbleText("Level");
    this.containerTitle1.pivot.x = this.containerTitle1.width / 2;
    this.containerTitle1.position = {x: halfContainer.x, y: 15};
    this.containerTitle1.scale = {x: 0.5, y: 0.5};
    windowContainer.addChild(this.containerTitle1);

    this.containerTitle2 = buildBubbleText("Complete");
    this.containerTitle2.pivot.x = this.containerTitle2.width / 2;
    this.containerTitle2.position = {x: halfContainer.x, y: 45};
    this.containerTitle2.scale = {x: 0.5, y: 0.5};
    windowContainer.addChild(this.containerTitle2);

    //Game play stats for the last level played. Putting these in their own
    //container so that they can be positioned easily.
    var textStatsContainer = new PIXI.Container();
  
    this.textTimeTaken = pixiTextHelper('Time Taken: 99 min 99 sec', styleScoreText, {x: 0, y:0}, textStatsContainer);
    this.textBubblesLeft = pixiTextHelper('Bubbles Left: 99', styleScoreText, {x: 0, y:30}, textStatsContainer);
    this.textTanksLeft = pixiTextHelper('Tanks Left: 99', styleScoreText, {x: 0, y:60}, textStatsContainer);
    this.textLevelScore = pixiTextHelper('Level Score: 1000', styleScoreText, {x: 0, y:90}, textStatsContainer);
    this.textTotalScorew = pixiTextHelper('Total Score: 99999', styleScoreText, {x: 0, y:120}, textStatsContainer);

    //Add another background fill to make reading the text a little easier.
    this.tintedText = pixiTiledAlphaFill({x:0,y:(-1*(this.textTimeTaken.height / 2))}, {x:textStatsContainer.width + 80, y:textStatsContainer.height + 3}, 0xFFFFFF);
    this.tintedText.pivot.x = this.tintedText.width / 2;
    textStatsContainer.addChildAt(this.tintedText, 0);
    
    //Use the center of the text container as it's origin point.
    //Note: This doesn't look like it's the actual center, not sure why, but it is good enough.
    textStatsContainer.pivot.y = textStatsContainer.height / 2;
    textStatsContainer.x = halfContainer.x ;
    textStatsContainer.y = halfContainer.y + 10;
    windowContainer.addChild(textStatsContainer);
    debugDrawBoxAroundContainer(textStatsContainer, windowContainer, 0x000000);

    var ropeBorder = pixiRopeBorder(windowContainer.position, {x: windowContainer.width, y:windowContainer.height});
	  windowContainer.addChild(ropeBorder);
    //A continue to next level button.
    var buttonCredits = createButton("Next Level", this.buttonClickNextLevel, styleSmallTitle);
    buttonCredits.x = halfContainer.x; //Center of window
    buttonCredits.y = windowContainer.height * 0.77; //Just thought 77% looked good
	  windowContainer.addChild(buttonCredits);

    //Center the next level pop over on the main container 
    windowContainer.pivot.x = windowContainer.width / 2;
    windowContainer.pivot.y = windowContainer.height / 2;
    windowContainer.position.x = gameWidth / 2;
    windowContainer.position.y = gameHeight / 2;
  }

  //On next level button click.
  buttonClickNextLevel(event){
    audioPop01.play();
    //Go to the next level
    scenePlay.setLevel(scenePlay.gameLevel + 1);
    sceneNextLevel.hideStage();
    //Restart gameplay
    scenePlay.active = true;
  }

  setTime(stringTimeTaken){
    this.textTimeTaken.text = "Time Taken: " + stringTimeTaken;
  }

  setBubblesLeft(stringBubblesLeft){
    this.textBubblesLeft.text = "Bubbles Left: " + stringBubblesLeft;
  }

  setTanksLeft(stringTanksLeft){
    this.textTanksLeft.text = "Tanks Left: " + stringTanksLeft;
  }

  setTotalScore(stringTotalScore){
    this.textTotalScorew.text = "Total Score: " + stringTotalScore;
  }

  setLevelScore(stringLevelScore){
    this.textLevelScore.text = "Level Score: " + stringLevelScore;
  }

  //Called every animation frame.
  update(){
    //this.tintedText.width = this.textTimeTaken.width + 10;
    //this.tintedText.pivot.x = this.tintedText.width / 2;
    updatePhysics(this.containerTitle1);
    updatePhysics(this.containerTitle2);
  }

}