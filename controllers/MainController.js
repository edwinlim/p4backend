
// npm modules
const _ = require("lodash")
const kmeans = require('node-kmeans')
const { response } = require('express')

// importing the sequilize middleware
const { Sequelize } = require('../models/index')
const sequelize = require('../models/index')

// models
const Request = require('../models/request')
const RequestModel = Request(sequelize.sequelize, sequelize.Sequelize.DataTypes)
const User = require('../models/user')
const UserModel = User(sequelize.sequelize, sequelize.Sequelize.DataTypes)
const Tour = require("../models/tour")
const TourModel = Tour(sequelize.sequelize, sequelize.Sequelize.DataTypes)
const Driver = require("../models/driver")
const DriverModel = Driver(sequelize.sequelize, sequelize.Sequelize.DataTypes)

UserModel.hasMany(RequestModel, {
    foreignKey: 'sender_id',
})

RequestModel.belongsTo(UserModel, {
    foreignKey: 'id',
})

UserModel.hasMany(DriverModel, {
    foreignKey: 'user_id',
})
DriverModel.belongsTo(UserModel, {
    foreignKey: 'id',
})

// common functions
const utility = require("../helper/utility");
const { times } = require("lodash")

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
        // const pickupCode = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
        const pickupCode = utility.generateOtp()
        console.log(pickupCode)

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
                res.status(200).send(data)
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred where creating Request Delivery"
                })
            })
    },


    optimize: (req, res) => {
        let data = []

        // get all delivery requests where status is 'ready to pickup' and 'in wharehouse'. 
        UserModel.findAll({
            // where: {id: 1}
            include: { model: RequestModel }
        }).then(async response => {
            res.send(response)


            response.map(user => {
                user.Requests.map(request => {
                    if (request.status == "1") {
                        console.log("Status 1")
                        data.push({
                            senderId: request.sender_id,
                            requestId: request.id,
                            lat: user.user_lat,
                            long: user.user_long,
                            requestType: "Pickup",
                            dropoffCode: request.pickup_code
                        })
                    } else if (request.status == "3") {
                        console.log("Status 3")
                        data.push({
                            senderId: request.sender_id,
                            requestId: request.id,
                            lat: request.receiver_lat,
                            long: request.receiver_long,
                            requestType: "Delivery",
                            dropoffCode: request.pickup_code
                        })
                    }
                })
            })


            //vectors is a list of lat/long
            let vectors = new Array();

            for (let i = 0; i < data.length; i++) {
                vectors[i] = [data[i]['lat'], data[i]['long']];
            }

            // Count available drivers assign to K
            const drivers = await DriverModel.findAll({
                where: {
                    availability: '1'
                }
            })

            const result = await kmeans.clusterize(vectors, { k: drivers.length }, (err, result) => {
                if (err) console.error(err);
                else //console.log('%o', result);
                    return result
            });

            for (i = 0; i < result.groups.length; i++) {
                //write another forloop to get the clusterInd indexes. 
                for (j = 0; j < result.groups[i].clusterInd.length; j++) {
                    //check if request ID already exist in tour_table
                    await TourModel.findOne({
                        where: {
                            request_id: data[result.groups[i].clusterInd[j]].requestId
                        }
                    })
                        .then(async res => {
                            if (!res) {
                                console.log('new record')
                                await TourModel.create(
                                    {
                                        request_id: data[result.groups[i].clusterInd[j]].requestId,
                                        tour_id: drivers[i].user_id,
                                        request_type: data[result.groups[i].clusterInd[j]].requestType,
                                        dropoff_code: data[result.groups[i].clusterInd[j]].dropoffCode,
                                        created_at: Date.now(),
                                        updated_at: Date.now()
                                    }

                                )
                                    .then(res => {
                                        console.log('success')
                                        utility.upgradeStatus(data[result.groups[i].clusterInd[j]].requestId)
                                    })
                                    .catch(err => { console.log(err) })

                            } else { console.log('request exist') }
                        })
                        .catch(err => { console.log(err) })


                    //think how to insert to tourID



                    // get the latitude and longtitude of the delivery requests of these statuses


                    // put them through clustering algorithm 


                }
            }

            //think how to insert to tourID

        })

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
        //if params has type = drop_off code, then it will execute this line else it will execute the line below
        if (!params.typeOfCode) {
            res.send(({
                status: 0,
                message: "No Type of Code found in Params"
            }))
        }

        const deliveryCode = utility.generateOtp()

        if (params.typeOfCode === 'pickup_code') {
            RequestModel.findOne({
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

                    //if job.Id is found in DB then below code will run if not, the above "if" code will run
                    // save the otp in db on the record request_id = req.body.jobId
                    response.update({
                        pickup_code: deliveryCode
                    }).then(() => {
                        let dataToSend = {
                            status: 1,
                            message: "OTP Generated"
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


                }).catch(err => {
                    res.send({
                        status: 0,
                        message: err
                    })
                })
        } else {
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
                    //if job.Id is found in DB then below code will run if not, the above "if" code will run
                    // save the otp in db on the record request_id = req.body.jobId
                    response.update({
                        dropoff_code: deliveryCode
                    }).then(() => {
                        let dataToSend = {
                            status: 1,
                            message: "OTP Generated"
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
                }).catch(err => {
                    res.send({
                        status: 0,
                        message: err
                    })
                })
        }
    },

    validateOtp: async (req, res) => {
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
        if (!params.typeOfCode) {
            res.send(({
                status: 0,
                message: "No Type of Code found in Params"
            }))
        }

        TourModel.findOne({
            where:
                Sequelize.and(
                    { request_id: params.jobId },
                    { dropoff_code: params.otp }
                )

        })
            .then(async response => {
                // validation to check whether the job id is valid or not
                if (!response) {
                    res.send(({
                        status: 0,
                        message: "OTP Not Valid"
                    }))
                } else {
                    /// Pending: write here the code to mark the job as completed
                    let response = await RequestModel.findOne({
                        where:
                            Sequelize.or(
                                { request_id: params.jobId }
                            )

                    })
                    if (response) {
                        response.update({
                            status: params.typeOfCode === 'pickup_code' ? 2 : 5
                        })
                            .catch(err => {
                                res.send({
                                    status: 0,
                                    message: err
                                })
                            })
                    }
                    res.send(({
                        status: 1,
                        message: "OTP is Valid"
                    }))
                }


            }).catch(err => {
                res.send({
                    status: 0,
                    message: err
                })
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


            }).catch(err => {
                res.send({
                    status: 0,
                    message: err
                })
            })

    },

    getClusterName: (req, res) => {

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

        RequestModel.findAll({
            where: Sequelize.and(
                { driver_id: params.driverID },
                Sequelize.or(
                    {
                        status: 1
                    },
                    {
                        status: 4
                    }
                )
            )
        }).then(response => {
            if (response.length > 0) {
                TourModel.findAll({
                    where: {
                        request_id: response.map(x => x["request_id"])
                    }
                }).then(tourData => {
                    res.send({
                        status: 1,
                        message: "Success",
                        data: tourData.map(x => x['tour_id'])
                    })
                })
                    .catch(err => {
                        res.send({
                            status: 0,
                            message: err
                        })
                    })
            } else {
                res.send(({
                    status: 0,
                    message: "No Active JOBS for the Driver"
                }))
            }
        })
            .catch(err => {
                res.send({
                    status: 0,
                    message: err
                })
            })
    },

    getBlockName: (req, res) => {
        //Validations
        let params = req.body
        if (!params) {
            res.send(({
                status: 0,
                message: "No Params found"
            }))
        }
        if (!params.tour_id) {
            res.send(({
                status: 0,
                message: "No Tour ID found in Params"
            }))
        }
        //On the basis of tour_id, fetch all delivery_request
        TourModel.findAll({
            where: {
                tour_id: params.tour_id
            }
        }).then(eachTour => {
            if (eachTour.length > 0) {
                RequestModel.findAll({
                    where: {
                        request_id: eachTour.map(x => x['request_id'])
                    }
                }).then(deliveryRequest => {
                    //delivery request contains all job request with params.tour_id
                    if (deliveryRequest.length > 0) {
                        deliveryRequest = deliveryRequest.map(x => {
                            let obj = x
                            let newName = ""
                            if (x['receiver_block_num']) {
                                newName += x['receiver_block_num'] + " "
                            }
                            if (x['receiver_road_name']) {
                                newName += x['receiver_road_name']
                            }
                            obj['newName'] = newName.trim()
                            return obj
                        })
                        let allUniqueBlockArray = []
                        deliveryRequest.forEach(x => {
                            allUniqueBlockArray = [...allUniqueBlockArray, ...x['newName']]
                        })
                        let finalData = {}
                        allUniqueBlockArray.forEach(x => {
                            //return a combination of unique block name and total number of job request 
                            //corresponding to each block name
                            finalData[x] = deliveryRequest.filter(y => y['newName'] === x)
                        })
                        res.send({
                            status: 1,
                            data: finalData
                        })
                    } else {
                        res.send({
                            status: 0,
                            message: "No Request with the given tour_id"
                        })
                    }
                }).catch(err => {
                    res.send({
                        status: 0,
                        message: err
                    })
                })
            } else {
                res.send({
                    status: 0,
                    message: 'No Tour with the given tour id'
                })
            }
        }).catch(err => {
            res.send({
                status: 0,
                message: err
            })
        })
    },

    getJobBasedOnBlock: (req, res) => {
        //Validations
        let params = req.body
        if (!params) {
            res.send(({
                status: 0,
                message: "No Params found"
            }))
        }
        if (!params.request_id) {
            res.send(({
                status: 0,
                message: "No Request ID found in Params"
            }))
        }
        if (params.request_id.length < 1) {
            res.send(({
                status: 0,
                message: "No Request ID found in Params"
            }))
        }
        RequestModel.findAll({
            where: {
                request_id: params.request_id
            }
        }).then(allRequests => {
            if (allRequests.length > 0) {
                res.send({
                    status: 1,
                    data: allRequests
                })
            } else {
                res.send({
                    status: 0,
                    message: "No Job Request with the request id provided"
                })
            }
        }).catch(err => {
            res.send({
                status: 0,
                message: err
            })
        })
    },

    unsuccessfulDelivery: (req, res) => {
        let params = req.body
        if (!params) {
            res.send(({
                status: 0,
                message: "No Params found"
            }))
        }
        if (!params.request_id) {
            res.send(({
                status: 0,
                message: "No Request ID found in Params"
            }))
        }
        if (!params.reason) {
            res.send(({
                status: 0,
                message: "No Reason found in Params"
            }))
        }
        RequestModel.findOne({
            where: {
                request_id: params.request_id
            }
        }).then(res => {
            if (res) {
                res.update({
                    status: 7,
                    reason: params.reason
                }).then(() => {
                    res.send({
                        status: 1,
                        message: "Job Request Marked as Unsuccessfull"
                    })
                }).catch(err => {
                    res.send({
                        status: 0,
                        message: err
                    })
                })
            } else {
                res.send({
                    status: 0,
                    message: "No Job Request Found in DB"
                })
            }
        }).catch(err => {
            res.send({
                status: 0,
                message: err
            })
        })
    }
}

module.exports = controllers