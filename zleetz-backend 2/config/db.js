var db_config = require('./config');

var mysql = require("mysql");
var confData = {
    multipleStatements: true,
    host: db_config.hostname,
    user: db_config.user,
    password: db_config.password,
    database: db_config.database,
    port:8888,
    connectionLimit: 1000,
    connectTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
}

let pool = mysql.createPool(confData);

pool.on('connection', function (_conn) {
    if (_conn) {
        logger.info('Connected the database via threadId %d!!', _conn.threadId);
        _conn.query('SET SESSION auto_increment_increment=1');
    }
});

module.exports = pool;
