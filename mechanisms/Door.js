// ----------------------------------------
// DOOR CLASS
// Created by: Hercules Fok
// Date last updated: 20th July 2026
// 
// Purpose:
//   - Opens the doors on the map
//   - Closes the doors on the map
// 
// The user is called the player, and the two objects that can move on the maps are called the characters
// ----------------------------------------

class Door {
  // Use correspondingLevel to display the doors with different colours
  // closedY: The y coordinate of the top edge of the door, when the door is fully closed
  // closedYIncrement: The height of the fully closed door
  // closed: Boolean value. True if the door is fully closed, false otherwise
  constructor(correspondingLevel, x, closedY, xIncrement, closedYIncrement, closed, correspondingCharacter) {
    this.correspondingLevel = correspondingLevel;
    this.x = x;
    this.closedY = closedY;
    this.xIncrement = xIncrement;
    this.closedYIncrement = closedYIncrement;
    this.closed = closed;  // Boolean
    this.correspondingCharacter = correspondingCharacter;  // "top", "bottom"

    // Use different colours for the doors based on the corresponding level
    let doorColor;
    switch (screen) {
      case "forest":
        doorColor = `hsl(120, 35%, 25%)`;
        break;
      case "volcano":
        doorColor = `hsl(20, 48.5%, 25%)`;
        break;
      case "desert":
        doorColor = `hsl(40, 80%, 27.5%)`;
        break;
    }
    this.doorColor = doorColor;
  }

  // ----------------------------------------
  // Getters and setters
  // ----------------------------------------

  getCorrespondingLevel() {
    return this.correspondingLevel;
  }
  
  getX() {
    return this.x;
  }

  getClosedY() {
    return this.closedY;
  }

  getXIncrement() {
    return this.xIncrement;
  }

  getClosedYIncrement() {
    return this.closedYIncrement;
  }

  getClosed() {
    return this.closed;
  }

  setClosed(newClosed) {
    this.closed = newClosed;
  }

  getCorrespondingCharacter() {
    return this.correspondingCharacter;
  }

  getDoorColor() {
    return this.doorColor;
  }
  
  // ----------------------------------------


  // Display the door
  // Only call this, if this.closed is true
  show() {
    fill(this.doorColor);

    // Display the doors as rectangles
    // Use different x offsets, based on which map the door is in
    switch (this.correspondingCharacter) {
      case "top":
        rect(this.x - topXOffset, this.closedY, this.xIncrement, this.closedYIncrement);
        break;
      case "bottom":
        rect(this.x - bottomXOffset, this.closedY, this.xIncrement, this.closedYIncrement);
        break;
    }
  }
}