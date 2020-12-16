const express = require ('express');
const bodyParser = require('body-parser');
const covidRouter = express.Router();
const Request = require('request');
const csvtojson = require('csvtojson');
const Coviddata = require('../models/coviddata');
const { request } = require('express');

const url = 'http://localhost:5000/api/';

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
})
.put((req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /api');
})
.delete((req, res, next) => {
  res.statusCode = 403;
  res.end('DELETE operation not supported on /api');    
});

covidRouter.route('/update/global')
.get((req,res,next) => {
 Request.get("https://covid19.who.int/WHO-COVID-19-global-data.csv", (error, response, body) => {
  csvtojson()
  .fromString(body)
  .then((jsonObj) => {
    //zusammen führen aller Daten aus jedem Land pro Tag
    //Kann selbe Schema wie countrys genutz werden. Nur Name Global, WHO_region leer und Country_code leer
    Request({
      url : url,
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
    res.statusCode = 200;
    res.end('Completed Update Global Data');
  })
 })
});

covidRouter.route('/update/daily')
.get((req,res,next) => {
 //Request.get("https://covid19.mathdro.id/api/daily", (error, response, body) => {
   //ansprechen und ausgeben aller elemente
   /*const requestDoc = JSON.parse(body);
   for (let index = 0; index < requestDoc.length; index++) {
     const element = requestDoc[index];
     console.log('Element ', index);
     console.log(' ',element);
   }*/
   //ausgeben nur ein bestimmtes element
   /*const requestDoc = JSON.parse(body);
   console.log('10',requestDoc[10]);*/
   //filtern eines objects
   /*const requestDoc = JSON.parse(body);
   const mydoc = requestDoc.filter(function(item){
    return item.reportDate == "2020-12-15";
   });
   console.log(mydoc);*/
 //})
 //convert csv to json
 Request.get("https://covid19.who.int/WHO-COVID-19-global-data.csv", (error, response, body) => {
  csvtojson()
  .fromString(body)
  .then((jsonObj) => {
    /*const filtered = jsonObj.filter(function(item){
      return item.Country == "Germany";
    });*/
    /*const filtered2 =filtered.filter(function(item){
      return item.Date_reported == '2020-04-05';
    })*/
    //kürzere schreibweise
    //const filtered = jsonObj.filter((x)=>x.Country == "Germany");
    //letzten eintrag
    //console.log(filtered[filtered.length-1]);
    Request({
      url : url,
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
    res.statusCode = 200;
    res.end('Completed Update Daily Data');
  })
 })
});

covidRouter.route('/update/country')
.get((req,res,next) => {
 Request.get("https://covid19.who.int/WHO-COVID-19-global-data.csv", (error, response, body) => {
  csvtojson()
  .fromString(body)
  .then((jsonObj) => {
    Request({
      url : url,
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
    res.statusCode = 200;
    res.end('Completed Update Country Data!');
  })
 })
});

module.exports = covidRouter;