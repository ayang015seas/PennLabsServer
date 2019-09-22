# PennLabsServer
This is my submission for the PennLabs server challenge. 

Few things I need to clarify:

1. Originally, I said during my interview that I would be working
on the Frontend react challenge. However, after reading through the challenges I thought that the backend server one sounded very interesting, so I decided to switch to that instead.

2. I checked with Davis that I could write my scraper and server in JavaScript instead of Python as I have more experience. However, there are also some other advantages of using JS as I will explain in a second, but I am totally hyped to code and get more experience in Python if that's the club requires. 

3. The repo also contains a CSV from the club scraping and a JSON file with the raw data if you want to take a look at those. 

# Running Instructions
After cloning this repository, run the following commands:

npm install

To Scrape: npm run scrape
To Start the Server: npm run start 

If these commands do not work, please let me know since I've tested them and they definitely should work. (It also could be if you don't have chrome, since the API relies on the chrome browser)

# Testing
The server should run at http://localhost:3000/

The fake user that was created had a username of jennThePenn, so that route is: 
http://localhost:3000/api/users/jennThePenn


# Explanation
I will start with explaining the Scraper.

One of the advantages of using JavaScript over python is the ability to use Google's puppeteer API. Puppeteer has a lot of built in features for really detailed scraping, screenshots, metadata/caching analysis, and even performance metrics to see how fast components of your frontend are loading. Although it tends to be more semantic than BeautifulSoup4, I believe it also offers more options. 

The first main function in the scraper is the createNewClub function, which works as expected. It works with a global club array that it pushes in new club objects with name, description, and category. The caveat is that it processes parallel arrays of clubnames, descriptions, and categories since that's the data structure that scrape() returns. 

The main scrape() function opens up a new instance of chrome. If you don't have chrome, this will not work. The browser navigates to the target page, and then scrapes all clubnames, descriptions, and categories according to the inspect element selectors. It then returns the parallel array object to be processed by the createNewClub function.

Finally, the bottom function has an indented series of 
promises. The reason for this is because of the asynchronous functions run in JavaScript - we need to wait for the scraping to finish before we write to the CSV sheet and the JSON file. 

At the end, the function exits after writing to files. Very straightforward overall. 


Next, I will move onto the index.js file, which is the actual server.

One of the things I remember discussing with Valencia during the interview was how comments generally lead to a lot of trolling and badness even though people want to see them. This is why sentiment analysis is a potential option - it takes comments and produces an integer scoring based what people really have to say. It's by no means a perfect solution but it could be an interesting idea. 

In this file, we have 3 main data structures: Users, clubFavorites, and data. 
The data is simply the raw JSON data that is read from the JSON file that we scraped. 
The clubFavorites stores information about the club, including the name, comments, sentiment score, and number of favorites. 
The Users structure stores all new users that are registered. 

In real production code, I would have integrated the data with a MongoDB server but for the purposes of this API I didn't think it was necessary. 

The two notable routes are near the bottom of the file. The first is /api/favorite. The way this works is that users each have an object with the clubs they favorited already. If they already favorited it, they cannot do so again. 

The second notable route is the comment route, with /api/comment. This route interacts with the clubFavorites object, and updates the list of comments for each club. Additionally, it also updates the sentiment score for the club via an average. 

Everything else should do pretty much exactly what the challenge specified, and if you have any questions or feedback about it please tell me about it. 


Overall, this was a pretty fun challenge to do. Once again, I want to reiterate that I'm willing to get more experience and code backend in python if that's preferred. I would be super hyped to do this stuff in a team setting. Thanks for reading through to the end. 


