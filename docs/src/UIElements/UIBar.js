
import {Vector2} from "../Utility/Vector2.js";
import {Menu} from "./Menu.js";
import {Button} from "./Button.js";
import {Label} from "./Label.js";
import {PhaseProgressBar} from "./PhaseProgressBar.js";




export class UIBar extends Menu {
    constructor(game, scene){
        super(game, new Vector2(), new Vector2("Left","Top"))
        this.scene = scene;

        this.id = "uibar";

        this.style.fillColor = color(200);

        this.menuButton = new Button(game, "",
                                    new Vector2(), 
                                    new Vector2("Left","Top"),
                                    new Vector2(10,10))
        this.menuButton.expandToFit = new Vector2(true, true);
        this.menuButton.image = "Menu Button";

        this.menuButton.onClick = function() {
            this.game.model.togglePaused();
        };

        this.elements.push(this.menuButton);

        this.shopButton = new Button(game, "Shop",
                                    new Vector2(), 
                                    new Vector2("Left","Top"),
                                    new Vector2(10,10))
        this.shopButton.anchor.x = this.menuButton;
        this.shopButton.expandToFit = new Vector2(true, true);

        this.shopButton.onClick = function() {
            if (this.game.model.scene.zombieManager.waveStarted) {return;}
            this.game.model.scene.getUIElement("shop").isVisible = true;
        };

        this.elements.push(this.shopButton);

        this.coinsLabel = new Label(game, "0",
                                    new Vector2(), 
                                    new Vector2("Left","Top"),
                                    new Vector2(10,10))
        this.coinsLabel.anchor.x = this.shopButton;
        this.coinsLabel.expandToFit = new Vector2(true, true);
        this.coinsLabel.itemImage = "UI Coin";
        this.coinsLabel.itemImageScale = 0.8;
        this.coinsLabel.update = function(events) {
            this.label = str(this.game.model.gameState.coins);
        }

        this.elements.push(this.coinsLabel);

        let drops = game.model.drops;
        let previous = this.coinsLabel;
        for (let i=0; i < drops.length; i++){
            let dropCount = new Label(game, "0", new Vector2(), 
                                            new Vector2("Left", "Top"),
                                            new Vector2(10,10));
            dropCount.anchor.x = previous;
            dropCount.expandToFit = new Vector2(true, true);
            dropCount.drop = drops[i];
            dropCount.parent = this
            dropCount.itemImage = drops[i];

            dropCount.update = function(events) {
                this.label = str(this.game.model.gameState.inventory.get(this.drop));
                this.parent.resize()
            }

            this.elements.push(dropCount);
            previous = dropCount;
        }   

        this.dayLabel = new Label(game, "Day 1",
                                    new Vector2(), 
                                    new Vector2("Right","Top"),
                                    new Vector2(-10,10))
        this.dayLabel.label = game.model.gameState.time + " "+str(game.model.gameState.phase);
        this.dayLabel.expandToFit = new Vector2(true, true);

        this.elements.push(this.dayLabel);

        this.phaseProgressBar = new PhaseProgressBar(game, previous, this.dayLabel);

        this.elements.push(this.phaseProgressBar);



    }

    resize(){
        this.size.x = this.game.view.size.x
        this.size.y = 1.5 * this.game.view.textSize + 20;
        super.resize()
        
    }


}