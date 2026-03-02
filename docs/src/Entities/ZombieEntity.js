import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class ZombieEntity extends Entity {
    constructor(game, pos){
        let size = new Vector2(1.5, 1.5); 
        super(game, pos, size);
        this.speed = 0.016; 
        this.color = color(0, 255, 0); 
        this.isVisible = true;
        this.id = "Zombie";  
        this.sprite = "ZombieWalking";

        this.health = 4;
    }

    update(events){
        if (!this.isVisible || this.game.model.scene.isGameOver) return;

        if (this.health<=0) {
            this.isVisible = false; 
            return;
        }

        this.pos.x -= this.speed;

        if (this.pos.x + this.size.x < 0) this.isVisible = false;

        const boundary = 4;
        if (this.pos.x <= boundary) {
            this.game.model.scene.gameOver();
        }

    }

    draw(){
        if (!this.isVisible) return;

        let rel_pos = this.game.view.localToScreen(this.pos);
        let rel_size = this.game.view.localToScreen(this.size);
        
        let sprite = this.game.assetManager.getImage(this.sprite);
        image(sprite, rel_pos.x, rel_pos.y, rel_size.x, rel_size.y)

        // fill(this.color);
        // stroke(0);

        // let x = rel_pos.x;
        // let y = rel_pos.y;
        // let w = rel_size.x;
        // let h = rel_size.y;

        // // triangle — tip on left middle
        // triangle(
        //     x + w, y,        // top-right
        //     x + w, y + h,    // bottom-right
        //     x, y + h / 2     // left-middle = tip
        // );
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