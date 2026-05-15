import Phaser from "phaser";

import { io } from "socket.io-client";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

await sleep(5000);


async function waitForServer() {
  while (true) {
    console.log("Attempted connection")
    try {
      const res = await fetch("/health");
      console.log("health fetched")
      if (res.ok) {
        console.log("Server awake");
        return;
      }
    } catch (err) {
      console.log("Waiting for server wake...");
      
    }
    console.log("Connection attempt likely failed");
    //await new Promise(r => setTimeout(r, 2000));
    await sleep(5000);

    
  }
}

async function authenticateWithTimeout(timeout = 5000) {

  return Promise.race([

    authenticateDiscord(),

    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Auth timeout")), timeout)
    )

  ]);
}




const socket = io(window.location.origin, {
  path: "/socket.io",
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000
});




//const socket = io(window.location.origin, {
 // path: '/server/socket.io',
  //transports: ["polling", "websocket"
//});
//const socket = io("https://bite-wallpaper-diabetes-cas.trycloudflare.com", {
  //transports: ["websocket"]
//});
console.log("server worked");

import { DiscordSDK } from "@discord/embedded-app-sdk";
import { authenticateDiscord } from "./auth";

const isDiscordActivity =
  window.location.hostname.includes("discordsays.com");
console.log("flag worked");
await sleep(5000);
socket.on("connect", async () => {
  socket.emit("test", "hello from client");
 
  if (isDiscordActivity) {
      while (true) {
        console.log("trying");
        try {
          const user = await authenticateWithTimeout();
          if (user == null) {
            console.log("null");
          }
          else {
            //console.log("HELLLLOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
           // console.log(user.username);
            console.log(user);
          }
          break;
        }
        catch {
          console.log("Guest");
        }
      //await sleep(2000);
      }
      
  }
  else {
    console.log("Is not discord activity");
  }
});

console.log("connect func worked");





console.log("imports worked YAYYYYYYYYYYYYYYYYY");

console.log("passed");
    
    /*
    const discordSdk = new DiscordSDK("1435704621229146184");
    await discordSdk.ready();
    const auth = await discordSdk.commands.authorize({
        client_id: "1435704621229146184",
        response_type: "code",
        state: "",
        prompt: "none",
        scope: ["identify"]
    });
    const { access_token } = auth;
    const user = await discordSdk.commands.authenticate({
        access_token
    });
    console.log("HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
    //console.log(user.user.id)
}
*/


let gameState = [];

socket.on("state", (state) => {
  gameState = state;
});

class client_manager {
    constructor() {
        this.x = 0;
        this.sprites = [];
        this.player;
        this.score = 0;
    }

    update() {
        for (let i = 0; i < this.sprites.length; i++ ){
            this.sprites[i].update();
        }
    }


}

class sprite_group {
    constructor() {
        this.sprites = []
    }

    update() {
        for (let i = 0; i < this.sprites.length; i++ ){
            this.sprites[i].update();
        }
    }

    delete() {
        return undefined;

    }



}

let game_m = new client_manager();


class MenuScene extends Phaser.Scene {
    constructor() {
        super({key: 'MenuScene'});
        
    }
    preload() {
        //this.load.image('logo', 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');
        this.load.image('Play_im', '/assets/star.png');
        //this.load.image('bullet_im', '/assets/bomb.png');
    }

