// ----------------------------------------
// CHARACTER CLASS
// Created by: Hercules Fok
// Date last updated: 18th September 2026
// 
// Purpose:
//   - Spawns the characters on the map
//   - Character movement
//   - Applying gravity
//   - Collision logic with map blocks and other map elements
// 
// The user is called the player, and the two objects that can move on the maps are called the characters
// ----------------------------------------

class Character {
  // Constructor for a Character object
  constructor(correspondingCharacter) {
    this.correspondingCharacter = correspondingCharacter;  // "top", "bottom". Refers to the two different characters displayed on the screen
    
    // If this.correspondingCharacter is neither top nor bottom, then the attributes this.minHeight and this.maxHeight would be undefined
    // Note that attributes do not have reference errors here, but instead, undefined is used
    // minHeight: Minimum y coordinate of the corresponding map
    // maxHeight: Maximum y coordinate of the corresponding map
    switch (this.correspondingCharacter) {
      case "top":
        this.minHeight = height * 0.125;
        this.maxHeight = height * 0.4875;
        break;
      case "bottom":
        this.minHeight = height * 0.5125;
        this.maxHeight = height * 0.875;
        break;
    }
    
    this.xIncrement = int(width / 50);  // Width
    this.yIncrement = int(0.125 * (this.maxHeight - this.minHeight));  // Height
    this.x = 0;  // x coordinate of the top left corner
    this.y = this.maxHeight - this.yIncrement;  // y coordinate of the top left corner
    
    // Movement
    this.xVelocity = 0;
    this.xAcceleration = -width / 800;  // Negative sign as the character would decelerate
    this.yVelocity = 0;
    this.yAcceleration = 0.007 * (this.maxHeight - this.minHeight);  // Positive sign as the character would accelerate towards the floor
    
    // Vertical collision
    // Is the character touching either the ground or a map block?
    // Prevents the character from falling through the ground or map blocks
    this.onGround = true;

    // Ladder collision
    // Is the character overlapping with the ladder?
    // Allows ladder collision to be prioritised, compared to map block collision
    this.collideLadder = false;

    // this.collideLadderIndex:
    // -1: Does not collide with a ladder
    // 0 to currentLadders.length - 1: Index of currentLadders
    this.collideLadderIndex = -1;
  }
  
  // ----------------------------------------
  // Getters and setters
  // ----------------------------------------
  
  getX() {
    return this.x;
  }
  
  getXIncrement() {
    return this.xIncrement;
  }
  
  getY() {
    return this.y;
  }
  
  getYIncrement() {
    return this.yIncrement;
  }
  
  getXVelocity() {
    return this.xVelocity;
  }
  
  setXVelocity(newXVelocity) {
    this.xVelocity = newXVelocity;
  }
  
  getYVelocity() {
    return this.yVelocity;
  }
  
  setYVelocity(newYVelocity) {
    this.yVelocity = newYVelocity;
  }
  
  getOnGround() {
    return this.onGround;
  }
  
  setOnGround(newOnGround) {
    this.onGround = newOnGround;
  }
  
  getCorrespondingCharacter() {
    return this.correspondingCharacter;
  }

  getCollideLadder() {
    return this.collideLadder;
  }

  getCollideLadderIndex() {
    return this.collideLadderIndex;
  }
  
  // ----------------------------------------
  
  // ----------------------------------------
  // Collision
  // Predicting whether a character would overlap with rectangular map elements like map blocks, doors and ladders
  // ----------------------------------------
  
  // x axis
  overlapsX(characterX, characterXIncrement, rectX, rectXIncrement) {
    return (
      (characterX < rectX + rectXIncrement) &&
      (characterX + characterXIncrement > rectX)
    );
  }
  
  // y axis
  overlapsY(characterY, characterYIncrement, rectY, rectYIncrement) {
    return (
      (characterY < rectY + rectYIncrement) &&
      (characterY + characterYIncrement > rectY)
    );
  }

