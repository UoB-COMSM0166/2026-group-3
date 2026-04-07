//Class for the game storing the model, view, controller model
//All game data is stored in the model class
import {Model} from "./Model.js";
import {Controller} from "./Controller.js";
import {View} from "./View.js";
import {AssetManager} from "./AssetManager.js";
import {WelcomeScene} from "../Scenes/WelcomeScene.js";
import {KitchenScene_MVP} from "../Scenes/KitchenScene_MVP.js";
import {SoundManager} from "./SoundManager.js";

export class Game {
    constructor(windowSize, gridSize, DEBUG){
        this.gridSize = gridSize;
        this.debug = DEBUG;

        this.model = new Model(this);
        this.view = new View(this, this.model, windowSize);
        this.controller = new Controller(this, this.model);
        this.assetManager = new AssetManager(this);
        this.soundManager = new SoundManager(this);

        this.assetManager.preload();
        this.soundManager.preload();

        this.brightness = 1;

        this.gameMusic();
    }

    async gameMusic(){
        await this.soundManager.playMusic("intro");
    }

    finishedLoading(){
        let startScene = new WelcomeScene(this);
        // let startScene = new KitchenScene_MVP(this); // use this for kitchen-only testing
        this.model.scene = startScene;
    }
}