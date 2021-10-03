document.addEventListener("DOMContentLoaded", init_canvas(), false);
document.addEventListener("DOMContentLoaded", set_up_radars(), false);

// global variables
var ctx_canvas;
var canvas
const radars_list = []
var port_img = new Image(60, 45)
var ship_img = new Image(60, 45)
var wind_img = new Image(60, 45)
var wind_rose_img = new Image(60, 45)
var start_button_img = new Image(60, 45)
var state_change = false
var port_image_is_ready = false
var wind_img_is_ready = false
var start_button_is_ready = false
var wind_rose_img_is_ready = false
var startTime = new Date();

var button_text = "no inicializado"


port_x_i = 500
port_y_i = 300
port_x_w = 1100
port_y_w = 500

distance_warning = 3.0
distance_alarm = 5.0

wind_magnitude_warning = 9.0
wind_magnitude_alarm = 12.0

port_img.onload = update_image_state
port_img.src = "https://imagenespluma.s3.sa-east-1.amazonaws.com/Muelle.png"

ship_img.onload = update_ship_image_state
ship_img.src = "https://imagenespluma.s3.sa-east-1.amazonaws.com/barco.png"

ship_img.onload = update_wind_image_state
wind_img.src =  "https://imagenespluma.s3.sa-east-1.amazonaws.com/Viento.png"

wind_rose_img.onload = update_wind_rose_image_state
wind_rose_img.src =  "https://imagenespluma.s3.sa-east-1.amazonaws.com/Rosa+de+los+Vientos_B.png"

wind_rose_img.onload = update_start_button_image_state
start_button_img.src = "https://imagenespluma.s3.sa-east-1.amazonaws.com/Boton+Inicio.png"

function update_start_button_image_state(){
    start_button_is_ready = true
}

function update_wind_rose_image_state(){
    wind_rose_img_is_ready = true
}

function update_wind_image_state(){
    wind_img_is_ready = true
}

function update_image_state() {
    port_image_is_ready = true
    state_change = true
}

function update_ship_image_state() {
    ship_image_is_ready = true
    state_ship_change = true
}

function draw_port(){
    ctx_canvas.drawImage(port_img, 500 , (canvas.height * 3)/5, 600, 150)
}

function draw_wind_rose(){
    ctx_canvas.drawImage(wind_rose_img, 10 , 10, 150, 150)
}


function draw_ship(radar1, radar2, timeDiff){
    var px_per_mt = 10
    var angle = Math.atan(Math.abs(radar1-radar2)*px_per_mt/360.0)  // 360 is the amount of pixels between dolphins
    var height_from_dolphin_left = 220.0 * Math.tan(angle) + Math.min(radar1, radar2)*px_per_mt

    if(radar2>radar1){
        angle = -Math.atan(Math.abs(radar1-radar2)*px_per_mt/360.0)  // 360 is the amount of pixels between dolphins
        height_from_dolphin_left = ( -220.0 * Math.tan(angle) + Math.min(radar1, radar2)*px_per_mt)
    }
    // console.log(angle, radar1, radar2, height_from_dolphin_left)

    ctx_canvas.translate(400 + 400 , 350)
    ctx_canvas.rotate(angle)
    ctx_canvas.translate(-(400 + 400) , -350)

    ctx_canvas.drawImage(ship_img, 400 , 210 - height_from_dolphin_left, 800, 150)

    ctx_canvas.translate(400 + 400 , 350)
    ctx_canvas.rotate(-angle)
    ctx_canvas.translate(-(400 + 400) , -350)

    ctx_canvas.lineWidth = 8
    ctx_canvas.strokeStyle = "#FFFFFF"

    ctx_canvas.beginPath();
    ctx_canvas.moveTo(620, 360);
    ctx_canvas.lineTo(620, 360 - radar1 * px_per_mt);
    ctx_canvas.closePath();
    ctx_canvas.stroke();
    ctx_canvas.strokeStyle = "#FFFFFF"


    ctx_canvas.beginPath();
    ctx_canvas.moveTo(980, 360);
    ctx_canvas.lineTo(980, 360 - radar2 * px_per_mt);
    ctx_canvas.closePath();
    ctx_canvas.stroke();



    ctx_canvas.beginPath();
    ctx_canvas.arc(545, 385, 35, 0, 2 * Math.PI, false)
    ctx_canvas.fillStyle = "#5fcd50"
    if(radar1 > distance_alarm){
        ctx_canvas.fillStyle = "#f32122"
    }
    else if(radar1 > distance_warning){
        ctx_canvas.fillStyle = "#dc9819"
    }
    ctx_canvas.fill()
    ctx_canvas.lineWidth = 3
    ctx_canvas.strokeStyle = "#FFF"

    ctx_canvas.stroke()
    ctx_canvas.fillStyle = "black";
    ctx_canvas.font = "22px Arial";
    ctx_canvas.fillText(radar1.toString(), 532, 380);
    ctx_canvas.fillText("[m]", 532, 400);


    ctx_canvas.beginPath();
    ctx_canvas.arc(1050, 385, 35, 0, 2 * Math.PI, false)
    ctx_canvas.fillStyle = "#5fcd50"
    if(radar2 > distance_alarm){
        ctx_canvas.fillStyle = "#f32122"
    }
    else if(radar2 > distance_warning){
        ctx_canvas.fillStyle = "#dc9819"
    }
    ctx_canvas.fill()
    ctx_canvas.lineWidth = 3
    ctx_canvas.strokeStyle = "#FFF"
    ctx_canvas.stroke()

    ctx_canvas.fillStyle = "black";
    ctx_canvas.font = "22px Arial";
    ctx_canvas.fillText(radar2.toString(), 1035, 380);
    ctx_canvas.fillText("[m]", 1035, 400);
}


