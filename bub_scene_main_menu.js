//bub_scene_main_menu.js - Main menu.

class Bubble_Scene_Main_Menu extends Bubble_Scene {
  constructor(parent) {
    super(parent);

    //Main title.
    this.containerTitle1 = buildBubbleText("Bubble");
    this.containerTitle1.pivot.x = this.containerTitle1.width / 2;
    this.containerTitle1.position.x = gameWidth / 2;
    this.containerTitle1.position.y = 30;
    this.pixiStage.addChild(this.containerTitle1);
    this.containerTitle2 = buildBubbleText("Rancher");
    this.containerTitle2.pivot.x = this.containerTitle2.width / 2;
    this.containerTitle2.position.x = gameWidth / 2;
    this.containerTitle2.position.y = 100;
    this.pixiStage.addChild(this.containerTitle2);

    //Menu buttons
    var buttonPlay = createButton("Play", this.buttonClickPlay);
    buttonPlay.position = {x: (gameWidth / 2), y: 230};
	  this.pixiStage.addChild(buttonPlay);
  
    var buttonHighScores = createButton("Tutorial", this.buttonClickTutorial);
    buttonHighScores.position = {x: (gameWidth / 2), y: 310};
	  this.pixiStage.addChild(buttonHighScores);
  
    var buttonCredits = createButton("About", this.buttonClickAbout);
    buttonCredits.position = {x: (gameWidth / 2), y: 390};
	  this.pixiStage.addChild(buttonCredits);

    //Mute/Unmute audio button
    this.buttonAudio = createAudioButton(this.buttonClickMute, 0.3);
    //Place the button in the bottom right corner of the screen
    this.buttonAudio.x = gameWidth - (this.buttonAudio.width /2) - 10;
    this.buttonAudio.y = gameHeight - (this.buttonAudio.height / 2) - 10;
	  this.pixiStage.addChild(this.buttonAudio);
  
    //High score text at the bottom of screen. If there is no high score saved,
    //it is not shown.
    this.textHighScore = pixiTextHelper('High Score: 9999', styleScoreText, {x:5, y: (gameHeight - 5)}, this.pixiStage);
    this.textHighScore.anchor = {x: 0, y:1};
    this.updateHighScore();
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
  buttonClickMute(){
    if(audioMute == false){
      audioMute = true;
      Howler.mute(true);
    } else {
      audioMute = false;
      Howler.mute(false);
      audioPop01.play();
    }
  }

  //On about button click
  buttonClickAbout(){
    audioPop01.play();
    sceneMainMenu.hideStage();
    sceneAbout.showStage();
  }

  //On tutorial button click
  buttonClickTutorial(){
    audioPop01.play();
    sceneMainMenu.hideStage();
    scenePlay.tutorial = true;
    sceneHowTo.showStage();
  }

  //On play button click
  buttonClickPlay(){
    audioPop01.play();
    sceneBubbleBackground.hideStage();
    sceneMainMenu.hideStage();
    scenePlay.setLevel(1);
    scenePlay.showStage();
  }

  //Check if a high score exists and display it if it does.
  updateHighScore(){
    var stringStorageHighScore = localStorage.getItem('BubbleRancherHighScore');
    if(stringStorageHighScore != null){
      this.textHighScore.text = 'High Score: ' + stringStorageHighScore;
      this.textHighScore.visible = true;
    } else {
      this.textHighScore.visible = false;
    }
  }

  //Called every animation frame.
  update(){
    this.checkMute(this.buttonAudio);
    updatePhysics(this.containerTitle1);
    updatePhysics(this.containerTitle2);
  }
};