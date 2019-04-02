if (process.env.RUNNING_LOCALLY) {
  require('dotenv').config()
}

const path = require('path')
const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const mysql = require('mysql')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')

require('./run-database-migrations')

exports.app = app
exports.pool = mysql.createPool({ connectionLimit: 20,
  host     : process.env.RDS_HOSTNAME || 'localhost',
  user     : process.env.RDS_USERNAME || 'root',
  password : process.env.RDS_PASSWORD || 'password',
  database : process.env.RDS_DB_NAME || 'local_db',
  port     : process.env.RDS_PORT || '3306',
});
exports.databaseError = function databaseError(req, res, err) {
  const msg = process.env.RUNNING_LOCALLY ? `Database Error for backend endpoint '${req.url}'. ${err}` : `Database error. Run 'eb logs' for more detail`
  console.error(err)
  res.status(500).send({error: msg})
}

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs')
app.use(morgan('combined'))
app.use('/static', express.static(path.join(__dirname, '../static')))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cookieParser())

require('./apis/login.api')
require('./apis/dummy.api')
require('./apis/github-key.api')
require('./index-html.js')

app.listen(port, () => {
  console.log('Node Express server listening on port', port)
})