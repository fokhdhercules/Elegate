// ----------------------------------------
// SPIKE CLASS
// Created by: Hercules Fok
// Date last updated: 18th September 2026
// 
// Purpose:
//   - Spike movement
//   - Collision with spikes
// 
// The user is called the player, and the two objects that can move on the maps are called the characters
// ----------------------------------------

class Spike extends Obstacle {
  // this.activated: Whether the spike is on or off
  // spawnTime: How long the spike is on, before the spike is deactivated
  // spawnTimeUsed: How long the spike has been activated
  // coolDownTime: How long the spike is off, before the spike is activated
  // coolDownTimeUsed: How long the spike has been deactivated
  // When coolDownTimeRemaining is in the constructor, it means how long the program has to wait, before activating the spike for the first time. Therefore, coolDownTimeUsed is set as this.coolDownTime - this.coolDownTimeRemaining
  // If coolDownTimeUsed becomes negative as a result of coolDownTimeRemaining, it simply means the program would wait longer, compared to after the spike has been activated for the first time and deactivated
  constructor(x, y, damage, correspondingCharacter, xIncrement, yIncrement, activated, spawnTime, coolDownTime, coolDownTimeRemaining) {
    super(x, y, damage, correspondingCharacter);
    this.xIncrement = xIncrement;
    this.yIncrement = yIncrement;
    this.activated = activated;  // true, false

    this.spawnTime = spawnTime;
    this.spawnTimeUsed = 0;
    this.coolDownTime = coolDownTime;
    this.coolDownTimeUsed = this.coolDownTime - coolDownTimeRemaining;
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

  getActivated() {
    return this.activated;
  }

  setActivated(newActivated) {
    this.activated = newActivated;
  }

  getSpawnTime() {
    return this.spawnTime;
  }

  getSpawnTimeUsed() {
    return this.spawnTimeUsed;
  }

  getCoolDownTime() {
    return this.coolDownTime;
  }

  getCoolDownTimeUsed() {
    return this.coolDownTimeUsed;
  }
  
  // ----------------------------------------

  
  // Update this.activated and check for collisions
  update() {
    // ----------------------------------------
    // Looping through activating and deactivating the spike
    // ----------------------------------------

    // Update this.spawnTimeUsed and check whether the spike needs to be deactivated
    if (this.activated) {
      this.spawnTimeUsed++
      if (this.spawnTimeUsed > this.spawnTime) {
        this.spawnTimeUsed = 0;
        this.coolDownTimeUsed = 0;
        this.activated = false;
      }
    }

    // Update this.coolDownTimeUsed and check whether the spike needs to be activated
    else {
      this.coolDownTimeUsed++;
      if (this.coolDownTimeUsed > this.coolDownTime) {
        this.spawnTimeUsed = 0;
        this.coolDownTimeUsed = 0;
        this.activated = true;
      }
    }
    
    // ----------------------------------------


    // ----------------------------------------
    // Collision with characters (AABB)
    // ----------------------------------------
    
    // Only check collisions, if the spike is activated
    if (this.activated) {
      for (let character of characters) {
        // Skip the character that is in the different map
        if (this.correspondingCharacter != character.getCorrespondingCharacter()) {
          continue;
        }

        // Check x direction
        else if (character.getX() + character.getXIncrement() < this.x) {
          continue;
        } else if (character.getX() > this.x + this.xIncrement) {
          continue;
        }

        // Check y direction
        else if (character.getY() + character.getYIncrement() < this.y) {
          continue;
        } else if (character.getY() > this.y + this.yIncrement) {
          continue;
        }

        // If the character collides with an activated spike, then take damage
        else if (timeSinceTakingDamage > minTimeBetweenDamage) {
          currentHp -= this.damage;
          score -= this.damage;
          timeSinceTakingDamage = 0;
        }
      }
    }
  }
  
  // Displays the spikes
  show() {
    // Use different x offset, depending on which map the spike is in
    let mapXOffset;
    switch (this.correspondingCharacter) {
      case "top":
        mapXOffset = topXOffset;
        break;
      case "bottom":
        mapXOffset = bottomXOffset;
        break;
    }

    // Display the spike as either activated or deactivated, depending on this.activated
    if (this.activated) {
      image(spikeOnTexture, this.x - mapXOffset, this.y, this.xIncrement, this.yIncrement);
    } else {
      image(spikeOffTexture, this.x - mapXOffset, this.y, this.xIncrement, this.yIncrement);
    }
  }
}