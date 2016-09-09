function oval_module(canvas_fsm, tub, json_object){

    if(Object.prototype.toString.call( json_object ) === '[object Array]') {
        // multiple
        json_object.forEach( function (item) {
            // object init
            canvas_fsm.addShape(new Oval(canvas_fsm, tub, item));
        });

    }else{
        // Is single
        console.log('added oval');
        canvas_fsm.addShape(new Oval(canvas_fsm, tub, json_object));
    }

}





// Constructor for Shape objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.
function Oval(canvas_state, tub, json_object){
	
	
	
	
    "use strict";

    this.canvas_state = canvas_state;
    this.tub = tub;
    this.json_object = json_object


    console.log(this.json_object);
    this.item_transform = this.json_object['@attributes'].ItemTransform;
    this.item_transform = this.item_transform.split(" ");

    this.x = this.item_transform[4];
    this.y = this.item_transform[5];
    
    this.w = this.h = 0; // The W and H is calculated for the selction box, based on point path values
    this.radius = 20;
    this.fill = '#AAAAAA';


    //console.log('item_transform: '+item_transform);
    //console.log('----------------------------------------------------');
    //console.log('COLOUR='+json_object['@attributes'].FillColor);


    this.page_width = parseFloat(this.tub['page_info'][0].PageWidth);
    this.page_height = parseFloat(this.tub['page_info'][0].PageHeight);
    this.page_center_x_coord = (this.page_width/2);
    this.page_center_y_coord = (this.page_height/2);


    
    //console.log('Offset = '+offset_x+', '+offset_y);

    console.log('----------------------------------------------------');

	// Page transform...
    // this.page_x_offset = 0;// parseFloat(-297.637795276);
    // this.page_y_offset = 0;// parseFloat(-420.944881889);
    
    // DEAL WITH PAGES DIFFERENTLY LATER...!
    
    
    this.first_x = this.first_y = this.max_x = this.max_y =0;
    this.selection_x = this.selection_y = 0;
    
}

