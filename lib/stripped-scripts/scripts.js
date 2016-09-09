<script type="text/javascript">
			//test dynamic obj init
			// function MyClass() {
			// console.log("constructor invoked");
			// }
			// var s = "MyClass";
			// new window[s]; 
			function is_object(x) {
				return x === Object(x);
			}
			$(function(){
			//
			// TOOLBOX
			//
			$("button[name='select']").click(function(){
			//canvas_fsm.selection_mode = 'normal_selection';
			});
			$("button[name='alt_select']").click(function(){
			//canvas_fsm.selection_mode = 'alt_selection';
			});
			$("button[name='type_tool']").click(function(){
			//canvas_fsm.selection_mode = 'type_tool';
			});
			$("button[name='save']").click(function(){
				//var myDrawing = document.getElementById("spread_canvas");
				//var drawingString = myDrawing.toDataURL("image/png");

				// var drawingString = canvas_fsm.ctx.getImageData(0,0,500,500);
				//var postData = "canvasData="+drawingString;

				// console.log(myDrawing);
				// console.log(drawingString);
				// console.log(postData);
				// 				
				// var ajax = new XMLHttpRequest();
				// ajax.open("POST", 'http://<?php echo $_SERVER['SERVER_NAME']; ?>/idml_loader/loader.php', true);
				// ajax.setRequestHeader('Content-Type', 'canvas/upload');
				// ajax.onreadystatechange=function()
				// {
				// if (ajax.readyState == 4)
				// {
				// alert("image saved");
				// }
				// }
				// ajax.send(postData);
			});

			$("select[name='font_size']").change(function(){

			});
			$("select[name='font_face']").change(function(){

			});
			$("select[name='font_color']").change(function(){

			});

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
			});
		</script>