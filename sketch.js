// ----------------------------------------
// MAIN PROGRAM
// Created by: Hercules Fok
// Date last updated: 4th October 2026
// 
// Purpose:
//   - Creates the following screens:
//     - Title
//     - Rules
//     - Level Select
//     - Levels (Forest, Volcano, Desert)
//   - Spawns the map blocks and the two characters
//   - Key input for character movement
//   - Spawning the background
//   - Spawning and interacting with the map elements: levers, buttons, doors, keys, obstacles, exits
//   - HP system, HP bar and recovery hearts
//   - Coin system
//   - Score system
//   - Timer
//   - Game over menu, end of level menu, pause menu
// 
// The user is called the player, and the two objects that can move on the maps are called the characters
// 
// Map blocks refer to the rectangles that are in the map layout, and platforms refer to any map blocks that the characters
// All platforms are map blocks, but not all map blocks are platforms
// ----------------------------------------


// ----------------------------------------
// Main variables used
// ----------------------------------------

// Tells the program which screen the player is currently in.
let screen;  // "title", "rules", "levelSelect", "forest", "volcano", "desert"

// Stores which background is currently being displayed on the screen
// Used in the screens: title, rules, forest, volcano, desert
let backgroundTexture;

// Font
let pressStartFont;

// Rules text box
// To allow scrolling, use HTML element here instead of the text feature from the p5.js library.
let rulesTextBox;

// p5.js buttons to switch between different screens
let titlePlayButton;
let titleRulesButton;
let rulesBackButton;
let levelSelectForestButton;
let levelSelectVolcanoButton;
let levelSelectDesertButton;
let levelSelectBackButton;

// Characters
characters = [];
characterInitialised = false;

// Map
let mapWidth;  // Range of x coordinates of the maps, and the x coordinate of the right edge of the maps
let mapLayout;

// Map blocks
mapBlocks = [];
mapInitialised = false;

// Side scroll
// x offset: leftmost x coordinate of the map that is displayed on the screen
// e.g. if x offset is 10, then the range of x coordinates displayed on the screen would be from 10 to 10 + width
let topXOffset = 0;  // leftmost x coordinate of the top map
let bottomXOffset = 0;  // leftmost x coordinate of the bottom map

// Cutscenes
// Each element: stage, cutsceneXOffset, correspondingCharacter, correspondingAnimation
// stage: beforeScroll, scrollTo, animation, scrollBack
//  - beforeScroll: setting prevTopXOffset or prevBottomXOffset
//  - scrollTo: scrolling from either prevTopXOffset or prevBottomXOffset to cutsceneXOffset, by changing either topXOffset or bottomXOffset
//  - animation: displaying the animation, e.g. a key dropping, or a door opening
//  - scrollBack: scroll back to prevTopXOffset or prevBottomXOffset
// prevTopXOffset, prevBottomXOffset: Allows the program to scroll back to where the characters are
cutsceneQueue = [];
let prevTopXOffset = 0;  // top x offset before the cutscene plays
let prevBottomXOffset = 0;  // bottom x offset before the cutscene plays
let animationPlaying = false;

// Pause between each stage of a cutscene
let pauseTime = 10;  // Duration of pausing
let pauseTimeUsed = 0;  // Frames paused so far

// Check if a character has collected a key
let topKeyCollected = false;
let bottomKeyCollected = false;

// HP of a character
let defaultHp = 10;
let currentHp;

// For taking damage
minTimeBetweenDamage = 50;
timeSinceTakingDamage = minTimeBetweenDamage;

// For colliding with exits and beating levels
topCollideExit = false;
bottomCollideExit = false;

// Stores how many coins have been collected so far
coinsCollected = 0;

// For storing time since entering a level. Used for the timer
timeSinceLevelStart = 0;

// For storing the player score in a level
score = 0;

// For selecting another level, or retrying a level
let gameOverRetryButton;
let gameOverQuitButton;
let endOfLevelRetryButton;
let endOfLevelQuitButton;

// For pausing and resuming the level
let pauseButton;
let gamePaused = false;  // true: pause menu is activated; false: pause menu is deactivated

// Buttons in the pause menu
let pauseMenuResumeButton;
let pauseMenuRetryButton;
let pauseMenuQuitButton;

// Stores which background music is currently playing
let themePlaying;

// ----------------------------------------


// ----------------------------------------
// Background texture scrolling
// Loops through the background of the three levels
// ----------------------------------------

function scrollBackgrounds() {
  // Decides which background to display based on the frame count
  if (0 <= frameCount % 450 && frameCount % 450 < 150) {
    backgroundTexture = forestBackgroundTexture;
  } else if (150 <= frameCount % 450 && frameCount % 450 < 300) {
    backgroundTexture = volcanoBackgroundTexture;
  } else {
    backgroundTexture = desertBackgroundTexture;
  }
  
  // Fix aspect ratio of the background image to prevent horizontal or vertical stretching/shrinking
  let backgroundTextureWidth = backgroundTexture.width * height / backgroundTexture.height;  // Background width * Linear scale factor of the image
  let backgroundTextureHeight = height;
  
  // Displays the background
  // image(imageTexture, x, y, width, height)
  // Negative sign for x so that the background scrolls from right to left
  image(backgroundTexture, -(width * (0.0025 * frameCount) % backgroundTextureWidth), 0, backgroundTextureWidth, backgroundTextureHeight);
  image(backgroundTexture, -(width * (0.0025 * frameCount) % backgroundTextureWidth) + backgroundTextureWidth, 0, backgroundTextureWidth, backgroundTextureHeight);  // Fills in empty space, after the right edge of the background image has gone past the right edge of the screen
}

// ----------------------------------------


// ----------------------------------------
// Playing background music
// ----------------------------------------

function playBgm() {
  // Allows the background music to play as soon as a button click or a key press has occurred
  // This is due to modern browsers not allowing any audio output by default
  // Not needed in code editor page, but needed in the view only page
  userStartAudio();
  
  // Use different background music, depending on which screen or level the player is in
  switch (screen) {
    // Title theme
    case "title":
    case "rules":
    case "levelSelect":
      if (themePlaying == null) {
        themePlaying = titleTheme;
        titleTheme.loop();
      } else if (themePlaying != titleTheme) {
        themePlaying.stop();  // Prevents multiple themes from overlapping with each other
        themePlaying = titleTheme;
        titleTheme.loop();  // Loops until a level is selected
      }
      break;

    // Forest theme
    case "forest":
      if (themePlaying == null) {
        themePlaying = forestTheme;
        forestTheme.loop();
      } else if (themePlaying != forestTheme) {
        themePlaying.stop();  // Prevents multiple themes from overlapping with each other
        themePlaying = forestTheme;
        forestTheme.loop();  // Loops until the player quits the forest level
      }
      break;

    // Volcano theme
    case "volcano":
      if (themePlaying == null) {
        themePlaying = volcanoTheme;
        volcanoTheme.loop();  // Prevents multiple themes from overlapping with each other
      } else if (themePlaying != volcanoTheme) {
        themePlaying.stop();
        themePlaying = volcanoTheme;
        volcanoTheme.loop();  // Loops until the player quits the volcano level
      }
      break;

    // Desert theme
    case "desert":
      if (themePlaying == null) {
        themePlaying = desertTheme;
        desertTheme.loop();  // Prevents multiple themes from overlapping with each other
      } else if (themePlaying != desertTheme) {
        themePlaying.stop();
        themePlaying = desertTheme;
        desertTheme.loop();  // Loops until the player quits the desert level
      }
      break;
  }
}

// ----------------------------------------


// ----------------------------------------
// Subroutines for different screens
// ----------------------------------------

// titleScreen(): Subroutine corresponding to the title screen
// Two buttons: Start and Rules
// Player starts from this screen
function titleScreen() {
  scrollBackgrounds();
  
  // Title text "Elegate"
  textAlign(CENTER); // The centre coordinate of the textbox is used to locate the text.
  stroke(`hsl(60, 95%, 70%)`);
  strokeWeight(width / 75);
  fill(`hsl(0, 5%, 5%)`);
  textSize(width / 8); // Large font size so that the title stands out clearly.
  textFont(pressStartFont);
  textStyle(ITALIC);
  text("Elegate", width / 2, height / 3.5);

  // Play button
  if (titlePlayButton == null) {
    // Checks if the play button exists. If it doesn't, create it.
    titlePlayButton = createButton("Play");
    titlePlayButton.size(width/2, height/5.75);
    titlePlayButton.style("font-size", `${width / 12}px`);
    titlePlayButton.style("font-family", "'Press Start 2P'");
    titlePlayButton.style("border", `${width / 90}px solid hsl(50, 95%, 70%)`);
    titlePlayButton.style("background-color", "hsl(0, 10%, 20%)");
    titlePlayButton.style("color", "hsl(0, 5%, 95%)");
    titlePlayButton.style("text-align", "center");
    titlePlayButton.position(
      width / 2 - titlePlayButton.width / 2,
      height / 2.375
    ); // width/2 - titlePlayButton.width/2 positions the button in the middle of the horizontal axis.
  }
  
  // When the play button is pressed, everything on the screen is hidden and destroyed, and the screen is switched to the level select screen.
  titlePlayButton.mousePressed(() => {
    titlePlayButton.hide();
    titlePlayButton = null;
    titleRulesButton.hide();
    titleRulesButton = null;
    screen = "levelSelect";
  });
  
  
  // Rules button
  if (titleRulesButton == null) {
    // Checks if the rules button exists. If it doesn't, create it.
    titleRulesButton = createButton("Rules");
    titleRulesButton.size(width/2, height/6);
    titleRulesButton.style("font-size", `${width / 12}px`);
    titleRulesButton.style("font-family", "'Press Start 2P'");
    titleRulesButton.style("border", `${width / 90}px solid hsl(50, 95%, 70%)`);
    titleRulesButton.style("background-color", "hsl(0, 10%, 20%)");
    titleRulesButton.style("color", "hsl(0, 5%, 95%)");
    titleRulesButton.style("text-align", "center");
    titleRulesButton.position(
      width / 2 - titleRulesButton.width / 2,
      height / 1.45
    ); // width/2 - titleRulesButton.width/2 positions the button in the middle of the horizontal axis.
  }

  // When the rules button is pressed, everything on the screen is hidden and destroyed, and the screen is switched to the rules screen.
  titleRulesButton.mousePressed(() => {
    titlePlayButton.hide();
    titlePlayButton = null;
    titleRulesButton.hide();
    titleRulesButton = null;
    screen = "rules";
  });
}

// rulesScreen(): Subroutine corresponding to the rules screen
// Contains text for the game rules
// One button: Back
function rulesScreen() {
  scrollBackgrounds();
  
  // "Rules" text
  textAlign(CENTER); // The centre coordinate of the textbox is used to locate the text.
  stroke(`hsl(60, 95%, 70%)`);
  strokeWeight(width / 100);
  fill(`hsl(0, 5%, 5%)`);
  textSize(width / 15); // Smaller font size compared to the title text so that more of the actual rules can be displayed at once.
  textFont(pressStartFont);
  textStyle(ITALIC);
  text("Rules", width / 2, height / 4.5);
  
  // The actual rules themselves
  // As there would be a lot of text, there would not be enough space to display all the rules.
  // The player would need to scroll to read all of the rules.
  if (rulesTextBox == null) {
    // Creates the actual rules text
    rulesTextBox = createDiv(`
      <ol>
        <li> Control two characters at once </li>
        <li> If you only want one character to move, use map blocks to block the other </li>
        <li> If there are two buttons with the same colour, press on both of them to trigger mechanisms </li>
        <li> Move the characters to the exits to win </li>
        <li> Have fun! </li>
      </ol>
    `);
    
    
    // ----------------------------------------
    // Style of the rules text
    // ----------------------------------------
    
    // Colours
    rulesTextBox.size(width / 1.1, height / 1.75);
    rulesTextBox.style("color", `hsl(60, 80%, 60%)`);
    rulesTextBox.style("background-color", `hsla(0, 5%, 5%, 40%)`);  // Low opacity so that the player can still see the scrolling background
    rulesTextBox.style("-webkit-text-stroke", `${width/1000}px hsla(0, 5%, 5%, 70%)`);
    rulesTextBox.style("scrollbar-color", "hsla(60, 60%, 80%, 90%) hsl(0, 10%, 20%)");
    
    // Other styles
    rulesTextBox.style("padding-left", `${width/20}px`);
    rulesTextBox.style("padding-right", `${width/50}px`);
    rulesTextBox.style("overflow-y", "scroll");  // Vertical scrolling
    rulesTextBox.style("font-family", "'Press Start 2P'");
    rulesTextBox.style("font-size", `${width / 30}px`);
    rulesTextBox.style("line-height", `${width / 22.5}px`);
    
    // ----------------------------------------
    
    
    // Spawns the rules text
    // Horizontally centred
    rulesTextBox.style("position", "absolute");
    rulesTextBox.position(width / 2 - rulesTextBox.size().width / 2, height / 3.85);
  }
  
  // Back button
  if (rulesBackButton == null) {
    // Checks if the back button exists. If it doesn't, create it.
    rulesBackButton = createButton("Back");
    rulesBackButton.size(width/5, height/12);
    rulesBackButton.style("font-size", `${width / 30}px`);
    rulesBackButton.style("font-family", "'Press Start 2P'");
    rulesBackButton.style("border", `${width / 180}px solid hsl(50, 95%, 70%)`);
    rulesBackButton.style("background-color", "hsl(0, 10%, 20%)");
    rulesBackButton.style("color", "hsl(0, 5%, 95%)");
    rulesBackButton.style("text-align", "center");
    rulesBackButton.position(
      width / 7.25 - rulesBackButton.width / 2,
      height / 1.15
    );
  }

  // When the back button is pressed, everything on the screen is hidden and destroyed, and the screen is switched to the rules screen.
  rulesBackButton.mousePressed(() => {
    rulesTextBox.hide();
    rulesTextBox = null;
    rulesBackButton.hide();
    rulesBackButton = null;
    screen = "title";
  });
}

// Resetting a level
// Change the current arrays (currentKeys, currentDoors, etc) to empty arrays
// Assign the default values back to variables, e.g. changing topKeyCollected and bottomKeyCollected to false, or currentHp to defaultHp
function resetLevel() {
  // Ensures exactly two characters would spawn in the three levels
  characters = [];
  characterInitialised = false;
  
  mapBlocks = [];
  mapInitialised = false;

  // Reset side scrolling
  topXOffset = 0;
  bottomXOffset = 0;

  currentLevers = [];
  currentButtons = [];

  cutsceneQueue = [];
  
  currentKeys = [];
  topKeyCollected = false;
  bottomKeyCollected = false;
  
  currentDoors = [];
  currentLockedDoors = [];
  currentLadders = [];
  
  currentExits = [];
  topCollideExit = false;
  bottomCollideExit = false;
  
  currentCoins = [];
  coinsCollected = 0;
  
  currentArrows = [];
  currentSpikes = [];
  currentTumbleweeds = [];
  currentHp = defaultHp;
  currentRecoveryHearts = [];
  
  timeSinceLevelStart = 0;

  score = 0;

  gamePaused = false;

  // Remove the pause icon
  if (pauseButton != null) {
    pauseButton.hide();
    pauseButton = null;
  }

  if (pauseMenuResumeButton != null) {
    pauseMenuResumeButton.hide();
    pauseMenuResumeButton = null;
  }

  if (pauseMenuRetryButton != null) {
    pauseMenuRetryButton.hide();
    pauseMenuRetryButton = null;
  }

  if (pauseMenuQuitButton != null) {
    pauseMenuQuitButton.hide();
    pauseMenuQuitButton = null;
  }

  // ----------------------------------------
  // Removes the buttons on the game over or end of level menus, if the button exists
  // Do nothing, if the button isn't spawned and displayed on the screen initially
  // ----------------------------------------
  
  if (gameOverRetryButton != null) {
    gameOverRetryButton.hide();
    gameOverRetryButton = null;
  }
  
  if (gameOverQuitButton != null) {
    gameOverQuitButton.hide();
    gameOverQuitButton = null;
  }

  if (endOfLevelRetryButton != null) {
    endOfLevelRetryButton.hide();
    endOfLevelRetryButton = null;
  }
  
  if (endOfLevelQuitButton != null) {
    endOfLevelQuitButton.hide();
    endOfLevelQuitButton = null;
  }

  // ----------------------------------------

  // Reset format of text
  textAlign(TOP, LEFT);
}

