//objects for the game
let player, enemy, enemys, bullet, bullets, boss, gameHandler;
//boolean for the game engine
let gamePlaying;

//The starting function for the game
let startGame = () => {
  document.getElementById("scores").style.display = "inline";
  document.getElementById("scores").style.visibility = "visible";
  enemys = [];
  boss = [];
  bullets = [];
  gamePlaying = true;
  player = new Player('player', 50, 30, 30, 150, 550, 'red');
  gameHandler = new Game_Handler(0);

  myGameArea.start();
}


//This is for the creating and maintaining of canvas object and other html elements
let myGameArea = {
  canvas: document.createElement('canvas'), //canvas object

  //function for creating the canavs element and adding event listeners to the canvas element
  start: function() {
    this.canvas.width = 320;
    this.canvas.height = 600;

    this.context = this.canvas.getContext('2d');
    document.querySelector("main").appendChild(this.canvas);
    this.canvas.display = 'inline-block';
    this.canvas.float = 'right';

    
    this.framNo = 0;

    //this calls the game engine
    this.interval = setInterval(updateGameArea, 20);

    /**
    * @param {Event} e
    * create event listeners for the game
    **/
    window.addEventListener("keyup", (e) => {
      myGameArea.key = false;
    });
    window.addEventListener("keydown", (e) => {
      e.preventDefault();
      myGameArea.key = e.keyCode;
    });
  },

  //clear the canvas and update
  clear: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },

  //the display function for game over
  gameOver: function() {
    this.canvas.style.display = "none";
    this.canvas.style.visibility = "hidden";
    document.getElementById("scores").style.display = "none";
    document.getElementById("scores").style.visibility = "hidden";
    document.getElementById("scoreMenu").style.display = "block";
    document.getElementById("scoreMenu").style.visibility = "visible";
    document.getElementById('yourScore').textContent = player.killCount;
  },

  /**
  * @param {Number} n
  * @returns {boolean}
  **/
  everyInterval: function(n) {
    if ((myGameArea.framNo / n) % 1 === 0) {
      return true;
    }
    return false;
  },

  //score menu handler
  scoreMenu: function() {
    myGameArea.canvas.display = "hidden";
    document.getElementById('scoreMenu').style.display = 'hidden';
    document.getElementById('gameMenu').style.display = "none";
  }
}

/**
* player class used used to update play speed and postion on canvas/map clipping
**/
class Player {
  constructor(name, hitPoints, width, height, x, y, color, killCount, roundCount) {
    this.name = name;
    this.hitPoints = hitPoints;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.color = color;
    this.killCount = 0;
    this.roundCount = 0;
  }
  update() {
    let ctx = myGameArea.context;
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  newPos() {
    this.x += this.speedX;
    this.y += this.speedY;
  }
  resetSpeed() {
    player.speedX = 0;
    player.speedY = 0;
  }

  //map clipping
  checkPosition() {
    if (this.y <= 0) {
      this.y = 0;
    }
    if (this.y >= 568) {
      this.y = 568;
    }
    if (this.x <= 0) {
      this.x = 0;
    }
    if(this.x >= 295) {
      this.x = 295;
    }
  }
}




//npc/ enemy constructor
class Npc {
  constructor(name, hitPoints, width, height, x, y, color) {
    this.name = name;
    this.hitPoints = hitPoints;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.x = x;
    this.y = y;
    this.color = color;
  }
  update() {
    let ctx = myGameArea.context;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  newPos() {
    this.x += this.speedX;
  }
}





//game handlers handles all game related specs
class Game_Handler {
  constructor(round) {
    this.round = round;
  }

  /**
  * If enemies or boss pass the player and touch the bottom of canavs then game over
  **/
  checkWin() {
    for (let i = 0; i < enemys.length; i++) {
      if (enemys[i].y > 590 && enemys[i].x != undefined && enemys[i].y != undefined) {
        gamePlaying = false;
        myGameArea.gameOver();
        myGameArea.scoreMenu();
      }
    }
  }

  /**
  * Method for handling crashes with enemies
  * if the bullet hits the enemy slice the enemy from the array and add a kill count
  * making the enemy's x and y undefined is just a faster way to remove them from canvas after slice
  **/
  checkCrashHandle() {
    for (let i = 0; i < enemys.length; i++) {
      for (let j = 0; j < bullets.length; j++) {
        if (bullets[j].crashWith(enemys[i]) && enemys[i].x != undefined && enemys[i].y != undefined) {
          enemys[i].x = undefined;
          enemys[i].y = undefined;
          enemys[i].update();
          enemys.slice(enemys.indexOf(enemys[i], 1));
          bullets.splice(bullets.indexOf(bullets[j], bullets.length));
          this.roundHandler();
          player.killCount += 1;

        }
      }
    }
  }

  /**
  * subroutine for handling rounds
  * rounds fomula is killCount % 10 == 0 then add a round
  * round 80 is max round
  **/
  roundHandler() {
    let maxRound = 80;
    if (player.roundCount < maxRound) {
      player.roundCount += 1;
    }

    if (player.killCount % 10 === 0) {
      this.round += 1;
    }
  }

  /**
    * Method for handling crashes with bosses
    * if the bullet hits the boss slice the enemy from the array and add a kill count
    * making the boss's x and y undefined is just a faster way to remove them from canvas after slice
    * does not give points
    **/
  checkCrashHandleBoss() {
    for (let i = 0; i < bullets.length; i++) {
      for (let j = 0; j < boss.length; j++) {
        if (bullets[i].crashWith(boss[j]) && boss[j].x != undefined && boss[j].y != undefined) {
          boss[j].x = undefined;
          boss[j].y = undefined;
          boss.slice(boss.indexOf(boss[j], 1));
        }
      }
    }
  }

