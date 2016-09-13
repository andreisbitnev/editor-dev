function SelectionSquare(state, x, y, w, h, fill, stroke){
    "use strict";
    
    this.state = state;
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 1;
    this.h = h || 1;
    this.fill = fill || '#AAAAAA';
    //this.fill = fill || '#2A29B5';
    this.stroke = stroke || '#FFF';
}
SelectionSquare.prototype.draw = function(ctx, optionalColor){
    "use strict";
    // translate X, Y
	context.translate(0.5, 0.5);
	
    // These are the small squares that the user clicks and drags 
    var i, cur, half;
    ctx.lineWidth = 1;
    ctx.fillStyle = this.fill;
    ctx.strokeStyle = this.stroke;
    ctx.fillRect(this.x, this.y, this.w, this.h);
};
SelectionSquare.prototype.contains = function(mouse_x, mouse_y) {
    "use strict";
    // All we have to do is make sure the Mouse X,Y fall in the area between
    // the shape's X and (X + Height) and its Y and (Y + Height)
    return  (this.x <= mouse_x) && (this.x + this.w >= mouse_x) &&
            (this.y <= mouse_y) && (this.y + this.h >= mouse_y);
};





function CanvasStateMachine(canvas, tub){
    "use strict";
    // **** First some setup! ****

    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    this.tub = tub;
    this.selection_mode = 'normal_selection'; // normal_selection', alt_selection, type_tool
    //this.current_shape = null;
    this.cursor = null;
    this.cursor_interval_pointer = null;
    this.text_tracker;
    
    this.font_size;
	this.font_face;
	this.font_color;
	this.dom_ele = null;
    this.selection_font_size;
	this.selection_font_face;
	this.selection_font_color;

    // This complicates things a little but but fixes mouse co-ordinate problems
    // when there's a border or padding. See getMouse for more detail
    //
    var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop, html, current_state, i;

    if (document.defaultView && document.defaultView.getComputedStyle) {
        this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null).paddingLeft, 10)      || 0;
        this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null).paddingTop, 10)       || 0;
        this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null).borderLeftWidth, 10)  || 0;
        this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null).borderTopWidth, 10)   || 0;
    }
    // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
    // They will mess up mouse coordinates and this fixes that
    html = document.body.parentNode;
    this.htmlTop = html.offsetTop;
    this.htmlLeft = html.offsetLeft;


    // **** Keep track of state! ****
    this.valid = false; // when set to false, the canvas will redraw everything
    this.shapes = [];  // the collection of things to be drawn
    this.dragging = false; // Keep track of when we are dragging
    this.resize_dragging = false; // Keep track of resize
    this.expect_resize = -1; // save the # of the selection handle
    
    // the current selected object. turn this into an array for multiple selection
    this.selection = null;
    
    this.dragoffx = 0; // See mousedown and mousemove events for explanation
    this.dragoffy = 0;



    // New, holds the 8 tiny boxes that will be our selection handles
    // the selection handles will be in this order:
    // 0  1  2
    // 3     4
    // 5  6  7
    this.selection_handles = [];
    for (i = 0; i < 8; i += 1) {
        this.selection_handles.push(new SelectionSquare(this));
    }
		
    // **** Then events! ****

    // This is an example of a closure!
    // Right here "this" means the CanvasStateMachine. But we are making events on the Canvas itself,
    // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
    // Since we still want to use this particular CanvasStateMachine in the events we have to save a reference to it.
    // This is our reference!
    current_state = this;
    
    //fixes a problem where double clicking causes text to get selected on the canvas
    this.canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);

    // Up, down, and move are for dragging
    this.canvas.addEventListener('mousedown', function(e) {


//
//
// PUTTING THIS HERE CAUSED THE EVENT TO BE BOUND TWICE.....
//
//

// BUT NOT REMOVING IT LEAVES THE CURSOR THERE...?

		// destory the cursor element thats dynamically created regardless
	    if(document.getElementById('type_tool_cursor') != null){
	    	console.log('(type_tool_cursor).remove()');

    		// Remove any existing listeners first
	    	current_state.canvas.removeEventListener("keydown", keydown_handler);
	    	document.getElementById(current_state.canvas.id).removeAttribute("tabindex");

	    	document.getElementById('type_tool_cursor').remove();
	    	clearInterval(current_state.cursor_interval_pointer);
	    	current_state.cursor_interval_pointer = null;

	    	current_state.cursor = null;
	    }




        var mouse, mouse_x, mouse_y, shapes, l, i, mySel;

        if (current_state.expect_resize !== -1) {
            current_state.resize_dragging = true;
            return;
        }

        mouse = current_state.getMouse(e);
        mouse_x = mouse.x;
        mouse_y = mouse.y;
        shapes = current_state.shapes;
        l = shapes.length;

		// Loop each shape
		// Use shapes own detection and pass it mouse X and Y
		console.log('CSM mousedown selection_mode = '+current_state.selection_mode);
        for (i = l-1; i >= 0; i -= 1){

        	// Clear any existing selection
        	shapes[i].lines_selected = [];

        }

        for (i = l-1; i >= 0; i -= 1){
        	// THIS IS WRONG.....REFACTOR LATER...
        	if(current_state.selection_mode == 'normal_selection'){

	            if (shapes[i].contains(mouse_x, mouse_y)) {
	                mySel = shapes[i];
	                // Keep track of where in the object we clicked
	                // so we can move it smoothly (see mousemove)
	                current_state.dragoffx = mouse_x - mySel.x;
	                current_state.dragoffy = mouse_y - mySel.y;
	                current_state.dragging = true;
	                current_state.selection = mySel;
	                current_state.valid = false;
	                return;
	            }
           	}


        	if(current_state.selection_mode == 'alt_selection'){
	        	// THIS IS WRONG.....

	        	console.log('SHAPE IS...');
	        	console.log(shapes[i]);
	        	console.log('----------');


	            if (shapes[i].alt_contains(current_state.ctx, mouse_x, mouse_y)) {
	                mySel = shapes[i];
	                // Keep track of where in the object we clicked
	                // so we can move it smoothly (see mousemove)
	                current_state.dragoffx = mouse_x - mySel.x;
	                current_state.dragoffy = mouse_y - mySel.y;
	                current_state.dragging = true;
	                current_state.selection = mySel;
	                current_state.valid = false;
	                return;
	            }
           	}



        	// if(shapes[i].page_item_type == 'TextFrame'){
    			// shapes[i].clear_selection();
        	// }
        	if(current_state.selection_mode == 'type_tool'){

	            if (shapes[i].contains(mouse_x, mouse_y)) {

                	// Only init the editor for actual text objects
                	if(shapes[i].page_item_type == 'TextFrame'){



						// // destory the cursor element thats dynamically created regardless
					    // if(document.getElementById('type_tool_cursor') != null){
					    	// console.log('(type_tool_cursor).remove()');
//
				    		// // Remove any existing listeners first
					    	// this.canvas_state.canvas.removeEventListener("keydown", keydown_handler);
					    	// document.getElementById(current_state.canvas.id).removeAttribute("tabindex");
//
					    	// document.getElementById('type_tool_cursor').remove();
					    	// clearInterval(current_state.cursor_interval_pointer);
					    	// current_state.cursor_interval_pointer = null;
//
					    	// current_state.cursor = null;
					    // }



            			console.log('FSM mousedown type_tool called...');
            			var p_ctx = current_state.getContext(e);
            			shapes[i].type_tool(p_ctx, e);
                	}

	                mySel = shapes[i];


					// This updates the options so the values of the text field
							var size_str = '';
							size_str += '<option value="'+Math.floor(mySel.point_size/4)+'">'+Math.floor(mySel.point_size/4)+'px</option>';
							size_str += '<option value="'+Math.floor(mySel.point_size/2)+'">'+Math.floor(mySel.point_size/2)+'px</option>';
							size_str += '<option value="'+mySel.point_size+'" selected>'+mySel.point_size+'px</option>';
							size_str += '<option value="'+Math.ceil(mySel.point_size*2)+'">'+Math.ceil(mySel.point_size*2)+'px</option>';
							size_str += '<option value="'+Math.ceil(mySel.point_size*4)+'">'+Math.ceil(mySel.point_size*4)+'px</option>';
							$("#font_size").html(size_str);


				            var face_str = '';
							var fonts = ["Minion Pro", "Helvetica", "Times", "Courier", "Verdana", "Tahoma"];
							for (var i = 0; i < fonts.length; i++) {

							    if(fonts[i] == mySel.font_style){
							    	face_str += '<option value="'+fonts[i]+'" selected>'+fonts[i]+'</option>';
							    }else{
							    	face_str += '<option value="'+fonts[i]+'">'+fonts[i]+'</option>';
							    }

							}
				            $("#font_face").html(face_str);


							var color_str = '';
							var colors = tub['color_palette'].color_palette.Color;
							for (var i = 0; i < colors.length; i++) {
								var fill_colour = colors[i]['@attributes'].ColorValue;
								fill_colour = fill_colour.split(' ');

								var c,m,y,k;
								c = fill_colour[0];
								m = fill_colour[1];
								y = fill_colour[2];
								k = fill_colour[3];

								var cc = ColorConverter.toRGB(new CMYK(c, m, y, k));
								var rgb_colour = 'rgba('+cc.r+','+cc.g+','+cc.b+',1)';

							    if(rgb_colour == mySel.fill_colour){
							    	color_str += '<option value="'+rgb_colour+'" style="color:'+rgb_colour+';" selected>'+colors[i]['@attributes'].Self+'</option>';
							    }else{
							    	color_str += '<option value="'+rgb_colour+'" style="color:'+rgb_colour+';">'+colors[i]['@attributes'].Self+'</option>';
							    }
							}
							$("#font_color").html(color_str);



	                // Keep track of where in the object we clicked
	                // so we can move it smoothly (see mousemove)
	                current_state.dragoffx = mouse_x - mySel.x;
	                current_state.dragoffy = mouse_y - mySel.y;
	                //current_state.dragging = false;
	                current_state.dragging = true;
	                current_state.selection = mySel;
	                current_state.valid = true;
	                return;
	            }
           	}


        }

        // havent returned means we have failed to select anything.
        // If there was an object selected, we deselect it
        if (current_state.selection) {
            current_state.selection = null;
            current_state.valid = false; // Need to clear the old selection border
        }





	    // Destory any setup for current tool as nothing is selected
	    if(current_state.selection_mode == 'type_tool' && Object.prototype.toString.call(document.getElementById('type_tool_cursor')) != '[object Null]'){
	    	//console.log('CSM mousedown text off');

	    	// current_state.canvas.removeEventListener("keydown", keydown_handler);
	    	// document.getElementById(current_state.canvas.id).removeAttribute("tabindex");
	    	// document.getElementById('type_tool_cursor').remove();
	    }


    }, true); // End mouse down


    

    this.canvas.addEventListener('mousemove', function(e){
    	
    	//current_state.valid = false;

        var mouse = current_state.getMouse(e),
                mouse_x = mouse.x,
                mouse_y = mouse.y,
                oldx, oldy, i, cur;



		// ADD NEGATIVE RULER OFFSET......
	    mouse_x -= parseFloat(tub['page_info']['center_offset']);
	    mouse_y -= parseFloat(50);
	    
	    
	    


		//console.log('MOUSE X='+mouse_x+'  Y='+mouse_y+'   MODE='+current_state.selection_mode);
        if (current_state.dragging){
    		
            mouse = current_state.getMouse(e);
    		
    		if(current_state.selection_mode == 'normal_selection'){
	            // We don't want to drag the object by its top-left corner, we want to drag it
	            // from where we clicked. Thats why we saved the offset and use it here
	            current_state.selection.x = mouse.x - current_state.dragoffx;
	            current_state.selection.y = mouse.y - current_state.dragoffy;
    		}
    		
    		if(current_state.selection_mode == 'alt_selection'){
	            // We don't want to drag the object by its top-left corner, we want to drag it
	            // from where we clicked. Thats why we saved the offset and use it here
	            current_state.selection.alt_x = mouse.x - current_state.dragoffx;
	            current_state.selection.alt_y = mouse.y - current_state.dragoffy;
    		}
    		
    		
        	if(current_state.selection_mode == 'type_tool'){
        		
				// destory the cursor element
			    if(document.getElementById('type_tool_cursor') != null){
			    	console.log('(type_tool_cursor).remove()');
			    	
			    	document.getElementById('type_tool_cursor').remove();      
			    	clearInterval(current_state.cursor_interval_pointer);  
			    	current_state.cursor_interval_pointer = null;    
			    	
			    	current_state.cursor = null;	
			    }
        		
        		
				var calc_x, calc_y, half;
				calc_x = parseFloat(current_state.selection.x) + parseFloat(current_state.selection.selection_x)+parseFloat(current_state.selection.page_center_x_coord)+parseFloat(current_state.selection.item_transform_x) - parseFloat(current_state.selection.page_width/2);
			    calc_y = parseFloat(current_state.selection.y) + parseFloat(current_state.selection.selection_y)+parseFloat(current_state.selection.page_center_y_coord)+parseFloat(current_state.selection.item_transform_y);
			    
			    var spread_offestx, spread_offsety;
			    spread_offestx = parseFloat(current_state.selection.tub['page_info']['center_offset']);
			    spread_offsety = parseFloat(50);
			    
			    // 15 is the rulers
				calc_x = calc_x + spread_offestx+17;
				calc_y = calc_y + spread_offsety+16;
	
	
        		
        		
        		// DRAG THE CURSOR....
				var mouse = current_state.getMouse(e);
		        var mouse_x = mouse.x;
		        var mouse_y = mouse.y;
				//var dom_ele = document.getElementById('type_tool_cursor');
				
				var sy=calc_y; 
				var sx=calc_x;
				current_state.text_tracker.line=0;
				current_state.text_tracker.column=0;
				
				// CURSOR
				//
				// While the mouse is Bigger and so Below the current Y val INCREASE the LINE count and move CURSOR...
				//		
				// Take AWAY point_size so FIRST line can be selected...

				/*********************************
				while(mouse_y > sy 
						&& (current_state.text_tracker.line < current_state.text_tracker.lines.length) ){  
						 	
					sy = sy+parseFloat(current_state.text_tracker.tf_point_size);
					//dom_ele.style.top = sy+'px';
		
					current_state.text_tracker.line = (parseInt(current_state.text_tracker.line)+1);
				}
				
				var a = current_state.text_tracker.lines;
				var b = current_state.text_tracker.line
				
				//while(mouse_x > sx){
				while(mouse_x+( parseFloat(current_state.text_tracker.tf_point_size) ) > sx){ 
									// Get width to move
					var move_by = current_state.text_tracker.peek_character_width();
					sx = sx+parseFloat(move_by);
					//dom_ele.style.left = sx+'px';
		
					current_state.text_tracker.column = (parseInt(current_state.text_tracker.column)+1);
				}
				/**********************************/



				

		while(mouse_y > sy 
				&& (current_state.text_tracker.line < current_state.text_tracker.lines.length) ){  
			
			console.log('INIT LINE1='+current_state.text_tracker.line);
			
			if(current_state.text_tracker.lines.length > 1){
				sy = sy+parseFloat(current_state.selection.line_point_size[current_state.text_tracker.line]);
				dom_ele.style.top = sy+'px';
	
				current_state.text_tracker.line = (parseInt(current_state.text_tracker.line)+1);
			}else{
				dom_ele.style.top = sy+'px';
				break;
			}
		}
		while(mouse_x+( parseFloat(current_state.selection.line_point_size[current_state.text_tracker.line]) ) > sx){ 
							// Get width to move
							
			// Update the tracker so peek is accurate
			current_state.text_tracker.tf_point_size = current_state.selection.line_leading[current_state.text_tracker.line];
			current_state.text_tracker.tf_text_font = current_state.selection.line_font[current_state.text_tracker.line];
							
			var move_by = current_state.text_tracker.peek_character_width();
			var a = current_state.text_tracker.lines;
			var b = current_state.text_tracker.line
			
			if(parseInt(current_state.text_tracker.column) < parseInt(a[b].length)){
				sx = sx+parseFloat(move_by);
				dom_ele.style.left = sx+'px';
	
				current_state.text_tracker.column = (parseInt(current_state.text_tracker.column)+1);
			}else{
				dom_ele.style.left = sx+'px';
				break;
			}
		}

				
				
				
				console.log('DRAGGIN CURSOR LANDED AT '+current_state.text_tracker.line+', '+current_state.text_tracker.column);
		        		
				current_state.selection.lines_selected_current.line = current_state.selection.canvas_state.text_tracker.line;
				current_state.selection.lines_selected_current.column = current_state.selection.canvas_state.text_tracker.column;
        		
        		
        		
                console.log('TEXT HIGHLIGHT BOUNDS...');
    			console.log('Cursor start='+current_state.selection.lines_selected_start.line+', '+current_state.selection.lines_selected_start.column);
    			console.log('Cursor current='+current_state.selection.lines_selected_current.line+', '+current_state.selection.lines_selected_current.column);
    			
				// this.lines_selected_start = {line: 0, column: 0};
				// this.lines_selected_current = {line: 0, column: 0};
					
	            console.log(current_state.selection.lines_selected);
	            console.log('');
	            
	            
	            // GENERATE SELECTION ARRAY
	            current_state.selection.lines_selected = []; // initialise each time
	            
	            var sl, sc, cl, cc;
	            var start_line, start_column, stop_line, stop_column;
	            
	            sl = current_state.selection.lines_selected_start.line;
	            sc = current_state.selection.lines_selected_start.column;
	            cl = current_state.selection.lines_selected_current.line;
	            cc = current_state.selection.lines_selected_current.column;
	            
	            console.log('DRAG VALS  '+sl+' '+sc+'    '+cl+' '+cc);
	            
	            if(sl < cl){ // dragging down
	            	
	            	console.log('dragging down');
					start_line = sl;
					start_column = sc;
					
					stop_line = cl;
					stop_column = cc;
	            	
	            }else if(sl > cl){ // dragging up
	            	
	            	console.log('dragging up');
					start_line = cl;
					start_column = cc;
					
					stop_line = sl;
					stop_column = sc;
	            	
	            }else if(sl == cl){ // dragging on same line
	            
	            	if(sc < cc){ //dragging right on same line
	            	
	            		console.log('dragging right on same line');	
						start_line = sl;
						start_column = sc;
						
						stop_line = cl;
						stop_column = cc;
	            		
	            	}else if(sc > cc){ //dragging left on same line
	            		
	            		console.log('dragging left on same line');
						start_line = cl;
						start_column = cc;
						
						stop_line = sl;
						stop_column = sc;
	            		
	            	}else{
	            		console.log('text selection error...');
	            	}
	            }
	            
	            // console.log('DRAG VALS2  '+start_line+' '+start_column+'    '+stop_line+' '+stop_column);
	            
	            
	            // DO THE ACTUAL ARRAY GENERATION
	            for(var i=start_line; i <= stop_line; i++){
	            	
	            	// if(typeof current_state.selection.lines_selected[i] == 'undefined'){
	            		// continue;
	            	// }
	            	
	            	current_state.selection.lines_selected[i] = [];
	            	
	            	if(i == stop_line){
	            		
	            		var start_count_at;
	            		if(current_state.text_tracker.lines > 0){ // there is more than one line
	            			start_count_at = 0;
	            		}else{
	            			start_count_at = start_column;
	            		}
	            		
	            		
			            //for(var j=start_count_at; j <= stop_column; j++){
			            //for(var j=start_column; j <= stop_column; j++){	
		            	for(var j=0; j < stop_column; j++){
			            	if(j < parseInt(a[i].length)){
			            		
				            	if(typeof current_state.selection.lines_selected[i] == 'undefined'){
				            		continue;
				            	}
			            		
			            		current_state.selection.lines_selected[i].push(j);	
			            	}else{
			            		continue;
			            	}
			            }
	            		
	            	}else{
	            		var a = current_state.text_tracker.lines;

						if(i == start_line){ // Highlight from the start, not column position
				            for(var j=start_column; j <= parseInt(a[i].length); j++){
				            	
				            	if(typeof current_state.selection.lines_selected[i] == 'undefined'){
				            		continue;
				            	}
				            	
				            	current_state.selection.lines_selected[i].push(j);	
				            }
						}else{

				            for(var j=0; j <= parseInt(a[i].length); j++){
				            	
				            	if(typeof current_state.selection.lines_selected[i] == 'undefined'){
				            		continue;
				            	}
				            	
				            	current_state.selection.lines_selected[i].push(j);	
				            }
							
						}
	            	}
	            	
	            	

	            }
	            
	            
	            console.log(current_state.selection.lines_selected);
	            console.log('');
	            
	            
	            
	            
	            
	            
	            
           	}
    		

            current_state.valid = false; // Something's dragging so we must redraw

        } else if (current_state.resize_dragging) {

    		if(current_state.selection_mode == 'normal_selection'){
		        oldx = current_state.selection.x;
		        oldy = current_state.selection.y;
	            current_state.selection.resize(current_state, mouse_x, mouse_y, oldx, oldy);
    		}
    		if(current_state.selection_mode == 'alt_selection'){
	            oldx = current_state.selection.alt_x;
	            oldy = current_state.selection.alt_y;
	            current_state.selection.alt_resize(current_state, mouse_x, mouse_y, oldx, oldy);
    		}

            current_state.valid = false; // Something's dragging so we must redraw
        }


        // if there's a selection see if we grabbed one of the selection handles
        if (current_state.selection !== null && !current_state.resize_dragging) {


        	if(current_state.selection_mode == 'type_tool'){
        		
                if (mouse_x >= current_state.x && mouse_x <= parseFloat(current_state.x) + parseFloat(current_state.w) &&
                        mouse_y >= current_state.y && mouse_y <= parseFloat(current_state.y) + parseFloat(current_state.y)   ) {
        		
	        		this.style.cursor='text';
        		}else{
	            	this.style.cursor = 'auto';
        		}
        		current_state.valid = false;
	        		
        	}else{
        		
		        	// Loop through the handles
		            for (i = 0; i < 8; i += 1) {
		                // 0  1  2
		                // 3     4
		                // 5  6  7
		
		                cur = current_state.selection_handles[i];
		
						//console.log('HANDLES MOUSE XY = '+mouse_x+' - '+mouse_y); // CANVAS XY FROM TOP-LEFT...
						//console.log('HANDLES CUR XY = '+cur.x+' - '+cur.y);
		
						// console.log('HANDLE '+i+'  -  HANDLES MOUSE XY = '+mouse_x+' - '+mouse_y);
						// console.log(cur);
		
		
		
		                // we dont need to use the ghost context because
		                // selection handles will always be rectangles
		                if (mouse_x >= cur.x && mouse_x <= cur.x + current_state.selection_boxsize &&
		                        mouse_y >= cur.y && mouse_y <= cur.y + current_state.selection_boxsize) {
		                    // we found one!
		                    current_state.expect_resize = i;
		                    current_state.valid = false;
		
		                    switch (i) {
		                        case 0:
		                            this.style.cursor='nw-resize';
		                            break;
		                        case 1:
		                            this.style.cursor='n-resize';
		                            break;
		                        case 2:
		                            this.style.cursor='ne-resize';
		                            break;
		                        case 3:
		                            this.style.cursor='w-resize';
		                            break;
		                        case 4:
		                            this.style.cursor='e-resize';
		                            break;
		                        case 5:
		                            this.style.cursor='sw-resize';
		                            break;
		                        case 6:
		                            this.style.cursor='s-resize';
		                            break;
		                        case 7:
		                            this.style.cursor='se-resize';
		                            break;
		                        // default:
		                        	// this.style.cursor='pointer'; // finger
		                        	// break;
		                    }
		                    return;
		                }
		            }
		            // not over a selection box, return to normal
		            current_state.resize_dragging = false;
		            current_state.expect_resize = -1;
		            this.style.cursor = 'auto';
        		
        	}


        }
    }, true);




    this.canvas.addEventListener('mouseup', function(e) {
        current_state.dragging = false;
        current_state.resize_dragging = false;
        current_state.expect_resize = -1;
        
        /************************************************
        if (current_state.selection !== null) {
            if (current_state.selection.w < 0) {
                current_state.selection.w = -current_state.selection.w;
                current_state.selection.x -= current_state.selection.w;
            }
            if (current_state.selection.h < 0) {
                current_state.selection.h = -current_state.selection.h;
                current_state.selection.y -= current_state.selection.h;
            }
        }
        /************************************************/
        
        // Need to test this later...
        current_state.valid = false; // Do one more redraw after mouse up...
        
        

    }, true);




    // double click for making new shapes
    this.canvas.addEventListener('dblclick', function(e) {
        //var mouse = current_state.getMouse(e);
        //current_state.addShape(new Square(current_state, mouse.x - 10, mouse.y - 10, 20, 20, 'rgba(0,255,0,.6)'));
        return true;
    }, true);
    
    
    
    
	this.canvas.addEventListener('keydown', function(e) {
		
		
		e.preventDefault();
				
				
        for (i = l-1; i >= 0; i -= 1){	
            
        	// if(shapes[i].page_item_type == 'TextFrame'){
    			// shapes[i].clear_selection();
        	// }
        	if(current_state.selection_mode == 'type_tool' && shapes[i].page_item_type == 'TextFrame'){

				console.log('keydown_handler');
				console.log(this);
				
				dom_ele = document.getElementById('type_tool_cursor');
				
				var sx, sy, reset_x_val;
				sx=0; 
				sy=0;
				sx = parseFloat(dom_ele.style.left.substr(0, dom_ele.style.left.length-2));
				sy = parseFloat(dom_ele.style.top.substr(0, dom_ele.style.top.length-2));
				
				reset_x_val = parseFloat(this.x) + parseFloat(this.selection_x)+parseFloat(this.page_center_x_coord)+parseFloat(this.item_transform_x) - parseFloat(this.page_width/2);
			    var spread_offest = parseFloat(this.tub['page_info']['center_offset']);
				reset_x_val = reset_x_val + spread_offest+17; // 15 is the rulers
	
				
				// ADD BOUNDS CHECKING
				// ADD TEXT POSITION TRACKER
				// CALCULATE FONT WIDTH,HEIGHT,LEADING VALUES
				dom_ele.style.opacity = 1;
				
				
				// ARROW KEYS
				//console.log('editable_text.get_position()');
				//console.log('1 column line ='+this.canvas_state.text_tracker.column+', '+this.canvas_state.text_tracker.line);
				
				
				
				var calc_x, calc_y, half;
				calc_x = parseFloat(this.x) + parseFloat(this.selection_x)+parseFloat(this.page_center_x_coord)+parseFloat(this.item_transform_x) - parseFloat(this.page_width/2);
			    calc_y = parseFloat(this.y) + parseFloat(this.selection_y)+parseFloat(this.page_center_y_coord)+parseFloat(this.item_transform_y);
			    
			    var spread_offestx, spread_offsety;
			    spread_offestx = parseFloat(this.tub['page_info']['center_offset']);
			    spread_offsety = parseFloat(50);
			    
			    // 15 is the rulers
				calc_x += spread_offestx+15;
				calc_y += spread_offsety+15;
	
				
				var character_key_pressed = true;
				switch(e.keyCode){
					case 37:
						
						if(parseInt(this.canvas_state.text_tracker.column) > 0){
								console.log('Left arrow');
								
								// Move first to reverse it properly with peek
								this.canvas_state.text_tracker.column = (parseInt(this.canvas_state.text_tracker.column)-1);
								
								// Update the tracker so peek is accurate
								this.canvas_state.text_tracker.tf_point_size = this.line_leading[this.canvas_state.text_tracker.line];
								this.canvas_state.text_tracker.tf_text_font = this.line_font[this.canvas_state.text_tracker.line];
								
								// Get width to move
								var move_by = this.canvas_state.text_tracker.peek_character_width();
								sx = sx-parseFloat(move_by);
								dom_ele.style.left = sx+'px';
						}else{
							
							// Move to the end of the line above 
							if(parseInt(this.canvas_state.text_tracker.line) > 1){
							
								// MOVE UP AND TO THE END
								sy = sy-parseFloat(this.point_size);
								dom_ele.style.top = sy+'px';
		
								this.canvas_state.text_tracker.line = (parseInt(this.canvas_state.text_tracker.line)-1);
								
								// Do X move
								var a = this.canvas_state.text_tracker.lines;
								var b = this.canvas_state.text_tracker.line
								var target = parseInt(a[b].length);
								this.canvas_state.text_tracker.column = 0;
								sx = reset_x_val;
								
								for(var i =0; i < target; i++){
									
									// Update the tracker so peek is accurate
									this.canvas_state.text_tracker.tf_point_size = this.line_leading[this.canvas_state.text_tracker.line];
									this.canvas_state.text_tracker.tf_text_font = this.line_font[this.canvas_state.text_tracker.line];
									
									var move_by = this.canvas_state.text_tracker.peek_character_width();
									sx = sx+parseFloat(move_by);
									dom_ele.style.left = sx+'px';
									this.canvas_state.text_tracker.column++;
								}
							
							}else{
								console.log('Left arrow - boundery hit...');	
							}
							
						}
						character_key_pressed = false;
						break;
					case 38: 
					
						if(parseInt(this.canvas_state.text_tracker.line) > 0){
								console.log('Up arrow')
								// Get width to move
								sy = sy-parseFloat(this.point_size);
								dom_ele.style.top = sy+'px';
		
								this.canvas_state.text_tracker.line = (parseInt(this.canvas_state.text_tracker.line)-1);
								
								// Do X move
								var target = this.canvas_state.text_tracker.column;
								this.canvas_state.text_tracker.column = 0;
								sx = reset_x_val;
								
								for(var i =0; i < target; i++){
									
									// Update the tracker so peek is accurate
									this.canvas_state.text_tracker.tf_point_size = this.line_leading[this.canvas_state.text_tracker.line];
									this.canvas_state.text_tracker.tf_text_font = this.line_font[this.canvas_state.text_tracker.line];
									
									var move_by = this.canvas_state.text_tracker.peek_character_width();
									sx = sx+parseFloat(move_by);
									dom_ele.style.left = sx+'px';
									this.canvas_state.text_tracker.column++;
								}
						}else{
							console.log('Up arrow - boundery hit...');
						}
						character_key_pressed = false;
						break;
					case 39: 
						
						var a = this.canvas_state.text_tracker.lines;
						var b = this.canvas_state.text_tracker.line
						
						if(parseInt(this.canvas_state.text_tracker.column) < parseInt(a[b].length)){
							console.log('Right arrow')
							
							// Update the tracker so peek is accurate
							this.canvas_state.text_tracker.tf_point_size = this.line_leading[this.canvas_state.text_tracker.line];
							this.canvas_state.text_tracker.tf_text_font = this.line_font[this.canvas_state.text_tracker.line];
	
							// Get width to move
							var move_by = this.canvas_state.text_tracker.peek_character_width();
							sx = sx+parseFloat(move_by);
							dom_ele.style.left = sx+'px';
	
							this.canvas_state.text_tracker.column = (parseInt(this.canvas_state.text_tracker.column)+1);
						}else{
							
							var a = parseFloat(sy)+parseFloat(this.point_size)+10; // The 10 makes it a bit shorter - RECALC this later...
							var b = parseFloat(calc_y)+parseFloat(this.h);
							
							if(a < b){
								
								console.log('Right arrow...')
								// Get width to move
								sy = sy+parseFloat(this.point_size);
								dom_ele.style.top = sy+'px';
								this.canvas_state.text_tracker.line = (parseInt(this.canvas_state.text_tracker.line)+1);
								
								// Do X move
								this.canvas_state.text_tracker.column = 0;
								dom_ele.style.left = reset_x_val+'px';
							}else{
								console.log('Right arrow - boundery hit...');
							}
							
						}
						character_key_pressed = false;
						break;
					case 40: 

						var a = parseFloat(sy)+parseFloat(this.point_size)+10; // The 10 makes it a bit shorter - RECALC this later...
						var b = parseFloat(calc_y)+parseFloat(this.h);
						
						if(a < b){
							
							console.log('Down arrow')
							// Get width to move
							sy = sy+parseFloat(this.point_size);
							dom_ele.style.top = sy+'px';
	
							this.canvas_state.text_tracker.line = (parseInt(this.canvas_state.text_tracker.line)+1);
							
							// Do X move
							var target = this.canvas_state.text_tracker.column;
							this.canvas_state.text_tracker.column = 0;
							sx = reset_x_val;
							
							for(var i =0; i < target; i++){
								
								// Update the tracker so peek is accurate
								this.canvas_state.text_tracker.tf_point_size = this.line_leading[this.canvas_state.text_tracker.line];
								this.canvas_state.text_tracker.tf_text_font = this.line_font[this.canvas_state.text_tracker.line];
								
								var move_by = this.canvas_state.text_tracker.peek_character_width();
								sx = sx+parseFloat(move_by);
								dom_ele.style.left = sx+'px';
								this.canvas_state.text_tracker.column++;
							}
						}else{
							console.log('Down arrow - boundery hit...');
						}
						character_key_pressed = false;
						break;
						
					case 8: 
						console.log('backspace')
						this.canvas_state.text_tracker.backspace();
						character_key_pressed = false;
						break;
					case 46: 
						console.log('delete')
						this.canvas_state.text_tracker.del();
						character_key_pressed = false;
						break;
						
					case 16: 
						console.log('shift')
						character_key_pressed = false;
						break;
						
					default:
						character_key_pressed = true;
				}
				console.log('2 column line ='+this.canvas_state.text_tracker.column+', '+this.canvas_state.text_tracker.line);
				
                var charCodeTable = {
                	//8:'backspace', 16: 'shift', 46: 'delete',
					32: ' ',33: '!', 34: '"', 35: '#', 36: '$', 
					//37: '%', 38: '&', 39: "'", 
					//40: '(', 
					41: ')', 42: '*', 43: '+', 44: ',', 45: '-', 47: '/', 48: '0', 49: '1',
					50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7', 56: '8', 57: '9', 58: ':', 59: ';', 
					60: '<', 61: '=', 62: '>', 63: '?', 64: '@', 
					65: 'a', 66: 'b', 67: 'c', 68: 'd', 69: 'e', 70: 'f', 71: 'g', 72: 'h', 73: 'i', 74: 'j', 75: 'k', 76: 'l', 77: 'm', 78: 'n', 79: 'o', 80: 'p', 81: 'q', 82: 'r', 83: 's', 84: 't', 85: 'u', 86: 'v', 87: 'w', 88: 'x', 89: 'y', 90: 'z', 
					91: '[', 92: '\\', 93: ']', 94: '^', 95: '_', 96: '`', 
					//97: 'a', 98: 'b', 99: 'c', 100: 'd', 101: 'e', 102: 'f', 103: 'g', 104: 'h', 105: 'i', 106: 'j', 107: 'k', 108: 'l', 109: 'm', 110: 'n', 111: 'o', 112: 'p', 113: 'q', 114: 'r', 115: 's', 116: 't', 117: 'u', 118: 'v', 119: 'w', 120: 'x', 121: 'y', 122: 'z', 
					123: '{', 124: '|', 125: '}', 126: '~', 173: '-',
					188: ',', 190: '.', 191: '/', 192: '`', 219: '[', 220: '\\', 221: ']', 222: '\"'
                };
                var key = charCodeTable[e.keyCode];

				if(character_key_pressed == true){
					console.log('character key presed...');
					console.log('e.keyCode, key='+e.keyCode+' '+key);
					this.canvas_state.text_tracker.insert_character(key);	
				}
				
				// Maintain BRs
				var tmp_txt = this.canvas_state.text_tracker.text;
				
				//this.tub['stories'][this.story_id].Story.ParagraphStyleRange.CharacterStyleRange.Content = tmp_txt;
				this.canvas_state.valid = false;
				
				//return !handled;
			}
		}
		
	}, true);
	
	this.canvas.addEventListener('keyup', function(e) {
		
				e.preventDefault();
				
        for (i = l-1; i >= 0; i -= 1){	
        	// if(shapes[i].page_item_type == 'TextFrame'){
    			// shapes[i].clear_selection();
        	// }
        	if(current_state.selection_mode == 'type_tool' && shapes[i].page_item_type == 'TextFrame'){
				
				console.log('keyup_handler');
				
				var content = this.canvas_state.text_tracker.lines.join('');
				this.plain_text_content = content;
		
			}
		}
		
	}, true);




    
    
    
    
    
    
    
    
    

    // **** Options! ****

    this.selection_color = '#CC0000';
    this.selection_width = 2;
    this.selection_boxsize = 6;
    this.selectionBoxColor = '#FFF';
    this.selectionBoxStroke = '#2A29B5';
    this.interval = 30; // milliseconds, bigger = slower refresh rate
    


    
    // run
    setInterval(function() { current_state.draw(); }, current_state.interval);
}




