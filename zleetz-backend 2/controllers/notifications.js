const config = require("../config/config");

const randomstring = require("randomstring");
const { encode } = require('../helper/common_functions');
const notificationsModel = require('../model/notifications_model');
const moment = require('moment');
const curruntTime = moment(new Date()).format('YYYY-MM-DD hh:mm:00')


module.exports.getListOfNotifications = async (request, response) => {
    try {
        const request_body = request.body;
        const { page_no } = request_body.data;
        const id = request_body.id;

        const pageNo = page_no ? page_no : 1;
        const limit = 10;
        const offset = ((pageNo - 1) * limit) > 0 ? (pageNo - 1) * limit : 0;

        const getNotificationsDetail = await notificationsModel.getAllNotificationsList(id, limit, offset);
        if (!getNotificationsDetail.status) return response.json({ status: false, message: getNotificationsDetail.message, data: [] });

        const getNotificationsCount = await notificationsModel.getAllNotificationsListCount(id);
        if (!getNotificationsCount.status) return response.json({ status: false, message: getNotificationsCount.message, data: [] });

        const ciphertext = await encode(getNotificationsDetail.data);
        return response.json({ status: true, message: "Notification loaded successfully.", count: getNotificationsCount.data, data: ciphertext });
        return response.json({ status: true, message: "Notification loaded successfully.", data: getNotificationsDetail.data });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.testCookie = async (request, response) => {
    try {
        response.cookie('my_cookie', 'geeksforgeeks');
        return response.json({ status: true, message: "Cookie loaded successfully." });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}