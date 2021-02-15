// exports.generateOtp = () => {
//     return (Math.floor(Math.random() * 10000) + 10000).toString().substring(1)
// }
// importing the sequilize middleware
const { Sequelize } = require('../models/index')
const sequelize = require('../models/index')
const Request = require('../models/request')
const RequestModel = Request(sequelize.sequelize, sequelize.Sequelize.DataTypes)
const lodash = require("lodash")

controllers = {

    generateOtp:

        () => {
            return (Math.floor(Math.random() * 10000) + 10000).toString().substring(1)
        },


    upgradeStatus: (requestID) => {
        let currentStatus
        RequestModel.findOne({
            where: {
                id: requestID
            }
        })
            .then(function (request) {
                if (request) {
                    
                    switch (request.status) {
                        case "0":    // Submitted Request (Edwin to change 0->1 after clusterize)
                            newStatus = "1"

                            break;
                        case "1":   //Picked up (Admin to change status from 2->3 … arrived at wharehouse))

                            newStatus = "2"
                            break;

                        case "2":   // In Warehouse (Edwin clusterize 3->4)
                            newStatus = "3"
                            break;

                        case "3":   //Ready to Deliver (John to change 4->5 after pickup from wharehouse
                            newStatus = "4"
                            break;

                        case "4":   //On the way (John to change from 5->6 when OTP successful)
                            newStatus = "5"
                            break;

                        case "5":   //Delivered successfully
                            newStatus = "6"

                        default:


                    }
                
                    RequestModel.update(
                        { status: newStatus },
                        { where: { id: requestID } }
                    )
                }
            })

            .catch(err => { console.log(err) })



    },

    removeDuplicatesFromList: (data) => {
        return data.filter(function (item, pos) {
            return data.indexOf(item) === pos
        })
    },

    getMarkerIcons: (clusterName) => {
        let markerData = {
            1: "https://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_gray.png",
            2: "https://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_green.png",
            3: "https://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_purple.png",
            4: "https://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_orange.png",
            5: "https://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_red.png",
            6: "https://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_white.png",
            7: "https://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_yellow.png",
            8: "https://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_black.png",
            9: "https://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_blue.png",
            10: "https://maps.gstatic.com/mapfiles/ridefinder-images/mm_20_brown.png",
        }
        return markerData[clusterName] ? markerData[clusterName] : ""
    }

}

module.exports = controllers