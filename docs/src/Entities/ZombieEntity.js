import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class ZombieEntity extends Entity {
    constructor(game, pos){
        let size = new Vector2(1.5, 1.5); 
        super(game, pos, size);

        this.isVisible = true;
        this.id = "Zombie";
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


    }
}
