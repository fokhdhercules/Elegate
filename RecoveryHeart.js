// ----------------------------------------
// RECOVERY HEART CLASS
// Created by: Hercules Fok
// Date last updated: 10th September 2026
// 
// Purpose:
//   - Displays the recovery hearts in the levels
//   - Allows characters to collect recovery hearts
// 
// The user is called the player, and the two objects that can move on the maps are called the characters
// ----------------------------------------

class RecoveryHeart {
  // hpIncrement: The increase in HP, when a character collects a recovery heart
  // spawned: Whether the coin is displayed on the map and can be collected, or not
  constructor(x, y, xIncrement, yIncrement, correspondingCharacter) {
    this.x = x;
    this.y = y;
    this.xIncrement = xIncrement;
    this.yIncrement = yIncrement;
    this.correspondingCharacter = correspondingCharacter;

    this.hpIncrement = 1;
    this.spawned = true;
  }

  // ----------------------------------------
  // Getters and setters
  // ----------------------------------------

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getXIncrement() {
    return this.xIncrement;
  }

  getYIncrement() {
    return this.yIncrement;
  }

  getHpIncrement() {
    return this.hpIncrement;
  }

  getSpawned() {
    return this.spawned;
  }

  setSpawned(newSpawned) {
    this.spawned = newSpawned;
  }

  getCorrespondingCharacter() {
    return this.correspondingCharacter;
  }
  
  // ----------------------------------------


  // Display the recovery heart
  show() {
    switch (this.correspondingCharacter) {
      case "top":
        image(heartTexture, this.x - topXOffset, this.y, this.xIncrement, this.yIncrement);
        break;
      case "bottom":
        image(heartTexture, this.x - bottomXOffset, this.y, this.xIncrement, this.yIncrement);
        break;
    }
  }
}
