import { Scene } from "../Core/Scene.js";
import { Button } from "../UIElements/Button.js";
import { Label } from "../UIElements/Label.js";
import { Vector2 } from "../Utility/Vector2.js";
import { ShooterScene } from "../Scenes/ShooterScene.js";
import { KitchenScene_MVP } from "../Scenes/KitchenScene_MVP.js";

export class WelcomeScene extends Scene {
  constructor(game) {
    super(game);

    // Title
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

    //Main Menu Buttons 
    this.playButton = new Button(game, "Play", new Vector2(200, 50), new Vector2("Centre", "Top"), new Vector2(0, 320));
    this.instructionsButton = new Button(game, "Instructions", new Vector2(200, 50), new Vector2("Centre", "Top"), new Vector2(0, 390));
    this.settingsButton = new Button(game, "Settings", new Vector2(200, 50), new Vector2("Centre", "Top"), new Vector2(0, 460));
    this.quitButton = new Button(game, "Quit", new Vector2(200, 50), new Vector2("Centre", "Top"), new Vector2(0, 530));

    // Test Kitchen Button (temporary debug access)
    this.testKitchenButton = new Button(
      game,
      "Test Kitchen",
      new Vector2(200, 50),
      new Vector2("Centre", "Top"),
      new Vector2(0, 600)
    );

    //Difficulty Buttons
    this.easyButton = new Button(game, "Easy", new Vector2(200, 50), new Vector2("Centre", "Top"), new Vector2(0, 320));
    this.mediumButton = new Button(game, "Medium", new Vector2(200, 50), new Vector2("Centre", "Top"), new Vector2(0, 390));
    this.hardButton = new Button(game, "Hard", new Vector2(200, 50), new Vector2("Centre", "Top"), new Vector2(0, 460));
    this.backButton = new Button(game, "Back", new Vector2(200, 50), new Vector2("Centre", "Top"), new Vector2(0, 530));

    //Hide difficulty buttons initially
    [this.easyButton, this.mediumButton, this.hardButton, this.backButton].forEach(b => b.isVisible = false);

    //Button Actions

    //Play Button: show difficulty menu
    this.playButton.onClick = () => {
      [this.playButton, this.instructionsButton, this.settingsButton, this.quitButton,this.testKitchenButton]
        .forEach(b => b.isVisible = false);

      //Small delay before showing difficulty buttons
      //as soon as i clicked play game was running as the 'easy' button was placed just below it 
      setTimeout(() => {
        [this.easyButton, this.mediumButton, this.hardButton, this.backButton]
          .forEach(b => b.isVisible = true);
      }, 50);
    };

    //Difficulty buttons
    this.easyButton.onClick = () => this.startGame("easy");
    this.mediumButton.onClick = () => this.startGame("medium");
    this.hardButton.onClick = () => this.startGame("hard");

    //Back button: return to main menu
    this.backButton.onClick = () => {
      [this.easyButton, this.mediumButton, this.hardButton, this.backButton].forEach(b => b.isVisible = false);
      [this.playButton, this.instructionsButton, this.settingsButton, this.quitButton,this.testKitchenButton].forEach(b => b.isVisible = true);
    };

    // Test Kitchen Button → Directly enter KitchenScene
    this.testKitchenButton.onClick = () => {
      this.game.model.scene = new KitchenScene_MVP(this.game);
    };

    [
      this.title,
      this.playButton,
      this.instructionsButton,
      this.settingsButton,
      this.quitButton,
      this.testKitchenButton,
      this.easyButton,
      this.mediumButton,
      this.hardButton,
      this.backButton
    ].forEach(el => this.addUIElement(el));
  }

  //Start Shooter Scene 
  startGame(difficulty) {
    this.game.model.difficulty = difficulty;
    this.game.model.scene = new ShooterScene(this.game);
  }
}













