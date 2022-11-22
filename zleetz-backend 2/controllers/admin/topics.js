const config = require("../../config/config");
const JWTSecretKey = config.jwtsecretkey;
const jwt = require('jsonwebtoken');
const isset = require('isset')
const moment = require('moment');
const randomstring = require("randomstring");

// All Controller
const { encode, uploadMaterialToAWS } = require('../../helper/common_functions');
const topicsModel = require('../../model/topics_model');
const settingsModel = require('../../model/settings_model');
const categoriesModel = require('../../model/categories_model');
const questionnairesModel = require('../../model/questionnaires_model');
const tokensModel = require('../../model/tokens_model');
const readXlsxFile = require("read-excel-file/node");
const curruntTime = moment(new Date()).format('YYYY-MM-DD hh:mm:00')

const excelJS = require("exceljs");

module.exports.downloadTopicsData = async (request, response) => {
    try {


        const getTopicDetail = await topicsModel.getAllTopicData();
        if (!getTopicDetail.status) return response.json({ status: false, message: getTopicDetail.message, data: [] });

        const topicData = getTopicDetail.data;
        for (var i = 0; i < topicData.length; i++) {
            var id = topicData[i].id
            const getTopicCategories = await topicsModel.getTopicCategoriesList(id);
            if (!getTopicCategories.status) return response.json({ status: false, message: getTopicCategories.message, data: [] });

            topicData[i].topic_categories = getTopicCategories.data
            if (topicData[i].regional_relevance == "Local") {
                const getTopicCountry = await topicsModel.getTopicCountryList(id);
                if (!getTopicCountry.status) return response.json({ status: false, message: getTopicCountry.message, data: [] });
                topicData[i].topic_countries_relevance = getTopicCountry.data
            }
        }

        // return response.json({ status: true, message: "Topic loaded successfully.", data: topicData });
        // return response.json({ status: true, message: "Account Type list loaded succsessfully.", data: getAccountType.data });
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Topics");

        worksheet.columns = [
            // { header: "S no.", key: "id" },
            { header: "Topic Name", key: "name" },
            { header: "Description", key: "description" },
            { header: "Access", key: "access" },
            { header: "Access Code", key: "access_code" },
            { header: "Regional Relevance", key: "regional_relevance" },
            { header: "Game Mode", key: "game_mode" },
            { header: "Match Format", key: "match_format" },
            { header: "No Of Que", key: "number_of_questions" },
            { header: "Time For Que", key: "time_for_question" },
            { header: "Color Code", key: "color_code" },
            { header: "Categories", key: "topic_categories" },
            { header: "Search Tags", key: "search_tags" },
            { header: "Countries", key: "topic_countries_relevance" },
            { header: "image", key: "icon" },
        ];

        topicData.forEach((data) => { worksheet.addRow(data) });

        worksheet.getRow(1).eachCell((cell) => { cell.font = { bold: true } });
        response.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        response.setHeader("Content-Disposition", `attachment; filename=topics.xlsx`);

        return workbook.xlsx.write(response).then(() => { response.status(200) });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.addTopics = async (request, response) => {
    try {
        const request_body = request.body;
        const requestedData = request_body.data;
        const categoriesList = JSON.parse(requestedData.categories);
        const searchTags = JSON.parse(requestedData.search_tags);

        if (requestedData.regional_relevance == 'Local')
            if (!requestedData.countries || JSON.parse(requestedData.countries).length <= 0)
                return response.json({ status: false, message: "Please select countries.", data: [] });

        if (searchTags.length <= 0)
            return response.json({ status: false, message: "Please add valid search tag.", data: [] });

        if (categoriesList.length <= 0)
            return response.json({ status: false, message: "Please select valid categories.", data: [] });

        if (requestedData.access == 'Close' && requestedData.access_code == '')
            return response.json({ status: false, message: "Please add valid access code.", data: [] });

        const getTopicByName = await topicsModel.checkTopicName(requestedData.name);
        if (!getTopicByName.status) return response.json({ status: false, message: getTopicByName.message, data: [] });
        if (getTopicByName.isExist) return response.json({ status: false, message: "Topic name is already exists. Please try with different name.", data: [] });

        //Get Default Fees And Rewards
        const getFeesNRewards = await tokensModel.getDefaultMatchFeesAndRewards()
        if (!getFeesNRewards.status) return response.json({ status: false, message: getFeesNRewards.message, data: [] });
        const feesNRewardData = getFeesNRewards.data
        if (feesNRewardData.length < 0) return response.json({ status: false, message: 'There have not added default match fees & rewards.Please add first', data: [] });

        var newFileName = "";
        if (isset(request.files) && (request.files.file)) {
            var topicImage = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(topicImage, 'topicImg/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        } else {
            return response.json({ status: false, message: "Please select valid topic image.", data: [] });
        }


        const insertData = {
            'name': requestedData.name,
            'description': requestedData.description,
            'access': requestedData.access,
            'regional_relevance': requestedData.regional_relevance,
            'color_code': requestedData.color_code,
            'search_tags': requestedData.search_tags,
            'game_mode': requestedData.game_mode,
            'match_format': requestedData.match_format,
            'number_of_questions': requestedData.number_of_questions,
            'time_for_question': requestedData.time_for_question,
            'allow_bot': requestedData.allow_bot,
            'access_code': (requestedData.access_code) ? requestedData.access_code : null,
            'icon': newFileName,
            'status': 1,
            'created_by': request_body.id,
        }

        var addData = await topicsModel.insertTopicData(insertData);
        if (!addData.status) return response.json({ status: false, message: addData.message, data: [] });

        const topicID = addData.data.insertId;

        //Add Default Fees And Rewards
        var isValidData = { status: true }
        for (var i = 0; i < feesNRewardData.length; i++) {
            var insertFees = {
                'topic_id': topicID,
                'options': feesNRewardData[i].options,
                'entry_fee': feesNRewardData[i].entry_fee,
                'win_reward': feesNRewardData[i].win_reward,
                'percentage': feesNRewardData[i].percentage,
                'color_code': feesNRewardData[i].color_code,
                'icon': feesNRewardData[i].icon,
                'game_mode': feesNRewardData[i].game_mode,
                'unit': feesNRewardData[i].unit,
                'status': 1,
                'created_at': curruntTime,
            }
            var addFeeData = await tokensModel.addTrainingMatchFeesAndRewards(insertFees);
            if (!addFeeData.status) {
                isValidData = { status: false, message: addFeeData.message, data: [] };
                break;
            }
        }
        if (!isValidData.status) { return response.json(isValidData); }
        const insertCategoryData = []
        await categoriesList.map((category) => {
            insertCategoryData.push([topicID, category])
        });

        const addTopicCatData = await topicsModel.insertTopicCategoryData(insertCategoryData);
        if (!addTopicCatData.status) return response.json({ status: false, message: addTopicCatData.message, data: [] });

        if (requestedData.countries && JSON.parse(requestedData.countries).length > 0) {
            const countriesList = JSON.parse(requestedData.countries);
            var insertCountriesData = []
            await countriesList.map((countries) => {
                insertCountriesData.push([topicID, countries, 1])
            });
            const addTopicCountriesData = await topicsModel.insertTopicCountriesData(insertCountriesData);
            if (!addTopicCountriesData.status) return response.json({ status: false, message: addTopicCountriesData.message, data: [] });
        }

        return response.json({ status: true, message: "Topic added successfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.editTopics = async (request, response) => {
    try {
        const request_body = request.body;
        const requestedData = request_body.data;
        const categoriesList = JSON.parse(requestedData.categories);
        const searchTags = JSON.parse(requestedData.search_tags);

        const topicID = requestedData.id

        const getTopicDetail = await topicsModel.getTopicById(topicID);
        if (!getTopicDetail.status) return response.json({ status: false, message: getTopicDetail.message, data: [] });

        if (getTopicDetail.data.name != requestedData.name) {
            const getTopicByName = await topicsModel.checkTopicName(requestedData.name);
            if (!getTopicByName.status) return response.json({ status: false, message: getTopicByName.message, data: [] });
            if (getTopicByName.isExist) return response.json({ status: false, message: "Topic name is already exists. Please try with different name.", data: [] });
        }

        if (requestedData.regional_relevance == 'Local')
            if (!requestedData.countries || JSON.parse(requestedData.countries).length <= 0)
                return response.json({ status: false, message: "Please select countries.", data: [] });

        if (searchTags.length <= 0)
            return response.json({ status: false, message: "Please add valid search tag.", data: [] });

        if (categoriesList.length <= 0)
            return response.json({ status: false, message: "Please select valid categories.", data: [] });

        if (requestedData.access == 'Close' && requestedData.access_code == '')
            return response.json({ status: false, message: "Please add valid access code.", data: [] });

        var newFileName = "";
        if (isset(request.files) && (request.files.file)) {
            var topicImage = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(topicImage, 'topicImg/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        }


        const updateData = {
            'id': topicID,
            'name': requestedData.name,
            'description': requestedData.description,
            'access': requestedData.access,
            'regional_relevance': requestedData.regional_relevance,
            'color_code': requestedData.color_code,
            'game_mode': requestedData.game_mode,
            'match_format': requestedData.match_format,
            'number_of_questions': requestedData.number_of_questions,
            'time_for_question': requestedData.time_for_question,
            'allow_bot': requestedData.allow_bot,
            'access_code': (requestedData.access_code) ? requestedData.access_code : null,
            'search_tags': requestedData.search_tags,
            'icon': (newFileName) ? newFileName : getTopicDetail.data.icon,
            'status': 1,
            'created_by': request_body.id,
            'updated_at': curruntTime
        }

        var editData = await topicsModel.updateTopicData(updateData);
        if (!editData.status) return response.json({ status: false, message: editData.message, data: [] });

        // const topicID = addData.data.insertId;
        const insertCategoryData = []
        await categoriesList.map((category) => {
            insertCategoryData.push([topicID, category])
        });

        const updateTopicCatData = await topicsModel.updateTopicCategoryData(topicID);
        if (!updateTopicCatData.status) return response.json({ status: false, message: updateTopicCatData.message, data: [] });
        const addTopicCatData = await topicsModel.insertTopicCategoryData(insertCategoryData);
        if (!addTopicCatData.status) return response.json({ status: false, message: addTopicCatData.message, data: [] });

        if (requestedData.countries && requestedData.countries.length > 0) {
            const countriesList = JSON.parse(requestedData.countries);

            var insertCountriesData = []
            await countriesList.map((countries) => {
                insertCountriesData.push([topicID, countries, 1])
            });

            const updateTopicCountriesData = await topicsModel.updateTopicCountriesData(topicID);
            if (!updateTopicCountriesData.status) return response.json({ status: false, message: updateTopicCountriesData.message, data: [] });

            const addTopicCountriesData = await topicsModel.insertTopicCountriesData(insertCountriesData);
            if (!addTopicCountriesData.status) return response.json({ status: false, message: addTopicCountriesData.message, data: [] });
        }

        return response.json({ status: true, message: "Topic updated successfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getAllTopics = async (request, response) => {
    try {


        const request_body = request.body;
        const { countries, page_no, search, access, regional_relevance, category_id } = request_body.data;
        const countriesList = (countries && countries.length > 0) ? JSON.parse(countries) : [];
        var offset = 0;
        var limit = 0;
        if (page_no) {
            limit = 10;
            offset = ((page_no - 1) * limit) > 0 ? (page_no - 1) * limit : 0;
        }
        // const filterData = { 'limit': limit, 'offset': offset, 'searchData': searchData, 'access': access, 'regional_relevance': regional_relevance, 'countries': countriesList }
        const filterData = { 'limit': limit, 'offset': offset, 'access': access, 'regional_relevance': regional_relevance, 'countries': countriesList, 'category_id': category_id, 'search': search, }

        const getTopicDetail = await topicsModel.getAllTopicList(filterData);
        const getTopicDetailCount = await topicsModel.getAllTopicListCount(filterData);
        if (!getTopicDetail.status) return response.json({ status: false, message: getTopicDetail.message, data: [] });
        if (!getTopicDetailCount.status) return response.json({ status: false, message: getTopicDetailCount.message, data: [] });

        const ciphertext = await encode(getTopicDetail.data);
        return response.json({ status: true, message: "Topic loaded successfully.", count: getTopicDetailCount.data, data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getTopicsList = async (request, response) => {
    try {
        const request_body = request.body;
        const getTopicDetail = await topicsModel.getTopicListByPopularity();
        if (!getTopicDetail.status) return response.json({ status: false, message: getTopicDetail.message, data: [] });

        const ciphertext = await encode(getTopicDetail.data);
        return response.json({ status: true, message: "Topic loaded successfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getAllTopicsByCategories = async (request, response) => {
    try {

        const { id } = request.params;
        const request_body = request.body;
        const userID = request_body.id


        const getTopicDetail = await topicsModel.getAllTopicListByCategories(id, userID);
        if (!getTopicDetail.status) return response.json({ status: false, message: getTopicDetail.message, data: [] });

        const ciphertext = await encode(getTopicDetail.data);
        return response.json({ status: true, message: "Topic loaded successfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getAllTopicsList = async (request, response) => {
    try {
        const getTopicDetail = await topicsModel.getTopicList();
        if (!getTopicDetail.status) return response.json({ status: false, message: getTopicDetail.message, data: [] });
        const ciphertext = await encode(getTopicDetail.data);
        return response.json({ status: true, message: "Topic loaded successfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.viewTopicsDetail = async (request, response) => {
    try {
        const { id } = request.params;

        const getTopicDetail = await topicsModel.getTopicById(id);
        if (!getTopicDetail.status) return response.json({ status: false, message: getTopicDetail.message, data: [] });

        const getTopicCategories = await topicsModel.getTopicCategories(id);
        if (!getTopicCategories.status) return response.json({ status: false, message: getTopicCategories.message, data: [] });
        const getTopicData = getTopicDetail.data
        getTopicData.topic_categories = getTopicCategories.data
        if (getTopicData.regional_relevance == "Local") {
            const getTopicCountry = await topicsModel.getTopicCountry(id);
            if (!getTopicCountry.status) return response.json({ status: false, message: getTopicCountry.message, data: [] });
            getTopicData.topic_countries_relevance = getTopicCountry.data

        }
        const ciphertext = await encode(getTopicData);
        return response.json({ status: true, message: "Topic loaded successfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.deleteTopicsDetail = async (request, response) => {
    try {
        const { id } = request.params;

        const getTopicDetail = await topicsModel.getTopicById(id);
        if (!getTopicDetail.status) return response.json({ status: false, message: getTopicDetail.message, data: [] });

        const getQueTopic = await questionnairesModel.getQuestionByTopicID(id);
        if (!getQueTopic.status) return response.json({ status: false, message: getQueTopic.message, data: [] });
        if (getQueTopic.data && getQueTopic.data.length > 0) return response.json({ status: false, message: "You are not able to this topic.", data: [] });

        const updateData = { 'id': id, 'status': 0, 'updated_at': curruntTime }

        var editData = await topicsModel.updateTopicData(updateData);
        if (!editData.status) return response.json({ status: false, message: editData.message, data: [] });

        return response.json({ status: true, message: "Topic deleted successfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.downloadTopicsSampleFile = async (request, response) => {
    try {
        const uploadPath = ROOT_TEMPLATE_PATH + '/sample-files/topics-sample-file.xlsx';
        return response.download(uploadPath);
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.uploadXlsxFile = async (request, response) => {
    try {
        const request_body = request.body;
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

            //Get Default Fees And Rewards
            const getFeesNRewards = await tokensModel.getDefaultMatchFeesAndRewards()
            if (!getFeesNRewards.status) return response.json({ status: false, message: getFeesNRewards.message, data: [] });
            const feesNRewardData = getFeesNRewards.data
            if (feesNRewardData.length < 0) return response.json({ status: false, message: 'There have not added default match fees & rewards.Please add first', data: [] });

            var isValidData = { status: true }

            await readXlsxFile(uploadPath).then(async (topicsData) => {
                topicsData.shift();
                for (var i = 0; i < topicsData.length; i++) {
                    var insertCatIDs = []
                    var insertCountryIDs = []
                    var searchTags = []
                    var insertSearchTag = []

                    let insertCouIDs = []
                    const getTopicByName = await topicsModel.checkTopicName(topicsData[i][0]);
                    if (!getTopicByName.status) {
                        isValidData = { status: false, message: getTopicByName.message, data: [] }
                        break;
                    }
                    if (getTopicByName.isExist) {
                        isValidData = { status: false, message: "Topic name is already exists. Please try with different name.", data: [] }
                        break;
                    }

                    if (topicsData[i][4] == 'Local') {
                        var countryList = topicsData[i][12].split(';');
                        if (!countryList || countryList.length <= 0) {
                            isValidData = { status: false, message: "Please select countries.", data: [] }
                        }
                        for (var j = 0; j < countryList.length; j++) {
                            const isExistCountry = await settingsModel.getCountryByIdName(countryList[j]);
                            if (!isExistCountry.isExist) {
                                isValidData = { status: false, message: "Something is wrong while upload topic countries.", data: [] }
                                break;
                            }
                            insertCountryIDs.push(isExistCountry.data.id)
                        }
                        if (!isValidData.status) {
                            isValidData = isValidData
                            break;
                        }
                    }
                    // insertCountryIDs
                    searchTags = topicsData[i][11].split(';');
                    if (!searchTags || searchTags.length <= 0) {
                        isValidData = { status: false, message: "Please select valid searchtags.", data: [] }
                        break;
                    }

                    for (var s = 0; s < searchTags.length; s++) {
                        insertSearchTag.push('"' + searchTags[s] + '"')
                    }

                    if (topicsData[i][2] == 'Close' && topicsData[i][3] == '') {
                        isValidData = { status: false, message: "Please add valid access code if topic access is close.", data: [] }
                        break;
                    }

                    var categoryList = topicsData[i][10].split(';');
                    if (!categoryList || categoryList.length <= 0) {
                        isValidData = { status: false, message: "Please select category.", data: [] }
                    }
                    for (var k = 0; k < categoryList.length; k++) {
                        const isExistCategory = await categoriesModel.getCategoryByTitle(categoryList[k]);
                        if (!isExistCategory.status) {
                            isValidData = { status: false, message: "Something is wrong while upload topic categories.", data: [] }
                            break;
                        }
                        if (!isExistCategory.isExist) {
                            isValidData = { status: false, message: "Something categories not in the list.Please upload with proper data.", data: [] }
                            break;
                        }
                        insertCatIDs.push(isExistCategory.data.id)
                    }
                    if (!isValidData.status) {
                        isValidData = isValidData
                        break;
                    }
                }
            })

            if (!isValidData.status) { return response.json(isValidData); }

            await readXlsxFile(uploadPath).then(async (topicsData) => {
                topicsData.shift();
                for (var i = 0; i < topicsData.length; i++) {
                    var insertCatIDs = []
                    var insertCountryIDs = []
                    var searchTags = []
                    var insertSearchTag = []

                    let insertCouIDs = []
                    const getTopicByName = await topicsModel.checkTopicName(topicsData[i][0]);

                    if (topicsData[i][4] == 'Local') {
                        var countryList = topicsData[i][12].split(';');

                        for (var j = 0; j < countryList.length; j++) {
                            const isExistCountry = await settingsModel.getCountryByIdName(countryList[j]);
                            insertCountryIDs.push(isExistCountry.data.id)
                        }
                    }
                    searchTags = topicsData[i][11].split(';');

                    for (var s = 0; s < searchTags.length; s++) {
                        insertSearchTag.push('"' + searchTags[s] + '"')
                    }

                    var categoryList = topicsData[i][10].split(';');

                    for (var k = 0; k < categoryList.length; k++) {
                        const isExistCategory = await categoriesModel.getCategoryByTitle(categoryList[k]);
                        insertCatIDs.push(isExistCategory.data.id)
                    }

                    const insertData = {
                        'name': topicsData[i][0],
                        'description': topicsData[i][1],
                        'access': topicsData[i][2],
                        'regional_relevance': topicsData[i][4],
                        'color_code': topicsData[i][9],
                        'search_tags': '[' + insertSearchTag + ']',
                        'game_mode': topicsData[i][5],
                        'match_format': topicsData[i][6],
                        'number_of_questions': topicsData[i][7],
                        'time_for_question': topicsData[i][8],
                        'access_code': (topicsData[i][3]) ? topicsData[i][3] : null,
                        'icon': topicsData[i][13],
                        'status': 1,
                        'created_by': request_body.id,
                    }

                    var addData = await topicsModel.insertTopicData(insertData);
                    if (!addData.status) {
                        isValidData = { status: false, message: addData.message, data: [] }
                        break;
                    }

                    const topicID = addData.data.insertId;

                    //Add Default Fees And Rewards

                    for (var f = 0; f < feesNRewardData.length; f++) {
                        var insertFees = {
                            'topic_id': topicID,
                            'options': feesNRewardData[f].options,
                            'entry_fee': feesNRewardData[f].entry_fee,
                            'percentage': feesNRewardData[f].percentage,
                            'win_reward': feesNRewardData[f].win_reward,
                            'color_code': feesNRewardData[f].color_code,
                            'icon': feesNRewardData[f].icon,
                            'game_mode': feesNRewardData[f].game_mode,
                            'unit': feesNRewardData[f].unit,
                            'status': 1,
                            'created_at': curruntTime,
                        }
                        var addFeeData = await tokensModel.addTrainingMatchFeesAndRewards(insertFees);
                        if (!addFeeData.status) {
                            isValidData = { status: false, message: addFeeData.message, data: [] };
                            break;
                        }
                    }
                    if (!isValidData.status) {
                        isValidData = isValidData
                        break;
                    }

                    const insertCategoryData = []
                    await insertCatIDs.map((category) => {
                        insertCategoryData.push([topicID, category])
                    });

                    const addTopicCatData = await topicsModel.insertTopicCategoryData(insertCategoryData);
                    if (!addTopicCatData.status) {
                        isValidData = { status: false, message: addTopicCatData.message, data: [] }
                        break;
                    }

                    if (topicsData[i][4] == 'Local' && insertCountryIDs.length > 0) {
                        var insertCountriesData = []
                        await insertCountryIDs.map((countries) => {
                            insertCountriesData.push([topicID, countries, 1])
                        });
                        const addTopicCountriesData = await topicsModel.insertTopicCountriesData(insertCountriesData);
                        if (!addTopicCountriesData.status) {
                            isValidData = { status: false, message: addTopicCountriesData.message, data: [] }
                            break;
                        }
                    }
                }
            })


            if (!isValidData.status) { return response.json(isValidData); }


            return response.json({ status: true, message: "Topic added successfully.", data: [] });
        }
        return response.json({ status: false, message: "Please upload an excel file!", data: [] });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}
