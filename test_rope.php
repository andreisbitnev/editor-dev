<html>
<head>
    <title>IDML Editor</title>

    <script src="./lib/jquery-2.1.4.min.js"></script>
    <script src="./lib/rope.js"></script>


	<!-- // -->

    <script type="text/javascript">


		function is_object(x) {
		    return x === Object(x);
		}


        $(function(){
            "use strict";
            			
			console.log('0------------------');
            			
			var r = Rope('this is a test');
			console.log(r);
			console.log(r.toString());


			console.log('1------------------');

			var r = Rope('this is a test');
			r.remove(0,3);
			console.log(r.toString());
            			
            			
			console.log('2------------------');

			var r = Rope('this is a test');
			console.log(r.length);
			r.insert(5,'another ');
			console.log(r.toString());
			console.log(r.length);			
			

			console.log('3------------------');

			var r = Rope('this is a test');
			console.log(r);
			r.remove(0,3);
			r.insert(5,'another ');
			console.log(r);
			r.rebuild();
			console.log('-Rebuild-');
			console.log(r);	
			
			
			console.log('4------------------');

			var r = Rope('this is a test');
			console.log(r);
			r.remove(0,3);
			r.insert(5,'another ');
			console.log(r);
			r.rebalance();
			console.log('-Rebalance-');
			console.log(r);	
			
			
			console.log('5------------------');
			
			var r = Rope('this is a test');
			console.log(r.substring(1,3));
			
			
			console.log('6------------------');
			
			var r = Rope('this is a test');
			console.log(r.substr(1,3));
			
			
			console.log('7------------------');
			
			var r = Rope('this is a test');
			console.log(r.charAt(2));
			
			
			console.log('8------------------');
			
			var r = Rope('this is a test');
			console.log(r.charCodeAt(2));            			
            			
            			
            			
            			
            			
        });

    </script>

</head>
<body>
</body>
</html>