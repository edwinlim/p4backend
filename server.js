require('dotenv').config();
const express = require('express');
const cors = require('cors')
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

// user registration
app.post('/api/v1/user/login', usersController.login)
app.post('/api/v1/user/register', usersController.register)

app.get("/", mainController.start)
app.post("/api/v1/newrequest", mainController.newRequestDelivery)
app.get("/optimize", mainController.optimize)


app.listen(port, () => {
    console.log(`Octopush API listening on port: ${port}`)
})

