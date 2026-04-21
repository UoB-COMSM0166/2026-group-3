import {Vector2} from "../Utility/Vector2.js";
import {Menu} from "./Menu.js";
import {Button} from "./Button.js";
import {Label} from "./Label.js";




export class ShopMenu extends Menu {
    constructor(game, scene){
        super(game, new Vector2(), new Vector2("Left","Top"))
        this.scene = scene;

        this.style.fillColor = color(150);
        this.style.outlineWidth = 3
        this.id = "shop";

        let shopTitle = new Button(game, "WEAPON SHOP", new Vector2(0,0), new Vector2("Left", "Top"));
        shopTitle.parent = this;
        shopTitle.expandToFit.x = true;
        shopTitle.expandToFit.y = true;
        shopTitle.active = false;

        shopTitle.sizeMatch.x = [this]
        this.sizeMatch.x = [shopTitle]



        this.elements.push(shopTitle);

        let shopClose = new Button(game, "", new Vector2(30, 30), new Vector2("Right", "Top"));
        shopClose.parent = this; 
        shopClose.sizeMatch.y = [shopTitle];
        shopClose.expandToFit.y = true;
        shopClose.expandToFit.x = true;
        shopClose.image = "Cross Button";
        shopClose.onClick = function() {
            this.game.model.scene.getUIElement("shop").isVisible = false;
        };

        this.elements.push(shopClose);

        let labelSizeMatch = []
        let priceSizeMatch = []

        let shopWeapons = ["Rifle", "Machine Gun", "The Big Gun"];

        let previous = shopTitle
        for (let i=0; i<shopWeapons.length; i++){
            let weapon = scene.weaponManager.getWeapon(shopWeapons[i])
            let weaponLabel = new Button(game, weapon.name, new Vector2(), new Vector2("Left", "Top"));
            weaponLabel.offset.x = 20;
            weaponLabel.anchor.y = previous
            weaponLabel.offset.y = 10;
            weaponLabel.expandToFit = new Vector2(true, true);
            weaponLabel.parent = this;
            weaponLabel.active = false;

            weaponLabel.sizeMatch.x = labelSizeMatch;
            labelSizeMatch.push(weaponLabel);

            this.elements.push(weaponLabel);

            let weaponPrice = new Button(game, str(weapon.price), new Vector2(), new Vector2("Left", "Top"));
            weaponPrice.offset.y = 10;
            weaponPrice.anchor.x = weaponLabel
            weaponPrice.anchor.y = previous
            weaponPrice.expandToFit = new Vector2(true, true);
            weaponPrice.parent = this;
            weaponPrice.weapon= weapon
            weaponPrice.itemImage = "UI Coin";

            weaponPrice.sizeMatch.x = priceSizeMatch;
            priceSizeMatch.push(weaponPrice);

            weaponPrice.onClick = async function() {
                if (this.game.model.gameState.coins >= weapon.price){
                    this.game.model.gameState.coins -= weapon.price
                    this.game.model.scene.getEntity("player").weapon = this.weapon;
                    this.game.model.gameState.playerWeapon = this.weapon.name;
                    this.game.model.scene.getUIElement("shop").isVisible = false;
                    await this.game.soundManager.playSFX("buy");
                } else {
                    console.log("You can't afford "+this.weapon.name);
                }
            };
            weaponPrice.update = async function(events) {
                if (this.game.model.gameState.coins >= weapon.price){
                    this.style.textColor = color(255)
                } else {
                    this.style.textColor = color(255,50,50)
                }
                //I don't know why super doesn't work here
                //super.update(events);
                if (!this.isVisible || !this.active) { return; }
                if (this.parent!=this.game.view && !this.parent.isVisible) { return; }

                let mousePos = new Vector2(mouseX, mouseY);
                if (mousePos.withinBox(this.pos, this.size)){
                    cursor(HAND);
                }

                for (let event of events){
                    if (event.type == "click"){
                        if (mousePos.withinBox(this.pos, this.size)){
                            this.onClick();
                        }
                    }
                }
            }
            this.elements.push(weaponPrice);

            previous = weaponLabel
        }

        //Turret Purchase Button Options

        let turretLabel = new Button(game, "Turret", new Vector2(), new Vector2("Left", "Top"));
        turretLabel.offset.x = 20;
        turretLabel.anchor.y = previous
        turretLabel.offset.y = 10;
        turretLabel.expandToFit = new Vector2(true, true);
        turretLabel.parent = this;
        turretLabel.active = false;

        turretLabel.sizeMatch.x = labelSizeMatch;
        labelSizeMatch.push(turretLabel);

        this.elements.push(turretLabel);

        let turretPrice = new Button(game, str(scene.turretManager.turretPrice), new Vector2(), new Vector2("Left", "Top"));
        turretPrice.offset.y = 10;
        turretPrice.anchor.x = turretLabel
        turretPrice.anchor.y = previous
        turretPrice.expandToFit = new Vector2(true, true);
        turretPrice.itemImage = "UI Coin";

        turretPrice.sizeMatch.x = priceSizeMatch;
        priceSizeMatch.push(turretPrice);

        turretPrice.parent = this;

        turretPrice.onClick = async function() {
            if (this.game.model.gameState.coins >= this.game.model.scene.turretManager.turretPrice){
                this.game.model.scene.getUIElement("shop").isVisible = false;
                this.game.model.scene.turretManager.buyingTurret = true;
                await this.game.soundManager.playSFX("buy");
            } else {
                console.log("You can't afford Turret");
            }
        };
        turretPrice.update = async function(events) {
            if (this.game.model.gameState.coins >= this.game.model.scene.turretManager.turretPrice){
                this.style.textColor = color(255)
            } else {
                this.style.textColor = color(255,50,50)
            }
            //I don't know why super doesn't work here
            //super.update(events);
            if (!this.isVisible || !this.active) { return; }
            if (this.parent!=this.game.view && !this.parent.isVisible) { return; }

            let mousePos = new Vector2(mouseX, mouseY);
            if (mousePos.withinBox(this.pos, this.size)){
                cursor(HAND);
            }

            for (let event of events){
                if (event.type == "click"){
                    if (mousePos.withinBox(this.pos, this.size)){
                        this.onClick();
                    }
                }
            }
        }

        this.elements.push(turretPrice);

        this.expandToFit = new Vector2(turretPrice,turretPrice);
        this.border = new Vector2(20,20);


    }

