function rectangle_module(canvas_fsm, tub, json_object){

    if(Object.prototype.toString.call( json_object ) === '[object Array]') {
        // multiple
        json_object.forEach( function (item) {
            // object init
            canvas_fsm.addShape(new Rectangle(canvas_fsm, tub, item));
        });

    }else{
        // Is single
        canvas_fsm.addShape(new Rectangle(canvas_fsm, tub, json_object));
    }

}




function Rectangle(canvas_state, tub, json_object){
    "use strict";
    
    this.page_item_type = 'Rectangle';
    this.canvas_state = canvas_state;
    this.tub = tub;
    this.json_object = json_object
    // pull vals from json_object
    
    //console.log(this.json_object);
    
    
    //
    // FILL 
    //
    if(typeof this.json_object['@attributes'].FillColor != 'undefined'){
    	this.fill_colour = this.json_object['@attributes'].FillColor;
    }else{
    	this.fill_colour = '';
    }
    
    
	// Use it if its set
	if(this.fill_colour != 'Swatch/None' && this.fill_colour != ''){
		
		
		/**********************************
		if(this.fill_colour.split(' ').length > 1){ // Color/C=15 M=100 Y=100 K=0  etc
			this.fill_colour = this.fill_colour.substring(6, this.fill_colour.length);
			this.fill_colour = this.fill_colour.split(' ');
			
			var c,m,y,k;
			c = this.fill_colour[0];
			m = this.fill_colour[1];
			y = this.fill_colour[2];
			k = this.fill_colour[3];
			
			c = c.substring(2, c.length);
			m = m.substring(2, m.length);
			y = y.substring(2, y.length);
			k = k.substring(2, k.length);
	
			var cc = ColorConverter.toRGB(new CMYK(c, m, y, k));
			this.fill_colour = 'rgba('+cc.r+','+cc.g+','+cc.b+',1)';
			
		}else{ // Color/black  etc
			this.fill_colour = this.fill_colour.substring(6, this.fill_colour.length);
		}
		/**********************************/
		
		
		
		this.fill_colour = '';
				

	}else{
		// USE DEFAULT...
		this.fill_colour = '';
	}
    
    
    
    
    //
    // STROKE 
    //
    if(typeof this.json_object['@attributes'].StrokeWeight != 'undefined'){
    	this.stroke_weight = parseFloat(this.json_object['@attributes'].StrokeWeight);
    }else{
    	this.stroke_weight = 0;
    }
    
    
    
    this.item_transform = this.json_object['@attributes'].ItemTransform;
    this.item_transform = this.item_transform.split(" ");

    this.item_transform_x = this.item_transform[4];
    this.item_transform_y = this.item_transform[5];
    this.x = this.y = this.w = this.h = this.alt_x = this.alt_y =0; // The W and H is calculated for the selction box, based on point path values
    
    

    this.page_width = parseFloat(this.tub['page_info']['PageWidth']);
    this.page_height = parseFloat(this.tub['page_info']['PageHeight']);
    this.page_center_x_coord = (this.page_width/2);
    this.page_center_y_coord = (this.page_height/2);


    // DEAL WITH PAGES DIFFERENTLY LATER...!
    
    this.first_x = this.first_y = this.max_x = this.max_y =0;
    this.selection_x = this.selection_y = 0;
	this.image_dimensions_width = this.image_dimensions_height = 0;
    this.image_transform_scale_x = 1;
    this.image_transform_scale_y = 1;

}



