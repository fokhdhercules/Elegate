// ----------------------------------------
// ARROW CLASS
// Created by: Hercules Fok
// Date last updated: 18th September 2026
// 
// Purpose:
//   - Arrow movement
//   - Collision with arrows
// 
// The user is called the player, and the two objects that can move on the maps are called the characters
// ----------------------------------------

class Arrow extends Obstacle {
  // x, y: Coordinates of the tip of the arrow
  constructor(x, y, damage, correspondingCharacter, length, direction, speed) {
    super(x, y, damage, correspondingCharacter);
    this.length = length;
    this.width = arrowTexture.width * this.length / arrowTexture.height;
    this.direction = direction;  // "up", "down", "left", "right"
    this.speed = speed;

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

    // To allow the arrow to reset after a collision
    this.defaultX = this.x;
    this.defaultY = this.y;
  }

  // ----------------------------------------
  // Getters and setters
  // ----------------------------------------

  getLength() {
    return this.length;
  }

  getWidth() {
    return this.width;
  }
  
  getDirection() {
    return this.direction;
  }

  getSpeed() {
    return this.speed;
  }
  
  // ----------------------------------------


  // ----------------------------------------
  // Movement and collisions
  // ----------------------------------------

  // Update the coordinates of the arrow
  // Only check collisions with map boundaries, map blocks, characters and closed doors
  update() {
    // Predict where the arrow would go next
    let newX;
    let newY;
    switch (this.direction) {
      case "up":
        newX = this.x;
        newY = this.y - this.speed;
        break;
      case "down":
        newX = this.x;
        newY = this.y + this.speed;
        break;
      case "left":
        newX = this.x - this.speed;
        newY = this.y;
        break;
      case "right":
        newX = this.x + this.speed;
        newY = this.y;
        break;
    }

    // ----------------------------------------
    // Map boundaries
    // ----------------------------------------

    if (this.direction == "up" && newY < this.minHeight) {
      newY = this.defaultY;
    } else if (this.direction == "down" && newY > this.maxHeight) {
      newY = this.defaultY;
    } else if (this.direction == "left" && newX < 0) {
      newX = this.defaultX;
    } else if (this.direction == "right" && newX > mapWidth) {
      newX = this.defaultX;
    }
    
    // ----------------------------------------


    // ----------------------------------------
    // Map blocks, doors, characters (AABB)
    // ----------------------------------------
    
    // ... : Expands an array (like removing [])
    // []: Group the elements back to an array
    // [...arr, ...arr, arr, arr]: Combining the four arrays into one
    for (let mapElement of [...mapBlocks, ...currentDoors, ...currentLockedDoors, ...characters]) {
      // If the character or door is in a different map, then skip

      // Check map blocks
      if (mapElement instanceof MapBlock) {
        // Arrow in the top map, map block in the bottom map
        if (this.maxHeight < mapElement.getY()) {
          continue;
        }

        // Arrow in the bottom map, map block in the top map
        else if (this.minHeight > mapElement.getY() + mapElement.getYIncrement()) {
          continue;
        }
      }

      // Check characters and doors
      else if (mapElement.getCorrespondingCharacter() != this.correspondingCharacter) {
        continue;
      }
      
      // Skip opened doors
      if (mapElement instanceof Door || mapElement instanceof LockedDoor) {
        if (!mapElement.getClosed()) {
          continue;
        }
      }
      
      // Arrow going up
      if (this.direction == "up") {
        // Check if the map element collides with or is below the spawn point
        if (mapElement instanceof Door || mapElement instanceof LockedDoor) {
          if (mapElement.getClosedY() >= this.defaultY) {
            continue;
          }
        } else if (mapElement.getY() >= this.defaultY) {
          continue;
        }
        // Check x direction
        if (round(newX + this.width * 0.5, 2) < round(mapElement.getX(), 2)) {
          continue;
        } else if (round(newX - this.width * 0.5, 2) > round(mapElement.getX() + mapElement.getXIncrement(), 2)) {
          continue;
        }

        // Check door collision
        if (mapElement instanceof Door || mapElement instanceof LockedDoor) {
          if (round(newY, 2) > round(mapElement.getClosedY() + mapElement.getClosedYIncrement(), 2)) {
              continue;
          }
        }
  
        // Check map block collision
        else if (round(newY, 2) > round(mapElement.getY() + mapElement.getYIncrement(), 2)) {
          continue;
        }

        // Check character collision
        if (mapElement instanceof Character) {
          // If the arrow does not collide with the character, then continue
          if (newY + this.length < mapElement.getY() || newY > mapElement.getY() + mapElement.getYIncrement()) {
            continue;
          }
          
          // If collision happens, take damage and reset the arrow
          else {
            if (timeSinceTakingDamage > minTimeBetweenDamage) {
              currentHp -= this.damage;
              score -= this.damage;
              timeSinceTakingDamage = 0;
            }
            
            newX = this.defaultX;
            newY = this.defaultY;
            break;
          }
        }
        
        // If collision happens, reset the arrow
        newX = this.defaultX;
        newY = this.defaultY;
        break;
      }

      // Arrow going down
      else if (this.direction == "down") {
        // Check if the map element collides with or is above the spawn point
        if (mapElement instanceof Door || mapElement instanceof LockedDoor) {
          if (mapElement.getClosedY() + mapElement.getClosedYIncrement() <= this.defaultY) {
            continue;
          }
        } else if (mapElement.getY() + mapElement.getYIncrement() <= this.defaultY) {
          continue;
        }
        
        // Check x direction
        if (round(newX + this.width * 0.5, 2) < round(mapElement.getX(), 2)) {
          continue;
        } else if (round(newX - this.width * 0.5, 2) > round(mapElement.getX() + mapElement.getXIncrement(), 2)) {
          continue;
        }
        
        // Check if the map element is above the spawn point
        if (mapElement instanceof Door || mapElement instanceof LockedDoor) {
          if (mapElement.getClosedY() + mapElement.getClosedYIncrement() <= this.defaultY) {
            continue;
          }
        } else if (mapElement.getY() + mapElement.getYIncrement() <= this.defaultY) {
          continue;
        }

        // Check door collision
        if (mapElement instanceof Door || mapElement instanceof LockedDoor) {
          if (round(newY, 2) < round(mapElement.getClosedY(), 2)) {
              continue;
          }
        }
  
        // Check map block collision
        else if (round(newY, 2) < round(mapElement.getY(), 2)) {
          continue;
        }

        // Check character collision
        if (mapElement instanceof Character) {
          // If the arrow does not collide with the character, then continue
          if (newY + this.length < mapElement.getY() || newY > mapElement.getY() + mapElement.getYIncrement()) {
            continue;
          }
          
          // If collision happens, take damage and reset the arrow
          else {
            if (timeSinceTakingDamage > minTimeBetweenDamage) {
              currentHp -= this.damage;
              score -= this.damage;
              timeSinceTakingDamage = 0;
            }
            
            newX = this.defaultX;
            newY = this.defaultY;
            break;
          }
        }

        // If collision happens, reset the arrow
        newX = this.defaultX;
        newY = this.defaultY;
        break;
      }

      // Arrow going left
      else if (this.direction == "left") {
        // Check if the map element collides with or is at the right from the spawn point
        if (mapElement.getX() >= this.defaultX) {
          continue;
        }
        
        // Check y direction (doors)
        if (mapElement instanceof Door || mapElement instanceof LockedDoor) {
          if (round(newY + this.width * 0.5, 2) < round(mapElement.getClosedY(), 2)) {
            continue;
          }
          else if (round(newY - this.width * 0.5, 2) > round(mapElement.getClosedY() + mapElement.getClosedYIncrement(), 2)) {
            continue;
          }
        }
        
        // Check y direction (map blocks and characters)
        else if (round(newY + this.width * 0.5, 2) < round(mapElement.getY(), 2)) {
          continue;
        } else if (round(newY - this.width * 0.5, 2) > round(mapElement.getY() + mapElement.getYIncrement(), 2)) {
          continue;
        }

        // Check door and map block collision
        if (round(newX, 2) > round(mapElement.getX() + mapElement.getXIncrement(), 2)) {
          continue;
        }

        // Check character collision
        if (mapElement instanceof Character) {
          // If the arrow does not collide with the character, then continue
          if (newX + this.length < mapElement.getX() || newX > mapElement.getX() + mapElement.getXIncrement()) {
            continue;
          }
          
          // If collision happens, take damage and reset the arrow
          else {
            if (timeSinceTakingDamage > minTimeBetweenDamage) {
              currentHp -= this.damage;
              score -= this.damage;
              timeSinceTakingDamage = 0;
            }
            
            newX = this.defaultX;
            newY = this.defaultY;
            break;
          }
        }

        // If collision happens, reset the arrow
        newX = this.defaultX;
        newY = this.defaultY;
        break;
      }

      // Arrow going right
      else if (this.direction == "right") {
        // Check if the map element collides with or is at the left from the spawn point
        if (mapElement.getX() + mapElement.getXIncrement() <= this.defaultX) {
          continue;
        }
        
        // Check y direction (doors)
        if (mapElement instanceof Door || mapElement instanceof LockedDoor) {
          if (round(newY + this.width * 0.5, 2) < round(mapElement.getClosedY(), 2)) {
            continue;
          } else if (round(newY - this.width * 0.5, 2) > round(mapElement.getClosedY() + mapElement.getClosedYIncrement(), 2)) {
            continue;
          }
        }

        // Check y direction (map blocks and characters)
        else if (round(newY + this.width * 0.5, 2) < round(mapElement.getY(), 2)) {
          continue;
        } else if (round(newY - this.width * 0.5, 2) > round(mapElement.getY() + mapElement.getYIncrement(), 2)) {
          continue;
        }

        // Check door and map block collision
        if (round(newX, 2) < round(mapElement.getX(), 2)) {
          continue;
        }

        // Check character collision
        if (mapElement instanceof Character) {
          // If the arrow does not collide with the character, then continue
          if (newX < mapElement.getX() || newX - this.length > mapElement.getX() + mapElement.getXIncrement()) {
            continue;
          }
          
          // If collision happens, take damage and reset the arrow
          else {
            if (timeSinceTakingDamage > minTimeBetweenDamage) {
              currentHp -= this.damage;
              score -= this.damage;
              timeSinceTakingDamage = 0;
            }
            
            newX = this.defaultX;
            newY = this.defaultY;
            break;
          }
        }

        // If collision happens, reset the arrow
        newX = this.defaultX;
        newY = this.defaultY;
        break;
      }
    }
    
    // ----------------------------------------
    

    // Update the coordinates of the arrow
    this.x = newX;
    this.y = newY;
  }
  