    draw(){
        if (!this.isVisible) { return; }

        const cornerSprite = this.game.assetManager.getImage("UI Board Corner");
        const horizontalEdgeSprite = this.game.assetManager.getImage("UI Board Horizontal Edge");
        const verticalEdgeSprite = this.game.assetManager.getImage("UI Board Vertical Edge");
        const middleSprite = this.game.assetManager.getImage("UI Board Middle");

        if (cornerSprite && horizontalEdgeSprite && verticalEdgeSprite && middleSprite){
            const x = Math.round(this.pos.x);
            const y = Math.round(this.pos.y);
            const w = Math.round(this.size.x);
            const h = Math.round(this.size.y);
            const cornerSize = Math.round(Math.min(w / 2, h / 2, this.style.textSize + 12));
            const innerX = x + cornerSize;
            const innerY = y + cornerSize;
            const innerW = Math.max(0, w - (2 * cornerSize));
            const innerH = Math.max(0, h - (2 * cornerSize));

            if (innerW > 0 && innerH > 0){
                image(middleSprite, innerX, innerY, innerW, innerH);
            }

            if (innerW > 0){
                image(horizontalEdgeSprite, innerX, y, innerW, cornerSize);
                push();
                translate(innerX, y + h);
                scale(1, -1);
                image(horizontalEdgeSprite, 0, 0, innerW, cornerSize);
                pop();
            }

            if (innerH > 0){
                image(verticalEdgeSprite, x, innerY, cornerSize, innerH);
                push();
                translate(x + w, innerY);
                scale(-1, 1);
                image(verticalEdgeSprite, 0, 0, cornerSize, innerH);
                pop();
            }

            image(cornerSprite, x, y, cornerSize, cornerSize);
            push();
            translate(x + w, y);
            scale(-1, 1);
            image(cornerSprite, 0, 0, cornerSize, cornerSize);
            pop();
            push();
            translate(x, y + h);
            scale(1, -1);
            image(cornerSprite, 0, 0, cornerSize, cornerSize);
            pop();
            push();
            translate(x + w, y + h);
            scale(-1, -1);
            image(cornerSprite, 0, 0, cornerSize, cornerSize);
            pop();
        } else {
            fill(this.style.fillColor);
            stroke(this.style.outline);
            strokeWeight(this.style.outlineWidth);
            rect(this.pos.x, this.pos.y, this.size.x, this.size.y, this.style.rounding);
        }

        for (let element of this.elements){
            element.draw();
        }
    }
}