// Draws this shape to a given context
Rectangle.prototype.draw = function(ctx){
    "use strict";
    // ctx.save();

    // draw the actual shape
    var i, cur, half, path_point, index, start_x, start_y;
    
    index = start_x = start_y = 0;
    this.first_x = this.first_y = this.max_x = this.max_y =0;
                

	// console.log(this.json_object);
	// console.log(this.json_object['@attributes'].ItemTransform);
	// console.log(this.json_object.Properties.PathGeometry.GeometryPathType.PathPointArray.PathPointType[0]['@attributes'].Anchor);


	//
	// Draw the Stroke
	//
    ctx.beginPath();

    var first_flag = true;
    this.json_object.Properties.PathGeometry.GeometryPathType.PathPointArray.PathPointType.forEach( function (item) {

        path_point = item['@attributes'].Anchor;
        path_point = path_point.split(" ");

        start_x = parseFloat(this.x) + parseFloat(this.page_center_x_coord) + parseFloat(path_point[0]);
        start_y = parseFloat(this.y) + parseFloat(this.page_center_y_coord) + parseFloat(path_point[1]);

		//console.log('X,Y points =   '+path_point[0]+', '+path_point[1]);

        // Apply ItemTransform offset
        start_x = parseFloat(start_x) + parseFloat(this.item_transform_x) - parseFloat(this.page_width/2); // SHOULD IT BE PAGE WIDTH???????
        start_y = parseFloat(start_y) + parseFloat(this.item_transform_y);

		// simple version for now to save time...
		//
		// dynamically calculate the size the selection box needs to be based on the path points...
		// store the highest val and the lowest val and then subtract one from the other
		//
		
		//console.log('Start X,Y = '+start_x+', '+start_y+', Math.ABS-Y='+Math.abs(start_y));
		
		
		
		if(start_x > 0){
			if(start_x > this.max_x){ this.max_x = start_x; }	
		}else{ 
			if(Math.abs(start_x) > this.max_x){ this.max_x = start_x; }  // Handle negative co-ordinates - invert the number	
		}
		
		/******************
		if(start_y > 0){
		
			if(start_y > this.max_y){ this.max_y = start_y; }	
				
		}else{ 
			if(Math.abs(start_y) > this.max_y){ this.max_y = start_y; }  // Handle negative co-ordinates - invert the number	
		}
		/******************/
		
		// FIX AFTER DEMO
		if(start_y > this.max_y){ this.max_y = start_y; }	
		
		
		
		
		if(first_flag){
			// Need to refactor this....
			// this.x = start_x;
			// this.y = start_y;
			
			this.first_x = start_x;
			this.first_y = start_y;
			
			// Storing the unaltered PathPoint value...
			this.selection_x = parseFloat(path_point[0]);
			this.selection_y = parseFloat(path_point[1]);
			
			first_flag = false;
		}
		

        ctx.lineTo(start_x, start_y);
        
		ctx.save();
      	ctx.font = '10px Verdana';
      	ctx.fillStyle = 'black';
		ctx.fillText(index.toString()+' x,y: '+Math.round(start_x)+', '+Math.round(start_y), start_x+5, start_y-5);
		ctx.restore();
        
        index++;
        
    }, this);// this passes the scope of this to the anonymous function



	
	this.w = parseFloat(this.max_x) - parseFloat(this.first_x);		
	this.h = parseFloat(this.max_y) - parseFloat(this.first_y);

    ctx.closePath();
	ctx.lineWidth=this.stroke_weight;
	ctx.strokeStyle="blue";
	ctx.stroke();
    
	//
	// Draw the fill
	//
	if(this.fill_colour != ''){
	    ctx.fillStyle = this.fill_colour;
	    ctx.fillRect(this.first_x,this.first_y, this.w,this.h);		
	}



	// CROP VALS
	//console.log(this.json_object);
    if(typeof this.json_object.Image != 'undefined'){
    	
    	//console.log(this.json_object.Image);
    	
		var full_path = this.json_object.Image.Link['@attributes'].LinkResourceURI;    	
    	var filename = full_path.replace(/^.*[\\\/]/, '');
    	
    	//filename = decodeURIComponent(filename); // Javascript converts spaces to %20 etc...
    	var filepathname = "http://basedev.staging.algiz.co.uk/idml_loader/temp/Links/"+filename+"";
    	
    	
		var calc_x, calc_y, half, destw, desth;
	    calc_x = parseFloat(this.x) + parseFloat(this.selection_x)+parseFloat(this.page_center_x_coord)+parseFloat(this.item_transform_x) - parseFloat(this.page_width/2);
	    calc_y = parseFloat(this.y) + parseFloat(this.selection_y)+parseFloat(this.page_center_y_coord)+parseFloat(this.item_transform_y);
	    	
    	destw = this.w;
    	desth = this.h;
	    	
	    //console.log('W,H SH,SV = '+sourcew+', '+sourceh+'    '+scale_horizontal+', '+scale_vertical);
	    
    	var img_item_transform = this.json_object.Image['@attributes'].ItemTransform;
		img_item_transform = img_item_transform.split(" ");
	    	
	    this.image_transform_scale_x = img_item_transform[0];
	    this.image_transform_scale_y = img_item_transform[3];
	    	
    	// Image detection - handle TIFF differently
    	var img_type = this.json_object.Image['@attributes'].ImageTypeName,  substring = "tiff";
		img_type = img_type.toLowerCase();

		var img_id = this.json_object.Image['@attributes'].Self;


		if(this.image_dimensions_width == 0 && this.image_dimensions_height == 0){
			this.image_dimensions_width = this.json_object.Image.Properties.GraphicBounds['@attributes'].Right;	
			this.image_dimensions_height = this.json_object.Image.Properties.GraphicBounds['@attributes'].Bottom;					
		}


		// Bottom "312"
		// Left "0"
		// Right "312"
		// Top "0"


		
		// FrameFittingOption




		
		if(img_type.indexOf(substring) > -1){
			
			
			//alert('TIFF image not loaded... support to be added...');
			console.log('TIFF image not loaded... support to be added...');
			
			/*******************
			var loadImage = function(filepathname){
				var xhr = new XMLHttpRequest();
				xhr.open('GET', filepathname);
				xhr.responseType = 'arraybuffer';
				
				xhr.onload = function(e){
					var buffer = xhr.response;
					var tiff = new Tiff({buffer: buffer});
					
					//ctx.drawImage(tiff, calc_x, calc_y, sourcew, sourceh);
					
					var canvas = tiff.toCanvas();
					var width = tiff.width();
					var height = tiff.height();
					$('body').append(canvas);
				};
				xhr.send();
			};
			loadImage(filepathname);
			/***************************/


			// var img = new Image();
			// img.onload = function(){
			    // ctx.drawImage(img, calc_x, calc_y, sourcew, sourceh);
			// }
			// img.src = filepathname;
			
		}else{
			
			
			// http://stackoverflow.com/questions/4405336/how-to-copy-contents-of-one-canvas-to-another-canvas-locally
			
			// drawImage() WILL ACCEPT A CANVAS AS WELL AS AN IMAGE OBJECT
			


			
			
			var img_alt_transform_x =0, img_alt_transform_y =0;


			// console.log('Fitting option...');
			// console.log(this.json_object.FrameFittingOption);

			

			// ALT TOOL SELECT XY
			
			if(typeof this.json_object.FrameFittingOption != 'undefined'){
			
				if(typeof this.json_object.FrameFittingOption['@attributes'].LeftCrop != 'undefined'){
					
					// console.log(this.json_object.FrameFittingOption['@attributes'].LeftCrop);
								
					img_alt_transform_x = parseFloat(this.json_object.FrameFittingOption['@attributes'].LeftCrop);
					
					if (Math.sign(img_alt_transform_x) == -1) { 
					    img_alt_transform_x = 0;
					}
				}
				
				if(typeof this.json_object.FrameFittingOption['@attributes'].TopCrop != 'undefined'){
					
					// console.log(this.json_object.FrameFittingOption['@attributes'].TopCrop);
					
					img_alt_transform_y = parseFloat(this.json_object.FrameFittingOption['@attributes'].TopCrop);
					
					if (Math.sign(img_alt_transform_y) == -1) { 
					    img_alt_transform_y = 0;
					}
				}
			}



			// console.log('alt '+this.alt_x+' - '+this.alt_y);
			// console.log(Math.sign(this.alt_x));
			// console.log('---------------');


			var temp_x =0, temp_y = 0;



			// LOGIC..!
			if(Math.sign(this.alt_x) == 1){
				
					if (Math.sign(this.alt_x) != -1) { 
					    temp_x = parseFloat(this.alt_x);
					}else{
						// APPLY ALT DRAG OFFSET
						temp_x = 0;
						//temp_x = Math.abs(parseFloat(this.alt_x)); // <- this dostroys it in a funny way...
						img_alt_transform_x += parseFloat(this.alt_x);
					}
			}else{
					if (Math.sign(this.alt_x) == -1) { 
					    temp_x = parseFloat(this.alt_x);
					}else{
						// APPLY ALT DRAG OFFSET
						temp_x = 0;
						//temp_x = Math.abs(parseFloat(this.alt_x)); // <- this dostroys it in a funny way...
						img_alt_transform_x += parseFloat(this.alt_x);
					}
			}
			
						
						
						
						
			if(Math.sign(this.alt_y) == 1){
						
					if (Math.sign(this.alt_y) != -1) {
					    temp_y = parseFloat(this.alt_y);
					}else{
						// APPLY ALT DRAG OFFSET
						temp_y = 0;
						img_alt_transform_y += parseFloat(this.alt_y);
					}
			}else{
					if (Math.sign(this.alt_y) == -1) {
					    temp_y = parseFloat(this.alt_y);
					}else{
						// APPLY ALT DRAG OFFSET
						temp_y = 0;
						img_alt_transform_y += parseFloat(this.alt_y);
					}
			}
			
			
			
			
			
			// console.log(Math.sign(this.alt_x));
			// console.log('temp NEG '+temp_x+' - '+temp_y);
			// console.log('temp POS '+img_alt_transform_x+' - '+img_alt_transform_y);
				

			var p_image_dimensions_width = this.image_dimensions_width;
			var p_image_dimensions_height = this.image_dimensions_height;
			
			
			// console.log('preloaded_images TUB');
			// console.log();
			
			
			var img = new Image();
			var img_obj = null;
			
			$.each(this.tub['preloaded_images'], function(key, preloaded_image){
				//console.log(key, preloaded_image);
				
				if(preloaded_image.value == filename){
					img_obj = preloaded_image.img.currentSrc;
					return;
				}

			});
			img.src = img_obj;
				
			// console.log(img);
			// console.log('preloaded_images TUB======================');	
			// console.log(this);
			
			
			
			    var sourcex, sourcey, sourcew, sourceh;
		    	// sourcew = img.width * img_item_transform[0]; // Scale horizontal
		    	// sourceh = img.height * img_item_transform[3]; // Scale vertical
		    	sourcew = img.width * this.image_transform_scale_x; // Scale horizontal
		    	sourceh = img.height * this.image_transform_scale_y; // Scale vertical
		    	
		    	// sourcew = img.width * 0.5;
		    	// sourceh = img.height * 0.5;
			    sourcex = sourcey = 0;

				var new_canvas = document.getElementById("temp_canvas");
				
				new_canvas.width = p_image_dimensions_width;
				new_canvas.height = p_image_dimensions_height;
				new_canvas.style.zIndex = 8;
				new_canvas.style.position = "relative";
				new_canvas.style.border = "1px solid";
				new_canvas.style.marginLeft= "200px";
				var nc_ctx = new_canvas.getContext("2d");
				
				var resized_image_canvas = document.getElementById("temp_canvas");

				//
				// This is the primary selection dimensions...
				//
				
				// IF ALT POSITION X,Y IS NEGATIVE IT'S INVERTED GOES HERE
				
				// console.log('IMG DIM TEST=============');
				// console.log(this.image_dimensions_width+'   '+this.image_dimensions_height );
				
				
				/********/
				if(Math.sign(img_item_transform[4]) == -1 && Math.sign(img_item_transform[5]) == -1){
					nc_ctx.drawImage(img, temp_x, temp_y, p_image_dimensions_width, p_image_dimensions_height);	
				}else{
					nc_ctx.drawImage(img, temp_x, temp_y, sourcew, sourceh);	
				}
				/********/
				
				





				// ELSE IT IS ADDED TO THIS...

						
						// DRAW CANVAS ON CANVAS
			
						// Calc image position
						// calc_x = calc_x - rect_transform_x;
						// calc_y = calc_y - rect_transform_y;
			
						//
						// The X,Y here is what the secondary selection will change
						//
						// console.log('0x='+this.alt_x);
						// console.log('0y='+this.alt_y);
						// console.log('Pxy='+p_image_dimensions_width+' '+p_image_dimensions_height);
						// console.log('1='+img_alt_transform_x+' '+img_alt_transform_y);
						// console.log('2='+destw+' '+desth);
						// console.log('3='+calc_x+' '+calc_y);

						
						
						ctx.drawImage(resized_image_canvas, 
							img_alt_transform_x, img_alt_transform_y, destw, desth,
							calc_x, calc_y, destw, desth);
			
			
			
			
			
			
			
			
			
			
			
			
			/*******************************************************************
			var img = new Image();
			
			console.log(img);
			
			img.onload = function(){
			    	
			    var sourcex, sourcey, sourcew, sourceh;
		    	sourcew = img.width * img_item_transform[0]; // Scale horizontal
		    	sourceh = img.height * img_item_transform[3]; // Scale vertical
		    	
			    sourcex = sourcey = 0;
			    
			    
		    	//sourcew = sourceh = 300;
			    
			    
			    // Use the context to Resize the image / apply the transform
   				//ctx.save();
   				//ctx.setTransform(1,0,0,1,0,0);
				//ctx.scale(0.5,0.5);


				// Calc image position
				// calc_x = calc_x - rect_transform_x;
				// calc_y = calc_y - rect_transform_y;


				//
				// This is the primary selection dimensions...
				//
				ctx.drawImage(img, calc_x, calc_y, destw, desth);
    			console.log(img);
    	
	    	
				
				//ctx.drawImage(img, 200,200, destw, desth, calc_x, calc_y, sourcew, sourceh);

			    // Draw image, if its within the rectangle it wont be cropped
			    
			    //ctx.drawImage(img, 
			    //	sourcex, sourcey, sourcew, sourceh,
			    //	calc_x, calc_y, destw, desth);// calc x,y is for destination x,y
			    
			    
			    console.log(img_id+' VALS= '+sourcex+', '+sourcey+', '+sourcew+', '+sourceh+', '+calc_x+', '+calc_y+', '+destw+', '+desth);
			    
			    
			    //ctx.restore();
			}
			img.src = filepathname;
			/*******************************************************************/
			
			
			
		}


   } // End handle image


   	// ctx.restore();
};