// levelSelectScreen(): Subroutine corresponding to the level select screen
// Four buttons: Forest, Volcano, Desert, Back
function levelSelectScreen() {
  // Reset the characters, map blocks, map elements and other stats
  resetLevel();
  
  // Display the three backgrounds in the level select screen
  // backgroundTextureWidth: The width of the image after being scaled by a scale factor.
  function displayBackground(backgroundTexture, x) {
    // Fix aspect ratio of the background image to prevent horizontal or vertical stretching/shrinking
    let backgroundTextureWidth = backgroundTexture.width * height / backgroundTexture.height;  // Background width * Linear scale factor of the image
    
    // Stores canvas settings
    drawingContext.save();
    
    // Constrain the backgrounds to be in the three vertical sections of the screen
    // Prevents background from overflowing to other backgrounds
    drawingContext.beginPath();  // Start
    drawingContext.rect(x, 0, width / 3, height);  // Creating the rectangle for clipping
    drawingContext.clip();  // Constrain the background image to be only visible in the rectangle created
    
    // image(imageTexture, x, y, width, height)
    // Negative sign for x so that the background scrolls from right to left
    image(backgroundTexture, x - (backgroundTextureWidth * (0.0025 / 3 * frameCount)) % backgroundTextureWidth, 0, backgroundTextureWidth, height);
    image(backgroundTexture, x - (backgroundTextureWidth * (0.0025 / 3 * frameCount)) % backgroundTextureWidth + backgroundTextureWidth, 0, backgroundTextureWidth, height);
    
    // Restoring the canvas settings saved earlier
    drawingContext.restore();
  }
  
  displayBackground(forestBackgroundTexture, 0);
  displayBackground(volcanoBackgroundTexture, width/3);
  displayBackground(desertBackgroundTexture, 2*width/3);
  
  // The text "Choose your level"
  textAlign(CENTER); // The centre coordinate of the textbox is used to locate the text.
  stroke(`hsl(60, 95%, 70%)`);
  strokeWeight(width / 75);
  fill(`hsl(0, 5%, 5%)`);
  textSize(width / 12); // Large font size so that the text stands out clearly.
  textFont(pressStartFont);
  textStyle(ITALIC);
  text("Choose your\nlevel", width / 2, height / 4);
  
  
  // ----------------------------------------
  // The four buttons
  // ----------------------------------------
  
  // Forest button
  if (levelSelectForestButton == null) {
    // Checks if the back button exists. If it doesn't, create it.
    levelSelectForestButton = createButton("Forest");
    levelSelectForestButton.size(width/3.75, height/12);
    levelSelectForestButton.style("font-size", `${width / 30}px`);
    levelSelectForestButton.style("font-family", "'Press Start 2P'");
    levelSelectForestButton.style("border", `${width / 180}px solid hsl(160, 70%, 20%)`);
    levelSelectForestButton.style("background-color", "hsl(120, 70%, 30%)");
    levelSelectForestButton.style("color", "hsl(150, 35%, 80%)");
    levelSelectForestButton.style("text-align", "center");
    levelSelectForestButton.position(
      width / 6 - levelSelectForestButton.width / 2,
      height / 1.5
    );
    
  }
  
  // When the forest button is pressed, everything on the screen is hidden and destroyed, and the screen is switched to the forest screen.
  levelSelectForestButton.mousePressed(() => {
    levelSelectForestButton.hide();
    levelSelectForestButton = null;
    levelSelectVolcanoButton.hide();
    levelSelectVolcanoButton = null;
    levelSelectDesertButton.hide();
    levelSelectDesertButton = null;
    levelSelectBackButton.hide();
    levelSelectBackButton = null;
    screen = "forest";
  });
  
  // Volcano button
  if (levelSelectVolcanoButton == null) {
    // Checks if the back button exists. If it doesn't, create it.
    levelSelectVolcanoButton = createButton("Volcano");
    levelSelectVolcanoButton.size(width/3.75, height/12);
    levelSelectVolcanoButton.style("font-size", `${width / 30}px`);
    levelSelectVolcanoButton.style("font-family", "'Press Start 2P'");
    levelSelectVolcanoButton.style("border", `${width / 180}px solid hsl(0, 5%, 20%)`);
    levelSelectVolcanoButton.style("background-color", "hsl(0, 2.5%, 30%)");
    levelSelectVolcanoButton.style("color", "hsl(0, 80%, 65%)");
    levelSelectVolcanoButton.style("text-align", "center");
    levelSelectVolcanoButton.position(
      width / 2 - levelSelectVolcanoButton.width / 2,
      height / 1.5
    );
    
  }
  
  // When the volcano button is pressed, everything on the screen is hidden and destroyed, and the screen is switched to the volcano screen.
  levelSelectVolcanoButton.mousePressed(() => {
    levelSelectForestButton.hide();
    levelSelectForestButton = null;
    levelSelectVolcanoButton.hide();
    levelSelectVolcanoButton = null;
    levelSelectDesertButton.hide();
    levelSelectDesertButton = null;
    levelSelectBackButton.hide();
    levelSelectBackButton = null;
    screen = "volcano";
  });
  
  // Desert button
  if (levelSelectDesertButton == null) {
    // Checks if the back button exists. If it doesn't, create it.
    levelSelectDesertButton = createButton("Desert");
    levelSelectDesertButton.size(width/3.75, height/12);
    levelSelectDesertButton.style("font-size", `${width / 30}px`);
    levelSelectDesertButton.style("font-family", "'Press Start 2P'");
    levelSelectDesertButton.style("border", `${width / 180}px solid hsl(0, 35%, 25%)`);
    levelSelectDesertButton.style("background-color", "hsl(35, 90%, 70%)");
    levelSelectDesertButton.style("color", "hsl(105, 40%, 30%)");
    levelSelectDesertButton.style("text-align", "center");
    levelSelectDesertButton.position(
      5 * width / 6 - levelSelectDesertButton.width / 2,
      height / 1.5
    );
    
  }
  
  // When the desert button is pressed, everything on the screen is hidden and destroyed, and the screen is switched to the desert screen.
  levelSelectDesertButton.mousePressed(() => {
    levelSelectForestButton.hide();
    levelSelectForestButton = null;
    levelSelectVolcanoButton.hide();
    levelSelectVolcanoButton = null;
    levelSelectDesertButton.hide();
    levelSelectDesertButton = null;
    levelSelectBackButton.hide();
    levelSelectBackButton = null;
    screen = "desert";
  });
  
  // Back button
  if (levelSelectBackButton == null) {
    // Checks if the back button exists. If it doesn't, create it.
    levelSelectBackButton = createButton("Back");
    levelSelectBackButton.size(width/5, height/12);
    levelSelectBackButton.style("font-size", `${width / 30}px`);
    levelSelectBackButton.style("font-family", "'Press Start 2P'");
    levelSelectBackButton.style("border", `${width / 180}px solid hsl(50, 95%, 70%)`);
    levelSelectBackButton.style("background-color", "hsl(0, 10%, 20%)");
    levelSelectBackButton.style("color", "hsl(0, 5%, 95%)");
    levelSelectBackButton.style("text-align", "center");
    levelSelectBackButton.position(
      width / 7.25 - levelSelectBackButton.width / 2,
      height / 1.15
    );
    
  }

  // When the back button is pressed, everything on the screen is hidden and destroyed, and the screen is switched to the title screen.
  levelSelectBackButton.mousePressed(() => {
    levelSelectForestButton.hide();
    levelSelectForestButton = null;
    levelSelectVolcanoButton.hide();
    levelSelectVolcanoButton = null;
    levelSelectDesertButton.hide();
    levelSelectDesertButton = null;
    levelSelectBackButton.hide();
    levelSelectBackButton = null;
    screen = "title";
  });
  
  // ----------------------------------------
  
}

// forestScreen(): Subroutine corresponding to the forest level
function forestScreen() {
  // ----------------------------------------
  // Environmental feature in the forest level
  // Display fog
  // ----------------------------------------
  
  // Fix aspect ratio of the fog image to prevent horizontal or vertical stretching/shrinking
  let fogTextureWidth = fogTexture.width * height / fogTexture.height;  // Background width * Linear scale factor of the image
  let fogTextureHeight = height;
  
  // Display the fog image

  tint(255, 150);  // Greyscale, lowers opacity of the background image (new opacity = 175 / 255)
  
  // Scrolls horizontally from right to left
  image(fogTexture, -(width * (0.00125 * frameCount) % fogTextureWidth), height * 0.125, fogTextureWidth, fogTextureHeight);
  image(fogTexture, -(width * (0.00125 * frameCount) % fogTextureWidth) + fogTextureWidth, height * 0.125, fogTextureWidth, fogTextureHeight);  // Fills in empty space, after the right edge of the fog image has gone past the right edge of the screen

  tint(255, 255);  // Resets the opacity of images
  
  // ----------------------------------------
  
  
  mainGame();  // Main game logic
}

// volcanoScreen(): Subroutine corresponding to the volcano level
function volcanoScreen() {
  // ----------------------------------------
  // Environmental feature in the volcano level
  // Display fire particles
  // ----------------------------------------
  
  // Fix aspect ratio of the fire particle image to prevent horizontal or vertical stretching/shrinking
  let fireParticleTextureHeight = fireParticleTexture.height * width / fireParticleTexture.width;
  let fireParticleTextureWidth = width;
  
  // Display the fire particle image
  // Scrolls vertically upwards
  image(fireParticleTexture, 0, -(height * (0.00125 * frameCount) % fireParticleTextureHeight), fireParticleTextureWidth, fireParticleTextureHeight);
  image(fireParticleTexture, 0, -(height * (0.00125 * frameCount) % fireParticleTextureHeight) + fireParticleTextureHeight, fireParticleTextureWidth, fireParticleTextureHeight);  // Fills in empty space, after the bottom edge of the fire particle image has gone past the right edge of the screen
  
  // ----------------------------------------
  
  
  mainGame();  // Main game logic
}

// desertScreen(): Subroutine corresponding to the desert level
function desertScreen() {
  // ----------------------------------------
  // Environmental feature in the desert level
  // Display sandstorm
  // ----------------------------------------
  
  // Fix aspect ratio of the sandstorm image to prevent horizontal or vertical stretching/shrinking
  let sandstormTextureWidth = sandstormTexture.width * height / sandstormTexture.height;  // Background width * Linear scale factor of the image
  let sandstormTextureHeight = height;

  tint(255, 170);  // Lowers opacity of the sandstorm image so that the map elements (especially tumbleweeds) can appear on the screen more clearly
  
  // Display the sandstorm image
  // Scrolls horizontally from right to left
  image(sandstormTexture, -(width * (0.01 * frameCount) % sandstormTextureWidth), height * 0.125, sandstormTextureWidth, sandstormTextureHeight);
  image(sandstormTexture, -(width * (0.01 * frameCount) % sandstormTextureWidth) + sandstormTextureWidth, height * 0.125, sandstormTextureWidth, sandstormTextureHeight);  // Fills in empty space, after the right edge of the sandstorm image has gone past the right edge of the screen

  tint(255, 255);  // Reset opacity of other map elements
  
  // ----------------------------------------
  
  
  mainGame();  // Main game logic
}

// ----------------------------------------


// ----------------------------------------
// Types of cutscenes
// ----------------------------------------

// spawnKey(): Triggers a cutscene to spawn the keys on the map and display them
function spawnKey(keyScreen, keyIndex) {
  // ----------------------------------------
  // Obtains information about the current key
  // ----------------------------------------

  // Obtain index to decide which part of defaultKeys to consider
  let levelIndex;  // "forest": 0, "volcano": 1, "desert": 2
    switch (keyScreen) {
      case "forest":
        levelIndex = 0;
        break;
      case "volcano":
        levelIndex = 1;
        break;
      case "desert":
        levelIndex = 2;
        break;
    }
  
  // Obtain x, y and correspondingCharacter of the key
  // Use keyIndex + 1, as defaultKeys[levelIndex][0] is the name of the level, not a key
  let keyX = defaultKeys[levelIndex][keyIndex + 1][0];
  let keyY = defaultKeys[levelIndex][keyIndex + 1][1];
  // Skip index 2, as it stores whether the key would be spawned initially or not
  let keyCorrespondingCharacter = defaultKeys[levelIndex][keyIndex + 1][3];

  // Assume the key has not been spawned
  // If the x, y and corresponding character of a key from currentKeys all match the key that is passed into spawnKey(), then do not spawn the key
  let keySpawned = false;
  
  // Loop through all keys that have been spawned before, to check whether the key has already been spawned before. If it has, then do not spawn it
  // Cannot use the identifier key, as key is already defined in p5.js
  for (currentKey of currentKeys) {
    // Check x
    if (currentKey.getX() != keyX) {
      continue;
    }

    // Check y
    if (currentKey.getY() != keyY) {
      continue;
    }

    // Check corresponding character
    if (currentKey.getCorrespondingCharacter() != keyCorrespondingCharacter) {
      continue;
    }

    // If x, y and corresponding characters are the same, then do not display the key
    keySpawned = true;
    break;
  }
  
  // ----------------------------------------


  // ----------------------------------------
  // Spawning the key
  // ----------------------------------------

  // For spawning the key gradually
  // percentageDisplayed must not be zero
  // If zero is used, then there would be a very large key spawning temporarily for one frame, then vanish instantly
  // As p5.js cannot draw images with zero width and zero height
  let percentageDisplayed = 2;  // 2 to 100
  
  // Only spawn the key, if the key has not been already spawned
  if (!keySpawned) {
    cutsceneQueue.push(
      ["beforeScroll", keyX - width * 0.5, 
       () => {
         // Fix aspect ratio of the key to prevent the image of the key being distorted
         let keyXIncrement = keyTexture.width * width / 40000;
         let keyYIncrement = keyTexture.height * width / 40000;
         
         // Show the key gradually
         if (percentageDisplayed < 100) {
           // Use different x offsets, depending on whether the key is at the top or the bottom map
           switch (keyCorrespondingCharacter) {
             case "top":
               image(keyTexture, keyX - topXOffset, keyY, keyXIncrement * percentageDisplayed / 100, keyYIncrement * percentageDisplayed / 100);
               break;
             case "bottom":
               image(keyTexture, keyX - bottomXOffset, keyY, keyXIncrement * percentageDisplayed / 100, keyYIncrement * percentageDisplayed / 100);
               break;
           }
           percentageDisplayed += 3.5;

           if (percentageDisplayed >= 100) {
             currentKeys.push(new Key(keyX, keyY, keyCorrespondingCharacter));
           }
         }

         // After the key is fully displayed, stop the animation
         else {
           animationPlaying = false;
           keySpawned = true;  // Prevents the same key from spawning multiple time
         }
       }, 
       keyCorrespondingCharacter]
    );
  }
  
  // ----------------------------------------
}

// openDoor(): Triggers a cutscene to open the doors on the map
function openDoor(doorIndex) {
  // ----------------------------------------
  // Obtains information about the current door
  // ----------------------------------------
  
  // Obtain x, y, xIncrement, yIncrement, correspondingCharacter and colour of the door
  let doorX = currentDoors[doorIndex].getX();
  let doorY = currentDoors[doorIndex].getClosedY();
  let doorXIncrement = currentDoors[doorIndex].getXIncrement();
  let doorYIncrement = currentDoors[doorIndex].getClosedYIncrement();
  let doorCorrespondingCharacter = currentDoors[doorIndex].getCorrespondingCharacter();
  let doorColor = currentDoors[doorIndex].getDoorColor();
  
  // Use the door index to check whether the door is closed or not
  let doorClosed;
  if (currentDoors[doorIndex].getClosed()) {
    doorClosed = true;
  } else {
    doorClosed = false;
  }
  
  // ----------------------------------------

  // ----------------------------------------
  // Opening the door
  // ----------------------------------------

  // For opening the door gradually
  let percentageDisplayed = 0;  // 0 to 100
  
  // Only open the door, if the door is closed
  if (doorClosed) {
    // Opening the door
    cutsceneQueue.push(
      ["beforeScroll", 
       // Scroll so that the midpoint of the door appears in the middle of the screen
       doorX + doorXIncrement * 0.5 - width * 0.5, 
       () => {
         // Prevents the closed door from overlapping with the door in the animation
         currentDoors[doorIndex].setClosed(false);
         
         // Use the colour of the door
         fill(doorColor);
         
         // Open the door gradually
         if (percentageDisplayed < 100) {
           // Use different x offsets, depending on whether the door is at the top or the bottom map
           switch (doorCorrespondingCharacter) {
             case "top":
               rect(doorX - topXOffset, doorY + doorYIncrement * percentageDisplayed / 100, doorXIncrement, doorYIncrement * (100 - percentageDisplayed) / 100);
               break;
             case "bottom":
               rect(doorX - bottomXOffset, doorY + doorYIncrement * percentageDisplayed / 100, doorXIncrement, doorYIncrement * (100 - percentageDisplayed) / 100);
               break;
           }
           percentageDisplayed += 3.5;
         }

         // After the door is fully opened, stop the animation
         else {
           animationPlaying = false;
           doorClosed = false;
         }
       }, 
       doorCorrespondingCharacter]
    );
  }
  
  // ----------------------------------------
}

// closeDoor(): Triggers a cutscene to close the doors on the map
function closeDoor(doorIndex) {
  // ----------------------------------------
  // Obtains information about the current door
  // ----------------------------------------
  
  // Obtain x, y, xIncrement, yIncrement, correspondingCharacter and colour of the door
  let doorX = currentDoors[doorIndex].getX();
  let doorY = currentDoors[doorIndex].getClosedY();
  let doorXIncrement = currentDoors[doorIndex].getXIncrement();
  let doorYIncrement = currentDoors[doorIndex].getClosedYIncrement();
  let doorCorrespondingCharacter = currentDoors[doorIndex].getCorrespondingCharacter();
  let doorColor = currentDoors[doorIndex].getDoorColor();
  
  // Use the door index to check whether the door is closed or not
  let doorClosed;
  if (currentDoors[doorIndex].getClosed()) {
    doorClosed = true;
  } else {
    doorClosed = false;
  }
  
  // ----------------------------------------

  // ----------------------------------------
  // Closing the door
  // ----------------------------------------

  // For opening the door gradually
  let percentageDisplayed = 0;  // 0 to 100
  
  // Only close the door, if the door is opened
  if (!doorClosed) {
    // Closing the door
    cutsceneQueue.push(
      ["beforeScroll", 
       // Scroll so that the midpoint of the door appears in the middle of the screen
       doorX + doorXIncrement * 0.5 - width * 0.5, 
       () => {
         // Use the colour of the door
         fill(doorColor);
         
         // Close the door gradually
         // Use different x offsets, depending on whether the door is at the top or the bottom map
         // Use if (percentageDisplayed > 100) later to end animation, instead of use if (percentageDisplayed < 100) here
         // Otherwise, the door would appear to 'flash', as when percentageDisplayed goes from 98 to 100, the program would skip the code under if (percentageDisplayed < 100)
         switch (doorCorrespondingCharacter) {
           case "top":
             rect(doorX - topXOffset, doorY + doorYIncrement * (100 - percentageDisplayed) / 100, doorXIncrement, doorYIncrement * percentageDisplayed / 100);
             break;
           case "bottom":
             rect(doorX - bottomXOffset, doorY + doorYIncrement * (100 - percentageDisplayed) / 100, doorXIncrement, doorYIncrement * percentageDisplayed / 100);
             break;
         }
         percentageDisplayed += 3.5;

         // After the door is fully closed, stop the animation
         if (percentageDisplayed > 100) {
           animationPlaying = false;
           doorClosed = true;
           currentDoors[doorIndex].setClosed(true);  // Allows the door to remain closed
         }
       }, 
       doorCorrespondingCharacter]
    );
  }
  
  // ----------------------------------------
}

