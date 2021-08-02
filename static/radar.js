document.addEventListener("DOMContentLoaded", init_canvas(), false);
document.addEventListener("DOMContentLoaded", set_up_radars(), false);

// global variables
var ctx_canvas;
var canvas
const radars_list = []
var port_img = new Image(60, 45)
var state_change = false
var port_image_is_ready = false

port_x_i = 500
port_y_i = 300
port_x_w = 1100
port_y_w = 500

port_img.onload = update_image_state
port_img.src = "https://imagenespluma.s3.sa-east-1.amazonaws.com/Puerto.png"



function update_image_state() {
    port_image_is_ready = true
    state_change = true
}

function draw_port(){
    ctx_canvas.drawImage(port_img, canvas.width/5, (canvas.height * 3)/5, (canvas.width* 4)/6, 300)
}


function init_canvas() {
    canvas = document.getElementById("canvas_id")
    // port_img = document.getElementById("port_img_id")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    ctx_canvas = canvas.getContext("2d")

    ctx_canvas.fillStyle = "#234449";
    ctx_canvas.fillRect(0, 0, canvas.width, canvas.height);

    // ctx_canvas.drawImage(port_img, 100, 100, 100, 100);
    ctx_canvas.fill()
    setTimeout(draw_scenario, 1000);
}

function set_up_radars() {
    console.log("setup_radars")
}

class Radar{
    constructor(position_x, position_y, radar_id){
        this.position_x = position_x
        this.position_y = position_y
        this.radar_id = radar_id
    }
}


class Ship{
    constructor(radars_list, img_ship){
        this.radars_list = radars_list
        this.ship_img = new Image()
        this.ship_img.onload = this.update_image_state_method
        this.image_ready = false
        this.ship_img.src = img_ship
    }

    set img_ready(img_ready_){
        this.image_ready = img_ready_
    }
    get img_ready(){
        return self.image_ready
    }

    update_image_state_method() {
        console.log("ship image_ready")
        this.img_ready = true
        console.log(this.img_ready)
        state_change = true
    }

    draw(){
        ctx_canvas.drawImage(this.ship_img, port_x_i, port_y_i, port_x_w, port_y_w)
    }

    sate_change(){return this.state_change}

}


// ship = new Ship(radars_list, "https://drive.google.com/file/d/1z2Xy-MXkBxykoA-LpCqPHl3GFUiunLt-/view?usp=sharing")

function draw_scenario(){
    draw_port()
    //ship.draw()
}

//function animate(){
//    requestAnimationFrame(animate)
    // if(state_change){
//        state_change = false
//        draw_scenario()
    // }https://imagenespluma.s3.sa-east-1.amazonaws.com/Puerto.png
//}