var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req,res){
	//res.send('hello! this is the main page');
	res.sendFile(__dirname + '/public/index.html');
});

app.listen(8080, function(){
	console.log('Example app listening at port 8080!');
});