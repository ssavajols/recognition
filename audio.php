<?php
$q = "";

if( isset($_GET['query'])){
    $q = strip_tags($_GET['query']);
}

$filename = "./audio/".md5($q);

chmod($filename, 777);

if( empty($q)){
    exit('Aucun mots');
}

$dir = scandir('./audio');

foreach($dir as $d ){

    if( is_dir('./audio/'.$d)){
        continue;
    }
    unlink('./audio/'.$d);
}

$mp3 = file_get_contents($q);

file_put_contents($filename, $mp3);

?>
<audio src="<?php echo $filename;?>" autoplay="autoplay" controls="controls"></audio>