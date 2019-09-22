// import all necessary libraries 
const puppeteer = require('puppeteer');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;  

// stores the club objects
var clubs = [];

/*
	This function creates new club objects from the result returned
	from the scrape() function. The objects have name, description,
	and category attributes. 
*/
function createNewClub(clubArray) {
	return new Promise(function(resolve, reject) {
		for (i = 0; i < clubArray.names.length; i++) {
			var name = clubArray.names[i];
			var description = clubArray.descriptions[i];
			var cats = clubArray.categories[i];
			clubs.push({name: name, description: description, categories: cats});
		}
		resolve();
	 })
}

/*
	The scrape function scrapes the page. 
	The reason it is returning a promise is because it occurs 
	asynchronously, requiring the program to delay until it is finished.
*/
function scrape() {
	return new Promise(function(resolve, reject) {
	(async () => {
		try {
			const browser = await puppeteer.launch(
			  {devtools: true,
			  	timeout:20000, headless: true,
			  	args:[]}
			);
			const page = await browser.newPage();
			await page.goto('https://ocwp.pennlabs.org/');
			const result = await page.evaluate(() => {
				// get all clubnames
		 		var clubNames = Array.from(document.querySelectorAll('.club-name'));
		        var names = clubNames.map(element => {
		            return element.innerText
		        });
		        // get all descriptions
		        var descriptions = Array.from(document.querySelectorAll('div.box em'));
		        var descriptionArray = descriptions.map(element => {
		            return element.innerText
		        });

		        // get all categories
		        var categories = Array.from(document.querySelectorAll('div.box div'));
		        var catArray = categories.map(element => {
		            return element.innerText.split('\n')
		        });

		        return {names: names, descriptions: descriptionArray, categories: catArray};

		 	})
		 	resolve(result)

		 	// close browser to free up resources 
			await browser.close();
		} catch (err) {
			console.log(err);
		}
	})()
	})
}
/*
	Here, we run a scrape function and write to both a CSV file (found in the same folder) 
	as well as a JSON file to be used by the actual API server.
*/
scrape().then(function(res) {
	createNewClub(res).then(
		function() {
			// write to JSON file
			fs.writeFileSync("jsonClubs", JSON.stringify(clubs), (err) => {
			    if (err) {
			    	console.log("Error While Writing");
			  	}
			});
			// write to CSV for easy readability
			const csvWriter = createCsvWriter({  
			  path: 'clubs' + '.csv',
			  header: [
			    {id: 'name', title: 'Name'},
			    {id: 'description', title: 'Description'},
			    {id: 'categories', title: 'Categories'},
			  ]
			});
			csvWriter  
			  .writeRecords(clubs)
			  // Exit after finishing
			  .then(()=> process.exit(0));
		});
});