// openLockedDoor(): Triggers a cutscene to open the locked doors on the map
function openLockedDoor(doorIndex) {
  // ----------------------------------------
  // Obtains information about the current door
  // ----------------------------------------
  
  // Obtain x, y, xIncrement, yIncrement, correspondingCharacter and colour of the door
  let doorX = currentLockedDoors[doorIndex].getX();
  let doorY = currentLockedDoors[doorIndex].getClosedY();
  let doorXIncrement = currentLockedDoors[doorIndex].getXIncrement();
  let doorYIncrement = currentLockedDoors[doorIndex].getClosedYIncrement();
  let doorCorrespondingCharacter = currentLockedDoors[doorIndex].getCorrespondingCharacter();
  let doorColor = currentLockedDoors[doorIndex].getDoorColor();
  
  // Use the door index to check whether the door is closed or not
  let doorClosed;
  if (currentLockedDoors[doorIndex].getClosed()) {
    doorClosed = true;
  } else {
    doorClosed = false;
  }
  
  // ----------------------------------------

  // ----------------------------------------
  // Unlocking and opening the door
  // ----------------------------------------

  // openLockedDoorStage: Tells the program which part of the animation of unlocking the door is playing
  // unlockDoor: Changing the padlock from a locked icon to an unlocked icon
  // dropPadlock: Move the padlock down, and fade away
  // doorOpening: Door 'sliding down', like in openDoor()
  let openLockedDoorStage = "unlockDoor";
  
  // For moving the padlock down, padlock fading away, and opening the door gradually
  let percentageDisplayed = 0;  // 0 to 100
  
  // Only open the door, if the door is closed
  if (doorClosed) {
    // Opening the door
    cutsceneQueue.push(
      ["beforeScroll", 
       // Scroll so that the midpoint of the door appears in the middle of the screen
       doorX + doorXIncrement * 0.5 - width * 0.5, 
       () => {
         switch (openLockedDoorStage) {
           case "unlockDoor":
             // Change the padlock icon from locked to unlocked
             currentLockedDoors[doorIndex].setLocked(false);

             // Pause by pauseTime before removing the padlock
             if (pauseTimeUsed < pauseTime) {
               pauseTimeUsed++;
             } else {
               pauseTimeUsed = 0;  // Reset pause time used so that the pause time can be used later
               openLockedDoorStage = "dropPadlock";
             }
             break;
           case "dropPadlock":
             // Avoid using show() directly to display the door
             // So that the padlock can move down and fade away later
             currentLockedDoors[doorIndex].setClosed(false);

             // Use the colour of the door
             fill(doorColor);
             
             // Display the rectangle that represents the door
             // Use different x offsets, depending on whether the door is at the top or the bottom map
             switch (doorCorrespondingCharacter) {
               case "top":
                 rect(doorX - topXOffset, doorY, doorXIncrement, doorYIncrement);
                 break;
               case "bottom":
                 rect(doorX - bottomXOffset, doorY, doorXIncrement, doorYIncrement);
                 break;
             }

             // Padlock moving down and 'fading away'
             if (percentageDisplayed < 100) {
               // Fix aspect ratio of the padlock to prevent the image of the padlock being distorted
               let padlockWidth = unlockedPadlockTexture.width * width / 30000;
               let padlockHeight = unlockedPadlockTexture.height * width / 30000;

               // Original x coordinate of the top left corner of the padlock
               let padlockX = currentLockedDoors[doorIndex].getX() + currentLockedDoors[doorIndex].getXIncrement() * 0.5 - padlockWidth * 0.5;
               
               // Get range of the possible y coordinates that the padlock can be
               let padlockMinY = currentLockedDoors[doorIndex].getClosedY() + currentLockedDoors[doorIndex].getClosedYIncrement() * 0.5 - padlockHeight * 0.5;  // Original y coordinate of the top left corner of the padlock
               let padlockMaxY = currentLockedDoors[doorIndex].getClosedY() + currentLockedDoors[doorIndex].getClosedYIncrement() - padlockHeight;  // y coordinate of the top left corner of the padlock, when the bottom edge of the padlock touches the bottom edge of the door
               
               tint(255, 255 * (100 - percentageDisplayed) / 100);  // Allows the padlock to 'fade away'
               // Moving the padlock down using percentageDisplayed
               // Use different x offsets, depending on whether the door is at the top or the bottom map
               switch (doorCorrespondingCharacter) {
                 case "top":
                   image(unlockedPadlockTexture, padlockX - topXOffset, padlockMinY + (padlockMaxY - padlockMinY) * percentageDisplayed / 100, padlockWidth, padlockHeight);
                   break;
                 case "bottom":
                   image(unlockedPadlockTexture, padlockX - bottomXOffset, padlockMinY + (padlockMaxY - padlockMinY) * percentageDisplayed / 100, padlockWidth, padlockHeight);
                   break;
               }
               
               tint(255, 255);  // Reset opacity of other map elements
               percentageDisplayed += 3.5;
             }
             else if (pauseTimeUsed < pauseTime) {
               pauseTimeUsed++;
             } else {
               percentageDisplayed = 0;  // Reset percentage displayed so that the door can open by 'sliding down' later
               pauseTimeUsed = 0;  // Reset pause time used so that the pause time can be used later
               openLockedDoorStage = "doorOpening";
             }
             break;
           case "doorOpening":
             // Use the colour of the door
             fill(doorColor);
             
             // Open the door gradually
             if (percentageDisplayed < 100) {
               // Use different x offsets, depending on whether the door is at the top or the bottom map
               switch (doorCorrespondingCharacter) {
                 case "top":
                   rect(doorX - topXOffset, doorY + doorYIncrement * percentageDisplayed / 100, doorXIncrement, doorYIncrement * (100 - percentageDisplayed) / 100);
                   break;
                 case "bottom":
                   rect(doorX - bottomXOffset, doorY + doorYIncrement * percentageDisplayed / 100, doorXIncrement, doorYIncrement * (100 - percentageDisplayed) / 100);
                   break;
               }
               percentageDisplayed += 3.5;
             }
    
             // After the door is fully opened, stop the animation
             else {
               animationPlaying = false;
               doorClosed = false;
             }
            break;
         }
       }, 
       doorCorrespondingCharacter]
    );
  }
  
  // ----------------------------------------
}

// spawnLadder(): Triggers a cutscene to spawn a ladder
function spawnLadder(ladderIndex) {
  // ----------------------------------------
  // Obtains information about the current ladder
  // ----------------------------------------
  
  // Obtain x, y, xIncrement, yIncrement and correspondingCharacter of the ladder
  let ladderX = currentLadders[ladderIndex].getX();
  let ladderY = currentLadders[ladderIndex].getY();
  let ladderXIncrement = currentLadders[ladderIndex].getXIncrement();
  let ladderYIncrement = currentLadders[ladderIndex].getYIncrement();
  let ladderCorrespondingCharacter = currentLadders[ladderIndex].getCorrespondingCharacter();
  
  // Use the ladder index to check whether the ladder has spawned
  let ladderSpawned;
  if (currentLadders[ladderIndex].getSpawned()) {
    ladderSpawned = true;
  } else {
    ladderSpawned = false;
  }
  
  // ----------------------------------------

  // ----------------------------------------
  // Spawning the ladder
  // ----------------------------------------

  // For spawning the ladder gradually
  let percentageDisplayed = 0;  // 0 to 100
  
  // Only spawn the ladder, if the ladder has not been already spawned
  if (!ladderSpawned) {
    // Opening the door
    cutsceneQueue.push(
      ["beforeScroll", 
       // Scroll so that the midpoint of the ladder appears in the middle of the screen
       ladderX + ladderXIncrement * 0.5 - width * 0.5, 
       () => {
         // ----------------------------------------
         // Setting up drawingContext
         // ----------------------------------------
         
         // Stores canvas settings
         drawingContext.save();
         
         // Only display a ladder where the ladder would be
         // Allows the ladder to be displayed gradually when the ladder is dropped, instead of display the whole ladder initially
         drawingContext.beginPath();  // Start

         // Creating the rectangle for clipping
         // Use different x offsets, depending on whether the ladder is at the top or the bottom map
         switch (ladderCorrespondingCharacter) {
           case "top":
             drawingContext.rect(ladderX - topXOffset, ladderY, ladderXIncrement, ladderYIncrement);
             break;
           case "bottom":
             drawingContext.rect(ladderX - bottomXOffset, ladderY, ladderXIncrement, ladderYIncrement);
             break;
         }
         
         drawingContext.clip();  // Constrain the ladder to only be visible in the region where the ladder would be

         // ----------------------------------------
         
         
         // Spawning the ladder gradually by dropping the ladder
         if (percentageDisplayed < 100) {
           // Use different x offsets, depending on whether the ladder is at the top or the bottom map
           switch (ladderCorrespondingCharacter) {
             case "top":
               image(ladderTexture, ladderX - topXOffset, ladderY - ladderYIncrement * (100 - percentageDisplayed) / 100, ladderXIncrement, ladderYIncrement);
               break;
             case "bottom":
               image(ladderTexture, ladderX - bottomXOffset, ladderY - ladderYIncrement * (100 - percentageDisplayed) / 100, ladderXIncrement, ladderYIncrement);
               break;
           }
           percentageDisplayed += 3.5;

           // After the ladder is fully displayed, set the ladder to be spawned
           if (percentageDisplayed >= 100) {
             currentLadders[ladderIndex].setSpawned(true);
           }
         }

         // After the ladder is fully spawned, stop the animation
         else {
           animationPlaying = false;
         }

         // Restoring the canvas settings saved earlier
         drawingContext.restore();
       }, 
       ladderCorrespondingCharacter]
    );
  }
  
  // ----------------------------------------
}

// ----------------------------------------


// ----------------------------------------
// Main game logic
// ----------------------------------------