  // Ladder
  updateCollideLadder(newX, newY) {
    // Assumes the character does not collide with a ladder
    let newCollideLadder = false;

    // Stores which ladder the character collides with
    let ladderIndex;
    
    // Check whether the character overlaps with the ladder using AABB
    for (let ladderIndex = 0; ladderIndex < currentLadders.length; ladderIndex++) {
      // Ladder object
      let ladder = currentLadders[ladderIndex];
      
      // If the ladder is not spawned, then move onto the next ladder
      if (!ladder.getSpawned()) {
        continue;
      }

      // If the character does not overlap with the ladder, then move onto the next ladder
      else if (
        !this.overlapsX(newX, this.xIncrement, ladder.getX(), ladder.getXIncrement()) ||
        !this.overlapsY(newY, this.yIncrement, ladder.getY(), ladder.getYIncrement())
      ) {
        continue;
      }

      // Otherwise, the character collides with the ladder with currentLadders[ladderIndex]
      else {
        newCollideLadder = true;
        this.collideLadderIndex = ladderIndex;
        break;
      }
    }

    // Update this.collideLadder, depending on whether the character collides with a ladder or not
    this.collideLadder = newCollideLadder;

    // Set this.collideLadderIndex to -1, if the character does not collide with a ladder
    if (!this.collideLadder) {
      this.collideLadderIndex = -1;
    }
  }
  
