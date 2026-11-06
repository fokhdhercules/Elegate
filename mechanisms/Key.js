// ----------------------------------------
// KEY CLASS
// Created by: Hercules Fok
// Date last updated: 17th July 2026
// 
// Purpose: Spawns the keys on the map
// 
// The user is called the player, and the two objects that can move on the maps are called the characters
// ----------------------------------------

class Key {
  // spawned:
  //  - Whether the key is displayed on the map or not
  //  - If a player has collected the key, do not delete the key object. Instead, set spawned to false
  //  - This prevents the same key from spawning multiple times
  // correspondingCharacter: "top", "bottom"
  constructor(x, y, correspondingCharacter) {
    this.x = x;
    this.y = y;
    this.spawned = true;
    this.correspondingCharacter = correspondingCharacter;
    
    // Fix aspect ratio of the key to prevent the image of the key being distorted
    this.xIncrement = keyTexture.width * width / 40000;
    this.yIncrement = keyTexture.height * width / 40000;
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

  getSpawned() {
    return this.spawned;
  }

  setSpawned(newSpawned) {
    this.spawned = newSpawned;
  }

  getCorrespondingCharacter() {
    return this.correspondingCharacter;
  }

  getXIncrement() {
    return this.xIncrement;
  }

  getYIncrement() {
    return this.yIncrement;
  }
  
  // ----------------------------------------

  
  // Display the key
  show() {
    // Use different map x offset based on which map the key is in
    switch (this.correspondingCharacter) {
      case "top":
        image(keyTexture, this.x - topXOffset, this.y, this.xIncrement, this.yIncrement);
        break;
      case "bottom":
        image(keyTexture, this.x - bottomXOffset, this.y, this.xIncrement, this.yIncrement);
        break;
    }
  }
}