  // ----------------------------------------


  // Displays the arrow
  show() {
    // Limit the arrow to only display in the current map
    drawingContext.save();
    drawingContext.beginPath();  // "Start"

    // Use different map x offset, based on the map that the arrow is in
    let mapXOffset;
    switch (this.correspondingCharacter) {
      case "top":
        mapXOffset = topXOffset;
        break;
      case "bottom":
        mapXOffset = bottomXOffset;
        break;
    }

    // Define the area where the arrow can be displayed
    // Only allow the arrow to be displayed in the direction where the tip of the arrow is pointing at
    // Only allow the arrow to be displayed in its corresponding map
    switch (this.direction) {
      case "up":
        drawingContext.rect(this.defaultX - this.width * 0.5 - mapXOffset, this.minHeight, this.width, min(this.maxHeight - this.minHeight, this.defaultY - this.minHeight));
        break;
      case "down":
        drawingContext.rect(this.defaultX - this.width * 0.5 - mapXOffset, max(this.minHeight, this.defaultY), this.width, min(this.maxHeight - this.minHeight, this.maxHeight - this.defaultY));
        break;
      case "left":
        drawingContext.rect(0, max(this.minHeight, this.defaultY - this.width * 0.5), this.defaultX - mapXOffset, min(this.width, this.maxHeight - this.defaultY + this.width * 0.5));
        break;
      case "right":
        drawingContext.rect(this.defaultX - this.length - mapXOffset, max(this.minHeight, this.defaultY - this.width * 0.5), width - this.defaultX + mapXOffset + this.length, min(this.width, this.maxHeight - this.defaultY + this.width * 0.5));
        break;
    }
    
    drawingContext.clip();
    
    // Arrow faces in different direction, based on where the arrow is going
    // In the original image, the arrow is pointing downwards
    let arrowRotateAngle;
    switch (this.direction) {
      case "up":
        arrowRotateAngle = PI;
        break;
      case "down":
        arrowRotateAngle = 0;
        break;
      case "left":
        arrowRotateAngle = PI * 0.5;
        break;
      case "right":
        arrowRotateAngle = PI * 1.5;
        break;
    }

    // Saves current settings
    push();
    
    // Translate centre of rotation from origin to the tip of the arrow
    switch (this.correspondingCharacter) {
      case "top":
        translate(this.x - topXOffset, this.y);
        break;
      case "bottom":
        translate(this.x - bottomXOffset, this.y);
        break;
    }

    // Rotate the arrow
    rotate(arrowRotateAngle);

    // Displays the arrow
    // Do not use this.x or this.y, as (0, 0) has been shifted to the tip of the arrow already
    image(arrowTexture, -this.width * 0.5, -this.length, this.width, this.length);

    // Restores settings
    pop();
    drawingContext.restore();
  }
}