CanvasStateMachine.prototype.store_style = function (style_string){
	if(this.selection != null){
		this.selection.store_style(style_string)	
	}
};


CanvasStateMachine.prototype.addShape = function(shape) {
    "use strict";
    this.shapes.push(shape);
    this.valid = false;
	pageShapes.push(shape);

	//position canvas element at page position
	if(shape["page_item_type"] == "Page"){
		fCanvas.setHeight(shape.page_height);
		fCanvas.setWidth(shape.page_width);
		$('#fCanvas').parent().css('top','65px');
		$('#fCanvas').parent().css('left',tub['page_info']['center_offset']+15+'px');
	}

};

CanvasStateMachine.prototype.clear = function() {
    "use strict";
    
    this.ctx.save();
    //this.ctx.strokeStyle = '#606060';
    this.ctx.clearRect(-1000, -1000, this.width*3, this.height*3);
    this.ctx.restore();
};

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasStateMachine.prototype.draw = function() {
    "use strict";
    var ctx, shapes, i, shape, mySel;
    
    // if our state is invalid, redraw and validate!
    if (!this.valid) {
    	
        ctx = this.ctx;
        shapes = this.shapes;
        this.clear();

        // ** Add stuff you want drawn in the background all the time here **





        // draw all shapes
        for (i = 0; i < shapes.length; i += 1) {
            shape = shapes[i];

			//do not draw textFrames, they are drawn in fabricJs
			if(shape["page_item_type"] == "TextFrame"){
				continue;
			}
            // We can skip the drawing of elements that have moved off the screen:
            // REDO this later
            
            // if (shape.x <= this.width && shape.y <= this.height &&
                    // shape.x + shape.w >= 0 && shape.y + shape.h >= 0) {
            	// Split the possible things we can draw into seporate functions for now...
            	
            	
                shapes[i].draw(ctx);
                
                
                if(this.selection_mode == 'normal_selection'){
                	shapes[i].draw_selection(ctx);	
                	
                }else if(this.selection_mode == 'alt_selection'){
                	shapes[i].draw_alt_selection(ctx);
                	
                }else{
                	// do nothing
                }
                
                
                /********************************
                else if(this.selection_mode == 'type_tool'){
                	//console.log('------------------');
                	//console.log(this.canvas);
                	
                	console.log('page_item_type='+shapes[i].page_item_type);
                	
                	// Only init the editor for actual text objects
                	if(shapes[i].page_item_type == 'TextFrame'){
            			console.log('FSM draw() type_tool called...');
            			shapes[i].type_tool(ctx);
                	}
                	
                }
                /********************************/
                
                
            //}
        }

        // draw selection
        // right now this is just a stroke along the edge of the selected Shape
        
        // This should be taken care of by drawing selection for each OBJ.... refactor
        
        /************************************************
        if (this.selection !== null) {
            ctx.strokeStyle = this.selection_color;
            ctx.lineWidth = this.selection_width;
            mySel = this.selection;
            //ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h);
        }
        /************************************************/

        // ** Add stuff you want drawn on top all the time here **

        this.valid = true;
    }
};


// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky, we have to worry about padding and borders
CanvasStateMachine.prototype.getMouse = function(e) {
    //"use strict";
    var element = this.canvas, offsetX = 0, offsetY = 0, mouse_x, mouse_y;

    // Compute the total offset
    if (element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
            element = element.offsetParent;
        } while (element);
    }

    // Add padding and border style widths to offset
    // Also add the <html> offsets in case there's a position:fixed bar
    offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
    offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

    var mouse_x = e.pageX - offsetX;
    var mouse_y = e.pageY - offsetY;

	//console.log('getMouse() x/y '+mouse_x+' '+mouse_y);
	
	

    // We return a simple javascript object (a hash) with x and y defined
    return {x: mouse_x, y: mouse_y};
    
    
    
    /*****************************************
    var mouseX = e.pageX - getCanvasPos(this.canvas).left + window.pageXOffset;
    var mouseY = e.pageY - getCanvasPos(this.canvas).top + window.pageYOffset;
    return {
        x : mouseX,
        y : mouseY
    };
    
    var rect = this.canvas.getBoundingClientRect();
    return {
	    x: Math.floor((e.clientX-rect.left)/(rect.right-rect.left)*this.canvas.width),
		y: Math.floor((e.clientY-rect.top)/(rect.bottom-rect.top)*this.canvas.height)
    };
    /*****************************************/
    
};



CanvasStateMachine.prototype.getContext = function(e){
	return this.ctx;			
}


function getCanvasPos(canvas) {
    var _x = canvas.offsetLeft;
    var _y = canvas.offsetTop;

    while(canvas = canvas.offsetParent) {
        _x += canvas.offsetLeft - canvas.scrollLeft;
        _y += canvas.offsetTop - canvas.scrollTop;
    }

    return {
        left : _x,
        top : _y
    }
};



















function blink(canvas_state) {
	if (parseInt(canvas_state.cursor.style.opacity, 10)) {
		canvas_state.cursor.style.opacity = 0;
	} else {
		canvas_state.cursor.style.opacity = 1;
	}
};