Rectangle.prototype.draw_selection = function(ctx){
    "use strict";
    
	var calc_x, calc_y, half;
    calc_x = parseFloat(this.x) + parseFloat(this.selection_x)+parseFloat(this.page_center_x_coord)+parseFloat(this.item_transform_x) - parseFloat(this.page_width/2);
    calc_y = parseFloat(this.y) + parseFloat(this.selection_y)+parseFloat(this.page_center_y_coord)+parseFloat(this.item_transform_y);
  	// console.log('X,Y,W,H = '+calc_x+', '+calc_y+', '+this.w+', '+this.h);
      
        
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
		var default_stroke = ctx.strokeStyle; 
		var default_thickness = ctx.lineWidth;

        ctx.strokeStyle = this.canvas_state.selection_color;
        ctx.lineWidth = this.canvas_state.selection_width;
        ctx.strokeStyle = default_stroke; ctx.lineWidth = default_thickness;	

        // draw the selection boxes
        half = this.canvas_state.selection_boxsize / 2;
        
        // 0  1  2
        // 3     4
        // 5  6  7

		//
		// THIS ONLY POSITIONS THE GRAB HANDLES, IT DOES NOT CALC THE COLLISION....

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
        ctx.strokeStyle = this.canvas_state.selectionBoxStroke;
        ctx.stroke(); 
        for (var i = 0; i < 8; i += 1) {
            var cur = this.canvas_state.selection_handles[i];
            ctx.fillRect(cur.x, cur.y, this.canvas_state.selection_boxsize, this.canvas_state.selection_boxsize);
            ctx.strokeRect(cur.x, cur.y, this.canvas_state.selection_boxsize, this.canvas_state.selection_boxsize);
        }
        ctx.restore();
    }
};

