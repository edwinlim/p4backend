const jwt = require('jsonwebtoken')
const { response } = require('express')
const sequelize = require('../models/index')
const SHA256 = require("crypto-js/sha256")
const uuid = require('uuid')
const User = require('../models/user')
const UserModel = User(sequelize.sequelize, sequelize.Sequelize.DataTypes)

const controllers = {
    register: (req, res) => {
        
        const registrationInput = req.body.register

        // Check if email exists in Database
        UserModel.findOne({
            where: { email_address: registrationInput.email}
        })
            .then(result => {
                console.log(result)
                if (result) {
                   return res.status(400).json({ 
                        status: "Failed",
                        error: "Registered Account" 
                    })
                
                }
            })

        // Not registered account, add user details in Database
        // 1. Generate uuid as salt
        const salt = uuid.v4()

        // 2. hash combination using bcrypt
        const combination = salt + registrationInput.password

        // 3. has the combination using SHA256
        const hash = SHA256(combination).toString()

        // 4. Add user in DB
        const userAccount = {
            user_roles: registrationInput.role,
            email_address: registrationInput.email,
            pwsalt: salt,
            password: hash,
            first_name: registrationInput.firstName,
            last_name: registrationInput.lastName,
            address_block_num: registrationInput.houseNum,
            road_name: registrationInput.streetAddr,
            floor: registrationInput.floor,
            unit_number: registrationInput.unitNum,
            poscode: registrationInput.postcode,
            country: registrationInput.country,
            user_lat: registrationInput.lat,
            user_long: registrationInput.lng,
            contact: registrationInput.contact 
        }

        UserModel.create(userAccount)
            .then(data => {
                res.status(200).send(data)
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred where creating Request Delivery"
                })
            })
    }
}

module.exports = controllers