const { response } = require('express')
const { Sequelize } = require('../models/index')
const sequelize = require('../models/index')
const Request = require('../models/request')
const RequestModel = Request(sequelize.sequelize, sequelize.Sequelize.DataTypes)
const TourModel = Request(sequelize.sequelize, sequelize.Sequelize.DataTypes)
const User = require('../models/user')
const UserModel = User(sequelize.sequelize, sequelize.Sequelize.DataTypes)

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
        if (!formInputs.receiverEmail || !formInputs.receiverPostcode){
            res.status(400).send({
                message: "Receiver information cannot be empty"
            })
            return
        }

        // Generate Random 4 digits number
        const pickupCode = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);

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


    optimize: (req,res) => {

        // get all delivery requests where status is 'ready to pickup' and 'in wharehouse'. 
        RequestModel.findAll({
            where:
            
                Sequelize.or(
                    { status: 1 },
                    { status: 3 }
                )
            
        })
        .then (response => {
            console.log(response)
        })

        RequestModel.findAll({
            where: { status: '1'},
            include: [
                {
                    model: UserModel,
                    // on: {
                    //     id: Sequelize.literal("`RequestModel`.`sender_id` = `UserModel`.`id`") 
                    // }
                }
            ]
        })
        .then(result => {
            res.send(result)
        })

        

        // get the latitude and longtitude of the delivery requests of these statuses


        // put them through clustering algorithm 


        // get output of clusters


        // insert into tour table



    }

}

module.exports = controllers