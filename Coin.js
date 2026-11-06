// ----------------------------------------
// COIN CLASS
// Created by: Hercules Fok
// Date last updated: 8th September 2026
// 
// Purpose:
//   - Displays the coins in the levels
//   - Allows characters to collect coins
// 
// The user is called the player, and the two objects that can move on the maps are called the characters
// ----------------------------------------

class Coin {
  // scoreIncrement: The increase in score, when a character collects a coin
  // spawned: Whether the coin is displayed on the map and can be collected, or not
  constructor(x, y, xIncrement, yIncrement, correspondingCharacter) {
    this.x = x;
    this.y = y;
    this.xIncrement = xIncrement;
    this.yIncrement = yIncrement;
    this.correspondingCharacter = correspondingCharacter;

    this.scoreIncrement = 5;
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

  getScoreIncrement() {
    return this.scoreIncrement;
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


  // Display the coin
  show() {
    switch (this.correspondingCharacter) {
      case "top":
        image(coinTexture, this.x - topXOffset, this.y, this.xIncrement, this.yIncrement);
        break;
      case "bottom":
        image(coinTexture, this.x - bottomXOffset, this.y, this.xIncrement, this.yIncrement);
        break;
    }
  }
}
