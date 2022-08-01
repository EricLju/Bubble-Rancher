//bub_scene_bubble_background.js - Just the background for the main menu and
//about scene. This is in its own scene so that we can just load other transparent
//scenes on top of it.

class Bubble_Scene_Bubble_Background extends Bubble_Scene {
  constructor(parent) {
    super(parent);
    //Countdown timer for spawning background bubbles.
    this.bubbleTimeout = 0;
    //Countdown timer for spawning background fish.
    this.fishTimeout = randomFloat(3, 10);

    //Seaweed background image
    this.spriteBackground = new PIXI.Sprite(PIXI.loader.resources.texBackground01.texture);
	  this.spriteBackground.scale = {x: 0.32, y: 0.32};//TODO: Just resize this image
	  this.spriteBackground.tint = 0x009AC9;
    addWaterTinting(this.spriteBackground);
	  this.pixiStage.addChild(this.spriteBackground);
  
    //Background fish container.
    this.containerFish = new PIXI.Container();
    this.pixiStage.addChild(this.containerFish);

    //Background bubble container
    this.containerBubbles = new PIXI.Container();
    this.pixiStage.addChild(this.containerBubbles);
  
    //pre-populated the screen with a few bubbles so it
    //isn't so empty at start-up.
    for(var i = 0; i < 7; i++){
      this.addBackgroundBubble({x: (randomFloat(0, gameWidth)), y: (randomFloat(0, gameHeight))}, 40);
    }
  
	this.hasInitialized = true;
  }

  //Add a bubble to the background
  addBackgroundBubble(position, velocity){
    //Make the bubble a random size.
    var bubsize = randomFloat(0.01, 0.5);
    var tempBackgroundBubble = createBubble(bubsize);
    //Tint them a darkish blue-green to make them look like farther away in water.
    tempBackgroundBubble.tint = 0x50D0F0;
    tempBackgroundBubble.position = position;
    addPhysicsBubble(tempBackgroundBubble, bubsize);
    tempBackgroundBubble.vy = -1 * velocity * bubsize;
    this.containerBubbles.addChild(tempBackgroundBubble);
  }

  //Add a random fish to the background
  addBackgroundFish(){
    var fishScale = randomFloat(0.1, 0.25);
    //Using the gray fish texture as it looks better tinted.
    var fish = pixiFish(fishScale, this.containerFish);
    //Tint them a darkish blue-green to make them look like farther away in water.
    fish.tint = 0x30B0F0;
    //Anywhere along the y-axis.
    fish.y = randomFloat(0, gameHeight);
    addPhysicsBackgroundFish(fish);
    fish.vx = 50;
    //Coin toss to determine if the fish will travel right-to-left or left-to-right.
    var fishDirection = Math.random() - 0.5;
    if(fishDirection >= 0){
      //Start off screen
      fish.x = -50;
    } else {
      //Traveling right to left. Flip values.
      fish.x = gameWidth + 50;
      fish.vx *= -1;
      fish.scale.x *= -1;
    }
  }

  //Called every animation frame.
  update(){
  
    //Background bubble spawner
    this.bubbleTimeout -= deltaTime;
    if(this.bubbleTimeout <= 0){
      //Spawn another bubble 2 seconds from now.
  	  this.bubbleTimeout = 2;
      this.addBackgroundBubble({x: (randomFloat(0, gameWidth)), y: (gameHeight + 70)}, 20);
    }

    //Background fish Spawner
    this.fishTimeout -= deltaTime;
    if(this.fishTimeout <= 0){
  	  this.fishTimeout = randomFloat(8, 15);
      this.addBackgroundFish();
    }

    //Run per frame physics functions.
    updatePhysics(this.pixiStage);
    updatePhysics(this.containerBubbles);
    updatePhysics(this.containerFish);
    removeOldSprites(this.containerBubbles);
    removeOldSprites(this.containerFish);
  }

};