//bub_main.js - Root file

console.log("%c      \ud83e\udd20 BUBBLE RANCHER STARTUP \ud83e\udd20      ", "background: aqua;");

//TODO: check to make sure external librarys load. matterjs doesn't load sometimes
//TODO: multiple bubble texture sizes to prevent that jagged look on scaling down
//TODO: fish enemy traveling right to left is upside down. have them always traveling with top fin pointing up.
//TODO: scale mouse cursor with game size. cursor is too big on small screens

//Notes:
//super fill up gameplay - https://www.youtube.com/watch?v=FSSc7yNptvA

//URL to the readme for the About/credits scene
//var urlToReadMe = document.URL + "README.html";
var urlToReadMe = "https://github.com/EricLju/Bubble-Rancher#readme";

var MIN_BUBBLE_SCALE = 0.05;
//Max width of the game canvas in pixels
var MAX_GAME_WIDTH = 1000;

//Tracking mouse up/down state in scenePlay
var curExpand = false;
var lastExpand = false;

var gameWidth = 640;
var gameHeight = 480;

var linkedlistRenderScenes = new LinkedList();
var bubbleCanvasElement = document.getElementById('BubbleCanvas');

//New Pixi.js application to handle 2D graphics
//var pixiApplication = new PIXI.Application({width: gameWidth, height: gameHeight, antialias: true, backgroundColor : 0x009ACD, resolution: 1});
//TODO: utilize window.devicePixelRatio to set resolution?
var pixiApplication = new PIXI.Application({view: bubbleCanvasElement, width:gameWidth, height: gameHeight, antialias: true, backgroundColor : 0x009ACD, resolution: 1.5});
var tickerGlobal = pixiApplication.ticker;
var deltaTime = 0; //Change in time from the last frame in seconds.

//Is the audio muted.
var audioMute = false;

//PixiJS containers for all scenes. Each scene gets one main container. All
//scenes are loaded at the start and just kept invisible until needed.
var rootPixiStage = pixiApplication.stage; //Root stage
var stageBubbleBackground = new PIXI.Container();
stageBubbleBackground.visible = false;
rootPixiStage.addChild(stageBubbleBackground);
var stageLoading = new PIXI.Container();
stageLoading.visible = false;
rootPixiStage.addChild(stageLoading);
var stageMainMenu = new PIXI.Container();
stageMainMenu.visible = false;
rootPixiStage.addChild(stageMainMenu);
var stagePlay = new PIXI.Container();
stagePlay.visible = false;
rootPixiStage.addChild(stagePlay);
var stageAbout = new PIXI.Container();
stageAbout.visible = false;
rootPixiStage.addChild(stageAbout);
var stageNextLevel = new PIXI.Container();
stageNextLevel.visible = false;
rootPixiStage.addChild(stageNextLevel);
var stageGameOver = new PIXI.Container();
stageGameOver.visible = false;
rootPixiStage.addChild(stageGameOver);

var sceneLoading;
var sceneBubbleBackground;
var sceneMainMenu;
var sceneAbout;
var sceneHowTo;
var scenePlay;
var sceneNextLevel;
var sceneGameOver;

// create a Matter.js physics engine
var engine = Matter.Engine.create();
//DEBUG: create Matter.js debug renderer
//var render = Matter.Render.create({element: document.body, engine: engine});

//Debugging output
var msg = document.getElementById('state-msg');

//Images/Textures list for the pixi loader.
var assetsToLoad = [
  {name: "texButton1", url: "./resources/images/bubble_button.png"},
  {name: "texScubaTank1", url: "./resources/images/scuba_tank.png"},
  {name: "texBackground01", url: "./resources/images/background_01.jpg"},
  {name: "texBubble01", url: "./resources/images/bubble.png"},
  {name: "spikeball01", url: "./resources/images/spike_ball.png"},
  {name: "buttonAudioOn", url: "./resources/images/mute_button_green.png"},
  {name: "buttonAudioOff", url: "./resources/images/mute_button_gray.png"},
  {name: "rope01", url: "./resources/images/rope.png"},
  {name: "woodpost02", url: "./resources/images/wood_post.png"},
  {name: "alphafill01", url: "./resources/images/alpha_fill.png"},
  {name: "fish01", url: "./resources/images/fish_gray.png"},
  {name: "fish02", url: "./resources/images/fish.png"},
  {name: "crab01", url: "./resources/images/crab.png"},
  {name: "seamine01", url: "./resources/images/sea_mine.png"},
  {name: "woodplanks01", url: "./resources/images/wood_planks.png"},
  {name: "arrow01", url: "./resources/images/arrow.png"},
  {name: "mouseLeftClick", url: "./resources/images/mouse_left_click.png"}
];

