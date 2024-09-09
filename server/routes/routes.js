// import controllers review, products
const weatherController = require('../controllers/weatherController.js')


// router
const router = require('express').Router()

router.post('/postTownName', weatherController.postTownName);
router.post('/postCoordinates', weatherController.postCoordinates);
router.post('/updateWeatherInDatabase', weatherController.updateWeatherInDatabase);
module.exports = router