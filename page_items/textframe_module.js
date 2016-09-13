//
// NOTES
//
// Text Defaults are defined in the IDML spec on page 475/476
//
//
//

function textframe_module(canvas_fsm, tub, json_object){
	
    if(Object.prototype.toString.call( json_object ) === '[object Array]') {
        // multiple
        json_object.forEach( function (item) {
            // object init
            canvas_fsm.addShape(new TextFrame(canvas_fsm, tub, item));
        });

    }else{
        // Is single
        // console.log('added textframe');
        canvas_fsm.addShape(new TextFrame(canvas_fsm, tub, json_object));
    }
}

function Character(str) {
  // allow usage without `new`
  if (!(this instanceof Character)) return new Character(str);
  this.val = str;
  this.style_id = 0;
}


function TextFrame(canvas_state, tub, json_object){
    "use strict";
    
    
    this.page_item_type = 'TextFrame';
    this.canvas_state = canvas_state;
    this.tub = tub;
    this.json_object = json_object;
    // pull vals from json_object
    
    this.item_transform = this.json_object['@attributes'].ItemTransform;
    this.item_transform = this.item_transform.split(" ");

    this.item_transform_x = this.item_transform[4];
    this.item_transform_y = this.item_transform[5];
    this.x = this.y = this.w = this.h = 0; // The W and H is calculated for the selction box, based on point path values

    this.page_width = parseFloat(this.tub['page_info']['PageWidth']);
    this.page_height = parseFloat(this.tub['page_info']['PageHeight']);
    this.page_center_x_coord = (this.page_width/2);
    this.page_center_y_coord = (this.page_height/2);

	// Text content
	this.story_id = this.json_object['@attributes'].ParentStory;
	this.self_id = this.json_object['@attributes'].Self;


	var points = this.json_object.Properties.PathGeometry.GeometryPathType.PathPointArray.PathPointType;
	this.points_coords = [];
	for(var i=0; i<points.length; i++){
		var coords = points[i]["@attributes"]["Anchor"].split(" ");
		this.points_coords.push(coords);
	}
    // DEAL WITH PAGES DIFFERENTLY LATER...!
    this.first_x = this.first_y = this.max_x = this.max_y =0;
    this.selection_x = this.selection_y = 0;
    
    
    this.text_loaded_flag = false;
	this.characters = [];
	this.character_styles = [];
	this.character_style_map = [];
	this.characters_selected = []; // The code processes an array
	
	// PARSE THE STORY - TEXT INIT
	
	
	//******************************************************************************
	//
	// This code acts like a parser, it reads through the story file and passed the 
	// content items regardless of how they are nested...
	//
	//******************************************************************************
	
	var paragraph_style_range = this.tub['stories'][this.story_id].Story.ParagraphStyleRange;		
	
	console.log('TextFrame.prototype.INIT   Line prep logic....');
	
	console.log('=========STORY '+this.story_id+'=============');
	/***********************************
	if(Object.prototype.toString.call(paragraph_style_range) == '[object Array]'){
		//console.log('line prep 1');
		paragraph_style_range.forEach( function(paragraph_style_range){
			
			if(Object.prototype.toString.call(paragraph_style_range.CharacterStyleRange) == '[object Array]'){
				paragraph_style_range.CharacterStyleRange.forEach( function(character_style_range){
					if(Object.prototype.toString.call(character_style_range.Content) == '[object Array]'){
						//console.log('line prep 2');
						character_style_range.Content.forEach( function(content_item){
							append_content(content_item);	
						});
					}else{
						//console.log('line prep 3');
						append_content(character_style_range.Content);	
					}
				});
			}else{
				if(Object.prototype.toString.call(paragraph_style_range.CharacterStyleRange.Content) == '[object Array]'){
					//console.log('line prep 4');
					paragraph_style_range.CharacterStyleRange.Content.forEach( function(content_item){
						append_content(content_item);	
					});
				}else{
					//console.log('line prep 5');
					append_content(paragraph_style_range.CharacterStyleRange.Content);
				}
			}
			
		});
	}else{ // Single
		if(Object.prototype.toString.call(paragraph_style_range.CharacterStyleRange) == '[object Array]'){
			paragraph_style_range.CharacterStyleRange.forEach( function(character_style_range){
				if(Object.prototype.toString.call(character_style_range.Content) == '[object Array]'){
					//console.log('line prep 2');
					character_style_range.Content.forEach( function(content_item){
						append_content(content_item);	
					});
				}else{
					//console.log('line prep 3');
					append_content(character_style_range.Content);	
				}
			});
		}else{
			if(Object.prototype.toString.call(paragraph_style_range.CharacterStyleRange.Content) == '[object Array]'){
				//console.log('line prep 4');
				paragraph_style_range.CharacterStyleRange.Content.forEach( function(content_item){
					append_content(content_item);	
				});
			}else{
				//console.log('line prep 5');
				append_content(paragraph_style_range.CharacterStyleRange.Content);
			}
		}
	}
	/***********************************/
	
	if(Object.prototype.toString.call(paragraph_style_range) == '[object Array]'){
		paragraph_style_range.forEach( function(paragraph_style_range){
			if(Object.prototype.toString.call(paragraph_style_range.CharacterStyleRange) == '[object Array]'){
				paragraph_style_range.CharacterStyleRange.forEach( function(character_style_range){
					append_content(this, character_style_range);	
				});
			}else{
				append_content(this, paragraph_style_range.CharacterStyleRange);
			}
		});
	}else{ // Single
		if(Object.prototype.toString.call(paragraph_style_range.CharacterStyleRange) == '[object Array]'){
			paragraph_style_range.CharacterStyleRange.forEach( function(character_style_range){
				append_content(this, character_style_range);	
			});
		}else{
			append_content(this, paragraph_style_range.CharacterStyleRange);
		}
	}
	
	
	console.log('=========END STORY=============');
	console.log(this.characters);
	console.log(this.character_style_map);
	console.log(this.character_styles);
	console.log('-------------------------------');
	console.log();

	
	
	
// USE APPEND TO BUILD THE SEQUENCE - THE SEQUENCE IT WHAT WE ALTER AND REDRAW

// USE THE SCANNER TO prep for DRAW

// SCANNER takes width and converts into array of lines

// DRAW ARRAY OF LINES

// Sequence AUTO updates STYLING








	// This is only used to INIT text
    function append_content(_this, content_item){

	// REFERENCE
	// this.characters = [];
	// this.character_styles = [];
	// this.character_style_map = [];
	
	
	// NEED TO USE TEXT SCANNER INSIDE THIS
	

		if(Object.prototype.toString.call(content_item) == '[object Undefined]'){
			return;
		}
		
		
		console.log('append_content() -> content_item   ');
		console.log(content_item);
		console.log('content_item above');
		
		
		// console.log(content_item.['@attributes'].FillColor);
		// console.log(content_item.['@attributes'].FontStyle);
		// console.log(content_item.['@attributes'].PointSize);
		
		//console.log(content_item.Properties.AppliedFont);
		console.log('-------------------------------');



		/**************************/
		if(content_item == '<Br />'){
			_this.characters.push('\n');
			_this.character_style_map.push('');
		}else{
	
	
	
		    if(Object.prototype.toString.call( content_item.Content ) === '[object Array]') {
		        // multiple
		        content_item.Content.forEach( function (item) {
		            // object init
		            
					if(item == '<Br />'){
						_this.characters.push('\n');
						_this.character_style_map.push('');
					}else{
						
						var temp_characters = item.split('');
						for(var i = 0; i < temp_characters.length; i++){

				
							// Push current row
							_this.characters.push(temp_characters[i]);
							_this.character_style_map.push(0);
							_this.character_styles.push(0);
							
						}
						
					}

		            
		        });
		
		    }else{
		        // Is single

				var characters = content_item.Content.split('');
				for(var i = 0; i < characters.length; i++){
					
	
	
		
					// Push current row
					_this.characters.push(characters[i]);
					_this.character_style_map.push(0);
					_this.character_styles.push(0);
					
					// this.character_styles = [];
					// 
					
					//p_this.line_styles.push(p_this.point_size+"px "+p_this.font_style);
				}

		    }

	

		}
		
		/**************************/

	}

	//create fabricJs Itext element

	// GET BOUNDING BOX
	this.start_x = parseFloat(this.points_coords[0][0]) + parseFloat(this.page_center_x_coord);
	this.start_y = parseFloat(this.points_coords[0][1]) + parseFloat(this.page_center_y_coord);

	// Apply ItemTransform offset
	this.start_x = parseFloat(this.start_x) + parseFloat(this.item_transform_x) - parseFloat(this.page_center_x_coord);
	this.start_y = parseFloat(this.start_y) + parseFloat(this.item_transform_y);

	var text = this.characters.join("");
	var fShape = (new fabric.IText(text, {
		fontFamily: 'customFont',
		left: this.start_x,
		top: this.start_y
	}));
	fabricShapes.push(fShape);
	//draw fabricJs shapes
	fCanvas.add(fShape);


}


	







