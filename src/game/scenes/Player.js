import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class Player extends Scene {
  constructor(sceneName) {
    super(sceneName);
  }

  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  jumpCount = 0;
  jumpPower = 0;

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    let player = this.player;
    const right = this.cursors.right.isDown;
    const left = this.cursors.left.isDown;
    const onFloor = player.body.onFloor();

    if (onFloor) {
      this.jumpCount = 0;
    }

    if (left) {
      if (onFloor) {
        player.setOffset(133, 20);
        player.body.setVelocityX(-500);
        player.anims.play("player-walk", true);
        player.anims.msPerFrame = 100;
        player.setFlipX(true);
      } else {
        player.setFlipX(true);
        player.setOffset(133, 20);
        player.body.velocity.x -= 10;
      }
    } else if (right) {
      if (onFloor) {
        player.body.setVelocityX(500);
        player.setOffset(40, 20);
        player.anims.play("player-walk", true);
        player.anims.msPerFrame = 100;
        player.setFlipX(false);
      } else {
        player.setFlipX(false);
        player.setOffset(40, 20);
        player.body.velocity.x += 10;
      }
    } else {
      if (onFloor) {
        player.anims.play("player-idle", true);
        player.anims.msPerFrame = 500;
        player.body.setVelocityX(0);
      }
    }

    if (this.cursors.up.isDown) {
      if (this.cursors.up.isDown && this.jumpCount < 20 && this.jumpPower === 0) {
        this.jumpCount++
        player.anims.play("player-jump", true);
        player.anims.msPerFrame = 30;
        this.jumpPower = 1;
        player.body.velocity.y = -400;
      } else if (this.jumpPower > 0 && this.jumpPower < 20) {
        
        this.jumpPower++;
        player.body.velocity.y = -400 - this.jumpPower * 2;
      }
    } else {
      
      this.jumpPower = 0;
    }

    player.body.velocity.x = Phaser.Math.Clamp(
      player.body.velocity.x,
      -500,
      500
    );

    player.body.velocity.y = Phaser.Math.Clamp(
      player.body.velocity.y,
      -1000,
      3000
    );
  }

  changeScene() {
    this.scene.start("GameOver");
  }

  setJumpPower(newJumpPower) {
    //todo:  this needs to be updated to change the actual character jump power that the game uses!!
    //recommending a x10 on this, so that lower numbers like 1 to 10 are more noticable when used...eg jumpPower(9) becomes jumpPower(90) behind the scenes??
    console.log('set jump power', newJumpPower * 10)
    let jumpPower= newJumpPower * 10;
  }

  //key events stored for app.jsx to consume
  sendKeyEvents = [];
      
  ///send keypress to the event bus (for App.jsx)
  // thhis is done using an array for App.jsx to read because
  // even though this gets called once, we end up with two messages on the event bus 🤷‍♂️
  sendKeyPressMessage = function(keyCode, isDown) {
    this.sendKeyEvents.push({keyCode: keyCode, isDown: isDown})
    EventBus.emit('keyEvent', {scene: this, keyCode: keyCode, isDown: isDown});
  }
}
