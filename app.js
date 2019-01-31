var express = require('express');
var app = express();
const port = 8080;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req,res){
	//res.send('hello! this is the main page');
	res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, function(){
	console.log(`zxample app listening at port ${port}`);
});