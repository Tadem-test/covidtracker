const express = require ('express');
const bodyParser = require('body-parser');
const covidRouter = express.Router();
const Request = require('request');
const csvtojson = require('csvtojson');
var moment = require('moment');
const Coviddata = require('../models/coviddata');
const Countrydata = require('../models/countrydata');
const { request } = require('express');

const apiURL = 'http://localhost:5000/api/';
const whoURL = 'https://covid19.who.int/WHO-COVID-19-global-data.csv';

//all data
covidRouter.route('/')
.get((req,res,next) => {
  Coviddata.find({})
  .then((coviddata) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(coviddata);
  }, (err) => next(err))
  .catch((err) => next(err));
})
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

//country list
covidRouter.route('/country')
.get((req,res,next) => {
  Countrydata.find({})
  .then((country) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(country);
  }, (err) => next(err))
  .catch((err) => next(err));
});

//live data from a country
covidRouter.route('/:countryName/today')
.get((req,res,next) => {
  Coviddata.find({ Country: req.params.countryName}).sort({Date_reported: -1}).limit(1)
  .then((coviddata) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(coviddata);
  }, (err) => next(err))
  .catch((err) => next(err));
});

//all data from a country
covidRouter.route('/:countryName')
.get((req,res,next) => {
  Coviddata.find({Country: req.params.countryName})
  .then((coviddata) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(coviddata);
  }, (err) => next(err))
  .catch((err) => next(err));
});

//update country list in database
covidRouter.route('/update/country')
.get((req,res,next) => {
 Request.get(whoURL, (error, response, body) => {
  csvtojson()
  .fromString(body)
  .then((jsonObj) => {
    
    var lookup = {};
    var items = jsonObj;
    var result = [];

    for (var item, i = 0; item = items[i++];) {
      var name = item.Country;
      
      if (!(name in lookup)) {
      lookup[name] = 1;
      result.push({ Country: name});
      }
    }
    result.push({Country: "Global"});

    Request({
      url : `${apiURL}/update/country`,
      method :"POST",
      headers : {
        "content-type": "application/json",
      },
      body: result,
      json: true
    },
    function (err, response, body) {
      console.log(err, body);
    });
    res.statusCode = 200;
    res.end('Completed Update Country Data!');
  })
 })
})
.post((req, res, next) => {
  Countrydata.insertMany(req.body)
  .then((country) => {
      console.log('Countrydata Created ', country);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(country);
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
      url : apiURL,
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
      url : apiURL,
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