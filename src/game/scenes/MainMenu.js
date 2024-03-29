import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class MainMenu extends Scene {
  logoTween;

  constructor() {
    super("MainMenu");
  }

  changeScene() {
    if (this.logoTween) {
      this.logoTween.stop();
      this.logoTween = null;
    }

    this.scene.start("Tutorial");
  }

  create() {
    this.add.image(512, 384, "background");

    this.logo = this.add.image(512, 400, "Labber_Logo").setDepth(100);

    // this.add
    //   .text(512, 300, "Labber", {
    //     fontFamily: "Arial Black",
    //     fontSize: 38,
    //     color: "#ffffff",
    //     stroke: "#000000",
    //     strokeThickness: 8,
    //     align: "center",
    //   })
    //   .setDepth(100)
    //   .setOrigin(0.5);

    this.add.text(0,0, "")
    this.add.text(0,0, "")

    this.playButton = this.add
      .text(100, 50, "Play!", {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setDepth(100)
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => { this.changeScene() })
      .on("pointerover", () => {
        this.playButton.setStyle({
          strokeThickness: 12
        })
      })
      .on("pointerout", () => {
        this.playButton.setStyle({
          strokeThickness: 8
        })
      });

    EventBus.emit("current-scene-ready", this);
  }

  moveLogo(reactCallback) {
    if (this.logoTween) {
      if (this.logoTween.isPlaying()) {
        this.logoTween.pause();
      } else {
        this.logoTween.play();
      }
    } else {
      this.logoTween = this.tweens.add({
        targets: this.logo,
        x: { value: 800, duration: 3000, ease: "Back.easeInOut" },
        y: { value: 80, duration: 1500, ease: "Sine.easeOut" },
        yoyo: true,
        repeat: -1,
        onUpdate: () => {
          if (reactCallback) {
            reactCallback({
              x: Math.floor(this.logo.x),
              y: Math.floor(this.logo.y),
            });
          }
        },
      });
    }
  }
}

