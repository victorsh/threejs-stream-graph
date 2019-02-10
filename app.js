var express = require('express');
var app = express();
require('dotenv').config();

var port = 8080;
if(process.env.NODE_ENV === "production") {
	port = 80;
	console.log('prod')
} else {
	console.log('dev');
	port = 8080;
}

app.use(express.static(__dirname + '/public'));

app.get('/', function(req,res){
	res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, function(){
	console.log(`App listening at port ${port}`);
});