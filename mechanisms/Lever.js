// ----------------------------------------
// LEVER CLASS
// Created by: Hercules Fok
// Date last updated: 2nd September 2026
// 
// Purpose:
//   - Spawns the levers on the map
//   - Triggers other mechanisms, when levers are activated or deactivated
// 
// The user is called the player, and the two objects that can move on the maps are called the characters
// ----------------------------------------

class Lever {
  // leverXOffset: Difference between the x coordinates of the top left and bottom left corners of the lever
  // state: Either left or right, depending on whether the lever is activated or not
  // leftCorrespondingSubroutine, rightCorrespondingSubroutine: 
  // The mechanism that would be triggered, when the lever is being activated
  constructor(correspondingLevel, x, y, xIncrement, leverXOffset, yIncrement, state, leftCorrespondingSubroutine, rightCorrespondingSubroutine, correspondingCharacter) {
    this.correspondingLevel = correspondingLevel;  // "forest", "volcano", "desert"
    this.x = x;
    this.y = y;
    this.xIncrement = xIncrement;
    this.leverXOffset = leverXOffset;
    this.yIncrement = yIncrement;
    this.state = state;  // "left", "right"
    this.leftCorrespondingSubroutine = leftCorrespondingSubroutine;
    this.rightCorrespondingSubroutine = rightCorrespondingSubroutine;
    this.correspondingCharacter = correspondingCharacter;  // "top", "bottom"
    this.handleDiameter = this.xIncrement * 1.02;

    // To check whether the lever is activated or not
    // If this.defaultState is different as this.state, then the lever is activated
    this.defaultState = state;
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

  getLeverXOffset() {
    return this.leverXOffset;
  }

  getYIncrement() {
    return this.yIncrement;
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = newState;
  }

  getDefaultState() {
    return this.defaultState;
  }

  getLeftCorrespondingSubroutine() {
    return this.leftCorrespondingSubroutine;
  }

  getRightCorrespondingSubroutine() {
    return this.rightCorrespondingSubroutine;
  }

  getCorrespondingCharacter() {
    return this.correspondingCharacter;
  }

  getHandleDiameter() {
    return this.handleDiameter;
  }
  
  // ----------------------------------------
  
  // Display the lever
  show() {
    // Use different colour for the handle, depending on whether the lever is activated or not
    let handleColor;
    if (this.defaultState != this.state) {
      handleColor = `hsl(0, 45%, 60%)`;
    } else {
      handleColor = `hsl(0, 35%, 50%)`;
    }
    
    // Use different map x offsets, depending on whether the lever is at the top or bottom of the map
    // Allows the lever to be stationary relative to the map blocks during sidescrolling

    fill(`hsl(220, 75%, 15%)`);  // Colour of the arm of the lever
    switch (this.correspondingCharacter) {
      case "top":
        // Arm of the levers
        beginShape();
        
        vertex(this.x - topXOffset, this.y);
        vertex(this.x + this.xIncrement - topXOffset, this.y);

        // Lever pointing to different directions, depending on its state
        if (this.state == "left") {
          vertex(this.x + this.leverXOffset + this.xIncrement - topXOffset, this.y + this.yIncrement);
          vertex(this.x + this.leverXOffset - topXOffset, this.y + this.yIncrement);
        } else {
          vertex(this.x - this.leverXOffset + this.xIncrement - topXOffset, this.y + this.yIncrement);
          vertex(this.x - this.leverXOffset - topXOffset, this.y + this.yIncrement);
        }
        
        vertex(this.x - topXOffset, this.y);
        
        endShape();

        
        // Handle of the levers
        fill(handleColor);
        circle(this.x + this.xIncrement * 0.5 - topXOffset, this.y, this.handleDiameter);
        break;
      
      case "bottom":
        // Arm of the levers
        beginShape();
        
        vertex(this.x - bottomXOffset, this.y);
        vertex(this.x + this.xIncrement - bottomXOffset, this.y);

        // Lever pointing to different directions, depending on its state
        if (this.state == "left") {
          vertex(this.x + this.leverXOffset + this.xIncrement - bottomXOffset, this.y + this.yIncrement);
          vertex(this.x + this.leverXOffset - bottomXOffset, this.y + this.yIncrement);
        } else {
          vertex(this.x - this.leverXOffset + this.xIncrement - bottomXOffset, this.y + this.yIncrement);
          vertex(this.x - this.leverXOffset - bottomXOffset, this.y + this.yIncrement);
        }
        
        vertex(this.x - bottomXOffset, this.y);
        
        endShape();
        
        
        // Handle of the levers
        fill(handleColor);
        circle(this.x + this.xIncrement * 0.5 - bottomXOffset, this.y, this.handleDiameter);
        break;
    }
  }
}