    async create() {
       // if (isDiscordActivity) {
           // console.log(discordSdk.commands);
            
        //}
        
        const joinButton = this.add.text(400, 300, 'Rooms', { fontSize: '32px', color: '#0f0' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        // Change color on hover
        joinButton.on('pointerover', () => joinButton.setStyle({ color: '#ff0' }));
        joinButton.on('pointerout', () => joinButton.setStyle({ color: '#0f0' }));

        // Click to connect and start game
        joinButton.on('pointerdown', () => {
            joinButton.destroy();
            this.display_room();
            
        });

    }

    display_room() {
        socket.off("rooms");
        socket.emit("getrooms");
        let y = 0;
        
        let buttons = [];
        socket.on("rooms", (rooms) => {
            console.log(rooms);
            for (const r of rooms) {
                const joinButton = this.add.text(400, 100+y, r.id, { fontSize: '32px', color: '#0f0' })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            // Change color on hover
                joinButton.on('pointerover', () => joinButton.setStyle({ color: '#ff0' }));
                joinButton.on('pointerout', () => joinButton.setStyle({ color: '#0f0' }));

                // Click to connect and start game
                joinButton.on('pointerdown', () => this.connectToServer(r.id));
                
                y += 100;
                buttons.push(joinButton);
            }
            const joinButton = this.add.text(400, 100+y, "back", { fontSize: '32px', color: '#0f0' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

    // Change color on hover
            joinButton.on('pointerover', () => joinButton.setStyle({ color: '#ff0' }));
            joinButton.on('pointerout', () => joinButton.setStyle({ color: '#0f0' }));

            // Click to connect and start game
            joinButton.on('pointerdown', () => {
                for (const b of buttons) {
                    b.destroy();
                    
                }
                joinButton.destroy();
                this.create();

            });

        });


    }

    connectToServer(id) {
        socket.emit("join_room",id);
        this.scene.stop("MenuScene");
        this.scene.start('GameScene',{socket:window.socket});

    }
}


class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.n = 0;
        this.score = 0;
    }


    preload() {
        //this.load.image('logo', 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');
        this.load.image('Play_im', '/assets/star.png');
        this.load.image('bullet_im', '/assets/bomb.png');
    }

    create() {
        //console.log();
        //this.add.image(400, 300, 'logo');
        this.game_m = game_m;
        this.game_m.score = 0;
        //this.allsp = this.add.group();
        this.allsp = [];
        //this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });

        //player = this.add.sprite(300,300,"Play_im")
        //let player = new Player(200,100); instance(this,player);
        //let ball = new Bullet(10,10,100,100); instance(this,ball);
        //this.game_m.player = player;
        //this.game_m.ball = ball;


        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyL = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);

        this.input.on('pointerdown',this.click,this);

    }


    click(pointer) {
        //console.log(game_m.player.x);
        if (pointer.leftButtonDown()) {
            socket.emit("click",[pointer.x,pointer.y]);
        }
        //let b = new Bullet(game_m.player.x,game_m.player.y,pointer.x,pointer.y); instance(this,b);
    }

    instance(gam,clas) {
        clas.sprite = gam.add.sprite(clas.x,clas.y,clas.image)
        clas.sprite.setScale(2);
        //gam.game_m.sprites.push(clas);
        gam.game_m.sprites[gam.game_m.sprites.length] = clas;
    }

    update() {
        this.n++;

        if (gameState.length < this.allsp.length) {
            while (gameState.length < this.allsp.length) {
                let s = this.allsp.pop();
                s.destroy();
                s = null;

            }
        }

        if (gameState.length > this.allsp.length) { 
            for (let n = this.allsp.length; n < gameState.length; n++) {
                let i = this.add.sprite(gameState[n].x,gameState[n].y,gameState[n].image);
                //console.log(i);
                this.allsp.push(i);
            }
        }
        //console.log(gameState[0].y);
        //console.log(this.allsp[0].x);

        for (let n = 0; n < gameState.length; n++) {
            this.allsp[n].x = gameState[n].x;
            this.allsp[n].y = gameState[n].y;
            //this.allsp[n].image = gameState[n].image;
            this.allsp[n].setTexture(gameState[n].image);
        }

        if (this.n == 60) {
            let sps = [];
            for (let n = 0; n < gameState.length; n++) {
                sps[n] = {x:this.allsp[n].x,y:this.allsp[n].y,image:this.allsp[n].image}
            }
            this.n = 0;
        }
        //if (gameState) {
            //this.game_m.player.y = gameState.paddles.p1.y;
            //this.game_m.player.x = gameState.paddles.p2.x;


            //this.game_m.ball.x = gameState.ball.x;
        // this.game_m.ball.y = gameState.ball.y;
    // }
    //player.sprite.rotation += 1;
        this.scoreText.setText('Score: ' + this.game_m.score);
    //let x = 0;
        if (this.keyW.isDown) {
            // Handle space bar
            socket.emit("w",1);
            //this.game_m.player.y -= 1;
        }
        if (this.keyA.isDown) {
            // Handle space bar
            socket.emit("a",1);
        }
        if (this.keyD.isDown) {
            // Handle space bar
            socket.emit("d",1);
        }
        if (this.keyS.isDown) {
            // Handle space bar
            socket.emit("s",1);
        }
        if (this.keyL.isDown) {
            // Handle space bar
            socket.emit("leave_room");
            this.scene.start('MenuScene',{socket:window.socket});

        }

    }
}

socket.on("score_inc", () => {
  game_m.score += 10;
  console.log(game_m.score);
});





const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MenuScene,GameScene]
        //preload: preload,
       // create: create,
        //update: update
    
};

console.log("made it to end");

const game = new Phaser.Game(config);
