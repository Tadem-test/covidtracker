const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CountrySchema = new Schema({
  Country: {
    type: String,
    required: true
  }
});

const Countrydata = mongoose.model('countrydata', CountrySchema);

module.exports = Countrydata;