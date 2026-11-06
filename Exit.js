// ----------------------------------------
// EXIT CLASS
// Created by: Hercules Fok
// Date last updated: 6th August 2026
// 
// Purpose:
//   - Displays the exits in the levels
//   - Check whether the characters collide with the exits in the levels
// 
// The user is called the player, and the two objects that can move on the maps are called the characters
// ----------------------------------------

class Exit {
  // Constructor for an exit object
  constructor(x, y, xIncrement, yIncrement, correspondingLevel, correspondingCharacter) {
    this.x = x;
    this.y = y;
    this.xIncrement = xIncrement;
    this.yIncrement = yIncrement;
    this.correspondingLevel = correspondingLevel;  // "forest", "volcano", "desert"
    this.correspondingCharacter = correspondingCharacter;  // "top", "bottom"
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

  getCorrespondingLevel() {
    return this.correspondingLevel;
  }

  getCorrespondingCharacter() {
    return this.correspondingCharacter;
  }

  // ----------------------------------------

  // Check collision with characters
  // Returns either true or false
  collide(character) {
    return (
      // Check overlapping in x direction
      this.x < character.getX() + character.getXIncrement() &&
      this.x + this.xIncrement > character.getX() &&

      // Check overlapping in y direction
      this.y < character.getY() + character.getYIncrement() &&
      this.y + this.yIncrement > character.getY()
    );
  }

  // Displays the exits
  show() {
    // Use different exit images, depending on the corresponding level
    let exitTexture;
    switch (this.correspondingLevel) {
      case "forest":
        exitTexture = forestExitTexture;
        break;
      case "volcano":
        exitTexture = volcanoExitTexture;
        break;
      case "desert":
        exitTexture = desertExitTexture;
        break;
    }

    // Use different map x offsets, depending on which map the exit is in
    let mapXOffset;
    switch (this.correspondingCharacter) {
      case "top":
        mapXOffset = topXOffset;
        break;
      case "bottom":
        mapXOffset = bottomXOffset;
        break;
    }
    
    image(exitTexture, this.x - mapXOffset, this.y, this.xIncrement, this.yIncrement);
  }
}