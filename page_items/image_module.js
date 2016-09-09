// THIS IS USED FROM WITHIN RECTANGLE

function image_module(canvas_fsm, tub, json_object){

    if(Object.prototype.toString.call( json_object ) === '[object Array]') {
        // multiple
        json_object.forEach( function (item) {
            // object init
            canvas_fsm.addShape(new Image(canvas_fsm, tub, item));
        });

    }else{
        // Is single
        console.log('added image');
        canvas_fsm.addShape(new Image(canvas_fsm, tub, json_object));
    }

}




function Image(canvas_state, tub, json_object){
    "use strict";
    
    this.canvas_state = canvas_state;
    this.tub = tub;
    this.json_object = json_object
    // pull vals from json_object
    
    console.log(this.json_object);
    
    
    

    
    
    
    //
    // STROKE 
    //
    this.item_transform = this.json_object['@attributes'].ItemTransform;
    this.item_transform = this.item_transform.split(" ");

    this.item_transform_x = this.item_transform[4];
    this.item_transform_y = this.item_transform[5];
    this.x = this.y = this.w = this.h = 0; // The W and H is calculated for the selction box, based on point path values
    
    

    this.page_width = parseFloat(this.tub['page_info']['PageWidth']);
    this.page_height = parseFloat(this.tub['page_info']['PageHeight']);
    this.page_center_x_coord = (this.page_width/2);
    this.page_center_y_coord = (this.page_height/2);


    // DEAL WITH PAGES DIFFERENTLY LATER...!
    
    this.first_x = this.first_y = this.max_x = this.max_y =0;
    this.selection_x = this.selection_y = 0;

}



// Draws this shape to a given context
Image.prototype.draw = function(ctx){
    "use strict";
    // ctx.save();

    // draw the actual shape
    var i, cur, half, path_point, index, start_x, start_y;
    
    index = start_x = start_y = 0;
    this.first_x = this.first_y = this.max_x = this.max_y =0;
                

	console.log(this.json_object);
	// console.log(this.json_object['@attributes'].ItemTransform);
	// console.log(this.json_object.Properties.PathGeometry.GeometryPathType.PathPointArray.PathPointType[0]['@attributes'].Anchor);






	
	this.w = parseFloat(this.max_x) - parseFloat(this.first_x);		
	this.h = parseFloat(this.max_y) - parseFloat(this.first_y);


   	// ctx.restore();
};




Image.prototype.draw_selection = function(ctx){
    "use strict";

	
	var calc_x, calc_y, half;
    calc_x = parseFloat(this.x) + parseFloat(this.selection_x)+parseFloat(this.page_center_x_coord)+parseFloat(this.item_transform_x) - parseFloat(this.page_width/2);
    calc_y = parseFloat(this.y) + parseFloat(this.selection_y)+parseFloat(this.page_center_y_coord)+parseFloat(this.item_transform_y);
        
	//
	//------------------------------------------------------
    //------------------------------------------------------
    // Draw hitbox - development only
    //
    
    // ctx.save();
	// ctx.lineWidth="0.5";
	// ctx.strokeStyle="blue";
	// ctx.rect(calc_x, calc_y, this.w, this.h);
	// ctx.fillText('x,y: '+Math.round(calc_x)+', '+Math.round(calc_y), calc_x+5, calc_y-15);
	// ctx.fillText('w,h: '+Math.round(this.w)+', '+Math.round(this.h), calc_x+5, calc_y-5);
	// ctx.stroke();
	// ctx.restore();
	
	//console.log('Hitbox dimensions x,y / w,h = '+calc_x+', '+calc_y+' / '+this.w+', '+this.h);
	
	// 
    //------------------------------------------------------
    //------------------------------------------------------
	//    

    // Draw selection box
    if (this.canvas_state.selection === this) {

    	// the selection TextFrame
    	
		//ctx.save();
        ctx.strokeStyle = this.canvas_state.selection_color;
        ctx.lineWidth = this.canvas_state.selection_width;
        ctx.strokeRect(calc_x,calc_y,this.w,this.h);
	   	//ctx.restore();    	
    	
    	console.log('X,Y,W,H  '+calc_x+', '+calc_y+', '+this.w+', '+this.h);
    	


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
		
		ctx.save();
        ctx.fillStyle = this.canvas_state.selectionBoxColor;
        for (var i = 0; i < 8; i += 1) {
            var cur = this.canvas_state.selection_handles[i];
            ctx.fillRect(cur.x, cur.y, this.canvas_state.selection_boxsize, this.canvas_state.selection_boxsize);
        }
        ctx.restore();
    }
};

Image.prototype.resize = function(current_state, mouse_x, mouse_y, oldx, oldy){

	// Resize

};


// Determine if a point is inside the shape's bounds
Image.prototype.contains = function(mouse_x, mouse_y) {
    "use strict";
    //
    // USE parseFloat() WHEN ADDING BUMBERS BECAUSE + CONCATS THEM AS A STRING
    //
	var calc_x, calc_y; 
    calc_x = parseFloat(this.x) + parseFloat(this.selection_x)+parseFloat(this.page_center_x_coord)+parseFloat(this.item_transform_x) - parseFloat(this.page_width/2)+parseFloat(this.tub['page_info']['center_offset']);
    calc_y = parseFloat(this.y) + parseFloat(this.selection_y)+parseFloat(this.page_center_y_coord)+parseFloat(this.item_transform_y) +50;
    
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
            console.log('Image contains');	
    }
    
    return  (calc_x <= mouse_x) && 
    		(parseFloat(calc_x) + parseFloat(this.w) >= mouse_x) && 
    		(calc_y <= mouse_y) && 
    		(parseFloat(calc_y) + parseFloat(this.h) >= mouse_y);
};


























