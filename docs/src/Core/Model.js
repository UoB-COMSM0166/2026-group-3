//Model class that holds all game data and the current scene
//Global data is held here
//Data local to the scene is held in the scene

import { WeaponManager } from "./WeaponManager.js";



export class Model {
    constructor(game){
        this.scene = null;
        this.game = game;
        this.money = 0;
        this.difficulty = "normal";   // easy / normal / hard
        this.phase = 1;  // 1 phase = 1 day + 1 night. 
        
        this.playerWeapon = "Pistol";
        //TODO add any game variables here (e.g money or day)
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