const isset = require("isset");
const config = require("../../config/config");
var randomstring = require("randomstring");
// All Controller
const moment = require('moment');
const { fileValidationFunction, encode, uploadMaterialToAWS, uploadExcelToAWS, sendEmailToUser, sendEmailToAdmin } = require('../../helper/common_functions');
const settingsModel = require('../../model/settings_model');
const curruntTime = moment(new Date()).format('YYYY-MM-DD hh:mm:00')
const readXlsxFile = require("read-excel-file/node");
const excelJS = require("exceljs");

module.exports.downloadAccountTypesData = async (request, response) => {
    try {

        const getAccountType = await settingsModel.getAllAccountTypeList()
        if (!getAccountType.status) return response.json({ status: false, message: getAccountType.message, data: [] });
        const accountTypeData = getAccountType.data
        // return response.json({ status: true, message: "Account Type list loaded succsessfully.", data: getAccountType.data });
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Account Types");

        worksheet.columns = [
            // { header: "S no.", key: "id" },
            { header: "Account Type Name", key: "account_type" },
            { header: "Description", key: "description" },
            { header: "Image", key: "icon" },
        ];
        accountTypeData.forEach((data) => { worksheet.addRow(data) });

        worksheet.getRow(1).eachCell((cell) => { cell.font = { bold: true } });
        response.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        response.setHeader("Content-Disposition", `attachment; filename=account_types.xlsx`);

        return workbook.xlsx.write(response).then(() => { response.status(200) });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

//Country
module.exports.addCountry = async (request, response) => {
    try {
        const request_body = request.body;
        const { name, country_code } = request_body.data;

        const getExistCountry = await settingsModel.checkCountryByName(name)
        if (!getExistCountry.status) return response.json({ status: false, message: getExistCountry.message, data: [] });
        if (getExistCountry.data) return response.json({ status: false, message: "Country already exists. Please try with different Country name.", data: [] });

        var newFileName = ""
        if (isset(request.files) && (request.files.file)) {
            var countryFlag = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(countryFlag, 'countryFlag/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        } else {
            return response.json({ status: false, message: "Please select valid country flag image.", data: [] });
        }


        var insertData = { 'name': name, 'country_code': (country_code) ? country_code : "", 'flag': newFileName, 'status': 1 }
        var addData = await settingsModel.insertCountryData(insertData);
        if (!addData.status) return response.json({ status: false, message: addData.message, data: [] });
        return response.json({ status: true, message: "Country added successfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.editCountry = async (request, response) => {
    try {

        const request_body = request.body;
        const { id, name, country_code, status } = request_body.data;

        const getCountryData = await settingsModel.getCountryById(id)
        if (!getCountryData.status) return response.json({ status: false, message: getCountryData.message, data: [] });
        if (getCountryData.data.name != name) {
            const getExistCountry = await settingsModel.checkCountryByName(name, id)
            if (!getExistCountry.status) return response.json({ status: false, message: getExistCountry.message, data: [] });
            if (getExistCountry.data) return response.json({ status: false, message: "Country already exists. Please try with different Country name.", data: [] });
        }

        var newFileName = ""
        if (isset(request.files) && (request.files.file)) {
            var countryFlag = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(countryFlag, 'countryFlag/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        }

        var updateData = {
            'id': id,
            'name': name,
            'flag': (newFileName) ? newFileName : getCountryData.data.flag,
            'country_code': (country_code) ? country_code : getCountryData.data.country_code,
            'status': status
        }
        var updateCountryData = await settingsModel.updateCountryData(updateData);
        if (!updateCountryData.status) return response.json({ status: false, message: updateCountryData.message, data: [] });

        return response.json({ status: true, message: "Country updated succsessfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getCountry = async (request, response) => {
    try {
        const getCountryData = await settingsModel.getAllCountry()
        if (!getCountryData.status) return response.json({ status: false, message: getCountryData.message, data: [] });
        const ciphertext = await encode(getCountryData);
        return response.json({ status: true, message: "Country get succsessfully.", data: ciphertext });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getCountryList = async (request, response) => {
    try {

        const request_body = request.body;
        const { page_no, search } = request_body.data;

        var pageNo = page_no ? page_no : 1;
        var searchData = search ? search : null;
        var limit = 10;
        var offset = ((pageNo - 1) * limit) > 0 ? (pageNo - 1) * limit : 0;
        var getAllData = { 'limit': limit, 'offset': offset, 'search': searchData }

        const getCountryData = await settingsModel.getAllCountry(getAllData)
        const getCountryCount = await settingsModel.getAllCountryCount(getAllData)
        if (!getCountryData.status) return response.json({ status: false, message: getCountryData.message, data: [] });
        if (!getCountryCount.status) return response.json({ status: false, message: getCountryCount.message, data: [] });
        const ciphertext = await encode(getCountryData);
        return response.json({ status: true, message: "Country get succsessfully.", count: getCountryCount.data, data: ciphertext });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

//Regions
module.exports.addRegions = async (request, response) => {
    try {
        const request_body = request.body;
        const { name, country_id } = request_body.data;

        const getCountryData = await settingsModel.getCountryById(country_id)
        if (!getCountryData.status) return response.json({ status: false, message: getCountryData.message, data: [] });

        const getExistRegions = await settingsModel.checkRegionsByName(name, country_id)
        if (!getExistRegions.status) return response.json({ status: false, message: getExistRegions.message, data: [] });
        if (getExistRegions.data) return response.json({ status: false, message: "Regions already exists. Please try with different Regions name.", data: [] });

        var insertData = { 'name': name, 'country_id': (country_id) ? country_id : "", 'status': 1 }
        var addData = await settingsModel.insertRegionsData(insertData);
        if (!addData.status) return response.json({ status: false, message: addData.message, data: [] });
        return response.json({ status: true, message: "Regions added successfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.editRegions = async (request, response) => {
    try {

        const request_body = request.body;
        const { id, name, country_id, status } = request_body.data;

        const getRegionsData = await settingsModel.getRegionsById(id)
        if (!getRegionsData.status) return response.json({ status: false, message: getRegionsData.message, data: [] });
        if (getRegionsData.data.name != name) {
            const getExistRegions = await settingsModel.checkRegionsByName(name, country_id)
            if (!getExistRegions.status) return response.json({ status: false, message: getExistRegions.message, data: [] });
            if (getExistRegions.data) return response.json({ status: false, message: "Regions already exists. Please try with different Regions name.", data: [] });
        }

        var updateData = { 'id': id, 'name': name, 'country_id': (country_id) ? country_id : getRegionsData.data.country_id, 'status': status }
        var updateRegionsData = await settingsModel.updateRegionsData(updateData);
        if (!updateRegionsData.status) return response.json({ status: false, message: updateRegionsData.message, data: [] });

        return response.json({ status: true, message: "Regions updated succsessfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getRegions = async (request, response) => {
    try {
        const { country_id } = request.params;
        if (!country_id) return response.json({ status: false, message: "Please provide valid country.", data: [] });
        const getRegionsData = await settingsModel.getAllRegions(country_id)
        if (!getRegionsData.status) return response.json({ status: false, message: getRegionsData.message, data: [] });
        const ciphertext = await encode(getRegionsData);
        return response.json({ status: true, message: "Regions get succsessfully.", data: ciphertext });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

//Avatar
module.exports.addAvatars = async (request, response) => {
    try {
        const request_body = request.body;
        const { name } = request_body.data;
        var newFileName = '';
        if (isset(request.files) && (request.files.file)) {
            var avatarImage = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(avatarImage, 'avatarImg/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        }

        var insertAvatarData = { 'name': name, 'avatar': newFileName, 'status': 1 }

        var addData = await settingsModel.insertAvatarData(insertAvatarData);
        if (!addData.status) return response.json({ status: false, message: addData.message, data: [] });

        return response.json({ status: true, message: "Avatar added successfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.deleteAvatars = async (request, response) => {
    try {

        const { id } = request.params;

        const getAvatarsData = await settingsModel.getAvatarById(id)
        if (!getAvatarsData.status) return response.json({ status: false, message: getAvatarsData.message, data: [] });

        var updateData = { 'id': id, 'status': 0 }
        const updateAvatarData = await settingsModel.updateAvatarData(updateData);
        if (!updateAvatarData.status) return response.json({ status: false, message: updateAvatarData.message, data: [] });

        return response.json({ status: true, message: "Avatar updated succsessfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getAvatars = async (request, response) => {
    try {

        const getAllAvatars = await settingsModel.getAllAvatars()
        if (!getAllAvatars.status) return response.json({ status: false, message: getAllAvatars.message, data: [] });
        const ciphertext = await encode(getAllAvatars.data);
        return response.json({ status: true, message: "Avatar get succsessfully.", data: ciphertext });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.addAccountType = async (request, response) => {
    try {

        const request_body = request.body;
        const { account_type, description } = request_body.data;
        var newFileName = "";

        const getExistAccountName = await settingsModel.getAccountTypeByName(account_type)

        if (!getExistAccountName.status) return response.json({ status: false, message: getExistAccountName.message, data: [] });
        if (getExistAccountName.isExist) return response.json({ status: false, message: "This Account name already exists. Please try with different name.", data: [] });

        if (isset(request.files) && (request.files.file)) {
            var accountImage = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(accountImage, 'accountTypeImg/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        }

        var insertCatData = {
            'account_type': account_type,
            'description': (description) ? description : "",
            'icon': newFileName,
            'status': 1,
            'create_at': curruntTime,
        }

        const addData = await settingsModel.insertAccountTypeData(insertCatData);
        if (!addData.status) return response.json({ status: false, message: addData.message, data: [] });

        return response.json({ status: true, message: "Account type added successfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.editAccountType = async (request, response) => {
    try {

        const request_body = request.body;
        const { id, account_type, description, status } = request_body.data;

        const getAccountTypeData = await settingsModel.getAccountTypeById(id)
        if (!getAccountTypeData.status) return response.json({ status: false, message: getAccountTypeData.message, data: [] });

        if (getAccountTypeData.data.account_type != account_type) {
            const getExistAccountName = await settingsModel.getAccountTypeByName(account_type)
            if (!getExistAccountName.status) return response.json({ status: false, message: getExistAccountName.message, data: [] });
            if (getExistAccountName.isExist) return response.json({ status: false, message: "This Account name already exists. Please try with different name.", data: [] });
        }

        if (status == 0) {
            const getCatByAccount = await settingsModel.getAllCategoriesByAccountID(id)
            if (!getCatByAccount.status) return response.json({ status: false, message: getCatByAccount.message, data: [] });
            if (getCatByAccount.data.length != 0) return response.json({ status: false, message: "This Account linked with categories. So you can not delete this account type.", data: [] });
        }

        var newFileName = "";
        if (isset(request.files) && (request.files.file)) {
            var accountImage = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(accountImage, 'accountTypeImg/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        }
        var updateCatData = {
            'id': id,
            'account_type': account_type,
            'description': (description) ? description : getAccountTypeData.data.description,
            'icon': (newFileName) ? newFileName : getAccountTypeData.data.icon,
            'updated_at': curruntTime,
            'status': status,
        }

        const updateData = await settingsModel.updateAccountTypeData(updateCatData);
        if (!updateData.status) return response.json({ status: false, message: updateData.message, data: [] });

        return response.json({ status: true, message: (status == 1) ? "Account Type updated succsessfully." : "Account Type deleted succsessfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getAllAccountType = async (request, response) => {
    try {

        const getAccountType = await settingsModel.getAllAccountTypeList()
        if (!getAccountType.status) return response.json({ status: false, message: getAccountType.message, data: [] });

        const ciphertext = await encode(getAccountType.data);
        return response.json({ status: true, message: "Account Type list loaded succsessfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getAllAccountTypeList = async (request, response) => {
    try {

        const request_body = request.body;
        const { page_no, search } = request_body.data;
        // console.log(request_body);
        var pageNo = page_no ? page_no : 1;
        var searchData = search ? search : null;
        var limit = 10;
        var offset = ((pageNo - 1) * limit) > 0 ? (pageNo - 1) * limit : 0;
        var getAllData = { 'limit': limit, 'offset': offset, 'search': searchData }

        const getAccountType = await settingsModel.getAllAccountTypeList(getAllData)
        const getAccountTypeCount = await settingsModel.getAllAccountTypeListCount(getAllData)
        if (!getAccountType.status) return response.json({ status: false, message: getAccountType.message, data: [] });
        if (!getAccountTypeCount.status) return response.json({ status: false, message: getAccountTypeCount.message, data: [] });

        const ciphertext = await encode(getAccountType.data);
        return response.json({ status: true, message: "Account Type list loaded succsessfully.", count: getAccountTypeCount.data, data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.setAccountType = async (request, response) => {
    try {

        const request_body = request.body;
        const { id, account_type, description, status } = request_body.data;
        if (!getAccountType.status) return response.json({ status: false, message: getAccountType.message, data: [] });

        const ciphertext = await encode(getAccountType.data);
        return response.json({ status: true, message: "Account Type list loaded succsessfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.downloadAccountTypesFile = async (request, response) => {
    try {
        const uploadPath = ROOT_TEMPLATE_PATH + '/sample-files/account-types-sample-file.xlsx';
        return response.download(uploadPath);
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}


module.exports.uploadXlsxFile = async (request, response) => {
    try {
        if (request.files == undefined) return response.json({ status: false, message: "Please upload an excel file!", data: [] });
        if (isset(request.files) && (request.files.file)) {
            var categoryFile = request.files.file;
            var fileName = categoryFile.name;
            var splitFileName = fileName.split(" ").join("-");
            var newFileName = splitFileName;

            const uploadPath = ROOT_TEMPLATE_PATH + 'trashFiles/' + newFileName;
            await categoryFile.mv(uploadPath, (request, response), (err) => {
                if (err) return response.json({ status: false, message: "Something is wrong while excel file.", data: [] });
            });

            var isValidData = { status: true }

            await readXlsxFile(uploadPath).then(async (accountTypeData) => {
                accountTypeData.shift();
                for (var i = 0; i < accountTypeData.length; i++) {
                    const getExistAccountName = await settingsModel.getAccountTypeByName(accountTypeData[i][0])
                    if (!getExistAccountName.status) {
                        isValidData = { 'status': false, 'message': getExistAccountName.message, 'data': [] }
                        break;
                    }
                    if (getExistAccountName.isExist) {
                        isValidData = { status: false, message: "Some account name already exists. Please try with different name.", data: [] }
                        break;
                    }
                }
            })
            if (!isValidData.status) return response.json(isValidData);


            await readXlsxFile(uploadPath).then(async (accountTypeData) => {
                accountTypeData.shift();
                for (var i = 0; i < accountTypeData.length; i++) {
                    var insertAccData = {
                        'account_type': accountTypeData[i][0],
                        'description': accountTypeData[i][1],
                        'icon': accountTypeData[i][2],
                        'status': 1,
                        'create_at': curruntTime,
                    }
                    const addData = await settingsModel.insertAccountTypeData(insertAccData);
                    if (!addData.status) {
                        isValidData = { status: false, message: addData.message, data: [] }
                        break;
                    }
                };
            })
            if (!isValidData.status) return response.json(isValidData);
            return response.json({ status: true, message: "Account type added successfully.", data: [] });
        }
        return response.json({ status: false, message: "Please upload an excel file!", data: [] });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

//Difficulty Level
module.exports.addDifficultyLevel = async (request, response) => {
    try {
        const request_body = request.body;
        const { name } = request_body.data;

        const getExistLevel = await settingsModel.checkDifficultyLevelByName(name)
        if (!getExistLevel.status) return response.json({ status: false, message: getExistLevel.message, data: [] });
        if (getExistLevel.isExist) return response.json({ status: false, message: "Difficulty level already exists. Please try with different name.", data: [] });

        var insertData = { 'name': name, 'status': 1 }
        var addData = await settingsModel.insertDifficultyLevelData(insertData);
        if (!addData.status) return response.json({ status: false, message: addData.message, data: [] });
        return response.json({ status: true, message: "Difficulty Level added successfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.editDifficultyLevel = async (request, response) => {
    try {

        const request_body = request.body;
        const { id, name, status } = request_body.data;

        const getLevelData = await settingsModel.getDifficultyLevelById(id)
        if (!getLevelData.status) return response.json({ status: false, message: getLevelData.message, data: [] });
        if (getLevelData.data.name != name) {
            const getExistLevel = await settingsModel.checkDifficultyLevelByName(name)
            if (!getExistLevel.status) return response.json({ status: false, message: getExistLevel.message, data: [] });
            if (getExistLevel.isExist) return response.json({ status: false, message: "Difficulty level already exists. Please try with different name.", data: [] });
        }

        var updateData = { 'id': id, 'name': name, 'status': status }
        var updateLevelData = await settingsModel.updateDifficultyLevelData(updateData);
        if (!updateLevelData.status) return response.json({ status: false, message: updateLevelData.message, data: [] });

        return response.json({ status: true, message: "Difficulty Level updated succsessfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getDifficultyLevel = async (request, response) => {
    try {
        const getData = await settingsModel.getAllDifficultyLevel()
        if (!getData.status) return response.json({ status: false, message: getData.message, data: [] });
        const ciphertext = await encode(getData.data);
        return response.json({ status: true, message: "Difficulty Level get succsessfully.", data: ciphertext });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getDashboardData = async (request, response) => {
    try {
        const getTotalCategories = await settingsModel.getTotalCategories()
        const getTotalTopics = await settingsModel.getTotalTopics()
        const getTotalQuestions = await settingsModel.getTotalQuestions()
        const getTotalAccountTypes = await settingsModel.getTotalAccountTypes()
        const getTotalPlayers = await settingsModel.getTotalPlayers()
        const getTotalContactUs = await settingsModel.getTotalUnreadMessage()
        const recordCount = {
            "categories": getTotalCategories.data,
            "topics": getTotalTopics.data,
            "questions": getTotalQuestions.data,
            "account_types": getTotalAccountTypes.data,
            "players": getTotalPlayers.data,
            "unread_message": getTotalContactUs.data,
        }

        const ciphertext = await encode(recordCount);
        return response.json({ status: true, message: "Record get succsessfully.", data: ciphertext });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}


module.exports.contactUs = async (request, response) => {
    try {
        const request_body = request.body;
        const { name, contact_no, email, message } = request_body.data;

        var insert_data = {
            'name': name,
            'contact_no': contact_no,
            'email': email,
            'message': message,
            'created_at': curruntTime,
            'status': 1,
        }


        // Insert
        const addData = await settingsModel.insertContactUSData(insert_data);
        if (!addData.status) return response.json({ status: false, message: addData.message });

        var sendMailData = {
            subject: 'Thanks for contacting Zleetz',
            email: email,
            username: name,
            context: { name: name },
            template: 'contact-us'
        }

        const sendMail = await sendEmailToUser(sendMailData)
        if (!sendMail.status) return response.json({ status: false, message: sendMail.message });

        var sendAdminMailData = {
            subject: 'User contacting to Zleetz',
            context: { 'name': name, 'contact_no': contact_no, 'email': email, 'message': message },
            template: 'admin-contact-us'
        }
        const sendMailAdmin = await sendEmailToAdmin(sendAdminMailData)
        if (!sendMailAdmin.status) return response.json({ status: false, message: sendMailAdmin.message });


        return response.json({ status: true, message: "Thanks for contacting us! We will be in touch with you shortly." });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}



module.exports.getAllContactUsList = async (request, response) => {
    try {

        const request_body = request.body;
        const { page_no, search } = request_body.data;

        var pageNo = page_no ? page_no : 1;
        var limit = 10;
        var offset = ((pageNo - 1) * limit) > 0 ? (pageNo - 1) * limit : 0;
        var getAllData = { 'limit': limit, 'offset': offset }

        const getTotalContactUs = await settingsModel.getTotalUnreadMessage()
        const getDetail = await settingsModel.getAllContactUsList(getAllData);
        const getCount = await settingsModel.getAllContactUsCount();
        if (!getDetail.status) return response.json({ status: false, message: getDetail.message, data: [] });
        if (!getCount.status) return response.json({ status: false, message: getCount.message, data: [] });

        const ciphertext = await encode(getDetail.data);
        return response.json({ status: true, message: "Contact loaded successfully.", count: getCount.data, unread_message: getTotalContactUs.data, data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.readContactUs = async (request, response) => {
    try {
        const { id } = request.params;
        if (!id) return response.json({ status: false, message: "Please select valid data.", data: [] });

        const updateContactUSData = await settingsModel.updateContactUSData({ 'id': id, 'is_read': 1 });
        if (!updateContactUSData.status) return response.json({ status: false, message: updateContactUSData.message, data: [] });
        return response.json({ status: true, message: "read successfully.", data: [] });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}