  // ----------------------------------------
  
  
  // Change the horizontal coordinates
  updateX() {
    // Predicts where the character would go next
    // Initialise with values here so that there would not be a reference error later, when this.x and this.xVelocity update according to newX and newXVelocity
    let newX = this.x;
    let newXVelocity = this.xVelocity;
    
    if (this.xVelocity > 0) {
      newXVelocity = this.xVelocity + this.xAcceleration;
    } else if (this.xVelocity < 0) {
      newXVelocity = this.xVelocity - this.xAcceleration;
    }
    
    // Check if signs of the current and the new x velocities are equal
    if (this.xVelocity * newXVelocity >= 0) {
      this.xVelocity = newXVelocity;
      newX = this.x + newXVelocity;
    } else {
      this.xVelocity = 0;
    }
    
    // ----------------------------------------
    // Check collision with the map boundaries
    // ----------------------------------------
    
    // Collision with the left edge of the map
    if (newX < 0) {
      newXVelocity = 0;
      newX = 0;
    }
    // Collision with the right edge of the map
    else if (newX + this.xIncrement > mapWidth) {
      newXVelocity = 0;
      newX = mapWidth - this.xIncrement;
    }
    
    // ----------------------------------------


    // ----------------------------------------
    // Collision with ladders and map blocks
    // ----------------------------------------

    // Check whether the character collides with a ladder
    this.updateCollideLadder(this.x, this.y);

    // Use ladder collision logic, if the character is on a ladder
    // Allows the character to appear to overlap with map blocks, if the character is on a ladder
    if (this.collideLadder) {
      // The ladder object
      let ladder = currentLadders[this.collideLadderIndex];
      
      // Prevents the character from jumping off from a ladder
      if (round(this.y + this.yIncrement, 2) == round(ladder.getY() + ladder.getYIncrement(), 2)) {
        // If the character is at the bottom of the ladder, then allow the character to leave the ladder
        // Therefore nothing is here
      }
      
      /*
      At least 10% of the character needs to overlap with the ladder, unless if the character is at the top or bottom of the ladder (10% is an arbitrary design choice, and this percentage can be anything, as long as it is greater than zero)
      
      If the program allows the vertical edge of the character to touch the vertical edge of the ladder (exactly 0% instead of 10%), then this would be used instead:
      
      if (newX + this.xIncrement < ladder.getX()) {
        newX = ladder.getX() - this.xIncrement;
      } else if (newX > ladder.getX() + ladder.getXIncrement()) {
        newX = ladder.getX() + ladder.getXIncrement();
      }
      
      then this.collideLadder would be set to false, after newX is changed in the if statement above
      This causes the program to use map block collision, instead of ladder collision, even though the character is supposed to be on a ladder
      */
      else if (newX + this.xIncrement < ladder.getX() + ladder.getXIncrement() * 0.1) {
        newX = ladder.getX() + ladder.getXIncrement() * 0.1 - this.xIncrement;
      } else if (newX > ladder.getX() + ladder.getXIncrement() * 0.9) {
        newX = ladder.getX() + ladder.getXIncrement() * 0.9;
      }

      // Characters moving slower, when on a ladder
      else {
        newX = this.x + newXVelocity * 0.25;
      }
    }

    // If the character does not collide with a ladder, then check whether the character collides with a map block
    else {
      for (let mapBlock of mapBlocks) {
        // If the character would not collide with the map block, move to the next map block
        if (
          !this.overlapsX(newX, this.xIncrement, mapBlock.getX(), mapBlock.getXIncrement()) ||
          !this.overlapsY(this.y, this.yIncrement, mapBlock.getY(), mapBlock.getYIncrement())
        ) {
          continue;
        }
        
        // Otherwise, stop the character
        else {
          // Move the character to either left or right from the map block, depending on the x velocity
          
          // Character moving left and collides with the map block
          if (newXVelocity < 0) {
            newX = mapBlock.getX() + mapBlock.getXIncrement();  // Move character to the right of the map block
          }
          
          // Character moving right and collides with the map block
          else if (newXVelocity > 0) {
            newX = mapBlock.getX() - this.xIncrement;  // Move character to the left of the map block
          }
          
          // Stop the character
          newXVelocity = 0;
        }
      }
    }

    // ----------------------------------------

    
    // ----------------------------------------
    // Collision with levers
    // Check:
    //  - Collision with circle (handle)
    //  - Collision with parallelogram (arm)
    //  - If both are false, then the character does not collide with that lever
    //
    // Centre of handle = lever.getX() + lever.getXIncrement() * 0.5
    // Radius of handle = lever.getHandleDiameter() * 0.5
    // ----------------------------------------
    
    for (let lever of currentLevers) {
      let collideLever = true;  // Assume the character would collide with the lever

      // Check collision with top side of the handle
      if (this.y + this.yIncrement < lever.getY() - lever.getHandleDiameter() * 0.5) {
        collideLever = false;
      }

      // Check collision with bottom side of the lever
      else if (this.y > lever.getY() + lever.getYIncrement()) {
        collideLever = false;
      }
      
      // Lever pointing to the left
      else if (lever.getState() == "left") {
        // Check collision with the left side of the handle
        if (newX + this.xIncrement < lever.getX() + lever.getXIncrement() * 0.5 - lever.getHandleDiameter() * 0.5) {
          collideLever = false;
        }

        // Check collision with the right side of the lever vertically
        else if (newX > lever.getX() + lever.getLeverXOffset() + lever.getXIncrement()) {
          collideLever = false;
        }
        
        // Check collision with the right diagonal edge of the arm
        /*
        A point on the right edge is :
          (
            lever.getX() + lever.getXIncrement(), 
            lever.getY()
          )
        
        Another point on the right edge is:
          (
            lever.getX() + lever.getLeverXOffset() + lever.getXIncrement(), 
            lever.getY() + lever.getYIncrement()
          )
  
        The gradient connecting the two points is:
        lever.getYIncrement() / lever.getLeverXOffset()
  
        Using the first set of coordinates, the equation of the line representing the right edge is:
        y - lever.getY() = lever.getYIncrement() / lever.getLeverXOffset() * (x - lever.getX() - lever.getXIncrement())
  
        After rearranging, we get:
        y = lever.getY() + lever.getYIncrement() / lever.getLeverXOffset() * (x - lever.getX() - lever.getXIncrement())
  
        For collision to happen with the right edge, the bottom left corner of the character must be below the line
        This is equivalent to:
        this.y + this.yIncrement > lever.getY() + lever.getYIncrement() / lever.getLeverXOffset() * (newX - lever.getX() - lever.getXIncrement())
        */
        else if (this.y + this.yIncrement < lever.getY() + lever.getYIncrement() / lever.getLeverXOffset() * (newX - lever.getX() - lever.getXIncrement())) {
          continue;
        }

        // The program would only reach here, if there is a collision with a lever pointing to the left

        // Check whether the character collides with the handle
        // Compare the midpoint of the character and the midpoint of the handle, so that the character would 'slide' to the correct direction
        else if (newX + this.xIncrement * 0.5 < lever.getX() + lever.getXIncrement() * 0.5) {
          newX = lever.getX() + lever.getXIncrement() * 0.5 - lever.getHandleDiameter() * 0.5 - this.xIncrement;

          // Change the lever from pointing to the left to pointing to the right
          lever.setX(lever.getX() + 2 * lever.getLeverXOffset());
          lever.setState("right");

          // Running the corresponding subroutine
          // First () from getter to obtain the subroutine
          // Second () for running the subroutine
          lever.getRightCorrespondingSubroutine()();
        }

        // If there is a collision, and the collision is not with the handle, then the collision must be with the arm
        else {
          // Rearrange the equation above to make x the subject
          newX = lever.getLeverXOffset() / lever.getYIncrement() * (this.y + this.yIncrement - lever.getY()) + lever.getXIncrement() + lever.getX();
        }
      }

      // Lever pointing to the right
      else if (lever.getState() == "right") {
        // Check collision with the right side of the handle
        if (newX > lever.getX() + lever.getXIncrement() * 0.5 + lever.getHandleDiameter() * 0.5) {
          collideLever = false;
        }

        // Check collision with the left side of the lever vertically
        else if (newX + this.xIncrement < lever.getX() - lever.getLeverXOffset()) {
          collideLever = false;
        }
        
        // Check collision with the left diagonal edge of the arm
        /*
        A point on the right edge is :
          (
            lever.getX(), 
            lever.getY()
          )
        
        Another point on the right edge is:
          (
            lever.getX() - lever.getLeverXOffset(), 
            lever.getY() + lever.getYIncrement()
          )
  
        The gradient connecting the two points is:
        lever.getYIncrement() / (-lever.getLeverXOffset())
        or
        - lever.getYIncrement() / lever.getLeverXOffset()
  
        Using the first set of coordinates, the equation of the line representing the right edge is:
        y - lever.getY() = - lever.getYIncrement() / lever.getLeverXOffset() * (x - lever.getX())
  
        After rearranging, we get:
        y = lever.getY() - lever.getYIncrement() / lever.getLeverXOffset() * (x - lever.getX())
  
        For collision to happen with the left edge, the bottom right corner of the character must be below the line
        This is equivalent to:
        this.y + this.yIncrement > lever.getY() - lever.getYIncrement() / lever.getLeverXOffset() * (newX + this.xIncrement - lever.getX())
        */
        else if (this.y + this.yIncrement < lever.getY() - lever.getYIncrement() / lever.getLeverXOffset() * (newX + this.xIncrement - lever.getX())) {
          continue;
        }
        
        // The program would only reach here, if there is a collision with a lever pointing to the right

        // Check whether the character collides with the handle
        // Compare the midpoint of the character and the midpoint of the handle, so that the character would 'slide' to the correct direction
        else if (newX + this.xIncrement * 0.5 > lever.getX() + lever.getXIncrement() * 0.5) {
          newX = lever.getX() + lever.getXIncrement() * 0.5 + lever.getHandleDiameter() * 0.5;
          
          // Change the lever from pointing to the right to pointing to the left
          lever.setX(lever.getX() - 2 * lever.getLeverXOffset());
          lever.setState("left");
          
          // Running the corresponding subroutine
          // First () from getter to obtain the subroutine
          // Second () for running the subroutine
          lever.getLeftCorrespondingSubroutine()();
        }

        // If there is a collision, and the collision is not with the handle, then the collision must be with the arm
        else {
          // Rearrange the equation above to make x the subject
          newX = lever.getLeverXOffset() / lever.getYIncrement() * (lever.getY() - this.y - this.yIncrement) + lever.getX() - this.xIncrement;
        }
      }

      // If the character doesn't collide with the lever, go to the next one
      if (!collideLever) {
        continue;
      }

      // Else, stop the character from moving
      newXVelocity = 0;
    }

    // ----------------------------------------

    // ----------------------------------------
    // Collision with buttons
    // Use AABB collision
    // (similar collision logic with map blocks)
    // ----------------------------------------

    for (let button of currentButtons) {
      // If the button isn't in the same map as the character, then skip the button
      if (this.correspondingCharacter != button.getCorrespondingCharacter()) {
        continue;
      }
      
      // If the character would not collide with the button, then the button would not be pressed, and the program can move to the next button
      if (
        !this.overlapsX(newX, this.xIncrement, button.getX(), button.getXIncrement()) ||
        !this.overlapsY(this.y, this.yIncrement, button.getY(), button.getYIncrement())
      ) {
        button.setPressed(false);
        continue;
      }
    }

    // ----------------------------------------

    // ----------------------------------------
    // Collision with doors and locked doors
    // ----------------------------------------

    // ... : Expands an array (like removing [])
    // []: Group the elements back to an array
    // [...arr, ...arr]: Combining the two arrays into one
    for (let door of [...currentDoors, ...currentLockedDoors]) {
      // If the door is opened, then skip the door
      if (!door.getClosed()) {
        continue;
      }
      
      // If the character would not collide with the door, move to the next door
      else if (
        !this.overlapsX(newX, this.xIncrement, door.getX(), door.getXIncrement()) ||
        !this.overlapsY(this.y, this.yIncrement, door.getClosedY(), door.getClosedYIncrement())
      ) {
        continue;
      }
      
      // Otherwise, stop the character
      // The doors would be unlocked in this.updateY()
      else {
        // Move the character to either left or right from the door, depending on the x velocity
        
        // Character moving left and collides with the door
        if (newXVelocity < 0) {
          newX = door.getX() + door.getXIncrement();  // Move character to the right of the door
        }
        
        // Character moving right and collides with the door
        else if (newXVelocity > 0) {
          newX = door.getX() - this.xIncrement;  // Move character to the left of the door
        }
        
        // Stop the character
        newXVelocity = 0;
      }
    }
    
    // ----------------------------------------


    // ----------------------------------------
    // Collecting keys
    // ----------------------------------------
    
    // Check against currentKeys to find whether the character collides with a key
    for (let currentKey of currentKeys) {
      // If the key isn't in the same map as the character, then skip the key
      if (this.correspondingCharacter != currentKey.getCorrespondingCharacter()) {
        continue;
      }
      
      // If the character would not collide with the key, then the key would not be collected, and the program can move to the next key
      else if (
        !this.overlapsX(newX, this.xIncrement, currentKey.getX(), currentKey.getXIncrement()) ||
        !this.overlapsY(this.y, this.yIncrement, currentKey.getY(), currentKey.getYIncrement())
      ) {
        continue;
      }

      // If the key has already been collected, then do not show the key
      else if (!currentKey.getSpawned()) {
        continue;
      }
      
      // Otherwise, the character collects the key, and remove the key from the map
      // Do not remove the key from currentKeys, otherwise the program would not know that this key has been spawned previously, and the same key would be able to be spawned multiple times
      else {
        currentKey.setSpawned(false);

        // Change the icon on the map, from a key icon with a red line, to a key icon without a red line
        switch (this.correspondingCharacter) {
          case "top":
            topKeyCollected = true;
            break;
          case "bottom":
            bottomKeyCollected = true;
            break;
        }

        break;  // There is no need to check for other keys, once the program knows the character has collected a key
      }
    }
    
    // ----------------------------------------

    // ----------------------------------------
    // Collecting coins
    // ----------------------------------------
    
    // Check against currentCoins to find whether the character collides with a key
    for (let coin of currentCoins) {
      // If the coin isn't in the same map as the character, then skip the coin
      if (this.correspondingCharacter != coin.getCorrespondingCharacter()) {
        continue;
      }
      
      // If the character would not collide with the coin, then the coin would not be collected, and the program can move to the next coin
      else if (
        !this.overlapsX(newX, this.xIncrement, coin.getX(), coin.getXIncrement()) ||
        !this.overlapsY(this.y, this.yIncrement, coin.getY(), coin.getYIncrement())
      ) {
        continue;
      }

      // If the coin has already been collected, then do not show or collect the coin
      else if (!coin.getSpawned()) {
        continue;
      }
      
      // Otherwise, the character collects the coin, the player score increases, and the coin is removed from the map
      else {
        coinsCollected++;
        score += coin.getScoreIncrement();
        coin.setSpawned(false);
      }
    }
    
    // ----------------------------------------

    // ----------------------------------------
    // Collecting recovery hearts
    // ----------------------------------------
    
    // Check against currentRecoveryHearts to find whether the character collides with a recovery heart
    for (let heart of currentRecoveryHearts) {
      // If the recovery heart isn't in the same map as the character, then skip the recovery heart
      if (this.correspondingCharacter != heart.getCorrespondingCharacter()) {
        continue;
      }
      
      // If the character would not collide with the recovery heart, then the recovery heart would not be collected, and the program can move to the next recovery heart
      else if (
        !this.overlapsX(newX, this.xIncrement, heart.getX(), heart.getXIncrement()) ||
        !this.overlapsY(this.y, this.yIncrement, heart.getY(), heart.getYIncrement())
      ) {
        continue;
      }

      // If the recovery heart has already been collected, then do not show or collect the recovery heart
      else if (!heart.getSpawned()) {
        continue;
      }
      
      // Otherwise, the character collects the recovery heart to increase HP, and the recovery heart is removed from the map
      else {
        currentHp = constrain(currentHp + heart.getHpIncrement(), 0, defaultHp);  // HP cannot be above maximum HP
        heart.setSpawned(false);
      }
    }
    
    // ----------------------------------------
    
    // Updates the x coordinates and the x velocity
    this.xVelocity = newXVelocity;
    this.x = newX;
  }
  
