require('dotenv').config()
const express = require('express')
const mainController = require('./controllers/MainController')
const app = express()
const port = process.env.PORT || 5000;

app.use(express.urlencoded({
    extended: true
}))

app.get("/", mainController.start)
app.post("/api/v1/newrequest", mainController.newRequestDelivery)


app.listen(port, () => {
    console.log(`Octopush API listening on port: ${port}`)
})

app.get("/optimize", mainController.optimize)