// Draws this shape to a given context
Oval.prototype.draw = function(ctx){
    "use strict";
	
	
	
    this.w = (this.radius*2) || 1;
    this.h = (this.radius*2) || 1;
	
	// var radius = 70;
	var i, cur, half;
	
	ctx.beginPath();
	ctx.arc(this.x+this.radius, this.y+this.radius, this.radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = this.fill;
	ctx.fill();
    
	
	
	/***************************************************************


	// console.log('draw() x/y '+this.x+'/'+this.y);

    // draw the actual shape
    var i, cur, half, path_point, index, start_x, start_y;
    
    index = start_x = start_y = 0;
    this.first_x = this.first_y = this.max_x = this.max_y =0;
                
    // ctx.fillStyle = this.fill;
    //ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.beginPath();

    var first_flag = true;
    this.json_object.Properties.PathGeometry.GeometryPathType.PathPointArray.PathPointType.forEach( function (item) {

        path_point = item['@attributes'].Anchor;
        path_point = path_point.split(" ");

        start_x = parseFloat(this.page_center_x_coord) + parseFloat(path_point[0]);
        //var start_y = this.page_center_y_coord + parseFloat(path_point[1]) + (this.page_height*parseInt(this.tub['page_info'][1].SpreadCount));
        start_y = parseFloat(this.page_center_y_coord) + parseFloat(path_point[1]);

		//console.log('X,Y points =   '+path_point[0]+', '+path_point[1]);



        // Apply ItemTransform offset
        start_x = parseFloat(start_x) + parseFloat(this.x);
        start_y = parseFloat(start_y) + parseFloat(this.y);


		// simple version for now to save time...
		//
		// dynamically calculate the size the selection box needs to be based on the path points...
		// store the highest val and the lowest val and then subtract one from the other
		//
		if(start_x > this.max_x){ this.max_x = start_x; }
		if(start_y > this.max_y){ this.max_y = start_y; }
		if(first_flag){
			this.first_x = start_x;
			this.first_y = start_y;
			
			// Storing the unaltered PathPoint value...
			this.selection_x = parseFloat(path_point[0]);
			this.selection_y = parseFloat(path_point[1]);
			
			first_flag = false;
		}
		

		// console.log('Start_X cxc, pp, x =   '+this.page_center_x_coord+', '+path_point[0]+', '+this.x);
		// console.log('Start_Y cyc, pp, y =   '+this.page_center_y_coord+', '+path_point[1]+', '+this.y);
		// console.log('X,Y start =   '+start_x+', '+start_y);
		//console.log('');
		
        ctx.lineTo(start_x, start_y);
        ctx.fillText(index.toString()+' x,y: '+Math.round(start_x)+', '+Math.round(start_y), start_x+5, start_y-5);
        index++;
        
    }, this);// this passes the scope of this to the anonymous function





	this.w = parseFloat(this.max_x) - parseFloat(this.first_x);
	this.h = parseFloat(this.max_y) - parseFloat(this.first_y);







    ctx.closePath();
	ctx.lineWidth="2";
    ctx.strokeStyle = '#000';
    ctx.stroke();
    
    
/***************************************************************/
		    
};

Oval.prototype.draw_selection = function(ctx){
	
	
	var calc_x = calc_y = 0; 
    // calc_x = parseFloat(this.selection_x)+parseFloat(this.page_center_x_coord)+parseFloat(this.tub['ruler_offsetX']);
    // calc_y = parseFloat(this.selection_y)+parseFloat(this.page_center_y_coord)+parseFloat(this.tub['ruler_offsetY']);
        
        
    calc_x = parseFloat(this.selection_x)+parseFloat(this.page_center_x_coord)+parseFloat(this.x);
    calc_y = parseFloat(this.selection_y)+parseFloat(this.page_center_y_coord)+parseFloat(this.y);
        
    // console.log('Selection box X = '+this.x+', '+this.page_center_x_coord+', '+this.tub['ruler_offsetX']);
    // console.log('First x,y / Max x,y = '+this.first_x+', '+this.first_y+' / '+this.max_x+', '+this.max_y);
    
    
	//
	//------------------------------------------------------
    //------------------------------------------------------
    // Draw hitbox - development only
    //
    
	// ctx.lineWidth="0.5";
	// ctx.strokeStyle="blue";
	// ctx.rect(calc_x, calc_y, this.w, this.h);
	// ctx.fillText('x,y: '+Math.round(calc_x)+', '+Math.round(calc_y), calc_x+5, calc_y-15);
	// ctx.fillText('w,h: '+Math.round(this.w)+', '+Math.round(this.h), calc_x+5, calc_y-5);
	// ctx.stroke();
	
	// console.log('Hitbox dimensions x = '+this.x+' / '+this.page_center_x_coord+' / '+this.tub['ruler_offsetX']);
	// console.log('Hitbox dimensions y = '+this.y+' / '+this.page_center_y_coord+' / '+this.tub['ruler_offsetY']);
	//console.log('Hitbox dimensions x,y / w,h = '+calc_x+', '+calc_y+' / '+this.w+', '+this.h);
	
	// 
    //------------------------------------------------------
    //------------------------------------------------------
	//    

    // Draw selection box
    if (this.canvas_state.selection === this) {

    	// the selection Rectangle
        ctx.strokeStyle = this.canvas_state.selection_color;
        ctx.lineWidth = this.canvas_state.selection_width;
        ctx.strokeRect(calc_x,calc_y,this.w,this.h);



        // draw the selection boxes
        half = this.canvas_state.selection_boxsize / 2;

        // 0  1  2
        // 3     4
        // 5  6  7

        // top left, middle, right
        this.canvas_state.selection_handles[0].x = calc_x-half;
        this.canvas_state.selection_handles[0].y = calc_y-half;

        this.canvas_state.selection_handles[1].x = calc_x+this.w/2-half;
        this.canvas_state.selection_handles[1].y = calc_y-half;

        this.canvas_state.selection_handles[2].x = calc_x+this.w-half;
        this.canvas_state.selection_handles[2].y = calc_y-half;

        //middle left
        this.canvas_state.selection_handles[3].x = calc_x-half;
        this.canvas_state.selection_handles[3].y = calc_y+this.h/2-half;

        //middle right
        this.canvas_state.selection_handles[4].x = calc_x+this.w-half;
        this.canvas_state.selection_handles[4].y = calc_y+this.h/2-half;

        //bottom left, middle, right
        this.canvas_state.selection_handles[6].x = calc_x+this.w/2-half;
        this.canvas_state.selection_handles[6].y = calc_y+this.h-half;

        this.canvas_state.selection_handles[5].x = calc_x-half;
        this.canvas_state.selection_handles[5].y = calc_y+this.h-half;

        this.canvas_state.selection_handles[7].x = calc_x+this.w-half;
        this.canvas_state.selection_handles[7].y = calc_y+this.h-half;

		// Draw each little box
        ctx.fillStyle = this.canvas_state.selectionBoxColor;
        for (i = 0; i < 8; i += 1) {
            cur = this.canvas_state.selection_handles[i];
            ctx.fillRect(cur.x, cur.y, this.canvas_state.selection_boxsize, this.canvas_state.selection_boxsize);
        }
    }
};

Oval.prototype.draw_alt_selection = function(ctx){
	console.log('Oval alt selection');
};

Oval.prototype.resize = function(current_state, mouse_x, mouse_y, oldx, oldy){
	return false;
};


// Determine if a point is inside the shape's bounds
Oval.prototype.contains = function(mouse_x, mouse_y) {
    "use strict";
    // All we have to do is make sure the Mouse X,Y fall in the area between
    // the shape's X and (X + Height) and its Y and (Y + Height)
    
    //
    // USE parseFloat() WHEN ADDING BUMBERS BECAUSE + CONCATS THEM AS A STRING
    //
    
	var calc_x = calc_y = 0; 
    calc_x = parseFloat(this.selection_x)+parseFloat(this.page_center_x_coord)+parseFloat(this.x);
    calc_y = parseFloat(this.selection_y)+parseFloat(this.page_center_y_coord)+parseFloat(this.y);
    
    /************
    console.log('mouse x/y '+mouse_x+' '+mouse_y);
    console.log((calc_x <= mouse_x));
    console.log((parseFloat(calc_x) + parseFloat(this.w) >= mouse_x));
    console.log('shape calc x/y '+calc_x+' '+calc_y);
    console.log('shape w/h  '+this.w+' '+this.h);
    console.log((calc_y <= mouse_y));
    console.log((parseFloat(calc_y) + parseFloat(this.h) >= mouse_y));
    /************/
    
    if(		(calc_x <= mouse_x) && 
    		(parseFloat(calc_x) + parseFloat(this.w) >= mouse_x) && 
    		
    		(calc_y <= mouse_y) && 
    		(parseFloat(calc_y) + parseFloat(this.h) >= mouse_y)
    ){
            console.log('rectangle contains');	
    }
    
    return  (calc_x <= mouse_x) && 
    		(parseFloat(calc_x) + parseFloat(this.w) >= mouse_x) && 
    		
    		(calc_y <= mouse_y) && 
    		(parseFloat(calc_y) + parseFloat(this.h) >= mouse_y);
            
};