  //spawn bullet from player shooting
  spawnBullet() {
    let bullet = new Bullet(5, 10, -2, -2, 'black');
    bullet.shoot();
    bullets.push(bullet);
  }

  /**
  * spawn enemies method spawns enemies based on the round and interval
  * fromula interval 120 (constant) - round % 1 == 0
  * This allows for enemies to spawn based off of current round
  **/
  spawnEnemies() {
    let randomX = Math.floor(Math.random() * 240);
    if (myGameArea.framNo === 1 || myGameArea.everyInterval(120 - player.roundCount)) {
      enemys.push(new Npc('Enemy', 50, 30, 30, randomX, -5, 'blue'));

      //spawn boss fomula round % 3 == 0 count is to hold how many are spawn
      if (this.round % 3 == 0 && this.round != 0) {
        //turn killcount to string to send data to compare
        let holdData = player.roundCount.toString();
        holdData = holdData.split('');
        holdData = holdData.slice(0, 1);
        parseInt(holdData);
        this.spawnBoss(holdData)
      }

    }
  }


  //update enemies method to manage enemies speed on canvas
  updateEnemies() {
    //loop threw enemys and update
    for (let i = 0; i < enemys.length; i++) {
      //if player has killCount of 100 enemys move faster
      if (player.killCount >= 100) {
        enemys[i].y += 1.75;
      } else {
        enemys[i].y += 1.25;
      }
      enemys[i].update();
    }
  }

  //update bullets to maintain speed and position on canvas
  updateBullets() {
    //update bullet
    for (let j = 0; j < bullets.length; j++) {
      if (bullets[j].y <= 0) {
        bullets.slice(bullets.indexOf(bullets[j], bullets.length));
      }
      bullets[j].newPos();
      bullets[j].update();
    }
  }

  //update boss to maintain speed and position on canvas
  updateBoss() {
    boss.forEach((el) => {
      el.y += 1;
      el.newPos();
      el.update();
    });
  }

  /**
  * @param {number} count
  * boss spawn depends on round
  **/
  spawnBoss(count) {
    let randomX = Math.floor(Math.random() * 240);
    if (count <= this.round) {
      //moved enmy back 500 thats why its 600 + 500 aka 11000
      boss.push(new Npc('Boss', 50, 30, 30, randomX, -10, "green"));
      count++;
    }
  }

  /**
  * @returns {number} this.round
  **/
  getRound() {
    return this.round;
  }

  /**
  * A method for checking the event key pressed on the window
  * If arrow keys are selected move the player
  * If space is selected fire bulelt
  * use javascript e keycodes to find the key codes online
  **/
  checkKeyCode() {
    if (myGameArea.key && myGameArea.key === 37) {
      player.speedX = -5;
    }
    if (myGameArea.key && myGameArea.key === 39) {
      player.speedX = 5;
    }
    if (myGameArea.key && myGameArea.key === 38) {
      player.speedY = -5;
    }
    if (myGameArea.key && myGameArea.key === 40) {
      player.speedY = 5;
    }
    if (myGameArea.key && myGameArea.key === 32) {
      gameHandler.spawnBullet();
    }
  }

  //write the score to the html
  updateScoreMenu() {
    //show player killCount
    document.getElementById('killCount').textContent = `Player kill-count: ${player.killCount}`;
    document.getElementById('roundCounter').textContent = `This Round: ${gameHandler.getRound()}`;
  }
}

//bullet class
class Bullet {
  constructor(width, height, x, y, color, bulletFire) {
    this.width = width;
    this.height = height;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.color = color;
    this.bulletFire = false;
  }
  update() {
    let ctx = myGameArea.context;
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  newPos() {
    this.y += this.speedY;
  }
  shoot() {
    if (this.bulletFire === false) {
      this.bulletFire = true;
      this.x = player.x+8;
      this.y = player.y;
      this.speedY = -10;
    }
    if (this.x > myGameArea.canvas.width) {
      this.bulletFire = false;
    }
  }

  /**
  * @param {Object} otherobj
  * @returns {boolean} crash
  * The method for checking whether the bullet has hit any object on the canvas
  **/
  crashWith(otherobj) {
    let myleft = this.x;
    let myright = this.x + (this.width);
    let mytop = this.y;
    let mybottom = this.y + (this.height);
    let otherleft = otherobj.x;
    let otherright = otherobj.x + (otherobj.width);
    let othertop = otherobj.y;
    let otherbottom = otherobj.y + (otherobj.height);
    let crash = true;
    if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
      crash = false;
    }
    return crash;
  }
}

//----------------------------------------------------------------------------------------------------
//  GAME ENGINE CONSTANTLY RUNNING !!

//game area always updating every 20mill sec ...
let updateGameArea = () => {
  //if gamePlaying = true
  if (gamePlaying) {
    gameHandler.checkWin();
    gameHandler.checkCrashHandle();
    gameHandler.checkCrashHandleBoss();
    myGameArea.clear();
    //must reset player speed
    player.resetSpeed();
    gameHandler.checkKeyCode();

    gameHandler.spawnEnemies();
    gameHandler.updateEnemies();
    //update player
    player.checkPosition();
    player.newPos();
    player.update();
    gameHandler.updateBullets();
    gameHandler.updateBoss();
    gameHandler.updateScoreMenu();


    //add a gameframe if the shoot key is enabled then disable the shoot key
    myGameArea.framNo += 1;
    if (myGameArea.key == 32) {
      myGameArea.key = null;
    }
  }
}
//-----------------------------------------------------------------------------------------------------

//Event listener for main menu
document.getElementById('gameBtn').addEventListener("click", () => {
    document.getElementById('gameMenu').style.display = 'none';
    startGame();
});









//startGame();
