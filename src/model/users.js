const connection = require('../config/db')

module.exports = {
  get: () => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT user_id,user_name,full_name,photo,created_at FROM users', (err, result) => {
        if (!err) {
          resolve(result)
        } else {
          reject(new Error(err))
        }
      })
    })
  },

 register: (data) => {
   return new Promise((resolve, reject) => {
     connection.query('INSERT INTO users SET ?', data, (err, result) => {
       if(!err){
         resolve(result)
       } else {
         reject(err)
       }
     })
   })
 },

 getUserbyUsername: (username) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM users WHERE user_name = ?', username, (err, result) => {
      if (!err) {
         resolve(result)
      } else {
         reject(new Error(err))
      }
    })
  })
},

getUserbyUserId: (userId) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM users WHERE user_id = ?', userId, (err, result) => {
      if (!err) {
         resolve(result)
      } else {
         reject(new Error(err))
      }
    })
  })
},

 updateToken: (token, username) => {
  return new Promise((resolve, reject) => {
    connection.query('UPDATE users SET token = ? WHERE user_name = ?', [token, username], (err, result) => {
      if (!err) {
        resolve(result)
      } else {
        reject(new Error(err))
      }
    })
  })
},

 delete: (username) => {
   return new Promise((resolve, reject) => {
     connection.query('DELETE FROM users WHERE user_name = ?', username, (err, result) => {
       if(!err){
         resolve(result)
       } else {
         reject(err)
       }
     })
   })
 },

 update: (data, userId) => {
   return new Promise((resolve,reject) => {
     connection.query('UPDATE users SET ? WHERE user_id = ?', [data, userId] , (err, result) => {
       if(!err){
         resolve(result)
       } else {
         reject(err)
       }
     })
   })
 }
}
