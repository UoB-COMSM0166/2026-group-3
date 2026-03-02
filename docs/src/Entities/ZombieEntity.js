import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class ZombieEntity extends Entity {
    constructor(game, pos){
        let size = new Vector2(0.7, 0.7); 
        super(game, pos, size);
        this.speed = 0.008; 
        this.color = color(0, 255, 0); 
        this.isVisible = true;

        this.isZombie = true;  
    }

    update(events){
        if (!this.isVisible) return;
        this.pos.x -= this.speed;

        if (this.pos.x + this.size.x < 0) this.isVisible = false;
    }

    draw(){
        if (!this.isVisible) return;

        let rel_pos = this.game.view.localToScreen(this.pos);
        let rel_size = this.game.view.localToScreen(this.size);

        fill(this.color);
        stroke(0);

        let x = rel_pos.x;
        let y = rel_pos.y;
        let w = rel_size.x;
        let h = rel_size.y;

        // triangle — tip on left middle
        triangle(
            x + w, y,        // top-right
            x + w, y + h,    // bottom-right
            x, y + h / 2     // left-middle = tip
        );
    }

    // tip position in LOCAL GRID coordinates
// Returns the X of the tip in LOCAL coordinates
getTipX(){
    // pos.x = local origin
    // tip is at left-middle, which is 0 in local pixels
    // Convert width in local units
    return this.pos.x; // this is origin only as the triangle is pointing to left :0 this was confusing 
}
}