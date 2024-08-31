document.querySelector(".find-location").addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            console.log("Latitude: " + lat + ", Longitude: " + lon);
        }, function (error) {
            console.error("Error occurred. Error code: " + error.code);
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }

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

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json()
            return data; // Return the response data
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
            return null; // Return null or handle the error as needed
        }
});

document.addEventListener('DOMContentLoaded', function() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            console.log("Latitude: " + lat + ", Longitude: " + lon);
        }, function (error) {
            console.error("Error occurred. Error code: " + error.code);
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
});
