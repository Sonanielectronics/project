
require('dotenv').config();

var url = require('url');
var GET_URL = process.env.BASE_URL;

module.exports.hostname = process.env.HOSTNAME;
module.exports.user = process.env.USERS;
module.exports.password = process.env.PASSWORD;
module.exports.database = process.env.DATABASE;

module.exports.db_port = process.env.PORT;

module.exports.base_url = GET_URL;
module.exports.jwtsecretkey = 'JustSampleJWTKey';