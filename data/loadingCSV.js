const fs = require("fs");
const companiesFile = fs.readFileSync(__dirname + "/Companies.csv", "utf-8");
const investorsFile = fs.readFileSync(__dirname + "/Investors.csv", "utf-8");
const hedgeFundsFile = fs.readFileSync(__dirname + "/HedgeFunds.csv", "utf-8");


const loadData = () => {
	// Do some data processing to get the companies data in a list
	// company[0] = symbol
	// company[1] = company name
	let companies = companiesFile.split("\n");
	// create a company object to remove duplicates + quicker search
	let companiesObj = {};
	companies = companies.map((company, i) => {
		// add the company in the array (if not the label row)
		if(i !== 0){
			company = company.split("\r")[0].split(",");
			if(!companiesObj[company]) companiesObj[company[0]] = company[1];
			return company;
		}
	});
	// remove the label row (first row)
	companies = companies.slice(1);


	// Do some data processing to get the investor data in a list
	// investor[0] = Name
	// investor[1] = Account Name (Hedge fund)
	let investors = investorsFile.split("\n");
	investors = investors.map(investor => {
		investor = investor.split("\r")[0];
		return investor.split(",");
	});
	// remove the label row
	investors = investors.slice(1);

	// create an object of the investor for quicker search
	let investorsObj = {};
	//
	investors.forEach(investor => {
		const name = investor[0];
		const fund = investor[1];
		// add it to the investor object
		if(!investorsObj[name]) investorsObj[name] = fund;
	});

	// Do some data processing to get the hedge funds data in a list
	// create an object of the funds
	let hedgeFunds = hedgeFundsFile.split("\n");
	hedgeFunds = hedgeFunds.map(fund => {
		fund = fund.split("\r")[0].split(",")[0];
		return fund;
	});
	// remove the label row
	hedgeFunds = hedgeFunds.slice(1, hedgeFunds.length-1);

	// remove duplicates + quicker search
	let hedgeFundsObj = {};
	hedgeFunds.forEach(fund => {
		if(!hedgeFundsObj[fund]) hedgeFundsObj[fund] = true;
	})

	// return an object that contain all the data in the csv file
	return {
	  investors: investorsObj,
		companies: companiesObj,
		hedgeFunds: hedgeFundsObj
	};
}

module.exports = loadData;
