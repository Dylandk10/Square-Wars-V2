var xxx, enemy, enemys, bullet, bullets, boss, gameHandler;
enemys = [];
bullets = [];
boss = [];

var gamePlaying;

var startGame = () => {
  document.getElementById("scores").style.display = "inline";
  document.getElementById("scores").style.visibility = "visible";
  enemys = [];
  boss = [];
  gamePlaying = true;
  myGameArea.start();
  xxx = new Player('xxx', 50, 30, 30, 50, 268, 'red');
  gameHandler = new Game_Handler(0);
}

var myGameArea = {
  canvas: document.createElement('canvas'),
  start: function() {
    this.canvas.width = 600;
    this.canvas.height = 320;
    this.context = this.canvas.getContext('2d');
    //document.body.insertBefore(this.canvas, document.body.childNodes[2]);
	document.querySelector("main").appendChild(this.canvas);
    this.framNo = 0;
    this.interval = setInterval(updateGameArea, 15);
    //key down to go
    window.addEventListener("keyup", function(e) {
      myGameArea.key = false;
    });
    window.addEventListener("keydown", function(e) {
      myGameArea.key = e.keyCode;
    });
  },
  //clear the canvas and update
  clear: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  gameOver: function() {
    this.canvas.style.display = "none";
    this.canvas.style.visibility = "hidden";
    document.getElementById("scores").style.display = "none";
    document.getElementById("scores").style.visibility = "hidden";
    document.getElementById("scoreMenu").style.display = "block";
    document.getElementById("scoreMenu").style.visibility = "visible";
    document.getElementById('yourScore').textContent = xxx.killCount;
  },
  
  everyInterval: function(n) {
	if((myGameArea.framNo / n) % 1 === 0) {
		return true;
	}
	return false;
  },
  
  scoreMenu: function () {
	myGameArea.canvas.display = "hidden";
	document.getElementById('scoreMenu').style.display = 'hidden';
	document.getElementById('gameMenu').style.display = "none";
  }
}