// mainGame(): Subroutine for the game features
// Features include:
//  - Spawning background, map elements and characters
//  - Player movement
//  - Collision
//  - Side scrolling
//  - HP system and HP bar
function mainGame() {
  // Spawning the map blocks, levers, buttons and other map elements
  function spawnMap() {
    // Get index of the layout lists (mapLayout, defaultLevers, etc) to use, based on the level that the player is in
    let levelIndex;
    switch (screen) {
      case "forest":
        levelIndex = 0;
        break;
      case "volcano":
        levelIndex = 1;
        break;
      case "desert":
        levelIndex = 2;
        break;
    }
    
    // ----------------------------------------
    // Map blocks
    // ----------------------------------------
    
    // Loop through map layout to spawn the map blocks
    // Start at index 1, as index 0 is the name of the screen
    for (let mapBlockIndex = 1; mapBlockIndex < mapLayout[levelIndex].length; mapBlockIndex++) {
      // Retrieving map block data from mapLayout
      let mapBlock = mapLayout[levelIndex][mapBlockIndex];
      let mapBlockX = mapBlock[0];
      let mapBlockY = mapBlock[1];
      let mapBlockXIncrement =mapBlock[2];
      let mapBlockYIncrement = mapBlock[3];
      let mapBlockCorrespondingCharacter = mapBlock[4];
      
      // Creating the map block object
      mapBlocks.push(new MapBlock(mapBlockX, mapBlockY, mapBlockXIncrement, mapBlockYIncrement, mapBlockCorrespondingCharacter, screen));
    }

    // ----------------------------------------


    // ----------------------------------------
    // Exits
    // ----------------------------------------

    // Loop through defaultExits to spawn the exits
    // Start at index 1, as index 0 is the name of the screen
    for (let exitIndex = 1; exitIndex < defaultExits[levelIndex].length; exitIndex++) {
      exit = defaultExits[levelIndex][exitIndex];
      currentExits.push(new Exit(
        exit[0],  // x
        exit[1],  // y
        exit[2],  // xIncrement
        exit[3],  // yIncrement
        screen,  // correspondingLevel
        exit[4],  // correspondingCharacter
      ));
    }
    // ----------------------------------------


    // ----------------------------------------
    // Levers
    // ----------------------------------------

    // Loop through defaultLevers to spawn the levers
    // Start at index 1, as index 0 is the name of the screen
    
    for (let leverIndex = 1; leverIndex < defaultLevers[levelIndex].length; leverIndex++) {
      // Retrieving lever data from defaultLevers
      let lever = defaultLevers[levelIndex][leverIndex];
      let leverX = lever[0];
      let leverY = lever[1];
      let leverXIncrement = lever[2];
      let leverXOffset = lever[3];
      let leverYIncrement = lever[4];
      let leverState = lever[5];
      let leverLeftCorrespondingSubroutine = lever[6];
      let leverRightCorrespondingSubroutine = lever[7];
      let leverCorrespondingCharacter = lever[8];

      // Creating the lever object
      currentLevers.push(new Lever(screen, leverX, leverY, leverXIncrement, leverXOffset, leverYIncrement, leverState, leverLeftCorrespondingSubroutine, leverRightCorrespondingSubroutine, leverCorrespondingCharacter));
    }
    
    // ----------------------------------------
    // Buttons
    // ----------------------------------------
    
    // Loop through defaultButtons to spawn the buttons
    // Start at index 1, as index 0 is the name of the screen
    
    for (let buttonIndex = 1; buttonIndex < defaultButtons[levelIndex].length; buttonIndex++) {
      // Retrieving lever data from defaultLevers
      let button = defaultButtons[levelIndex][buttonIndex];
      let buttonX = button[0];
      let buttonY = button[1];
      let buttonXIncrement = button[2];
      let buttonYIncrement = button[3];
      let buttonCorrespondingSubroutine = button[4];
      let buttonCorrespondingCharacter = button[5];
      let buttonColor = button[6];

      // Creating the button object
      currentButtons.push(new Button(screen, buttonX, buttonY, buttonXIncrement, buttonYIncrement, buttonCorrespondingSubroutine, buttonCorrespondingCharacter, buttonColor));
    }
    
    // ----------------------------------------


    // ----------------------------------------
    // Keys
    // ----------------------------------------
    
    // Spawn every key that is supposed to be spawned initially
    // Start at index 1, as the first element in defaultKeys[levelIndex] would be the name of a screen, instead of a key
    for (let keyIndex = 1; keyIndex < defaultKeys[levelIndex].length; keyIndex++) {
      // If the key is supposed to be spawned initially, then spawn the key
      if (defaultKeys[levelIndex][keyIndex][2]) {
        currentKeys.push(new Key(defaultKeys[levelIndex][keyIndex][0],
                        defaultKeys[levelIndex][keyIndex][1],
                         // Skip index 2, as index 2 represents whether a key is spawned initially or not, and is not required in the constructor
                        defaultKeys[levelIndex][keyIndex][3]));
      }
    }

    // ----------------------------------------


    // ----------------------------------------
    // Doors and locked doors
    // ----------------------------------------

    // Spawn every door in the level
    // Start at index 1, as the first element in defaultDoors[levelIndex] would be the name of a screen, instead of a door
    for (let doorIndex = 1; doorIndex < defaultDoors[levelIndex].length; doorIndex++) {
      // Door class: constructor(correspondingLevel, x, closedY, xIncrement, closedYIncrement, closed, correspondingCharacter)
      currentDoors.push(new Door(
        screen,
        defaultDoors[levelIndex][doorIndex][0],
        defaultDoors[levelIndex][doorIndex][1],
        defaultDoors[levelIndex][doorIndex][2],
        defaultDoors[levelIndex][doorIndex][3],
        defaultDoors[levelIndex][doorIndex][4],
        defaultDoors[levelIndex][doorIndex][5]
      ));
    }

    // Spawn every locked door in the level
    // Start at index 1, as the first element in defaultLockedDoors[levelIndex] would be the name of a screen, instead of a door
    for (let doorIndex = 1; doorIndex < defaultLockedDoors[levelIndex].length; doorIndex++) {
      // LockedDoor class: constructor(correspondingLevel, x, closedY, xIncrement, closedYIncrement, closed, correspondingCharacter)
      currentLockedDoors.push(new LockedDoor(
        screen,
        defaultLockedDoors[levelIndex][doorIndex][0],
        defaultLockedDoors[levelIndex][doorIndex][1],
        defaultLockedDoors[levelIndex][doorIndex][2],
        defaultLockedDoors[levelIndex][doorIndex][3],
        true,
        defaultLockedDoors[levelIndex][doorIndex][4],
      ));
    }
    
    // ----------------------------------------


    // ----------------------------------------
    // Ladders
    // ----------------------------------------

    // Loop through defaultLadders to spawn the ladders
    // Start at index 1, as the first element in defaultLadders[levelIndex] would be the name of a screen, instead of a ladder
    for (let ladderIndex = 1; ladderIndex < defaultLadders[levelIndex].length; ladderIndex++) {
      currentLadders.push(new Ladder(
        defaultLadders[levelIndex][ladderIndex][0],
        defaultLadders[levelIndex][ladderIndex][1],
        defaultLadders[levelIndex][ladderIndex][2],
        defaultLadders[levelIndex][ladderIndex][3],
        defaultLadders[levelIndex][ladderIndex][4],
        defaultLadders[levelIndex][ladderIndex][5]
      ));
    }

    // ----------------------------------------


    // ----------------------------------------
    // HP
    // ----------------------------------------

    // Full HP when entering a level
    currentHp = defaultHp;
    
    // ----------------------------------------


    // ----------------------------------------
    // Arrows
    // ----------------------------------------

    // Only spawns the arrows in the forest level
    if (screen == "forest") {
      for (let arrow of defaultArrows) {
        currentArrows.push(new Arrow(
          arrow[0],  // x
          arrow[1],  // y
          arrow[2],  // damage
          arrow[3],  // correspondingCharacter
          arrow[4],  // length
          arrow[5],  // direction
          arrow[6]   // speed
        ));
      }
    }
    
    // ----------------------------------------


    // ----------------------------------------
    // Spikes
    // ----------------------------------------

    // Only spawns the spikes in the volcano level
    if (screen == "volcano") {
      for (let spike of defaultSpikes) {
        currentSpikes.push(new Spike(
          spike[0],  // x
          spike[1],  // y
          spike[2],  // damage
          spike[3],  // correspondingCharacter
          spike[4],  // xIncrement
          spike[5],  // yIncrement
          spike[6],  // activated
          spike[7],  // spawnTime
          spike[8],  // coolDownTime
          spike[9]   // coolDownTimeRemaining
        ));
      }
    }

    // ----------------------------------------


    // ----------------------------------------
    // Tumbleweeds
    // ----------------------------------------

    // Only spawns the tumbleweeds in the desert level
    if (screen == "desert") {
      for (tumbleweed of defaultTumbleweeds) {
        currentTumbleweeds.push(new Tumbleweed(
          tumbleweed[0],  // x
          tumbleweed[1],  // y
          tumbleweed[2],  // damage
          tumbleweed[3],  // correspondingCharacter
          tumbleweed[4],  // xIncrement
          tumbleweed[5],  // yIncrement
          tumbleweed[6]   // xVelocity
        ));
      }
    }
    
    // ----------------------------------------

    
    timeSinceTakingDamage = minTimeBetweenDamage;  // Prevents the player from taking damage immediately after entering a level

    
    // ----------------------------------------
    // Coins
    // ----------------------------------------

    // Loop through defaultCoins to spawn the coins
    // Start at index 1, as the first element in defaultCoins[levelIndex] would be the name of a screen, instead of a coin
    for (let coinIndex = 1; coinIndex < defaultCoins[levelIndex].length; coinIndex++) {
      currentCoins.push(new Coin(
        defaultCoins[levelIndex][coinIndex][0],  // x
        defaultCoins[levelIndex][coinIndex][1],  // y
        defaultCoins[levelIndex][coinIndex][2],  // xIncrement
        defaultCoins[levelIndex][coinIndex][3],  // yIncrement
        defaultCoins[levelIndex][coinIndex][4]   // correspondingCharacter
      ));
    }

    // ----------------------------------------

    // ----------------------------------------
    // Recovery hearts
    // ----------------------------------------

    // Loop through defaultRecoveryHearts to spawn the recovery hearts
    // Start at index 1, as the first element in defaultRecoveryHearts[levelIndex] would be the name of a screen, instead of a recovery heart
    for (let heartIndex = 1; heartIndex < defaultRecoveryHearts[levelIndex].length; heartIndex++) {
      currentRecoveryHearts.push(new RecoveryHeart(
        defaultRecoveryHearts[levelIndex][heartIndex][0],  // x
        defaultRecoveryHearts[levelIndex][heartIndex][1],  // y
        defaultRecoveryHearts[levelIndex][heartIndex][2],  // xIncrement
        defaultRecoveryHearts[levelIndex][heartIndex][3],  // yIncrement
        defaultRecoveryHearts[levelIndex][heartIndex][4]   // correspondingCharacter
      ));
    }

    // ----------------------------------------
  }

  // Displays the cutscenes
  // Cannot use a for loop, as the length of cutsceneQueue would change, as cutscenes would be dequeued
  function displayCutscene() {
    // ----------------------------------------
    // Obtaining information about the cutscene
    // ----------------------------------------
    
    // Obtain the cutscene that is currently being displayed
    let currentCutscene = cutsceneQueue[0];

    // Obtain information about the current cutscene
    let cutsceneStage = currentCutscene[0];  // "beforeScroll", "scrollTo", "animation", "scrollBack"
    let cutsceneXOffset = constrain(currentCutscene[1], 0, mapWidth - width);  // temporary map x offsets used during the cutscene
    let cutsceneAnimation = currentCutscene[2];  // animation like dropping keys or opening doors
    let cutsceneCorrespondingCharacter = currentCutscene[3];  // "top", "bottom"
    let cutsceneScrollSpeed = mapWidth * 0.005;  // controls how fast the map sidescrolls

    // ----------------------------------------


    // ----------------------------------------
    // Changing the appearance of the map without the cutscene
    // For usability only
    // Allows players to know the other map is temporarily disabled
    // 
    // Each level would use a rectangle that covers the map without the cutscene
    // The colour depends on the level
    // ----------------------------------------
    
    // Forest level, cutscene at the top map
    if (cutsceneCorrespondingCharacter == "top" && screen == "forest") {
      fill(`hsla(120, 80%, 50%, 0.15)`);
      rect(0, height * 0.5125, width, height * 0.3625);
    }

    // Forest level, cutscene at the bottom map
    else if (cutsceneCorrespondingCharacter == "top" && screen == "volcano") {
      fill(`hsla(20, 80%, 50%, 0.15)`);
      rect(0, height * 0.5125, width, height * 0.3625);
    }
    
    // Volcano level, cutscene at the top map
    else if (cutsceneCorrespondingCharacter == "top" && screen == "desert") {
      fill(`hsla(40, 85%, 40%, 0.15)`);
      rect(0, height * 0.5125, width, height * 0.3625);
    }
    
    // Volcano level, cutscene at the bottom map
    else if (cutsceneCorrespondingCharacter == "bottom" && screen == "forest") {
      fill(`hsla(120, 80%, 50%, 0.15)`);
      rect(0, height * 0.125, width, height * 0.3625);
    }

    // Desert level, cutscene at the top map
    else if (cutsceneCorrespondingCharacter == "bottom" && screen == "volcano") {
      fill(`hsla(20, 80%, 50%, 0.15)`);
      rect(0, height * 0.125, width, height * 0.3625);
    }

    // Desert level, cutscene at the bottom map
    else {
      fill(`hsla(40, 85%, 40%, 0.15)`);
      rect(0, height * 0.125, width, height * 0.3625);
    }

    // ----------------------------------------


    // ----------------------------------------
    // Displaying the cutscenes
    // ----------------------------------------

    // cutsceneStage: beforeScroll, scrollTo, animation, scrollBack
    //  - beforeScroll: setting prevTopXOffset or prevBottomXOffset
    //  - scrollTo: scrolling from either prevTopXOffset or prevBottomXOffset to cutsceneXOffset, by changing either topXOffset or bottomXOffset
    //  - animation: displaying the animation, e.g. a key dropping, or a door opening
    //  - scrollBack: scroll back to prevTopXOffset or prevBottomXOffset
    switch (cutsceneStage) {
      // beforeScroll: setting prevTopXOffset or prevBottomXOffset to topXOffset or bottomXOffset
      case "beforeScroll":
        // Decides which offset to store, based on which map would be sidescrolled
        if (cutsceneCorrespondingCharacter == "top") {
          prevTopXOffset = topXOffset;
        } else if (cutsceneCorrespondingCharacter == "bottom") {
          prevBottomXOffset = bottomXOffset;
        }

        // Pause the game temporarily
        // Allows the player to process the information about a lever changing state, or a button being pressed, instead of immediately overwhelming them with sudden automatic side scroll for the cutscene
        // If the entire pause time allowed has not been used up yet, then the game continues to be paused
        if (pauseTimeUsed < pauseTime) {
          pauseTimeUsed++;
        } else {
          // After pausing, the corresponding map would side scroll to where the animations would be displayed
          currentCutscene[0] = "scrollTo";
          pauseTimeUsed = 0;  // Reset pause time used so that the pause time can be used later
        }
        break;

      // scrollTo: scrolling to where the animation is displayed
      case "scrollTo":
        // Top map, scrolling to the right
        if ((cutsceneCorrespondingCharacter == "top") && (prevTopXOffset < cutsceneXOffset)) {
          // Predicts the new x offset
          let newTopXOffset = topXOffset + cutsceneScrollSpeed;
          
          // Set the map x offset to the new x offset, as long as the map would not scroll past the cutscene x offset
          if (newTopXOffset < cutsceneXOffset) {
            topXOffset = newTopXOffset;
          }
          
          // If the new x offset would cause scrolling past the x offset for the cutscene, then set the new x offset to the cutscene x offset
          else {
            topXOffset = cutsceneXOffset;
            
            // If the entire pause time allowed has not been used up yet, then the game continues to be paused
            if (pauseTimeUsed < pauseTime) {
              pauseTimeUsed++;
            } else {
              // After side scrolling, the animation would be played
              currentCutscene[0] = "animation";
              pauseTimeUsed = 0;  // Reset pause time used so that the pause time can be used later
              animationPlaying = true;  // Allows animation to start playing
            }
          }
        }

        // Top map, scrolling to the left
        else if (cutsceneCorrespondingCharacter == "top") {
          // Predicts the new x offset
          let newTopXOffset = topXOffset - cutsceneScrollSpeed;

          // Set the map x offset to the new x offset, as long as the map would not scroll past the cutscene x offset
          if (newTopXOffset > cutsceneXOffset) {
            topXOffset = newTopXOffset;
          }

          // If the new x offset would cause scrolling past the x offset for the cutscene, then set the new x offset to the cutscene x offset
          else {
            topXOffset = cutsceneXOffset;
            
            // If the entire pause time allowed has not been used up yet, then the game continues to be paused
            if (pauseTimeUsed < pauseTime) {
              pauseTimeUsed++;
            } else {
              // After side scrolling, the animation would be played
              currentCutscene[0] = "animation";
              pauseTimeUsed = 0;  // Reset pause time used so that the pause time can be used later
              animationPlaying = true;  // Allows animation to start playing
            }
          }
        }

        // Bottom map, scrolling to the right
        else if ((cutsceneCorrespondingCharacter == "bottom") && (prevBottomXOffset < cutsceneXOffset)) {
          // Predicts the new x offset
          let newBottomXOffset = bottomXOffset + cutsceneScrollSpeed;
          
          // Set the map x offset to the new x offset, as long as the map would not scroll past the cutscene x offset
          if (newBottomXOffset < cutsceneXOffset) {
            bottomXOffset = newBottomXOffset;
          }
          
          // If the new x offset would cause scrolling past the x offset for the cutscene, then set the new x offset to the cutscene x offset
          else {
            bottomXOffset = cutsceneXOffset;
            
            // If the entire pause time allowed has not been used up yet, then the game continues to be paused
            if (pauseTimeUsed < pauseTime) {
              pauseTimeUsed++;
            } else {
              // After side scrolling, the animation would be played
              currentCutscene[0] = "animation";
              pauseTimeUsed = 0;  // Reset pause time used so that the pause time can be used later
              animationPlaying = true;  // Allows animation to start playing
            }
          }
        }

        // Bottom map, scrolling to the left
        else {
          // Predicts the new x offset
          let newBottomXOffset = bottomXOffset - cutsceneScrollSpeed;
          
          // Set the map x offset to the new x offset, as long as the map would not scroll past the cutscene x offset
          if (newBottomXOffset > cutsceneXOffset) {
            bottomXOffset = newBottomXOffset;
          }
          
          // If the new x offset would cause scrolling past the x offset for the cutscene, then set the new x offset to the cutscene x offset
          else {
            bottomXOffset = cutsceneXOffset;
            
            // If the entire pause time allowed has not been used up yet, then the game continues to be paused
            if (pauseTimeUsed < pauseTime) {
              pauseTimeUsed++;
            } else {
              // After side scrolling, the animation would be played
              currentCutscene[0] = "animation";
              pauseTimeUsed = 0;  // Reset pause time used so that the pause time can be used later
              animationPlaying = true;  // Allows animation to start playing
            }
          }
        }
        
        break;
      
      // animation: Displaying the animation, e.g. spawning keys, opening doors, etc
      case "animation":
        if (animationPlaying) {
          cutsceneAnimation();
        }
        
        // If the entire pause time allowed has not been used up yet, then the game continues to be paused
        else if (pauseTimeUsed < pauseTime) {
          pauseTimeUsed++;
        } else {
          currentCutscene[0] = "scrollBack";
          pauseTimeUsed = 0;  // Reset pause time used so that the pause time can be used later
          animationPlaying = false;  // Prevents any more animation from playing in this cutscene
        }
        break;
      
      // scrollBack: scroll to where the map x offsets were, so that the characters appear on the screen again
      case "scrollBack":
        // Top map, scrolling back to the left
        if ((cutsceneCorrespondingCharacter == "top") && (prevTopXOffset < cutsceneXOffset)) {
          // Predicts the new x offset
          let newTopXOffset = topXOffset - cutsceneScrollSpeed;
          
          // Set the map x offset to the new x offset, as long as the map would not scroll past the cutscene x offset
          if (newTopXOffset > prevTopXOffset) {
            topXOffset = newTopXOffset;
          }
          
          // If the new x offset would cause scrolling past the original x offset, then set the new x offset to the original x offset, and end the cutscene by removing it from cutsceneQueue
          else {
            topXOffset = prevTopXOffset;
            cutsceneQueue.shift();  // Removes the first element from cutsceneQueue. Same functionality as dequeuing from a queue
          }
        }

        // Top map, scrolling back to the right
        else if (cutsceneCorrespondingCharacter == "top") {
          // Predicts the new x offset
          let newTopXOffset = topXOffset + cutsceneScrollSpeed;
          
          // Set the map x offset to the new x offset, as long as the map would not scroll past the cutscene x offset
          if (newTopXOffset < prevTopXOffset) {
            topXOffset = newTopXOffset;
          }
          
          // If the new x offset would cause scrolling past the original x offset, then set the new x offset to the original x offset, and end the cutscene by removing it from cutsceneQueue
          else {
            topXOffset = prevTopXOffset;
            cutsceneQueue.shift();  // Removes the first element from cutsceneQueue. Same functionality as dequeuing from a queue
          }
        }

        // Bottom map, scrolling back to the left
        else if ((cutsceneCorrespondingCharacter == "bottom") && (prevBottomXOffset < cutsceneXOffset)) {
          // Predicts the new x offset
          let newBottomXOffset = bottomXOffset - cutsceneScrollSpeed;
          
          // Set the map x offset to the new x offset, as long as the map would not scroll past the cutscene x offset
          if (newBottomXOffset > prevBottomXOffset) {
            bottomXOffset = newBottomXOffset;
          }
          
          // If the new x offset would cause scrolling past the original x offset, then set the new x offset to the original x offset, and end the cutscene by removing it from cutsceneQueue
          else {
            bottomXOffset = prevBottomXOffset;
            cutsceneQueue.shift();  // Removes the first element from cutsceneQueue. Same functionality as dequeuing from a queue
          }
        }

        // Bottom map, scrolling back to the right
        else {
          // Predicts the new x offset
          let newBottomXOffset = bottomXOffset + cutsceneScrollSpeed;
          
          // Set the map x offset to the new x offset, as long as the map would not scroll past the cutscene x offset
          if (newBottomXOffset < prevBottomXOffset) {
            bottomXOffset = newBottomXOffset;
          }
          
          // If the new x offset would cause scrolling past the original x offset, then set the new x offset to the original x offset, and end the cutscene by removing it from cutsceneQueue
          else {
            bottomXOffset = prevBottomXOffset;
            cutsceneQueue.shift();  // Removes the first element from cutsceneQueue. Same functionality as dequeuing from a queue
          }
        }
        
        break;
    }

    // ----------------------------------------
  }

  // Convert time in seconds to mm:ss format, with highest value being 99:59
  // second() is already a built in p5.js function, so the identifier second is avoided
  function convertTimeFromSToMmSs(givenSeconds) {
    // Convert the number of seconds in total to integer to prevent decimal places from overflowing outside the screen
    givenSeconds = Math.trunc(givenSeconds);  // Only use digits before the decimal point
    
    // Calculate how many minutes
    // Constrain maximum to 99:59 to prevent timer from overflowing outside the screen
    let minutes = constrain(Math.trunc(givenSeconds / 60), 0, 99);  // Use Math.trunc() for integer division

    // Calculate how many seconds remaining
    let seconds = givenSeconds % 60;  // Remainder

    // Add leading zeroes to minutes slot, if minutes < 10
    let displayMinutes = minutes;
    if (minutes < 10) {
      displayMinutes = `0${minutes}`;
    }

    // Add leading zeroes to seconds slot, if seconds < 10
    let displaySeconds = seconds;
    if (seconds < 10) {
      displaySeconds = `0${seconds}`;
    }

    // Return in format of mm:ss
    return `${displayMinutes}:${displaySeconds}`;
  }

  // Displays the map elements (levers, buttons, keys, doors, ladders, etc), key icons, HP bar, etc
  function displayMap() {
    // Displays the HP bar based on the current HP
    function displayHpBar() {
      // Dimensions of the full HP bar
      let hpBarX = width * 0.2;
      let hpBarY = height * 0.035;
      let hpBarXIncrement = width * 0.6;
      let hpBarYIncrement = height * 0.055;
  
      // Displays background of the HP bar
      // This would be displayed, if currentHp is lower than defaultHp
      fill(`hsl(0, 10%, 80%)`);
      rect(hpBarX, hpBarY, hpBarXIncrement, hpBarYIncrement);
      
      // Displays fraction of full HP
      // If HP is zero or negative (i.e. game over), then display as zero HP
      // If HP is full, then use the full length of the HP bar
      fill(`hsl(0, 55%, 50%)`);
      rect(hpBarX, hpBarY, constrain(hpBarXIncrement * currentHp / defaultHp, 0, hpBarXIncrement), hpBarYIncrement);
  
      // Rectangle outline of the HP bar
      noFill();
      strokeWeight(width / 200);
      stroke(`hsl(60, 70%, 70%)`);
      beginShape();
      vertex(hpBarX, hpBarY);
      vertex(hpBarX + hpBarXIncrement, hpBarY);
      vertex(hpBarX + hpBarXIncrement, hpBarY + hpBarYIncrement);
      vertex(hpBarX, hpBarY + hpBarYIncrement);
      vertex(hpBarX, hpBarY);
      endShape();
  
      // Displays the text "HP"
      textAlign(CENTER, BOTTOM); // The centre coordinate of the textbox is used to locate the text.
      stroke(`hsl(60, 95%, 70%)`);
      strokeWeight(width / 150);
      fill(`hsl(0, 5%, 5%)`);
      textSize(width / 45);
      textFont(pressStartFont);
      text("HP", width * 0.5, hpBarY + 0.25 * hpBarYIncrement);
  
      // Reset stroke
      noStroke();
    }

    // Check whether a map element is inside of the screen boundaries
    // Used to reduce lag in the levels, as the program would be able to skip map elements that are outside of the screen boundaries
    // As the full height of the maps would be displayed at all times, only the x direction needs to be checked
    function insideScreenBoundaries(mapElement) {
      // Map blocks
      if (mapElement instanceof MapBlock) {
        // Check which map the map block is in
        let correspondingCharacter;
        if (height * 0.5 > mapElement.getY()) {
          correspondingCharacter = "top";
        } else {
          correspondingCharacter = "bottom";
        }

        // Skip map blocks in the top map that are outside of the screen boundaries
        if (correspondingCharacter == "top" && (mapElement.getX() + mapElement.getXIncrement() - topXOffset < 0 || mapElement.getX() - topXOffset > width)) {
          return false;
        }
        
        // Skip map blocks in the bottom map that are outside of the screen boundaries
        else if (correspondingCharacter == "bottom" && (mapElement.getX() + mapElement.getXIncrement() - bottomXOffset < 0 || mapElement.getX() - bottomXOffset > width)) {
          return false;
        }
      }

      // Levers
      else if (mapElement instanceof Lever) {
        // Use different x offsets, based on the corresponding character
        let mapXOffset;
        switch (mapElement.getCorrespondingCharacter()) {
          case "top":
            mapXOffset = topXOffset;
            break;
          case "bottom":
            mapXOffset = bottomXOffset;
            break;
        }
        
        // Lever pointing to the left, check whether the handle is at the right from the right edge of the screen
        if (mapElement.getState() == "left" && mapElement.getX() + mapElement.getXIncrement() * 0.5 - mapElement.getHandleDiameter() * 0.5 - mapXOffset > width) {
          return false;
        }

        // Lever pointing to the left, check whether the arm is at the left from the left edge of the screen
        else if (mapElement.getState() == "left" && mapElement.getX() + mapElement.getLeverXOffset() + mapElement.getXIncrement() - mapXOffset < 0) {
          return false;
        }
        
        // Lever pointing to the right, check whether the handle is at the left from the left edge of the screen
        else if (mapElement.getState() == "right" && mapElement.getX() + mapElement.getXIncrement() * 0.5 + mapElement.getHandleDiameter() * 0.5 - mapXOffset < 0) {
          return false;
        }

        // Lever pointing to the right, check whether the arm is at the right from the right edge of the screen
        else if (mapElement.getState() == "right" && mapElement.getX() - mapElement.getLeverXOffset() - mapXOffset > width) {
          return false;
        }
      }

      // Arrows
      else if (mapElement instanceof Arrow) {
        // Use different x offsets, depending on which map the arrow is in
        let mapXOffset;
        switch (mapElement.getCorrespondingCharacter()) {
          case "top":
            mapXOffset = topXOffset;
            break;
          case "bottom":
            mapXOffset = bottomXOffset;
            break;
        }

        // Check whether the arrow is inside or outside the screen boundaries
        switch (mapElement.getDirection()) {
          // Vertical arrows
          case "up": case "down":
            if (mapElement.getX() + mapElement.getWidth() * 0.5 - mapXOffset < 0) {
              return false;
            } else if (mapElement.getX() - mapElement.getWidth() * 0.5 - mapXOffset > width) {
              return false;
            }
            break;

          // Arrows going to the left
          case "left":
            if (mapElement.getX() + mapElement.getLength() - mapXOffset < 0) {
              return false;
            } else if (mapElement.getX() - mapXOffset > width) {
              return false;
            }
            break;

          // Arrows going to the right
          case "right":
            if (mapElement.getX() - mapXOffset < 0) {
              return false;
            } else if (mapElement.getX() - mapElement.getLength() - mapXOffset > width) {
              return false;
            }
            break;
        }
      }
      
      // Other map elements
      else {
        // Skip map elements in the top map that are outside of the screen boundaries
        if (mapElement.getCorrespondingCharacter() == "top" && (mapElement.getX() + mapElement.getXIncrement() - topXOffset < 0 || mapElement.getX() - topXOffset > width)) {
          return false;
        }

        // Skip map elements in the bottom map that are outside of the screen boundaries
        else if (mapElement.getCorrespondingCharacter() == "bottom" && (mapElement.getX() + mapElement.getXIncrement() - bottomXOffset < 0 || mapElement.getX() - bottomXOffset > width)) {
          return false;
        }
      }

      return true;  // Allow map elements that overlap with the screen boundaries to be displayed
    }

    // The colours of the three rectangles on the screen
    // Used to separate the two characters
    let barrierColor;
    
    // Background image
    let backgroundTexture;
    
    // Set the barrier colours and the background images for the three levels
    switch (screen) {
      case "forest":
        barrierColor = `hsl(160, 70%, 20%)`;
        backgroundTexture = forestBackgroundTexture;
        break;
      case "volcano":
        barrierColor = `hsl(0, 5%, 20%)`;
        backgroundTexture = volcanoBackgroundTexture;
        break;
      case "desert":
        barrierColor = `hsl(100, 65%, 30%)`;
        backgroundTexture = desertBackgroundTexture;
        break;
    }

    // Displays the background
    let backgroundTextureWidth = backgroundTexture.width * height / backgroundTexture.height;  // Background width * Linear scale factor of the image
    
    // backgroundX: Stores the x coordinate of where the left edge of the background texture is
    // Scroll background based on the x coordinates of both the top and bottom characters
    // Maximum value: 0
    // Minimum value: -backgroundTextureWidth + width;
    let characterAvgX = (characters[0].getX() + characters[1].getX()) / 2;  // Average x coordinate of the characters
    let backgroundX = (-backgroundTextureWidth + width) * characterAvgX / mapWidth;

    // The opacity of the desert level must be lower than the other two levels, so that the tumbleweeds can be displayed on the map more clearly
    if (screen == "desert") {
      tint(255, 75);
    } else {
      tint(255, 100);  // Greyscale, lowers opacity of the background image (new opacity = 175 / 255)
    }
    
    image(backgroundTexture, backgroundX, 0, backgroundTexture.width * height / backgroundTexture.height, height);
    tint(255, 255);  // Resets the opacity of images
    
    // Drawing the three rectangles
    fill(barrierColor);
    noStroke();
    rect(0, 0, width, height * 0.125);
    rect(0, height * 0.4875, width, height * 0.025);
    rect(0, height * 0.875, width, height * 0.125);
    
    // Displaying the levers
    for (lever of currentLevers) {
      // Only display the levers, if the levers overlap with the screen boundaries
      if (insideScreenBoundaries(lever)) {
        lever.show();
      }
    }

    // Displaying the buttons
    for (button of currentButtons) {
      // Only display the buttons, if the buttons overlap with the screen boundaries
      if (insideScreenBoundaries(button)) {
        button.show();
      }
    }
  
    // Displays the keys
    // Cannot use the identifier key, as key is already defined in p5.js
    for (currentKey of currentKeys) {
      // If the key has not been collected yet, and the key is inside the screen boundaries, display it
      if (currentKey.getSpawned() && insideScreenBoundaries(currentKey)) {
        currentKey.show();
      }
    }
  
    // Displays whether the top character has collected a key or not
    if (topKeyCollected) {
      image(keyTexture, width * 0.05, height * 0.0625 - keyTexture.height * width / 48000, keyTexture.width * width / 24000, keyTexture.height * width / 24000);
    } else {
      image(noKeyTexture, width * 0.05, height * 0.0625 - keyTexture.height * width / 48000, noKeyTexture.width * width / 24000, noKeyTexture.height * width / 24000);
    }
    
    // Displays whether the bottom character has collected a key or not
    if (bottomKeyCollected) {
      image(keyTexture, width * 0.05, height * 0.9375 - keyTexture.height * width / 48000, keyTexture.width * width / 24000, keyTexture.height * width / 24000);
    } else {
      image(noKeyTexture, width * 0.05, height * 0.9375 - keyTexture.height * width / 48000, noKeyTexture.width * width / 24000, noKeyTexture.height * width / 24000);
    }

    // Displays the HP bar
    displayHpBar();

    // Display the coins
    for (let coin of currentCoins) {
      // Only display the coin, if the coins overlap with the screen boundaries and are not collected
      if (coin.getSpawned() && insideScreenBoundaries(coin)) {
        coin.show();
      }
    }

    // Displaying the recovery hearts
    for (let heart of currentRecoveryHearts) {
      // Only display the recovery heart, if the recovery heart overlaps with the screen boundaries and are not collected
      if (heart.getSpawned() && insideScreenBoundaries(heart)) {
        heart.show();
      }
    }

    // Format of the coin counter, score counter and the timer
    fill(`hsl(60, 95%, 70%)`);
    strokeWeight(width / 250);
    stroke(`hsl(0, 5%, 5%)`);
    textSize(width / 35);
    textFont(pressStartFont);
    textAlign(CENTER, CENTER);
    
    // Display the coin counter in the bottom of the screen, if the player is still playing the level
    // When the player reaches the game over or end of level menus, the number of coins collected would be displayed in the middle of the screen instead
    if (currentHp > 0 && !(topCollideExit && bottomCollideExit)) {
      text(`Coins:\n${coinsCollected}/${currentCoins.length}`, width * 0.3, height * 0.9375);
    }

    // Display the score using leading zeroes, if |score| < 10
    let displayScore = score;
    if (displayScore > -10 && displayScore < 0) {
      displayScore = `-0${abs(displayScore)}`;
    } else if (displayScore >= 0 && displayScore < 10) {
      displayScore = `0${score}`;
    }

    // Display the score in the bottom of the screen, if the player is still playing the level
    // When the player reaches the game over or end of level menus, the score would be displayed in the middle of the screen instead
    if (currentHp > 0 && !(topCollideExit && bottomCollideExit)) {
      text(`Score:\n${displayScore}`, width * 0.55, height * 0.9375);
    }

    // Display the time taken in the bottom of the screen, if the player hasn't beaten the level yet
    // When the player reaches the end of level menu, the time taken to beat the level would be displayed in the middle of the screen instead
    if (!(topCollideExit && bottomCollideExit)) {
      text(`Time:\n${convertTimeFromSToMmSs(timeSinceLevelStart)}`, width * 0.8, height * 0.9375);
    }

    // Display the recovery hearts
    for (let recoveryHeart of currentRecoveryHearts) {
      // Only display the recovery hearts, if the recovery hearts overlap with the screen boundaries
      if (recoveryHeart.getSpawned() && insideScreenBoundaries(recoveryHeart)) {
        recoveryHeart.show();
      }
    }
    
    // Displays the obstacles
    // ... : Expands an array (like removing [])
    // []: Group the elements back to an array
    // [...arr, ...arr, ...arr]: Combining the three arrays into one
    for (let obstacle of [...currentArrows, ...currentSpikes, ...currentTumbleweeds]) {
      // Only display the obstacles, if the obstacles overlap with the screen boundaries
      if (insideScreenBoundaries(obstacle)) {
        obstacle.show();
      }
    }

    // Displaying the map blocks
    for (let i = 0; i < mapBlocks.length; i++) {
      // Only display the map blocks, if the map blocks overlap with the screen boundaries
      if (insideScreenBoundaries(mapBlocks[i])) {
        mapBlocks[i].show();
      }
      mapBlocks[i].show();
    }

    // Displays the closed and locked doors
    // ... : Expands an array (like removing [])
    // []: Group the elements back to an array
    // [...arr, ...arr]: Combining the two arrays into one
    for (let door of [...currentDoors, ...currentLockedDoors]) {
      // If the door is closed, and the key is inside the screen boundaries, display it
      if (door.getClosed() && insideScreenBoundaries(door)) {
        door.show();
      }
    }

    // Displays the ladders
    for (let ladder of currentLadders) {
      // If the ladder is spawned, and the key is inside the screen boundaries, display it
      if (ladder.getSpawned() && insideScreenBoundaries(ladder)) {
        ladder.show();
      }
    }

    // Display the exits
    for (let exit of currentExits) {
      // Only display the exits, if the exits overlap with the screen boundaries
      if (insideScreenBoundaries(exit)) {
        exit.show();
      }
    }

    // Displaying the pause icon, if the game is unpaused, the player is playing the level, and the pause icon has not been displayed yet
    if (!gamePaused && !(topCollideExit && bottomCollideExit) && currentHp > 0 && pauseButton == null) {
      // Creating the pause button using the pause icon image
      pauseButton = createButton("");  // Empty string, as the pause button is displayed using an image instead of text
      pauseButton.style("background-image", `url(${pauseIconTexture.canvas.toDataURL()})`);  // Use the pause icon image as the background of the button
      pauseButton.style("background-size", "100% 100%");  // Ensures the pause icon image has the exact same dimension as the pause button
      pauseButton.style("background-color", "transparent");  // Avoids the transparent background of the pause icon image from appearing to be white on the screen
      pauseButton.style("border", "none");  // Removes outline that is not part of the pause icon image
      pauseButton.size(width / 14, height / 10.5);
      pauseButton.position(width * 0.875, height * 0.0175);
    }

    // Opens the pause menu, when the pause button is pressed
    if (pauseButton != null) {
      pauseButton.mousePressed(() => {
        // Remove the pause button in the pause menu
        pauseButton.hide();
        pauseButton = null;
        gamePaused = true;
      });
    }
  }
  
  // Spawning the two characters
  if (!characterInitialised) {
    characters.push(new Character("top"));
    characters.push(new Character("bottom"));
    characterInitialised = true;
  }
  
  // Spawning the map blocks, levers, buttons and other map elements
  if (!mapInitialised) {
    spawnMap();
    mapInitialised = true;
  }

  // Displays the map elements (levers, buttons, keys, doors, ladders, etc), key icons, HP bar, etc
  displayMap();

  // When both of the characters have reached the exits, display a winning message
  if (topCollideExit && bottomCollideExit) {
    // Remove the pause button from the screen
    if (pauseButton != null) {
      pauseButton.hide();
      pauseButton = null;
    }
    
    // Create a translucent rectangle as background
    fill(`hsla(0, 5%, 5%, 0.7)`);
    rect(0, height * 0.125, width, height * 0.75);

    // The game over text
    stroke(`hsl(60, 95%, 70%)`);
    strokeWeight(width / 90);
    fill(`hsl(0, 5%, 5%)`);
    textSize(width * 0.075);
    textAlign(CENTER);
    text("You Win!", width * 0.5, height * 0.2375);
    
    // Displaying the coin and score counters, the timer, and HP remaining
    strokeWeight(width / 150);
    textSize(width * 0.035);
    textAlign(LEFT);
    text(`Coins: ${coinsCollected}/${currentCoins.length}`, width * 0.25, height * 0.375);
    text(`Score: ${score}`, width * 0.25, height * 0.475);
    text(`Time: ${convertTimeFromSToMmSs(timeSinceLevelStart)}`, width * 0.25, height * 0.575);
    text(`HP: ${currentHp}/${defaultHp}`, width * 0.25, height * 0.675);

    // ----------------------------------------
    // Displaying the retry and quit buttons
    // ----------------------------------------

    // Only displays the retry button once
    // Prevents multiple buttons from overlapping with each other
    if (endOfLevelRetryButton == null) {
      endOfLevelRetryButton = createButton("Retry");
      endOfLevelRetryButton.size(width * 0.25, height / 12);
      endOfLevelRetryButton.style("font-size", `${width / 30}px`);
      endOfLevelRetryButton.style("font-family", "'Press Start 2P'");
      endOfLevelRetryButton.style("border", `${width / 180}px solid hsl(50, 95%, 70%)`);
      endOfLevelRetryButton.style("background-color", "hsl(0, 10%, 20%)");
      endOfLevelRetryButton.style("color", "hsl(0, 5%, 95%)");
      endOfLevelRetryButton.style("text-align", "center");
      
      endOfLevelRetryButton.position(width * 0.2, height * 0.75);
    }

    // Restart the current level, when the retry button is clicked
    endOfLevelRetryButton.mousePressed(() => {
      resetLevel();
      mainGame();
    });


    // Only displays the quit button once
    // Prevents multiple buttons from overlapping with each other
    if (endOfLevelQuitButton == null) {
      endOfLevelQuitButton = createButton("Quit");  // Much shorter than "Select another level", so the button can be the same size as the "Retry" button
      endOfLevelQuitButton.size(width * 0.25, height / 12);
      endOfLevelQuitButton.style("font-size", `${width / 30}px`);
      endOfLevelQuitButton.style("font-family", "'Press Start 2P'");
      endOfLevelQuitButton.style("border", `${width / 180}px solid hsl(50, 95%, 70%)`);
      endOfLevelQuitButton.style("background-color", "hsl(0, 10%, 20%)");
      endOfLevelQuitButton.style("color", "hsl(0, 5%, 95%)");
      endOfLevelQuitButton.style("text-align", "center");
      
      endOfLevelQuitButton.position(width * 0.55, height * 0.75);
    }

    // Switch the screen to level select, when the player quits the current level
    endOfLevelQuitButton.mousePressed(() => {
      resetLevel();
      screen = "levelSelect";
    });

    // ----------------------------------------
  }

  // Activate the pause menu, if the pause button is pressed
  // When the pause button is pressed, the variable gamePaused would be set to true (this can be found in displayMap() in part of mainGame())
  else if (gamePaused) {
    // Create a translucent rectangle as background
    fill(`hsla(0, 5%, 5%, 0.7)`);
    rect(0, height * 0.125, width, height * 0.75);

    // The pause menu text
    stroke(`hsl(60, 95%, 70%)`);
    strokeWeight(width / 90);
    fill(`hsl(0, 5%, 5%)`);
    textSize(width * 0.075);
    textAlign(CENTER);
    text("Pause Menu", width * 0.5, height * 0.25);

    // Only displays the resume button once
    // Prevents multiple buttons from overlapping with each other
    if (pauseMenuResumeButton == null) {
      pauseMenuResumeButton = createButton("Resume");
      pauseMenuResumeButton.size(width * 0.375, height / 9);
      pauseMenuResumeButton.style("font-size", `${width / 22.5}px`);
      pauseMenuResumeButton.style("font-family", "'Press Start 2P'");
      pauseMenuResumeButton.style("border", `${width / 180}px solid hsl(50, 95%, 70%)`);
      pauseMenuResumeButton.style("background-color", "hsl(0, 10%, 20%)");
      pauseMenuResumeButton.style("color", "hsl(0, 5%, 95%)");
      pauseMenuResumeButton.style("text-align", "center");
      pauseMenuResumeButton.style("justify-content", "center");
      
      pauseMenuResumeButton.position(width * 0.5 - pauseMenuResumeButton.width / 2, height * 0.375);
    }

    // Close the pause menu, resume the current level and respawn the pause button, when the resume button is clicked
    pauseMenuResumeButton.mousePressed(() => {
      // ----------------------------------------
      // Removes the buttons from the pause menu
      // ----------------------------------------

      // Remove the resume button
      pauseMenuResumeButton.hide();
      pauseMenuResumeButton = null;

      // Remove the retry button
      pauseMenuRetryButton.hide();
      pauseMenuRetryButton = null;

      // Remove the quit button
      pauseMenuQuitButton.hide();
      pauseMenuQuitButton = null;

      // ----------------------------------------

      // Allow the pause button to be respawn, as gamePaused is false and pauseButton is null
      gamePaused = false;
    });

    // Only displays the retry button once
    // Prevents multiple buttons from overlapping with each other
    if (pauseMenuRetryButton == null) {
      pauseMenuRetryButton = createButton("Retry");
      pauseMenuRetryButton.size(width * 0.375, height / 9);
      pauseMenuRetryButton.style("font-size", `${width / 22.5}px`);
      pauseMenuRetryButton.style("font-family", "'Press Start 2P'");
      pauseMenuRetryButton.style("border", `${width / 180}px solid hsl(50, 95%, 70%)`);
      pauseMenuRetryButton.style("background-color", "hsl(0, 10%, 20%)");
      pauseMenuRetryButton.style("color", "hsl(0, 5%, 95%)");
      pauseMenuRetryButton.style("text-align", "center");
      
      pauseMenuRetryButton.position(width * 0.5 - pauseMenuRetryButton.width / 2, height * 0.5375);
    }

    // Restart the current level, when the retry button is clicked
    pauseMenuRetryButton.mousePressed(() => {
      resetLevel();
      mainGame();
    });


    // Only displays the quit button once
    // Prevents multiple buttons from overlapping with each other
    if (pauseMenuQuitButton == null) {
      pauseMenuQuitButton = createButton("Quit");  // Much shorter than "Select another level", so the button can be the same size as the "Retry" button
      pauseMenuQuitButton.size(width * 0.375, height / 9);
      pauseMenuQuitButton.style("font-size", `${width / 22.5}px`);
      pauseMenuQuitButton.style("font-family", "'Press Start 2P'");
      pauseMenuQuitButton.style("border", `${width / 180}px solid hsl(50, 95%, 70%)`);
      pauseMenuQuitButton.style("background-color", "hsl(0, 10%, 20%)");
      pauseMenuQuitButton.style("color", "hsl(0, 5%, 95%)");
      pauseMenuQuitButton.style("text-align", "center");
      
      pauseMenuQuitButton.position(width * 0.5 - pauseMenuQuitButton.width / 2, height * 0.7);
    }

    // Switch the screen to level select, when the player quits the current level
    pauseMenuQuitButton.mousePressed(() => {
      resetLevel();
      screen = "levelSelect";
    });
  }
  
  // Updates map and allow character movement, if HP is greater than zero, the player hasn't beaten the level, and the pause menu is not activated
  else if (currentHp > 0) {
    // Keyboard input
    let left = keyIsDown(LEFT_ARROW) || keyIsDown(65) || keyIsDown(97);  // 65 = A, 97 = a
    let right = keyIsDown(RIGHT_ARROW) || keyIsDown(68) || keyIsDown(100); // 68 = D, 100 = d
    let up = keyIsDown(UP_ARROW) || keyIsDown(32) || keyIsDown(87) || keyIsDown(119);  // 32 = space bar, 87 = W, 119 = w
    let down = keyIsDown(DOWN_ARROW) || keyIsDown(83) || keyIsDown(115);  // 83 = S, 115 = s
    
    // Loops through each character
    for (let character of characters) {
      let prevX = character.getX();  // Record the x coordinate of the character before
  
      // Only move the characters, if there are no cutscenes playing
      if (cutsceneQueue.length == 0) {
        // Moving left or right
        if (left && !right) {
          character.setXVelocity(-width / 100);
        } else if (!left && right) {
          character.setXVelocity(width / 100);
        }
  
        // Jumping on the ground
        if (up && character.getOnGround()) {
          character.setYVelocity(-height * 0.0275);
          character.setOnGround(false);
        }
  
        // Moving up a ladder
        else if (up && !character.getOnGround() && character.getCollideLadder()) {
          character.setYVelocity(-height * 0.0025);
        }
  
        // Moving down a ladder
        else if (down && !character.getOnGround() && character.getCollideLadder()) {
          character.setYVelocity(height * 0.0025);
        }
  
        // On a ladder, not moving up, not moving down
        else if (character.getCollideLadder()) {
          character.setYVelocity(0);
        }
      }
  
      // If there are cutscenes playing, then stop the characters
      else {
        character.setXVelocity(0);
        character.setYVelocity(0);
      }
      
      character.updateX();
      character.updateY();
      
      character.show();
      
      // Side scroll
      // Use different x offsets based on the corresponding character
      // 
      // Character moving to the left or to the right:
      // Check for all of these:
      // - Whether the character is 10% from the left/right edge of the screen
      // - Whether the character is moving to the left/right
      // - Whether the character has reached the left/right edge of the map
      switch (character.getCorrespondingCharacter()) {
        case "top":
          if (
            // Character moving to the left
            ((character.getX() - topXOffset < 0.1 * width) &&
             (character.getXVelocity() < 0)) ||
            // Character moving to the right
            ((character.getX() + character.getXIncrement() - topXOffset > 0.9 * width) &&
             (character.getXVelocity() > 0))
          ) {
            // If the character is moving to the left, topXOffset would decrease, as the x velocity of the character would be negative
            // If the character is moving to the right, topXOffset would increase, as the x velocity of the character would be positive
            let newTopXOffset = topXOffset + character.getX() - prevX;
            topXOffset = constrain(newTopXOffset, 0, mapWidth - width);    // Prevents scrolling too much and displaying empty sections outside the map
          }
          break;
        case "bottom":
          if (
            // Character moving to the left
            ((character.getX() - bottomXOffset < 0.1 * width) &&
             (character.getXVelocity() < 0)) ||
            // Character moving to the right
            ((character.getX() + character.getXIncrement() - bottomXOffset > 0.9 * width) &&
             (character.getXVelocity() > 0))
          ) {
            // If the character is moving to the left, topXOffset would decrease, as the x velocity of the character would be negative
            // If the character is moving to the right, topXOffset would increase, as the x velocity of the character would be positive
            let newBottomXOffset = bottomXOffset + character.getX() - prevX;
            bottomXOffset = constrain(newBottomXOffset, 0, mapWidth - width);  // Prevents scrolling too much and displaying empty sections outside the map
          }
          break;
      }
    }
    
    // Loops through the cutscenes
    // Cannot use a for loop, as the length of cutsceneQueue would change, as cutscenes would be dequeued
    if (cutsceneQueue.length > 0) {
      displayCutscene();
    }
  
    // Loops through each arrow
    else if (screen == "forest") {
      for (let arrow of currentArrows) {
        arrow.update();
      }
    }

    // Loops through each spike
    else if (screen == "volcano") {
      for (let spike of currentSpikes) {
        spike.update();
      }
    }

    // Loops through each tumbleweed
    else if (screen == "desert") {
      for (let tumbleweed of currentTumbleweeds) {
        tumbleweed.update();
      }
    }

    // Allows damage to be taken again, when timeSinceTakingDamage has reached at least minTimeBetweenDamage
    if (cutsceneQueue.length == 0) {
      timeSinceTakingDamage++;
    }

    // Loops through the exits to check whether the player has beaten a level
    for (let exit of currentExits) {
      // Check collision between different characters, depending on which map the exit is in
      switch (exit.getCorrespondingCharacter()) {
        // Check collision with the top character
        case "top":
          if (exit.collide(characters[0])) {
            topCollideExit = true;
          } else {
            topCollideExit = false;
          }
          break;
  
        // Check collision with the bottom character
        case "bottom":
          if (exit.collide(characters[1])) {
            bottomCollideExit = true;
          } else {
            bottomCollideExit = false;
          }
          break;
      }
    }
    
    // Increase the timer, if there is no cutscenes playing
    if (cutsceneQueue.length == 0) {
      timeSinceLevelStart = constrain(timeSinceLevelStart + 1 / frameRate(), 0, 99 * 60 + 59);  // Prevents time displayed from being greater than 99:59
    }
  }
    
  // When HP reaches zero, display game over
  else {
    // Remove the pause button from the screen
    if (pauseButton != null) {
      pauseButton.hide();
      pauseButton = null;
    }
    
    // Create a translucent rectangle as background
    fill(`hsla(0, 5%, 5%, 0.7)`);
    rect(0, height * 0.125, width, height * 0.75);

    // The game over text
    stroke(`hsl(60, 95%, 70%)`);
    strokeWeight(width / 90);
    fill(`hsl(0, 5%, 5%)`);
    textSize(width * 0.075);
    textAlign(CENTER);
    text("Game Over!", width * 0.5, height * 0.25);

    // Displaying the coin and score counters
    strokeWeight(width / 150);
    textSize(width * 0.045);
    textAlign(LEFT);
    text(`Coins: ${coinsCollected}/${currentCoins.length}`, width * 0.25, height * 0.4625);
    text(`Score: ${score}`, width * 0.25, height * 0.6);

    // ----------------------------------------
    // Displaying the retry and quit buttons
    // ----------------------------------------

    // Only displays the retry button once
    // Prevents multiple buttons from overlapping with each other
    if (gameOverRetryButton == null) {
      gameOverRetryButton = createButton("Retry");
      gameOverRetryButton.size(width * 0.25, height / 12);
      gameOverRetryButton.style("font-size", `${width / 30}px`);
      gameOverRetryButton.style("font-family", "'Press Start 2P'");
      gameOverRetryButton.style("border", `${width / 180}px solid hsl(50, 95%, 70%)`);
      gameOverRetryButton.style("background-color", "hsl(0, 10%, 20%)");
      gameOverRetryButton.style("color", "hsl(0, 5%, 95%)");
      gameOverRetryButton.style("text-align", "center");
      
      gameOverRetryButton.position(width * 0.2, height * 0.75);
    }

    // Restart the current level, when the retry button is clicked
    gameOverRetryButton.mousePressed(() => {
      resetLevel();
      mainGame();
    });


    // Only displays the quit button once
    // Prevents multiple buttons from overlapping with each other
    if (gameOverQuitButton == null) {
      gameOverQuitButton = createButton("Quit");  // Much shorter than "Select another level", so the button can be the same size as the "Retry" button
      gameOverQuitButton.size(width * 0.25, height / 12);
      gameOverQuitButton.style("font-size", `${width / 30}px`);
      gameOverQuitButton.style("font-family", "'Press Start 2P'");
      gameOverQuitButton.style("border", `${width / 180}px solid hsl(50, 95%, 70%)`);
      gameOverQuitButton.style("background-color", "hsl(0, 10%, 20%)");
      gameOverQuitButton.style("color", "hsl(0, 5%, 95%)");
      gameOverQuitButton.style("text-align", "center");
      
      gameOverQuitButton.position(width * 0.55, height * 0.75);
    }

    // Switch the screen to level select, when the player quits the current level
    gameOverQuitButton.mousePressed(() => {
      resetLevel();
      screen = "levelSelect";
    });

    // ----------------------------------------
  }
}

