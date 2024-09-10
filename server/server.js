const express = require('express');
const cors = require('cors');
//const MyHub = require('./myHub.js');
var corsOptions = { 
    origin: 'http://127.0.0.1:5501/'
}

const app = express()

// middleware
app.use(cors());

app.use(express.json())

app.use(express.urlencoded({ extended: true }))


app.get('/ip-info', async (req, res) => {
    try {
        const response = await fetch(`https://ipinfo.io/json?token=${process.env.IpinfoKey}`);
        const data = await response.json();
        res.json(data); // Send the data back to the client
    } catch (error) {
        res.status(500).json({ error: 'Error fetching IP data' });
    }
});

// routers

const router = require('./routes/routes.js')
app.use(router)

//port

const PORT = process.env.PORT || 8080

//server

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})