Rectangle.prototype.draw_alt_selection = function(ctx){
        
    // Draw selection box
    if (this.canvas_state.selection === this) {
    	
		var calc_x, calc_y, half;
	    calc_x = parseFloat(this.x) + parseFloat(this.selection_x)+parseFloat(this.page_center_x_coord)+parseFloat(this.item_transform_x) - parseFloat(this.page_width/2);
	    calc_y = parseFloat(this.y) + parseFloat(this.selection_y)+parseFloat(this.page_center_y_coord)+parseFloat(this.item_transform_y);
	
	    calc_x += parseFloat(this.alt_x);
	    calc_y += parseFloat(this.alt_y);
	
		if(typeof this.json_object.Image != 'undefined'){
			
			// Get the val once else allow resized vals to remain
			if(this.image_dimensions_width == 0 && this.image_dimensions_height == 0){
				this.image_dimensions_width = this.json_object.Image.Properties.GraphicBounds['@attributes'].Right;	
				this.image_dimensions_height = this.json_object.Image.Properties.GraphicBounds['@attributes'].Bottom;					
			}
		}
		
		
	
		var img_alt_transform_x, img_alt_transform_y;
	
		// ALT TOOL SELECT XY
		if(typeof this.json_object.FrameFittingOption != 'undefined'){
			img_alt_transform_x = this.json_object.FrameFittingOption['@attributes'].LeftCrop;
		}else{
			img_alt_transform_x = 0;
		}
		if(typeof this.json_object.FrameFittingOption != 'undefined'){
			img_alt_transform_y = this.json_object.FrameFittingOption['@attributes'].TopCrop;
		}else{
			img_alt_transform_y = 0;
		}		


		calc_x -= img_alt_transform_x;
		calc_y -= img_alt_transform_y

	    var  sourcew, sourceh;
    	sourcew = this.image_dimensions_width * this.image_transform_scale_x; // Scale horizontal
    	sourceh = this.image_dimensions_height* this.image_transform_scale_y; // Scale vertical
    	
		
    	// the selection 
        ctx.strokeStyle = '#CC0000';
        ctx.lineWidth = 1;
        
        /******************
		if(Math.sign(img_item_transform[4]) == -1 && Math.sign(img_item_transform[5]) == -1){
			ctx.strokeRect(calc_x ,calc_y, this.image_dimensions_width, this.image_dimensions_height);	
		}else{
			ctx.strokeRect(calc_x ,calc_y, sourcew, sourceh);
		}
		/******************/
		
		
		ctx.strokeRect(calc_x ,calc_y, this.image_dimensions_width, this.image_dimensions_height);	
		
        	
        	

        // draw the selection boxes
        half = this.canvas_state.selection_boxsize / 2;
        
        // 0    2
        //      
        // 5    7

		//
		// THIS ONLY POSITIONS THE GRAB HANDLES, IT DOES NOT CALC THE COLLISION....

        // top left, middle, right
        this.canvas_state.selection_handles[0].x = calc_x-half;
        this.canvas_state.selection_handles[0].y = calc_y-half;

        this.canvas_state.selection_handles[1].x = calc_x+ (parseFloat(this.image_dimensions_width)/2)-half;
        this.canvas_state.selection_handles[1].y = calc_y-half;

        this.canvas_state.selection_handles[2].x = calc_x+ (parseFloat(this.image_dimensions_width)-half);
        this.canvas_state.selection_handles[2].y = calc_y-half;
        
        
        //middle left
        this.canvas_state.selection_handles[3].x = calc_x-half;
        this.canvas_state.selection_handles[3].y = calc_y+ (parseFloat(this.image_dimensions_height)/2)-half;

        //middle right
        this.canvas_state.selection_handles[4].x = calc_x+parseFloat(this.image_dimensions_width)-half;
        this.canvas_state.selection_handles[4].y = calc_y+(parseFloat(this.image_dimensions_height)/2)-half;


        //bottom left, middle, right
        this.canvas_state.selection_handles[6].x = calc_x+ (parseFloat(this.image_dimensions_width)/2)-half;
        this.canvas_state.selection_handles[6].y = calc_y+parseFloat(this.image_dimensions_height)-half;

        this.canvas_state.selection_handles[5].x = calc_x-half;
        this.canvas_state.selection_handles[5].y = calc_y+parseFloat(this.image_dimensions_height)-half;

        this.canvas_state.selection_handles[7].x = calc_x+parseFloat(this.image_dimensions_width)-half;
        this.canvas_state.selection_handles[7].y = calc_y+parseFloat(this.image_dimensions_height)-half;

		// Draw each little box
		
		ctx.save();
        ctx.fillStyle = this.canvas_state.selectionBoxColor;
        for (var i = 0; i < 8; i += 1) {
            var cur = this.canvas_state.selection_handles[i];
            ctx.fillStyle = '#000'; // for black text
            ctx.fillText('[Handle '+i+'] x,y: '+Math.round(cur.x)+', '+Math.round(cur.y), cur.x+5, cur.y-5);
            ctx.fillStyle = this.canvas_state.selectionBoxColor; // back to white fill
            
            ctx.fillRect(cur.x, cur.y, this.canvas_state.selection_boxsize, this.canvas_state.selection_boxsize);
            ctx.strokeRect(cur.x, cur.y, this.canvas_state.selection_boxsize, this.canvas_state.selection_boxsize);
			//ctx.stroke(); 
        }
        ctx.restore();
        	
        	
        	
        	
        	
        	
        	
        	
        	
	}
	
	//console.log('Rectangle alt selection');
};

