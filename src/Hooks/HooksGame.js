import { useRef, useState, useEffect, useReducer } from "react";

import Phaser, { Game } from "phaser";
import { PhaserGame } from "../game/PhaserGame";
import WorkBench from "../components/WorkBench.jsx";
import { workbenchHelpers } from "../helpers/workbenchStateHelpers.js";
import {
    inventoryReducer,
    loadPlayerInventory,
    getInventory,
    addItemFromSceneToInventory,
    addFullItemToInventory,
    clearInventoryForScene,
    clearInventory,
    getInventoryForScene,
    getItemCountByType,
    ITEMTYPES,
} from "../helpers/inventoryHelpers.js";
import { EventBus } from "../game/EventBus";
import { Player } from "../game/scenes/Player.js";
import { dbGetLastestPlayerSave, dbGetPlayerItems } from '../routes/dbRoutes.js'


//mocks
import mock_player_items from "../mock_data/player_items";
import mock_items from "../mock_data/items";

export const HooksGame = () => {
    
  const { 
    moveCodeObject, 
    changeMaxCurrency, 
    addToMaxCurrency, 
    isOnWorkbench, 
    clearWorkbenchItems, 
    setWorkbenchHint, 
    codeList 
  } = workbenchHelpers();
  
  


  const initialInventoryState = [];

  const [showGame, setShowGame] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [workbenchOpen, setWorkbenchOpen] = useState(false);
  const [itemsState, setItemsState] = useState(mock_items);
  
  const [inventoryList, inventoryDispatch] = useReducer(
      inventoryReducer,
      initialInventoryState
  );

  const moveCodeObjectJumper = function (codeObject, fromName, toName) {
      return moveCodeObject(codeObject, fromName, toName);
  };

  const changeMaxCurrencyJumper = function (maxCurrency) {
      return changeMaxCurrency(maxCurrency);
  };

  const addToMaxCurrencyJumper = function (addCurrency) {
      return addToMaxCurrency(addCurrency);
  };

  const clearWorkbenchItemsJumper = function () {
      return clearWorkbenchItems(dispatch);
  };

  const isOnWorkbenchJumper = function (codeObject) {
      return isOnWorkbench(codeObject);
  };

  const getFunctionCallbackList = function () {
    return {
      jumpPower: {
        name: "jumpPower",
        callback: (jumpPower) => {
            phaserRef.current.scene.setJumpPower(jumpPower);
            return;
        }
      },
      playerSize: {
        name: "playerSize",
        callback: (newSize) => {
            phaserRef.current.scene.setPlayerSize(newSize);
            return;
        }
      },
      passKey: {
        name: "passKey",
        callback: (newPassKey) => {
            phaserRef.current.scene.setPassKey(newPassKey);
            return;
        }
      }
    };
  };

  //todo: get out of inventory
  let workBench = new WorkBench(
    codeList,
    {
        moveCodeObject: moveCodeObject,
        changeMaxCurrency: changeMaxCurrency,
        addToMaxCurrency: addToMaxCurrency,
        clearWorkbenchItems: clearWorkbenchItems,
        isOnWorkbench: isOnWorkbench,
        setWorkbenchHint: setWorkbenchHint
    },
    loaded,
    setLoaded,
    getItemCountByType(inventoryList, ITEMTYPES.COIN)
  );

  // The sprite can only be moved in the MainMenu Scene
  // const [canMoveSprite, setCanMoveSprite] = useState(true);

  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef();
  // const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

  const changeScene = () => {
    const scene = phaserRef.current.scene;

    if (scene) {
        scene.changeScene();
    }
  };

  // //   const moveSprite = () => {
  // //     const scene = phaserRef.current.scene;

  //     if (scene && scene.scene.key === "MainMenu") {
  //       // Get the update logo position
  //       scene.moveLogo(({ x, y }) => {
  //         setSpritePosition({ x, y });
  //       });
  //     }
  //   };

  //   const addSprite = () => {
  //     const scene = phaserRef.current.scene;

  //     if (scene) {
  //       // Add more stars
  //       const x = Phaser.Math.Between(64, scene.scale.width - 64);
  //       const y = Phaser.Math.Between(64, scene.scale.height - 64);

  //       //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
  //       const star = scene.add.sprite(x, y, "star");

  //       //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
  //       //  You could, of course, do this from within the Phaser Scene code, but this is just an example
  //       //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
  //       scene.add.tween({
  //         targets: star,
  //         duration: 500 + Math.random() * 1000,
  //         alpha: 0,
  //         yoyo: true,
  //         repeat: -1,
  //       });
  //     }
  //   };

  const eventHandlerItemPickup = function (itemData) {
    addItemFromSceneToInventory(inventoryDispatch, itemData);
  };

  const eventHandlerInventoryRequest = function () {
    phaserRef.current.scene.setInventory(inventoryList);
  };

  const eventHandlerInventoryClear = function (mapId) {
    let itemsRemoved = getInventoryForScene(inventoryList, mapId);
    clearInventoryForScene(inventoryDispatch, mapId);
    workBench.removeInventoryItemFromBench(itemsRemoved);
  };

  useEffect(() => {
    //load the inventory one time
    let playerId = 2;
    dbGetLastestPlayerSave(playerId, (save) => {
      let saveId = save.id
      dbGetPlayerItems(playerId, saveId, (items) => {
        setItemsState(items);
        clearInventory(inventoryDispatch);
        items.forEach(item => {
          console.log('Saving item to inventory: ', item);
          addFullItemToInventory(inventoryDispatch, item);    
        });
      });
    })

    //loadPlayerInventory(inventoryDispatch, mock_player_items, mock_items);
  }, []);

  useEffect(() => {
    if (phaserRef.current.scene) {
        phaserRef.current.scene.setInventory(inventoryList);
    }
   
    //every change to inventory requires recreating the listeners so that they
    // act on the latest copy of inventoryList
    EventBus.removeListener("add-inventory-item");
    EventBus.on("add-inventory-item", (itemData) => {
        eventHandlerItemPickup(itemData);
    });

    EventBus.removeListener("give-me-inventory");
    EventBus.on("give-me-inventory", (mapId) => {
        eventHandlerInventoryRequest();
    });

    EventBus.removeListener("clear-inventory");
    EventBus.on("clear-inventory", (mapId) => {
        eventHandlerInventoryClear(mapId);
    });

    //todo: on change to inventory, update what is in the workbench
    inventoryList.forEach((inventoryItem) => {
      workBench.addInventoryItemToBench(
        inventoryItem,
        getFunctionCallbackList()
      );
    });

    workBench.changeMaxCurrency(getItemCountByType(inventoryList, ITEMTYPES.COIN));

  }, [inventoryList]);

  // Event emitted from the PhaserGame component
  const currentScene = (scene) => {
  //setCanMoveSprite(scene.scene.key !== "MainMenu");
  };

  const openWorkbenchWithHint = function(hint) {
    workBench.setWorkbenchHint(hint);
    setWorkbenchOpen(true);
    setShowGame(false);
  }

  const openWorkbench = (event) => {
    workBench.setWorkbenchHint('openWorkbench was called by hitting the button that is just for testing');
    setWorkbenchOpen(true);
    setShowGame(false);
  };

  const closeWorkbench = (event) => {
    setWorkbenchOpen(false);
    setShowGame(true);
    if (phaserRef.current.scene instanceof Player) {
        phaserRef.current.scene.clearWorkbenchProperties();
        workBench.execute1();
    }
  };

  const changeShowGame = function (showGameValue) {
    setShowGame(showGameValue);
  };

  useEffect(() => {
    EventBus.on("keyEvent", (data) => {
      //we get two keyEvent on the bus even though it was only sent once.  So, this triggers a read from the SendKeyEventsArray instead
      // of trusting the keyEvent message
      while (phaserRef.current.scene.sendKeyEvents.length > 0) {
        let keyEvent = phaserRef.current.scene.sendKeyEvents.pop();
        if (
            keyEvent.keyCode === Phaser.Input.Keyboard.KeyCodes.ONE &&
            keyEvent.isDown
        ) {
            workBench.execute1();
        }
      }
    });

    EventBus.on("add-inventory-item", (itemData) => {
      while (phaserRef.current.scene.sendItemPickup.length > 0) {
        let newItem = phaserRef.current.scene.sendItemPickup.pop();
        eventHandlerItemPickup(newItem);
      }
    });

    EventBus.on("give-me-inventory", (mapId) => {
        eventHandlerInventoryRequest();
    });

    EventBus.on("clear-inventory", (mapId) => {
        eventHandlerInventoryClear(mapId);
    });

    EventBus.on("touch-flag", (data) => {
      openWorkbenchWithHint(data.hint);
    });

    EventBus.on("current-scene-ready", (data) => {
        workBench.execute1();
    });

    return () => {
        EventBus.removeListener("touch-flag");
        EventBus.removeListener("keyEvent");
        EventBus.removeListener("add-inventory-item");
        EventBus.removeListener("give-me-inventory");
        EventBus.removeListener("clear-inventory");
        EventBus.removeListener("current-scene-ready");
    };
  }, [phaserRef]);

  let gameOpen = !workbenchOpen;

  return { workBench, workbenchOpen, closeWorkbench, phaserRef, currentScene, showGame, openWorkbench, changeScene, getInventory, inventoryList, gameOpen};
};