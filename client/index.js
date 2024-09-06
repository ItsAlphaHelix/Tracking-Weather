document.querySelector(".find-location").addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const form = event.target;

        // Access the input field using form elements
        const element = form.querySelector('input[type="text"]');

        // Get the value of the input field
        const townName = element.value.trim();

        try {
            await fetch('http://localhost:8080/getTownCoordinatesByTownName', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ townName })
            });
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
            return null; // Return null or handle the error as needed
        }
});

document.addEventListener('DOMContentLoaded', function() {
    if ("geolocation" in navigator) {
       navigator.geolocation.getCurrentPosition(async function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;

            
            try {
                let response = await fetch('http://localhost:8080/postCoordinates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ lat, lon })
                });
                
                let data = await response.json();
                
                 var updatedData = await updateWeatherData(data, lat, lon);
                 let obj = { updatedData, data};
                 await renderCurrentDayWeather(obj);

            } catch (error) {
                console.error('There has been a problem with your fetch operation:', error);
            }

        }, function (error) {
            console.error("Error occurred. Error code: " + error.code);
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
});

async function renderCurrentDayWeather(obj) {
    let result;
   if (obj.updatedData == undefined) {
       result = await getWeather(obj.data);
   }else { 
       result = await getWeather(obj.updatedData);
   }

    const forecastElement = document.querySelector('.today'); // Or the appropriate selector for your container

    forecastElement.innerHTML = `
    <div class="today forecast">
        <div class="forecast-header">
                            <div class="day">${result.NameOfDay}</div>
                            <div class="date">${result.Day} ${result.NameOfMonth}</div>
                        </div>
                        <div class="forecast-content">
                            <div class="location">${result.TownName}</div>
                            <div class="degree">
                                <div class="num">${parseFloat(result.Temp).toFixed(0)}<sup>o</sup>C</div>
                                <div class="forecast-icon"> 
                                    <img src="https://openweathermap.org/img/wn/${result.WeatherIcon}@2x.png" alt="" width=140 >
                                </div>
                            </div>
                            <span><img src="images/icon-umberella.png" alt="">20%</span>
                            <span><img src="images/icon-wind.png" alt="">${result.WindSpeed}km/h</span>
                            <span><img src="images/icon-compass.png" alt="">East</span>
                        </div>
`;

}
async function getWeather(data) { 
     let myWeather = {};
    // let records;
    // let townName;
    // if (!data.currentDayWeather) {
    //     records = data.updatedData;
    //     townName = data.townName;
    // }else {
    //     records = data.currentDayWeather;
    //     townName = data.TownName;
    // }

    const currentHour = new Date().getHours();

    for (let i = 0; i < data.currentDayWeather.length; i++) {
        let weather = data.currentDayWeather[i];
        const forecastDate = new Date(weather.ForecastDate);
        const currentDayWeatherHour = forecastDate.getHours();
        const nameOfDay = forecastDate.toLocaleDateString('bg-BG', { weekday: 'long' }); //en-US
        const nameOfMonth = forecastDate.toLocaleDateString('bg-BG', { month: 'long' });
        const day = forecastDate.getDate();

        if (currentDayWeatherHour > currentHour - 3) {
            myWeather.Temp = weather.Temp;
            myWeather.MaxTemp = weather.MaxTemp;
            myWeather.MinTemp = weather.MinTemp;
            myWeather.WeatherIcon = weather.WeatherIcon;
            myWeather.WindSpeed = weather.WindSpeed;
            myWeather.NameOfDay = nameOfDay;
            myWeather.NameOfMonth = nameOfMonth;
            myWeather.Day = day;
            myWeather.TownName = data.townName
            break;
        }
    }
    return myWeather;
}

async function updateWeatherData(data, lat, lon) {
    const updatedAt = data.currentDayWeather[0].updatedAt;
    var updatedAtDate = new Date(updatedAt);

    const currentDate = new Date();

    const differenceInMs = currentDate - updatedAtDate;


    const oneHourInMs = 60 * 60 * 1000;

    if (differenceInMs >= oneHourInMs) {
        try {
               let response = await fetch('http://localhost:8080/updateCurrentWeatherInDatabase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lat, lon, townId: data.townId })
            });

             return await response.json();

        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
   }

}
