import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";
import { Turret } from "./Turret.js";




export class TurretManager extends Entity{
    constructor(game, scene){
        super(game);
        this.scene = scene;
        this.turretPositions = [];
        this.spaceSize = new Vector2(1.5, 1.5);

        for (let row of this.scene.rows){
            this.turretPositions.push(new Vector2(5, row));
        }
        this.buyingTurret = false;
        this.turretPrice = 60;

        this.ghostTurret = new Turret(game, this.pos, true);

        for (let turret of this.game.model.gameState.turrets){
            this.scene.addEntity(turret);
        }

    }

    inValidPosition(targetPos){
        for (let pos of this.turretPositions){
            if (targetPos.withinBox(pos, this.spaceSize)){
                if (this.scene.getEntities("Turret") != null){
                    for (let placedTurret of this.scene.getEntities("Turret")){
                        if (placedTurret.pos.y == pos.y + 0.25){
                            return null;
                        }
                    }
                }
                return pos.add(new Vector2(0, 0.25));
            }
        }
        return null;
    }


    draw(){
        if (this.game.debug){
            //Show Turret Positions in Debug
            let rel_size = this.game.view.localToScreen(this.spaceSize);
            for (let pos of this.turretPositions){
                let rel_pos = this.game.view.localToScreen(pos);
                fill(0,0,0,0);
                stroke(0,200,0);
                rect(rel_pos.x, rel_pos.y, rel_size.x, rel_size.y);
            }
        }
        if (this.buyingTurret){
            let mousePos = new Vector2(mouseX, mouseY);
            let localMouse = this.game.view.screenToLocal(mousePos)

            if (this.inValidPosition(localMouse) == null){
                this.ghostTurret.pos = localMouse.sub(this.ghostTurret.size.divide(2));
            } else {
                this.ghostTurret.pos = this.inValidPosition(localMouse);
            }
            this.ghostTurret.draw();
        }

    }

    update(events){

        for (let event of events){
            if (event.type == "click" && this.buyingTurret){
                this.buyingTurret = false;
                let mousePos = new Vector2(mouseX, mouseY);
                let localMouse = this.game.view.screenToLocal(mousePos)
                let targetPos = this.inValidPosition(localMouse);
                
                if (targetPos != null){
                    let turret = new Turret(this.game, targetPos);
                    this.scene.addEntity(turret);
                    this.game.model.gameState.turrets.push(turret);
                    this.game.model.gameState.coins -= this.turretPrice;
                }
            }
        }




    }



}