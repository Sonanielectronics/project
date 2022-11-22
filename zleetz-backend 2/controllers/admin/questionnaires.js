const isset = require('isset')
const moment = require('moment');
const randomstring = require("randomstring");

// All Controller
const { encode, uploadMaterialToAWS } = require('../../helper/common_functions');
const questionnairesModel = require('../../model/questionnaires_model');
const topicsModel = require('../../model/topics_model');
const settingsModel = require('../../model/settings_model');
const curruntTime = moment(new Date()).format('YYYY-MM-DD hh:mm:00')
const readXlsxFile = require("read-excel-file/node");

const excelJS = require("exceljs");

module.exports.downloadQuestionnairesData = async (request, response) => {
    try {

        const getAllQuestion = await questionnairesModel.getAllQuestionList()
        if (!getAllQuestion.status) return response.json({ status: false, message: getAllQuestion.message, data: [] });
        const getAllQuestionData = getAllQuestion.data

        // return response.json({ status: true, message: "Account Type list loaded succsessfully.", data: getAccountType.data });
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Questions List");

        worksheet.columns = [
            // { header: "S no.", key: "id" },
            { header: "Question", key: "question" },
            { header: "Correct Answer", key: "correct_answer" },
            { header: "Wrong Answer 1", key: "wrong_answer_1" },
            { header: "Wrong Answer 2", key: "wrong_answer_2" },
            { header: "Wrong Answer 3", key: "wrong_answer_3" },
            { header: "Difficulty Level", key: "difficulty_levels" },
            { header: "Time For Que", key: "time_for_question" },
            { header: "Time For Ans", key: "time_for_answer" },
            { header: "Topics", key: "topics" },
            { header: "Allow Image?", key: "allow_image" },
            { header: "Image", key: "image" },

        ];
        getAllQuestionData.forEach((data) => { worksheet.addRow(data) });

        worksheet.getRow(1).eachCell((cell) => { cell.font = { bold: true } });
        response.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        response.setHeader("Content-Disposition", `attachment; filename=questionnaires_data.xlsx`);

        return workbook.xlsx.write(response).then(() => { response.status(200) });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.addQuestions = async (request, response) => {
    try {

        const request_body = request.body;
        const postData = request_body.data;
        var newFileName = "";

        const topicsList = JSON.parse(postData.topics);

        if (topicsList.length <= 0)
            return response.json({ status: false, message: "Please select valid topics.", data: [] });

        const getExistQuestion = await questionnairesModel.getQuestionsByQue(postData.question, postData.correct_answer)

        if (!getExistQuestion.status) return response.json({ status: false, message: getExistQuestion.message, data: [] });
        if (getExistQuestion.data) return response.json({ status: false, message: "This question already exists. Please try with different question.", data: [] });


        // if (postData.regional_relevance == 'Local')
        //     if (!postData.countries || postData.countries.length <= 0)
        //         return response.json({ status: false, message: "Please select countries.", data: [] });


        if (isset(request.files) && (request.files.file)) {
            var questionImage = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(questionImage, 'questionnairesImg/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        }

        const insertData = {
            'question': postData.question,
            'correct_answer': postData.correct_answer,
            'wrong_answer_1': postData.wrong_answer_1,
            'wrong_answer_2': postData.wrong_answer_2,
            'wrong_answer_3': postData.wrong_answer_3,
            'difficulty_level_id': postData.difficulty_level_id,
            // 'regional_relevance': postData.regional_relevance,
            'time_for_question': postData.time_for_question,
            'time_for_answer': postData.time_for_answer,
            'total_time': (postData.time_for_answer + postData.time_for_question),
            'is_question_image': postData.is_question_image,
            'question_image': newFileName,
            'status': 1,
            'created_by': request_body.id,
        }

        const addData = await questionnairesModel.insertQuestionData(insertData);
        if (!addData.status) return response.json({ status: false, message: addData.message, data: [] });

        const questionID = addData.data.insertId;


        // if (postData.regional_relevance == 'Local') {
        //     const countriesList = JSON.parse(postData.countries);
        //     const insertCountryData = []
        //     await countriesList.map((countries) => {
        //         insertCountryData.push([questionID, countries])
        //     });

        //     const addQueCountriesData = await questionnairesModel.insertQuestionCountryData(insertCountryData);
        //     if (!addQueCountriesData.status) return response.json({ status: false, message: addQueCountriesData.message, data: [] });
        // }

        const insertQueTopicData = []
        await topicsList.map((topic_id) => {
            insertQueTopicData.push([questionID, topic_id])
        });

        const addQueTopicData = await questionnairesModel.insertQuestionTopicData(insertQueTopicData);
        if (!addQueTopicData.status) return response.json({ status: false, message: addQueTopicData.message, data: [] });

        return response.json({ status: true, message: "Question added successfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.editQuestions = async (request, response) => {
    try {

        const request_body = request.body;
        const postData = request_body.data;

        const topicsList = JSON.parse(postData.topics);
        if (topicsList.length <= 0)
            return response.json({ status: false, message: "Please select valid topics.", data: [] });

        const getQuestionData = await questionnairesModel.getQuestionById(postData.id)
        if (!getQuestionData.status) return response.json({ status: false, message: getQuestionData.message, data: [] });

        if (getQuestionData.data.question != postData.question) {
            const getExistQuestion = await questionnairesModel.getQuestionsByQue(postData.question, postData.correct_answer)
            if (!getExistQuestion.status) return response.json({ status: false, message: getExistQuestion.message, data: [] });
            if (getExistQuestion.data) return response.json({ status: false, message: "This question already exists. Please try with different question.", data: [] });
        }
        // if (postData.regional_relevance == 'Local')

        //     if (!postData.countries || postData.countries.length <= 0)
        //         return response.json({ status: false, message: "Please select countries.", data: [] });


        var newFileName = "";
        if (isset(request.files) && (request.files.file)) {
            var questionImage = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(questionImage, 'questionnairesImg/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        }

        const updateQueData = {
            'id': postData.id,
            'question': postData.question,
            'correct_answer': postData.correct_answer,
            'wrong_answer_1': postData.wrong_answer_1,
            'wrong_answer_2': postData.wrong_answer_2,
            'wrong_answer_3': postData.wrong_answer_3,
            'difficulty_level_id': postData.difficulty_level_id,
            // 'regional_relevance': postData.regional_relevance,
            'time_for_question': postData.time_for_question,
            'time_for_answer': postData.time_for_answer,
            'is_question_image': postData.is_question_image,
            'question_image': (newFileName) ? newFileName : getQuestionData.data.question_image,
            'status': 1,
            'created_by': request_body.id,
            'updated_at': moment(new Date()).format('YYYY-MM-DD hh:mm:00'),
        }

        const updateData = await questionnairesModel.updateQuestionData(updateQueData);
        if (!updateData.status) return response.json({ status: false, message: updateData.message, data: [] });

        const questionID = postData.id;

        // if (postData.regional_relevance == 'Local') {
        //     const countriesList = JSON.parse(postData.countries);
        //     const insertCountryData = []
        //     await countriesList.map((regions) => {
        //         insertCountryData.push([questionID, regions])
        //     });

        //     const updateQueCountryData = await questionnairesModel.updateQueCountryData(questionID);
        //     if (!updateQueCountryData.status) return response.json({ status: false, message: updateQueCountryData.message, data: [] });
        //     const addQueCountriesData = await questionnairesModel.insertQuestionCountryData(insertCountryData);
        //     if (!addQueCountriesData.status) return response.json({ status: false, message: addQueCountriesData.message, data: [] });
        // }

        const insertQueTopicData = []
        await topicsList.map((topic_id) => {
            insertQueTopicData.push([questionID, topic_id])
        });

        const updateQueTopicData = await questionnairesModel.updateQueTopicData(questionID);
        if (!updateQueTopicData.status) return response.json({ status: false, message: updateQueTopicData.message, data: [] });
        const addQueTopicData = await questionnairesModel.insertQuestionTopicData(insertQueTopicData);
        if (!addQueTopicData.status) return response.json({ status: false, message: addQueTopicData.message, data: [] });


        return response.json({ status: true, message: "Question updated succsessfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getAllQuestions = async (request, response) => {
    try {

        const request_body = request.body;
        const { page_no, search, topic_id } = request_body.data;

        var pageNo = page_no ? page_no : 1;
        var searchData = search ? search : null;
        var limit = 10;
        var offset = ((pageNo - 1) * limit) > 0 ? (pageNo - 1) * limit : 0;
        var getAllData = { 'limit': limit, 'offset': offset, 'search': searchData, 'topic_id': topic_id }

        const getQuestionDetail = await questionnairesModel.getAllQuestionsList(getAllData);
        const getQuestionCount = await questionnairesModel.getAllQuestionsCount(getAllData);
        if (!getQuestionCount.status) return response.json({ status: false, message: getQuestionCount.message, data: [] });
        if (!getQuestionDetail.status) return response.json({ status: false, message: getQuestionDetail.message, data: [] });


        const ciphertext = await encode(getQuestionDetail.data);
        return response.json({ status: true, message: "Questions loaded successfully.", count: getQuestionCount.data, data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.deleteQuestions = async (request, response) => {
    try {
        const { id } = request.params;

        const getQuestionsData = await questionnairesModel.getQuestionById(id)
        if (!getQuestionsData.status) return response.json({ status: false, message: getQuestionsData.message, data: [] });
        var updateData = { 'id': id, 'updated_at': moment(new Date()).format('YYYY-MM-DD hh:mm:00'), 'status': 0, }

        const updateQueData = await questionnairesModel.updateQuestionData(updateData);
        if (!updateQueData.status) return response.json({ status: false, message: updateQueData.message, data: [] });

        return response.json({ status: true, message: "Question delete succsessfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.viewQuestions = async (request, response) => {
    try {

        const { id } = request.params;
        const getQuestionsData = await questionnairesModel.getQuestionById(id)
        if (!getQuestionsData.status) return response.json({ status: false, message: getQuestionsData.message, data: [] });
        const getQuestionsDetail = getQuestionsData.data

        const getQueTopic = await questionnairesModel.getQuestionTopic(id);
        if (!getQueTopic.status) return response.json({ status: false, message: getQueTopic.message, data: [] });
        getQuestionsDetail.question_topics = getQueTopic.data


        // if (getQuestionsDetail.regional_relevance == "Local") {
        //     const getQueCountry = await questionnairesModel.getQuestionCountry(id);
        //     if (!getQueCountry.status) return response.json({ status: false, message: getQueCountry.message, data: [] });
        //     getQuestionsDetail.question_countries_relevance = getQueCountry.data
        // }

        const getGamelevel = await settingsModel.getDifficultyLevelById(getQuestionsDetail.difficulty_level_id);
        if (!getGamelevel.status) return response.json({ status: false, message: getGamelevel.message, data: [] });
        getQuestionsDetail.difficulty_level = getGamelevel.data

        const ciphertext = await encode(getQuestionsDetail);
        return response.json({ status: true, message: "Questions get succsessfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}


module.exports.downloadQuestionnairesFile = async (request, response) => {
    try {
        const uploadPath = ROOT_TEMPLATE_PATH + '/sample-files/questionnaires-sample-file.xlsx';
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
            var questionnairesFile = request.files.file;
            var fileName = questionnairesFile.name;
            var splitFileName = fileName.split(" ").join("-");
            var newFileName = splitFileName;

            const uploadPath = ROOT_TEMPLATE_PATH + 'trashFiles/' + newFileName;
            await questionnairesFile.mv(uploadPath, (request, response), (err) => {
                if (err) return response.json({ status: false, message: "Something is wrong while excel file.", data: [] });
            });

            var isValidData = { status: true }

            await readXlsxFile(uploadPath).then(async (questionsData) => {
                questionsData.shift();
                for (var i = 0; i < questionsData.length; i++) {
                    var questionsDetails = questionsData[i]
                    var insertTopIDs = []
                    var insertCountryIDs = []

                    const getExistQuestion = await questionnairesModel.getQuestionsByQue(questionsDetails[0], questionsDetails[1])

                    if (!getExistQuestion.status) {
                        isValidData = { status: false, message: getExistQuestion.message, data: [] }
                        break;
                    }
                    if (getExistQuestion.data) {
                        isValidData = { status: false, message: "Some question already exists. Please try with different question.", data: [] }
                        break;
                    }
                    console.log(questionsDetails);
                    var topicsList = questionsDetails[8].split(';');
                    if (!topicsList || topicsList.length <= 0) {
                        isValidData = { status: false, message: "Please select topics first.", data: [] }
                        break;
                    }
                    for (var k = 0; k < topicsList.length; k++) {
                        const isExistTopic = await topicsModel.checkTopicName(topicsList[k]);
                        if (!isExistTopic.status || !isExistTopic.isExist) {
                            isValidData = { status: false, message: "Some topic is missing in list.Make sure all topic was in database.", data: [] }
                            break;
                        }
                        insertTopIDs.push(isExistTopic.data.id)
                    }
                    if (!isValidData.status) {
                        isValidData = isValidData
                        break;
                    }

                    const difficultLevel = await settingsModel.checkDifficultyLevelByName(questionsDetails[5]);
                    if (!difficultLevel.isExist || !difficultLevel.status) {
                        isValidData = { status: false, message: "Something is wrong while add difficulty level.", data: [] }
                        break;
                    }

                    if (questionsDetails[9] == 'Yes' && questionsDetails[10] == "") {
                        isValidData = { status: false, message: "Please select valid image.", data: [] }
                        break;
                    }

                    // const insertData = {
                    //     'question': questionsDetails[0],
                    //     'correct_answer': questionsDetails[1],
                    //     'wrong_answer_1': questionsDetails[2],
                    //     'wrong_answer_2': questionsDetails[3],
                    //     'wrong_answer_3': questionsDetails[4],
                    //     'difficulty_level_id': difficultLevel.data.id,
                    //     'time_for_question': questionsDetails[6],
                    //     'time_for_answer': questionsDetails[7],
                    //     'is_question_image': (questionsDetails[9] == 'Yes') ? 1 : 0,
                    //     'question_image': (questionsDetails[9] == 'Yes') ? questionsDetails[10] : null,
                    //     'status': 1,
                    //     'created_by': request_body.id,
                    //     'total_time': (questionsDetails[6] + questionsDetails[7]),
                    // }

                    // const addData = await questionnairesModel.insertQuestionData(insertData);
                    // if (!addData.status) {
                    //     isValidData = { status: false, message: addData.message, data: [] }
                    //     break;
                    // }
                    // const questionID = addData.data.insertId;

                    // const insertQueTopicData = []
                    // await insertTopIDs.map((topic_id) => {
                    //     insertQueTopicData.push([questionID, topic_id])
                    // });

                    // const addQueTopicData = await questionnairesModel.insertQuestionTopicData(insertQueTopicData);
                    // if (!addQueTopicData.status) {
                    //     isValidData = { status: false, message: addQueTopicData.message, data: [] }
                    //     break;
                    // }
                }
            })

            if (!isValidData.status) { return response.json(isValidData); }
            await readXlsxFile(uploadPath).then(async (questionsData) => {
                questionsData.shift();
                for (var i = 0; i < questionsData.length; i++) {
                    var insertTopIDs = []
                    var questionsDetails = questionsData[i]
                    var topicsList = questionsDetails[8].split(';');

                    for (var k = 0; k < topicsList.length; k++) {
                        const isExistTopic = await topicsModel.checkTopicName(topicsList[k]);
                        insertTopIDs.push(isExistTopic.data.id)
                    }

                    const difficultLevel = await settingsModel.checkDifficultyLevelByName(questionsDetails[5]);

                    const insertData = {
                        'question': questionsDetails[0],
                        'correct_answer': questionsDetails[1],
                        'wrong_answer_1': questionsDetails[2],
                        'wrong_answer_2': questionsDetails[3],
                        'wrong_answer_3': questionsDetails[4],
                        'difficulty_level_id': difficultLevel.data.id,
                        'time_for_question': questionsDetails[6],
                        'time_for_answer': questionsDetails[7],
                        'is_question_image': (questionsDetails[9] == 'Yes') ? 1 : 0,
                        'question_image': (questionsDetails[9] == 'Yes') ? questionsDetails[10] : null,
                        'status': 1,
                        'created_by': request_body.id,
                        'total_time': (questionsDetails[6] + questionsDetails[7]),
                    }

                    const addData = await questionnairesModel.insertQuestionData(insertData);
                    if (!addData.status) {
                        isValidData = { status: false, message: addData.message, data: [] }
                        break;
                    }
                    const questionID = addData.data.insertId;

                    const insertQueTopicData = []
                    await insertTopIDs.map((topic_id) => {
                        insertQueTopicData.push([questionID, topic_id])
                    });

                    const addQueTopicData = await questionnairesModel.insertQuestionTopicData(insertQueTopicData);
                    if (!addQueTopicData.status) {
                        isValidData = { status: false, message: addQueTopicData.message, data: [] }
                        break;
                    }
                }
            })
            if (!isValidData.status) { return response.json(isValidData); }
            return response.json({ status: true, message: "Questions added successfully.", data: [] });
        }
        return response.json({ status: false, message: "Please upload an excel file!", data: [] });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.reportTheQuestions = async (request, response) => {
    try {

        const request_body = request.body;
        const { report_reason, question_id } = request_body.data;
        const userID = request_body.id

        const getQuestionDetail = await questionnairesModel.getQuestionsByID(question_id);
        if (!getQuestionDetail.status) return response.json({ status: false, message: getQuestionDetail.message, data: [] });

        const insertData = { 'question_id': question_id, 'user_id': userID, 'report_reason': report_reason, 'status': 1, 'created_at': curruntTime }

        const addData = await questionnairesModel.insertQuestionReportData(insertData);
        if (!addData.status) return response.json({ status: false, message: addData.message, data: [] });

        return response.json({ status: true, message: "Thanks for reporting this issue.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getReportQuestions = async (request, response) => {
    try {

        const request_body = request.body;
        const { page_no } = request_body.data;
        var pageNo = page_no ? page_no : 1;

        var limit = 10;
        var offset = ((pageNo - 1) * limit) > 0 ? (pageNo - 1) * limit : 0;
        var getAllData = { 'limit': limit, 'offset': offset }
        const getReportQue = await questionnairesModel.getReportQuestionsList(getAllData);
        const getReportQueCount = await questionnairesModel.getReportQuestionsCount();
        if (!getReportQue.status) return response.json({ status: false, message: getReportQue.message, data: [] });
        if (!getReportQueCount.status) return response.json({ status: false, message: getReportQueCount.message, data: [] });

        const ciphertext = await encode(getReportQue.data);
        return response.json({ status: true, message: "Reported questions loaded successfully.", count: getReportQueCount.data, data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}