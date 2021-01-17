const express = require ('express');
const bodyParser = require('body-parser');
const covidRouter = express.Router();
const Request = require('request');
const csvtojson = require('csvtojson');
var moment = require('moment');
const Coviddata = require('../models/coviddata');
const Countrydata = require('../models/countrydata');
const { request } = require('express');
const NodeCache = require('node-cache');

const apiURL = 'http://localhost:5000/api/';
const whoURL = 'https://covid19.who.int/WHO-COVID-19-global-data.csv';

const covidCache = new NodeCache();

function getLastData(arr, prop) {
  var max;
  for (var i=0 ; i<arr.length ; i++) {
      if (max == null || parseInt(arr[i][prop]) > parseInt(max[prop]))
          max = arr[i];
  }
  return max;
}

function getStatistikData(data) {
  const cases = {};
  const deaths = {};
  const statData = {};

  for (var index = data.length - 1; index > 0; index--) {
    const selectedDate = moment.unix(data[index].Date_reported).format('MM/DD/YY');
    const casesValue = data[index].New_cases;
    const deathsValue = data[index].New_deaths;
    cases[selectedDate] = casesValue;
    deaths[selectedDate] = deathsValue;
  }

  statData["cases"] = cases;
  statData["deaths"] = deaths;

  return statData;
}

function getCountryList(data) {
  var lookup = {};
  var countries = [];

  for (var item, i = 0; item = data[i++];) {
    var country = item.Country;
    
    if (!(country in lookup) && country != "Global") {
    lookup[country] = 1;
    countries.push(country);
    }
  }

  return countries;
}

function getTableData(data, countryList) {
  const tableData = [];

  for (var index = 0; index < countryList.length; index++) {
    const country = countryList[index];

    const filterByCountry = data.filter((x)=>x.Country === country);
    const countryData = getLastData(filterByCountry, "Date_reported");

    tableData.push({
      "Country": country,
      "Cases": countryData.Cumulative_cases
    });
  }

  return tableData;
}

covidRouter.route('/:countryName/all')
.get((req,res,next) => {
  Coviddata.find({Country: req.params.countryName})
  .then((data) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(data);
  }, (err) => next(err))
  .catch((err) => next(err));
});

covidRouter.route('/:countryName/today')
.get((req,res,next) => {
  Coviddata.find({Country: req.params.countryName})
  .then((data) => {
      const lastData = getLastData(data, "Date_reported");
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(lastData);
  }, (err) => next(err))
  .catch((err) => next(err));
});

covidRouter.route('/:countryName/stat')
.get((req,res,next) => {
  Coviddata.find({Country: req.params.countryName})
  .sort({Date_reported: -1})
  .limit(120)
  .then((data) => {
      const stat = getStatistikData(data);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(stat);
  }, (err) => next(err))
  .catch((err) => next(err));
});

covidRouter.route('/countryList')
.get((req,res,next) => {
  if(covidCache.has("countryList")===false) {
    Coviddata.find({})
    .then((data) => {
      const countryList = getCountryList(data);
      covidCache.set("countryList", countryList);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(covidCache.get("countryList"));
    }, (err) => next(err))
    .catch((err) => next(err));
  }
  else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(covidCache.get("countryList"));
  }
});

covidRouter.route('/countryList/table')
.get((req,res,next) => {
  if(covidCache.has("countryTable")===false) {
    Coviddata.find({})
    .then((data) => {
        const tabelData = getTableData(data, getCountryList(data));
        covidCache.set("countryTable", tabelData);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(tabelData);
    }, (err) => next(err))
    .catch((err) => next(err));
  }
  else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(covidCache.get("countryTable"));
  }
});

covidRouter.route('/all')
.post((req, res, next) => {
  Coviddata.insertMany(req.body)
  .then((covid) => {
      console.log('Coviddata Created ', covid);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(covid);
  }, (err) => next(err))
  .catch((err) => next(err));
});

//update database and set global counts 
covidRouter.route('/update/daily')
.get((req,res,next) => {
 Request.get(whoURL, (error, response, body) => {
  csvtojson()
  .fromString(body)
  .then((jsonObj) => {
    var globalDataObj=[];

    //convert YYYY-MM-DD datetime in Unix-Timestamp
    for (var index = 0; index < jsonObj.length; index++) {
      const element = jsonObj[index];
      const mydate = parseInt(moment(element.Date_reported,'YYYY-MM-DD').unix());
      jsonObj[index].Date_reported = mydate;
    }

    //get all dates
    var lookup = {};
    var items = jsonObj;
    var result = [];

    for (var item, i = 0; item = items[i++];) {
      var currentDate = item.Date_reported;
      
      if (!(currentDate in lookup)) {
      lookup[currentDate] = 1;
      result.push(currentDate);
      }
    }
    
    //create global data
    for (var index = 0; index < result.length; index++) {
      var currentSelectedDate=result[index];
      var currentNewCases=0;
      var currentCumulativeCases=0;
      var currentNewDeaths=0;
      var currentCumulativeDeaths=0;
      const filteredJsonObj = jsonObj.filter((x)=>x.Date_reported === currentSelectedDate);

      for (var index2 = 0; index2 < filteredJsonObj.length; index2++) {
        const element = filteredJsonObj[index2];
        currentNewCases += parseInt(element.New_cases);
        currentCumulativeCases += parseInt(element.Cumulative_cases);
        currentNewDeaths += parseInt(element.New_deaths);
        currentCumulativeDeaths += parseInt(element.Cumulative_deaths);
      }
      globalDataObj.push({
        Date_reported: currentSelectedDate,
        Country_code: "",
        Country: "Global",
        WHO_region: "",
        New_cases: currentNewCases,
        Cumulative_cases: currentCumulativeCases,
        New_deaths: currentNewDeaths,
        Cumulative_deaths: currentCumulativeDeaths
      });
    }
    
    //create a collection for daily data
    Request({
      url : `${apiURL}/all`,
      method :"POST",
      headers : {
        "content-type": "application/json",
      },
      body: jsonObj,
      json: true
    },
    function (err, response, body) {
      console.log(err, body);
    });
    
    //add global data to collection
    Request({
      url : `${apiURL}/all`,
      method :"POST",
      headers : {
        "content-type": "application/json",
      },
      body: globalDataObj,
      json: true
    },
    function (err, response, body) {
      console.log(err, body);
    });
    res.statusCode = 200;
    res.end('Completed Update Database!');
  })
 })
});

module.exports = covidRouter;