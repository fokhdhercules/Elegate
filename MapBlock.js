// ----------------------------------------
// MAP BLOCK CLASS
// Created by: Hercules Fok
// Date last updated: 29th June 2026
// 
// Purpose:
//   - Creating getters that would be used for collision
//   - Spawns the map blocks on the map
// 
// Map blocks refer to the rectangles that are in the map layout, and platforms refer to any map blocks that the characters
// All platforms are map blocks, but not all map blocks are platforms
// ----------------------------------------

class MapBlock {
  // Constructor for a MapBlock object
  // correspondingCharacter: "top" or "bottom"
  // correspondingCharacter for separating top and bottom side scrolling
  // correspondingLevel: "forest", "volcano" or "desert"
  // correspondingLevel for different display colours
  constructor(x, y, xIncrement, yIncrement, correspondingCharacter, correspondingLevel) {
    this.x = x;
    this.y = y;
    this.xIncrement = xIncrement;
    this.yIncrement = yIncrement;
    this.correspondingCharacter = correspondingCharacter;
    this.correspondingLevel = correspondingLevel;
  }
  
  // ----------------------------------------
  // Getters
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
  
  // ----------------------------------------
  
  
  // Display the map blocks
  show() {
    // Decide the colour of the map block based on the corresponding level
    let mapBlockColor;
    switch (this.correspondingLevel) {
      case "forest":
        mapBlockColor = `hsl(120, 35%, 38.5%)`;
        break;
      case "volcano":
        mapBlockColor = `hsl(20, 48.5%, 50%)`;
        break;
      case "desert":
        mapBlockColor = `hsl(40, 80%, 45%)`;
        break;
    }
    
    // Spawning the map blocks
    
    fill(mapBlockColor);
    noStroke();
    
    // Use different x offsets based on the corresponding character
    // Allows side scrolling for map blocks
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
