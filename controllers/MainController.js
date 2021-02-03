// npm modules
const { response } = require('express')

// importing the sequilize middleware
const { Sequelize } = require('../models/index')
const sequelize = require('../models/index')

// models
const Request = require('../models/request')
const RequestModel = Request(sequelize.sequelize, sequelize.Sequelize.DataTypes)
const Tour = require("../models/tour")
const TourModel = Tour(sequelize.sequelize, sequelize.Sequelize.DataTypes)
const Driver = require("../models/driver")
const DriverModel = Driver(sequelize.sequelize, sequelize.Sequelize.DataTypes)

// common functions
const utility = require("../helper/utility");

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

    newRequestDelivery: (req, res) => {
        const formInputs = req.body.requestForm

        // Validate receiver information
        if (!formInputs.receiverEmail || !formInputs.receiverPostcode) {
            res.status(400).send({
                message: "Receiver information cannot be empty"
            })
            return
        }

        // Generate Random 4 digits number
        const pickupCode = utility.generateOtp()

        // Create delivery data
        const requestDelivery = {
            sender_id: 1,
            receiver_name: formInputs.receiverName,
            receiver_block_num: formInputs.receiverHouseNumber,
            receiver_road_name: formInputs.receiverAddress,
            receiver_floor: formInputs.receiverFloor,
            receiver_unit_number: formInputs.receiverUnit,
            receiver_poscode: formInputs.receiverPostcode,
            receiver_country: formInputs.receiverCountry,
            receiver_contact: formInputs.receiverContact,
            receiver_email: formInputs.receiverEmail,
            receiver_lat: formInputs.receiverLat,
            receiver_long: formInputs.receiverLng,
            item_description: formInputs.itemDesc,
            item_qty: formInputs.itemQty,
            special_instructions: formInputs.instructions,
            pickup_code: pickupCode,
            status: '1',
        }

        // Save data in the database
        RequestModel.create(requestDelivery)
            .then(data => {
                res.send(data)
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred where creating Request Delivery"
                })
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
        //Validations
        let params = req.body
        if (!params) {
            res.send(({
                status: 0,
                message: "No Params found"
            }))
        }
        if (!params.jobId) {
            res.send(({
                status: 0,
                message: "No JOB ID found in Params"
            }))
        }

        TourModel.findOne({
            where:
                Sequelize.or(
                    { request_id: params.jobId }
                )

        })
            .then(response => {
                // validation to check whether the job id is valid or not
                if (!response) {
                    res.send(({
                        status: 0,
                        message: "No JOB ID found in DB"
                    }))
                }
                const deliveryCode = utility.generateOtp()
                console.log(deliveryCode)
                //if job.Id is found in DB then below code will run if not, the above "if" code will run
                // save the otp in db on the record request_id = req.body.jobId
                response.update({
                    dropoff_code: deliveryCode
                }).then(() => {
                    let dataToSend = {
                        status: 1,
                        message: "OTP Generated and Send to Customer"
                    }
                    //if the OTP is a normal OTP(you don't have to show it on the client end)
                    if (params.showOTP) {
                        dataToSend['otp'] = deliveryCode
                    }
                    //if we need to see the OTP on driver end, we pass a param showOTP: true
                    res.send(dataToSend)
                })
                    .catch((err) => {
                        res.send(({
                            status: 0,
                            message: err
                        }))
                    })


            })

    },

    validateOtp: (req, res) => {
        //Validations
        let params = req.body
        if (!params) {
            res.send(({
                status: 0,
                message: "No Params found"
            }))
        }
        if (!params.jobId) {
            res.send(({
                status: 0,
                message: "No JOB ID found in Params"
            }))
        }
        if (!params.otp) {
            res.send(({
                status: 0,
                message: "No OTP found in Params"
            }))
        }

        TourModel.findOne({
            where:
                Sequelize.and(
                    { request_id: params.jobId },
                    { dropoff_code: params.otp }
                )

        })
            .then(response => {
                // validation to check whether the job id is valid or not
                if (!response) {
                    res.send(({
                        status: 0,
                        message: "OTP Not Valid"
                    }))
                } else {
                    /// Pending: write here the code to mark the job as completed
                    res.send(({
                        status: 1,
                        message: "OTP is Valid"
                    }))
                }


            })

    },

    availability: (req, res) => {
        //Validations
        let params = req.body
        if (!params) {
            res.send(({
                status: 0,
                message: "No Params found"
            }))
        }
        if (!params.driverID) {
            res.send(({
                status: 0,
                message: "No Driver ID found in Params"
            }))
        }

        if (params.availability === undefined || params.availability === null) {
            res.send(({
                status: 0,
                message: "Availability Required in Params"
            }))
        }

        DriverModel.findOne({
            where:
                Sequelize.or(
                    { user_id: params.driverID }
                )

        })
            .then(response => {
                // validation to check whether the job id is valid or not
                if (!response) {
                    res.send(({
                        status: 0,
                        message: "No Driver found in DB"
                    }))
                }
                response.update({
                    availability: params.availability ? 1 : 0
                }).then(() => {
                    let dataToSend = {
                        status: 1,
                        message: "Driver Marked As " + params.availability
                    }
                    res.send(dataToSend)
                })
                    .catch((err) => {
                        res.send(({
                            status: 0,
                            message: err
                        }))
                    })


            })

    }

}

module.exports = controllers