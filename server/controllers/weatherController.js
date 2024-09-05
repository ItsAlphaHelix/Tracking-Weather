require('dotenv').config();
const { Op, where } = require('sequelize');
const { response } = require('express');
const db = require('../models');
const townWeatherInfo = require('../models/townWeatherInfo');

const Town = db.Town;
const TownWeatherInfo = db.TownWeatherInfo;
const apiKey = process.env.WeatherApiKey;

const postCoordinates = async (request, re) => {
    const { lat, lon } = request.body;

    let town = await Town.findOne({ where: { Lat: lat, Lon: lon } });

    if (town == null) {
        const reverseUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
        try {
            const response = await fetch(reverseUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const townName = data[0].name;
            console.log(data[0].name);

            const directUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${townName}&appid=${apiKey}`;

            try {
                const response = await fetch(directUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                
                town = await Town.create({ Name: townName, Lat: lat, Lon: lon });
                await fillDatabaseWithWeatherData(town);
                
                let weatherData = await getMyWeatherFromDatabase(lat, lon)
                return re.json(weatherData);
            } catch (error) {
                console.error('There has been a problem with your fetch operation:', error);
                return null; 
            }


        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
            return null; // Return null or handle the error as needed
        }
    }else {
        let weatherData = await getMyWeatherFromDatabase(lat, lon);
        return re.json(weatherData);
    }
};

async function getMyWeatherFromDatabase(lat, lon) {
    let town = await Town.findOne({ where: { Lat: lat, Lon: lon } });
    let currentDayWeather = await TownWeatherInfo.findAll({
        where: {
            TownId: town.id,
        }
    });

    const townName = town.Name;

    return {
        currentDayWeather,
        townName,
        townId: town.id
    };
}
const getTownCoordinatesByTownName = async (request, response) => {

    const { townName } = request.body;

    let town = await Town.findOne({ where: { name: townName } });

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

            town = await Town.create({ Name: name, Lat: lat, Lon: lon });
            await fillDatabaseWithWeatherData(town);

            return data; // Return the response data
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
            return null; // Return null or handle the error as needed
        }
    }
    else {
        //await updateCurrentWeatherInDatabase(town);
    }
}


const fetchWeatherData = async (lat, lon) => {
    const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

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

        return await response.json();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        throw error;
    }
};

const processWeatherData = async (data, townId) => {
    for (const item of data.list) {
        const { dt_txt, main, weather, wind } = item;

        await TownWeatherInfo.upsert({
            TownId: townId,
            Temp: main.temp,
            MaxTemp: main.temp_max,
            MinTemp: main.temp_min,
            WeatherIcon: weather[0].icon,
            WindSpeed: wind.speed,
            ForecastDate: dt_txt,
        });
    }
};

const fillDatabaseWithWeatherData = async (town) => {
    try {
        const data = await fetchWeatherData(town.Lat, town.Lon);
        await processWeatherData(data, town.id);
    } catch (error) {
        console.error('Error filling database with weather data:', error);
    }
};

const updateCurrentWeatherInDatabase = async (request, response) => {
    const { lat, lon, townId } = request.body;

    try {
        const data = await fetchWeatherData(lat, lon);
        const townWeatherInfo = await TownWeatherInfo.findAll({ where: { TownId: townId } });

        // Remove outdated entries
        for (const row of townWeatherInfo) {
            const dt_txt = data.list.find(item => item.dt_txt === row.ForecastDate);
            if (!dt_txt) {
                await row.destroy();
            }
        }

        await processWeatherData(data, townId);

        let weatherData = await getMyWeatherFromDatabase(lat, lon);
        return response.json(weatherData);
        
    } catch (error) {
        console.error('Error updating current weather in database:', error);
        response.status(500).send('Error updating weather data');
    }
};

// async function fillDatabaseWithWeatherDate(town) {

//     const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${town.Lat}&lon=${town.Lon}&units=metric&appid=${apiKey}`;

//     try {
//         const response = await fetch(url, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }

//         const data = await response.json();


//         for (const item of data.list) {
//             const { dt_txt, main, weather, wind } = item;

//             await TownWeatherInfo.create({
//                 TownId: town.id,
//                 Temp: main.temp,
//                 MaxTemp: main.temp_max,
//                 MinTemp: main.temp_min,
//                 WeatherIcon: weather[0].icon,
//                 WindSpeed: wind.speed,
//                 ForecastDate: dt_txt,
//             });
//         }
//     } catch (error) {
//         console.error('There has been a problem with your fetch operation:', error);
//     }
// }

// const updateCurrentWeatherInDatabase = async (request, response)  => {
//     const {lat, lon, townId } = request.body;

//     const townWeatherInfo = await TownWeatherInfo.findAll({where: {TownId: townId}})

//     const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

//     try {
//         const response = await fetch(url, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const data = await response.json();

//         const rowForDelete = await townWeatherInfo.find(x => x.TownId == townId);
//         const dt_txt = data.list.find(x => x.dt_txt == rowForDelete.ForeCastDate);
        
//         if (dt_txt == undefined){
//            await rowForDelete.destroy();
//         }
//         for (const item of data.list) {
//             const { dt_txt, main, weather, wind } = item;

//             await TownWeatherInfo.update({
//                 Temp: main.temp,
//                 MaxTemp: main.temp_max,
//                 MinTemp: main.temp_min,
//                 WeatherIcon: weather[0].icon,
//                 WindSpeed: wind.speed,
//                 ForecastDate: dt_txt, 
//             },
//             {
//                 where: { Hour: hour, Day: day, ForecastDate: dt_txt }
//             }
//         );
// }

//     } catch (error) {
//         console.error('There has been a problem with your fetch operation:', error);
//     }
// }


async function getData(lat, lon, townId) {

}

module.exports = {
    getTownCoordinatesByTownName,
    postCoordinates,
    updateCurrentWeatherInDatabase
}
