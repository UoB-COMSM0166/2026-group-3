//Abstract class for an entity in a scene
//All entities that inherit from this are stored in the Entities folder
import {Vector2} from "../Utility/Vector2.js";

export class Entity {
    constructor(game, pos = new Vector2(), size = new Vector2()){
        //Entity position is relative to the grid
        this.pos = pos;
        this.size = size;
        this.game = game;
        this.isVisible;
    }
    draw(gameSize){}
    update(events){}
}