function draw_wind(anemometer_magnitude, anemometer_angle, timeDiff){
    // ctx_canvas.beginPath()
    // ctx_canvas.rotate(radar2)

    ctx_canvas.translate(1400,500)
    ctx_canvas.rotate( anemometer_angle * Math.PI / 180 + 187.5 * Math.PI / 180)
    ctx_canvas.translate(-1400,-500)

    ctx_canvas.drawImage(wind_img, 1300 ,400, 200, 200)

    ctx_canvas.translate(1400,500)
    ctx_canvas.rotate( -anemometer_angle * Math.PI / 180 - 187.5 * Math.PI / 180)
    ctx_canvas.translate(-1400,-500)

    ctx_canvas.beginPath();
    ctx_canvas.arc(1400, 500, 50, 0, 2 * Math.PI, false)
    ctx_canvas.fillStyle = "#5fcd50"
    if(anemometer_magnitude > wind_magnitude_alarm){
        ctx_canvas.fillStyle = "#f32122"
    }
    else if(anemometer_magnitude > wind_magnitude_warning){
        ctx_canvas.fillStyle = "#dc9819"
    }
    ctx_canvas.fill()

    ctx_canvas.fillStyle = "white";
    ctx_canvas.font = "30px Arial";
    ctx_canvas.fillStyle = "#000"
    if(anemometer_magnitude > wind_magnitude_alarm){
        // ctx_canvas.fillStyle = "#F11"
    }
    else if(anemometer_magnitude > wind_magnitude_warning){
        // ctx_canvas.fillStyle = "#DD1"
    }
    ctx_canvas.fillText(anemometer_magnitude.toString(), 1375, 495);
    ctx_canvas.font = "25px Arial";
    ctx_canvas.fillText("[m/s]", 1370, 520);

    // ctx_canvas.drawImage(wind_img, 1500 ,450, 100, 100)
}

function draw_button(button_text){
    ctx_canvas.drawImage(start_button_img, 750 ,450, 125, 85)
    ctx_canvas.font = "28px Arial";
    if(button_text == "Iniciar"){
        ctx_canvas.fillText(button_text, 775, 500);
    }
    else if(button_text == "Finalizar"){
        ctx_canvas.fillText(button_text, 761, 500);
    }
    else{
        ctx_canvas.fillText("draw button no that text option", 770, 500);
    }

}

function set_up_radars() {
    console.log("setup_radars")
}

