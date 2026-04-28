import { Vector2 } from "../Utility/Vector2.js";
import { Label } from "../UIElements/Label.js";
import {IntroScene} from "./IntroScene.js";
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
       this.game.model.scene = new IntroScene(this.game);
      }
    }
  }

  draw() {

  const bg = this.game.assetManager.getImage("Welcome Scene Background");
  if (bg) {
    image(bg, 0, 0, this.game.view.size.x, this.game.view.size.y);
  } else {
    background(255);
  }

  push();
  const t = millis() / 1000;
  const blink = (Math.sin(t * 2.6) + 1) / 2; // faster smooth blink
  const alpha = 80 + blink * 140; // 80..220
  fill(180, alpha);
  textSize(30);
  textAlign(CENTER, CENTER);
  text("[ Press any key to start ]", width / 2, height / 2 + 60);

  pop();

}

}






