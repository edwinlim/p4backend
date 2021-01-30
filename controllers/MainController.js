const sequelize = require('../models/index')
const Request = require('../models/request')
const RequestModel = Request(sequelize.sequelize, sequelize.Sequelize.DataTypes)
// const PostModel = Post(sequelize.sequelize, sequelize.Sequelize.DataTypes)

const controllers = {
    start: (req, res) => {
        RequestModel.findAll()
            .then(response => {
                return res.status(200).json({
                    success: true,
                    data: response
                })
            })
    }
}

module.exports = controllers