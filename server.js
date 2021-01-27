const express = require('express')
const app = express()
const port = process.env.PORT || 5000;

app.use(express.urlencoded({
    extended: true
}))

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Express Sequalizer application." });
  });


app.listen(process.env.PORT || port, () => {
    console.log(`Octopush API listening on port: ${port}`)
})