function draw_scenario(radar1, radar2, anemometer_magnitude, anemometer_angle, timeDiff, button_text){
    ctx_canvas.clearRect(0, 0, canvas.width, canvas.height);
    ctx_canvas.fillStyle = "#222222";
    ctx_canvas.fillRect(0, 0, canvas.width, canvas.height);
    ctx_canvas.fill()
    draw_port()
    draw_wind_rose()
    draw_ship(radar1, radar2, timeDiff)
    draw_button(button_text)
    draw_wind(anemometer_magnitude, anemometer_angle, timeDiff)
}

function anemometer_notation(anemometer_angle){
    if(anemometer_angle > 327 || anemometer_angle < 22){
        return "Norte"
    }
    else if(anemometer_angle > 22 || anemometer_angle < 68){
        return "Noreste"
    }
    else if(anemometer_angle > 68 || anemometer_angle < 113){
        return "Este"
    }
    else if(anemometer_angle > 113 || anemometer_angle < 158){
        return "Sureste"
    }
    else if(anemometer_angle > 158 || anemometer_angle < 202){
        return "Sur"
    }
    else if(anemometer_angle > 202 || anemometer_angle < 248){
        return "Sureste"
    }
    else if(anemometer_angle > 248 || anemometer_angle < 293){
        return "Oeste"
    }
    else{
        return "Noroeste"
    }
}

function get_data(){
    var current_time = new Date()
    var timeDiff = current_time - startTime
    $.getJSON('http://192.168.0.119:5678/get_last_state', function(data) {
        radar1 = data["radar1"]
        radar2 = data["radar2"]
        anemometer_angle = data["anemometer_angle"]
        anemometer_angle_magnitude = data["anemometer_magnitude"]
        button_text = data["button_sate_text"]

        radar1 = ((Math.sin(timeDiff/2000)+1) * 4).toFixed(1)
        radar2 = ((Math.cos(timeDiff/2000)+1) * 4).toFixed(1)
        anemometer_angle = Math.trunc( 15*Math.cos(timeDiff/3000) ) %360

        anemometer_angle_magnitude = ((Math.cos(timeDiff/2000)+3) * 4).toFixed(1)
        sea_notation = anemometer_notation(anemometer_angle)

        draw_scenario(radar1, radar2, anemometer_angle_magnitude, anemometer_angle, timeDiff, button_text)

        element = document.getElementById("radar1");
        element.innerHTML = radar1 + " mts";

        element = document.getElementById("radar2");
        element.innerHTML = radar2 + " mts";

        element = document.getElementById("anemometer_angle");
        element.innerHTML =  anemometer_angle.toString() + " º " + sea_notation;

        element = document.getElementById("anemometer_magnitude");
        element.innerHTML =  anemometer_angle_magnitude.toString() + " m/s";
    });
    setTimeout(get_data, 100)
}



//Function to get the mouse position
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}
//Function to check whether a point is inside a rectangle
function isInside(pos, rect){
    return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
}

//The rectangle should have x,y,width,height properties
var rect = {
    x:630,
    y:380,
    width:120,
    height:80
};
//Binding the click event on the canvas


document.documentElement.webkitRequestFullScreen();

function init_canvas() {
    canvas = document.getElementById("canvas_id")
    canvas.addEventListener('click', function(evt) {
        var mousePos = getMousePos(canvas, evt);
        console.log(mousePos)
        if (isInside(mousePos,rect)) {
            $.getJSON('http://192.168.0.119:5678/get_button', function(data) {
                console.log("button sent")
             });
        }
    }, false);
    // port_img = document.getElementById("port_img_id")
    canvas.width = 1660
    canvas.height = 600
    ctx_canvas = canvas.getContext("2d")

    ctx_canvas.fillStyle = "#222222";
    ctx_canvas.fillRect(0, 0, canvas.width, canvas.height);

    // ctx_canvas.drawImage(port_img, 100, 100, 100, 100);
    ctx_canvas.fill()
    setTimeout(draw_scenario, 1000);
}


/*
$("#menu-toggle").click(function(e) {
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
});
*/

screen.orientation.lock('landscape');
setTimeout(function(){ get_data() }, 100);