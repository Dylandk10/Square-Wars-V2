//front build to square wars
//declare player && enemys
var xxx, enemy, enemys, bullet, bullets, boss;
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
  //enemy = new Npc('goblin', 50, 30, 30, 60, 230, 'blue');
  //bullet = new Bullet(10, 5, -2, -2, 'black');
}

var myGameArea = {
  canvas: document.createElement('canvas'),
  start: function() {
    this.canvas.width = 600;
    this.canvas.height = 320;
    this.context = this.canvas.getContext('2d');
    document.body.insertBefore(this.canvas, document.body.childNodes[2]);
    this.framNo = 0;
    this.interval = setInterval(updateGameArea, 20);
    //key down to go
    window.addEventListener("keyup", function(e) {
      myGameArea.key = false;
    })
    window.addEventListener("keydown", function(e) {
      myGameArea.key = e.keyCode;
    })
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
  }
}

//function to calc framNo
var everyInterval = (n) => {
  if((myGameArea.framNo / n) % 1 === 0) {
    return true;
  }
  return false;
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
var readyFire = [];
var round = 0;
//game area always updating every 20min sec ...
var updateGameArea = () => {
  //if gamePlaying = true
  if(gamePlaying) {
  //if enemys past width of gamefield stop
  for(var i = 0; i < enemys.length; i++) {
    if(enemys[i].x < 0 && enemys[i].x != undefined && enemys[i].y != undefined) {
      gamePlaying = false;
      myGameArea.gameOver();

      scoreMenu();
    }
  }
  //crash with handing... Npc
  for(var i = 0; i < enemys.length; i++) {
    for(var j = 0; j < bullets.length; j++) {
    if(bullets[j].crashWith(enemys[i]) && enemys[i].x != undefined && enemys[i].y != undefined) {
      enemys[i].x = undefined;
      enemys[i].y = undefined;
      enemys[i].update();
        if(xxx.roundCount >= 80) {
          //keep round count at 80 to many enemies spawn
          xxx.roundCount = 80;
        } else {
          xxx.roundCount += 1;
        }
        xxx.killCount += 1;
        if(xxx.killCount % 10 === 0) {
          round += 1
        } else {
          round = round;
        }
      }
    }
  }
  //crash handling...Boss no points for bosses...
  for(var i = 0; i < bullets.length; i++) {
    for(var j = 0; j < boss.length; j++) {
      if(bullets[i].crashWith(boss[j]) && boss[j].x != undefined && boss[j].y != undefined) {
        boss[j].x = undefined;
        boss[j].y = undefined;
      }
    }
  }
  //random y generator
  var randomY = Math.floor(Math.random() * 240);
  myGameArea.clear();
  //must declare player speed
  xxx.speedX = 0;
  xxx.speedY = 0;
  //game keys to move and shoot
  for(var j = 0; j < bullets.length; j++) {
    //shoot function one at a time
    if(myGameArea.key && myGameArea.key === 32) {
      readyFire = bullets.slice(bullets[j], 1);
      readyFire[0].shoot()
      }
  }
  if(myGameArea.key && myGameArea.key === 37) {xxx.speedX = - 3;}
  if(myGameArea.key && myGameArea.key === 39) {xxx.speedX =  3;}
  if(myGameArea.key && myGameArea.key === 38) {xxx.speedY = - 3;}
  if(myGameArea.key && myGameArea.key === 40) {xxx.speedY =  3}

  //add a gameframe
  myGameArea.framNo += 1;
  //spawn enemies
  if(myGameArea.framNo === 1 || everyInterval(120 - xxx.roundCount)) {
    enemys.push(new Npc('Goblin', 50, 30, 30, 600, randomY, 'blue'));
    bullets.push(new Bullet(10, 5, -2, -2, 'black'));
    if(round % 3 == 0 && round != 0) {
      //turn killcount to string to send data to compare
      let holdData = xxx.roundCount.toString();
      holddata = holdData.split('');
      holdData = holdData.slice(0, 1);
      parseInt(holddata);
      spawnBoss(holdData)
    }

  }

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
    //update player
    xxx.newPos();
    xxx.update();
    //update bullet
    for(var j = 0; j < bullets.length; j++) {
    bullets[j].newPos();
    bullets[j].update();
  }
    boss.forEach((el) => {
      el.x -= 1;
      el.newPos();
      el.update();
    });


  //show player killCount
  document.getElementById('killCount').textContent = `Player kill-count: ${xxx.killCount}`;
  document.getElementById('roundCounter').textContent = `This Round: ${round}`;
  }
}
//-----------------------------------------------------------------------------------------------------
//spawn npc function for boss
var spawnBoss = (count) => {
  console.log(count);
  var randomY = Math.floor(Math.random() * 240);
  if(count <= round) {
    //moved enmy back 500 thats why its 600 + 500 aka 11000
    boss.push(new Npc('Boss', 50, 30, 30, 600 + 500, randomY, "green"));
    count++;
  }
}


//Event listener for main menu...
document.getElementById('gameBtn').addEventListener("click", () => {
  document.getElementById('gameMenu').style.display = 'none';
  startGame();
});
// document.getElementById('playAgain').addEventListener("click", () => {
//   startGame();
// });

//score menu
var scoreMenu = () => {
  myGameArea.canvas.display = "hidden";
  document.getElementById('scoreMenu').style.display = 'hidden';
  document.getElementById('gameMenu').style.display = "none";
};














//startGame();
