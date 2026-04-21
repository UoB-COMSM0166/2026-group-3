
import {Vector2} from "../Utility/Vector2.js";
import {Menu} from "./Menu.js";
import {Button} from "./Button.js";
import {Label} from "./Label.js";
import {PhaseProgressBar} from "./PhaseProgressBar.js";
import { CounterLabel } from "./CounterLabel.js";




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

        this.coinsLabel = new CounterLabel(game, "0",
                                    new Vector2(), 
                                    new Vector2("Left","Top"),
                                    new Vector2(10,10))
        this.coinsLabel.anchor.x = this.shopButton;
        this.coinsLabel.expandToFit = new Vector2(true, true);
        this.coinsLabel.itemImage = "UI Coin";
        this.coinsLabel.update = function(events) {
            this.label = str(this.game.model.gameState.coins);
        }

        this.elements.push(this.coinsLabel);

        let drops = game.model.drops;
        let previous = this.coinsLabel;
        for (let i=0; i < drops.length; i++){
            let dropCount = new CounterLabel(game, "0", new Vector2(), 
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

            // let dropLabel = new Label(game, "", new Vector2(), 
            //                                 new Vector2("Left", "Top"),
            //                                 new Vector2(0,10));
            // dropLabel.anchor.x = dropCount;
            // dropLabel.expandToFit = new Vector2(true, true);
            // dropLabel.image = drops[i];
            // dropLabel.parent = this

            // this.elements.push(dropLabel);

            previous = dropCount;
        }   

        this.dayLabel = new Button(game, "Day 1",
                                    new Vector2(), 
                                    new Vector2("Right","Top"),
                                    new Vector2(-10,10))
        this.dayLabel.active = false;
        this.dayLabel.label = game.model.gameState.time + " "+str(game.model.gameState.phase);

        this.elements.push(this.dayLabel);

        this.phaseProgressBar = new PhaseProgressBar(game, previous, this.dayLabel);

        this.elements.push(this.phaseProgressBar);



    }

    draw(){
        if (!this.isVisible) { return; }

        // Background fill (under the frame sprites)
        noStroke();
        fill(this.style.fillColor);
        rect(this.pos.x, this.pos.y, this.size.x, this.size.y, this.style.rounding);

        const cornerSprite = this.game.assetManager.getImage("UI Board Corner");
        const edgeSprite = this.game.assetManager.getImage("UI Board Horizontal Edge");

        if (cornerSprite && edgeSprite){
            // Scale the frame sprites smaller so they fit fully inside the bar.
            const frameScale = 0.72;
            const cornerSize = Math.min(this.size.x / 2, this.size.y * frameScale);
            const edgeH = cornerSize;

            const drawFlipped = (sprite, x, y, w, h, flipX, flipY) => {
                push();
                translate(
                    x + (flipX ? w : 0),
                    y + (flipY ? h : 0)
                );
                scale(flipX ? -1 : 1, flipY ? -1 : 1);
                image(sprite, 0, 0, w, h);
                pop();
            };

            // Corners (flip to get all 4)
            drawFlipped(cornerSprite, this.pos.x, this.pos.y, cornerSize, cornerSize, false, false); // top-left
            drawFlipped(cornerSprite, this.pos.x + this.size.x - cornerSize, this.pos.y, cornerSize, cornerSize, true, false); // top-right
            drawFlipped(cornerSprite, this.pos.x, this.pos.y + this.size.y - cornerSize, cornerSize, cornerSize, false, true); // bottom-left
            drawFlipped(cornerSprite, this.pos.x + this.size.x - cornerSize, this.pos.y + this.size.y - cornerSize, cornerSize, cornerSize, true, true); // bottom-right

            const edgeX = this.pos.x + cornerSize;
            const edgeW = Math.max(0, this.size.x - (2 * cornerSize));

            // Top/bottom edges across the bar
            image(edgeSprite, edgeX, this.pos.y, edgeW, edgeH);
            drawFlipped(edgeSprite, edgeX, this.pos.y + this.size.y - edgeH, edgeW, edgeH, false, true);
        }

        for (let element of this.elements){
            element.draw();
        }
    }

    resize(){
        this.size.x = windowWidth
        this.size.y = 1.5 * this.style.textSize + 20;
        super.resize()
        
    }


}