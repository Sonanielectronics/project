const isset = require('isset')
const moment = require('moment');

// All Controller
const { encode } = require('../../helper/common_functions');
const playersModel = require('../../model/players_model');
const profilesModel = require('../../model/profiles_model');
const curruntTime = moment(new Date()).format('YYYY-MM-DD hh:mm:00')


const excelJS = require("exceljs");

module.exports.downloadPlayerData = async (request, response) => {
    try {


        var getAllData = { 'limit': null, 'offset': null, 'search': null, 'is_bot': 0 }

        const getPlayerDetail = await playersModel.getAllPlayersList(getAllData);

        if (!getPlayerDetail.status) return response.json({ status: false, message: getPlayerDetail.message, data: [] });
        const playerData = getPlayerDetail.data;

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Players");

        worksheet.columns = [
            // { header: "S no.", key: "id" },
            { header: "User Name", key: "user_name" },
            { header: "Full Name", key: "full_name" },
            { header: "Email", key: "email" },
            { header: "Contact No", key: "contact_no" },
            { header: "Birth Year", key: "birth_year" },
            { header: "xp", key: "xp" },
            { header: "lp", key: "lp" },
            { header: "lt", key: "lt" },
            { header: "User Blocked", key: "user_block" },
            { header: "Email verified", key: "email_verify" },
            { header: "Country", key: "country_name" },
            { header: "image", key: "avatar" },
        ];

        playerData.forEach((data) => { worksheet.addRow(data) });

        worksheet.getRow(1).eachCell((cell) => { cell.font = { bold: true } });
        response.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        response.setHeader("Content-Disposition", `attachment; filename=players.xlsx`);

        return workbook.xlsx.write(response).then(() => { response.status(200) });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}



module.exports.getAllPlayerList = async (request, response) => {
    try {

        const request_body = request.body;
        const { page_no, search, is_bot, level } = request_body.data;

        var pageNo = page_no ? page_no : 1;
        var searchData = search ? search : null;
        var isBot = is_bot ? is_bot : 0;
        var limit = 10;
        var offset = ((pageNo - 1) * limit) > 0 ? (pageNo - 1) * limit : 0;
        var getAllData = { 'limit': limit, 'offset': offset, 'search': searchData, 'is_bot': isBot, 'level': level }

        const getPlayerDetail = await playersModel.getAllPlayersList(getAllData);
        const getPlayerCount = await playersModel.getAllPlayersCount(getAllData);
        if (!getPlayerDetail.status) return response.json({ status: false, message: getPlayerDetail.message, data: [] });
        if (!getPlayerCount.status) return response.json({ status: false, message: getPlayerCount.message, data: [] });

        const ciphertext = await encode(getPlayerDetail.data);
        return response.json({ status: true, message: "Player loaded successfully.", count: getPlayerCount.data, data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.deletePlayer = async (request, response) => {
    try {
        const { id } = request.params;

        const getProData = await profilesModel.getProfileData(id)
        if (!getProData.status) return response.json({ status: false, message: getProData.message, data: [] });
        var updateData = { 'id': id, 'updated_at': moment(new Date()).format('YYYY-MM-DD hh:mm:00'), 'status': 0 }

        const updateProData = await profilesModel.updateProfilesData(updateData);
        if (!updateProData.status) return response.json({ status: false, message: updateProData.message, data: [] });

        return response.json({ status: true, message: "Player delete succsessfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.verifyPlayer = async (request, response) => {
    try {

        const request_body = request.body;
        const { email_verify, user_id } = request_body.data;

        const getProData = await profilesModel.getProfileData(user_id)
        if (!getProData.status) return response.json({ status: false, message: getProData.message, data: [] });
        var updateData = { 'id': user_id, 'updated_at': moment(new Date()).format('YYYY-MM-DD hh:mm:00'), 'is_email_verify': email_verify }

        const updateProData = await profilesModel.updateProfilesData(updateData);
        if (!updateProData.status) return response.json({ status: false, message: updateProData.message, data: [] });
        var message = "Player un-verify."
        if (email_verify == 1) message = "Player verify."
        return response.json({ status: true, message: message, data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}
module.exports.blockPlayer = async (request, response) => {
    try {

        const request_body = request.body;
        const { status, user_id } = request_body.data;

        const getProData = await profilesModel.getProfileData(user_id)
        if (!getProData.status) return response.json({ status: false, message: getProData.message, data: [] });
        var updateData = { 'id': user_id, 'updated_at': moment(new Date()).format('YYYY-MM-DD hh:mm:00'), 'status': status }

        const updateProData = await profilesModel.updateProfilesData(updateData);
        if (!updateProData.status) return response.json({ status: false, message: updateProData.message, data: [] });
        var message = "Player un-blocked succsessfully."
        if (status == 0) message = "Player blocked succsessfully."
        return response.json({ status: true, message: message, data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}
