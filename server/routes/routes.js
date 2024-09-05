// import controllers review, products
const weatherController = require('../controllers/weatherController.js')


// router
const router = require('express').Router()

router.post('/getTownCoordinatesByTownName', weatherController.getTownCoordinatesByTownName);
router.post('/postCoordinates', weatherController.postCoordinates);
router.post('/updateCurrentWeatherInDatabase', weatherController.updateCurrentWeatherInDatabase);
module.exports = router