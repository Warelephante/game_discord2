export default class Bullet {
    constructor(x,y,tx,ty,sender_id,game_m){
        this.x = x;
        this.y = y;
        this.width = 14;
        this.height = 14;
        this.speed = 250;
        this.image = "bullet_im";
        this.sender = sender_id
        this.game_m = game_m;
        this.game_m.sprites.add(this);
        this.game_m.bullets.add(this);

        let angle = Math.atan2(ty-y,tx-x);

        this.dx = this.speed*Math.cos(angle);
        this.dy = this.speed*Math.sin(angle);
    }

    kill() {
        this.game_m.sprites.remove(this);
        this.game_m.bullets.remove(this);
    }

    update(delta) {
        
        this.x += this.dx * delta;
        this.y += this.dy * delta;



        //this.sprite.x = this.x;
        //this.sprite.y = this.y;

    }
}