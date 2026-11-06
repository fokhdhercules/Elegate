// ----------------------------------------
// BUTTON CLASS
// Created by: Hercules Fok
// Date last updated: 7th August 2026
// 
// Purpose:
//   - Spawns the buttons on the map
//   - Triggers other mechanisms, when buttons are pressed
// 
// The user is called the player, and the two objects that can move on the maps are called the characters
// ----------------------------------------

class Button {
  // leftCorrespondingSubroutine, rightCorrespondingSubroutine: 
  // The mechanism that would be triggered, when the lever is being activated
  constructor(correspondingLevel, x, y, xIncrement, yIncrement, correspondingSubroutine, correspondingCharacter, displayColor) {
    this.correspondingLevel = correspondingLevel;  // "forest", "volcano", "desert"
    this.x = x;
    this.y = y;
    this.xIncrement = xIncrement;
    this.yIncrement = yIncrement;
    this.pressed = false;  // Checks whether a character is standing on the button or not
    this.correspondingSubroutine = correspondingSubroutine;
    this.correspondingCharacter = correspondingCharacter;  // "top", "bottom"
    this.displayColor = displayColor;
  }

  // ----------------------------------------
  // Getters and setters
  // ----------------------------------------

  getX() {
    return this.x;
  }

  setX(newX) {
    this.x = newX;
  }

  getY() {
    return this.y;
  }

  setY(newY) {
    this.y = newY;
  }

  getXIncrement() {
    return this.xIncrement;
  }

  getYIncrement() {
    return this.yIncrement;
  }

  getPressed() {
    return this.pressed;
  }

  setPressed(newPressed) {
    this.pressed = newPressed;
  }

  getCorrespondingSubroutine() {
    return this.correspondingSubroutine;
  }

  getCorrespondingCharacter() {
    return this.correspondingCharacter;
  }
  
  // ----------------------------------------


  // Display the button
  show() {
    // Display the buttons using this.displayColor
    fill(this.displayColor);
    
    // Display the buttons as rectangles
    // Use different map x offsets, depending on whether the button is at the top or bottom of the map
    // Allows the button to be stationary relative to the map blocks during sidescrolling
    
    // If the buttons are not pressed, then the buttons would be displayed with the full size
    if (!this.pressed) {
      switch (this.correspondingCharacter) {
        case "top":
          rect(this.x - topXOffset, this.y, this.xIncrement, this.yIncrement);
          break;
        case "bottom":
          rect(this.x - bottomXOffset, this.y, this.xIncrement, this.yIncrement);
          break;
      }
    }

    // If the button is pressed, then display the buttons with half their original size
    else {
      switch (this.correspondingCharacter) {
        case "top":
          rect(this.x - topXOffset, this.y + this.yIncrement * 0.5, this.xIncrement, this.yIncrement * 0.5);
          break;
        case "bottom":
          rect(this.x - bottomXOffset, this.y + this.yIncrement * 0.5, this.xIncrement, this.yIncrement * 0.5);
          break;
      }
    }
  }
}