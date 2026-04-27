import {Vector2} from "../Utility/Vector2.js";
import {Menu} from "./Menu.js";
import {Button} from "./Button.js";
import {Label} from "./Label.js";
import { SettingsScene } from "../Scenes/SettingsScene.js";
import { InstructionsScene } from "../Scenes/InstructionsScene.js";
import { WelcomeScene } from "../Scenes/WelcomeScene.js";
import { GameState } from "../Core/GameState.js";

export class PauseMenu extends Menu {
    constructor(game){
        super(game, new Vector2(290,250), new Vector2("Centre","Centre"))

        this.style.fillColor = color(150);
        this.style.outlineWidth = 3
        this.id = "pausemenu";

        let pauseTitle = new Label(game, "PAUSED", new Vector2(270,50), new Vector2("Left", "Top"));
        pauseTitle.parent = this;
        pauseTitle.expandToFit.y = true;
        pauseTitle.offset = new Vector2(10,5);

        this.elements.push(pauseTitle);

        this.settingsMenu = new SettingsScene(game);
        this.instructionsMenu = new InstructionsScene(game);

        this.settingsMenu.parent = this;
        this.instructionsMenu.parent = this;

        this.settingsMenu.sticky.x = "Left";
        this.instructionsMenu.sticky.x = "Left";

        this.settingsMenu.isVisible = false;
        this.instructionsMenu.isVisible = false;

        this.settingsMenu.anchor.x = this;
        this.instructionsMenu.anchor.x = this;

        this.elements.push(this.settingsMenu);
        this.elements.push(this.instructionsMenu)

        let resumeButton = new Button(game, "Resume", new Vector2(270, 50), new Vector2("Left", "Top"))

        resumeButton.parent = this;
        resumeButton.expandToFit.y = true;
        resumeButton.anchor.y = pauseTitle;
        resumeButton.offset = new Vector2(10,15);

        resumeButton.onClick = function() {
            this.game.model.togglePaused();
        };

        this.elements.push(resumeButton);

        let settingsButton = new Button(game, "Settings", new Vector2(270, 50), new Vector2("Left", "Top"))

        settingsButton.parent = this;
        settingsButton.expandToFit.y = true;
        settingsButton.anchor.y = resumeButton;
        settingsButton.offset = new Vector2(10,15);

        settingsButton.onClick = function() {
            this.game.model.pauseMenu.settingsMenu.isVisible = !this.game.model.pauseMenu.settingsMenu.isVisible;
            this.game.model.pauseMenu.instructionsMenu.isVisible = false;
        };

        this.elements.push(settingsButton);

        let instructionsButton = new Button(game, "Instructions", new Vector2(270, 50), new Vector2("Left", "Top"))

        instructionsButton.parent = this;
        instructionsButton.expandToFit.y = true;
        instructionsButton.anchor.y = settingsButton;
        instructionsButton.offset = new Vector2(10,15);

        instructionsButton.onClick = function() {
            this.game.model.pauseMenu.instructionsMenu.isVisible = !this.game.model.pauseMenu.instructionsMenu.isVisible;
            this.game.model.pauseMenu.settingsMenu.isVisible = false;
        };

        this.elements.push(instructionsButton);

        let menuButton = new Button(game, "Main Menu", new Vector2(270, 50), new Vector2("Left", "Top"))

        menuButton.parent = this;
        menuButton.expandToFit.y = true;
        menuButton.anchor.y = instructionsButton;
        menuButton.offset = new Vector2(10,15);

        menuButton.onClick = function() {
            let mainMenu = new WelcomeScene(this.game)
            this.game.model.scene = mainMenu;
            this.game.model.gameState = new GameState();
            this.game.model.isPaused = false;
        };

        this.elements.push(menuButton);

        this.border.y = 15;
        this.expandToFit.y = menuButton;

    }

    update(events){
        if (this.settingsMenu.isVisible || this.instructionsMenu.isVisible){
            if (this.offset.x != -200){
                this.offset.x = -200
                this.resize()
            }
        } else if (this.offset.x != 0){
            this.offset.x = 0
            this.resize()
        }
        super.update(events);

        
    }

}