import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import Player from './player.js';
import Bullet from './bullet.js';

import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

app.post("/exchange", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    const params = new URLSearchParams();

    params.append("client_id", process.env.DISCORD_CLIENT_ID);
    params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", process.env.DISCORD_REDIRECT_URI);

    const response = await axios.post(
      "https://discord.com/api/oauth2/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    res.json({
      access_token: response.data.access_token
    });

  } 
  catch (err) {
  console.log("STATUS:", err.response?.status);
  console.log("DATA:", err.response?.data);
  console.log("MESSAGE:", err.message);

  return res.status(500).json({
    error: err.response?.data || err.message
  });
}
});

//const app = express();


const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: "*"
  }
});

function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


class server_manager {
  constructor() {
    this.rooms = [];
    this.room_infos = [];
    this.rooms.push(new room_manager("Room 1",this));
    this.rooms.push(new room_manager("Room 2",this));
    
  }

  get_room(id) {
    for (let i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].id == id) {
        return this.rooms[i];
      }
    }
    return undefined;

  }
}

class room_manager {
    constructor(id,server_m) {
        this.id = id;
        this.x = 0;
        this.sprites = new sprite_group();
        this.player_sprites = new sprite_group();
        this.bullets = new sprite_group();
        this.players = [];
        this.sprite_infos = [];
        this.server_m = server_m;
        this.server_m.room_infos.push({id:this.id});
        //this.player;

        //let b = new Bullet(100,100,100,300);
        //this.add_to_sprites(b)
        //this.sprites.push(b);
    }

    get_player(id) {
      for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].player_id == id) {
          return this.players[i];
        }
      }
      return undefined;
    }

    remove_player(id) {
      for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].player_id == id) {
          this.players.splice(i,1);
        }
      }
    }

}

class sprite_group {
    constructor() {
        this.sprites = [];
        this.infos = [];
    }

    group_collide(group) {
      let collides = [];
      for (const s1 of this.sprites) {
        for (const s2 of group.sprites) {
          if ((s1.x+(s1.width/2) >= s2.x-(s2.width/2)) && (s1.x-(s1.width/2) <= s2.x+(s2.width/2))) {
            if ((s1.y+(s1.height/2) >= s2.y-(s2.height/2)) && (s1.y-(s1.height/2) <= s2.y+(s2.height/2))) {
              collides.push([s1,s2]);

            }
          }
        }
      }
      return collides;
    }


    update(delta) {
        for (let i = 0; i < this.sprites.length; i++ ){
            this.sprites[i].update(delta);
            
        }

        this.infos = [];
        for (let i = 0; i < this.sprites.length; i++ ){
            this.update_object(i,this.sprites[i]);
            
        }
    }

    add(i) {
      this.sprites.push(i)
      let o = {x:i.x,y:i.y,image:i.image};
      this.infos.push(o);

    }

    remove(s) {
      for (let i = 0; i < this.sprites.length; i++) {
        if (this.sprites[i] === s) {
          this.sprites.splice(i,1);
          this.infos.splice(i,1);
          //this,sprit
          break;
        }
      }

    }
    update_object(n,i) {
      let o = {x:i.x,y:i.y,image:i.image};
      this.infos[n] = o;
    }

}

let server_m = new server_manager();


let gameState = {
  ball: { x: 400, y: 300, vx: 3, vy: 3 },
  paddles: {
    p1: { y: 250 },
    p2: { y: 250 }
  }
};

io.on("connection", (socket) => {
  socket.roomid = null;

  socket.on("getrooms", () => {
    console.log("working");
    socket.emit("rooms",server_m.room_infos);
  });

  socket.on("join_room", (id) => {
    console.log("Player connected:", socket.id);
    let room = server_m.get_room(id);
    let p = new Player(100,100,socket.id,room);
    //game_m.sprites.add(p);
    room.players.push(p);
    socket.roomid = id;
    socket.join(id);
  });

  socket.on("leave_room", (id) => {
    console.log('Player disconnected:', socket.id);
    let r = server_m.get_room(socket.roomid);
    let p = server_m.get_room(socket.roomid).get_player(socket.id);
    p.kill();
    r.remove_player(socket.id);
    socket.leave(r.id);
    socket.roomid = null;
  });

  socket.on("w", (data) => {
    let p = server_m.get_room(socket.roomid).get_player(socket.id);
    p.dy = -80;
  });

  socket.on("d", (data) => {
    let p = server_m.get_room(socket.roomid).get_player(socket.id);
    p.dx = 80;
  });

  socket.on("s", (data) => {
    let p = server_m.get_room(socket.roomid).get_player(socket.id);
    p.dy = 80;
  });

  socket.on("a", (data) => {
    let p = server_m.get_room(socket.roomid).get_player(socket.id);
    p.dx = -80;
  });

  socket.on("click", (data) => {
    let p = server_m.get_room(socket.roomid).get_player(socket.id);

    let b = new Bullet(p.x,p.y,data[0],data[1],socket.id,server_m.get_room(socket.roomid));
    //game_m.sprites.add(b);
    setTimeout(() => {  
        b.kill();
        b = undefined;
    }, 3000); 
  });

  socket.on("test", (msg) => {
    console.log("Got message:", msg);
  });

  
  socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
      if (socket.roomid != null) {
        let r = server_m.get_room(socket.roomid)
        let p = server_m.get_room(socket.roomid).get_player(socket.id);
        p.kill();
        r.remove_player(socket.id);
        socket.leave(r.id);
        socket.roomid = null;
      }
      //game_m.get_player(socket.id).kill();
      //game_m.remove_player(socket.id);
      
      // 1. Remove player from server data structure
      //delete players[socket.id];
      
      // 2. Broadcast to all clients to remove this player
      io.emit('playerDisconnected', socket.id);
  }); 
});

let lastTime = Date.now();

setInterval(() => {
  const now = Date.now();
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  for (const r of server_m.rooms) {
    r.sprites.update(delta);
    let c = r.player_sprites.group_collide(r.bullets);
  
    for (const col of c) {
      if (col[0].player_id != col[1].sender) {
        io.to(col[1].sender).emit('score_inc');
        col[1].kill();
        //console.log(c);
      }
    }
    io.to(r.id).emit("state", r.sprites.infos);

  }
  //io.emit("state", game_m.sprites.infos);
}, 1000 / 60);

//server.listen(3000, () => {
  //console.log("Server running on port 3000");
//});

const clientPath = path.join(__dirname, "../client/dist");

app.use(express.static(clientPath));

app.use((req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


//const port = process.env.PORT || 10000;
//server.listen(port, '0.0.0.0', () => {
  //console.log(`Server running oon port ${port}`);
//});

