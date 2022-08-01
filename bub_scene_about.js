//bub_scene_about.js - About/credits scene to show information about the game.

class Bubble_Scene_About extends Bubble_Scene {
  constructor(parent) {
    super(parent);
    //Number of seconds to show each text rotator card for.
    this.creditsRotateTime = 5;
    //Count down timer. Rotator card changes when counter reaches 0.
    this.creditsCounter = this.creditsRotateTime;
    //Index of currently showing card in creditsList.
    this.creditsCurrentIndex = 0;
    //Keep track of the last shown card so that we can change its visibility
    this.creditsLastIndex = 0;
    //Array of all text rotator cards.
    this.creditsList = [];

    //Scene title
    this.containerAboutTitle = buildBubbleText("About");
    this.containerAboutTitle.pivot.x = this.containerAboutTitle.width / 2;
    this.containerAboutTitle.position = {x: (gameWidth / 2), y: 25};
    this.pixiStage.addChild(this.containerAboutTitle);
  
    //The main credits text. Leaving a blank line to jam in a link to the readme.
    var stringCredits = 
    'Game By: Eric Ljungquist\n' +
    'Inspired by the mini-game "Super Fill Up"\n' +
    'Game source code \u00A9 CC0 or Public Domain.\n' +
    'PixiJS, Matter.js, Howler.js libraries are \u00A9 under the MIT license.\n' +
    '\n' +
    'Thanks to the following:';

    //Originally had this at y:160 but nearest neighbour made the text look odd.
    //Moving the text slighty fixed it.
    pixiTextHelper(stringCredits, styleGeneralText1, {x: (gameWidth/2),y: 159}, this.pixiStage);
    
    //Create some text that acts as a link to the readme file.
    this.textLink = pixiTextHelper("Click here for a complete list of resource credits.", styleLinkText, {x: (gameWidth/2),y: 193}, this.pixiStage);
    //Make the text clickable.
    this.textLink.interactive = true;
    this.textLink.buttonMode = true;
    this.textLink.setCursorMode  = 'pointer';
    this.textLink.click = this.openReadMeLink;
    this.textLink.tap = this.openReadMeLink;
  
    //Strings for all text rotator cards.
    var stringColumn1 =
    'Images/Textures:\n' +
    '"Bubbles(8 colors)" by HorrorPen \u00A9 CC BY 3.0\n' +
    '"Spike Ball" © 2005-2013 Julien Jorge \u00A9 CC BY-SA 3.0\n'+
    '"Underwater background" by lzubiaur \u00A9 CC BY 3.0\n' +
    '';

    var stringColumn2 =
    'CC0 \u00A9 Images/Textures from OpenGameArt.org:\n' +
    '"Free Bubble Game Button Pack" by pzUH\n' +
    '"FREE Keyboard and controllers prompts pack" by xelu\n'+
    '\n' +
    '';

    var stringColumn3 =
    'CC0 \u00A9 Images/Textures from Openclipart.org:\n' +
    'Cardinalfish (Fish Enemy), Homalaspis plana(Crab Enemy)\n' +
    'cartoon sea mine (Sea Mine Enemy), Rope Border\n'+
    'Red Arrow Left Pointing, Decking (Wood), Wood target\n' +
    '';

    var stringColumn4 =
    'CC0 \u00A9 Audio from OpenGameArt.org:\n' +
    '"3 Pop Sounds" by wubitog\n' +
    '"51 UI sound effects (buttons, switches and clicks)" by Kenney (www.kenney.nl)\n'+
    '"Balloon Sounds" by AntumDeluge\n' +
    '';

    var stringColumn5 =
    'CC0 \u00A9 Audio from OpenGameArt.org:\n' +
    '"Pop effect sounds" by trezegames\n' +
    '"Level up, power up, Coin get (13 Sounds)" by wobbleboxx (wobbleboxx.com)\n'+
    '"negative_beeps.wav" by themusicalnomad\n' +
    '';

    var stringColumn6 =
    'CC0 \u00A9 Audio from freesound.org:\n' +
    '"negative_beeps.wav" by themusicalnomad\n' +
    '\n' +
    '\n' +
    '';

    //Add all the above strings to the credits rotator.
    this.addCreditTextToRotation(stringColumn1, true);
    this.addCreditTextToRotation(stringColumn2, false);
    this.addCreditTextToRotation(stringColumn3, false);
    this.addCreditTextToRotation(stringColumn4, false);
    this.addCreditTextToRotation(stringColumn5, false);
    this.addCreditTextToRotation(stringColumn6, false);

    //Add a back to main menu button
    this.buttonAboutBack = createButton("Back", this.onBackButtonClick);
    this.buttonAboutBack.position = {x: (gameWidth/2), y: (gameHeight - 70)};
    this.pixiStage.addChild(this.buttonAboutBack);
  }
  
  //Add the given string to the credits rotator.
  addCreditTextToRotation(text, visible){
    var textCreditColumn = pixiTextHelper(text, styleGeneralTextSmall, {x: (gameWidth/2),y: 238}, this.pixiStage);
    //position from the center top of the text.
    textCreditColumn.anchor = {x: 0.5, y: 0.0};
    textCreditColumn.visible = visible;
    this.creditsList.push(textCreditColumn);
    this.pixiStage.addChild(textCreditColumn);
  }

  //Called on "link" click.
  openReadMeLink(){
    window.open(urlToReadMe);
  }

  //Called on back button click. Take the user back to the main menu.
  onBackButtonClick(mouseData){
    audioPop01.play();
    sceneAbout.hideStage();
    sceneMainMenu.showStage();
  }

  //Called every animation frame.
  update(){
    this.creditsCounter -= deltaTime;
    //If the counter reaches 0 then move to the next credit string
    if(this.creditsCounter <= 0){
      this.creditsLastIndex = this.creditsCurrentIndex;
      this.creditsCurrentIndex++;
      //If we have reached the end of the list, restart from the beginning.
      if(this.creditsCurrentIndex == this.creditsList.length){
        this.creditsCurrentIndex = 0;
      }
      //Make the last card invisible and the new card visible.
      this.creditsList[this.creditsLastIndex].visible = false;
      this.creditsList[this.creditsCurrentIndex].visible = true;
      //Reset the counter.
      this.creditsCounter = this.creditsRotateTime;
    }
    //Keep the title bubbles moving.
    updatePhysics(this.containerAboutTitle);
  }
};
