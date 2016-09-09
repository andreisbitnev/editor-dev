function page_module(canvas_fsm, tub, json_object){

    if(Object.prototype.toString.call( json_object ) === '[object Array]') {
    	
    	//console.log('page_module() added multiple pages');
    	
        // multiple
        json_object.forEach( function (item) {
            // object init
            canvas_fsm.addShape(new Page(canvas_fsm, tub, item));
            
			console.log(item);
        });

    }else{
        // Is single
        //console.log('page_module() added single page');
		//console.log(json_object);
        
        canvas_fsm.addShape(new Page(canvas_fsm, tub, json_object));
    }

}



// Constructor for Shape objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.
function Page(canvas_state, tub, json_object){
    "use strict";
    // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
    // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
    // But we aren't checking anything else! We could put "Lalala" for the value of x
    
    
    this.page_item_type = 'Page';
    this.canvas_state = canvas_state;
    this.tub = tub;
    this.json_object = json_object
    // pull vals from json_object
    
    
    this.page_width = parseFloat(this.tub['page_info']['PageWidth']);
    this.page_height = parseFloat(this.tub['page_info']['PageHeight']);
    ////console.log('PAGE= '+page_width+', '+page_height);

    //Transform from cartesian coordinates to top left is 0,0
//    this.center_x_coord = $(window).width()/2;
//    this.center_y_coord = $(window).height()/2;
    this.page_border = 0;
    this.center_x_coord = (this.page_width/2) +this.page_border;
    this.center_y_coord = (this.page_height/2) +this.page_border;

    //console.log('Page module - single page...');

    // single
    this.page_name = this.json_object['@attributes'].Name;
    this.geometric_bounds = this.json_object['@attributes'].GeometricBounds;
    this.item_transform = this.json_object['@attributes'].ItemTransform;

    // console.log('page_transform: '+this.item_transform);

    this.geometric_bounds = this.geometric_bounds.split(" ");
    this.item_transform = this.item_transform.split(" ");
}

// Draws this shape to a given context
Page.prototype.draw = function(ctx){
    "use strict";

    // Draw the page

    // Single page hard coded stary vals, change later once zoom function etc applies
    var start_x = parseFloat(Math.round(this.item_transform[4]));
    var start_y = 0;

    ctx.fillStyle = "rgba(255,255,255,1)"; // White
    ctx.fillRect(start_x, start_y, this.page_width, this.page_height);




	// Draw the margins and columns
	
	// top-bottom = #ff4fff
	// sides = #9933ff
	
	
	/***********************************************************************/
	
	var margin_preferences = this.json_object.MarginPreference['@attributes'];
	
	var column_count = Math.round(margin_preferences.ColumnCount);
	var gutter_width = Math.round(margin_preferences.ColumnGutter);
	
	var verticle_lines_to_draw = column_count*2;
	var coulmn_width = this.page_width - (parseFloat(margin_preferences.Left)+parseFloat(margin_preferences.Right));
	coulmn_width -= ((column_count-1)*gutter_width);	
	coulmn_width = coulmn_width/column_count;
		
	ctx.beginPath();

	// TOP
	ctx.moveTo(start_x+parseFloat(margin_preferences.Left), margin_preferences.Top);
	ctx.lineTo(start_x+(this.page_width - margin_preferences.Left), margin_preferences.Top);
	
	// BOTTOM
	ctx.moveTo(start_x+parseFloat(margin_preferences.Left), this.page_height - margin_preferences.Top);
	ctx.lineTo(start_x+(this.page_width - margin_preferences.Left), this.page_height - margin_preferences.Top);

	
	ctx.strokeStyle = "rgba(255,68,255,1)"; // Pink     '#ff44ff';
	ctx.lineWidth="1";
	ctx.stroke();
	ctx.closePath();
	
	
	
	// COLUMNS
	var column_x_val = start_x+parseFloat(margin_preferences.Left);
	var add_column_or_gutter_width = '';
	
	ctx.beginPath();
	for(var i=0; i < verticle_lines_to_draw; i++){

		// console.log('Line '+i+' = '+column_x_val);

		if(add_column_or_gutter_width == ''){ // First time
			add_column_or_gutter_width = 'col';
			
		}else if(add_column_or_gutter_width == 'col'){
			
			column_x_val = parseFloat(column_x_val) + parseFloat(coulmn_width);
			add_column_or_gutter_width = 'gut';
			
		}else if(add_column_or_gutter_width == 'gut'){

			column_x_val = parseFloat(column_x_val) + parseFloat(gutter_width);
			add_column_or_gutter_width = 'col';
			
		}

		
		ctx.moveTo(column_x_val, margin_preferences.Top);
		ctx.lineTo(column_x_val, this.page_height - margin_preferences.Top);
	}
	ctx.strokeStyle = '#9933ff';
	ctx.stroke();
	ctx.closePath();
	

	
	
	
	
	
	// Draw line down right-hand side of the page (so multiple pages are distinguishable)
	ctx.save();
	
	
	ctx.beginPath();
	ctx.moveTo(parseFloat(start_x)+parseFloat(this.page_width), 0);
	ctx.lineTo(parseFloat(start_x)+parseFloat(this.page_width), this.page_height);
	
	ctx.strokeStyle = '#606060';
	ctx.stroke();
	ctx.closePath();
	
	ctx.restore();
		    
		    
		    
		    
		    
		    
    // Debugging info
    ctx.fillStyle = "rgba(0,0,0,1)"; // Black
    ctx.fillText('page_name: '+this.page_name, start_x+10, start_y+10);
    ctx.fillText('start_x: '+start_x, start_x+10, start_y+20);
    ctx.fillText('start_y: '+start_y, start_x+10, start_y+30);
    ctx.fillText('page_width: '+this.page_width, start_x+10, start_y+40);
    ctx.fillText('page_height: '+this.page_height, start_x+10, start_y+50);

};


Page.prototype.draw_selection = function(ctx){
    // Page has no selectable handles
    return false;
}

Page.prototype.draw_alt_selection = function(ctx){
	//console.log('Oval alt selection');
    return false;
};


Page.prototype.resize = function(current_state, mouse_x, mouse_y, oldx, oldy){
	// return false for now but this will be called from the toolbox 
	return false;
}

Page.prototype.contains = function(mouse_x, mouse_y) {
    "use strict";

	// Page has no selection so this also returns false
	return false;
};