Rectangle.prototype.resize = function(current_state, mouse_x, mouse_y, oldx, oldy){
            // 0  1  2
            // 3     4
            // 5  6  7
            switch (current_state.expect_resize) {
                case 0:
                    current_state.selection.x = mouse_x;
                    current_state.selection.y = mouse_y;
                    current_state.selection.w += oldx - mouse_x;
                    current_state.selection.h += oldy - mouse_y;
                    break;
                case 1:
                    current_state.selection.y = mouse_y;
                    current_state.selection.h += oldy - mouse_y;
                    break;
                case 2:
                    current_state.selection.y = mouse_y;
                    current_state.selection.w = mouse_x - oldx;
                    current_state.selection.h += oldy - mouse_y;
                    break;
                case 3:
                    current_state.selection.x = mouse_x;
                    current_state.selection.w += oldx - mouse_x;
                    break;
                case 4:
                    current_state.selection.w = mouse_x - oldx;
                    break;
                case 5:
                    current_state.selection.x = mouse_x;
                    current_state.selection.w += oldx - mouse_x;
                    current_state.selection.h = mouse_y - oldy;
                    break;
                case 6:
                    current_state.selection.h = mouse_y - oldy;
                    break;
                case 7:
                    current_state.selection.w = mouse_x - oldx;
                    current_state.selection.h = mouse_y - oldy;
                    break;
            }
};


