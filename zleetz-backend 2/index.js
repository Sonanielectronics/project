const cors = require('cors');
var express = require("express");
var router = require('./route/route');
var adminRoute = require('./route/admin_route');
var bodyParser = require('body-parser');
var expressFile = require('express-fileupload');
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());
app.use(cors());
app.use(expressFile());
const { Server } = require("socket.io");
const http = require("http");
const PORT = process.env.PORT || 3005

const database = require("./config/db");

const cron = require('node-cron');
const cronController = require('./controllers/admin/cron')

global.ROOT_TEMPLATE_PATH = __dirname + "/public/";
global.ROOT_HTML_TEMPLATE_PATH = __dirname + "/views/";

const { connectSocket } = require('./socket/io')

//socket.io config
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", } })

connectSocket(io)

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', router);
app.use('/admin', adminRoute);

//default route
app.all('/', (req, res) => {
    return res.status(200).send("Zleetz Connected... wohoo")
})

// app.get('/Hi', (req, res) => {
//     res.sendFile(__dirname+'/views/html-template/verify_failed.html');
// })

// app.get('/Hello', (req, res) => {
//     res.sendFile(__dirname+'/views/html-template/verify_success.html');
// })

cron.schedule('*/10 * * * *', async () => {
    const expireGame = await cronController.expiredQuiz()
    console.log('running a task every 10 minute');
});

app.listen(PORT, () => {
    console.log('server is running on port ' + PORT)
})
