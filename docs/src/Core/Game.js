//Class for the game storing the model, view, controller model
//All game data is stored in the model class
import {Model} from "./Model.js";
import {Controller} from "./Controller.js";
import {View} from "./View.js";
import {TestScene} from "../Scenes/TestScene.js";
import {AssetManager} from "./AssetManager.js";

export class Game {
    constructor(windowSize, gridSize, DEBUG){
        this.gridSize = gridSize;
        this.debug = DEBUG;

        this.model = new Model(this);
        this.view = new View(this, this.model, windowSize);
        this.controller = new Controller(this, this.model);
        this.assetManager = new AssetManager();
        
        this.assetManager.preload();

        //Load a test Scene
        let testScene = new TestScene(this);
        this.model.loadScene(testScene);
    }
}