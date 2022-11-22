const async = require("async");
const config = require("./../config/config");


async function connectSocket(io) {
    try {
        io.on('connection', (socket) => {
            console.log('Hello');
            socket.on('getQuestions', async (userid) => {

                if (userid) {
                    console.log('if');
                    io.to(userid).emit('data', { 'Hello': 1 })
                    return
                } else {
                    console.log('else');
                    io.to(socket.id).emit('data', { 'error': 1 })
                    return
                }
            })
        });
    } catch (err) {
        console.log(err)
        return { "status": false, "message": "Something went wrong!", data: {} }
    }
}

module.exports = { connectSocket }