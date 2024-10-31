require('dotenv').config();
const { Op, where } = require('sequelize');
const { response } = require('express');
const db = require('../models');

const Town = db.Town;
const TownWeatherInfo = db.TownWeatherInfo;
const weatherKey = process.env.WeatherApiKey;

//router function
const getWeatherData = async (request, re) => {
    let ipinfoData = await getIpinfoData();
    const { city } = ipinfoData;

    let town = await Town.findOne({ where: { Name: city } });

    if (town) {
        town = await getTownByCoordinates(town.Lat, town.Lon);
    }

    if (town == null) {
        const directUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${weatherKey}`;

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
            const { name, lat, lon } = data[0];

            town = await Town.create({ Name: name, Lat: lat, Lon: lon });
            await fillDatabaseWithWeatherData(town);

            let weatherData = await getWeatherFromDatabase(town)
            return re.json(weatherData);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
            return null;
        }
     }else {
        
        let weatherData = await getWeatherFromDatabase(town);
        return re.json(weatherData);
    }
};


//router function
const postTownName = async (request, re) => {
    const { townName } = request.body;

    if (townName === '') {
        return re.status(400).json({ error: 'The location you chose cannot be empty.' });
    }
    
    let town = await Town.findOne({ where: { name: townName } });
    
    if (town) {
        town = await getTownByCoordinates(town.Lat, town.Lon);
    }
    
    if (town == null) {

        //encodeURIComponent
        const url = `http://api.openweathermap.org/geo/1.0/direct?q=${townName}&appid=${weatherKey}`;

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

            if (!data.length) {
                return re.status(404).json({ error: 'No location found with the provided name.' });
            }

            const location = data[0].local_names.bg;
            const { lat, lon } = data[0];

            town = await Town.create({ Name: location, Lat: lat, Lon: lon });
            await fillDatabaseWithWeatherData(town);
            let weatherData = await getWeatherFromDatabase(town)
            return re.json(weatherData);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }
    else {
        let weatherData = await getWeatherFromDatabase(town);
        return re.json(weatherData);
    }
}


//router function
const updateWeatherInDatabase = async (request, response) => {
    const { lat, lon } = request.body;
    const town = await getTownByCoordinates(lat, lon)
    try {
        const currentWeatherData = await fetchCurrentWeatherData(lat, lon);
        const weeklyWeatherData = await fetchWeeklyWeatherData(lat, lon);
        await processWeatherUpdateData(weeklyWeatherData, currentWeatherData, town.id);
        let weatherData = await getWeatherFromDatabase (town);
        return response.json(weatherData);

    } catch (error) {
        console.error('Error updating current weather in database:', error);
    }
};

//helper function
async function getTownByCoordinates(lat, lon) {
    return await Town.findOne({ where: { Lat: lat, Lon: lon } });
}

//helper function
async function getWeatherFromDatabase(town) {

    let weatherData = await TownWeatherInfo.findAll({
        where: {
            TownId: town.id,
        }
    });

    const townName = town.Name;
    const lat = town.Lat;
    const lon = town.Lon;

    return { weatherData, townName, lat, lon };
}

