require('dotenv').config();
const jwt = require('jsonwebtoken')
const { response } = require('express')
const sequelize = require('../models/index')
const SHA256 = require("crypto-js/sha256")
const uuid = require('uuid')
const User = require('../models/user')
const UserModel = User(sequelize.sequelize, sequelize.Sequelize.DataTypes)
const Driver = require("../models/driver")
const DriverModel = Driver(sequelize.sequelize, sequelize.Sequelize.DataTypes)

const controllers = {
    register: (req, res) => {
        
        const registrationInput = req.body.register

        // Check if email exists in Database
        UserModel.findOne({
            where: { email_address: registrationInput.email}
        })
            .then(result => {
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
            contact: registrationInput.contact,
        }

        UserModel.create(userAccount)
            .then(data => {

                DriverModel.create({
                    user_id: data.id,
                    plate_number: registrationInput.plate,
                    vehicle_type: registrationInput.model,
                    remark: registrationInput.otherinfor,
                    availability: true
                })

                res.status(200).send(data)
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred where creating Request Delivery"
                })
            })
    },

    login: (req, res) => {
        
        // gets user with the given email
        UserModel.findOne({
            where: { email_address: req.body.email}
        })
            .then(result => {
             
                // Check if found user email address
                if (result === null) {
                   
                    res.send({
                        "success": false,
                        "message": "Username or password is wrong"
                    })
                
                    return
                }
                
                // combine DB user salt with given password, and apply hash algorithm
                const hash = SHA256(result.pwsalt + req.body.password).toString()

                // check if password is correct by comparing hashes
                if (hash !== result.password) {
                    res.send({
                        "success": false,
                        "message": "Either username or password is wrong"
                    })
                    return
                }
                // login successful, generate JWT
                const token = jwt.sign({
                    id: result.id,
                    name: result.first_name,
                    role: result.user_roles,
                }, process.env.JWT_SECRET, {
                    algorithm: 'HS384',
                    expiresIn: "2h"
                })
                console.log(token)

                // decode JWT to get raw values
                const rawJWT = jwt.decode(token)
                console.log(rawJWT)
                // return token as json response

                res.status(200).json({
                    "success": true,
                    "token": token,
                    "expiresAt": rawJWT.exp,
                    "userDetails": result,
                })

            })
            .catch(err => {
                res.status(500).json({
                    success: false,
                    message: "Unable to login due to unexpected error"
                })
            })
    }
}

module.exports = controllers