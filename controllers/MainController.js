
// npm modules
const _ = require("lodash")
const kmeans = require('node-kmeans')
const { response } = require('express')
const jwt = require('jsonwebtoken')
const lodash = require("lodash")
const { Op } = require("sequelize")

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
const tour = require("../models/tour")

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
        const token = req.headers.auth_token
        const rawJWT = jwt.decode(token)

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
            sender_id: rawJWT.id,
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
            status: '0',
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

    getSenderRequests: (req, res) => {

        RequestModel.findAll({
            where: { sender_id: req.params.id }
        })
            .then(response => {
                return res.status(200).json({
                    request: response
                })
            })
            .catch(error => {
                return res.status(500).send({
                    message: error.message || "Some error occurred where geting data"
                })
            })
    },


    optimize: (req, res) => {
        let data = []
        console.log('route hit')

        // get all delivery requests where status is 'ready to pickup' and 'in wharehouse' Status == 1 or status == 3. 
        UserModel.findAll({
            // where: {id: 1}
            include: { model: RequestModel }
        }).then(async response => {
            res.send(response)
            //

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
                        let dropoffcode = utility.generateOtp()
                        data.push({
                            senderId: request.sender_id,
                            requestId: request.id,
                            lat: request.receiver_lat,
                            long: request.receiver_long,
                            requestType: "Delivery",
                            dropoffCode: dropoffcode // dropoff code: needs to be different from the pickup code
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


                }
            }



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
                        { id: params.jobId }
                    )

            })
                .then(response => {
                    // validation to check whether the job id is valid/active or not
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

        if (params.typeOfCode === 'pickup_code') {
            RequestModel.findOne({
                where:
                    Sequelize.and(
                        { id: params.jobId },
                        { otp: params.otp }
                    )

            }).then(async response => {
                // validation to check whether the job id is valid or not
                if (!response) {
                    res.send(({
                        status: 0,
                        message: "OTP Not Valid"
                    }))
                } else {

                    response.update({
                        status: 2
                    })
                        .catch(err => {
                            res.send({
                                status: 0,
                                message: err
                            })
                        })

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
        } else {
            TourModel.findOne({
                where:
                    Sequelize.and(
                        { request_id: params.jobId },
                        { dropoff_code: params.otp }
                    )

            })
                .then(async resp => {
                    // validation to check whether the job id is valid or not
                    console.log(resp)
                    if (!resp) {
                        res.send(({
                            status: 0,
                            message: "OTP Not Valid"
                        }))
                    } else {
                        /// Pending: write here the code to mark the job as completed
                        let response = await RequestModel.findOne({
                            where:
                                Sequelize.or(
                                    { id: params.jobId }
                                )

                        })
                        if (response) {
                            response.update({
                                status: 6
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
        }
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
            return res.send(({
                status: 0,
                message: "No Params found"
            }))
        }
        if (!params.driverID) {
            return res.send(({
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
                        status: 5
                    }
                )
            )
        }).then(response => {
            if (response.length > 0) {
                TourModel.findAll({
                    where: {
                        request_id: response.map(x => x["id"])
                    }
                }).then(tourData => {
                    let tempTourData = utility.removeDuplicatesFromList(JSON.parse(JSON.stringify(tourData)).map(x => x['tour_id']))
                    let finalData = []
                    tempTourData.forEach((x, i) => {
                        let filterData = tourData.filter(y => y['tour_id'] === x).length
                        finalData.push({
                            label: "Cluster " + String.fromCharCode(65 + i),
                            id: x,
                            length: filterData
                        })
                    })
                    res.send({
                        status: 1,
                        message: "Success",
                        data: lodash.orderBy(finalData, ['length'], ['desc'])
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
        if (!params.driverID) {
            return res.send(({
                status: 0,
                message: "No Driver ID found in Params"
            }))
        }
        //On the basis of tour_id, fetch all delivery_request
        TourModel.findAll({
            where: Sequelize.and(
                {
                    tour_id: params.tour_id
                }
            )
        }).then(eachTour => {
            if (eachTour.length > 0) {
                RequestModel.findAll({
                    where: Sequelize.and(
                        {
                            id: eachTour.map(x => x['request_id'])
                        },
                        { driver_id: params.driverID },
                        Sequelize.or(
                            {
                                status: 1
                            },
                            {
                                status: 5
                            }
                        )
                    )
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
                            allUniqueBlockArray.push(x['newName'])
                        })
                        let finalData = {}
                        allUniqueBlockArray.forEach(x => {
                            //return a combination of unique block name and total number of job request 
                            //corresponding to each block name
                            finalData[x] = deliveryRequest.filter(y => y['newName'] === x)
                        })
                        res.send({
                            status: 1,
                            data: finalData,
                            tempData: eachTour
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
                id: params.request_id
            }
        }).then(allRequests => {
            if (allRequests.length > 0) {
                res.send({
                    status: 1,
                    data: lodash.orderBy(allRequests, ['receiver_floor'], ['desc'])
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
            return res.send(({
                status: 0,
                message: "No Params found"
            }))
        }
        if (!params.request_id) {
            return res.send(({
                status: 0,
                message: "No Request ID found in Params"
            }))
        }
        if (!params.reason) {
            return res.send(({
                status: 0,
                message: "No Reason found in Params"
            }))
        }
        RequestModel.findOne({
            where: {
                id: params.request_id
            }
        }).then(resp => {
            if (resp) {
                resp.update({
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
    },

    getDriverDetails: (req, res) => {
        let params = req.body
        if (!params) {
            return res.send(({
                status: 0,
                message: "No Params found"
            }))
        }
        if (!params.driverID) {
            return res.send(({
                status: 0,
                message: "No Driver ID found in Params"
            }))
        }
        DriverModel.findOne({
            where:
                Sequelize.or(
                    { user_id: params.driverID }
                )
        })
            .then(response => {
                if (response) {
                    res.send({
                        status: 1,
                        data: response
                    })
                } else {
                    res.send(({
                        status: 0,
                        message: "No Driver Details found in DB"
                    }))
                }
            }).catch(err => {
                res.send({
                    status: 0,
                    message: err
                })
            })
    },

    getRequests: (req, res) => {
        //to show DB is connected.

        RequestModel.findAll()

            .then(results => {

                if (results) {

                    results = {
                        "success": "true",
                        "NoOfRequests": results.length,
                        "RequestsList": results

                    }

                    res.send(results)

                    return
                }


            })


    },

    getMapData: (req, res) => {
        RequestModel.findAll({
            where: Sequelize.and(
                {
                    status: {
                        [Op.not]: 2
                    }
                },
                {
                    status: {
                        [Op.not]: 6
                    }
                }
            )
        }).then(allrequests => {
            if (allrequests.length > 0) {
                TourModel.findAll({
                    where: {
                        //In delivery request, we have id & tour details - request_id
                        request_id: JSON.parse(JSON.stringify(allrequests)).map(x => x['id'])
                    }
                })
                    .then(alltourData => {
                        if (alltourData.length > 0) {
                            //mapping all delivery request with tour_id
                            let allDeliRequ = []
                            allrequests.forEach(x => {
                                let obj = { ...x['dataValues'] }
                                let findTour = alltourData.find(y => y['request_id'] === x['id'])
                                if (findTour) {
                                    obj['tour_id'] = findTour['tour_id']
                                }
                                allDeliRequ.push({
                                    tour_id: obj['tour_id'],
                                    latLng: {
                                        lat: Number(obj['receiver_lat']),
                                        lng: Number(obj['receiver_long'])
                                    },
                                    request_id: obj['id']
                                })
                            })
                            let groupedData = _.groupBy(allDeliRequ, 'tour_id')
                            let allDeliReqWithMarker = []
                            Object.keys(groupedData).forEach((x, i) => {
                                if (groupedData[x]) {
                                    allDeliReqWithMarker = [
                                        ...allDeliReqWithMarker,
                                        ...groupedData[x].map(y => {
                                            return {
                                                ...y,
                                                markerIcon: utility.getMarkerIcons(i + 1)
                                            }
                                        })
                                    ]
                                }
                            })
                            res.send({
                                status: 1,
                                data: allDeliReqWithMarker
                            })
                        }
                    }).catch(err => {
                        res.send({
                            status: 0,
                            message: err
                        })
                    })
            }
        }).catch(err => {
            res.send({
                status: 0,
                message: err
            })
        })
    },

    queryDelivery: (req, res) => {

        console.log(req.body.searchItem)
        
        RequestModel.findOne(
            {
                where: Sequelize.or
                    (
                        { receiver_email: req.body.searchItem },
                        { receiver_contact: req.body.searchItem }
                    )
            })
            .then(result => {
                
                   
                   
                    switch (result.status) {
                        case "0":    // Submitted Request (Edwin to change 0->1 after clusterize)
                            res.send('Request Submitted')

                            break;
                        case "1":   //Picked up (Admin to change status from 2->3 … arrived at wharehouse))
                            res.send('Ready for pickup')
                            break;

                        case "2":   // In Warehouse (Edwin clusterize 3->4)
                            res.send("Picked Up")
                            break;

                        case "3":   //Ready to Deliver (John to change 4->5 after pickup from wharehouse
                            res.send("In Wharehouse")
                            break;

                        case "4":   //On the way (John to change from 5->6 when OTP successful)
                            res.send("Ready to Deliver")
                            break;

                        case "5":   //Delivered successfully
                            res.send("On the Way")

                        case "6":   //Delivered successfully
                            res.send("Delivered Successfull")

                        default:


                    }

                
            })
    }
}


module.exports = controllers