// ----------------------------------------


// ----------------------------------------
// preload(), setup() and draw()
// ----------------------------------------

// Loads the font and images
// Format of loadImage: loadImage(path, [successCallback], [failureCallback]);
// successCallback: What to do, when an image loads successfully
// failureCallback: What to do, when an image fails to load
// successCallback and failureCallback are optional
// loadFont has a similar structure
function preload() {
  // Background
  forestBackgroundTexture = loadImage(
    "/assets/background/forestBackground.png",
    () => console.log("Loaded forest background"),
    (error) => console.log("Failed to load forest background")
  );
  volcanoBackgroundTexture = loadImage(
    "/assets/background/volcanoBackground.png",
    () => console.log("Loaded volcano background"),
    (error) => console.log("Failed to load volcano background")
  );
  desertBackgroundTexture = loadImage(
    "/assets/background/desertBackground.png",
    () => console.log("Loaded desert background"),
    (error) => console.log("Failed to load desert background")
  );

  // Environmental effects
  fogTexture = loadImage(
    "/assets/environmentalEffect/fogTexture.png",
    () => console.log("Loaded fog effect"),
    (error) => console.log("Failed to load fog effect")
  );
  fireParticleTexture = loadImage(
    "/assets/environmentalEffect/fireParticleTexture.png",
    () => console.log("Loaded fire particle effect"),
    (error) => console.log("Failed to load fire particle effect")
  );
  sandstormTexture = loadImage(
    "/assets/environmentalEffect/sandstormTexture.png",
    () => console.log("Loaded sandstorm effect"),
    (error) => console.log("Failed to load sandstorm effect")
  );

  // Font
  pressStartFont = loadFont(
    "/assets/font/PressStart2P-Regular.ttf",
    () => console.log("Loaded font"),
    (error) => console.log("Failed to load font")
  );

  // Key
  keyTexture = loadImage(
    "/assets/key/key.png",
    () => console.log("Loaded key"),
    (error) => console.log("Failed to load key")
  );  // Key icon without a red line through it
  noKeyTexture = loadImage(
    "/assets/key/noKey.png",
    () => console.log("Loaded no key"),
    (error) => console.log("Failed to load no key")
  );  // Key icon with a red line through it

  // Padlock for locked and unlocked doors
  lockedPadlockTexture = loadImage(
    "/assets/padlock/lockedPadlock.png",
    () => console.log("Loaded locked padlock"),
    (error) => console.log("Failed to load locked padlock")
  );
  unlockedPadlockTexture = loadImage(
    "/assets/padlock/unlockedPadlock.png",
    () => console.log("Loaded unlocked padlock"),
    (error) => console.log("Failed to load unlocked padlock")
  );

  // Ladder
  ladderTexture = loadImage(
    "/assets/ladder.png",
    () => console.log("Loaded ladder"),
    (error) => console.log("Failed to load ladder")
  );

  // Obstacles
  arrowTexture = loadImage(
    "/assets/obstacles/arrow.png",
    () => console.log("Loaded arrow"),
    (error) => console.log("Failed to load arrow")
  );
  spikeOnTexture = loadImage(
    "/assets/obstacles/spikeOn.png",
    () => console.log("Loaded spike on"),
    (error) => console.log("Failed to load spike on")
  );
  spikeOffTexture = loadImage(
    "/assets/obstacles/spikeOff.png",
    () => console.log("Loaded spike off"),
    (error) => console.log("Failed to load spike off")
  );
  tumbleweedTexture = loadImage(
    "/assets/obstacles/tumbleweed.png",
    () => console.log("Loaded tumbleweed"),
    (error) => console.log("Failed to load tumbleweed")
  );
  
  // Exits
  forestExitTexture = loadImage(
    "/assets/exits/forestExit.png",
    () => console.log("Loaded forest exit"),
    (error) => console.log("Failed to load forest exit")
  );
  volcanoExitTexture = loadImage(
    "/assets/exits/volcanoExit.png",
    () => console.log("Loaded volcano exit"),
    (error) => console.log("Failed to load volcano exit")
  );
  desertExitTexture = loadImage(
    "/assets/exits/desertExit.png",
    () => console.log("Loaded desert exit"),
    (error) => console.log("Failed to load desert exit")
  );

  // Coins
  coinTexture = loadImage(
    "/assets/coin.png",
    () => console.log("Loaded coin"),
    (error) => console.log("Failed to load coin")
  );
  
  // Recovery hearts
  heartTexture = loadImage(
    "/assets/heart.png",
    () => console.log("Loaded recovery heart"),
    (error) => console.log("Failed to load recovery heart")
  );

  // Pause icon
  pauseIconTexture = loadImage(
    "/assets/pauseIcon.png",
    () => console.log("Loaded pause icon"),
    (error) => console.log("Failed to load pause icon")
  );

  // Background music
  titleTheme = loadSound(
    "./assets/music/titleTheme.mp3",
    () => {
      console.log("Loaded title theme");
    },
    (error) => {
      console.log("Fail to load title theme");
    }
  );
  forestTheme = loadSound(
    "./assets/music/forestTheme.mp3",
    () => {
      console.log("Loaded forest theme");
    },
    (error) => {
      console.log("Fail to load forest theme");
    }
  );
  volcanoTheme = loadSound(
    "./assets/music/volcanoTheme.mp3",
    () => {
      console.log("Loaded volcano theme");
    },
    (error) => {
      console.log("Fail to load volcano theme");
    }
  );
  desertTheme = loadSound(
    "./assets/music/desertTheme.mp3",
    () => {
      console.log("Loaded desert theme");
    },
    (error) => {
      console.log("Fail to load desert theme");
    }
  );
}