Rectangle.prototype.alt_resize = function(current_state, mouse_x, mouse_y, oldx, oldy){
            // 0  1  2
            // 3     4
            // 5  6  7
            
            console.log('Rectangle alt_resize()...');
            console.log('OLD');
            console.log(oldx);
        	console.log(oldy);
    		console.log();
            console.log('MOUSE');
            console.log(mouse_x);
        	console.log(mouse_y);
    		console.log(current_state);
    		console.log('CS W,H ');
    		
    		current_state.selection.image_dimensions_width = parseFloat(current_state.selection.image_dimensions_width);
    		current_state.selection.image_dimensions_height = parseFloat(current_state.selection.image_dimensions_height);
    		
    		console.log(current_state.selection.image_dimensions_width);
    		console.log(current_state.selection.image_dimensions_height);
            
            switch (current_state.expect_resize) {
                case 0:
                    current_state.selection.alt_x = mouse_x;
                    current_state.selection.alt_y = mouse_y;
                    current_state.selection.image_dimensions_width += oldx - mouse_x;
                    current_state.selection.image_dimensions_height += oldy - mouse_y;
                    break;
                case 1:
                    current_state.selection.alt_y = mouse_y;
                    current_state.selection.image_dimensions_height += oldy - mouse_y;
                    break;
                case 2:
                    current_state.selection.alt_y = mouse_y;
                    current_state.selection.image_dimensions_width = mouse_x - oldx;
                    current_state.selection.image_dimensions_height += oldy - mouse_y;
                    break;
                case 3:
                    current_state.selection.alt_x = mouse_x;
                    current_state.selection.image_dimensions_width += oldx - mouse_x;
                    break;
                case 4:
                    current_state.selection.image_dimensions_width = mouse_x - oldx;
                    break;
                case 5:
                    current_state.selection.alt_x = mouse_x;
                    current_state.selection.image_dimensions_width += oldx - mouse_x;
                    current_state.selection.image_dimensions_height = mouse_y - oldy;
                    break;
                case 6:
                    current_state.selection.image_dimensions_height = mouse_y - oldy;
                    break;
                case 7:
                    current_state.selection.image_dimensions_width = mouse_x - oldx;
                    current_state.selection.image_dimensions_height = mouse_y - oldy;
                    break;
            }
};


