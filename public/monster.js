function Monster(name, x, y, direction){
  this.monster_image_width = 30;
  var possible_colors = [
    "#f00",
    "#0f0",
    "#00f",
    "#a00",
    "#0a0",
    "#00a",
    "#800",
    "#080",
    "#008",
    "#600",
    "#060",
    "#006",
    "#400",
    "#040",
    "#004"
  ];
  this.score = 0;
  this.current_x = x;
  this.current_y = y;
  this.current_direction = direction;
  this.monster_set = game_field.set();
  this.name = name;
  this.color = possible_colors[parseInt(Math.random()*(possible_colors.length+1))];
  this.log_debug = false;
  
  
  this.show_monster = function() {
    this.monster_name.show();
    this.monster_img.show();
  }
  
  this.hide_monster = function() {
    this.monster_img.hide();
    this.monster_name.hide();
  }
  
  /// moving
  
  this.move = function(x, y, direction) {
    // this.draw_path(x,y,direction);
    this.show_monster();
    this.animate_monster(x,y,direction);
    this.set_current_values(x,y,direction);
    if(this.log_debug){console.log(this.name + " moved to "+this.current_x+"/"+this.current_y+" and looking to "+this.current_direction);}
  }
  
  this.draw_path = function(x,y,direction) {
    var path_to_animate_along = game_field.path("M"+this.current_x+" "+this.current_y+"L"+x+" "+y);
  }
  
  this.animate_monster = function(x,y,direction) {
    if(this.current_direction!=direction) {
      this.monster_img.rotate(direction);
      // this.monster_bg.rotate(direction);
    }
    this.monster_img.animate({x:(x-(this.monster_image_width/2)), y:(y-(this.monster_image_width/2))}, 100);
    this.monster_name.animate({x:x, y:y}, 100);
    // this.monster_bg.animate({x:x, y:y}, 100);
  }
  
  this.set_current_values = function(x,y,direction) {
    this.current_x = x;
    this.current_y = y;
    this.current_direction = direction;
  }
  
  this.shotDown = function() {
    this.hide_monster();
    this.explosion_img.attr({x: this.current_x-(this.monster_image_width/2), y:this.current_y-(this.monster_image_width/2)});
    this.explosion_img.show();
    this.explosion_img.animate({opacity: 0, scale:2}, 2000, "bounce");
  }
  
  // initialization
  
  this.init_monster_bg = function() {
    // this.monster_bg = game_field.rect(this.current_x-(this.monster_image_width/2)-10, this.current_y-(this.monster_image_width/2)-12, 20, 24);
    this.monster_bg = game_field.circle(this.current_x, this.current_y, 10);
    this.monster_bg.attr({"fill": this.color});
    this.monster_bg.attr("stroke", "white");
    // this.monster_bg.rotate(this.current_direction);
  }
  
  this.init_monster_img = function() {
    this.monster_img = game_field.image("panzer.png", this.current_x-(this.monster_image_width/2), this.current_y-(this.monster_image_width/2), this.monster_image_width, this.monster_image_width);
    this.monster_img.rotate(this.current_direction);
  }
  
  this.init_monster_name = function() {
    this.monster_name = game_field.text(this.current_x, this.current_y, this.name);
    this.monster_name.rotate(this.current_direction);
    this.monster_name.attr("fill", this.color);
    this.monster_name.attr("font", '14px "Arial"');
  }
  
  this.init_explosion_img = function() {
    this.explosion_img = game_field.image("explosion.png", this.current_x-(this.monster_image_width/2), this.current_y-(this.monster_image_width/2), this.monster_image_width, this.monster_image_width);
    this.explosion_img.hide();
  }
  
  this.initial_draw = function() {
    // this.init_monster_bg();
    this.init_monster_img();
    this.init_monster_name();
    this.init_explosion_img();
    this.move(this.current_x, this.current_y, this.current_direction);
  }
  
  
  this.initial_draw();
}
