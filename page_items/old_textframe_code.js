
		function draw_text_content(p_textframe_this, tub, story_id, ctx, start_x, start_y, max_width, max_height, character_style_range){
			
			
						var link = document.createElement('link');
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = 'http://fonts.googleapis.com/css?family=Vast+Shadow';
						//link.href = 'http://192.168.105.115/test/idml_loader/temp/Document fonts/Harrington';
						document.getElementsByTagName('head')[0].appendChild(link);
			
			
			
			
			
			// SO THE TEXT DOESN'T FOLD INTO ITSELF WHILE BEING DRAGGED AS max_height NOW GETS UPDATED BY start_y
			max_height = parseFloat(max_height) + parseFloat(start_y);
			
			
			//
			// TEXT CONTENT CAN BE ON ITS OWN OR IN AN ARRAY...
			//
			p_textframe_this.text_content = character_style_range.Content;
			
			var textwrap_x, textwrap_y;
			
			if(character_style_range.hasOwnProperty('Properties')){
				p_textframe_this.text_font = character_style_range.Properties.AppliedFont;
				
				// var full_path = this.json_object.Image.Link['@attributes'].LinkResourceURI;    	
		    	// var font_filename = full_path.replace(/^.*[\\\/]/, '');
		    	// font_filename = "http://192.168.105.115/test/idml_loader/temp/Document fonts/"+text_font+"";
				
				
			}else{
				p_textframe_this.text_font = 'Ariel'; // default
			}
			
			
			
			if (typeof character_style_range['@attributes'] != 'undefined'){
								
				if (typeof character_style_range['@attributes'].FontStyle != 'undefined'){
					p_textframe_this.font_style = character_style_range['@attributes'].FontStyle;
				}
				if (typeof character_style_range['@attributes'].FillColor != 'undefined'){
					p_textframe_this.fill_colour = character_style_range['@attributes'].FillColor;
				}
				if (typeof character_style_range['@attributes'].StrokeColor != 'undefined'){
					p_textframe_this.stroke_colour = character_style_range['@attributes'].StrokeColor;
				}
				if (typeof character_style_range['@attributes'].PointSize != 'undefined'){
					p_textframe_this.point_size = character_style_range['@attributes'].PointSize;
				}
			}else{
				console.log('textframe_module draw_text_content() No attributes');
			}
			// console.log(this.tub['stories'][this.story_id]);
			//console.log('Text style vals = '+font_style+' '+fill_colour+' '+point_size+' '+text_font);
			
			// Font weight, size, family
			ctx.font = p_textframe_this.font_style+' '+p_textframe_this.point_size+'px '+p_textframe_this.text_font;
	
			// Use it if its set
			if(p_textframe_this.fill_colour != 'Swatch/None' && p_textframe_this.fill_colour != ''){
				
				ctx.fillStyle = 'black';
				
				
				/*********
				// Color/C=15 M=100 Y=100 K=0			
				fill_colour = fill_colour.substring(6, fill_colour.length);
				fill_colour = fill_colour.split(' ');
				
				var c,m,y,k;
				c = fill_colour[0];
				m = fill_colour[1];
				y = fill_colour[2];
				k = fill_colour[3];
				
				c = c.substring(2, c.length);
				m = m.substring(2, m.length);
				y = y.substring(2, y.length);
				k = k.substring(2, k.length);
	
				var cc = ColorConverter.toRGB(new CMYK(c, m, y, k));
				ctx.fillStyle = 'rgba('+cc.r+','+cc.g+','+cc.b+',1)';
				/*************************/
				
			}else{
				// USE DEFAULT...
				ctx.fillStyle = 'black';
			}
			
			textwrap_y = start_y;
			

	
	
	
			// This determines at which point in the text we start drawing
			// It will increment so each successive linked box will start from it.
			// Neex to flesh this out and explain better...
			var text_offset;
			
			
			/***************************************
			console.log('----------------------------------------------------');
			console.log(story_id);
			console.log('offset='+tub['story_text_offset'][story_id]);
			console.log('counter='+tub['story_text_offset_counter'][story_id]);
			console.log('----------------------------------------------------');
			/***************************************/
			
			
	        if(tub['story_text_offset'][story_id] != 0){
	        	text_offset = tub['story_text_offset'][story_id];
	        }else{
	        	text_offset = 0;
	        }
		

		    if(Object.prototype.toString.call( p_textframe_this.text_content ) === '[object Array]') {
		        // multiple
		        
		        	// console.log('textwrap_y='+textwrap_y);
		        
			        p_textframe_this.text_content.forEach( function (text_content_item) {
			            
			            if(text_content_item == '<Br />'){
		            	//if(text_content_item == '\n'){
			            	textwrap_y = parseFloat(textwrap_y) + parseFloat(p_textframe_this.point_size);
			            }else{
				            if(typeof p_textframe_this.text_content != 'undefined'  && p_textframe_this.text_content != ''){
				            	
				            	
				            	if(typeof text_content_item != 'Object'){
				            		textwrap_y = do_wrapping(p_textframe_this, tub, text_offset, story_id, text_content_item, textwrap_y, start_y);
				            	}else{
				            		console.log(text_content_item);
				            	}
				            	
				            	//
				            }else{
					            // console.log('draw_text_content() multi NOT drawn');
					            // console.log(text_content_item);
					            // console.log(typeof text_content_item);
				            }
			            }
		
			        }, p_textframe_this);
		        
		
		    }else{
		    		// console.log('textwrap_y='+textwrap_y);
		    	

		            if(p_textframe_this.text_content == '<Br />'){
	            	//if(text_content == '\n'){
		            	textwrap_y = parseFloat(textwrap_y) + parseFloat(point_size);
		            }else{
		
						if(typeof p_textframe_this.text_content === 'string' && typeof p_textframe_this.text_content != 'undefined' && typeof p_textframe_this.text_content != 'Object' && p_textframe_this.text_content != ''){
			            	textwrap_y = do_wrapping(p_textframe_this, tub, text_offset, story_id, p_textframe_this.text_content, textwrap_y, start_y);
			            }else{
					            // console.log('draw_text_content() single NOT drawn');
					            // console.log(text_content);
					            // console.log(typeof text_content);
			            }
		            }

		    }
			
			
			// reset the counter for the next one	
			tub['story_text_offset_counter'][story_id] = 0;



			
			return textwrap_y;
			
			
			// Test later....
			// ctx.save();
			// ctx.setTransform(1, 0, 0, 1, 0, 0);
			// ctx.fillText(text_content, start_x, start_y+10);
			// ctx.restore();
			
			
			
			// INTERNAL FUNCTION TO MAINTAIN SCOPE OF draw_text_content()
			
			function do_wrapping(p_textframe_this, tub, text_offset, story_id, text_content, textwrap_y, start_y){
	
					// Handle linked text boxes
					//text_content = text_content.substring(text_offset, text_content.length);
	
	
					// Color/black
					p_textframe_this.stroke_colour = p_textframe_this.stroke_colour.substring(6, p_textframe_this.stroke_colour.length);
					ctx.strokeStyle = p_textframe_this.stroke_colour;
					
					//
					// TEXT WRAP
					//
					
					textwrap_x = parseFloat(start_x);
					//textwrap_y = parseFloat(start_y);
					
					// intial
					textwrap_y = parseFloat(textwrap_y) + parseFloat(p_textframe_this.point_size);
					
					// cast to string because " " becomes an object....
					text_content = text_content + '';
					
					if(text_content == '[object Object]'){
						console.log('textframe_module do_wrapping() was passed an Object...');
						return textwrap_y;
					}
					
			        var characters = text_content.split('');
			        var line = '';
				
				
					// WHILE WRAPPING KEEP INCREMENTING OFFSET FOR NEXT PAGE
				    //
				    //
				    
				
				/********************************************
					// Use it if its set
					if(stroke_colour != ''){
				
						for(var n = 0; n < characters.length; n++){

							var test_line = line + characters[n] + '';
							var metrics = ctx.measureText(test_line);
							var test_width = metrics.width;
							var test_height = metrics.height;
							  
							if(test_width > max_width && n > 0){
							  	if(textwrap_y < max_height){
							  		if(tub['story_text_offset_counter'][story_id] > tub['story_text_offset'][story_id]){
										ctx.fillText(line, textwrap_x, textwrap_y);
	
										line = characters[n] + '';
										//y += line_height;
										textwrap_y = parseFloat(textwrap_y) + parseFloat(point_size);							  			
							  		}
							  	}
							}else{
								line = test_line;
							}
							tub['story_text_offset_counter'][story_id] += 1;
							

						}
				        ctx.strokeText(line, textwrap_x, textwrap_y);
						//ctx.strokeText(text_content, start_x, start_y+parseFloat(point_size)); // offset by the font size plus the rulers
					}else{
						//
						// TEXT WRAP
						//
						/********************************************/
						
						
						for(var n = 0; n < characters.length; n++){


							var test_line = line + characters[n] + '';
							var metrics = ctx.measureText(test_line);
							var test_width = metrics.width;
							  
							if(tub['story_text_offset_counter'][story_id] >= tub['story_text_offset'][story_id]){
							  
							  	var next_y_val = textwrap_y+parseFloat(p_textframe_this.point_size);
							  
							  	if( next_y_val < max_height ){
							  		//
							  		// IMPORTANT...
							  		// Text alignment / justification is calculated here
							  		//
							  		//
									if(test_width > max_width && n > 0){
		
		
										// =============================================================================
										
										/****
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = 'http://fonts.googleapis.com/css?family=Vast+Shadow';
document.getElementsByTagName('head')[0].appendChild(link);

// Trick from http://stackoverflow.com/questions/2635814/
var image = new Image;
image.src = link.href;
image.onerror = function() {
    ctx.font = '50px "Vast Shadow"';
    ctx.textBaseline = 'top';
    ctx.fillText('Hello!', 20, 10);
};
****/
										
										ctx.fillText(line, textwrap_x, textwrap_y);
										
										line = characters[n] + '';
										//y += line_height;
										textwrap_y = parseFloat(textwrap_y) + parseFloat(p_textframe_this.point_size);							  			
									}else{
										// Replace existing line of text with line that has 1 char appended...
										line = test_line;
									}
									
						  			// Only increment this while text should be drawn
						  			tub['story_text_offset'][story_id]++;
								}
					  		}else{
					  			textwrap_y = start_y + parseFloat(p_textframe_this.point_size);
					  		}

							// This will always get incremented, used to overcome index being reset because 
							// the loop only loops over <content> one at a time...
							tub['story_text_offset_counter'][story_id]++;
							
						}
						
						//tub['story_text_offset_counter'][story_id] += parseFloat(n); // Doing this here would add an incremented number each time...
						

						
						
						// var link = document.createElement('link');
						// link.rel = 'stylesheet';
						// link.type = 'text/css';
						// link.href = 'http://fonts.googleapis.com/css?family=Vast+Shadow';
						// //link.href = 'http://192.168.105.115/test/idml_loader/temp/Document fonts/Harrington';
						// document.getElementsByTagName('head')[0].appendChild(link);
						
						var image = new Image;
						image.src = link.href;
						image.onerror = function() {
							ctx.fillStyle = 'black';
							
						    //ctx.font = p_textframe_this.point_size+'px "Vast Shadow"';
						    
						    
						    //ctx.font = '30px "Harrington"';
						    //ctx.font = '50px "'+text_font+'"';
						    
						    
							ctx.textBaseline = 'top';
						    ctx.fillText(line, textwrap_x, textwrap_y);
						};					
						
						//
						//
				        //ctx.fillText(line, textwrap_x, textwrap_y);
				        //
				        //
				        
				        
				        
				        /********************************************/
						//ctx.fillText(text_content, start_x, start_y+parseFloat(point_size)); // offset by the font size plus the rulers
						
						
					//}

				return textwrap_y;
				
			}
			
			// EDN OF draw_text_content();
		}