// setup(): Creates the screen, and initialise variables such as mapLayout, defaultLevers and defaultButtons
function setup() {
  let screenWidth = 600;
  let screenHeight = screenWidth * 0.75;
  createCanvas(screenWidth, screenHeight);
  screen = "title";
  
  // ----------------------------------------
  // Map width and map layout
  // ----------------------------------------
  
  mapWidth = width * 2;  // Range of x coordinates of the maps, and the x coordinate of the right edge of the maps
  
  // Layout of the map
  // Each element in mapLayout: level, [x, y, xIncrement, yIncrement, correspondingCharacter]
  mapLayout = [
    [
      "forest",

      // Top map
      [mapWidth * 0.05, height * 0.375, mapWidth * 0.075, height * 0.05, "top"],
      [mapWidth * 0.125, height * 0.3, mapWidth * 0.1, height * 0.05, "top"],
      [mapWidth * 0.25, height * 0.225, mapWidth * 0.075, height * 0.05, "top"],
      [mapWidth * 0.3, height * 0.125, mapWidth * 0.025, height * 0.287, "top"],
      [mapWidth * 0.35, height * 0.3, mapWidth * 0.075, height * 0.05, "top"],
      [mapWidth * 0.45, height * 0.375, mapWidth * 0.075, height * 0.05, "top"],
      [mapWidth * 0.65, height * 0.3, mapWidth * 0.075, height * 0.05, "top"],
      [mapWidth * 0.85, height * 0.375, mapWidth * 0.0625, height * 0.05, "top"],
      [mapWidth * 0.95, height * 0.3, mapWidth * 0.05, height * 0.05, "top"],

      // Bottom map
      [mapWidth * 0.05, height * 0.75, mapWidth * 0.175, height * 0.05, "bottom"],
      [mapWidth * 0.0625, height * 0.6, mapWidth * 0.075, height * 0.05, "bottom"],
      [mapWidth * 0.175, height * 0.7, mapWidth * 0.125, height * 0.05, "bottom"],
      [mapWidth * 0.275, height * 0.5125, mapWidth * 0.025, height * 0.1875, "bottom"],
      [mapWidth * 0.35, height * 0.65, mapWidth * 0.1, height * 0.05, "bottom"],
      [mapWidth * 0.425, height * 0.6, mapWidth * 0.2, height * 0.05, "bottom"],
      [mapWidth * 0.525, height * 0.75, mapWidth * 0.15, height * 0.05, "bottom"],
      [mapWidth * 0.65, height * 0.7, mapWidth * 0.025, height * 0.05, "bottom"],
      [mapWidth * 0.85, height * 0.675, mapWidth * 0.0625, height * 0.05, "bottom"],
      [mapWidth * 0.95, height * 0.75, mapWidth * 0.05, height * 0.05, "bottom"],
    ],
    
    [
      "volcano",

      // Top map
      [mapWidth * 0.05, height * 0.3, mapWidth * 0.025, height * 0.075, "top"],
      [mapWidth * 0.05, height * 0.375, mapWidth * 0.125, height * 0.05, "top"],
      [mapWidth * 0.125, height * 0.225, mapWidth * 0.1, height * 0.05, "top"],
      [mapWidth * 0.15, height * 0.35, mapWidth * 0.025, height * 0.025, "top"],
      [mapWidth * 0.2, height * 0.125, mapWidth * 0.025, height * 0.1, "top"],
      [mapWidth * 0.2, height * 0.375, mapWidth * 0.05, height * 0.05, "top"],
      [mapWidth * 0.325, height * 0.275, mapWidth * 0.025, height * 0.075, "top"],
      [mapWidth * 0.325, height * 0.35, mapWidth * 0.1, height * 0.05, "top"],
      [mapWidth * 0.375, height * 0.2, mapWidth * 0.075, height * 0.05, "top"],
      [mapWidth * 0.475, height * 0.25, mapWidth * 0.0875, height * 0.05, "top"],
      [mapWidth * 0.65, height * 0.3, mapWidth * 0.025, height * 0.075, "top"],
      [mapWidth * 0.65, height * 0.375, mapWidth * 0.125, height * 0.05, "top"],
      [mapWidth * 0.725, height * 0.225, mapWidth * 0.1, height * 0.05, "top"],
      [mapWidth * 0.75, height * 0.35, mapWidth * 0.025, height * 0.025, "top"],
      [mapWidth * 0.8, height * 0.125, mapWidth * 0.025, height * 0.1, "top"],
      [mapWidth * 0.8, height * 0.35, mapWidth * 0.0625, height * 0.05, "top"],
      [mapWidth * 0.925, height * 0.375, mapWidth * 0.075, height * 0.05, "top"],
      

      // Bottom map
      [0, height * 0.65, mapWidth * 0.0375, height * 0.05, "bottom"],
      [0, height * 0.75, mapWidth * 0.175, height * 0.05, "bottom"],
      [mapWidth * 0.0625, height * 0.6, mapWidth * 0.075, height * 0.05, "bottom"],
      [mapWidth * 0.1125, height * 0.5125, mapWidth * 0.025, height * 0.0875, "bottom"],
      [mapWidth * 0.175, height * 0.6, mapWidth * 0.075, height * 0.05, "bottom"],
      [mapWidth * 0.275, height * 0.6125, mapWidth * 0.075, height * 0.05, "bottom"],
      [mapWidth * 0.375, height * 0.625, mapWidth * 0.075, height * 0.05, "bottom"],
      [mapWidth * 0.475, height * 0.675, mapWidth * 0.025, height * 0.125, "bottom"],
      [mapWidth * 0.475, height * 0.75, mapWidth * 0.0875, height * 0.0495, "bottom"],
      [mapWidth * 0.5375, height * 0.7995, mapWidth * 0.025, height * 0.0775, "bottom"],
      [mapWidth * 0.675, height * 0.6875, mapWidth * 0.025, height * 0.075, "bottom"],
      [mapWidth * 0.675, height * 0.7625, mapWidth * 0.125, height * 0.05, "bottom"],
      [mapWidth * 0.75, height * 0.6125, mapWidth * 0.1, height * 0.05, "bottom"],
      [mapWidth * 0.775, height * 0.7375, mapWidth * 0.1, height * 0.05, "bottom"],
      [mapWidth * 0.925, height * 0.75, mapWidth * 0.075, height * 0.05, "bottom"],
      [mapWidth * 0.95, height * 0.625, mapWidth * 0.05, height * 0.05, "bottom"]
    ],
    
    [
      "desert",

      // Top map
      [mapWidth * 0.05, height * 0.375, mapWidth * 0.075, height * 0.05, "top"],
      [mapWidth * 0.1, height * 0.3, mapWidth * 0.025, height * 0.075, "top"],
      [mapWidth * 0.175, height * 0.35, mapWidth * 0.075, height * 0.05, "top"],
      [mapWidth * 0.2625, height * 0.2, mapWidth * 0.0875, height * 0.05, "top"],
      [mapWidth * 0.325, height * 0.125, mapWidth * 0.025, height * 0.287, "top"],
      [mapWidth * 0.4, height * 0.3, mapWidth * 0.075, height * 0.05, "top"],
      [mapWidth * 0.45, height * 0.225, mapWidth * 0.025, height * 0.075, "top"],
      [mapWidth * 0.5, height * 0.225, mapWidth * 0.075, height * 0.05, "top"],
      [mapWidth * 0.65, height * 0.275, mapWidth * 0.025, height * 0.05, "top"],
      [mapWidth * 0.65, height * 0.325, mapWidth * 0.1, height * 0.05, "top"],
      [mapWidth * 0.7, height * 0.2, mapWidth * 0.1875, height * 0.05, "top"],
      [mapWidth * 0.775, height * 0.325, mapWidth * 0.025, height * 0.05, "top"],
      [mapWidth * 0.775, height * 0.375, mapWidth * 0.125, height * 0.05, "top"],
      [mapWidth * 0.925, height * 0.25, mapWidth * 0.075, height * 0.05, "top"],

      // Bottom map
      [mapWidth * 0.05, height * 0.675, mapWidth * 0.025, height * 0.075, "bottom"],
      [mapWidth * 0.05, height * 0.75, mapWidth * 0.1, height * 0.05, "bottom"],
      [mapWidth * 0.1, height * 0.6, mapWidth * 0.175, height * 0.05, "bottom"],
      [mapWidth * 0.2125, height * 0.75, mapWidth * 0.0625, height * 0.05, "bottom"],
      [mapWidth * 0.3, height * 0.5995, mapWidth * 0.075, height * 0.05, "bottom"],
      [mapWidth * 0.3, height * 0.725, mapWidth * 0.15, height * 0.05, "bottom"],
      [mapWidth * 0.35, height * 0.5995, mapWidth * 0.025, height * 0.1255, "bottom"],
      [mapWidth * 0.4, height * 0.575, mapWidth * 0.125, height * 0.05, "bottom"],
      [mapWidth * 0.475, height * 0.725, mapWidth * 0.0875, height * 0.05, "bottom"],
      [mapWidth * 0.5375, height * 0.675, mapWidth * 0.025, height * 0.05, "bottom"],
      [mapWidth * 0.65, height * 0.75, mapWidth * 0.1, height * 0.05, "bottom"],
      [mapWidth * 0.725, height * 0.675, mapWidth * 0.025, height * 0.075, "bottom"],
      [mapWidth * 0.7875, height * 0.675, mapWidth * 0.1, height * 0.05, "bottom"],
      [mapWidth * 0.8625, height * 0.6, mapWidth * 0.025, height * 0.075, "bottom"],
      [mapWidth * 0.9, height * 0.6, mapWidth * 0.1, height * 0.05, "bottom"]
      
    ]
  ];

  // ----------------------------------------


  // ----------------------------------------
  // Exits
  // ----------------------------------------
  
  // Fix aspect ratio of the exits to prevent the image of the exits being distorted
  let forestExitXIncrement = forestExitTexture.width * width / 40000;
  let forestExitYIncrement = forestExitTexture.height * height / 30000;
  let volcanoExitXIncrement = volcanoExitTexture.width * width / 40000;
  let volcanoExitYIncrement = volcanoExitTexture.height * height / 30000;
  let desertExitXIncrement = desertExitTexture.width * width / 40000;
  let desertExitYIncrement = desertExitTexture.height * height / 30000;
  
  // Each element in defaultExits: level, [x, y, xIncrement, yIncrement, correspondingCharacter]
  defaultExits = [
    [
      "forest",
      [mapWidth * 0.875, height * 0.375 - forestExitYIncrement, forestExitXIncrement, forestExitYIncrement, "top"],
      [mapWidth * 0.875, height * 0.675 - forestExitYIncrement, forestExitXIncrement, forestExitYIncrement, "bottom"]
    ],
    
    [
      "volcano",
      [mapWidth * 0.775, height * 0.225 - volcanoExitYIncrement, volcanoExitXIncrement, volcanoExitYIncrement, "top"],
      [mapWidth * 0.975, height * 0.625 - volcanoExitYIncrement, volcanoExitXIncrement, volcanoExitYIncrement, "bottom"]
    ],
    
    [
      "desert",
      [mapWidth * 0.975, height * 0.25 - desertExitYIncrement, desertExitXIncrement, desertExitYIncrement, "top"],
      [mapWidth * 0.975, height * 0.6 - desertExitYIncrement, desertExitXIncrement, desertExitYIncrement, "bottom"]
    ]
  ];

  currentExits = [];

  // ----------------------------------------


  // ----------------------------------------
  // Keys
  // ----------------------------------------

  // Fix aspect ratio of the key to prevent the image of the key being distorted
  let keyXIncrement = keyTexture.width * width / 40000;
  let keyYIncrement = keyTexture.height * width / 40000;
  
  // defaultKeys: Stores information about every key in every level
  // Each element: level, [x, y, spawned, correspondingCharacter]
  defaultKeys = [
    [
      "forest",
      [mapWidth * 0.07375, height * 0.375 - keyYIncrement, false, "top"]
    ],
    
    [
      "volcano",
      [mapWidth * 0.0875, height * 0.6 - keyYIncrement, true, "bottom"]
    ],
    
    [
      "desert",
      [mapWidth * 0.1, height * 0.75 - keyYIncrement, false, "bottom"]
    ]
  ];

  // currentKeys: Stores key objects that have been spawned
  currentKeys = [];
  
  // ----------------------------------------


  // ----------------------------------------
  // Doors and locked doors
  // ----------------------------------------
  
  // Dimensions of the doors
  // The positions of the doors would all be different, so the x and y coordinates are not defined yet
  let doorXIncrement = mapWidth * 0.01;
  let doorClosedYIncrement = height * 0.0755;
  
  // Each element in defaultDoors: level, [x, closedY, xIncrement, closedYIncrement, closed, correspondingCharacter]
  defaultDoors = [
    [
      "forest",
      [mapWidth * 0.25, height * 0.1495, doorXIncrement, doorClosedYIncrement, true, "top"],
      [mapWidth * 0.725, height * 0.125, mapWidth * 0.03, height * 0.3625, true, "top"],
      [mapWidth * 0.725, height * 0.5125, mapWidth * 0.03, height * 0.3625, true, "bottom"]
    ],
    
    [
      "volcano",
      [mapWidth * 0.5625, height * 0.125, mapWidth * 0.03, height * 0.3625, true, "top"],
      [mapWidth * 0.1375, height * 0.6745, doorXIncrement, doorClosedYIncrement, true, "bottom"],
      [mapWidth * 0.44, height * 0.5495, doorXIncrement, doorClosedYIncrement, true, "bottom"],
      [mapWidth * 0.5625, height * 0.5125, mapWidth * 0.03, height * 0.3625, true, "bottom"]
    ],
    
    [
      "desert",
      [mapWidth * 0.22, height * 0.2745, doorXIncrement, doorClosedYIncrement, false, "top"],
      [mapWidth * 0.34, height * 0.412, doorXIncrement, doorClosedYIncrement, false, "top"],
      [mapWidth * 0.5625, height * 0.125, mapWidth * 0.03, height * 0.3625, true, "top"],
      [mapWidth * 0.125, height * 0.5245, doorXIncrement, doorClosedYIncrement, false, "bottom"],
      [mapWidth * 0.2, height * 0.5245, doorXIncrement, doorClosedYIncrement, false, "bottom"],
      [mapWidth * 0.4, height * 0.5125, doorXIncrement, height * 0.0625, true, "bottom"],
      [mapWidth * 0.5625, height * 0.5125, mapWidth * 0.03, height * 0.3625, true, "bottom"]
    ]
  ];

  currentDoors = [];

  // Each element in defaultLockedDoors: level, [x, closedY, xIncrement, closedYIncrement, correspondingCharacter]
  // As every locked door must be closed initially, closed is not needed in defaultLockedDoors
  defaultLockedDoors = [
    [
      "forest",
      [mapWidth * 0.3075, height * 0.412, doorXIncrement, doorClosedYIncrement, "top"]
    ],
    
    [
      "volcano",
      [mapWidth * 0.475, height * 0.7995, doorXIncrement, doorClosedYIncrement, "bottom"]
    ],
    
    [
      "desert",
      [mapWidth * 0.3, height * 0.6495, doorXIncrement, doorClosedYIncrement, "bottom"]
    ]
  ];

  currentLockedDoors = [];

  // ----------------------------------------

  
  // ----------------------------------------
  // Ladders
  // ----------------------------------------

  // Each element in defaultLadders: level, [x, y, xIncrement, yIncrement, spawned, correspondingCharacter]
  defaultLadders = [
    [
      "forest",
      [mapWidth * 0.675, height * 0.3, mapWidth * 0.0125, height * 0.1875, false, "top"]
    ],
    
    [
      "volcano",
      [mapWidth * 0.375, height * 0.35, mapWidth * 0.011, height * 0.1375, false, "top"]
    ],
    
    [
      "desert",
      [mapWidth * 0.425, height * 0.3, mapWidth * 0.0125, height * 0.1875, false, "top"],
      [mapWidth * 0.235, height * 0.6, mapWidth * 0.014, height * 0.15, false, "bottom"]
    ]
  ];
  
  currentLadders = [];
  // ----------------------------------------

  
  // ----------------------------------------
  // Arrows
  // ----------------------------------------

  // As arrows can only spawn in the forest level, level is not required in defaultArrows
  // Each element in defaultArrows: x, y, damage, correspondingCharacter, length, direction, speed
  defaultArrows = [
    [mapWidth * 0.175, height * 0.125, 2, "top", mapWidth * 0.02, "down", mapWidth * 0.00075],
    [mapWidth * 0.3375, height * 0.285, 2, "top", mapWidth * 0.02, "right", mapWidth * 0.002],
    [mapWidth * 0.8, height * 0.125, 2, "top", mapWidth * 0.03, "down", mapWidth * 0.0015],
    
    [mapWidth * 0.45, height * 0.675, 2, "bottom", mapWidth * 0.0175, "right", mapWidth * 0.001],
    [mapWidth * 0.8, height * 0.875, 2, "bottom", mapWidth * 0.03, "up", mapWidth * 0.0015]
  ];

  currentArrows = [];
  
  // ----------------------------------------


  // ----------------------------------------
  // Spikes
  // ----------------------------------------

  // As spikes can only spawn in the volcano level, level is not required in defaultSpikes
  // activated: Whether the spike is on or off
  // spawnTime: How long the spike is on, before the spike is deactivated
  // spawnTimeUsed: How long the spike has been activated
  // coolDownTime: How long the spike is off, before the spike is activated
  // coolDownTimeRemaining: How long the program has to wait, before activating the spike for the first time. Therefore, coolDownTimeUsed is set as this.coolDownTime - this.coolDownTimeRemaining
  // Each element in defaultSpikes: x, y, damage, correspondingCharacter, xIncrement, yIncrement, activated, spawnTime, coolDownTime, coolDownTimeRemaining
  defaultSpikes = [
    // Top map
    [mapWidth * 0.4, height * 0.4375, 2, "top", mapWidth * 0.025, height * 0.05, true, 90, 90, 0],
    [mapWidth * 0.425, height * 0.4375, 2, "top", mapWidth * 0.025, height * 0.05, false, 90, 90, 30],
    [mapWidth * 0.7375, height * 0.175, 2, "top", mapWidth * 0.025, height * 0.05, true, 60, 60, 0],

    // Bottom map
    [mapWidth * 0.25, height * 0.825, 2, "bottom", mapWidth * 0.025, height * 0.05, true, 90, 120, 0],
    [mapWidth * 0.275, height * 0.825, 2, "bottom", mapWidth * 0.025, height * 0.05, false, 90, 120, 30],
    [mapWidth * 0.3, height * 0.825, 2, "bottom", mapWidth * 0.025, height * 0.05, false, 90, 120, 60],
    [mapWidth * 0.7, height * 0.825, 2, "bottom", mapWidth * 0.025, height * 0.05, true, 90, 90, 0],
    [mapWidth * 0.725, height * 0.825, 2, "bottom", mapWidth * 0.025, height * 0.05, false, 90, 90, 30],
    [mapWidth * 0.8, height * 0.825, 2, "bottom", mapWidth * 0.025, height * 0.05, false, 90, 90, 90],
    [mapWidth * 0.825, height * 0.825, 2, "bottom", mapWidth * 0.025, height * 0.05, false, 90, 90, 120],
    [mapWidth * 0.85, height * 0.825, 2, "bottom", mapWidth * 0.025, height * 0.05, false, 90, 90, 150]
  ];

  currentSpikes = [];

  // ----------------------------------------


  // ----------------------------------------
  // Tumbleweeds
  // ----------------------------------------

  // As tumbleweeds can only spawn in the desert level, level is not required in defaultTumbleweeds
  // Each element in defaultTumbleweeds: x, y, damage, correspondingCharacter, xIncrement, yIncrement, xVelocity
  // As the wind in the desert level travels from right to left, all tumbleweeds would move from the right to the left
  defaultTumbleweeds = [
    [mapWidth * 0.2125, height * 0.09, 2, "top", mapWidth * 0.01125, height * 0.03, mapWidth * 0.0015],
    [mapWidth, height * 0.375, 2, "top", mapWidth * 0.009, height * 0.024, mapWidth * 0.001],
    [mapWidth * 0.55, height * 0.4825, 2, "bottom", mapWidth * 0.009, height * 0.024, mapWidth * 0.00125],
    [mapWidth, height * 0.725, 2, "bottom", mapWidth * 0.009, height * 0.024, mapWidth * 0.001]
  ];

  currentTumbleweeds = [];

  // Allows tumbleweeds to be displayed with different opacities later
  // If tint() is used in the show() method instead, then the game would be very laggy in the desert level

  // Create two mini canvas, one for the top map and one for the bottom map
  let topGraphics = createGraphics(
    tumbleweedTexture.width,
    tumbleweedTexture.height
  );
  let bottomGraphics = createGraphics(
    tumbleweedTexture.width,
    tumbleweedTexture.height
  );

  // Set the opacities of the mini canvas
  topGraphics.tint(220);
  bottomGraphics.tint(200);

  // Use the tumbleweed texture to display the tumbleweed
  topGraphics.image(tumbleweedTexture, 0, 0);
  bottomGraphics.image(tumbleweedTexture, 0, 0);

  // Save the results of the mini canvas as the tumbleweed textures for the top and bottom screens
  topTumbleweedTexture = topGraphics.get();
  bottomTumbleweedTexture = bottomGraphics.get();

  // As the new tumbleweed textures have already been saved, the mini canvas are no longer needed, and therefore can be removed
  topGraphics = null;
  bottomGraphics = null;

  // ----------------------------------------
  
  
  // ----------------------------------------
  // Levers
  // ----------------------------------------

  // Dimensions of the levers
  // The positions of the levers would all be different, so the x and y coordinates are not defined yet
  let leverXIncrement = width*0.02;
  let leverXOffset = width*0.04;
  let leverYIncrement = height*0.03;

  // Each element in defaultLevers: level, [x, y, xIncrement, leverXOffset, yIncrement, "left"/"right", leftCorrespondingSubroutine, rightCorrespondingSubroutine, correspondingCharacter]
  defaultLevers = [
    [
      "forest",
      [mapWidth * 0.4, height * 0.27, leverXIncrement, leverXOffset, leverYIncrement, "right",
      () => {spawnLadder(0)},
      () => {},
      "top"],
      [mapWidth * 0.2125, height * 0.67, leverXIncrement, leverXOffset, leverYIncrement, "left",
      () => {closeDoor(0)},
      () => {openDoor(0)},
      "bottom"]
    ],
    
    [
      "volcano",
      [mapWidth * 0.4875, height * 0.22, leverXIncrement, leverXOffset, leverYIncrement, "left",
      () => {
        closeDoor(0);
        openDoor(1);
        openDoor(2);
        closeDoor(3);
      },
      () => {
        openDoor(0);
        closeDoor(1);
        closeDoor(2);
        openDoor(3)
      },
      "top"]
    ],
    
    [
      "desert",
      [mapWidth * 0.2625, height * 0.4575, leverXIncrement, leverXOffset, leverYIncrement, "left",
      () => {
        openDoor(0);
        openDoor(1);
        openDoor(3);
        openDoor(4);
      },
      () => {
        closeDoor(0);
        closeDoor(1);
        closeDoor(3);
        closeDoor(4);
      },
      "top"],
      [mapWidth * 0.475, height * 0.545, leverXIncrement, leverXOffset, leverYIncrement, "right",
      () => {
        spawnKey("desert", 0);
        openDoor(5);
      },()=>{},
      "bottom"]
    ]
  ];
  
  currentLevers = [];
  
  // ----------------------------------------


  // ----------------------------------------
  // Buttons
  // ----------------------------------------

  // Dimensions of the buttons
  // The positions of the buttons would all be different, so the x and y coordinates are not defined yet
  let buttonXIncrement = mapWidth * 0.025;
  let buttonYIncrement = height * 0.015;

  // Different colours based on the corresponding level
  let forestButtonColor = `hsl(30, 40%, 35%)`;
  let volcanoButtonColor = `hsl(0, 5%, 25%)`;
  let desertButtonColor = `hsl(40, 45%, 35%)`;
  
  // Each element in defaultButtons: level, [x, y, xIncrement, yIncrement, correspondingSubroutine, correspondingCharacter, displayColor]
  defaultButtons = [
    [
      "forest",
      [mapWidth * 0.275, height * 0.21, buttonXIncrement, buttonYIncrement,
      () => {
        if (currentButtons[1].getPressed()) {
          spawnKey("forest", 0);
        }
      },
      "top", `hsl(240, 60%, 40%)`],
      [mapWidth * 0.0875, height * 0.585, buttonXIncrement, buttonYIncrement,
      () => {
        if (currentButtons[0].getPressed()) {
          spawnKey("forest", 0);
        }
      },
      "bottom", `hsl(240, 60%, 40%)`],
      [mapWidth * 0.7, height * 0.285, buttonXIncrement, buttonYIncrement,
      () => {
        if (currentButtons[3].getPressed()) {
          openDoor(1);
          openDoor(2);
        }
      },
      "top", forestButtonColor],
      [mapWidth * 0.375, height * 0.635, buttonXIncrement, buttonYIncrement,
      () => {
        if (currentButtons[2].getPressed()) {
          openDoor(1);
          openDoor(2);
        }
      },
      "bottom", forestButtonColor]
    ],
    
    [
      "volcano",
      [mapWidth * 0.1375, height * 0.21, buttonXIncrement, buttonYIncrement,
      () => {
        if (currentButtons[1].getPressed()) {
          openDoor(1);
        }
      },
      "top", `hsl(240, 60%, 40%)`],
      [mapWidth * 0.2125, height * 0.585, buttonXIncrement, buttonYIncrement,
      () => {
        if (currentButtons[0].getPressed()) {
          openDoor(1);
        }
      },
      "bottom", `hsl(240, 60%, 40%)`],
      [mapWidth * 0.5, height * 0.86, buttonXIncrement, buttonYIncrement,
      () => {spawnLadder(0)},
      "bottom", volcanoButtonColor]
    ],
    
    [
      "desert",
      [mapWidth * 0.3, height * 0.185, buttonXIncrement, buttonYIncrement,
      () => {
        if (currentButtons[2].getPressed()) {
          spawnLadder(0);
          spawnLadder(1);
        }
      },
      "top", `hsl(240, 60%, 40%)`],
      [mapWidth * 0.5375, height * 0.21, buttonXIncrement, buttonYIncrement,
      () => {
        if (currentButtons[3].getPressed()) {
          if (currentDoors[2].getClosed()) {
            openDoor(2);
          }

          if (currentDoors[6].getClosed()) {
            openDoor(6);
          }
        }
      },
      "top", `hsl(0, 50%, 40%)`],
      [mapWidth * 0.15625, height * 0.585, buttonXIncrement, buttonYIncrement,
      () => {
        if (currentButtons[0].getPressed()) {
          spawnLadder(0);
          spawnLadder(1);
        }
      },
      "bottom", `hsl(240, 60%, 40%)`],
      [mapWidth * 0.325, height * 0.71, buttonXIncrement, buttonYIncrement,
      () => {
        if (currentButtons[1].getPressed()) {
          if (currentDoors[2].getClosed()) {
            openDoor(2);
          }

          if (currentDoors[6].getClosed()) {
            openDoor(6);
          }
        }
      },
      "bottom", `hsl(0, 50%, 40%)`],
    ]
  ];

  currentButtons = [];
  
  // ----------------------------------------


  // ----------------------------------------
  // Coins
  // ----------------------------------------

  // Fix aspect ratio of the coin to prevent the image of the coin being distorted
  let coinXIncrement = coinTexture.width * width / 6500;
  let coinYIncrement = coinTexture.height * width / 6500;

  // Each element in defaultCoins: level, [x, y, xIncrement, yIncrement, correspondingCharacter]
  defaultCoins = [
    [
      "forest",
      [mapWidth * 0.17, height * 0.15, coinXIncrement, coinYIncrement, "top"],
      [mapWidth * 0.575, height * 0.2, coinXIncrement, coinYIncrement, "top"],
      [mapWidth * 0.9, height * 0.1375, coinXIncrement, coinYIncrement, "top"],
      [mapWidth * 0.0275, height * 0.5325, coinXIncrement, coinYIncrement, "bottom"],
      [mapWidth * 0.7, height * 0.5325, coinXIncrement, coinYIncrement, "bottom"]
    ],
    
    [
      "volcano",
      [mapWidth * 0.02, height * 0.175, coinXIncrement, coinYIncrement, "top"],
      [mapWidth * 0.625, height * 0.2, coinXIncrement, coinYIncrement, "top"],
      [mapWidth * 0.9125, height * 0.15, coinXIncrement, coinYIncrement, "top"],
      [mapWidth * 0.6, height * 0.6, coinXIncrement, coinYIncrement, "bottom"],
      [mapWidth * 0.9, height * 0.5325, coinXIncrement, coinYIncrement, "bottom"]
    ],
    
    [
      "desert",
      [mapWidth * 0.275, height * 0.2625, coinXIncrement, coinYIncrement, "top"],
      [mapWidth * 0.425, height * 0.2, coinXIncrement, coinYIncrement, "top"],
      [mapWidth * 0.005, height * 0.5325, coinXIncrement, coinYIncrement, "bottom"],
      [mapWidth * 0.41875, height * 0.5325, coinXIncrement, coinYIncrement, "bottom"],
      [mapWidth * 0.9, height * 0.6625, coinXIncrement, coinYIncrement, "bottom"]
    ]
  ];
  
  currentCoins = [];
  
  // ----------------------------------------


  // ----------------------------------------
  // Recovery hearts
  // ----------------------------------------

  // Fix aspect ratio of the recovery hearts to prevent the image of the heart being distorted
  let heartXIncrement = heartTexture.width * width / 6500;
  let heartYIncrement = heartTexture.height * width / 6500;
  
  // Each element in defaultRecoveryHearts: level, [x, y, xIncrement, yIncrement, correspondingCharacter]
  defaultRecoveryHearts = [
    [
      "forest",
      [mapWidth * 0.265, height * 0.15, heartXIncrement, heartYIncrement, "top"],
      [mapWidth * 0.975, height * 0.25, heartXIncrement, heartYIncrement, "top"],
      [mapWidth * 0.5, height * 0.55, heartXIncrement, heartYIncrement, "bottom"],
      [mapWidth * 0.95, height * 0.825, heartXIncrement, heartYIncrement, "bottom"]
    ],
    
    [
      "volcano",
      [mapWidth * 0.4, height * 0.15, heartXIncrement, heartYIncrement, "top"],
      [mapWidth * 0.7, height * 0.325, heartXIncrement, heartYIncrement, "top"],
      [mapWidth * 0.01, height * 0.6, heartXIncrement, heartYIncrement, "bottom"],
      [mapWidth * 0.8, height * 0.5625, heartXIncrement, heartYIncrement, "bottom"]
    ],
    
    [
      "desert",
      [mapWidth * 0.5125, height * 0.175, heartXIncrement, heartYIncrement, "top"],
      [mapWidth * 0.775, height * 0.15, heartXIncrement, heartYIncrement, "top"],
      [mapWidth * 0.5, height * 0.5375, heartXIncrement, heartYIncrement, "bottom"],
      [mapWidth * 0.825, height * 0.625, heartXIncrement, heartYIncrement, "bottom"]
    ]
  ];
  
  currentRecoveryHearts = [];

  // ----------------------------------------
}

// draw(): Loops forever throughout the entire program
function draw() {
  // Check for lag
  function outputFPS() {
    if (frameCount % 60 == 0) {
      console.log(`FPS: ${frameRate().toFixed(2)}`);
    }
  }
  
  // outputFPS();
  
  
  background(220);
  
  // Switching between different screens, when the player clicks on a button.
  switch (screen) {
    case "title":
      titleScreen();
      break;
    case "rules":
      rulesScreen();
      break;
    case "levelSelect":
      levelSelectScreen();
      break;
    case "forest":
      forestScreen();
      break;
    case "volcano":
      volcanoScreen();
      break;
    case "desert":
      desertScreen();
      break;
  }

  // Plays background music
  playBgm();
}

// ----------------------------------------
