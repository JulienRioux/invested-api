const express = require('express'),
	    bodyParser = require('body-parser'),
      cors = require('cors'),
			request = require("request"),
			cheerio = require("cheerio"),
      PORT = process.env.PORT || 3001

// Load the csv file
const loadData = require("./data/loadingCSV.js");
const loadedData  = loadData();
const investors = loadedData.investors;
const companies = loadedData.companies;
const hedgeFunds = loadedData.hedgeFunds;


const app = express();

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// Testing route
app.get("/", (req, res) => {
	res.json({
		message: "Welcome to the financed api!"
	})
})


//
app.post("/search", (req, res) => {
	// get the data from the restful post given by the client side
	let searchInput = req.body.searchInput;
	let searchType = req.body.searchType;
	// change the begining of the url for different search (company, fund, investor)
	let urlType;
	if(searchType === "company") urlType = "so/us/";
	else if(searchType === "fund") urlType = "i/";
	else if(searchType === "investor") {
		urlType = "i/";
		// check if the investor name is in the database first
		if(!investors[searchInput]) {
			return res.json({
				error: true,
				resultsList: [],
				message: "Investor not found..."
			})
		} else {
			// else get it right away using the investor object
			searchInput = investors[searchInput];
		}
	}

	// ==========================
	//     Data Manipulation
	// ==========================
	// Manipulate the data to make the search work
	// Just some manipulations to get things work
	// This could be improve in future versions
	searchInput = searchInput.split(" ").join("_");
	searchInput = searchInput.split("-").join("_");
	searchInput = searchInput.replace(/\W/g, '');
	searchInput = searchInput.split("_").join("-").toLowerCase();
	searchInput = searchInput.split("-inc")[0];

	// ==========================
	//      start to scrape
	// ==========================
	let fetchUrl = `https://fintel.io/${ urlType }${ searchInput }`;
	request(fetchUrl, (error, response, html) => {
		if(!error && response.statusCode === 200) {
			const $ = cheerio.load(html);
			// create a list to insert the results of the scrapping
			const resultsList = [];
			$("#transactions tr td a").each((i, el) => {
				const item = $(el).text();
				if(item !== "") resultsList.push(item);
			})

			// get some info about the company
			let infoList = [];
			$(".table-condensed tr td").each((i, el) => {
				const item = $(el).text();
				if(item !== "") infoList.push(item);
			})
			infoList = infoList.slice(0, 14);
			// infoObj = {};
			// // create an object from the list
			// for(let i = 0; i < infoList.length; i+=2){
			// 	// get the boss value and title (not uniformized...)
			// 	let key;
			// 	let value;
			// 	if(i === 2){
			// 		key = "CEO"
			// 		value = [infoList[i].replace("\n", ""), infoList[i+1].replace("\n", "")];
			// 		// value = {
			// 		// 	title: infoList[i].replace("\n", ""),
			// 		// 	name: infoList[i+1].replace("\n", "")
			// 		// }
			// 	}
			// 	else {
			// 		key = infoList[i].replace("\n", "");
			// 		value = infoList[i+1].replace("\n", "");
			// 	}
			// 	if(value === undefined) value = "not found";
			// 	infoObj[key] = value;
			// }
			console.log(infoList);
			// console.log(infoObj);

			// Send it as json
			res.json({
				error: false,
				resultsList: resultsList,
				infoList: infoList
			})
		}
		else {
			// send error message and return an empty result list
			return res.send({
				error: true,
				resultsList: [],
				message: "not found"
			})
		}
	})
})


// let tempUrl = "https://fintel.io/so/us/tsla";

// let tempUrl = "https://fintel.io/i/berkshire-hathaway"

// request(tempUrl, (error, response, html) => {
// 	if(!error && response.statusCode === 200) {
// 		const $ = cheerio.load(html);
// 		// create a list to insert the results of the scrapping
// 		// $("#transactions tr td a").each((i, el) => {
// 		// 	const item = $(el).text();
// 		// 	if(item !== "") resultsList.push(item);
// 		// })
//
//
// 		// get some info about the company
// 		let infoList = [];
// 		$(".table-condensed tr td").each((i, el) => {
// 			const item = $(el).text();
// 			if(item !== "") infoList.push(item);
// 		})
// 		infoList = infoList.slice(0, 14);
// 		infoObj = {};
// 		// create an object from the list
// 		for(let i = 0; i < infoList.length; i+=2){
// 			const key = infoList[i].replace("\n", "");
// 			const value = infoList[i+1].replace("\n", "");
// 			infoObj[key] = value;
// 		}
// 		console.log(infoObj);
// 	}
// });


// start the port
app.listen(PORT, console.log(`Server running on port ${ PORT }`));