TextFrame.prototype.store_style = function (style_string){
	
	// var style_data = JSON.parse(style_string);
	// console.log(style_data);
	
	this.style_override = style_string;
	this.lines_to_style = this.lines_selected;

	
	// console.log('TextFrame.prototype.store_style');
// 	
	// console.log('style_string = '+style_string);
// 	
	// this.style_overried_stack.push(style_string);
// 	
	// console.log('STORE STYLES...');
	// console.log(this.style_overried_stack);
	// console.log(this.lines_selected);
	// console.log('~~~~~~~~~~~~~~~~~~~~~~~~~');
	
	


	
}






/**********************************************************************************

Get the story text
Pull the text/style info from the story
Insert characters "string" into ROPE data structure (with pointer to character style array)
"Text held in a sequence"


-- main text drawing loop --

Get container width




If line ABOVE and/or BELOW exists scan it and store X values for cursor

TextScanner reads (peeks) until current line is '<=' width
    For each character gets style info for calculation use TextMetrics (https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics)
    Stores largest leading value (if none this becomes the largest font) -
    "if leading is less than font size, characters SHOULD overlap line ABOVE"

    == Text scanner line (word) wrap implemented here ==



Start at 0 in sequence
Get character
Get style info from sequence
Draw individual character (Y value comes from Scanner looking ahead)
Once end is reached call Scanner again




Keep track of cursor X vals for current line, line above and line below to facilitate movement 
when up or down is pressed. I.e. if on first line and up is pressed line above will = zero so send 
cursor to start, if down send to end ELSE send to closest X value.

/**********************************************************************************/








