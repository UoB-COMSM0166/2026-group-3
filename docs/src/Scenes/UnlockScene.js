import { Vector2 } from "../Utility/Vector2.js";
import { Label } from "../UIElements/Label.js";
import { WelcomeScene } from "./WelcomeScene.js";

export class UnlockScene {
  constructor(game) {
    this.game = game;
    this.uielements = [];
    
  }

  update(events) {
    for (let event of events) {
      if (event.type === "keydown") {
         userStartAudio();
       this.game.model.scene = new WelcomeScene(this.game);
      }
    }
  }

  draw() {

 push();
 fill(0);
 textSize(30);
 textAlign(CENTER, CENTER);
 text("Press any key to start!", width / 2, height / 2);

 pop();

}

}






