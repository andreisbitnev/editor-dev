<?php

//phpinfo();
// include "./lzw.inc.php";


error_reporting(E_ALL);
ini_set('display_errors', 1);




if (isset($GLOBALS["HTTP_RAW_POST_DATA"]))
{
	$rawImage=$GLOBALS['HTTP_RAW_POST_DATA'];
	
	
	var_dump($rawImage);
	
	
	$removeHeaders=substr($rawImage, strpos($rawImage, ",")+1);
	$decode=base64_decode($removeHeaders);
	$fopen = fopen(__DIR__.'/img/test_image.png', 'wb' );
	fwrite( $fopen, $decode);
	fclose( $fopen );
	die();
}





if(isset($_GET['images'])){
	$string = '';
    $files = glob(__DIR__."/".$_GET['images']."/Links/*");
	
	// $element_array = Array();
	$index = 0;
	$element_array = Array();
	
    foreach($files as $file){
    	
		$file = basename($file);
		
		$element_array[$index] = $file;
		$index++;
    }
    echo json_encode($element_array);
	die();
}

if(isset($_GET['colours'])){
	
    $content = file_get_contents(__DIR__."/".$_GET['colours']."/Resources/Graphic.xml");
	
    $content = str_replace("idPkg:", "idPkg", $content);
    $xml = @simplexml_load_string($content, null, LIBXML_NOCDATA | LIBXML_COMPACT | LIBXML_PARSEHUGE | LIBXML_BIGLINES);
	$element_array['color_palette'] = $xml->children();

    echo json_encode($element_array);
	die();
}


