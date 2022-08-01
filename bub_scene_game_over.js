//bub_scene_game_over.js - Sub-scene pop over to show when the player loses.

class Bubble_Scene_Game_Over extends Bubble_Scene {
  constructor(parent) {
    super(parent);
    //The game over pop over will be 66% the size of the game screen. I just
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
    spriteNextLevelBackground.tileScale.x = 0.7;
    spriteNextLevelBackground.tileScale.y = 0.8;
	  windowContainer.addChild(spriteNextLevelBackground);
	
    var halfContainer = {x:(containerWidth / 2), y:(containerHeight / 2)};

    //Main title text of window: "Game Over"
    this.containerTitle1 = buildBubbleText("Game");
    //Positioned from the center to the left
    this.containerTitle1.pivot.x = this.containerTitle1.width;
    this.containerTitle1.position = {x: halfContainer.x - 10, y: 25};
    this.containerTitle1.scale = {x: 0.7, y: 0.7};
    windowContainer.addChild(this.containerTitle1);

    this.containerTitle2 = buildBubbleText("Over");
    //Positioned from the center to the right
    this.containerTitle2.pivot.x = 0;
    this.containerTitle2.position = {x: halfContainer.x + 20, y: 25};
    this.containerTitle2.scale = {x: 0.7, y: 0.7};
    windowContainer.addChild(this.containerTitle2);

    //Game play stats. Putting these in their own container so that they can be
    //positioned easily.
    var textStatsContainer = new PIXI.Container();

    this.textLevelsCompleted = pixiTextHelper('Levels Completed: 99', styleScoreText, {x: 0, y:0}, textStatsContainer);
    this.textTotalScore = pixiTextHelper('Total Score: 9999', styleScoreText, {x: 0, y:30}, textStatsContainer);
    this.textHighScore = pixiTextHelper('High Score: 9999', styleScoreText, {x: 0, y:60}, textStatsContainer);
    //Add another background fill to make reading the text a little easier.
    this.tintedText = pixiTiledAlphaFill({x:0,y:(-1*(this.textLevelsCompleted.height / 2))}, {x:textStatsContainer.width + 80, y:textStatsContainer.height+3}, 0xFFFFFF);
    this.tintedText.pivot.x = this.tintedText.width / 2;
    textStatsContainer.addChildAt(this.tintedText, 0);
    //Use the center of the text container as it's origin point.
    //Note: This doesn't look like it's the actual center, not sure why, but it is good enough.
    textStatsContainer.pivot.y = textStatsContainer.height / 2;
    textStatsContainer.x = halfContainer.x ;
    textStatsContainer.y = halfContainer.y + 10;
    windowContainer.addChild(textStatsContainer);
    debugDrawBoxAroundContainer(textStatsContainer, windowContainer, 0x000000);

    //Put a rope border around the sub-window to hide the edges of the
    //background texture.
    var ropeBorder = pixiRopeBorder(windowContainer.position, {x: windowContainer.width, y:windowContainer.height});
	  windowContainer.addChild(ropeBorder);

    //Buttons get their own container to make positioning them easier.
    var buttonContainer = new PIXI.Container();

    var buttonCredits = createButton("Main Menu", this.buttonClickMainMenu, styleSmallTitle);
    //Drop the pivot point back to the top left. It makes positioning them
    //easier in this case.
    buttonCredits.pivot.x = 0;
    buttonCredits.pivot.y = 0;
	  buttonContainer.addChild(buttonCredits);

    var buttonNewGame = createButton("New Game", this.buttonClickNewGame, styleSmallTitle);
    //Drop the pivot point back to the top left. It makes positioning them
    //easier in this case.
    buttonNewGame.pivot.x = 0;
    buttonNewGame.pivot.y = 0;
    buttonNewGame.x = buttonCredits.width + 15;
	  buttonContainer.addChild(buttonNewGame);
    buttonContainer.pivot.x =  buttonContainer.width / 2;
    buttonContainer.pivot.y = buttonContainer.height / 2;
    buttonContainer.position.x = halfContainer.x;
    buttonContainer.position.y = containerHeight * 0.85;
    
    windowContainer.addChild(buttonContainer);

    //Center the game over pop over on the main container 
    windowContainer.pivot.x = windowContainer.width / 2;
    windowContainer.pivot.y = windowContainer.height / 2;
    windowContainer.position.x = gameWidth / 2;
    windowContainer.position.y = gameHeight / 2;
    
  }

  setLevelsCompleted(numberLevelsCompleted){
    this.textLevelsCompleted.text = 'Levels Completed: ' + numberLevelsCompleted;
  }

  setTotalScore(totalScore){
    this.textTotalScore.text = 'Total Score: ' + totalScore;
  }

  //Check the score against the stored high score if it exists. If the 
  //current score is higher then the previous high score then update it.
  checkAndSetHighScore(score){
    var stringStorageHighScore = localStorage.getItem('BubbleRancherHighScore');

    if(stringStorageHighScore != null){
      //localStorage saves values as Strings, convert it to a number.
      var intStorageHighScore = Number.parseInt(stringStorageHighScore, 10);
      //Check if the current score is higher than the previous high score.
      if(score > intStorageHighScore){
        localStorage.setItem('BubbleRancherHighScore', score.toString());
        this.textHighScore.text = 'High Score: ' + score;
      } else {
        this.textHighScore.text = 'High Score: ' + stringStorageHighScore;
      }
    } else {
      localStorage.setItem('BubbleRancherHighScore', score.toString());
      this.textHighScore.text = 'High Score: ' + score;
    }
  }
  
  //On main menu button click
  buttonClickMainMenu(mouseData){
    audioPop01.play();
    //Tell the main menu scene to check and update the high score text at the
    //bottom of the screen.
    sceneMainMenu.updateHighScore();
    sceneBubbleBackground.showStage();
    sceneMainMenu.showStage();
    //Set level and remove play objects to reset all play variables.
    scenePlay.setLevel(1);
    scenePlay.removeAllPlayObjects();
    sceneGameOver.hideStage();
    scenePlay.hideStage();
  }

  //On new game button click
  buttonClickNewGame(mouseData){
    audioPop01.play();
    sceneGameOver.hideStage();
    //Set the game back to the first level
    scenePlay.setLevel(1);
    scenePlay.showStage();
  }

  //Called every animation frame.
  update(){
    updatePhysics(this.containerTitle1);
    updatePhysics(this.containerTitle2);
  }

};