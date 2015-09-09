var path = require('path');
var express = require('express');
var logger = require('morgan');
var mysql = require('mysql');
var cookie = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var connection = mysql.createConnection({
	host: 'scalabledb.c47a5hmpj9xh.us-east-1.rds.amazonaws.com',
	user:'egupta',
	password: 'abcd1234',
	database: 'proj1'
});

var app= express();
//app.use(cookie);
app.use(bodyParser.urlencoded({ extended: false }));
connection.connect(function(error){
	if(!error) {
		console.log("Database connections are successful!"); 
	} else {
		console.log(error);
	}
});

//Add logger
app.use(logger('dev'));
//app.use(flash);
//Serve static files
//app.use(express.static(path.join(__dirname,'public')));

app.set('view engine', 'ejs');


//Router for REST calls
app.get('/', function (request, response){
	
	console.log("Lets Start");
	
	response.render('index.ejs',{message:""});
});

app.post('/login', function (request, response){
	
	console.log("Lets connect");
	
	console.log(request.body.username + request.body.password);
	
	connection.query("SELECT * FROM Users WHERE email = ? AND password = ?",[request.body.username,request.body.password], function (error, rows, fields) {
	if (!error) {
			if (rows.length > 0) {
				console.log('User found in db!');
				var role = rows[0].role;
				var q1 = rows[0].question1;
				var q2 = rows[0].question2;
				var q3 = rows[0].question3;
				if (role == 'admin') {
					connection.query("SELECT * FROM Users ",[request.body.username,request.body.password], function (error, rows, fields) {
						if (!error) {
							var dataArray = new Array();
							
							for (var i = 0; i < rows.length; i++) {
								if (rows[i].role != 'admin') {
									var json = {
										username : rows[i].email,
										question1 : rows[i].question1,
										question2 : rows[i].question2,
										question3 : rows[i].question3
									};
									dataArray.push(json);
									console.log(json);
									
								}
							}
							response.render('admin.ejs',{data:dataArray, username:request.body.username});
						} else {
							console.log (error);
						}
					});
				} else {
					response.render('welcome.ejs',{username:request.body.username, question1:q1, question2:q2, question3:q3, message:'', status:'s'});
				}
			} else {
				response.render('index.ejs',{message:"Username/Password incorrect!"});
			}
		}
		else {
			console.log("Error!");	
		}
	}); 	
	
	
});

app.post('/answer', function (request, response){
	
	console.log("Lets connect");
	
	console.log(request.body.username + "," + request.body.question1 + "," + request.body.question2 + "," + request.body.question3);
	
	var intq1 = parseInt(request.body.question1);
	var intq2 = parseInt(request.body.question2);
	var intq3 = parseInt(request.body.question3);

	console.log(intq1);
	
	var data = {
		question1 : intq1,
		question2 : intq2,
		question3 : intq3
	};
	
	if (intq1 === 0 || intq2 === 0 || intq3 === 0) {
		response.render('welcome.ejs',{username:request.body.username, question1:0, question2:0, question3:0, status: 'f', message:"'0' is not an excepted value!"});
	}
	
	connection.query("UPDATE Users SET ? WHERE email = ?",[data, request.body.username], function (error, rows, fields) {
		if (!error) {
				response.render('welcome.ejs',{username:request.body.username, question1:intq1, question2:intq2, question3:intq3, status: 's', message:"Successfully added!"});
		} else {
				console.log(error);
				response.render('welcome.ejs',{message:"Something went wrong!",username:request.body.username, question1:0, status: 'f'});
		}
	}); 
	
	
});


//Run
app.listen(8080);
console.log('Server up and running on port 8002');
