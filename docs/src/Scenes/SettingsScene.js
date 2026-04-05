import { Scene } from "../Core/Scene.js";
import { Button } from "../UIElements/Button.js";
import { Label } from "../UIElements/Label.js";
import { Slider } from "../UIElements/Slider.js";
import { Vector2 } from "../Utility/Vector2.js";

export class SettingsScene extends Scene {
  constructor(game) {
    super(game);

    // Settings title
    this.title = new Label(
      game,
      "SETTINGS",
      new Vector2(200, 80),
      new Vector2("Centre", "Centre"),
      new Vector2(100, -210) 
    );
    this.title.style.textSize = 30;
    this.title.style.textAlign = { x: "center", y: "center" };

    // SFX
    this.sfxSubTitle = new Label(
      game,
      "SFX",
      new Vector2(110, 30),
      new Vector2("Centre", "Centre"),
      new Vector2(-60, -90) 
    );
    this.sfxSubTitle.style.textSize = 15;

    // SFX slider
    this.sfxSlider = new Slider(
      game,0, 1,
      this.game.soundManager.sfxVol,
      new Vector2(200, 40),
      new Vector2("Centre", "Centre"),
      new Vector2(90, -100) 
    );

    this.sfxSlider.onClick = (value) => {
      let amp = Math.sin((value * Math.PI) / 2); // smoother sound curve
      this.game.soundManager.sfxVol = amp;
    };

    // Music
    this.musicSubTitle = new Label(
      game,
      "Music",
      new Vector2(110, 30),
      new Vector2("Centre", "Centre"),
      new Vector2(-60, -40) 
    );
    this.musicSubTitle.style.textSize = 15;

    // Music slider
    this.musicSlider = new Slider(
      game, 0, 1,
      this.game.soundManager.musicVol,
      new Vector2(200, 40),
      new Vector2("Centre", "Centre"),
      new Vector2(90, -50) 
    );

    this.musicSlider.onClick = (value) => {
      const msliderVal = value;
      this.game.soundManager.musicVol = msliderVal;
      this.game.soundManager.gameMusic.amp(msliderVal);
    };

    // Text Resize
    this.textResizeSubTitle = new Label(
      game,
      "Text Resize",
      new Vector2(110, 30),
      new Vector2("Centre", "Centre"),
      new Vector2(-60, 60)
    );
    this.textResizeSubTitle.style.textSize = 13;

    // Text Resize slider
    this.textResizeSlider = new Slider(
      game, 0, 1, 0.5,
      new Vector2(200, 40),
      new Vector2("Centre", "Centre"),
      new Vector2(90, 47) 
    );

    // Brightness
    this.brightnessSubTitle = new Label(
      game,
      "Brightness",
      new Vector2(110, 30),
      new Vector2("Centre", "Centre"),
      new Vector2(-60, 110) 
    );
    this.brightnessSubTitle.style.textSize = 13;

    // Brightness slider
    this.brightnessSlider = new Slider(
      game, 0, 1, 0.5,
      new Vector2(200, 40),
      new Vector2("Centre", "Centre"),
      new Vector2(90, 98) 
    );

    this.brightnessSlider.onClick = (value) => {
      this.game.brightness = value;
    };

    // Back button
    this.backButton = new Button(
      game,
      "Back",
      new Vector2(100, 35),
      new Vector2("Left", "Top"),
      new Vector2(20, 20)
    );

    this.backButton.onClick = () => {
      // Hide all SettingsScene UI elements
      this.getUIElements().forEach((el) => (el.isVisible = false));

      this.whenClose();
    };

    this.showSettings = false;

    // Add elements
    [
      this.title,
      this.sfxSubTitle,
      this.sfxSlider,
      this.musicSlider,
      this.musicSubTitle,
      this.textResizeSubTitle,
      this.textResizeSlider,
      this.brightnessSubTitle,
      this.brightnessSlider,
      this.backButton,
    ].forEach((el) => this.addUIElement(el));
  }
}


















