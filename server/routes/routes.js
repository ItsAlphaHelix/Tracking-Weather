// import controllers review, products
const weatherController = require('../controllers/WeatherController.js')


// router
const router = require('express').Router()

router.post('/getTownCoordinatesByTownName', weatherController.getTownCoordinatesByTownName);

module.exports = router