<?php 
header('Content-Type: application/javascript');
$scripts = array('global','silo.min', 'loader','cache','router','view','bind');
foreach($scripts as $script){
	include("$script.js");
}
?>