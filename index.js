var express = require('express');
var fs = require('fs');
var app = express();
var helmet = require('helmet');

// Helmet Enhances HTTP security
app.use(helmet());

// Sentiment Analysis Will be used for Comment Scoring
var Sentiment = require('sentiment');
var sentiment = new Sentiment();

// Read the scrape dData from JSON file
var hostFile = fs.readFileSync('clubJSON', 'utf8').split("BREAK_SIG");
var data = JSON.parse(hostFile);

// Stores the user info and the club info
users = {};
clubData = {};

// Instantiates the clubInfo with name, comments, sentiment score, and favorites
for (i = 0; i < data.length; i++) {
	clubData[data[i].name] = {};
	clubData[data[i].name].comments = [];
	clubData[data[i].name].sentiment = 0;
	clubData[data[i].name].favorites = 0;
}

/*
	This function scores the comments that will be posted to the server.
*/
function sentimentAnalyze(comment) {
	return sentiment.analyze(comment);
}

/*
	This function updates the JSON data structure with new clubs 
*/
function updateJSON(clubUpdate) {
	var data = JSON.parse(clubUpdate);
	var newClub = {name: data.name, description: data.description, categories: data.categories};
	data.push(newClub);
	updateJSONFile();
}

/*
	This function is solely responsible for writing new clubs to the JSON file.
*/
function updateJSONFile() {
	fs.writeFileSync("jsonClubs", JSON.stringify(data), (err) => {
	    if (err) {
	    	console.log("Error While Writing");
	  	}
	});
}

/*
	Function searches the user data structure by username
*/
function findUser(username) {
	return new Promise(function (resolve, reject) {
		console.log(username);
		console.log(Object.keys(users));
		console.log(users[username]);
		resolve(users[username]);
	})
}

/*
	Function creates new user. Originally, I was going to do 
	mongoDB integration but that requires a lot of semantic helper functions
	so for the purpose of this API I chose to leave it out
*/

function createNewUser(name, username, email, password) {
	const mongo = require('mongodb').MongoClient;
	const url = 'mongodb://localhost:27017';

	var user = {name: name, username: username, 
	email: email, password: password, favorites: []};
	console.log(user);
	users[username] = user;

	// Unused mongo code. 
	/*
	mongo.connect(url, (err, client) => {
		if (err) {
		    console.error(err);
		}

		const db = client.db('main');
		const users = db.collection('usernames');

		db.collection('users').insertOne(user, (err, result) => {
			if (err) {
				console.log(err);		
			}
		});
	});
	*/
}

/*
	These are the standard routes specified in the challenge requirements  
*/
app.get('/', async function(req, res) {
	res.send("Welcome to the Penn Club Review!");
});

/*
	Standard API route
*/
app.get('/api', async function(req, res) {
	res.send("Welcome to the Penn Club Review API!");
});

/*
	Route for club JSON data 
*/
app.get('/api/clubs', async function(req, res) {
	res.send(JSON.stringify(data));
});

/*
	Route to get user data (directions in the readme)
*/
app.get('/api/users/:username', async function (req, res) {
	var usrname = req.params.username;
	var result = users[usrname];
	if (result != undefined) {
		// make sure to take out the sensitive data before sending
		result['password'] = "[REDACTED]";
		result['favorites'] = "[REDACTED]";
		res.send(result);
	}
	else {
		res.send("No User Found");
	}
})

/*
	Route to post/create a new club
*/
app.post('/api/clubs', async function(req, res) {
	try{
		// we take the req.body.data because I'm assuming 
		// the user is sending posts via the Axios API
		var reqInfo = JSON.parse(req.body.data);
		updateJSON(reqInfo);
		res.send(200);
	}
	catch (err) {
		res.send(err);
	}
});


/*
	This route processes user favorite requests. Every user has a favorites
	attribute when instantiated, and if the user has already favorited the club, 
	they will not be able to do so a second time due to that persistent data 
	structure. 
*/
app.post('/api/favorite', async function(req, res) {
	try{
		// we take the req.body.data because I'm assuming 
		// the user is sending posts via the Axios API
		var reqInfo = JSON.parse(req.body.data);
		// we assume that there is a user and favorite attribute
		var username = reqInfo.user;
		var fav = reqInfo.favorite;

		// check if the user has already favorited
		if (users[username].favorites.includes(fav)) {
			res.send("Already Marked!");
		}
		else {
			// if not, update club favorites statistics
			users[username].favorites.push(fav);
			clubData[fav].favorites = clubData[fav].favorites + 1;
			res.sendStatus(200);
		}
	}
	catch (err) {
		res.send(err);
	}
});

/*
	This route processes user comment requests. I will explain more 
	about the sentiment analysis in the readme, but essentially it 
	saves the user comment about a specific club and also updates the 
	average sentiment score associated with that club. 
*/
app.post('/api/comment', async function(req, res) {
	try{
		// we take the req.body.data because I'm assuming 
		// the user is sending posts via the Axios API
		var reqInfo = JSON.parse(req.body.data);
		// we assume that there is a user, club and comment attribute
		var username = reqInfo.user;
		var club = reqInfo.club;
		var comment = reqInfo.comment;
		var score = sentimentAnalyze(comment);
		
		// update average sentiment
		clubData[club].comments.push(comment);
		var commentNumber = clubData[club].comments.length + 1;
		clubData[club].sentiment = (clubData[club].sentiment + score) / commentNumber;
		res.send("Comment Updated");
	}
	catch (err) {
		res.send(err);
	}
});

// create user as per instructions 
console.log("Creating User");
createNewUser('jen', 'jenThePenn', 'jenPenn@seas.upenn.edu', 'password');

// start server 
app.listen(3000, function () {
    console.log('Example app listening on port 3000.');
});