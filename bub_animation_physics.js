//bub_animation_physics.js - Non-matterjs pyhsics/animation functions.

//Initialize water tinting effect.
function addWaterTinting(spriteObj){
  //Save the current tint to use as the baseline tint
  spriteObj.startTint = spriteObj.tint;
  //Current progress of the animation in seconds
	spriteObj.animationStep = 0;
  //How long it should take to complete the animation in seconds.
  spriteObj.animationTime = 2;
  //Set the per frame function.
	spriteObj.physics = physicsWaterTint;
}

//Water tinting effect that slowly changes the tint over time. Trying to emulate
//an underwater rolling shadow effect. The effect is very subtle.
function physicsWaterTint(delta){
  //Normalized current time in the animation.
	var currentTimeSlice = this.animationStep / this.animationTime;
  //Use sine to produce a smooth up and down value.
  var tintChangeAmount = Math.sin(currentTimeSlice);
  //Scale the range of change in tint.
  tintChangeAmount *= 20;
  //Split out the green and blue channels from the tint. Red isn't used.
  var green = (this.startTint & 0x00FF00) >> 8;
  var blue = this.startTint & 0x0000FF;
  green += tintChangeAmount;
  blue += tintChangeAmount;
  //Recombine the modified green and blue color channels into the new tint.
  //Red is left as 0x00.
  this.tint = (((green << 8) + blue));
  
  this.animationStep += delta;
  //I ended up just using sine to calculate tinting so keeping track of the 
  //current state of the animation wasn't needed since it's periodic.
  //if(this.animationStep > this.animationTime){
  //}
}

//Initialize background and effect bubble physics. The physics for play area
//bubbles is handled by matterjs.
function addPhysicsBubble(spriteObj, scale){
  //Velocity
	spriteObj.vx = 0.0;
  spriteObj.vy = 0.0;
  //Acceleration. -1 to have the bubbles float up. Rate of acceleration is
  //dependant on how large the bubble is.
  spriteObj.accScale = -1 * scale * 7;
  //Set the per frame function.
  spriteObj.physics = physicsBubble;
}

//Per frame function for running the bubbles.
function physicsBubble(delta){
	//velocity += acceleration * time_step
  this.vy += this.accScale * delta;
	//position += velocity * time_step
  this.x += this.vx * delta;
  this.y += this.vy * delta;
  //Dampen the speed on the X axis if it is moving too fast.
  if (this.vx > 0) {
    this.vx = this.vx - (100 * delta);
  } else {
    this.vx = this.vx + (100 * delta);
  }
  //Add some left-right jiggle to the bubbles movement.
  this.x += Math.sin(this.vy)*0.2;
  //Mark the object for removal if its gone too far off screen.
  if(this.y < -100){
    this.bubRemoveSprite = true;
  }
}

//Initialize background fish physics
function addPhysicsBackgroundFish(spriteObj){
  //Counter to keep track of time. Just using it as a consistently growing value.
  spriteObj.aliveTime = 0;
  //Velocity
	spriteObj.vx = 0.0;
  spriteObj.vy = 0.0;
  //Keep track of the original x-axis scale as we will modify it.
  spriteObj.originalScale = spriteObj.scale.x;
  //Set the per frame function.
  spriteObj.physics = physicsBackgroundFish;
}

//Per frame function for running the fish.
function physicsBackgroundFish(delta){
  this.aliveTime += delta;
  //Introduce a bit of gyration to the movement on the X-axis. Trying to make
  //it look like the fish is swimming rather then scrolling across the screen.
  var tempvx = this.vx * (1 - (Math.abs(Math.sin(this.aliveTime * 4)) * 0.5));
  this.scale.x = this.originalScale * (1 - (Math.abs(Math.sin(this.aliveTime * 4)) * 0.06));
  //flip the texture to point in the direction it is traveling
  if(this.vx < 0){
    this.scale.x *= -1;
  }
  //position += velocity * time_step
  this.x += tempvx * delta;
  this.y += this.vy * delta;
  //Remove the fish if it has gone too far off screen.
  if(this.x < -100 || this.x > (gameWidth + 100)){
    this.bubRemoveSprite = true;
  }
}

//Initialize the bubbles that float around a center point used in the title strings.
function addPhysicsTitleBubble(spriteObj){
  //counter is a growing value we feed into sin/cos to get a bobbing effect.
  //Initialized to a random value so that they dont all bob in unison.
  spriteObj.counter = Math.random() * 100;
  //goalPosition is the desired center point of the letter.
  spriteObj.goalPositionX = spriteObj.x;
  spriteObj.goalPositionY = spriteObj.y;
  //Set the per frame function.
  spriteObj.physics = physicsTitleBubbles;
}

//Per frame function for running the title bubbles.
function physicsTitleBubbles(delta){
  //Increase counter by a random value to add some variability to movement.
  this.counter += Math.random();
  //sin/cos circular movement around the initial position to make the
  //letters look like they are bobbing
  this.x = this.goalPositionX + (Math.sin(this.counter * 0.05) * 3);
  this.y = this.goalPositionY + (Math.cos(this.counter * 0.05) * 2);
}

/* Didn't end up using this. Leaving this here in case I come back to it.
function physicsMoveTo(delta){
  var currentTimeSlice = this.animationStep / this.animationTime;
  //smoothstep
	currentTimeSlice = ((currentTimeSlice) * (currentTimeSlice) * (3 - 2 * (currentTimeSlice)));
	this.y = (this.animationEndPosition.y * currentTimeSlice) + (this.animationStart.y * (1 - currentTimeSlice));
  this.x = (this.animationEndPosition.x * currentTimeSlice) + (this.animationStart.x * (1 - currentTimeSlice));
  this.animationStep += delta;
  if(this.animationStep > this.animationTime){
  	this.physicsFunction = undefined;
  }
}
*/