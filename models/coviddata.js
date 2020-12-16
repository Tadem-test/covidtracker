const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CovidSchema = new Schema({
  Date_reported: {
    type: String,
    required: true
  },
  Country_code: {
    type: String
  },
  Country: {
    type: String,
    required: true
  },
  WHO_region: {
    type: String
  },
  New_cases: {
    type: Number
  },
  Cumulative_cases: {
    type: Number
  },
  New_deaths: {
    type: Number
  },
  Cumulative_deaths: {
    type: Number
  }
});

const Coviddata = mongoose.model('coviddata', CovidSchema);

module.exports = Coviddata;