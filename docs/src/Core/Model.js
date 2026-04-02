//Model class that holds all game data and the current scene
//Global data is held here
//Data local to the scene is held in the scene
import { Inventory } from "./Inventory.js";
import { GameState } from "./GameState.js"


export class Model {
    constructor(game){
        this.scene = null;
        this.game = game;
        this.difficulty = "normal";   // easy / normal / hard
        this.drops = ["Prime Bone",
                    "Zombie Belly",
                    "Zombie Drumstick",
                    "Zombie Juice",
                    "Zombie Mince"
        ];
        this.gameState = new GameState()
    }
    update(events){
        if (this.scene != null){
            this.scene.update(events);
        }
    }

    draw(){
        if (this.scene != null){
            this.scene.draw();
        }
    }


}