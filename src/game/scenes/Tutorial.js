import { EventBus } from "../EventBus";
import { Player } from "./Player";

export class Tutorial extends Player {
  constructor() {
    super("Tutorial");
  }
  changeScene() {
    this.scene.start("Game");
  }

  triggerCheckpoint(sprite, tile) {
    this.text.setText("Press E to open inventory");
    console.log("HERE");
    if (this.e.isDown) {
      // this.changeScene()
      EventBus.emit("touch-flag", tile);
    }
    setTimeout(() => {
      this.text.setText("");
    }, 2000);
    return false;
  }

  score = 0;
  scoreText;

  collectedItems = [];
  spritePosition = JSON.parse(localStorage.getItem(this.spritePosition)) ||{"spriteX": 300, "spriteY": 5500}

  saveProgress(sprite, tile) {
    console.log(sprite.x, sprite.y);
    this.spritePosition = { "spriteX": sprite.x, "spriteY": sprite.y}
    localStorage.setItem("items", JSON.stringify(this.collectedItems));
    localStorage.setItem("spritePosition", JSON.stringify(this.spritePosition))
  }

  create() {
    this.isPaused = false;

    EventBus.on("unPause", () => {
      this.isPaused = false;
      console.log(this.isPaused);
    });

    super.create();

    this.add.image(400, 300, "sky").setScale(20);

    this.player = this.physics.add.sprite(this.spritePosition.spriteX, this.spritePosition.spriteY, "NinjaCat");
    this.player.setBounce(0.2);
    this.player.body.setSize(80, 190);
    this.player.setOffset(40, 20);
    this.player.setCollideWorldBounds(true);

    this.map = this.make.tilemap({ key: "tutorial" });
    const groundTileSet = this.map.addTilesetImage(
      "spritesheet_ground",
      "ground"
    );
    const itemsTileSet = this.map.addTilesetImage("spritesheet_items", "items");
    const tilesTileSet = this.map.addTilesetImage("spritesheet_tiles", "tiles");
    const ground = this.map.createLayer("ground", groundTileSet, 0, 0);
    const items = this.map.createLayer("checkpoints", itemsTileSet, 0, 0);
    const coins = this.map.createLayer("coinLayer", itemsTileSet, 0, 0);
    const tiles = this.map.createLayer("tileLayer", tilesTileSet, 0, 0);
    ground.setCollisionByExclusion([-1]);

    this.physics.world.bounds.width = ground.width;
    this.physics.world.bounds.height = ground.height;

    this.physics.add.collider(this.player, ground);

    this.cameras.main.setBounds(0, 0, ground.width, ground.height);
    this.cameras.main.startFollow(this.player);

    items.setTileIndexCallback(
      [145, 155, 154, 138],
      this.triggerCheckpoint,
      this
    );

    items.setTileIndexCallback([145, 155, 154, 138], this.saveProgress, this);

    this.physics.add.overlap(this.player, items);
    this.physics.add.overlap(this.player, coins);

    this.e = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.r = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.text = this.add.text(320, 700, "", {
      fontSize: "20px",
      fill: "ffffff",
    });

    this.scoreText = this.add.text(320, 700, "0", {
      fontSize: "20px",
      fill: "ffffff",
    });

    this.text.setScrollFactor(0);
    this.scoreText.setScrollFactor(0);

    function collectCoins(sprite, tile) {
      coins.removeTileAt(tile.x, tile.y);
      this.score++;
      this.scoreText.setText(this.score);
      const cords = {
        x: tile.x,
        y: tile.y,
      };
      this.collectedItems.push(cords);
      return false;
    }

    coins.setTileIndexCallback(158, collectCoins, this);

    let itemsToRemove = JSON.parse(localStorage.getItem("items")) || false;
    if (itemsToRemove) {
      for (let item of itemsToRemove) {
        console.log(item.x, item.y);

        coins.removeTileAt(item.x, item.y);
      }
      console.log(itemsToRemove);
    }

    EventBus.emit("current-scene-ready", this);
  }

  update() {
    
    if (Phaser.Input.Keyboard.JustDown(this.r)) {
      console.log("RRRRR");
      const Items = JSON.parse(localStorage.getItem("items"));
      localStorage.removeItem("items");
      this.collectedItems = [];
      console.log(Items);
    }

    super.update();
  }
}