// Draws this shape to a given context
TextFrame.prototype.draw = function(ctx){
    "use strict";
	// ctx.translate(0.5, 0.5);

    // draw the actual shape
    var i, cur, half, path_point, index, start_x, start_y;
    
    index = start_x = start_y = 0;
    this.first_x = this.first_y = this.max_x = this.max_y =0;
                

	// GET BOUNDING BOX
    ctx.beginPath();

    var first_flag = true;
    this.json_object.Properties.PathGeometry.GeometryPathType.PathPointArray.PathPointType.forEach( function(item){

        path_point = item['@attributes'].Anchor;
        path_point = path_point.split(" ");

        start_x = parseFloat(this.x) + parseFloat(this.page_center_x_coord) + parseFloat( Math.round(path_point[0]) );
        start_y = parseFloat(this.y) + parseFloat(this.page_center_y_coord) + parseFloat( Math.round(path_point[1]) );

		console.log('X,Y points =   '+path_point[0]+', '+path_point[1]);

        // Apply ItemTransform offset
        start_x = parseFloat(start_x) + parseFloat(this.item_transform_x) - parseFloat(this.page_width/2); // SHOULD IT BE PAGE WIDTH???????
        start_y = parseFloat(start_y) + parseFloat(this.item_transform_y);

		// simple version for now to save time...
		//
		// dynamically calculate the size the selection box needs to be based on the path points...
		// store the highest val and the lowest val and then subtract one from the other
		//
		if(start_x > 0){
			if(start_x > this.max_x){ this.max_x = start_x; }	
		}else{ 
			if(Math.abs(start_x) > this.max_x){ this.max_x = start_x; }  // Handle negative co-ordinates - invert the number	
		}

		
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
			
			ctx.save();
	      	ctx.font = '10px Verdana';
	      	ctx.fillStyle = 'black';
			ctx.fillText('Self: '+this.self_id+'  Story: '+this.story_id, start_x+5, start_y-15);
			ctx.restore();
			
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


	// BLUE BOUNDING BOX
	ctx.save();
	ctx.closePath();
	ctx.lineWidth=this.stroke_weight;
	ctx.strokeStyle="blue";
    ctx.stroke();
    ctx.restore();



	//THIS RUNS AFTER THE INITIAL ONE IN FUNC BELOW RUNS
	console.log('PreviousTextFrame = '+this.json_object['@attributes'].PreviousTextFrame);
	
	if(this.json_object['@attributes'].PreviousTextFrame == 'n' && this.text_loaded_flag){
		this.tub['story_text_offset'][this.story_id] = 0;
		this.tub['story_text_offset_counter'][this.story_id] = 0;
		this.tub['story_text_page_counter'][this.story_id] = 0;
	}
	// THIS IS BAD..............




	console.log('###########_PROCESS_LINES_#############');
	
	var wrap_width = Math.round(this.w);
	var wrap_height = Math.round(this.h);
	var textwrap_x, textwrap_y;
	var next_y_val =10;
	
	textwrap_x = textwrap_y = 0;
		
	textwrap_x = parseFloat(this.first_x);
	textwrap_y = parseFloat(this.first_y);// + parseFloat(this.point_size);
	
	// console.log('TW XY '+textwrap_x+' '+textwrap_y);
	


	// WHILE WRAPPING KEEP INCREMENTING OFFSET FOR NEXT PAGE
    //

    
    // SELECTION TEST DATA STRUCT...
	// this.lines_selected[0] = [1,2,3,4,5];
	// this.lines_selected[1] = [1,2,3,4,5];
	// this.lines_selected[2] = [1,2,3,4,5];
	
	
	
	
	
	// DRAW TEXT
	
	
		  	
		  	
				// Draw the line character by charcter
				var cursor_x = textwrap_x;
				var cursor_y = textwrap_y;
				
				console.log('ID='+this.story_id);
				console.log('OFFEST='+this.tub['story_text_offset_counter'][this.story_id]);
				
				for(var i = 0; i < this.characters.length; i++){
				//for(var i = this.tub['story_text_offset_counter'][this.story_id]; i < this.characters.length; i++){
					

					if( next_y_val < wrap_height ){
						
		// ctx.save();
      	// ctx.font = '10px Verdana';
      	// ctx.fillStyle = 'black';
		// ctx.fillText(index.toString()+' x,y: '+Math.round(start_x)+', '+Math.round(start_y), start_x+5, start_y-5);
		// ctx.restore();

						ctx.save();
						ctx.font = '12px Helvetica';						
						ctx.fillText(this.characters[i], cursor_x, parseInt(cursor_y)+parseInt(next_y_val)  );
						ctx.restore();
						
						this.tub['story_text_offset_counter'][this.story_id]++;
					}
					
					
					cursor_x += parseFloat(ctx.measureText(					
						this.characters[i]).width
					);							

					// Too wide or BR start a new line...
					if(cursor_x > ( parseInt(textwrap_x)+parseInt(wrap_width)-10) || this.characters[i] == '\n'){
						next_y_val += 10;
						cursor_x = textwrap_x;
					}
				}
				//this.tub['story_text_offset_counter'][this.story_id] = 0;
	
	
	
	

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	//###########################################
	//###########################################
	//###########################################
	
	/*******************************************
	
	
	
	
	this.lines = ['this is the first line','this is the second line'];
	this.line_leading = [10,10];

	var temp_first_leading = true;
	
	
	var selected_line_keys = [];
	for (var key in this.lines_selected) {
	    if (key === 'length' || !this.lines_selected.hasOwnProperty(key)) continue;
	    selected_line_keys.push(parseInt(key));
	}
    
	for(var line_number = 0; line_number < this.lines.length; line_number++){

		if(temp_first_leading){
			textwrap_y += parseFloat(this.line_leading[line_number]);
			temp_first_leading = false;
		}


		if(this.tub['story_text_offset_counter'][this.story_id] >= this.tub['story_text_offset'][this.story_id]){
		  
		  	//next_y_val = textwrap_y+parseFloat(this.point_size);
		  	//next_y_val += parseFloat(this.point_size);
		  	
		  	next_y_val += parseFloat(this.line_leading[line_number]);
		  	//console.log(line_number+': LINE LEADING  '+this.line_leading[line_number]);
		  
		  
		  
		  	//console.log('next_y_val='+next_y_val);
		  	// console.log(line_number+': Line - STORY Y vals = '+next_y_val+', '+wrap_height);
		  	
		  	if( next_y_val < wrap_height ){
				// Draw the line character by charcter
				var cursor_x = textwrap_x;
				var line_text = this.lines[line_number];
				var char_arr = line_text.split('');
				
				for(var i = 0; i < char_arr.length; i++){
					
					var is_selected = false;
					if(selected_line_keys.indexOf(parseInt(line_number)) != -1 ){
						//console.log('line_number: '+line_number+'  line index test = '+lines_selected.indexOf(parseInt(line_number)));
						if (this.lines_selected[line_number].indexOf(i) == -1){
							//console.log('NOT FOUND');
							 is_selected = false;
						}else{
							//console.log('FOUND');
							 is_selected = true;
						}
					}


					if(is_selected){
						ctx.save();	
						//ctx.fillStyle = '#C0DDF6';		
						ctx.fillStyle = 'rgba(192,221,246,1)';
						ctx.fillRect(
							cursor_x,textwrap_y-parseFloat(this.line_leading[line_number])+1,
							parseFloat(ctx.measureText(char_arr[i]).width)+1, parseFloat(this.line_leading[line_number])+3);
							// X Y W H
						ctx.restore();
					}
					
					// console.log('xxx test xxx');
					// console.log(this.style_overrid);
					// console.log(this.point_size+'  '+this.text_font+'  '+this.font_style+'  '+this.fill_colour+'  '+this.stroke_colour);
	

						ctx.fillStyle = this.line_fill_color[line_number];
						ctx.font = this.line_styles[line_number];
						ctx.fillText(char_arr[i], cursor_x, textwrap_y);
						cursor_x += parseFloat(ctx.measureText(char_arr[i]).width);							

				}
				cursor_x = 0;

				
				
	  			// Only increment this while text should be drawn
	  			this.tub['story_text_offset'][this.story_id]++;
	  			
	  			textwrap_y = parseFloat(textwrap_y) + parseFloat(this.line_leading[line_number])+2;	
			}
  		}else{
  			textwrap_y = start_y + parseFloat(this.line_leading[line_number]);
  		}

		// This will always get incremented, used to overcome index being reset because 
		// the loop only loops over <content> one at a time...
		this.tub['story_text_offset_counter'][this.story_id]++;
	}
	this.tub['story_text_offset_counter'][this.story_id] = 0;	


	/*******************************************/
	
	//###########################################
	//###########################################
	//###########################################
	






				
	
};




TextFrame.prototype.draw_selection = function(ctx){
	"use strict";
	
	var calc_x, calc_y, half;
	calc_x = parseFloat(this.x) + parseFloat(this.selection_x)+parseFloat(this.page_center_x_coord)+parseFloat(this.item_transform_x) - parseFloat(this.page_width/2);
    calc_y = parseFloat(this.y) + parseFloat(this.selection_y)+parseFloat(this.page_center_y_coord)+parseFloat(this.item_transform_y);
        
    
    // console.log(this.json_object['@attributes'].Self+' - calc_x='+calc_x+' - W='+this.w);
    // console.log(this.json_object['@attributes'].Self+' - calc_y='+calc_y+' - H='+this.h);
    // console.log('X,Y,W,H = '+calc_x+', '+calc_y+', '+this.w+', '+this.h);
    
    
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
    if(this.canvas_state.selection === this){
    	console.log('textframe selection on.....');

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





TextFrame.prototype.draw_alt_selection = function(ctx){
	
	if(this.canvas_state.selection === this){
		
	}
	
	return false;
};




TextFrame.prototype.resize = function(current_state, mouse_x, mouse_y, oldx, oldy){
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


// Determine if a point is inside the shape's bounds
TextFrame.prototype.contains = function(mouse_x, mouse_y) {
    "use strict";
    //
    // USE parseFloat() WHEN ADDING BUMBERS BECAUSE + CONCATS THEM AS A STRING
    //
	var calc_x, calc_y; 
    calc_x = parseFloat(this.x) + parseFloat(this.selection_x)+parseFloat(this.page_center_x_coord)+parseFloat(this.item_transform_x) - parseFloat(this.page_width/2)+parseFloat(this.tub['page_info']['center_offset']);
    calc_y = parseFloat(this.y) + parseFloat(this.selection_y)+parseFloat(this.page_center_y_coord)+parseFloat(this.item_transform_y) + 50;
    
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
            console.log('TextFrame contains');	
    }
    
    return  (calc_x <= mouse_x) && 
    		(parseFloat(calc_x) + parseFloat(this.w) >= mouse_x) && 
    		(calc_y <= mouse_y) && 
    		(parseFloat(calc_y) + parseFloat(this.h) >= mouse_y);
};

TextFrame.prototype.alt_contains = function(ctx, mouse_x, mouse_y) {
    "use strict";

    return false;
};







// Called on mouse click
TextFrame.prototype.clear_selection = function(){
    // Clear any selection on click
	this.lines_selected = [];
};






// Called on mouse click
TextFrame.prototype.type_tool = function(ctx, mouse_event){
	
	console.log('INSIDE TYPE_TOOL');
	
	//console.log(this);
	
    // Clear any selection on click
	this.lines_selected = [];
	
	
	
	var calc_x, calc_y, half;
	calc_x = parseFloat(this.x) + parseFloat(this.selection_x)+parseFloat(this.page_center_x_coord)+parseFloat(this.item_transform_x) - parseFloat(this.page_width/2);
    calc_y = parseFloat(this.y) + parseFloat(this.selection_y)+parseFloat(this.page_center_y_coord)+parseFloat(this.item_transform_y);
    
    var spread_offestx, spread_offsety;
    spread_offestx = parseFloat(this.tub['page_info']['center_offset']);
    spread_offsety = parseFloat(50);
    
    // 15 is the rulers
	calc_x = calc_x + spread_offestx+17;
	calc_y = calc_y + spread_offsety+16;
	// calc_x = calc_x + spread_offestx+15;
	// calc_y = calc_y + spread_offsety+15;

	
	//if(this.canvas_state.selection === this){
		
		
		
	// this will always be true, as mousedown destroys the cursor then creates it 
	// but keep it here as a check
	if(document.getElementById('type_tool_cursor') == null){ 


		console.log('=================='+this.story_id);
		// console.log(this.tub['stories']);
// 		
		// this.text_content = this.tub['stories'][this.story_id].Story.ParagraphStyleRange.CharacterStyleRange.Content;
		// console.log('-------------');
		// console.log(this.tub['stories']);
// 		
		// console.log('-------------');


		var p_textframe = this;

		this.canvas_state.text_tracker = new TextTracker(ctx, p_textframe);
		this.canvas_state.text_tracker.set_position(0,0);


		// INIT THEN 
		var temp = document.getElementById(this.canvas_state.canvas.id);
		var attribute = document.createAttribute("tabindex");
		attribute.value = 0;
		temp.setAttributeNode(attribute); 
		
		
		
		this.canvas_state.cursor = document.createElement('div');
		this.canvas_state.cursor.setAttribute("id", "type_tool_cursor");
		this.canvas_state.cursor.style.position = 'absolute';
		this.canvas_state.cursor.style.width = '1px';
		// this.canvas_state.cursor.style.borderLeft = "1px solid #FFF";
		this.canvas_state.cursor.style.height = (parseFloat(this.line_point_size[this.canvas_state.text_tracker.line])+2)+'px';//this.editor.getFontMetrics().getHeight() + 'px';
		this.canvas_state.cursor.style.backgroundColor = '#FFFFFF';
		  
		this.canvas_state.cursor.style.left = calc_x+'px';
		this.canvas_state.cursor.style.top = calc_y+'px';
		  
		document.getElementById('interface').appendChild(this.canvas_state.cursor);
		
		this.canvas_state.cursor.blink_interval = 500;
		
		
		var temp_cs = this.canvas_state;
		// this.canvas_state.cursor_interval_pointer = setInterval(function() { blink(temp_cs); }, this.canvas_state.cursor.blink_interval);
		// this.canvas_state.canvas.addEventListener("keydown", keydown_handler.bind(this)); // bind give context - http://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-context-inside-a-callback
		// this.canvas_state.canvas.addEventListener("keyup", keyup_handler.bind(this));
	//}


/****************/
		// CURSOR
		// MOVE CURSOR TO POSITION
		var mouse = this.canvas_state.getMouse(mouse_event);
        var mouse_x = mouse.x;
        var mouse_y = mouse.y;
		dom_ele = document.getElementById('type_tool_cursor');
		
		var sy=calc_y; 
		var sx=calc_x-1;
		this.canvas_state.text_tracker.line=0;
		this.canvas_state.text_tracker.column=0;
		
		//
		// While the mouse is Bigger and so Below the current Y val INCREASE the LINE count and move CURSOR...
		//		
		// Take AWAY point_size so FIRST line can be selected...
		


		ctx.fillStyle = this.line_fill_color[this.canvas_state.text_tracker.line];
		ctx.font = this.line_styles[this.canvas_state.text_tracker.line];

		// console.log('TEXT TRACKER1');
		// console.log(this.canvas_state.text_tracker);
// 		
		// console.log('~~~~~~~~~~~~~~~~~~~~~~~');
		// console.log(this.canvas_state.text_tracker.tf_point_size);
		// console.log(this.canvas_state.text_tracker.tf_text_font);
// 		
		// console.log('~~~~~~~~~~~~~~~~~~~~~~~');
		// this.canvas_state.text_tracker.tf_point_size = this.point_size;
		// this.canvas_state.text_tracker.tf_text_font = this.text_font;
// 		
		// console.log(this.canvas_state.text_tracker.tf_point_size);
		// console.log(this.canvas_state.text_tracker.tf_text_font);		
		// console.log('~~~~~~~~~~~~~~~~~~~~~~~');
		
		

		console.log('LINE DATA X '+mouse_x+', '+sx );
		console.log('LINE DATA Y '+mouse_y+', '+sy );
		console.log(this.canvas_state.text_tracker.lines.length);
		console.log(this.canvas_state.text_tracker.lines);


				// p_this.line_styles.push(p_this.point_size+"px "+p_this.font_style);
				// p_this.line_fill_color.push(p_this.fill_colour);
				// p_this.line_leading.push(p_this.leading);
				// p_this.line_point_size.push(p_this.point_size);


		while(mouse_y > (sy+parseFloat(this.line_leading[this.canvas_state.text_tracker.line])) 
				&& (this.canvas_state.text_tracker.line < this.canvas_state.text_tracker.lines.length) ){  
			
			ctx.fillStyle = this.line_fill_color[this.canvas_state.text_tracker.line];
			ctx.font = this.line_styles[this.canvas_state.text_tracker.line];
			
			//console.log('INIT LINE1='+this.canvas_state.text_tracker.line);
			
			if(this.canvas_state.text_tracker.lines.length > 1){
				sy = sy+parseFloat(this.line_leading[this.canvas_state.text_tracker.line]);
				dom_ele.style.top = sy+'px';
	
				this.canvas_state.text_tracker.line = (parseInt(this.canvas_state.text_tracker.line)+1);
			}else{
				dom_ele.style.top = sy+'px';
				break;
			}
			
			console.log('LINE DATA Y '+mouse_y+', '+sy );
		}
		while(mouse_x+( parseFloat(this.line_point_size[this.canvas_state.text_tracker.line]) ) > sx){ 
			
			ctx.fillStyle = this.line_fill_color[this.canvas_state.text_tracker.line];
			ctx.font = this.line_styles[this.canvas_state.text_tracker.line];
		
			// Update the tracker so peek is accurate
			this.canvas_state.text_tracker.tf_point_size = this.line_leading[this.canvas_state.text_tracker.line];
			this.canvas_state.text_tracker.tf_text_font = this.line_font[this.canvas_state.text_tracker.line];
			// Get width to move
			var move_by = this.canvas_state.text_tracker.peek_character_width();
			var a = this.canvas_state.text_tracker.lines;
			var b = this.canvas_state.text_tracker.line
			
			if(parseInt(this.canvas_state.text_tracker.column) < parseInt(a[b].length)){
				sx = sx+parseFloat(move_by);
				dom_ele.style.left = sx+'px';
	
				this.canvas_state.text_tracker.column = (parseInt(this.canvas_state.text_tracker.column)+1);
			}else{
				dom_ele.style.left = sx+'px';
				break;
			}
			
			console.log('LINE DATA X '+mouse_x+', '+sx+'   /  width increment = '+move_by );
		}
		this.lines_selected_start.line = this.canvas_state.text_tracker.line;
		this.lines_selected_start.column = this.canvas_state.text_tracker.column;
		
		console.log('INIT CURSOR LANDED AT '+this.canvas_state.text_tracker.line+', '+this.canvas_state.text_tracker.column);

	}else{
		
	    // Clear any selection on click
		this.lines_selected = [];

		// CURSOR
		var mouse = this.canvas_state.getMouse(mouse_event);
        var mouse_x = mouse.x;
        var mouse_y = mouse.y;
		dom_ele = document.getElementById('type_tool_cursor');
		
		var sy=calc_y; 
		var sx=calc_x;
		this.canvas_state.text_tracker.line=0;
		this.canvas_state.text_tracker.column=0;
		
		//
		// While the mouse is Bigger and so Below the current Y val INCREASE the LINE count and move CURSOR...
		//		
		// Take AWAY point_size so FIRST line can be selected...
		while(mouse_y > (sy+parseFloat(this.line_leading[this.canvas_state.text_tracker.line])) 
				&& (this.canvas_state.text_tracker.line < this.canvas_state.text_tracker.lines.length) ){  
			
			ctx.fillStyle = this.line_fill_color[this.canvas_state.text_tracker.line];
			ctx.font = this.line_styles[this.canvas_state.text_tracker.line];
			
			//console.log('INIT LINE1='+this.canvas_state.text_tracker.line);
			
			if(this.canvas_state.text_tracker.lines.length > 1){
				sy = sy+parseFloat(this.line_leading[this.canvas_state.text_tracker.line]);
				dom_ele.style.top = sy+'px';
	
				this.canvas_state.text_tracker.line = (parseInt(this.canvas_state.text_tracker.line)+1);
			}else{
				dom_ele.style.top = sy+'px';
				break;
			}
		}
		while(mouse_x+( parseFloat(this.line_point_size[this.canvas_state.text_tracker.line]) ) > sx){ 
			
			ctx.fillStyle = this.line_fill_color[this.canvas_state.text_tracker.line];
			ctx.font = this.line_styles[this.canvas_state.text_tracker.line];
			
			// Update the tracker so peek is accurate
			this.canvas_state.text_tracker.tf_point_size = this.line_leading[this.canvas_state.text_tracker.line];
			this.canvas_state.text_tracker.tf_text_font = this.line_font[this.canvas_state.text_tracker.line];
			// Get width to move
			var move_by = this.canvas_state.text_tracker.peek_character_width();
			var a = this.canvas_state.text_tracker.lines;
			var b = this.canvas_state.text_tracker.line
			
			if(parseInt(this.canvas_state.text_tracker.column) < parseInt(a[b].length)){
				sx = sx+parseFloat(move_by);
				dom_ele.style.left = sx+'px';
	
				this.canvas_state.text_tracker.column = (parseInt(this.canvas_state.text_tracker.column)+1);
			}else{
				dom_ele.style.left = sx+'px';
				break;
			}
		}
		this.lines_selected_start.line = this.canvas_state.text_tracker.line;
		this.lines_selected_start.column = this.canvas_state.text_tracker.column;
		
		console.log('CURSOR LANDED AT '+this.canvas_state.text_tracker.line+', '+this.canvas_state.text_tracker.column);
		
	}
	


	
};












































function TextTracker(ctx, p_textframe){
	this.ctx = ctx;
	this.p_textframe = p_textframe;
	// this.text = p_textframe.text_content;
	this.lines = p_textframe.lines;
	this.line = 0;
	this.column = 0;
	this.tf_point_size = p_textframe.point_size;
	this.tf_text_font = p_textframe.text_font;
}

TextTracker.prototype.set_position = function(line, column){
	this.line = line;
	this.column = column;
};

TextTracker.prototype.get_position = function(){
	return {line: this.line, column: this.column};
};

TextTracker.prototype.insert_character = function(input_char){
	var txt = this.lines[this.line];
	txt = [ txt.slice(0, this.column), input_char, txt.slice(this.column) ].join('');
	this.lines[this.line] = txt;
	//this.column = this.column+1;
	
	var dom_ele = document.getElementById('type_tool_cursor');
	
	var sx, sy, reset_x_val;
	sx=0; 
	sy=0;
	sx = parseFloat(dom_ele.style.left.substr(0, dom_ele.style.left.length-2));
	sy = parseFloat(dom_ele.style.top.substr(0, dom_ele.style.top.length-2));

	// Get width to move
	// var move_by = this.canvas_state.text_tracker.peek_character_width();
	
	this.ctx.font = this.tf_point_size+"px "+this.tf_text_font;
	var move_by = this.ctx.measureText(input_char).width;;
	
	sx = sx+parseFloat(move_by);
	dom_ele.style.left = sx+'px';
	this.column = this.column+1;
	
	
	this.rearrange_lines();
};

// TextTracker.prototype.get_character = function(){
	// var character, txt = this.text;
// 	
	// console.log('COL_VAL='+this.column);
	// if(this.column > 0){
		// character = txt.slice(this.column-1, this.column);
	// }
// };

TextTracker.prototype.peek_character_width = function(){
	var character;
	
	if(typeof this.lines[this.line] == 'undefined'){
		return 0;
	}
	
	var row = this.lines[this.line];
	var characters = row.split('');
	
	character = characters[this.column];
	
	//
	// Without this the measurment is wrong...
	//
	this.ctx.font = this.tf_point_size+"px "+this.tf_text_font;
	
	//console.log('Point='+this.tf_point_size+'  CHARACTER= '+character+' - width= '+ this.ctx.measureText(character).width);
	
	if(typeof character == 'undefined'){
		return 0;		
	}else{
		return this.ctx.measureText(character).width;	
	}
};

TextTracker.prototype.backspace = function(){
	
	dom_ele = document.getElementById('type_tool_cursor');
	var sx;
	sx=0; 
	sx = parseFloat(dom_ele.style.left.substr(0, dom_ele.style.left.length-2));
	
	// DEAL WITH CURSOR
	
	// Move first to reverse it properly with peek
	this.column -= 1;
	
	// Update the tracker so peek is accurate
	this.canvas_state.text_tracker.tf_point_size = this.line_leading[this.canvas_state.text_tracker.line];
	this.canvas_state.text_tracker.tf_text_font = this.line_font[this.canvas_state.text_tracker.line];
	
	// Get width to move
	var move_by = this.peek_character_width();
	sx = sx-parseFloat(move_by);
	dom_ele.style.left = sx+'px';
	
	
	// DEAL WITH CONTENT
	var txt = this.lines[this.line];
	txt = [ txt.slice(0, this.column), txt.slice(this.column+1) ].join('');
	this.lines[this.line] = txt;
};

TextTracker.prototype.del = function(){
	var txt = this.lines[this.line];
	txt = [ txt.slice(0, this.column), txt.slice(this.column+1) ].join('');
	this.lines[this.line] = txt;
};

//
// This will check the words on a line do not go past WIDTH of box,
// if they do it will cut and prefix to the next line. Not ideal...
//

TextTracker.prototype.rearrange_lines = function(){
	
	var loop_break = 20;
	
	for(var j = 0; j != this.lines.length; j++){
		
		if(loop_break == 0){
			return;
		}
		
		var txt = this.lines[j];
		
		// Split line into words
		words = txt.split(' ');
		var test_count = 0;
		var words; // = text.split(' ');
		var row = '';
		var current_width = 0;
		var wrap_width = Math.round(this.p_textframe.w);
		var wrap_height = Math.round(this.p_textframe.h);

		for(var i = 0; i < words.length; i++){
		
			var word = words[i];
			var word_width = 0;
			word_width = this.ctx.measureText(word).width;
			var test_width = 0;
			test_width = parseFloat(current_width) + parseFloat(word_width) + 15; // 15 is ruller..?
			
			if( test_width < this.p_textframe.w ){
				row += word+' '; // <- the space stripped by split...
				current_width = parseFloat(current_width) + parseFloat(word_width);
			}else{
				console.log('WRAP LINES....');
				this.lines[j] = row;
				row = '';
				//row = word;
				current_width = 0;
				
				this.lines[j+1] = word+' '+this.lines[j+1];
			}
		}
		loop_break -= 1;
	}
	
};






