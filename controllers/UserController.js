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
    },

    login: (req, res) => {
        // gets user with the given email
        UserModel.findOne({
            where: { email_address: req.body.email}
        })
            .then(result => {
                // Check if found user email address
                if (!result) {
                    res.status(401).json({
                        "success": false,
                        "message": "Username or password is wrong"
                    })
                    return
                }

                // combine DB user salt with given password, and apply hash algorithm
                const hash = SHA256(result.pwsalt + req.body.password).toString()

                // check if password is correct by comparing hashes
                if (hash !== result.hash) {
                    res.statusCode = 401
                    res.json({
                        "success": false,
                        "message": "Either username or password is wrong"
                    })
                    return
                }

                // login successful, generate JWT
                const token = jwt.sign({
                    name: result.first_name,
                    email: result.email_address,
                }, process.env.JWT_SECRET, {
                    algorithm: 'HS384',
                    expiresIn: "2h"
                })

                // decode JWT to get raw values
                const rawJWT = jwt.decode(token)

                // return token as json response
                res.json({
                    success: true,
                    token: token,
                    expiresAt: rawJWT.exp,
                    userDetails: result
                })

            })
            .catch(err => {
                res.statusCode = 500
                res.json({
                    success: false,
                    message: "Unable to login due to unexpected error"
                })
            })
    }
}

module.exports = controllers