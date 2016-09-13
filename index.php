<html>
<head>
    <title>IDML Editor</title>

    <script src="./lib/jquery-2.1.4.min.js"></script>
    <!-- <script src="./lib/texteditor.js"></script> -->
    <!-- <script src="./lib/tiff.js"></script> -->

	<link rel="stylesheet" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css">
	<script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
    
    <script src="./unit_convert_functions.js"></script>
    <script src="./stub_modules.js"></script>
    <script src="./canvas_state_machine.js"></script>


    <script src="./page_module.js"></script>
    <script src="./page_items/rectangle_module.js"></script>
    <script src="./page_items/textframe_module.js"></script>
	<!-- fabricJs -->
	<script src="lib/js/fabric.min.js"></script>
    <!-- <script src="./page_items/image_module.js"></script> -->




    <script type="text/javascript">
		var tub = {};
		var pageShapes = [];
		var fabricShapes = [];
		function is_object(x) {
		    return x === Object(x);
		}


        $(function(){
            "use strict";


			// INIT / LOADING
			//
            var path = "";
            var object_names = [];
            var spread_files_src = [];
            var page_info = [];
            var story_text_offset = []; // for linked text frames
            var story_text_offset_counter = [];
            var story_text_page_counter = [];
            var preloaded_images = [];
            

            // tub['object_names'] = object_names;
            tub['spread_files_src'] = spread_files_src;
            tub['page_info'] = page_info;
            tub['story_text_offset'] = story_text_offset;
            tub['story_text_offset_counter'] = story_text_offset_counter;
            tub['story_text_page_counter'] = story_text_page_counter;
            tub['preloaded_images'] = preloaded_images;
            
            tub['text_editor'] = null;
			
			var idml_folder = 'temp';
			
			
			// Pre-load the images
			//
            $.ajax({
            	type: "GET",
                url: "http://<?php echo $_SERVER['SERVER_NAME']; ?>/editor-dev/idml_loader/loader.php?images="+idml_folder,
                context: document.body,
                async:   false
            }).success(function(data){
                var json_data = JSON.parse(data);
                
                // console.log('IMAGES....');
                // console.log(json_data);
                
				$.each(json_data, function(key, value){
					//onsole.log(key, value);
					var filename = "http://<?php echo $_SERVER['SERVER_NAME']; ?>/editor-dev/idml_loader/temp/Links/"+value+"";

					var img = new Image();
					img.onload = function(){
						//console.log('LOADED '+filename);
						//console.log(img);
						tub['preloaded_images'].push({value, img});
					}
					img.src = filename;
				});
            });


			// Propulate colour palette
			//
            $.ajax({
            	type: "GET",
                url: "http://<?php echo $_SERVER['SERVER_NAME']; ?>/editor-dev/idml_loader/loader.php?colours="+idml_folder,
                context: document.body,
                async:   false
            }).success(function(data){
                var json_data = JSON.parse(data);
                
                tub['color_palette'] = json_data;
                
                // console.log('COLOUR PALETTE');
                // console.log(json_data);

            });




			// Store all the spread OBJECTS in an array
			//
            $.ajax({
            	type: "GET",
                url: "http://<?php echo $_SERVER['SERVER_NAME']; ?>/editor-dev/idml_loader/loader.php?spreads="+idml_folder,
                context: document.body,
                async:   false
            }).success(function(data){
                var json_data = JSON.parse(data);
                tub['spreads'] = json_data;
            });

			// Store all the Story OBJECTS in an array
			//
            $.ajax({
            	type: "GET",
                url: "http://<?php echo $_SERVER['SERVER_NAME']; ?>/editor-dev/idml_loader/loader.php?stories="+idml_folder,
                context: document.body,
                async:   false
            }).success(function(data){
                var json_data = JSON.parse(data);
                tub['stories'] = json_data;
            });


			// Load the fonts
			//

            // $.ajax({
                // url: "http://<?php echo $_SERVER['SERVER_NAME']; ?>/idml_loader/loader.php?fonts="+idml_folder,
                // context: document.body,
                // async:   false
            // }).success(function(data){
                // var json_data = JSON.parse(data);
				// // $.each(json_data, function(key, value){
					// // console.log(key, value);
					// // var link = document.createElement('link');
					// // link.rel = 'stylesheet';
					// // link.type = 'text/css';
					// // link.href = 'http://192.168.105.115/test/idml_loader/temp/Document fonts/'+value;
					// // document.getElementsByTagName('head')[0].appendChild(link);
				// // });
            // });








            // Get spreads from designmap - to draw pages
            //
            var file = "./"+idml_folder+"/designmap.xml";

            $.ajax({
            	type: "GET",
                url: "http://<?php echo $_SERVER['SERVER_NAME']; ?>/editor-dev/idml_loader/loader.php?file="+file,
                context: document.body,
                async:   false
            }).success(function(data){
                var json_data = JSON.parse(data);

                // Loop the top level
                $.each(json_data, walker);
            });
            
            
            // Get page size from resources/preferences - to draw pages
            //
            var file = "./"+idml_folder+"/Resources/Preferences.xml";

            $.ajax({
            	type: "GET",
                url: "http://<?php echo $_SERVER['SERVER_NAME']; ?>/editor-dev/idml_loader/loader.php?file="+file,
                context: document.body,
                async:   false
            }).success(function(data){
                var json_data = JSON.parse(data);

                // Loop the top level
                $.each(json_data, walker);
            });
            //
			//
			// End Loading ---------------------




            // INIT
            //
            var canvas_fsm;
            var max_number_of_pages = 0;
            for(var spread in tub['spreads']){
            	
            	var json_data = tub['spreads'][spread]
            	var count = parseInt(json_data.Spread['@attributes'].PageCount);
            	
				if(count > max_number_of_pages){
					max_number_of_pages = count;
				}	                        
            }
            
            for(var spread in tub['spreads']){
                    
				var spread_id, number_of_pages, center, canvas_fsm, ctx;
                var json_data = tub['spreads'][spread];
                
	            //
	            // Calculate offset center - this moves the zero from top,left to top,center
	            //
	            // REFERENCE
				// var width = (parseFloat(tub['page_info']['PageWidth'])*max_number_of_pages)+parseFloat(tub['page_info']['PageWidth']);
				// var height = parseFloat(tub['page_info']['PageHeight'])+100;
	            //
				number_of_pages = parseInt(json_data.Spread['@attributes'].PageCount);
				spread_id = json_data.Spread['@attributes'].Self;
					            
	            center = ((parseFloat(tub['page_info']['PageWidth'])*max_number_of_pages)+200)/2;
	            //center = Math.round(center)+'.5';
	            
	            center = Math.ceil(center/100)*100; // Round up to the nearest 100
	            tub['page_info']['center_offset'] = parseFloat(center);



                

				create_spread_canvas(spread_id, max_number_of_pages, number_of_pages);
                
	            canvas_fsm = new CanvasStateMachine(document.getElementById(spread_id+"_artwork"), tub);
	            ctx = canvas_fsm.getContext();
	            // translate X, Y
	            
	            
	            
	            

	            
	            ctx.translate(tub['page_info']['center_offset'], 50);
	            // ctx.translate(0.5, 0.5);
	
				draw_rulers(document.getElementById(spread_id+"_ruler").getContext("2d"), tub['page_info']['center_offset']);


                // Loop the top level
                $.each(json_data, walker);
                
                canvas_fsm.valid = false;
                
            }
            

            
            //
            // TOOLBOX
            //
            //$("button[name='select']").click(function(){
        	$("#select").click(function(){
            	console.log('normal_selection');
            	canvas_fsm.selection_mode = 'normal_selection';
            });
            // $("button[name='alt_select']").click(function(){
        	$("#alt_select").click(function(){
            	console.log('alt_selection');
            	canvas_fsm.selection_mode = 'alt_selection';
            });
            // $("button[name='type_tool']").click(function(){
        	$("#type_tool").click(function(){
            	console.log('type_tool');
            	canvas_fsm.selection_mode = 'type_tool';
            });









            $("#font_size").change(function(){
            	
            	canvas_fsm.selection_font_size = this.value;
			    canvas_fsm.valid = false;
			    
				var a = $("#font_size :selected").text();
				var b = $("#font_face :selected").text();
				var c = $("#font_color :selected").val();
				
				
			    var str = '{"size": "'+a+'", "face": "'+b+'", "color": "'+c+'"}';
			    canvas_fsm.store_style(str);
			    
			    console.log('STORE STYLE = '+str);
            });
            $("#font_face").change(function(){
            	
            	canvas_fsm.selection_font_face = this.value;
            	canvas_fsm.valid = false;
            	
				var a = $("#font_size :selected").text();
				var b = $("#font_face :selected").text();
				var c = $("#font_color :selected").val();
			    var str = '{"size": "'+a+'", "face": "'+b+'", "color": "'+c+'"}';
			    canvas_fsm.store_style(str);
            });
            $("#font_color").change(function(){
            	
            	canvas_fsm.selection_font_color = this.value;
            	canvas_fsm.valid = false;
            	
				var a = $("#font_size :selected").text();
				var b = $("#font_face :selected").text();
				var c = $("#font_color :selected").val();
			    var str = '{"size": "'+a+'", "face": "'+b+'", "color": "'+c+'"}';
			    canvas_fsm.store_style(str);
            });
            
            
            
            
            
            

			function create_spread_canvas(spread_id, max_number_of_pages, number_of_pages){ // dynamically append canvas elemnts for each spread
				
				// Add on the width of another page so single page can be centered if there is one on its own...
				var width = (parseFloat(tub['page_info']['PageWidth'])*max_number_of_pages)+parseFloat(tub['page_info']['PageWidth']);
				var height = parseFloat(tub['page_info']['PageHeight'])+100;
				
				
				var spread_container_ele = $('.spread_container').clone();
				spread_container_ele.attr("id", spread_id);
				spread_container_ele.css("display", 'block');
				spread_container_ele.css("margin-bottom", '50px');
				
				spread_container_ele.attr("width", width+parseInt(30));
				spread_container_ele.attr("height", height+parseInt(30));

				
				spread_container_ele.removeAttr("class"); // do this so the next time we dont overwrite as keeping the class would include it in the initial selection
				spread_container_ele.children('.ruler_canvas').attr("id", spread_id+"_ruler");
				spread_container_ele.children('.ruler_canvas').attr("width", width+parseInt(15));
				spread_container_ele.children('.ruler_canvas').attr("height", height+parseInt(15));
				
				spread_container_ele.children('.spread_canvas').attr("id", spread_id+"_artwork");
				spread_container_ele.children('.spread_canvas').attr("width", width);
				spread_container_ele.children('.spread_canvas').attr("height", height);

				$('#interface').append(spread_container_ele);
			}


            //------------------------------------
            // Draw rulers
            function draw_rulers(context, center_offset){
            	
            	//
            	// http://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
            	//
            	// Need to use this so X of 15 becomes X of 15.5 to "straddle" the pixels
            	
            	context.save();
            	context.translate(0.5, 0.5);
            	
	            context.beginPath();
	            context.fillStyle = '#FFF';
				context.lineWidth="0.5";
				context.strokeStyle="#FFF";
	            
	            
	            //console.log(center_offset);
	            
	            // Horizontal
	            
				// NEGATIVE
				var inverse_increment = 0;
	            for (var i = center_offset; i >= 0; i -= 10){
	
	                // Draw numbers on ruller
	                if(i / 50 == parseInt(i / 50)){
	                    context.font = "9px Arial";
	                    context.fillText(Math.round(String('-'+i)), inverse_increment+17, 6);
	                }
	
	                var y = (i / 100 == parseInt(i / 100)) ? 0 : 10; // strt at 0 or 10
	                context.moveTo(inverse_increment+15, y);
	                context.lineTo(inverse_increment+15, 15);
	
	                // Draw intermittent lines
	                if(i / 50 == parseInt(i / 50)){
	                    context.moveTo(inverse_increment + 15, 6); // should be 7.5
	                    context.lineTo(inverse_increment + 15, 15);
	                }
	                
					inverse_increment += 10;
	            }
	            
	            // POSITIVE
	            var inverse_increment = 10;
	            for (var i = center_offset+10; i < canvas_fsm.width; i += 10){
	
	                // Draw numbers on ruller
	                if(i / 50 == parseInt(i / 50)){
	                    context.font = "9px Arial";
	                    context.fillText(Math.round(String(inverse_increment)), i+17, 6);
	                }
	
	                var y = (i / 100 == parseInt(i / 100)) ? 0 : 10; // strt at 0 or 10
	                context.moveTo(i+15, y);
	                context.lineTo(i+15, 15);
	
	                // Draw intermittent lines
	                if(i / 50 == parseInt(i / 50)){
	                    context.moveTo(i + 15, 6); // should be 7.5
	                    context.lineTo(i + 15, 15);
	                }
	                
					inverse_increment += 10;
	            }
	            
	            
	            
	            
	            //
	            // Vertical
	            //
	            
	            
	            // NEGATIVE
	            var inverse_increment = 0;
	            for (var i = 50; i >= 0; i -= 10){
	
	                if(i / 50 == parseInt(i / 50)){
						//context.save();
						 
						//context.rotate(Math.PI*2/(i*6));
						context.font = "9px Arial";
						context.fillText(Math.round(String('-'+i)), 1, inverse_increment+23);
							                    
						//context.restore();
	                }
	
	                var x = (inverse_increment / 100 == parseInt(i / 100)) ? 0 : 10;
	                context.moveTo(x, inverse_increment + 15);
	                context.lineTo(15, inverse_increment + 15);
	
	                // Draw intermittent lines
	                if(i / 50 == parseInt(i / 50)){
	                    context.moveTo(6, inverse_increment + 15); // 6 replaces x
	                    context.lineTo(15, inverse_increment + 15);
	                }
	
					inverse_increment += 10;
	            }
	            
	            
	            // POSITIVE
	            
				var inverse_increment = 10;
	            for (var i = 60; i < canvas_fsm.height; i += 10){
	
	                if(i / 50 == parseInt(i / 50)){
						context.save();
						 
						context.rotate(Math.PI*2/(i*6));
						context.font = "9px Arial";
						context.fillText(Math.round(String(inverse_increment)), 1, i+23);
							                    
						context.restore();
	                }
	
	                var x = (i / 100 == parseInt(i / 100)) ? 0 : 10;
	                context.moveTo(x, i + 15);
	                context.lineTo(15, i + 15);
	
	                // Draw intermittent lines
	                if(i / 50 == parseInt(i / 50)){
	                    context.moveTo(6, i + 15); // 6 replaces x
	                    context.lineTo(15, i + 15);
	                }
					inverse_increment += 10;
	            }
	            context.stroke();
	            
	            context.restore();
			}
            //
            //------------------------------------


            //
            // END INIT



            function walker(key, value) {

                var savepath = path;
                path = path ? (path+"."+key) : key;

                // ...do what you like with `key` and `value`
                //console.log(path+' -> '+key+'::'+value);

                if(is_object(value) && key != '@attributes'){
                    //
                    // Dynamic function call
                    //
                    if((mapping[key] != undefined)){
                    	
                    	// Adding things to draw
						if (typeof mapping[key] !== "function") {
							console.log('The function was '+mapping[key]);
						}                    	
						window[mapping[key]](canvas_fsm, tub, value);

                    }else{
                        //console.log(key+' skipped...');
                    }

                    // Recurse into children
                    $.each(value, walker);
                }
                path = savepath;
            }
/********************************/




            // var canvas_offset = $("#spread_canvas").offset();
            // tub['ruler_offsetX'] = canvas_offset.left;
            // tub['ruler_offsetY'] = canvas_offset.top;



            function handleMouseMove(e) {
                var mouseX = parseInt(e.clientX - tub['ruler_offsetX']);
                var mouseY = parseInt(e.clientY - tub['ruler_offsetY']);
                //$("#movelog").html("Mouse co-ordinates: " + mouseX + ", " + mouseY);

                // Additional mousemove stuff here
            }

            $("#spread_canvas").mousemove(function (e) {
                //handleMouseMove(e);
            });


			$( "#draggable" ).draggable();
			
			//$( '#dl-menu' ).dlmenu();

			
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
				
		    	color_str += '<option value="rgba('+cc.r+','+cc.g+','+cc.b+',1)">'+colors[i]['@attributes'].Self+'</option>';	
			}
			$("#font_color").html(color_str);

        });

		var mapping = {
		
		    // Designmap modules
		    'idPkgSpread' : 'designmap_spread_module',
		
		    // Preferences modules
		    'DocumentPreference' : 'documentpreference_module',
		
		    // Spread modules
		    //'Spread' : 'spread_module',
		    
		    //
		    // the modules above are required to parse page and spread data or nothing draws...
		    //
		    
			// 'FlattenerPreference' : 'flattenerpreference_module',
		
		    'Page' : 'page_module',
		    'Rectangle' : 'rectangle_module', // IMAGE IS INSIDE RECTANGLE...
			'TextFrame' : 'textframe_module',
			// 'Image' : 'image_module',
			// 'Oval' : 'oval_module',
		
		
		    // Story modules
		//    'Story' : 'story_module',
		//    'StoryPreference' : 'storypreference_module',
		//    'InCopyExportOption' : 'incopyexportoption_module',
		//    'ParagraphStyleRange' : 'paragraphstylerange_module',
		//    'CharacterStyleRange' : 'characterstylerange_module'
		};
    </script>

    <style type="text/css">
		body{
       		margin:0px; padding:0px;
       		background-color:#404040;
       		//background-color:#FFF;
		}
		#interface div{
			position:relative;
			margin:0px; padding:0px;
		}
        .ruler_canvas {
            position:relative;
            top:0px;
            left:0px;
            border:1px solid black;
            //border:1px solid white;
            background-color:#1f1f1f;
       		//background-color:#FFF;
            margin-bottom:10px;
        }
        .spread_canvas {
            position:absolute;
            top:15px;
            left:15px;
            border:1px solid black;
            //border:1px solid #D8D8D8;
            background-color:#606060;
            //background-color:#F4F4F4;
        }
        
        #draggable {position:absolute; width: 210px; height: 250px; padding: 10px; top:20px; right:40px;}
        button:hover{cursor:pointer;}
    </style>
