// ----------------------------------------
// TUMBLEWEED CLASS
// Created by: Hercules Fok
// Date last updated: 18th September 2026
// 
// Purpose:
//   - Tumbleweed movement
//   - Collision with tumbleweeds
// 
// The user is called the player, and the two objects that can move on the maps are called the characters
// ----------------------------------------

class Tumbleweed extends Obstacle {
  // xVelocity: How fast the tumbleweed moves to the left (as the wind in the desert level travels from the right to the left)
  constructor(x, y, damage, correspondingCharacter, xIncrement, yIncrement, xVelocity) {
    super(x, y, damage, correspondingCharacter);
    this.xIncrement = xIncrement;
    this.yIncrement = yIncrement;
    this.xVelocity = xVelocity;
    this.yVelocity = 0;

    // For collisions with map boundaries
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

    // For rotating the tumbleweed
    this.rotateAngle = 0;
    this.rotateSpeed = PI * 0.05;
    
    this.yAcceleration = 0.001 * (this.maxHeight - this.minHeight);  // For applying gravity to the tumbleweed and accelerating the tumbleweed towards the floor
    this.onGround = false;  // Check whether the tumbleweed is touching the top of a map block, a door or a character

    // To allow the tumbleweed to reset after a collision
    this.defaultX = this.x;
    this.defaultY = this.y;
  }

  // ----------------------------------------
  // Getters and setters
  // ----------------------------------------

  getXIncrement() {
    return this.xIncrement;
  }

  getYIncrement() {
    return this.yIncrement;
  }

  getXVelocity() {
    return this.xVelocity;
  }
  
  // ----------------------------------------

  // Move the tumbleweeds, check for collisions and rotate the tumbleweeds
  update() {
    // Predict where the tumbleweed would go next
    // The x velocity of the tumbleweed would be constant, so newXVelocity is not needed
    let newX = this.x - this.xVelocity;
    let newY;
    let newYVelocity;
    if (this.onGround) {
      newYVelocity = 0;
      newY = this.y;
    } else {
      newYVelocity = this.yVelocity + this.yAcceleration;
      newY = this.y + newYVelocity;
    }

    // Assumes the tumbleweed would not touch the ground, or the top of a map block or a door
    let newOnGround = false;

    // Collision with the left map boundary
    if (newX < 0) {
      newX = this.defaultX;
      newY = this.defaultY;
    }

    // Collision with the bottom map boundary
    if (newY + this.yIncrement > this.maxHeight) {
      newY = this.maxHeight - this.yIncrement;
      newYVelocity = 0;
      newOnGround = true;
    }

    // Collision with map blocks, doors, characters (AABB)    
    // ... : Expands an array (like removing [])
    // []: Group the elements back to an array
    // [...arr, ...arr, arr, arr]: Combining the four arrays into one
    for (let mapElement of [...mapBlocks, ...currentDoors, ...currentLockedDoors, ...characters]) {
      // If the character or door is in a different map, then skip

      // Check map blocks
      if (mapElement instanceof MapBlock) {
        // Tumbleweed in the top map, map block in the bottom map
        if (this.maxHeight < mapElement.getY()) {
          continue;
        }

        // Tumbleweed in the bottom map, map block in the top map
        else if (this.minHeight > mapElement.getY() + mapElement.getYIncrement()) {
          continue;
        }
      }

      // Check characters and doors
      else if (mapElement.getCorrespondingCharacter() != this.correspondingCharacter) {
        continue;
      }

      // Check if the map element collides with or is at the right from the spawn point
      
      // Ignore any doors that collide with the spawn point of the tumbleweed
      if (mapElement instanceof Door || mapElement instanceof LockedDoor) {
        if (this.x < mapElement.getX() + mapElement.getXIncrement() && 
            this.x + this.xIncrement > mapElement.getX() && 
            this.y < mapElement.getClosedY() + mapElement.getClosedYIncrement() && 
            this.y + this.yIncrement > mapElement.getClosedY()) {
          continue;
        }
      }
      
      // Ignore any map blocks that collide with the spawn point of the tumbleweed
      else if (mapElement instanceof MapBlock) {
        if (this.x < mapElement.getX() + mapElement.getXIncrement() && 
            this.x + this.xIncrement > mapElement.getX() && 
            this.y < mapElement.getY() + mapElement.getYIncrement() && 
            this.y + this.yIncrement > mapElement.getY()) {
          continue;
        }
      }
      
      // Skip opened doors
      if (mapElement instanceof Door || mapElement instanceof LockedDoor) {
        if (!mapElement.getClosed()) {
          continue;
        }
      }

      // If the tumbleweed does not overlap with the map element in the x direction, then skip the tumbleweed
      if (mapElement.getX() > newX + this.xIncrement) {
        continue;
      } else if (mapElement.getX() + mapElement.getXIncrement() < newX) {
        continue;
      }

      // If the tumbleweed does not overlap with a door in the y direction, then skip the tumbleweed
      if (mapElement instanceof Door || mapElement instanceof LockedDoor) {
        if (mapElement.getClosedY() > newY + this.yIncrement) {
          continue;
        } else if (mapElement.getClosedY() + mapElement.getClosedYIncrement() < newY) {
          continue;
        }
      }

      // If the tumbleweed does not overlap with a map block or a character in the y direction, then skip the tumbleweed
      // Set this.onGround to false, if the tumbleweed does not collide with the ground
      else if (mapElement.getY() > newY + this.yIncrement) {
        continue;
      } else if (mapElement.getY() + mapElement.getYIncrement() < newY) {
        continue;
      }

      // Take damage, if colliding with a character
      if (mapElement instanceof Character) {
        if (timeSinceTakingDamage > minTimeBetweenDamage) {
          currentHp -= this.damage;
          score -= this.damage;
          timeSinceTakingDamage = 0;
        }
        continue;  // Allow the tumbleweed to pass through the characters
      }

      // ----------------------------------------
      // Check whether the tumbleweed would roll on a map block or a door
      // ----------------------------------------
      
      // Compare the previous y coordinate of the tumbleweed with doors
      if (mapElement instanceof Door || mapElement instanceof LockedDoor) {
        if (this.y + this.yIncrement * 0.5 > mapElement.getClosedY()) {
          newX = this.defaultX;
          newY = this.defaultY;
          newOnGround = false;
          break;
        } else {
          newYVelocity = 0;
          newY = mapElement.getClosedY() - this.yIncrement;
          newOnGround = true;
        }
      }

      // Compare the previous y coordinate of the tumbleweed with map blocks
      else if (this.y + this.yIncrement * 0.5 > mapElement.getY()) {
        newX = this.defaultX;
        newY = this.defaultY;
        newOnGround = false;
        break;
      }

      // Otherwise, the collision must happen either in the y direction first, or in the x and y directions at the same time, and this.onGround can be set to true, so that the tumbleweed can roll on a map element
      else {
        newYVelocity = 0;
        newY = mapElement.getY() - this.yIncrement;
        newOnGround = true;
      }
      // ----------------------------------------
    }

    // Update the coordinates and y velocity of the tumbleweed, and update whether the tumbleweed would roll on a map block or a door
    this.x = newX;
    this.y = newY;
    this.yVelocity = newYVelocity;
    this.onGround = newOnGround;
    
    // Rotate the tumbleweed anticlockwise
    this.rotateAngle = (this.rotateAngle - this.rotateSpeed) % (2 * PI);
  }