  // Change the vertical coordinates
  updateY() {
    // Predicts where the character would go next
    // Initialise with values here so that there would not be a reference error later, when this.y and this.yVelocity update according to newY and newYVelocity
    let newY = this.y;
    let newYVelocity = this.yVelocity;
    
    let nextOnGround = false;  // Predicts whether the character would be standing on a map block
    
    // Checks whether the character collides with the ground currently
    if (!this.onGround) {
      newYVelocity = this.yVelocity + this.yAcceleration;
      newY = this.y + newYVelocity;
    
      // Checks whether the character will collide with the ground, if newY is used
      if (newY > this.maxHeight - this.yIncrement) {
        newY = this.maxHeight - this.yIncrement;
        newYVelocity = 0;
        nextOnGround = true;
      }
      
      // Checks whether the character will collide with the ceiling, if newY is used
      if (newY < this.minHeight) {
        newY = this.minHeight;
        newYVelocity = 0;
      }
    }

    // ----------------------------------------
    // Collision with ladders, map blocks, buttons, doors and locked doors
    // Similar AABB collision logic is used
    // ----------------------------------------

    // Check whether the character collides with a ladder
    this.updateCollideLadder(this.x, newY);

    // Use ladder collision logic, if the character is on a ladder
    // Allows the character to appear to overlap with map blocks, if the character is on a ladder
    if (this.collideLadder) {
      // The ladder object
      let ladder = currentLadders[this.collideLadderIndex];
      
      // Prevents acceleration or deceleration due to gravity
      newYVelocity = this.yVelocity;
      newY = this.y + newYVelocity;

      // Check if the character would reach the end of the ladder
      if (newY + this.yIncrement < ladder.getY())  // Reaching the top end of the ladder
      {
        newY = ladder.getY() - this.yIncrement;
        // Do not set this.collideLadder to be false, otherwise the character would not be able to move down the ladder, without leaving and reapproaching the ladder
      } else if (newY + this.yIncrement > ladder.getY() + ladder.getYIncrement())  // Reaching the bottom end of the ladder
      {
        newY = ladder.getY() + ladder.getYIncrement() - this.yIncrement;
        // Do not set this.collideLadder to be false, otherwise the character would not be able to move up the ladder, without leaving and reapproaching the ladder
      }
    }

    // If the character does not collide with a ladder, then check whether the character collides with a map block
    else {
      for (let mapBlock of mapBlocks) {
        // If the character would not collide with the map block, move to the next map block
        if (
          !this.overlapsX(this.x, this.xIncrement, mapBlock.getX(), mapBlock.getXIncrement()) ||
          !this.overlapsY(newY, this.yIncrement, mapBlock.getY(), mapBlock.getYIncrement())
        ) {
          continue;
        }
        
        // Otherwise, stop the character
        else {
          // Move the character to either top or bottom from the map block, depending on the y velocity
          
          // Character moving upwards and collides with the map block
          if (newYVelocity < 0) {
            newY = mapBlock.getY() + mapBlock.getYIncrement();  // Move character to the bottom of the map block
          }
          
          // Character moving downwards and collides with the map block
          else if (newYVelocity > 0) {
            newY = mapBlock.getY() - this.yIncrement;  // Move character to the top of the map block
            nextOnGround = true;  // Allows the character to be able to jump on map blocks
          }
          
          // Stop the character
          newYVelocity = 0;
        }
      }
    }

    for (let button of currentButtons) {
      // If the button isn't in the same map as the character, then skip the button
      if (this.correspondingCharacter != button.getCorrespondingCharacter()) {
        continue;
      }
      
      // If the character would not collide with the button, then the button would not be pressed, and the program can move to the next button
      if (
        !this.overlapsX(this.x, this.xIncrement, button.getX(), button.getXIncrement()) ||
        !this.overlapsY(newY, this.yIncrement, button.getY(), button.getYIncrement())
      ) {
        continue;
      }
      
      // Check whether the button is pressed previously, to prevent the subroutine from being called multiple times
      let prevPressed = button.getPressed();
      button.setPressed(true);
      // Change the y coordinate of the character, so that they are directly on top of the button
      newY = button.getY() + button.getYIncrement() * 0.5 - this.yIncrement;  // Move character to the top of the button
      nextOnGround = true;  // Allows the character to be able to jump on buttons
        
      // Stop the character
      newYVelocity = 0

      if (!prevPressed) {
        // Running the corresponding subroutine
        // First () from getter to obtain the subroutine
        // Second () for running the subroutine
        button.getCorrespondingSubroutine()();
      }
    }

    // ... : Expands an array (like removing [])
    // []: Group the elements back to an array
    // [...arr, ...arr]: Combining the two arrays into one
    for (let door of [...currentDoors, ...currentLockedDoors]) {
      // If the door is opened, then skip the door
      if (!door.getClosed()) {
        continue;
      }
      
      // If the character would not collide with the door, move to the next door
      else if (
        !this.overlapsX(this.x, this.xIncrement, door.getX(), door.getXIncrement()) ||
        !this.overlapsY(newY, this.yIncrement, door.getClosedY(), door.getClosedYIncrement())
      ) {
        continue;
      }
      
      // Otherwise, stop the character
      else {
        // Move the character to either top or bottom from the door, depending on the y velocity
        
        // Character moving upwards and collides with the door
        if (newYVelocity < 0) {
          newY = door.getClosedY() + door.getClosedYIncrement();  // Move character to the bottom of the door
        }
        
        // Character moving downwards and collides with the door
        else if (newYVelocity > 0) {
          newY = door.getClosedY() - this.yIncrement;  // Move character to the top of the door
          nextOnGround = true;  // Allows the character to be able to jump on doors
        }
        
        // Stop the character
        newYVelocity = 0;
      }
    }

    // Unlocking the locked doors
    for (let doorIndex = 0; doorIndex < currentLockedDoors.length; doorIndex++) {
      let door = currentLockedDoors[doorIndex];
      
      // If the door is opened, then skip the door
      if (!door.getClosed()) {
        continue;
      }
      
      // If the character would not collide with the door, move to the next door
      else if (
        (this.x + this.xIncrement < door.getX()) || 
        (this.x > door.getX() + door.getXIncrement())
      ) {
        continue;
      } else if (
        (this.y + this.yIncrement < door.getClosedY()) || 
        (this.y > door.getClosedY() + door.getClosedYIncrement())
      ) {
        continue;
      }

      // If the character collides with the door vertically, then do not unlock the door
      else if (
        (this.y + this.yIncrement == door.getClosedY()) || 
        (this.y == door.getClosedY() + door.getClosedYIncrement())
      ) {
        continue;
      }

      // Check if the character has collected a key
      // If a key is collected, then unlock and open the door using the key
      // Otherwise, do not unlock the locked door
      else if (this.correspondingCharacter == "top" && topKeyCollected) {
        openLockedDoor(doorIndex);
        topKeyCollected = false;
      } else if (this.correspondingCharacter == "bottom" && bottomKeyCollected) {
        openLockedDoor(doorIndex);
        bottomKeyCollected = false;
      }
    }
    
    // ----------------------------------------

    
    // Updates the y coordinates, the y velocity and this.onGround
    this.yVelocity = newYVelocity;
    this.y = newY;
    this.onGround = nextOnGround;
    
    // Updates this.onGround, based on whether the characters have started jumping
    if (this.yVelocity != 0) {
      this.onGround = false;
    }
  }
  
  // Displays the characters
  show() {
    switch (screen) {
      case "forest":
        fill(`hsl(345, 45%, 40%)`);
        break;
      case "volcano":
        fill(`hsl(150, 60%, 35%)`);
        break;
      case "desert":
        fill(`hsl(300, 45%, 20%)`);
        break;
    }
    
    // Use different x offsets based on the corresponding character
    // Allows the characters to be displayed after side scrolling
    switch (this.correspondingCharacter) {
      case "top":
        rect(this.x - topXOffset, this.y, this.xIncrement, this.yIncrement);
        break;
      case "bottom":
        rect(this.x - bottomXOffset, this.y, this.xIncrement, this.yIncrement);
        break;
    }
  }
}
