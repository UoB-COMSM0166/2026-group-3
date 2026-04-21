import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class Fence extends Entity {
    constructor(game){
        let size = new Vector2(15, 8);
        let pos = new Vector2(0, 1);
        super(game, pos, size);

        this.isVisible = true;
        this.id = "Fence";
        this.maxHealth = 50
        this.health = this.maxHealth;

        this.image1 = "Fence 1";
        this.image2 = "Fence 2";
        this.image3 = "Fence 3";

    }

    update(events){

    }
    draw(){
        if (!this.isVisible) return;

        let rel_pos = this.game.view.localToScreen(this.pos);
        let rel_size = this.game.view.localToScreen(this.size);

        let dmgImage;
        if (this.health/this.maxHealth > 0.75){
            dmgImage = this.image1;
        } else if(this.health/this.maxHealth > 0.25){
            dmgImage = this.image2;
        } else {
            dmgImage = this.image3;
        }

        let sprite = this.game.assetManager.getImage(dmgImage);
        image(sprite, rel_pos.x, this.game.model.scene.uiBar.size.y, rel_size.x, this.game.view.size.y - this.game.model.scene.uiBar.size.y);
        
        // fill(100,100,100);
        // stroke(0);
        // rect(rel_pos.x, rel_pos.y, rel_size.x, rel_size.y);
    }

    takeDamage(damage){
        this.health -= damage;
        let fenceLabel = this.game.model.scene.getUIElement("FenceLabel");
        if (this.health/this.maxHealth <= 0){
            fenceLabel.label = "Health: 0%";
            this.game.model.scene.gameOver();
        } else{
            fenceLabel.label = `Health: ${this.health/this.maxHealth}%`;
        }
        
    }
}