//helper function
const fetchCurrentWeatherData = async (lat, lon) => {
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=bg&appid=${weatherKey}`;

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

//helper function
const fetchWeeklyWeatherData = async (lat, lon) => {
    const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${weatherKey}`;

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
//helper function
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//helper function
const processWeatherInsertData = async (weeklyWeatherData, currentWeatherData, townId) => {
    let currentWeatherDate = new Date();
    let dayName = currentWeatherDate.toLocaleDateString('bg-BG', { weekday: 'long' });
    dayName = capitalizeFirstLetter(dayName);
    let monthName = currentWeatherDate.toLocaleDateString('bg-BG', { month: 'long' });
    monthName = capitalizeFirstLetter(monthName);
    const dayNumber = currentWeatherDate.getDate();
    
    await TownWeatherInfo.create({
                TownId: townId,
                Temp: Math.round(currentWeatherData.main.temp),
                MinTemp: Math.round(currentWeatherData.main.temp_min),
                WeatherIcon: currentWeatherData.weather[0].icon,
                WindSpeed: currentWeatherData.wind.speed,
                DayName: dayName,
                MonthName: monthName,
                DayNumber: dayNumber,
            });
    
    const objects = getWeeklyObjectsByHighestAndLowestTemp(weeklyWeatherData);
      

    for (const object of objects) {
            const { dt_txt, main, weather } = object;
            currentWeatherDate = new Date(dt_txt);
            dayName = currentWeatherDate.toLocaleDateString('bg-BG', { weekday: 'long' });
            
            await TownWeatherInfo.create({
                TownId: townId,
                Temp: Math.round(main.temp),
                MinTemp: Math.round(object.lowest_temp_min),
                WeatherIcon: weather[0].icon,
                DayName: capitalizeFirstLetter(dayName),
                Humidity: main.humidity
            },
            );
        }
};

//helper function
const processWeatherUpdateData = async (weeklyWeatherData, currentWeatherData, townId) => {
    let currentWeatherDate = new Date();
    let dayName = currentWeatherDate.toLocaleDateString('bg-BG', { weekday: 'long' });
    dayName = capitalizeFirstLetter(dayName);
    let monthName = currentWeatherDate.toLocaleDateString('bg-BG', { month: 'long' });
    monthName = capitalizeFirstLetter(monthName);
    const dayNumber = currentWeatherDate.getDate();

    await TownWeatherInfo.update({
        Temp: Math.round(currentWeatherData.main.temp),
        MinTemp: Math.round(currentWeatherData.main.temp_min),
        WeatherIcon: currentWeatherData.weather[0].icon,
        WindSpeed: currentWeatherData.wind.speed,
        DayName: dayName,
        MonthName: monthName,
        DayNumber: dayNumber,
    },
    {
        where: {
            TownId: townId,
        },
        limit: 1
    }
);
    weeklyWeatherData = getWeeklyObjectsByHighestAndLowestTemp(weeklyWeatherData);
    let townWeatherInfo = await TownWeatherInfo.findOne({where: { TownId: townId }});
    let id = townWeatherInfo.id;
    for (const object of weeklyWeatherData) {
        const { dt_txt, main, weather } = object;
        currentWeatherDate = new Date(dt_txt);
        dayName = currentWeatherDate.toLocaleDateString('bg-BG', { weekday: 'long' });
        const capitalizedDayName = capitalizeFirstLetter(dayName);
        id++;
        await TownWeatherInfo.update({
            Temp: Math.round(main.temp),
            MinTemp: Math.round(object.lowest_temp_min),
            WeatherIcon: weather[0].icon,
            DayName: capitalizedDayName,
            Humidity: main.humidity
        },
        {
            where: {
                id,
                TownId: townId,
            }
        }
        );
    }
};

//helper function
const fillDatabaseWithWeatherData = async (town) => {
    try {
        const currentWeatherData = await fetchCurrentWeatherData(town.Lat, town.Lon);
        const weeklyWeatherData = await fetchWeeklyWeatherData(town.Lat, town.Lon);
        await processWeatherInsertData(weeklyWeatherData, currentWeatherData, town.id);
    } catch (error) {
        console.error('Error filling database with weather data:', error);
    }
};

//helper function
function getWeeklyObjectsByHighestAndLowestTemp(weeklyWeatherData) {

    let currentIsoDate = new Date().toISOString().split('T')[0];
    let weeklyWeather = weeklyWeatherData.list.filter(x => !x.dt_txt.includes(currentIsoDate));

    const groupedByDate = weeklyWeather.reduce((acc, curr) => {
        const dateOnly = curr.dt_txt.split(' ')[0];
        if (!acc[dateOnly]) {
            acc[dateOnly] = [];
        }
        acc[dateOnly].push(curr);
        return acc;
    }, {});

    const highestTempByDate = Object.keys(groupedByDate).map(date => {
        const dayData = groupedByDate[date];
        const highestTempObj = dayData.reduce((maxTempObj, currentObj) => {
            return currentObj.main.temp > maxTempObj.main.temp ? currentObj : maxTempObj;
        });

        const lowestTempMin = Math.min(...dayData.map(item => item.main.temp_min));
        return { ...highestTempObj, lowest_temp_min: lowestTempMin, date };
    });
    return highestTempByDate;
}

//helper function
const getIpinfoData = async () => {
    try {
        const response = await fetch('http://localhost:8080/ip-info');
        const data = await response.json();
        return data
    } catch (error) {
        console.error('Error fetching IP data:', error);
    }
};

module.exports = {
    postTownName,
    getWeatherData,
    updateWeatherInDatabase
}
 