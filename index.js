require('dotenv').config()

const bodyParser = require('body-parser')
const express = require('express');
const logger = require('morgan')
const app = express();
const port = process.env.SERVER_PORT || 5000;

const userRoute = require('./src/router/users')

app.use(logger('dev'))
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
    console.log(`\n App listening on port ${port} \n`)
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))

app.use('/test-majoo', userRoute);