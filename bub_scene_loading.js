//bub_scene_loading.js - Handles asset loading and shows the user loading progress.
//Scene automatically switches to the main menu when assets are done loading.

class Bubble_Scene_Loading extends Bubble_Scene {
  constructor(parent) {
    super(parent);
		//Total number of assets to load. Images and audio.
		this.totalAssetCount = assetsToLoad.length + audioToLoad.length;
		//Number of assets currently loaded.
		this.assetsLoadedCount = 0;
		//true when there has been a change in loading progress. 
		this.progressDirty = false;

		pixiTextHelper('Loading...', styleTitleText, {x: (gameWidth/2), y: 200}, this.pixiStage);
  
		this.textPercent = pixiTextHelper('00 / 100', styleTitleText, {x: (gameWidth/2), y: 250}, this.pixiStage)
		//Load images using the Pixi Loader
		this.loadPixiAssets();
		//Load audio using the Howler Loader
		this.loadAudioAssets();
  }
  
	//Load image assets using the pixi loader
	loadPixiAssets(){
		PIXI.loader.on('load', this.onloadProgress.bind(this));
		PIXI.loader.on('error', this.onLoadAssetError.bind(this));
		PIXI.loader.add(assetsToLoad);
		PIXI.loader.load();
	}

	//Load audio assets using the howler loader.
	loadAudioAssets(){
		//For each item in the audio asset list.
		for(var currentAsset of audioToLoad){
			//Add the name as a window space variable to make access simpler.
			window[currentAsset.name] = new Howl({src: [currentAsset.url], onload: this.onloadProgress.bind(this)});
		}
	}

	//Called when there is a change in asset loading progress
	onloadProgress(){
		this.assetsLoadedCount++;
		this.progressDirty = true;
	}

	//Called on an asset load error.
	//This obviously needs a little bit of expansion.
	onLoadAssetError(){
		console.log("File load error!");
	}

	//Called once every asset is loaded. Sets up the rest of the scenes and switches
	//to the main menu.
	onAssetsLoaded(){
		//Create the background scene
		sceneBubbleBackground = new Bubble_Scene_Bubble_Background(rootPixiStage);
		linkedlistRenderScenes.push(sceneBubbleBackground);
		sceneBubbleBackground.showStage();
		//Create the main menu scene
		sceneMainMenu = new Bubble_Scene_Main_Menu(rootPixiStage);
		linkedlistRenderScenes.push(sceneMainMenu);
		sceneMainMenu.showStage();
		//Create the credits scene
		sceneAbout = new Bubble_Scene_About(rootPixiStage);
		linkedlistRenderScenes.push(sceneAbout);
		//Create the game play scene
		scenePlay = new Bubble_Scene_Play(rootPixiStage);
		linkedlistRenderScenes.push(scenePlay);
		//Create the tutorial scene
		sceneHowTo = new Bubble_Scene_HowTo(rootPixiStage);
		linkedlistRenderScenes.push(sceneHowTo);
		//Create the next level scene
		sceneNextLevel = new Bubble_Scene_Next_Level(rootPixiStage);
		linkedlistRenderScenes.push(sceneNextLevel);
		//Create the game over scene
		sceneGameOver = new Bubble_Scene_Game_Over(rootPixiStage);
		linkedlistRenderScenes.push(sceneGameOver);
	}

	//Called every animation frame.
  update(){
		//If there is a change in progress.
		if(this.progressDirty == true){
			var progressPercent = (this.assetsLoadedCount / this.totalAssetCount) * 100; 
			//Update pixi text.
			this.textPercent.text = progressPercent.toFixed(0) + " / 100";
			//If everything is loaded.
			if(this.assetsLoadedCount == this.totalAssetCount){
				this.onAssetsLoaded();
			}
			//Progress updated. Wait for the next change.
			this.progressDirty = false;
		}
  }
};
