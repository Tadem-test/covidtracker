const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CovidSchema = new Schema({
  action: {
    type: String,
    required: [true, 'The covid text field is required']
  }
})

const Covid = mongoose.model('covid', CovidSchema);

module.exports = Covid;