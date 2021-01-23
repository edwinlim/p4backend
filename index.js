require('dotenv').config()
const express = require('express')
const app = express();
const port = process.env.PORT || 5000;
const sequelize = require('./models/index')
const Post = require('./models/post')
const PostModel = Post(sequelize.sequelize, sequelize.Sequelize.DataTypes)

app.use(express.urlencoded({
    extended: true
}))

app.post('/api/v1/posts', (req, res) => {
    console.log(req.body)
    
    PostModel.create({
        author: req.body.author,
        text: req.body.text
    })
        .then(response => {
            return res.status(201).json({
                success: true,
            })
        })
        .catch(err => {
            console.log(err)
            return res.status(400).json({
                success: false,
                message: 'create post failed'
            })
        })
})

app.get('/api/v1/posts', (req, res) => {
    PostModel.findAll()
        .then(response => {
            return res.status(200).json({
                success: true,
                posts: response
            })
        })
        .catch(err => {
            console.log(err)
            return res.status(400).json({
                success: false,
                message: 'find posts failed'
            })
        })
})

app.patch('/api/v1/posts/:post_id', (req, res) => {
    PostModel.findOne({
        id: req.params.post_id
    })
        .then(response => {
            PostModel.update(
                {
                    author: req.body.author,
                    text: req.body.text
                },
                {
                    where: {
                        id: req.params.post_id
                    }
                }
            )
                .then(response => {
                    return res.status(200).json({
                        success: true,
                    })
                })
                .catch(err => {
                    console.log(err)
                    return res.status(400).json({
                        success: false,
                        message: 'update post failed'
                    })
                })
        })
        .catch(err => {
            console.log(err)
            return res.status(404).json({
                success: false,
                message: 'post id not found'
            })
        })
})

app.listen(process.env.PORT || port, () => {
    console.log(`Blogpost API listening on port: ${port}`)
})
