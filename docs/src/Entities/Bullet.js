//Test Entity
import {Entity} from "../Core/Entity.js";
import {Vector2} from "../Utility/Vector2.js";

export class Bullet extends Entity{
    constructor(game, pos, damage, speed){
        let size = new Vector2(0.1, 0.05);
        super(game, pos, size);
        this.speed = 0.2 * speed;
        this.damage = damage;
    }

    draw(){
        if (!this.isVisible) { return; }
        fill(0);
        stroke(0);
        let rel_pos = this.game.view.localToScreen(this.pos);
        let rel_size = this.game.view.localToScreen(this.size);
        rect(rel_pos.x, rel_pos.y, rel_size.x, rel_size.y);


    }
    update(events){
        if (!this.isVisible) { return; }
        this.pos.x += this.speed;
        if (this.pos.x > this.game.gridSize.x){
            this.game.model.scene.removeEntity(this);
        }
        for (let entity of this.game.model.scene.entities){
            if (entity.id == "Zombie"){
                if (entity.isVisible && this.pos.withinBox(entity.pos,entity.size)){
                    entity.takeDamage(this.damage);
                    this.game.model.scene.removeEntity(this);
                }
                
            }
        }
    }
}