</head>
<body>
<!--temporary canvas for fabricJs text element -->
<canvas id="fCanvas" style="left:0; top:0; height: 842px; width: 595px; z-index: 999; position: absolute"></canvas>
<script>
	var fCanvas = new fabric.Canvas("fCanvas");
</script>
	<div class="spread_container" style="display:none;">
	    <canvas class="ruler_canvas" id="ruler_canvas" width="115" height="115"></canvas>
	    <canvas class="spread_canvas" id="spread_canvas" width="100" height="100"></canvas>
	</div>
	
	<div id="interface"></div>
	



<canvas id="temp_canvas" style="left:-10000px;"></canvas>




<div id="draggable" class="ui-widget-content ui-draggable ui-draggable-handle">
Toolbox
<br>
<br>
<button style="background-image: url('./img/select.png'); width:30px; height:20px; border:0px;" name="select" id="select" type="button"></button>
<br>
<button style="background-image: url('./img/alt_select.png'); width:30px; height:20px; border:0px;" name="alt_select" id="alt_select" type="button"></button>
<br>
<button style="background-image: url('./img/type_tool.png'); width:30px; height:20px; border:0px;" name="type_tool" id="type_tool" type="button"></button>
<br>
<br>
Size:
<select id="font_size" name="font_size">
<option value="12">12px</option>
<option value="14">14px</option>
<option value="18">18px</option>
<option value="20">20px</option>
</select>
<hr>
<select id="font_face" name="font_face">
<option value="Minion Pro">Minion Pro</option>
<option value="Helvetica">Helvetica</option>
<option value="Arial">Arial</option>
<option value="Times">Times</option>
<option value="Times New Roman">Times New Roman</option>
<option value="Courier">Courier</option>
<option value="Courier New">Courier New</option>
<option value="Verdana">Verdana</option>
<option value="Tahoma">Tahoma</option>
</select>
<hr>
Color:
<select id="font_color" name="font_color">
<option value="#000000">Black</option>
<option value="#FF0000">Red</option>
<option value="#FFFA00">Yellow</option>
<option value="20#00FF11">Green</option>
</select>
</div>





</body>
</html>