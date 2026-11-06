// ----------------------------------------
// OBSTACLE CLASS
// Created by: Hercules Fok
// Date last updated: 1st August 2026
// 
// Purpose:
//   - Allows characters to take damage, when colliding with obstacles
//   - Parent class of the Arrow, Spike and Tumbleweed classes
// 
// The user is called the player, and the two objects that can move on the maps are called the characters
// ----------------------------------------

class Obstacle {
  constructor(x, y, damage, correspondingCharacter) {
    this.x = x;
    this.y = y;
    this.damage = damage;
    this.correspondingCharacter = correspondingCharacter;  // "top", "bottom"
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

  getDamage() {
    return this.damage;
  }

  getCorrespondingCharacter() {
    return this.correspondingCharacter;
  }
  
  // ----------------------------------------
}