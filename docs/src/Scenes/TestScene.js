//Test Scene
import {Scene} from "../Core/Scene.js";
import {TestEntity} from "../Entities/TestEntity.js";
import {TestUIElement} from "../UIElements/TestUIElement.js";
import {Button} from "../UIElements/Button.js";
import {Vector2} from "../Utility/Vector2.js";

export class TestScene extends Scene {
    constructor(game){
        super(game);

        let testEntity = new TestEntity(game);
        this.entities.push(testEntity);

        let button = new Button(game, "Randomise", new Vector2(110,30), new Vector2("Right","Top"));
        button.offset.x = -110;

        button.onClick = function() {
            for (let entity of this.game.model.scene.entities){
                entity.pos.x = random(0, this.game.gridSize.x - entity.size.x);
                entity.pos.y = random(0, this.game.gridSize.y - entity.size.y);
            }
        }
        
        this.uielements.push(button);
        let button2 = new Button(game, "Nothing", new Vector2(110,30), new Vector2("Right","Top"));
        this.uielements.push(button2);

    }
}