require('dotenv').config();
const db = require('../models')

const Town = db.Town;
const apiKey = process.env.WeatherApiKey;

const getTownCoordinatesByTownName = async (request, response) => { 
    const { townName } = request.body;
    const town = await Town.findOne({ where: { name: townName } });

    if (town == null) {

    //encodeURIComponent
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${townName}&appid=${apiKey}`;
    

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        const { name, lat, lon } = data[0];

        getCurrentWeather(lat, lon);
        await Town.create({ Name: name, Lat: lat, Lon: lon});

        return data; // Return the response data
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        return null; // Return null or handle the error as needed
    }
}
else {
        getCurrentWeather(town.Lat, town.Lon);
}
}

async function getCurrentWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

        await fetch(url, {
            method: 'GET', // This is the default method, but it's good practice to include it
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
}

module.exports = {
    getTownCoordinatesByTownName
}