//---------------------------------------------------------------------------------------------------------
//player constructor killcount = player kills roundcount = rounds if round > 80 round = 80
//bc enemys spawn to fast to kill. killCount will be sent to hight score
class Player {
  constructor(name, hitPoints, width, height, x, y, color, killCount, roundCount){
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
	xxx.speedX = 0;
	xxx.speedY = 0;
  }
  //map clipping
  checkPosition() {
	  if(this.y <= 0) {
		  this.y = 0;
	  }
	  if(this.y >= 293) {
		  this.y = 293;
	  }
	  if(this.x <= 0) {
		  this.x = 0;
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





//game handlers handles all game related specs such as bullet and enemy collision, spawning enemies controlling round counter 
class Game_Handler {
	constructor(round) {
		this.round = round;
	}
	checkWin() {
		//if enemys past width of gamefield stop
		for(var i = 0; i < enemys.length; i++) {
			if(enemys[i].x < 0 && enemys[i].x != undefined && enemys[i].y != undefined) {
				gamePlaying = false;
				myGameArea.gameOver();

				myGameArea.scoreMenu();
			}
		}
	}
	checkCrashHandle() {
		//crash with handing... Npc
		for(var i = 0; i < enemys.length; i++) {
			for(var j = 0; j < bullets.length; j++) {
				if(bullets[j].crashWith(enemys[i]) && enemys[i].x != undefined && enemys[i].y != undefined) {
					enemys[i].x = undefined;
					enemys[i].y = undefined;
					enemys[i].update();
					enemys.slice(enemys.indexOf(enemys[i], 1));
					bullets.splice(bullets.indexOf(bullets[j], bullets.length));
					this.roundHandler();
					xxx.killCount += 1;
					
				}	
			}
		}
	}
	
	//sub routine for ceckCrashHandle funciton 
	roundHandler() {
		if(xxx.roundCount < 80) {
			xxx.roundCount += 1;
		}
		
		if(xxx.killCount % 10 === 0) {
			this.round += 1;
		}
	}
	
	
	checkCrashHandleBoss() {
		//crash handling...Boss no points for bosses...
		for(var i = 0; i < bullets.length; i++) {
			for(var j = 0; j < boss.length; j++) {
				if(bullets[i].crashWith(boss[j]) && boss[j].x != undefined && boss[j].y != undefined) {
					boss[j].x = undefined;
					boss[j].y = undefined;
					boss.slice(boss.indexOf(boss[j], 1));
				}
			}
		}
	}
	
	spawnBullet() {
		var bullet = new Bullet(10, 5, -2, -2, 'black');
		bullet.shoot();
		bullets.push(bullet);
	}
	
	spawnEnemies() {
		//random y generator
		var randomY = Math.floor(Math.random() * 240);
		//spawn enemies
		if(myGameArea.framNo === 1 || myGameArea.everyInterval(120 - xxx.roundCount)) {
			enemys.push(new Npc('Enemy', 50, 30, 30, 600, randomY, 'blue'));
			//bullets.push(new Bullet(10, 5, -2, -2, 'black'));
			if(this.round % 3 == 0 && this.round != 0) {
				//turn killcount to string to send data to compare
				let holdData = xxx.roundCount.toString();
				holdData = holdData.split('');
				holdData = holdData.slice(0, 1);
				parseInt(holdData);
				this.spawnBoss(holdData)
			}

		}
	}
	
	updateEnemies() {
		//loop threw enemys and update
		for(var i = 0; i < enemys.length; i++) {
			//if player has killCount of 100 enemys move faster
			if(xxx.killCount >= 100) {
				enemys[i].x -= 1.25;
			} else {
				enemys[i].x -= 1;
			}
			enemys[i].update();
		}
	}
	
	updateBullets() {
		//update bullet
		for(var j = 0; j < bullets.length; j++) {
			if(bullets[j].x > 600 ) {
				bullets.slice(bullets.indexOf(bullets[j], bullets.length));
			}
			bullets[j].newPos();
			bullets[j].update();
		}
	}
	
	updateBoss() {
		boss.forEach((el) => {
			el.x -= 1;
			el.newPos();
			el.update();
		});
	}
	
	spawnBoss(count) {
		console.log(count);
		var randomY = Math.floor(Math.random() * 240);
		if(count <= this.round) {
			//moved enmy back 500 thats why its 600 + 500 aka 11000
			boss.push(new Npc('Boss', 50, 30, 30, 600 + 500, randomY, "green"));
			count++;
		}
	}
	
	getRound() {
		return this.round;
	}
}

//bullet class
class Bullet {
  constructor(width, height, x, y, color, bulletFire) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
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
    this.x += this.speedX;
  }
  shoot() {
    if(this.bulletFire === false) {
    this.bulletFire = true;
    this.x = xxx.x;
    this.y = xxx.y;
    this.speedX = + 10;
    }
    if(this.x > myGameArea.canvas.width) {
      this.bulletFire = false;
    }
  }
  crashWith(otherobj) {
    var myleft = this.x;
    var myright = this.x + (this.width);
    var mytop = this.y;
    var mybottom = this.y + (this.height);
    var otherleft = otherobj.x;
    var otherright = otherobj.x + (otherobj.width);
    var othertop = otherobj.y;
    var otherbottom = otherobj.y + (otherobj.height);
    var crash = true;
    if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
    crash = false;
    }
    return crash;
  }
}

//----------------------------------------------------------------------------------------------------
//  GAME ENGINE CONSTANTLY RUNNING !!

//game area always updating every 15mill sec ...
var updateGameArea = () => {
  //if gamePlaying = true
  if(gamePlaying) {
	gameHandler.checkWin();
	gameHandler.checkCrashHandle();
	gameHandler.checkCrashHandleBoss();
	myGameArea.clear();
	//must declare player speed
	xxx.resetSpeed();
  
	if(myGameArea.key && myGameArea.key === 37) {xxx.speedX = - 5;}
	if(myGameArea.key && myGameArea.key === 39) {xxx.speedX =  5;}
	if(myGameArea.key && myGameArea.key === 38) {xxx.speedY = - 5;}
	if(myGameArea.key && myGameArea.key === 40) {xxx.speedY =  5;}
	if(myGameArea.key && myGameArea.key === 32) {gameHandler.spawnBullet();}

	gameHandler.spawnEnemies();
	gameHandler.updateEnemies();
    //update player
	xxx.checkPosition();
    xxx.newPos();
    xxx.update();
    gameHandler.updateBullets();
	gameHandler.updateBoss();
	//show player killCount
	document.getElementById('killCount').textContent = `Player kill-count: ${xxx.killCount}`;
	document.getElementById('roundCounter').textContent = `This Round: ${gameHandler.getRound()}`;
	
	//add a gameframe if the shoot key is enabled then disable the shoot key
	myGameArea.framNo += 1;
	if(myGameArea.key == 32)
		myGameArea.key = null;
  }
}
//-----------------------------------------------------------------------------------------------------

//Event listener for main menu
document.getElementById('gameBtn').addEventListener("click", () => {
	if(window.innerWidth < 700) {
		document.getElementById("widthError").textContent = "Browser window must at least 700px long to play, Mobile does not Work";
	} else {
		document.getElementById('gameMenu').style.display = 'none';
		startGame();
	}
});














//startGame();
