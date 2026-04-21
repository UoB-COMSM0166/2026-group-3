import { Menu } from "../UIElements/Menu.js";
import { Button } from "../UIElements/Button.js";
import { Label } from "../UIElements/Label.js";
import { Slider } from "../UIElements/Slider.js";
import { Vector2 } from "../Utility/Vector2.js";

export class SettingsScene extends Menu {
  constructor(game) {
    super(game, new Vector2(420,300));

    this.style.fillColor = color(150);
    this.style.outlineWidth = 3
    this.id = "shop";

    // Settings title
    this.title = new Label(
      game,
      "SETTINGS",
      new Vector2(420, 50),
      new Vector2("Centre", "Top"),
      new Vector2() 
    );
    this.title.style.textSize = 30;
    this.title.textSizeOverride = true;
    this.title.style.textAlign = { x: "center", y: "center" };
    this.title.parent = this;

    // SFX
    this.sfxSubTitle = new Label(
      game,
      "SFX",
      new Vector2(180, 30),
      new Vector2("Left", "Top"),
      new Vector2(10,30) 
    );
    this.sfxSubTitle.anchor.y = this.title
    this.sfxSubTitle.parent = this;
    this.sfxSubTitle.expandToFit.y = true;

    // SFX slider
    this.sfxSlider = new Slider(
      game,0, 1,
      this.game.soundManager.sfxVol,
      new Vector2(200, 30),
      new Vector2("Left", "Top"),
      new Vector2(10, 30) 
    );
    this.sfxSlider.parent = this
    this.sfxSlider.anchor.x = this.sfxSubTitle
    this.sfxSlider.anchor.y = this.title

    this.sfxSlider.onClick = (value) => {
      let amp = Math.sin((value * Math.PI) / 2); // smoother sound curve
      this.game.soundManager.sfxVol = amp;
    };

    // Music
    this.musicSubTitle = new Label(
      game,
      "Music",
      new Vector2(180, 30),
      new Vector2("Left", "Top"),
      new Vector2(10, 80) 
    );
    this.musicSubTitle.anchor.y = this.title
    this.musicSubTitle.parent = this;
    this.musicSubTitle.expandToFit.y = true;

    // Music slider
    this.musicSlider = new Slider(
      game, 0, 1,
      this.game.soundManager.musicVol,
      new Vector2(200, 30),
      new Vector2("Left", "Top"),
      new Vector2(10, 80) 
    );
    this.musicSlider.parent = this;
    this.musicSlider.anchor.x = this.musicSubTitle;
    this.musicSlider.anchor.y = this.title;

    this.musicSlider.onClick = (value) => {
      const msliderVal = value;
      this.game.soundManager.musicVol = msliderVal;
      this.game.soundManager.gameMusic.amp(msliderVal);
    };

    // Text Resize
    this.textResizeSubTitle = new Label(
      game,
      "Text Size",
      new Vector2(180, 30),
      new Vector2("Left", "Top"),
      new Vector2(10, 130)
    );
    this.textResizeSubTitle.anchor.y = this.title;
    this.textResizeSubTitle.parent = this;
    this.textResizeSubTitle.expandToFit.y = true;

    // Text Resize slider
    this.textResizeSlider = new Slider(
      game, 10, 30, this.game.view.textSize,
      new Vector2(200, 30),
      new Vector2("Left", "Top"),
      new Vector2(10, 130) 
    );
    this.textResizeSlider.parent = this;
    this.textResizeSlider.anchor.x = this.textResizeSubTitle;
    this.textResizeSlider.anchor.y = this.title;

    this.textResizeSlider.onClick = (value) => {
      this.game.view.textSize = value;
      this.game.view.resize();
    };

    // Brightness
    this.brightnessSubTitle = new Label(
      game,
      "Brightness",
      new Vector2(180, 30),
      new Vector2("Left", "Top"),
      new Vector2(10, 180) 
    );
    this.brightnessSubTitle.anchor.y = this.title;
    this.brightnessSubTitle.parent = this;
    this.brightnessSubTitle.expandToFit.y = true;

    // Brightness slider
    this.brightnessSlider = new Slider(
      game, 0, 1, 1,
      new Vector2(200, 30),
      new Vector2("Left", "Top"),
      new Vector2(10, 180) 
    );
    this.brightnessSlider.parent = this;
    this.brightnessSlider.anchor.x = this.brightnessSubTitle;
    this.brightnessSlider.anchor.y = this.title;

    this.brightnessSlider.onClick = (value) => {
      this.game.brightness = value;
    };

    // Back button
    this.backButton = new Button(
      game,
      "",
      new Vector2(32, 32),
      new Vector2("Right", "Top"),
      new Vector2(-8, 8)
    );
    this.backButton.parent = this;
    this.backButton.image = "Cross Button";
    this.backButton.expandToFit.x = false;
    this.backButton.expandToFit.y = false;

    this.backButton.onClick = function() {

      // Hide all SettingsScene 
      this.parent.isVisible = false;
    };

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
    ].forEach((el) => this.elements.push(el));
  }
}


















