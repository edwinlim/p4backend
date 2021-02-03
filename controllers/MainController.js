const { response } = require('express')
const { Sequelize } = require('../models/index')
const sequelize = require('../models/index')
const Request = require('../models/request')
const Tour = require("../models/tour")
const RequestModel = Request(sequelize.sequelize, sequelize.Sequelize.DataTypes)
const TourModel = Tour(sequelize.sequelize, sequelize.Sequelize.DataTypes)

const controllers = {
    start: (req, res) => {
        //to show DB is connected.

        RequestModel.findAll()
            .then(response => {


                return res.status(200).json(
                    {
                        success: true,
                        request: response

                    }

                )

            })


    },

    optimize: (req, res) => {

        // get all delivery requests where status is 'ready to pickup' and 'in wharehouse'. 
        RequestModel.findAll({
            where:

                Sequelize.or(
                    { status: 1 },
                    { status: 3 }
                )

        })
            .then(response => {
                console.log(response)
            })

        // get the latitude and longtitude of the delivery requests of these statuses


        // put them through clustering algorithm 


        // get output of clusters


        // insert into tour table



    },

    generateOtp: (req, res) => {

        // make a function which will generate n number of otp 
        // generate a 4 digit otp

        // then save it to database in tour_details table where request_id = req.body.jobId

        // TourModel.findAll({
        //     where:

        //         Sequelize.or(
        //             { request_id: req.body.jobId }
        //         )

        // })
        //     .then(response => {
        //         response.forEach(x => {
        //             console.log(x.tour_id)
        //         })
        //     })

    }

}

module.exports = controllers