// Determine if a point is inside the shape's bounds
Rectangle.prototype.contains = function(mouse_x, mouse_y) {
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
            console.log('Rectangle contains');	
    }
    
    return  (calc_x <= mouse_x) && 
    		(parseFloat(calc_x) + parseFloat(this.w) >= mouse_x) && 
    		(calc_y <= mouse_y) && 
    		(parseFloat(calc_y) + parseFloat(this.h) >= mouse_y);
};




Rectangle.prototype.alt_contains = function(ctx, mouse_x, mouse_y) {
    "use strict";
    //
    // USE parseFloat() WHEN ADDING BUMBERS BECAUSE + CONCATS THEM AS A STRING
    //
    
    var _ctx = ctx;
    
	var calc_x, calc_y; 
    // calc_x = parseFloat(this.x) + parseFloat(this.selection_x)+parseFloat(this.page_center_x_coord)+parseFloat(this.item_transform_x) - parseFloat(this.page_width/2)+parseFloat(this.tub['page_info']['center_offset']);
    // calc_y = parseFloat(this.y) + parseFloat(this.selection_y)+parseFloat(this.page_center_y_coord)+parseFloat(this.item_transform_y) +50;
//     
    // calc_x += parseFloat(this.alt_x);
    // calc_y += parseFloat(this.alt_y);
    
    
    calc_x = parseFloat(this.alt_x) + parseFloat(this.selection_x)+parseFloat(this.page_center_x_coord)+parseFloat(this.item_transform_x) - parseFloat(this.page_width/2)+parseFloat(this.tub['page_info']['center_offset']);
    calc_y = parseFloat(this.alt_y) + parseFloat(this.selection_y)+parseFloat(this.page_center_y_coord)+parseFloat(this.item_transform_y) +50;
    
    /************
    console.log('mouse x/y '+mouse_x+' '+mouse_y);
    console.log((calc_x <= mouse_x));
    console.log((parseFloat(calc_x) + parseFloat(this.w) >= mouse_x));
    console.log('shape calc x/y '+calc_x+' '+calc_y);
    console.log('shape w/h  '+this.w+' '+this.h);
    console.log((calc_y <= mouse_y));
    console.log((parseFloat(calc_y) + parseFloat(this.h) >= mouse_y));
    /************/
   
   
   
   
    _ctx.save();
	_ctx.lineWidth="0.5";
	_ctx.strokeStyle="blue";
	_ctx.rect(calc_x, calc_y, this.image_dimensions_width, this.image_dimensions_height);
	_ctx.fillText('x,y: '+Math.round(calc_x)+', '+Math.round(calc_y), calc_x+5, calc_y-15);
	_ctx.fillText('w,h: '+Math.round(this.image_dimensions_width)+', '+Math.round(this.image_dimensions_height), calc_x+5, calc_y-5);
	_ctx.stroke();
	_ctx.restore();
	
   
   
    
    if(		(calc_x <= mouse_x) && 
    		(parseFloat(calc_x) + parseFloat(this.image_dimensions_width) >= mouse_x) && 
    		(calc_y <= mouse_y) && 
    		(parseFloat(calc_y) + parseFloat(this.image_dimensions_height) >= mouse_y)
    ){
            console.log('ALT Rectangle contains');	
    }
    
    return  (calc_x <= mouse_x) && 
    		(parseFloat(calc_x) + parseFloat(this.image_dimensions_width) >= mouse_x) && 
    		(calc_y <= mouse_y) && 
    		(parseFloat(calc_y) + parseFloat(this.image_dimensions_height) >= mouse_y);
};


