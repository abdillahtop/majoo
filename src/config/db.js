require('dotenv').config() // Initialize dotenv config

const mysql = require('mysql')
const connection = mysql.createConnection({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: `${process.env.DB_PASSWORD}`,
  database: process.env.DB_NAME,
  timezone: 'UTC+7:00'
})

connection.connect((err) => {
  if (err) console.log(`Error: ${err}`)
})

module.exports = connection
