document.querySelector(".find-location").addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const form = event.target;

        // Access the input field using form elements
        const element = form.querySelector('input[type="text"]');

        // Get the value of the input field
        const townName = element.value.trim();

        try {
            let response = await fetch('http://localhost:8080/postTownName', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ townName })                
            });

            let currentData = await response.json();
            let updatedData; //= await updateWeatherData(currentData, lat, lon);
            await renderData(currentData, updatedData)

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
                
                let currentData = await response.json();
                let updatedData = await updateWeatherData(currentData, lat, lon);
                await renderData(currentData, updatedData)

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

async function renderData(data, updatedData) {
    let weatherData; 

    if (updatedData == undefined) {
        weatherData = data.weatherData;
    }else { 
        weatherData = updatedData.weatherData;
    }
    
    const townName = data.townName;    
    const forecastContainer = document.querySelector('.forecast-container');
    
    const currentWeatherHTML = `
    <div class="today forecast">
        <div class="forecast-header">
            <div class="day">${weatherData[0].DayName}</div>
            <div class="date">${weatherData[0].DayNumber} ${weatherData[0].MonthName}</div>
        </div>
        <div class="forecast-content">
            <div class="location">${townName}</div>
            <div class="degree">
                <div class="num">${weatherData[0].Temp}<sup>o</sup>C</div>
                <div class="forecast-icon">
                    <img src="https://openweathermap.org/img/wn/${weatherData[0].WeatherIcon}@2x.png" alt="" width="140">
                </div>
            </div>
            <span><img src="images/icon-umberella.png" alt="">20%</span>
            <span><img src="images/icon-wind.png" alt="">${weatherData[0].WindSpeed} km/h</span>
            <span><img src="images/icon-compass.png" alt="">East</span>
        </div>
    </div>
`;
    
    const forecastHTML = weatherData.slice(1).map(data => {
        return `
        <div class="forecast">
            <div class="forecast-header">
                <div class="day">${data.DayName}</div>
            </div> 
            <div class="forecast-content">
                <div class="forecast-icon">
                    <img src="https://openweathermap.org/img/wn/${data.WeatherIcon}@2x.png" alt="" width="90">
                </div>
                <div class="degree">${data.Temp}<sup>o</sup>C</div>
                <small>${data.MinTemp}<sup>o</sup></small>
            </div>
        </div>
    `;
    }).join(''); 

    forecastContainer.innerHTML = currentWeatherHTML + forecastHTML;

}

async function updateWeatherData(data, lat, lon) {
    const updatedAt = data.weatherData[0].updatedAt;
    var updatedAtDate = new Date(updatedAt);

    const currentDate = new Date();

    const differenceInMs = currentDate - updatedAtDate;


    const oneHourInMs = 60 * 60 * 1000;

    if (differenceInMs >= oneHourInMs) {
        try {
               let response = await fetch('http://localhost:8080/updateWeatherInDatabase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                   body: JSON.stringify({ lat, lon })
            });

             return await response.json();

        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
   }

}
