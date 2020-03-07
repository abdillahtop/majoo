const uuidv4 = require('uuid/v4');
const userModels = require('../model/users');
const wrapper = require('../helpers/helpers');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary')

module.exports = {
  checkServer: (req, res) => {
    return res.json({
      code: 200,
      message: 'Server Running...'
    })
  },

  register: async (req, res) => {
    const salt = wrapper.generateSalt(64)
    const checkUser = await userModels.getUserbyUsername(req.body.username)

    if (checkUser[0] === undefined) {
      const validate = req.body.username.split(' ')
      const passwordHash = wrapper.setPassword(req.body.password, salt)
      if (validate.length > 1) {
        return wrapper.response(res, null, 400, 'Username tidak dapat dengan spasi')
      }

      if (req.file === undefined) {
        const data = {
          user_id: uuidv4(),
          user_name: req.body.username,
          salt: passwordHash.salt,
          password: passwordHash.passwordHash,
          full_name: req.body.name,
          photo: 'https://res.cloudinary.com/hijrahapp/image/upload/v1581866509/internal/default_profile_fw1wwi.png',
          created_at: new Date()
        }

        userModels.register(data)
          .then(async () => {
            const result = await userModels.getUserbyUsername(req.body.username)
            const dataUser = result[0]
            const usePassword = wrapper.setPassword(req.body.password, dataUser.salt).passwordHash
            if (usePassword === dataUser.password) {
              dataUser.token = jwt.sign(
                {
                  user_id: dataUser.user_id
                },
                process.env.SECRET_KEY,
                { expiresIn: '1000h' }
              )
              delete dataUser.salt
              delete dataUser.password
            }
            userModels.updateToken(dataUser.token, dataUser.user_name)
            return wrapper.response(res, 'User inserted', 200)
          })
          .catch(error => {
            console.log(error)
          })
      } else {
        const path = await req.file.path
        const geturl = async (req) => {
          cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_CLOUD_KEY,
            api_secret: process.env.API_CLOUD_SECRET
          })

          let dataCloudinary
          await cloudinary.uploader.upload(path, (result) => {
            if (result.error) {
              wrapper.response(res, 'Cloud Server disable', 500)
            } else {
              dataCloudinary = result.url
            }
          })

          return dataCloudinary
        }
        const data = {
          user_id: uuidv4(),
          user_name: req.body.username,
          salt: passwordHash.salt,
          password: passwordHash.passwordHash,
          full_name: req.body.name,
          photo: await geturl(),
          created_at: new Date()
        }

        userModels.register(data)
          .then(async () => {
            const result = await userModels.getUserbyUsername(req.body.username)
            const dataUser = result[0]
            const usePassword = wrapper.setPassword(req.body.password, dataUser.salt).passwordHash
            if (usePassword === dataUser.password) {
              dataUser.token = jwt.sign(
                {
                  user_id: dataUser.user_id
                },
                process.env.SECRET_KEY,
                { expiresIn: '1000h' }
              )
              delete dataUser.salt
              delete dataUser.password
            }
            userModels.updateToken(dataUser.token, dataUser.user_name)
            return wrapper.response(res, 'User inserted', 200)
          })
          .catch(error => {
            console.log(error)
          })
      }
    } else {
      wrapper.response(res, 'Username has been used', 409)
    }
  },

  login: async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const checkusername = await userModels.getUserbyUsername(req.body.username)

    if (checkusername[0] === undefined) {
      wrapper.response(res, 'User not found', 204)
    } else {
      userModels
        .getUserbyUsername(username)
        .then(result => {
          const dataUser = result[0]
          const usePassword = wrapper.setPassword(password, dataUser.salt)
            .passwordHash
          if (usePassword === dataUser.password) {
            dataUser.token = jwt.sign(
              {
                user_id: dataUser.user_id
              },
              process.env.SECRET_KEY,
              { expiresIn: '1000h' }
            )

            delete dataUser.salt
            delete dataUser.password

            userModels.updateToken(dataUser.token, dataUser.username)
            const data = {
              token: dataUser.token
            }
            return wrapper.response(res, data, 200)
          } else {
            return wrapper.response(res, null, 401, 'Wrong password!')
          }
        })
        .catch(error => {
          console.log(error)
        })
    }
  },

  listUser: (req, res) => {
    userModels.get()
      .then(result => {
        wrapper.response(res, result, 200)
      })
      .catch((err) => {
        wrapper.response(res, err, 400)
      })
  },

  updateUser: async (req, res) => {
    const checkUser = await userModels.getUserbyUserId(req.user_id)

    if (checkUser[0] === undefined) {
      wrapper.response(res, 'User not found', 204)
    } else {
      if (req.file === undefined) {
        const validate = await userModels.getUserbyUsername(req.body.username)
        console.log(JSON.stringify(validate))
        if (checkUser[0].user_name === req.body.username) {
          const data = {
            user_name: req.body.username,
            full_name: req.body.name,
            photo: checkUser[0].profile_url
          }
          userModels.update(data, req.user_id)
            .then(() => {
              wrapper.response(res, 'User has been updated', 200)
            })
            .catch(() => {
              wrapper.response(res, 'Bad request', 400)
            })
        } else if (validate[0] != undefined) {
          wrapper.response(res, 'Username has been taken', 409)
        }

      } else {
        const path = await req.file.path
        const geturl = async (req) => {
          cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_CLOUD_KEY,
            api_secret: process.env.API_CLOUD_SECRET
          })

          let dataCloudinary
          await cloudinary.uploader.upload(path, (result) => {
            if (result.error) {
              wrapper.response(res, 'Cloud Server disable', 500)
            } else {
              dataCloudinary = result.url
            }
          })

          return dataCloudinary
        }
        const validate = await userModels.getUserbyUsername(req.body.username)
        if (validate[0].user_name === req.body.username) {
          const data = {
            user_name: req.body.username,
            full_name: req.body.name,
            photo: await geturl()
          }
          userModels.update(data, req.user_id)
            .then(() => {
              wrapper.response(res, 'User has been updated', 200)
            })
            .catch(() => {
              wrapper.response(res, 'Bad request', 400)
            })
        } else if (validate[0] != undefined) {
          wrapper.response(res, 'Username has been taken', 409)
        }
      }
    }
  },

  deleteUser: async (req, res) => {
    const checkusername = await userModels.getUserbyUserId(req.user_id)
    if (checkusername[0] === undefined) {
      wrapper.response(res, 'User not found', 204)
    }
    if (checkusername[0].user_name == req.params.username) {
      wrapper.response(res, 'You cannot delete your account', 400)
    } else {
      userModels.delete(req.params.username)
      .then(() => {
        wrapper.response(res, 'user has been delete', 200)
      })
      .catch((err) => {
        wrapper.response(res, err, 400)
      })
    }
  }
}