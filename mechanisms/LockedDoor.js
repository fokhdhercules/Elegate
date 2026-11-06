// ----------------------------------------
// LOCKED DOOR CLASS
// Created by: Hercules Fok
// Date last updated: 26th July 2026
// 
// Purpose:
//   - Displays the locked doors on the map
//   - Opens the locked doors on the map
// 
// The user is called the player, and the two objects that can move on the maps are called the characters
// ----------------------------------------

class LockedDoor extends Door {
  // Use correspondingLevel to display the doors with different colours
  // closedY: The y coordinate of the top edge of the door, when the door is fully closed
  // closedYIncrement: The height of the fully closed door
  // closed: Boolean value. True if the door is fully closed, false otherwise
  constructor(correspondingLevel, x, closedY, xIncrement, closedYIncrement, closed, correspondingCharacter) {
    super(correspondingLevel, x, closedY, xIncrement, closedYIncrement, closed, correspondingCharacter);
    this.locked = true;
  }

  // ----------------------------------------
  // Getters and setters
  // ----------------------------------------

  getLocked() {
    return this.locked;
  }

  setLocked(newLocked) {
    this.locked = newLocked;
  }
  
  // ----------------------------------------


  // Display the doors
  show() {
    // Draw the rectangles (same logic as parent class)
    super.show();
    
    // Use different padlock icons, depending on whether the door is locked or unlocked
    let padlockTexture;
    if (this.locked) {
      padlockTexture = lockedPadlockTexture;
    } else {
      padlockTexture = unlockedPadlockTexture;
    }

    // Fix aspect ratio of the padlock to prevent the image of the padlock being distorted
    let padlockWidth = padlockTexture.width * width / 30000;
    let padlockHeight = padlockTexture.height * width / 30000;

    // Coordinates of the top left corner of the image
    let padlockX = this.x + this.xIncrement * 0.5 - padlockWidth * 0.5;
    let padlockY = this.closedY + this.closedYIncrement * 0.5 - padlockHeight * 0.5;
    
    // Displays the image
    // Use different x offsets, based on which map the character is in
    switch (this.correspondingCharacter) {
      case "top":
        image(padlockTexture, padlockX - topXOffset, padlockY, padlockWidth, padlockHeight);
        break;
      case "bottom":
        image(padlockTexture, padlockX - bottomXOffset, padlockY, padlockWidth, padlockHeight);
        break;
    }
  }
}