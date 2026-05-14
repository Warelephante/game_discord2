

export default class Player {
    constructor(x,y,id=0,game_m){
        this.x = x;
        this.y = y;
        this.width = 22;
        this.height = 23;
        this.sprite;
        this.image = "Play_im";
        this.player_id = id;
        this.dx = 0;
        this.dy = 0;
        this.game_m = game_m;
        game_m.sprites.add(this);
        game_m.player_sprites.add(this);
    }
    update(delta) {
        this.x += this.dx * delta;
        this.y += this.dy * delta;

        this.dx = 0;
        this.dy = 0;
        //this.x += 1;
        //this.y += 1;
        //this.sprite.x = this.x;
       // this.sprite.y = this.y;

    }

    kill() {
        this.game_m.sprites.remove(this);
        this.game_m.player_sprites.remove(this);
    }

}