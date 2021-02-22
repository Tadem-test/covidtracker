const express = require('express');
const bodyParser = require('body-parser');
const covidRouter = express.Router();
const csvtojson = require('csvtojson');
var moment = require('moment');
const Coviddata = require('../models/coviddata');
const NodeCache = require('node-cache');
const Fetch = require('node-fetch');

const apiURL = 'http://localhost:5000/api/';
const whoURL = 'https://covid19.who.int/WHO-COVID-19-global-data.csv';

const covidCache = new NodeCache();

function getDateReportedUnix(jsonObj) {
  for (var index = 0; index < jsonObj.length; index++) {
    const element = jsonObj[index];
    const mydate = parseInt(moment(element.Date_reported, 'YYYY-MM-DD').unix());
    jsonObj[index].Date_reported = mydate;
  }
  return jsonObj;
}

function getLastData(arr, prop) {
  var max;
  for (var i = 0; i < arr.length; i++) {
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

function getList(data, value) {
  var lookup = {};
  var list = [];

  for (var item, i = 0; item = data[i++];) {
    var listItem = item[value];

    if (!(listItem in lookup) && listItem != "Global") {
      lookup[listItem] = 1;
      list.push(listItem);
    }
  }

  return list;
}

function getTableData(data, countryList) {
  const tableData = [];

  for (var index = 0; index < countryList.length; index++) {
    const country = countryList[index];

    const filterByCountry = data.filter((x) => x.Country === country);
    const countryData = getLastData(filterByCountry, "Date_reported");

    tableData.push({
      "Country": country,
      "Cases": countryData.Cumulative_cases
    });
  }

  return tableData;
}

function getGlobalData(jsonObj, dateList) {

  var globalDataObj = [];

  for (var index = 0; index < dateList.length; index++) {
    var currentSelectedDate = dateList[index];
    var currentNewCases = 0;
    var currentCumulativeCases = 0;
    var currentNewDeaths = 0;
    var currentCumulativeDeaths = 0;
    const filteredJsonObj = jsonObj.filter((x) => x.Date_reported === currentSelectedDate);

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
  return globalDataObj;
}

function postRequest(obj) {
  Fetch(`${apiURL}/update`, {
    method: 'post',
    body: JSON.stringify(obj),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.json())
    .then(json => console.log(json));
}

/**
 * @swagger
 * /{countryName}/all:
 *    get:
 *      summary: Get all COVID-19 data by Countryname
 *      description: Use to request all COVID-19 data
 *      responses:
 *        200:
 *          description: A successful response
 * 
 */
covidRouter.route('/:countryName/all')
  .get((req, res, next) => {
    Coviddata.find({ Country: req.params.countryName })
      .then((data) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(data);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

/**
 * @swagger
 * /{countryName}/today:
 *    get:
 *      summary: Get current COVID-19 data by Countryname
 *      description: Use to request current COVID-19 data
 *      responses:
 *        200:
 *          description: A successful response
 * 
 */
covidRouter.route('/:countryName/today')
  .get((req, res, next) => {
    Coviddata.find({ Country: req.params.countryName })
      .then((data) => {
        const lastData = getLastData(data, "Date_reported");
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(lastData);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

/**
 * @swagger
 * /{countryName}/stat:
 *    get:
 *      summary: Get all formated COVID-19 data by Countryname for Chart
 *      description: Use to request all formated COVID-19 data for Chart
 *      responses:
 *        200:
 *          description: A successful response
 * 
 */
covidRouter.route('/:countryName/stat')
  .get((req, res, next) => {
    Coviddata.find({ Country: req.params.countryName })
      .sort({ Date_reported: -1 })
      .limit(120)
      .then((data) => {
        const stat = getStatistikData(data);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(stat);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

/**
 * @swagger
 * /countryList:
 *    get:
 *      summary: Get a list of all countries
 *      description: Use to request a countrylist
 *      responses:
 *        200:
 *          description: A successful response
 * 
 */
covidRouter.route('/countryList')
  .get((req, res, next) => {
    if (covidCache.has("countryList") === false) {
      Coviddata.find({})
        .then((data) => {
          const countryList = getList(data, "Country");
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

/**
 * @swagger
 * /countryList/table:
 *    get:
 *      summary: Get a list of all countries with there current COVID-19 data
 *      description: Use to request a countrylist with current COVID-19 data
 *      responses:
 *        200:
 *          description: A successful response
 * 
 */
covidRouter.route('/countryList/table')
  .get((req, res, next) => {
    if (covidCache.has("countryTable") === false) {
      Coviddata.find({})
        .then((data) => {
          const tabelData = getTableData(data, getList(data, "Country"));
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

/**
 * @swagger
 * /update:
 *    get:
 *      summary: update the database with the COVID-19 data from WHO
 *      description: Use to get data from WHO
 *      responses:
 *        200:
 *          description: A successful response
 * 
 */
covidRouter.route('/update')
  .get((req, res, next) => {
    Coviddata.deleteMany()
      .then((data) => {
        Fetch(whoURL)
          .then(res => res.text())
          .then(body => {
            csvtojson()
              .fromString(body)
              .then((jsonObj) => {
                var jsonObjUnix = getDateReportedUnix(jsonObj);
                postRequest(jsonObjUnix);

                var dateList = getList(jsonObjUnix, "Date_reported");
                var globalData = getGlobalData(jsonObjUnix, dateList);
                postRequest(globalData);

                res.statusCode = 200;
                res.end('Completed Update Database!');
              })
          })
      })
  })
  /**
 * @swagger
 * /update:
 *    post:
 *      summary: save COVID-19 data in the database
 *      description: Use to save data in the database
 *      responses:
 *        200:
 *          description: A successful response
 * 
 */
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

module.exports = covidRouter;