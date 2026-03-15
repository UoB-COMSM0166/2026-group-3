import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class Fence extends Entity {
    constructor(game){
        let size = new Vector2(0.5, 9);
        let pos = new Vector2(4, 0);
        super(game, pos, size);

        this.isVisible = true;
        this.id = "Fence";
        this.health = 100;
    }

    update(events){

    }
    draw(){
        if (!this.isVisible) return;

        let rel_pos = this.game.view.localToScreen(this.pos);
        let rel_size = this.game.view.localToScreen(this.size);
        
        fill(100,100,100);
        stroke(0);
        rect(rel_pos.x, rel_pos.y, rel_size.x, rel_size.y);
    }

    takeDamage(damage){
        this.health -= damage;
        let fenceLabel = this.game.model.scene.getUIElement("FenceLabel");
        if (this.health <= 0){
            fenceLabel.label = "Health: 0%";
            this.game.model.scene.gameOver();
        } else{
            fenceLabel.label = `Health: ${this.health}%`;
        }
        
    }
}