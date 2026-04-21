import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class ItemEntity extends Entity {
    constructor(game, pos, imageKey) {
        let size = new Vector2(0.5, 0.5); 
        super(game, pos, size);
        this.id = "Drop";
        this.image = this.game.assetManager.getImage(imageKey);
        console.log("Item Created at:", pos.x, pos.y, "with key:", imageKey);

        this.timer = 0;
        this.flyDuration = 0.5;
        this.state = "waiting";
        this.screenPos = null;
        this.glowTimer = 0;
    }

    update(events) {
        let dt = deltaTime / 1000;

        if (this.state === "waiting") {
            this.glowTimer += dt;
            this.timer += dt;
            if (this.timer >= 2) {
                this.state = "flying";
                this.timer = 0;
                this.screenPos = this.game.view.localToScreen(this.pos);

                let uibar = this.game.model.scene.getUIElement("uibar");
                this.targetPos = new Vector2(windowWidth / 2, 0);
                if (uibar) {
                    for (let el of uibar.elements) {
                        if (el.drop === this.imageKey) {
                            this.targetPos = new Vector2(el.pos.x, el.pos.y);
                            break;
                        }
                    }
                }
            }

        } else if (this.state === "flying") {
            this.timer += dt;
            if (this.timer >= this.flyDuration) {
                this.state = "done";
                this.game.model.scene.removeEntity(this);
            }
        }
    }

    draw() {
        if (this.state === "done") return;

        let rel_size = this.game.view.localToScreen(this.size);

        if (this.state === "waiting") {
            let rel_pos = this.game.view.localToScreen(this.pos);
            let glowAlpha = (sin(this.glowTimer * 3) + 1) / 2 * 150 + 50; // pulses 50-200

            push();
            drawingContext.shadowBlur = 20;
            drawingContext.shadowColor = `rgba(255, 255, 150, ${glowAlpha / 255})`;
            if (this.image) {
                image(this.image, rel_pos.x, rel_pos.y, rel_size.x, rel_size.y);
            } else {
                fill(255);
                rect(rel_pos.x, rel_pos.y, rel_size.x, rel_size.y);
                console.warn("Missing image for:", this.imageKey);
            }
            pop();

        } else if (this.state === "flying") {
            let t = this.timer / this.flyDuration;
            let startX = this.screenPos.x;
            let startY = this.screenPos.y;
            let targetX = this.targetPos.x + 150;
            let targetY = this.targetPos.y;

            let currentX = lerp(startX, targetX, t);
            let currentY = lerp(startY, targetY, t);

            if (this.image) {
                image(this.image, currentX, currentY, rel_size.x, rel_size.y);
            } else {
                fill(255);
                rect(currentX, currentY, rel_size.x, rel_size.y);
            }
        }
    }
}