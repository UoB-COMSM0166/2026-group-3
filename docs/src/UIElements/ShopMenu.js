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

        let shopTitle = new Label(game, "WEAPON SHOP", new Vector2(0,0), new Vector2("Left", "Top"));
        shopTitle.parent = this;
        shopTitle.expandToFit.x = true;
        shopTitle.expandToFit.y = true;

        shopTitle.sizeMatch.x = [this]
        this.sizeMatch.x = [shopTitle]



        this.elements.push(shopTitle);

        let shopClose = new Button(game, "X", new Vector2(30, 30), new Vector2("Right", "Top"));
        shopClose.parent = this; 
        shopClose.sizeMatch.y = [shopTitle];
        shopClose.expandToFit.y = true;
        shopClose.expandToFit.x = true;
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
            let weaponLabel = new Label(game, weapon.name, new Vector2(), new Vector2("Left", "Top"));
            weaponLabel.offset.x = 20;
            weaponLabel.anchor.y = previous
            weaponLabel.offset.y = 10;
            weaponLabel.expandToFit = new Vector2(true, true);
            weaponLabel.parent = this;

            weaponLabel.sizeMatch.x = labelSizeMatch;
            labelSizeMatch.push(weaponLabel);

            this.elements.push(weaponLabel);

            let weaponPrice = new Button(game, str(weapon.price)+"🪙", new Vector2(), new Vector2("Left", "Top"));
            weaponPrice.offset.y = 10;
            weaponPrice.anchor.x = weaponLabel
            weaponPrice.anchor.y = previous
            weaponPrice.expandToFit = new Vector2(true, true);
            weaponPrice.parent = this;
            weaponPrice.weapon= weapon

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

        let turretLabel = new Label(game, "Turret", new Vector2(), new Vector2("Left", "Top"));
        turretLabel.offset.x = 20;
        turretLabel.anchor.y = previous
        turretLabel.offset.y = 10;
        turretLabel.expandToFit = new Vector2(true, true);
        turretLabel.parent = this;

        turretLabel.sizeMatch.x = labelSizeMatch;
        labelSizeMatch.push(turretLabel);

        this.elements.push(turretLabel);

        let turretPrice = new Button(game, str(scene.turretManager.turretPrice)+"🪙", new Vector2(), new Vector2("Left", "Top"));
        turretPrice.offset.y = 10;
        turretPrice.anchor.x = turretLabel
        turretPrice.anchor.y = previous
        turretPrice.expandToFit = new Vector2(true, true);

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
}