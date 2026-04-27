//Model class that holds all game data and the current scene
//Global data is held here
//Data local to the scene is held in the scene
import { Inventory } from "./Inventory.js";
import { GameState } from "./GameState.js"
import { PauseMenu } from "../UIElements/PasueMenu.js";


export class Model {
    constructor(game){
        this.scene = null;
        this.game = game;
        this.difficulty = "normal";   // easy / normal / hard
        this.drops = ["Zombie Mince",
                    "Zombie Drumstick",
                    "Zombie Juice",
                    "Prime Bone",
                    "Zombie Belly"
        ];
        this.gameState = new GameState()

        this.isPaused = false;
        this.pauseMenu;
    }
    update(events){

        if (this.isPaused){
            this.pauseMenu.update(events);
        }
        else {
            if (this.scene != null){
                this.scene.update(events);
            }
        } 
    }

    draw(){
        if (this.scene != null){
            this.scene.draw();
        }
        if (this.isPaused){
            stroke(0);
            fill(0, 0, 0, 150); //Semi-transparent black
            rect(0, 0, width, height);   
            this.pauseMenu.draw();
        }
    }
    togglePaused(){
        if (!this.isPaused){
            this.pauseMenu = new PauseMenu(this.game);
            this.pauseMenu.resize();
        }
        this.isPaused = !this.isPaused;
    }

    resize(){
        if (this.isPaused){
            this.pauseMenu.resize();
        }
    }

}