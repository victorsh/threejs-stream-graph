var scene, camera, renderer, stats, light, ambiLight, controls, skyshpere, floor, cube, line;
var btcData = [];
var NormalizedData = [];
var baseLine = [];
var sumPerPoint = [];
var chndPerCurr = [[],[],[],[],[],[],[]];
var SelectedData = 5;
var currency = ["USD", "EUR", "CAD", "AUD", "GBP", "JPY", "PLN"];
var setColors = ["#FF3300","#FF9933","#00FF33","#33FF99","#0033FF","#0099FF","#33aaFF"];

function init(){
	//Initialization of scene parameters
	stats = new Stats();
	stats.showPanel(1);
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 100000 );

	renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( 0x000000, 1 );
	document.body.appendChild( renderer.domElement );

	//orbit controls for camera
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableZoom = true;
	controls.enabled = true;
	controls.maxPolarAngle = Math.PI/2;
	
	//lights
	light = new THREE.DirectionalLight(0xFFFFFF);
	light.position.set(20,20,20).normalize();
	scene.add(light);
	ambiLight = new THREE.AmbientLight(0xFFFFFF, 0.4);
	scene.add(ambiLight);
	
	///////////////////////////////////////////////////////////////////////////
	var graphs = [];
	var gO = 0;
	var days = 90;
	var week = 7;
	var circumf = days/week;
	var radius = circumf/2*Math.PI;
	var avgPerKtop = [];
	var avgPerKbottom = [];
	
	for(var k = 0; k<days; k++){
		var spritey = makeTextSprite( k, { 
			fontsize: 20, borderColor: {r:255, g:0, b:0, a:0.0}, backgroundColor: {r:255, g:100, b:100, a:0.0} 
		} );
		spritey.position.set(
			(radius) * Math.cos(Math.PI*2/(days/week)*(k/week)), 
			(0), 
			(radius) * Math.sin(Math.PI*2/(days/week)*(k/week))
		);
		scene.add( spritey );
	}
	//loops through each currency set
	for(var j = 0; j<chndPerCurr.length; j++){
		var sumPerK = 0;
		var zVal = 0;
		
		for(var t = 0; t<chndPerCurr.length; t++){
			sumPerK += chndPerCurr[t][0] * (chndPerCurr.length - t + 1);
		}
		gO = -1 * sumPerK/(chndPerCurr.length + 1);

		graphs.push(new THREE.Geometry());
		graphs[j].vertices.push(
			new THREE.Vector3( 
				radius * Math.cos(Math.PI*4/(days/week)*(0/week)), 
				gO, 
				radius * Math.sin(Math.PI*4/(days/2)*(0/week))
			)
		);
		graphs[j].faces.push(new THREE.Face3(0, 1, 2));
		
		for(var k = 0; k<days; k++){ //833 is the shortest length of all the data
			//Generate basline gO for all the points
			sumPerK = 0;
			for(var t = 0; t<chndPerCurr.length; t++){
				sumPerK += chndPerCurr[t][k] * (chndPerCurr.length - t + 1);
			}
			gO = -1 * sumPerK/(chndPerCurr.length + 1);

			//Get fi through summation of previous points
			var fi = gO;
			for(var t = 0; t<j; t++){
				fi += chndPerCurr[t][k];
			}
			
			if(k != days-2 && k != days-1){
			
				//Vertices of top of stream graph
				graphs[j].vertices.push(
					new THREE.Vector3( 
						(radius) * Math.cos(Math.PI*4/(days/week)*(k/week)), 
						(fi + chndPerCurr[j][k]), 
						(radius) * Math.sin(Math.PI*4/(days/week)*(k/week))
					)
				);
				
				//Vertices at bottom of stream graph
				graphs[j].vertices.push(
					new THREE.Vector3( 
						(radius) * Math.cos(Math.PI*4/(days/week)*(k/week)), 
						fi, 
						(radius) * Math.sin(Math.PI*4/(days/week)*(k/week))
					)
				);
				
				//Set the drawing order of the triangle
				graphs[j].faces.push(new THREE.Face3(k+1, k+1-1, k+1+1));
				graphs[j].faces.push(new THREE.Face3(k+1, k+1+1, k+1+2));
				
				//Set the color of the stream
				var color = setColor(j);
				var hex = color.getHex();
				
				scene.add(new THREE.Mesh(graphs[j], new THREE.MeshBasicMaterial({ color:hex, side:THREE.DoubleSide })));
			}else if(k == days-2){//Connecting the dots
				//Vertices of top of stream graph
				graphs[j].vertices.push(
					new THREE.Vector3( 
						(radius) * Math.cos(Math.PI*4/(days/week)*(k/week)), 
						(fi + chndPerCurr[j][k]), 
						(radius) * Math.sin(Math.PI*4/(days/week)*(k/week))
					)
				);
				
				//Vertices at bottom of stream graph
				graphs[j].vertices.push(
					new THREE.Vector3( 
						(radius) * Math.cos(Math.PI*4/(days/week)*(k/week)), 
						fi, 
						(radius) * Math.sin(Math.PI*4/(days/week)*(k/week))
					)
				);
				
				//Set the drawing order of the triangle
				graphs[j].faces.push(new THREE.Face3(k+1, k+1-1, k+1+1));
				graphs[j].faces.push(new THREE.Face3(k+1, k+1+1, k+1+2));
				
				//Set the color of the stream
				var color = setColor(j);
				var hex = color.getHex();
				
				scene.add(new THREE.Mesh(graphs[j], new THREE.MeshBasicMaterial({ color:hex, side:THREE.DoubleSide })));
			}else if(k == days -1){//final connection to averaged points
				//Vertices of top of stream graph
				graphs[j].vertices.push(
					new THREE.Vector3( 
						(radius) * Math.cos(Math.PI*4/(days/week)*(k/week)), 
						(fi + chndPerCurr[j][k]), 
						(radius) * Math.sin(Math.PI*4/(days/week)*(k/week))
					)
				);
				
				//Vertices at bottom of stream graph
				graphs[j].vertices.push(
					new THREE.Vector3( 
						(radius) * Math.cos(Math.PI*4/(days/week)*(k/week)), 
						fi, 
						(radius) * Math.sin(Math.PI*4/(days/week)*(k/week))
					)
				);
				
				//Set the drawing order of the triangle
				graphs[j].faces.push(new THREE.Face3(k+1, k+1-1, k+1+1));
				graphs[j].faces.push(new THREE.Face3(k+1, k+1+1, k+1+2));
				
				//Set the color of the stream
				var color = setColor(j);
				var hex = color.getHex();
				
				scene.add(new THREE.Mesh(graphs[j], new THREE.MeshBasicMaterial({ color:hex, side:THREE.DoubleSide })));
			}
			
		}
	}
	$('body').removeClass("loading");////////////////////////////////////////////////////Stop Load
	
	//set camera
	camera.position.z = 20;
	animate();
}

