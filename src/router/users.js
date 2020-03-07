const express = require('express')
const Route = express.Router()
const multer = require('multer')
const UserController = require('../controller/users')
const Auth = require('../helpers/jwt_auth')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage: storage })

Route
  .get('/', UserController.checkServer)
  .get('/all', Auth.accesstoken, UserController.listUser)
  .post('/register', upload.single('photo'), Auth.authInfo, UserController.register)
  .post('/login', Auth.authInfo, UserController.login)
  .put('/update-user', upload.single('photo'), Auth.accesstoken, UserController.updateUser)
  .delete('/delete/:username', Auth.accesstoken, UserController.deleteUser)
module.exports = Route