  // Displays the tumbleweeds
  show() {
    // Use different map x offset, based on the map that the tumbleweed is in
    let mapXOffset;
    switch (this.correspondingCharacter) {
      case "top":
        mapXOffset = topXOffset;
        break;
      case "bottom":
        mapXOffset = bottomXOffset;
        break;
    }

    // Define the area where the tumbleweed can be displayed
    // Only allow the tumbleweed to be displayed left from its spawn point
    // Only allow the tumbleweed to be displayed in its corresponding map
    // Only allow the tumbleweed to be displayed below its spawn point
    let drawingContextX = 0;
    let drawingContextY = max(this.minHeight, this.defaultY);
    let drawingContextXIncrement = this.defaultX - mapXOffset;
    let drawingContextYIncrement = min(this.maxHeight - this.minHeight, this.maxHeight - this.defaultY);
    
    // Limit the tumbleweed to only display in the current map
    drawingContext.save();
    drawingContext.beginPath();  // "Start"
    drawingContext.rect(drawingContextX, drawingContextY, drawingContextXIncrement, drawingContextYIncrement);
    drawingContext.clip();

    // Change the opacity of the tumbleweed
    // Allows the tumbleweed can be displayed with a higher contrast with the background
    switch (this.correspondingCharacter) {
      case "top":
        this.texture = topTumbleweedTexture;
        break;
      case "bottom":
        this.texture = bottomTumbleweedTexture;
        break;
    }

    // Saves current settings
    push();
    
    // Translate centre of rotation from origin to the centre of the tumbleweed
    switch (this.correspondingCharacter) {
      case "top":
        translate(this.x + this.xIncrement * 0.5 - topXOffset, this.y + this.yIncrement * 0.5);
        break;
      case "bottom":
        translate(this.x + this.xIncrement * 0.5 - bottomXOffset, this.y + this.yIncrement * 0.5);
        break;
    }

    // Rotate the tumbleweed
    rotate(this.rotateAngle);

    // Displays the tumbleweed
    // Do not use this.x or this.y, as (0, 0) has been shifted to the centre of the tumbleweed
    image(this.texture, -this.xIncrement * 0.5, -this.yIncrement * 0.5, this.xIncrement, this.yIncrement);

    // Restores settings
    pop();
    drawingContext.restore();
  }
}