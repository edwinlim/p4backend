
require('dotenv').config();
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')
const mainController = require('./controllers/MainController');
const usersController = require('./controllers/UserController')
const app = express();

const port = process.env.PORT || 5000;

app.use(express.urlencoded({
    extended: true
}))

app.use(cors({
    origin: '*'
}))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json())

app.get("/optimize", mainController.optimize)

app.get("/", mainController.start)
// user registration
app.post('/api/v1/users/register', usersController.register)

app.post("/api/v1/newrequest", mainController.newRequestDelivery)

app.post("/api/v1/otpGenerator", mainController.generateOtp)

app.post("/api/v1/otpValidtor", mainController.validateOtp)

app.post("/api/v1/availability", mainController.availability)

app.get("/optimize", mainController.optimize)

app.post("/api/v1/getClusterName", mainController.getClusterName)

app.post("/api/v1/getBlockName", mainController.getBlockName)

app.post("/api/v1/getJobBasedOnBlock", mainController.getJobBasedOnBlock)

app.listen(port, () => {
    console.log(`Octopush API listening on port: ${port}`)
})

