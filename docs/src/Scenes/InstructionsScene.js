import { Menu } from "../UIElements/Menu.js";
import { Vector2 } from "../Utility/Vector2.js";
import { Label } from "../UIElements/Label.js";
import { Button } from "../UIElements/Button.js";
export class InstructionsScene extends Menu {
  constructor(game) {
    super(game, new Vector2(420,300));

    this.style.fillColor = color(150);
    this.style.outlineWidth = 3

    this.title = new Label(
          game,
          "INSTRUCTIONS",
          new Vector2(420, 50),
          new Vector2("Centre", "Top"),
          new Vector2() 
        );

        this.title.style.textSize = 30;
        this.title.textSizeOverride = true;
        this.title.style.textAlign = { x: "center", y: "center" };
        this.title.parent = this;
 

         // Back button
        this.backButton = new Button(
                 game,
                 "X",
                 new Vector2(50, 50),
                 new Vector2("Right", "Top"),
                 new Vector2()
            );
            this.backButton.parent = this;
            this.backButton.style.textSize = 30;
            this.backButton.textSizeOverride = true;
        
            this.backButton.onClick = function() {
        
              // Hide all instructions scene 
              this.parent.isVisible = false;
            };

            [this.title,
            this.backButton,
    ].forEach((el) => this.elements.push(el));
  }

   ;}
   

