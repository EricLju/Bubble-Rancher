//bub_class_scene.js - Game states are is structured into "scenes". This is the
//base object template to build a scene on top of.

class Bubble_Scene {
  constructor(parent) {
    //The pixi stage/container that owns this one.
    this.parent = parent;
    //"Root" pixi container for this stage.
    this.pixiStage = new PIXI.Container();
    //Is this seen currently being updated.
    this.active = false;
    this.pixiStage.visible = false;
    //Has the scene initialization code run?
    this.hasInitialized = false;
    //Add this pixi stage to the parent.
    parent.addChild(this.pixiStage);
  }

  //Getter to check if the scene has been initialized.
  hasInitialized() {
    return this.hasInitialized;
  }

  //Make this scene visible and make sure it is being updated each frame.
  showStage(){
    this.active = true;
    this.pixiStage.visible = true;
  }

  //Hide the scene and stop updating it.
  hideStage(){
    this.active = false;
    this.pixiStage.visible = false;
  }

  //Called once per animation frame.
  update(){

  }
};