//Audio list for the howler loader.
var audioToLoad = [
  {name: "audioPop01", url: "./resources/audio/effect_pop.ogg"},
  {name: "audioClick5", url: "./resources/audio/mouseover_click.wav"},
  {name: "audioInflate", url: "./resources/audio/balloon_inflate.ogg"},
  {name: "audioBloop", url: "./resources/audio/effect_bloop_boost2.mp3"},
  {name: "audioBonus", url: "./resources/audio/effect_bonus.mp3"},
  {name: "audioPassedLevel", url: "./resources/audio/effect_good_rise.mp3"},
  {name: "audioGameOver", url: "./resources/audio/audio_gameover_2.mp3"}
];

//Resize the canvas to fit the window while preserving the 4:3 aspect ratio.
function resizeBubbleCanvas(){

  //Calculate the desired width and height based on window width.
  //Width is set to 90% window width to allow a little whitespace on the left
  //and right.
  var newGameWidth = window.innerWidth * 0.9;
  var newGameHeight = newGameWidth * (gameHeight / gameWidth);

  //If the desired height is larger then the window height then we have to 
  //scale the canvas based on the height instead of width. 
  if(newGameHeight > (window.innerHeight * 0.95)){
    newGameHeight = window.innerHeight * 0.95;
    newGameWidth = newGameHeight * (gameWidth / gameHeight);
  }

  //Don't let the canvas get bigger than MAX_GAME_WIDTH. Nothing bad would 
  //happen but it gets blurry.
  if(newGameWidth > MAX_GAME_WIDTH){
    newGameWidth = MAX_GAME_WIDTH;
    newGameHeight = newGameWidth * (gameHeight / gameWidth);
  }
  
  //Resize via the canvas style property will stretch the rendered view
  //without effecting any internal coordinates.
  bubbleCanvasElement.style.width = newGameWidth + "px";
  bubbleCanvasElement.style.height = newGameHeight + "px";
}

//Runs the frame updater for the given scene.
function updateScene(scene){
  if(scene.active == true){
    scene.update();
  }
}

//The main runner. Called once on start up then called again on every animation
//frame.
function mainLoop() {
    deltaTime = tickerGlobal.elapsedMS / 1000;
    //Rerun this function on the next animation frame.
    requestAnimationFrame(mainLoop);
    //Drop the frame if the delta is too big. This usually happends on tab
    //switching. Unexpected things with physics can happen if the delta is too large.
    if(deltaTime < 0.2){ 
      //Run scene update()'s
      linkedlistRenderScenes.runFunction(updateScene);
      //Render pixi view to canvas.
      pixiApplication.render(rootPixiStage);
    } else {
      console.log("Debug: frame drop of " + deltaTime);
    }
    //msg.textContent = 'dt: ' + deltaTime.toFixed(4) + " fps: " + tickerGlobal.FPS.toFixed(0) ;
};

//Remove sprites marked for deletion from container.
function removeOldSprites(container){
  //For each child of the container.
  for(var i = 0; i < container.children.length; i++){
  	if(container.children[i].bubRemoveSprite == true){
    	var tempChild = container.removeChild(container.children[i]);
    	tempChild.destroy();
    }
  }
}

//Loop throuh all children of a pixi container. If the child has a physics
//function then run it.
function updatePhysics(container){
  //For each child of the container.
  for(var i = 0; i < container.children.length; i++){
  	if(container.children[i].physics != undefined){
    	container.children[i].physics(deltaTime);
    }
  }
}

//Create and show the loading scene as it doesn't have any resource dependencies. 
sceneLoading = new Bubble_Scene_Loading(rootPixiStage);
linkedlistRenderScenes.push(sceneLoading);
sceneLoading.showStage();

//Set the cursor to the scuba tank.
pixiApplication.renderer.plugins.interaction.cursorStyles.default = 'url(\'https://i.imgur.com/CEYVB33.png\'),auto';
//Listen for window size changes.
window.addEventListener('resize', resizeBubbleCanvas);
//Do an initial resize on page open
resizeBubbleCanvas();
//Run the Matter.js physics engine
Matter.Runner.run(engine);
//Bootstrap the main runner function.
mainLoop();

