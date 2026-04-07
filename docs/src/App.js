//Base script for the app

import {Game} from "./Core/Game.js";
import {Vector2} from "./Utility/Vector2.js";
import { TaskList } from "./Core/TaskList.js";
import { GameState } from "./Core/GameState.js";
import { MenuData } from "./Core/MenuData.js";
import { ProductionManager } from "./Core/ProductionManager.js";

let game;
let DEBUG = false;

window.setup = function() {
    let windowSize = new Vector2(windowWidth, windowHeight);
    let gridSize = new Vector2(16,9);
    game = new Game(windowSize, gridSize, DEBUG);

}

window.draw = function() {
    game.controller.update();
    game.view.draw();
}
window.windowResized = function() {
    game.view.resize();
}


//Input Event Functions
//Add any as needed
//https://p5js.org/reference/#Events
window.keyPressed = function(event){
    game.controller.onEvent(event);
}
window.mouseClicked = function(event){
    game.controller.onEvent(event);
}