if(isset($_GET['spreads'])){

	$string = '';
    $files = glob(__DIR__."/".$_GET['spreads']."/Spreads/*");
	
	$element_array = Array();
	
    foreach($files as $file){
    	$contents = '';
        $content = file_get_contents($file);
		
	    $content = str_replace("idPkg:", "idPkg", $content);
		
	    $xml = @simplexml_load_string($content, null, LIBXML_NOCDATA | LIBXML_COMPACT | LIBXML_PARSEHUGE | LIBXML_BIGLINES);
		
		$story_id = (string)$xml->Spread->attributes()->Self[0];
		$element_array[$story_id] = $xml->children();
    }
    echo json_encode($element_array);
	die();


}elseif(isset($_GET['stories'])){

	$string = '';
    $files = glob(__DIR__."/".$_GET['stories']."/Stories/*");
	
	$element_array = Array();
	
    foreach($files as $file){
    	$contents = '';
        $content = file_get_contents($file);
		
	    $content = str_replace("idPkg:", "idPkg", $content);
		$content = str_replace("<Br />", "<Content>&lt;Br /&gt;</Content>", $content);
		//$content = str_replace("<Br />", "\n", $content);
		
	    $xml = @simplexml_load_string($content, null, LIBXML_NOCDATA | LIBXML_COMPACT | LIBXML_PARSEHUGE | LIBXML_BIGLINES);
		
		$story_id = (string)$xml->Story->attributes()->Self[0];
		$element_array[$story_id] = $xml->children();
    }
    echo json_encode($element_array);
	die();


}elseif(isset($_GET['fonts'])){

	$string = '';
    $files = glob(__DIR__."/".$_GET['fonts']."/Document fonts/*");
	
	// $element_array = Array();
	$index = 0;
	$element_array = Array();
	
    foreach($files as $file){
    	
		$file = basename($file);
		
		$element_array[$index] = $file;
		$index++;
    }
    echo json_encode($element_array);
	die();


}else if(isset($_GET['file'])){

    //echo 'Test Obj';
    //echo '<hr>';
    //echo '<pre>';

    $string = file_get_contents($_GET['file']);

    $string = str_replace("idPkg:", "idPkg", $string); // Replace "idPkg:" with "idPkg" so the colon dosnt hide elements
    
    // TEXT CONTENT QUICK FIX because of how the JSON handles BRs in Stories 
	$string = str_replace("<Br />", "<Content>&lt;Br /&gt;</Content>", $string);
				
				
    
    
    //$xml = @simplexml_load_string($string);


    // NOTES
    // http://stackoverflow.com/questions/21548443/php-converting-xml-to-json-does-not-work-when-there-is-cdata
    // http://php.net/manual/en/libxml.constants.php

    //$xml = @simplexml_load_string($string);
    $xml = @simplexml_load_string($string, null, LIBXML_NOCDATA | LIBXML_COMPACT | LIBXML_PARSEHUGE | LIBXML_BIGLINES);



    echo json_encode($xml->children());
    die();

    /****
    echo $xml->getName();
    echo '<hr>Attributes<hr>';
    var_dump($xml->attributes());

    echo '<hr>Recursive<hr>';
    function recursively_list_objects($node, $depth=1) {
        foreach($node->children() as $child){
            echo 'Level = '.$depth.' - '.$child->getName().'<br>';
            recursively_list_objects($child, $depth+1);
        }
    }
    recursively_list_objects($xml);
    /****/

}else if(isset($_FILES['files'])){
	
	// Convert from multiple to single for demo...
	// http://php.net/manual/en/features.file-upload.multiple.php

    $file_ary = reArrayFiles($_FILES['files']);

    foreach ($file_ary as $file) {
        $_FILES['files'] = $file;
		break;
    }
	
	
    // test
    //
//    file_put_contents("testFile", "test");
//    $user = fileowner("testFile");
//    unlink("testFile");
//    echo $user;
//    die();


    // empty /temp dir
    //
    system('/bin/rm -rf ' . escapeshellarg(__DIR__.'/temp/'));
	if(!is_dir(__DIR__.'/temp/')){
		mkdir(__DIR__.'/temp/', 0777);	
	}
    

    // upload
    //
    if(!move_uploaded_file($_FILES['files']['tmp_name'],  __DIR__.'/temp/'.$_FILES['files']['name'])) {
        echo 'Errors:'.print_r($_FILES);
		die();
    }
    /*********************************/
    
    else{
?>
        <html><head><title>IDML Loader</title></head><body>
        <hr>Select IDML file<hr>
        <form action="" method="POST" enctype="multipart/form-data">
        	<input type="hidden" name="do_upload" value="">
            <!-- <input type="file" name="idml_file" /> -->
            <input type="file" name="files[]" />
            <br><br>
            <input type="submit" value="Upload file" />
        </form>
        </body></html>
<?php
    }
	/*********************************/

    // UNPACK
    //
    $path = $_FILES['files']['name'];
	$ext = pathinfo($path, PATHINFO_EXTENSION);

	// If its just an IDML file on its own...
    if(strtolower($ext) == 'idml'){
	    $zip = new ZipArchive;
	    $res = $zip->open(__DIR__.'/temp/'.$_FILES['files']['name']);
	    $zip->extractTo(__DIR__.'/temp/');
	    $zip->close();
		
	    // delete origional file
	    unlink(__DIR__.'/temp/'.$_FILES['files']['name']);
    }

	// If its a packaged IDML file inside a .zip that also contains ftons and assets...
    if(strtolower($ext) == 'zip'){
    	
		// Unpack the archive
	    $zip = new ZipArchive;
	    $res = $zip->open(__DIR__.'/temp/'.$_FILES['files']['name']);
	    $zip->extractTo(__DIR__.'/temp/');
	    $zip->close();
		
		// Delete any Mac rubbish...
		if(is_dir(__DIR__.'/temp/__MACOSX')){
			system('/bin/rm -rf ' . escapeshellarg(__DIR__.'/temp/__MACOSX'));
		}
		
		// If the contents unpacked into a folder move it out of that folder...
		$results = scandir(__DIR__.'/temp/');
		foreach ($results as $file) {
			if (in_array($file, array(".","..","Document fonts" ,"Links"))) continue;
			
			// Get file ext
			$ext = pathinfo(__DIR__.'/temp/'.$file, PATHINFO_EXTENSION);
			
			// Copy the IDML file, assets (Links) and fonts...
			if($ext != 'zip'){
				$source_dir = __DIR__.'/temp/'.$file.'/';
			}
		}
		// 0 and 1 are . and ..
		$destination_dir = __DIR__.'/temp/';


		if(is_dir($source_dir)){ // 
			
			$files = scandir($source_dir);
	
			foreach ($files as $file) {
				
				if (in_array($file, array(".",".."))) continue;
				
				// Get file ext
				$ext = pathinfo($source_dir.$file, PATHINFO_EXTENSION);
				
				// Copy the IDML file, assets (Links) and fonts...
				if($ext == 'idml' || $file == "Document fonts" || $file == "Links"){
					
					if(is_dir($source_dir.$file)){
						exec('/bin/cp -rp "'.$source_dir.$file.'" "'.$destination_dir.$file.'"');
					}else{
						copy($source_dir.$file, $destination_dir.$file);	
					}
				}
			}
	
			system('/bin/rm -rf ' . escapeshellarg($source_dir));
		}
		

		
	    // delete origional file
	    unlink(__DIR__.'/temp/'.$_FILES['files']['name']);
		
		// Unpack as normal
		$results = scandir(__DIR__.'/temp/'); // find IDML for this - test this later
		
		foreach ($results as $file){
		
			// Get file ext
			$ext = pathinfo($file, PATHINFO_EXTENSION);
			
			// Copy the IDML file, assets (Links) and fonts...
			if($ext == 'idml'){
				
			    $zip = new ZipArchive;
			    $res = $zip->open(__DIR__.'/temp/'.$file);
			    $zip->extractTo(__DIR__.'/temp/');
			    $zip->close();
				
				unlink(__DIR__.'/temp/'.$file);
				
			}
		}
		
		
		

    }

	// Open up permissions while prototyping
	system('chmod -R 777 '.__DIR__.'/temp');
	system('chown -R www-data:www-data '.__DIR__.'/temp');
	
	





}

/*********************************/
else{
?>
<html><head><title>IDML Loader</title></head><body>
<hr>Select IDML file<hr>
<form action="" method="POST" enctype="multipart/form-data">
	<input type="hidden" name="do_upload" value="">
    <!-- <input type="file" name="idml_file" /> -->
    <input type="file" name="files[]" />
    <br><br>
    <input type="submit" value="Upload file" />
</form>
</body></html>
<?php
}
/*********************************/



function reArrayFiles(&$file_post) {

    $file_ary = array();
    $file_count = count($file_post['name']);
    $file_keys = array_keys($file_post);

    for ($i=0; $i<$file_count; $i++) {
        foreach ($file_keys as $key) {
            $file_ary[$i][$key] = $file_post[$key][$i];
        }
    }

    return $file_ary;
}




?>