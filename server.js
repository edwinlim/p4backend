require('dotenv').config()
const express = require('express')
const mainController = require('./controllers/MainController')
const app = express()
const bodyParser = require('body-parser')
const port = process.env.PORT || 5000;

app.use(express.urlencoded({
    extended: true
}))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json())

app.get("/", mainController.start)
app.post("/api/v1/newrequest", mainController.newRequestDelivery)

app.post("/driver", mainController.generateOtp)


app.listen(port, () => {
    console.log(`Octopush API listening on port: ${port}`)
})

app.get("/optimize", mainController.optimize)