function animate(){
	requestAnimationFrame( animate );
	update();
	render();
}

function update(){

}

function render(){
	renderer.render(scene, camera);
}

$(document).ready(function(){
	$('body').addClass("loading");
	getData();
	for(var i = 0; i<btcData.length; i++){
		$('#lables').append('<div id="'+currency[i]+'" style="width: 10px; height:10px; background:'+setColors[i]+'"></div>');
	}
	
	init();
	
}).ajaxStart(function(){
	
}).ajaxStop(function(){
	$('body').removeClass("loading");	
});

function getData(){
	var currency = ["USD", "EUR", "CAD", "AUD", "GBP", "JPY", "PLN"];
	
	for(var i = 0; i<7; i++){
		var my_url = "http://localhost:8080/btc_conv_data/MTGOX"+currency[i]+".json";
		var json = (function () {
			var json = null;
			$.ajax({
				'async': false,
				'global': false,
				'url': my_url,
				'dataType': "json",
				'success': function (data) {
					btcData[i] = data;
				}
			});
			return json;
		})(); 
	}
	
	//loop for the number of data points
	for(var k = 0; k<883; k++){
		sumPerPoint[k] = 0;
		//loop for the number of currencies
		for(var j = 0; j<btcData.length; j++){
			//get max per date
			sumPerPoint[k] += btcData[j].data[k][SelectedData];
		}
	}
	console.log(btcData);
	//change in price
	for(var k = 0; k<832; k++){
		for(var j = 0; j<btcData.length; j++){
			chndPerCurr[j].push((Math.abs(btcData[j].data[k+1][SelectedData]-btcData[j].data[k][SelectedData])/btcData[j].data[k+1][SelectedData]));//calculating change in volume
		}
	}
	console.log(chndPerCurr);
	
	//Normalize volume data
	//not used
	for(var k = 0; k<833; k++){
		for(var j = 0; j<btcData.length; j++){
			btcData[j].data[k][SelectedData] = btcData[j].data[k][SelectedData]/100000;//10,000,000
		}
	}
}

function setColor(num){
	console.log(num);
	var color;
	switch(num){	
		case 0:
			color = new THREE.Color("#FF3300");
			break;
		case 1:
			color = new THREE.Color("#FF9933");
			break;
		case 2:
			color = new THREE.Color("#00FF33");
			break;
		case 3:
			color = new THREE.Color("#33FF99");
			break;
		case 4:
			color = new THREE.Color("#0033FF");
			break;
		case 5:
			color = new THREE.Color("#0099FF");
			break;
		case 6:
			color = new THREE.Color("#33aaFF");
			break;
	}
	return color;
}

function makeTextSprite( message, parameters )
{
	if ( parameters === undefined ) parameters = {};
	
	var fontface = parameters.hasOwnProperty("fontface") ? 
		parameters["fontface"] : "Arial";
	
	var fontsize = parameters.hasOwnProperty("fontsize") ? 
		parameters["fontsize"] : 18;
	
	var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
		parameters["borderThickness"] : 1;
	
	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
	
	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
		
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;
    
	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;
	
	// background color
	context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
								  + backgroundColor.b + "," + backgroundColor.a + ")";
	// border color
	context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
								  + borderColor.b + "," + borderColor.a + ")";

	context.lineWidth = borderThickness;
	roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
	// 1.4 is extra height factor for text below baseline: g,j,p,q.
	
	// text color
	context.fillStyle = "rgba(255, 255, 255, 1.0)";

	context.fillText( message, borderThickness, fontsize + borderThickness);
	
	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas) 
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial( 
		{ map: texture, useScreenCoordinates: true} );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(10,5,1.0);
	return sprite;	
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) 
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	ctx.stroke();   
}

window.addEventListener('resize', function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});