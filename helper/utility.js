// exports.generateOtp = () => {
//     return (Math.floor(Math.random() * 10000) + 10000).toString().substring(1)
// }
// importing the sequilize middleware
const { Sequelize } = require('../models/index')
const sequelize = require('../models/index')
const Request = require('../models/request')
const RequestModel = Request(sequelize.sequelize, sequelize.Sequelize.DataTypes)
const lodash = require("lodash")
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
            11: "https://maps.google.com/mapfiles/kml/pal2/icon0.png",
            12: "https://maps.google.com/mapfiles/kml/pal2/icon1.png",
            13: "https://maps.google.com/mapfiles/kml/pal2/icon2.png",
            14: "https://maps.google.com/mapfiles/kml/pal2/icon3.png",
            15: "https://maps.google.com/mapfiles/kml/pal2/icon4.png",
            16: "https://maps.google.com/mapfiles/kml/pal2/icon5.png",
            17: "https://maps.google.com/mapfiles/kml/pal2/icon6.png",
            18: "https://maps.google.com/mapfiles/kml/pal2/icon7.png",
            19: "https://maps.google.com/mapfiles/kml/pal2/icon8.png",
            20: "https://maps.google.com/mapfiles/kml/pal2/icon9.png",
        }
        return markerData[clusterName] ? markerData[clusterName] : ""
    },

    sendEmail: async (toAddress, mailContent, subject) => {
        const msg = {
            to: toAddress,
            from: 'dengueheatmap@gmail.com',
            subject: subject,
            text: mailContent
        }
        let res = await sgMail.send(msg)
        return res
    }

}

module.exports = controllers