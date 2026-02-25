//Test Scene
import {Scene} from "../Core/Scene.js";
import {TestEntity} from "../Entities/TestEntity.js";
import {TestUIElement} from "../UIElements/TestUIElement.js";
import {Button} from "../UIElements/Button.js";
import {Vector2} from "../Utility/Vector2.js";
import {Label} from "../UIElements/Label.js"
import {Menu} from "../UIElements/Menu.js";

export class TestScene extends Scene {
    constructor(game){
        super(game);

        let testEntity = new TestEntity(game);
        this.entities.push(testEntity);

        let button = new Button(game, "Button!", new Vector2(110,30), new Vector2("Right","Top"));
        button.offset.x = -110;

        button.onClick = function() {
            for (let entity of this.game.model.scene.entities){
                entity.pos.x = random(0, this.game.gridSize.x - entity.size.x);
                entity.pos.y = random(0, this.game.gridSize.y - entity.size.y);
            }
        }
        
        this.uielements.push(button);
        let label = new Label(game, "Label", new Vector2(110,30), new Vector2("Right","Top"));
        this.uielements.push(label);

        let menu = new Menu(game, new Vector2(350,150), new Vector2("Centre","Centre"));
        menu.isVisible = false;
        menu.id = "menu";
        this.uielements.push(menu);

        let menuButton = new Button(game, "Menu", new Vector2(110,30), new Vector2("Left","Top"));
        
        menuButton.onClick = function() {
            for (let uiElement of this.game.model.scene.uielements){
                if (uiElement.id == "menu"){
                    uiElement.isVisible = true;
                }
            }
        }

        this.uielements.push(menuButton);

        let menuLabel = new Label(game, "Super Menu", new Vector2(100,70), new Vector2("Left","Top"));
        menuLabel.parent = menu;
        menu.elements.push(menuLabel);

        let menuClose = new Button(game, "Close", new Vector2(110,30), new Vector2("Right","Top"));
        menuClose.parent = menu;

        menuClose.onClick = function() {
            this.parent.isVisible = false;
        }

        menu.elements.push(menuClose);




    }
}