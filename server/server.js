const express = require('express')
const cors = require('cors')

var corsOptions = { 
    origin: 'http://127.0.0.1:5501/'
}

const app = express()


// middleware
app.use(cors());

app.use(express.json())

app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => {
    res.json({message: 'hello velikolepni'})
});
// routers

// app.get('/getAll', (request, response) => {
//     console.log("hohoho")
// })

const router = require('./routes/routes.js')
app.use(router)


//port

const PORT = process.env.PORT || 8080

//server

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})