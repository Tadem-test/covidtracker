const express = require ('express');
const router = express.Router();
const Covid = require('../models/covid');

router.get('/covid', (req, res, next) => {

  Covid.find({}, 'action')
    .then(data => res.json(data))
    .catch(next)
});

router.post('/covid', (req, res, next) => {
  if(req.body.action){
    Covid.create(req.body)
      .then(data => res.json(data))
      .catch(next)
  }else {
    res.json({
      error: "The input field is empty"
    })
  }
});

router.delete('/covid/:id', (req, res, next) => {
  Covid.findOneAndDelete({"_id": req.params.id})
    .then(data => res.json(data))
    .catch(next)
})

module.exports = router;