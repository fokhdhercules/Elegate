// ----------------------------------------
// LADDER CLASS
// Created by: Hercules Fok
// Date last updated: 28th July 2026
// 
// Purpose:
//   - Spawns the ladders on the map
//   - Collision with ladders
// 
// The user is called the player, and the two objects that can move on the maps are called the characters
// ----------------------------------------

class Ladder {
  constructor(x, y, xIncrement, yIncrement, spawned, correspondingCharacter) {
    this.x = x;
    this.y = y;
    this.xIncrement = xIncrement;
    this.yIncrement = yIncrement;
    this.spawned = spawned;
    this.correspondingCharacter = correspondingCharacter;
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


  // Displays the ladder
  show() {
    switch (this.correspondingCharacter) {
      case "top":
        image(ladderTexture, this.x - topXOffset, this.y, this.xIncrement, this.yIncrement);
        break;
      case "bottom":
        image(ladderTexture, this.x - bottomXOffset, this.y, this.xIncrement, this.yIncrement);
        break;
    }
  }
}