import { Scene } from "../Core/Scene.js";
import { Button } from "../UIElements/Button.js";
import { Label } from "../UIElements/Label.js";
import { Vector2 } from "../Utility/Vector2.js";
import { ShooterScene } from "../Scenes/ShooterScene.js";
import { KitchenScene_MVP } from "../Scenes/KitchenScene_MVP.js";
import { Inventory } from "../Core/Inventory.js";
import { SettingsScene } from "../Scenes/SettingsScene.js";
import { InstructionsScene } from "../Scenes/InstructionsScene.js";

export class WelcomeScene extends Scene {
  constructor(game) {
    super(game);
    this.settings = new SettingsScene(this.game);
    this.settings.isVisible = false;
    this.instructions = new InstructionsScene(this.game);
    this.instructions.isVisible = false;

  this.background = "Kitchen Background";

    // Title
    this.title = new Label(
      game,
      "DOOMSDAY KITCHEN",
      new Vector2(600, 80),
      new Vector2("Centre", "Top"),
      new Vector2(0, 180)
    );
    this.title.style.textSize = 60;
    this.title.style.textColor = "#00FF00";
    this.title.style.textAlign = { x: "center", y: "center" };
    this.title.expandToFit.x = true;

    this.title.textSizeOverride = true;

    //Main Menu Buttons 
    this.playButton = new Button(game, "Play", new Vector2(220, 50), new Vector2("Centre", "Top"), new Vector2(0, 320));
    this.instructionsButton = new Button(game, "Instructions", new Vector2(220, 50), new Vector2("Centre", "Top"), new Vector2(0, 390));
    this.settingsButton = new Button(game, "Settings", new Vector2(220, 50), new Vector2("Centre", "Top"), new Vector2(0, 460));
    
    this.menuButtons = [this.playButton, this.instructionsButton, this.settingsButton]
    this.menuButtons.forEach(b => b.sizeMatch.x = this.menuButtons);

    // Test Kitchen Button (temporary debug access)
    this.testKitchenButton = new Button(
      game,
      "Test Kitchen",
      new Vector2(220, 50),
      new Vector2("Centre", "Top"),
      new Vector2(0, 600)
    );

    //Difficulty Buttons
    this.easyButton = new Button(game, "Easy", new Vector2(220, 50), new Vector2("Centre", "Top"), new Vector2(0, 320));
    this.mediumButton = new Button(game, "Medium", new Vector2(220, 50), new Vector2("Centre", "Top"), new Vector2(0, 390));
    this.hardButton = new Button(game, "Hard", new Vector2(220, 50), new Vector2("Centre", "Top"), new Vector2(0, 460));
    this.backButton = new Button(game, "Back", new Vector2(220, 50), new Vector2("Centre", "Top"), new Vector2(0, 530));

    //Hide difficulty buttons initially
    this.difficultyButtons = [this.easyButton, this.mediumButton, this.hardButton, this.backButton];
    [this.easyButton, this.mediumButton, this.hardButton, this.backButton].forEach(b => b.isVisible = false);
    this.difficultyButtons.forEach(b => b.sizeMatch.x = this.difficultyButtons)

    //Button Actions

    //Play Button: show difficulty menu
    this.playButton.onClick = () => {
      [this.playButton, this.instructionsButton, this.settingsButton, this.testKitchenButton]
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
    this.mediumButton.onClick = () => this.startGame("normal");
    this.hardButton.onClick = () => this.startGame("hard");

    //Back button: return to main menu
    this.backButton.onClick = () => {
      [this.easyButton, this.mediumButton, this.hardButton, this.backButton].forEach(b => b.isVisible = false);
      [this.playButton, this.instructionsButton, this.settingsButton, this.testKitchenButton].forEach(b => b.isVisible = true);
    };

    // Settings Button: Go to settings
    this.settingsButton.onClick = function(){
      this.game.model.scene.settings.isVisible = true;
    };


 this.instructionsButton.onClick = () => {

      // Hide all SettingsScene UI elements
      this.getUIElements().forEach((el) => (el.isVisible = false));

      
    };


     // Instructions Button: go to instructions
    this.instructionsButton.onClick = function(){
      this.game.model.scene.instructions.isVisible = true;
    };


    // Test Kitchen Button → Directly enter KitchenScene
    this.testKitchenButton.onClick = () => {
      this.game.model.difficulty = "normal";
      this.game.model.gameState.inventory = new Inventory({
            // Starter stock for all menu recipes in test kitchen mode
            "Zombie Mince": 100,
            "Zombie Belly": 100,
            "Zombie Juice": 100,
            "Prime Bone": 100,
            "Zombie Drumstick": 100,
          });
      this.game.model.scene = new KitchenScene_MVP(this.game);
    };

    [
      this.title,
      this.playButton,
      this.instructionsButton,
      this.settingsButton,
      this.testKitchenButton,
      this.easyButton,
      this.mediumButton,
      this.hardButton,
      this.backButton,
      this.settings,
      this.instructions,
    ].forEach(el => this.addUIElement(el));
  }


  // Disable Welcome Scene buttons while menus are open
update(events) {

  if (this.settings.isVisible) {
    this.settings.update(events);
    return;
  }

  if (this.instructions.isVisible) {
    this.instructions.update(events);
    return;
  }

  super.update(events);
}

  draw() {

const background = this.game.assetManager.getImage(this.background);
        image(
            background,
            0,
    0,
            this.game.view.size.x,
            this.game.view.size.y
        );

    super.draw();

    if (this.settings.isVisible) {
      push();

      // Grey overlay/brightness effect
      fill(0, 50);
      rect(0, 0, width, height); 

      this.settings.draw(); 
      pop();
    }
  }

  //Start Shooter Scene 
  startGame(difficulty) {
    this.game.model.difficulty = difficulty;
    this.game.model.scene = new ShooterScene(this.game);
  }
}













