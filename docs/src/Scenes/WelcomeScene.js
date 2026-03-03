import { Scene } from "../Core/Scene.js";
import { Button } from "../UIElements/Button.js";
import { Label } from "../UIElements/Label.js";
import { Vector2 } from "../Utility/Vector2.js";
import { ShooterScene } from "../Scenes/ShooterScene.js";
//import { InstructionsScene } from "../Scenes/InstructionsScene.js";
//import { SettingsScene } from "../Scenes/SettingsScene.js";

export class WelcomeScene extends Scene {
  constructor(game) {
    super(game);

    // initialise entities array
    this.entities = [];

    // title label
    this.title = new Label(
      game,
      "DOOMSDAY KITCHEN",
      new Vector2(600, 80),
      new Vector2("Centre", "Top"),
      new Vector2(0, 180)
    );
    this.title.style.textSize = 48;
    this.title.style.textColor = "#00FF00";
    this.title.style.textAlign = { x: "center", y: "center" };

    // buttons
    this.playButton = new Button(game, "Play", new Vector2(200, 50), new Vector2("Centre", "Top"), new Vector2(0, 320));
    this.InstructionsButton = new Button(game, "Instructions", new Vector2(200, 50), new Vector2("Centre", "Top"), new Vector2(0, 390));
    this.settingsButton = new Button(game, "Settings", new Vector2(200, 50), new Vector2("Centre", "Top"), new Vector2(0, 460));
    this.quitButton = new Button(game, "Quit", new Vector2(200, 50), new Vector2("Centre", "Top"), new Vector2(0, 530));


    // on click for play 
    this.playButton.onClick = () => {
    this.game.model.scene = new ShooterScene(this.game);
};

// on click instructions
//this.InstructionsButton.onClick= () => { this.game.model.loadScene(new InstructionsScene(this.game)); };
  

 // on click settings
// this.settingsButton.onClick = () => {
//     this.game.model.loadScene(new SettingsScene(this.game));
// };

// // on click quit
// this.quitButton.onClick = () => {
//     window.close();
//};

    // add to entities
    this.entities.push(
      this.title,
      this.playButton,
      this.InstructionsButton,
      this.settingsButton,
      this.quitButton
    );
  }

}















