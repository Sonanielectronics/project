const config = require("../config/config");

const JWTSecretKey = config.jwtsecretkey;
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
var randomstring = require("randomstring");
const { encode, sendEmailToUser } = require('../helper/common_functions');
const profilesModel = require('../model/profiles_model');
const opponentsModel = require('../model/opponents_model');
const tokensModel = require('../model/tokens_model');
const quizzesModel = require('../model/quizzes_model');
const notificationsModel = require('../model/notifications_model');
var topicsModel = require('../model/topics_model');
const settingsModel = require('../model/settings_model');
const moment = require('moment');
const curruntTime = moment(new Date()).format('YYYY-MM-DD hh:mm:00');
const questionnairesModel = require('../model/questionnaires_model')

module.exports.getRandomOpponentsList = async (request, response) => {
    try {
        const request_body = request.body;
        const { page_no, search, level } = request_body.data;
        const { id } = request_body;

        var pageNo = page_no ? page_no : 1;
        var searchData = search ? search : null;
        var limit = 10;
        var offset = ((pageNo - 1) * limit) > 0 ? (pageNo - 1) * limit : 0;

        const getLevelId = await settingsModel.getLevelIdByName(level);
        if (!getLevelId.status) return response.json({ status: false, message: getLevelId.message });
        const levelId = getLevelId.data.id

        const getProfileData = await profilesModel.getProfileData(id);
        if (!getProfileData.status) return response.json({ status: false, message: getProfileData.message });

        // const getUserEP = await tokensModel.getExperiencePoints(id);
        // if (!getUserEP.status) return response.json({ status: false, message: getUserEP.message });

        // const xp = getUserEP.data.xp;
        const getAllData = { 'limit': limit, 'offset': offset, 'search': searchData, 'id': id, 'level': levelId }
        const getOpponent = await opponentsModel.getRandomOpponentByExperiencePoints(getAllData);
        if (!getOpponent.status) return response.json({ status: false, message: getOpponent.message });

        const getOpponentCount = await opponentsModel.getRandomOpponentByExperiencePointsCount(getAllData);
        if (!getOpponentCount.status) return response.json({ status: false, message: getOpponentCount.message });

        const ciphertext = await encode(getOpponent.data);
        return response.json({ status: true, message: "The opponents loaded successfully.", count: getOpponentCount.data, data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.findRandomOpponent = async (request, response) => {
    try {
        const request_body = request.body;
        const { level, topic_id } = request_body.data;
        const { id } = request_body;
        const getTopic = await topicsModel.getTopicById(topic_id);
        if (!getTopic.status) return response.json({ status: false, message: getTopic.message });
        const getTopicData = getTopic.data

        const getLevelId = await settingsModel.getLevelIdByName(level);
        if (!getLevelId.status) return response.json({ status: false, message: getLevelId.message });

        const nowTime = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
        const postedData = { 'user_id': id, 'level': level, 'topic_id': topic_id, 'created_at': nowTime }
        const getRandOpp = await settingsModel.findRandomOpponentsV2(postedData);
        if (!getRandOpp.status) return response.json({ status: false, message: getRandOpp.message });
        const getRandOppData = getRandOpp.data;
        console.log(getRandOppData);
        var opponentID = 0;
        if (getRandOppData.length != 0) {

            const opDetail = getRandOppData[0];

            if (opDetail.user_one == id && opDetail.user_two != 0) {
                console.log('opDetail ----- 1');
                opponentID = opDetail.user_two;
                // opDetail.status = 0;
                const chnageStatus = await settingsModel.updateRandomOpponentSearchDataV2(opDetail)
                if (!chnageStatus.status) return response.json({ status: false, message: chnageStatus.message });
            } else if (opDetail.user_one != id && opDetail.user_two != 0) {
                console.log('opDetail ----- 2');
                opponentID = opDetail.user_one;
                // opDetail.status = 0
                const chnageStatus = await settingsModel.updateRandomOpponentSearchDataV2(opDetail)
                if (!chnageStatus.status) return response.json({ status: false, message: chnageStatus.message });
            } else if (opDetail.user_one != id && opDetail.user_two == 0) {
                console.log('opDetail ----- 3');
                opponentID = opDetail.user_one;
                // opDetail.status = 0
                opDetail.user_two = id
                const chnageStatus = await settingsModel.updateRandomOpponentSearchDataV2(opDetail)
                if (!chnageStatus.status) return response.json({ status: false, message: chnageStatus.message });
            }

            console.log(opponentID);
            const getAllData = { 'id': opponentID }
            const getOpponent = await opponentsModel.getRandomOpponentByLevel(getAllData);
            if (!getOpponent.status) return response.json({ status: false, message: getOpponent.message });
            const ciphertext = await encode(getOpponent.data);
            return response.json({ status: true, message: "The opponents loaded successfully.", data: ciphertext });

        } else {
            console.log('ello2');
            var addData = {
                'user_one': id,
                'user_two': 0,
                'level': level,
                'topic_id': topic_id,
                'status': 1,
                'created_at': nowTime
            }

            const addStatus = await settingsModel.addRandomOpponentSearchDataV2(addData)
            if (!addStatus.status) return response.json({ status: false, message: addStatus.message });
        }

        return response.json({ status: false, message: "We are not found any opponent right now. Please try again later.", data: [] });
        console.log(getRandOppData);

        // if (getRandOppData.length != 0) {


        //     const getAllData = { 'id': getRandOppData[0].user_id }
        //     const getOpponent = await opponentsModel.getRandomOpponentByLevel(getAllData);
        //     if (!getOpponent.status) return response.json({ status: false, message: getOpponent.message });

        //     var updateRecord = { 'id': getRandOppData[0].id, 'find_flag': (getRandOppData.find_flag == 1) ? 1 : 2 }
        //     const updateData = await settingsModel.updateRandomOpponentSearchData(updateRecord);
        //     if (!updateData.status) return response.json({ status: false, message: updateData.message });

        //     if (getRandOppData[0].find_flag == 2) {
        //         var updateRecord = { 'id': getRandOppData[0].id, 'status': 0 }
        //         // const updateData = await settingsModel.deleteRandomOpponentSearchData(getRandOppData[0].id);
        //         const updateData = await settingsModel.updateRandomOpponentSearchData(updateRecord);
        //         if (!updateData.status) return response.json({ status: false, message: updateData.message });

        //     }

        //     const ciphertext = await encode(getOpponent.data);
        //     return response.json({ status: true, message: "The opponents loaded successfully.", data: ciphertext });
        // }

        return response.json({ status: false, message: "We are not found any opponent right now. Please try again later.", data: [] });


    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}


module.exports.findBotOpponent = async (request, response) => {
    try {
        const request_body = request.body;
        const { level } = request_body.data;
        const { id } = request_body;

        const getLevelId = await settingsModel.getLevelIdByName(level);
        if (!getLevelId.status) return response.json({ status: false, message: getLevelId.message });
        const levelId = getLevelId.data.id

        const getProfileData = await profilesModel.getProfileData(id);
        if (!getProfileData.status) return response.json({ status: false, message: getProfileData.message });

        const getAllData = { 'id': id, 'level': levelId }
        const getOpponent = await opponentsModel.findRandomBotByLevel(getAllData);
        if (!getOpponent.status) return response.json({ status: false, message: getOpponent.message });

        const ciphertext = await encode(getOpponent.data);
        return response.json({ status: true, message: "The opponents loaded successfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}


module.exports.getFriendsOpponentsList = async (request, response) => {
    try {
        const request_body = request.body;
        const { page_no, search } = request_body.data;
        const { id } = request_body;

        var pageNo = page_no ? page_no : 1;
        var searchData = search ? search : null;
        var limit = 10;
        var offset = ((pageNo - 1) * limit) > 0 ? (pageNo - 1) * limit : 0;


        const getProfileData = await profilesModel.getProfileData(id);
        if (!getProfileData.status) return response.json({ status: false, message: getProfileData.message });

        const getUserEP = await tokensModel.getExperiencePoints(id);
        if (!getUserEP.status) return response.json({ status: false, message: getUserEP.message });

        const xp = getUserEP.data.xp;
        const getAllData = { 'limit': limit, 'offset': offset, 'search': searchData, 'id': id, 'xp': xp }
        const getOpponent = await opponentsModel.getOpponentByExperiencePoints(getAllData);
        if (!getOpponent.status) return response.json({ status: false, message: getOpponent.message });

        const getOpponentCount = await opponentsModel.getOpponentByExperiencePointsCount(getAllData);
        if (!getOpponentCount.status) return response.json({ status: false, message: getOpponentCount.message });

        const ciphertext = await encode(getOpponent.data);
        return response.json({ status: true, message: "The opponents loaded successfully.", count: getOpponentCount.data, data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.sendOpponentRequest = async (request, response) => {
    try {
        const request_body = request.body;
        const { id } = request_body;
        const { topic_id, opponent_id, spent_learning_token } = request_body.data

        const getTopic = await topicsModel.getTopicById(topic_id);
        if (!getTopic.status) return response.json({ status: false, message: getTopic.message });
        const getTopicData = getTopic.data

        const getProfile = await profilesModel.getProfileData(id);
        if (!getProfile.status) return response.json({ status: false, message: getProfile.message });
        const getProfileData = getProfile.data

        const getOppoProfile = await profilesModel.getProfileData(opponent_id);
        if (!getOppoProfile.status) return response.json({ status: false, message: getOppoProfile.message });
        const getOppoProfileData = getOppoProfile.data

        const getUserLT = await tokensModel.getUserLearningToken(id);
        if (!getUserLT.status) return response.json({ status: false, message: getUserLT.message });

        const learningToken = getUserLT.data
        if (learningToken.learning_token < spent_learning_token) return response.json({ status: false, message: "you don\'t have enough balance learning token for play the quiz", data: {} });

        const addGame = {
            'player_id': id,
            'opponent_id': opponent_id,
            'topic_id': topic_id,
            'request_status': 1,
            'request_time': new Date(),
            'spent_learning_token': spent_learning_token,
            'winner_id': 0,
            'created_at': curruntTime,
            'is_timer_on': 1,
        }

        const saveGameData = await quizzesModel.addQuizzesData(addGame)
        if (!saveGameData.status) return response.json({ status: false, message: saveGameData.message });

        const quizzID = saveGameData.data


        const getQuiz = await quizzesModel.getQuizzesDataID(quizzID);
        if (!getQuiz.status) return response.json({ status: false, message: getQuiz.message });
        const quizData = getQuiz.data

        var getData = {
            'id': id,
            'topic_id': topic_id,
            'limit': quizData.top_number_of_questions,
            'question_time': quizData.top_time_for_question,
            'regional_relevance': quizData.top_regional_relevance,
            'not_in': ''
        }

        const getAllQuestionsCount = await topicsModel.getAllQuestionsCountOfTopic(getData)
        if (!getAllQuestionsCount.status) return response.json({ status: false, message: getAllQuestionsCount.message });
        if (getAllQuestionsCount.data < quizData.top_number_of_questions) return response.json({ status: false, message: 'This topic has not enough questoins. Please try other topic for challenges.' });

        // Send Notification to the opponet for the paly the game 
        var pushData = {

            'sender_id': id,
            'sender_title': 'Notified of your challenge in',
            'sender_body': 'Your opponent has 24h to respond.',
            'sender_status': 1,//Withdraw challanged

            'receiver_id': opponent_id,
            'receiver_title': 'Challenged you in',
            'receiver_body': 'You have 24 hours to accept the challenge.',
            'receiver_status': 2,//Send Request

            'notification_for': 1,
            'topic_id': topic_id,
            'quiz_id': quizzID,
            'status': 0,
            'created_at': curruntTime,

        }
        const saveNotification = await notificationsModel.addNotificationsData(pushData)
        if (!saveNotification.status) return response.json({ status: false, message: saveNotification.message });

        //Update learning token 
        learningToken.learning_token = learningToken.learning_token - spent_learning_token
        const updateLT = await tokensModel.updateLearningToken(learningToken)
        if (!updateLT.status) return response.json({ status: false, message: updateLT.message });

        //Add Learning token history
        const learningToketnHis = { 'user_id': id, 'learning_token': spent_learning_token, 'status': 2, 'reason_for': 2, 'quiz_id': quizzID };
        const addLearningTokenHis = await tokensModel.addLearningTokenHis(learningToketnHis);
        if (!addLearningTokenHis.status) return response.json({ status: false, message: addLearningTokenHis.message });


        //Save quizz questions


        // const getQuiz = await quizzesModel.getQuizzesDataID(quizzID);
        // if (!getQuiz.status) return response.json({ status: false, message: getQuiz.message });
        // const quizData = getQuiz.data

        var getData = {
            'id': id,
            'topic_id': topic_id,
            'limit': quizData.top_number_of_questions,
            'question_time': quizData.top_time_for_question,
            'regional_relevance': quizData.top_regional_relevance,
            'not_in': ''
        }

        // const getAllQuestionsCount = await topicsModel.getAllQuestionsCountOfTopic(topic_id)
        // if (!getAllQuestionsCount.status) return response.json({ status: false, message: getAllQuestionsCount.message });

        const getUserQuestions = await topicsModel.getUserQuestionsOfTopic(getData)
        if (!getUserQuestions.status) return response.json({ status: false, message: getUserQuestions.message });
        const getUserQuestionsData = await getUserQuestions.data

        if (getUserQuestionsData.length) {
            var notInData = []
            await getUserQuestionsData.map((questions) => {
                notInData.push(questions.question_id)
            });
            getData.not_in = notInData
        }

        const getQuestion = await questionnairesModel.getQuestionTopicForQuiz(getData);
        if (!getQuestion.status) return response.json({ status: false, message: getQuestion.message })
        var getQuestionData = getQuestion.data
        if (getQuestion.data.length < quizData.top_number_of_questions) {
            getData.not_in = []
            getData.limit = quizData.top_number_of_questions - getQuestionData.length
            if (getQuestionData.length > 0) {
                var notInData = []
                await getQuestionData.map((questions) => {
                    notInData.push(questions.id)
                });
                getData.not_in = notInData
            }
            const getQuestionV2 = await questionnairesModel.getQuestionTopicForQuiz(getData);
            if (!getQuestionV2.status) return response.json({ status: false, message: getQuestionV2.message })

            getQuestionData = getQuestionData.concat(getQuestionV2.data)
        }

        const insertData = []
        await getQuestionData.map((questions) => {
            insertData.push([id, opponent_id, quizzID, questions.id, 1])
        });
        //TODO:  Check difficulty level

        const addQuestions = await questionnairesModel.addQuizQuestions(insertData)
        if (!addQuestions.status) return response.json({ status: false, message: addQuestions.message });

        const staticEmail = 'vipul.technomads@gmail.com'
        var sendMailData = {
            subject: 'You got new request from Zleetz!',
            email: getOppoProfileData.email,
            username: getOppoProfileData.user_name,
            context: {
                name: getOppoProfileData.user_name,
                sender_name: getProfileData.user_name,
                topic_name: getTopicData.name,
                topic_description: getTopicData.description,
                topic_color_code: getTopicData.color_code,
                topic_icon: getTopicData.icon,
                spent_learning_token: spent_learning_token,
                challenge_time: curruntTime,
                expired_time: curruntTime,
            },
            template: 'send-request'
        }

        // const sendMail = await sendEmailToUser(sendMailData)
        // if (!sendMail.status) return response.json({ status: false, message: sendMail.message });

        const ciphertext = await encode({ 'quiz_id': quizzID });
        return response.json({ status: true, message: "Request sent successfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.sendOpponentRequestV2 = async (request, response) => {
    try {
        const request_body = request.body;
        const { id } = request_body;
        const { topic_id, opponent_id, spent_learning_token } = request_body.data

        const getTopic = await topicsModel.getTopicById(topic_id);
        if (!getTopic.status) return response.json({ status: false, message: getTopic.message });
        const getTopicData = getTopic.data

        const getProfile = await profilesModel.getProfileData(id);
        if (!getProfile.status) return response.json({ status: false, message: getProfile.message });
        const getProfileData = getProfile.data

        const getOppoProfile = await profilesModel.getProfileData(opponent_id);
        if (!getOppoProfile.status) return response.json({ status: false, message: getOppoProfile.message });
        const getOppoProfileData = getOppoProfile.data

        const getUserLT = await tokensModel.getUserLearningToken(id);
        if (!getUserLT.status) return response.json({ status: false, message: getUserLT.message });

        const learningToken = getUserLT.data
        if (learningToken.learning_token < spent_learning_token) return response.json({ status: false, message: "you don\'t have enough balance learning token for play the quiz", data: {} });

        const addGame = {
            'player_id': id,
            'opponent_id': opponent_id,
            'topic_id': topic_id,
            'request_status': 1,
            'request_time': new Date(),
            'spent_learning_token': spent_learning_token,
            'winner_id': 0,
            'created_at': curruntTime,
            'is_timer_on': 1,
        }

        const saveGameData = await quizzesModel.addQuizzesData(addGame)
        if (!saveGameData.status) return response.json({ status: false, message: saveGameData.message });

        const quizzID = saveGameData.data


        const getQuiz = await quizzesModel.getQuizzesDataID(quizzID);
        if (!getQuiz.status) return response.json({ status: false, message: getQuiz.message });
        const quizData = getQuiz.data

        var getData = {
            'id': id,
            'topic_id': topic_id,
            'limit': quizData.top_number_of_questions,
            'question_time': quizData.top_time_for_question,
            'regional_relevance': quizData.top_regional_relevance,
            'not_in': ''
        }

        const getAllQuestionsCount = await topicsModel.getAllQuestionsCountOfTopic(getData)
        if (!getAllQuestionsCount.status) return response.json({ status: false, message: getAllQuestionsCount.message });
        if (getAllQuestionsCount.data < quizData.top_number_of_questions) return response.json({ status: false, message: 'This topic has not enough questoins. Please try other topic for challenges.' });

        // Send Notification to the opponet for the paly the game 
        var pushData = {

            'sender_id': id,
            'sender_title': 'Notified of your challenge in',
            'sender_body': 'Your opponent has 24h to respond.',
            'sender_status': 1,//Withdraw challanged

            'receiver_id': opponent_id,
            'receiver_title': 'Challenged you in',
            'receiver_body': 'You have 24 hours to accept the challenge.',
            'receiver_status': 2,//Send Request

            'notification_for': 1,
            'topic_id': topic_id,
            'quiz_id': quizzID,
            'status': 0,
            'created_at': curruntTime,

        }
        const saveNotification = await notificationsModel.addNotificationsData(pushData)
        if (!saveNotification.status) return response.json({ status: false, message: saveNotification.message });

        //Update learning token 
        learningToken.learning_token = learningToken.learning_token - spent_learning_token
        const updateLT = await tokensModel.updateLearningToken(learningToken)
        if (!updateLT.status) return response.json({ status: false, message: updateLT.message });

        //Add Learning token history
        const learningToketnHis = { 'user_id': id, 'learning_token': spent_learning_token, 'status': 2, 'reason_for': 2, 'quiz_id': quizzID };
        const addLearningTokenHis = await tokensModel.addLearningTokenHis(learningToketnHis);
        if (!addLearningTokenHis.status) return response.json({ status: false, message: addLearningTokenHis.message });


        //Save quizz questions


        // const getQuiz = await quizzesModel.getQuizzesDataID(quizzID);
        // if (!getQuiz.status) return response.json({ status: false, message: getQuiz.message });
        // const quizData = getQuiz.data

        var getData = {
            'id': id,
            'topic_id': topic_id,
            'limit': quizData.top_number_of_questions,
            'question_time': quizData.top_time_for_question,
            'regional_relevance': quizData.top_regional_relevance,
            'not_in': ''
        }

        // const getAllQuestionsCount = await topicsModel.getAllQuestionsCountOfTopic(topic_id)
        // if (!getAllQuestionsCount.status) return response.json({ status: false, message: getAllQuestionsCount.message });

        const getUserQuestions = await topicsModel.getUserQuestionsOfTopic(getData)
        if (!getUserQuestions.status) return response.json({ status: false, message: getUserQuestions.message });
        const getUserQuestionsData = await getUserQuestions.data

        if (getAllQuestionsCount.data > (getUserQuestionsData.length + quizData.top_number_of_questions)) {
            var notInData = []
            await getUserQuestionsData.map((questions) => {
                notInData.push(questions.question_id)
            });
            getData.not_in = notInData
        }

        const getQuestion = await questionnairesModel.getQuestionTopicForQuiz(getData);
        if (!getQuestion.status) return response.json({ status: false, message: getQuestion.message })
        var getQuestionData = getQuestion.data
        if (getQuestion.data.length < quizData.top_number_of_questions) {
            getData.not_in = []
            const getQuestionV2 = await questionnairesModel.getQuestionTopicForQuiz(getData);
            if (!getQuestionV2.status) return response.json({ status: false, message: getQuestionV2.message })
            getQuestionData = getQuestionV2.data
        }

        const insertData = []
        await getQuestionData.map((questions) => {
            insertData.push([id, opponent_id, quizzID, questions.id, 1])
        });
        //TODO:  Check difficulty level

        const addQuestions = await questionnairesModel.addQuizQuestions(insertData)
        if (!addQuestions.status) return response.json({ status: false, message: addQuestions.message });

        const staticEmail = 'vipul.technomads@gmail.com'
        var sendMailData = {
            subject: 'You got new request from Zleetz!',
            email: getOppoProfileData.email,
            username: getOppoProfileData.user_name,
            context: {
                name: getOppoProfileData.user_name,
                sender_name: getProfileData.user_name,
                topic_name: getTopicData.name,
                topic_description: getTopicData.description,
                topic_color_code: getTopicData.color_code,
                topic_icon: getTopicData.icon,
                spent_learning_token: spent_learning_token,
                challenge_time: curruntTime,
                expired_time: curruntTime,
            },
            template: 'send-request'
        }

        const sendMail = await sendEmailToUser(sendMailData)
        if (!sendMail.status) return response.json({ status: false, message: sendMail.message });

        const ciphertext = await encode({ 'quiz_id': quizzID });
        return response.json({ status: true, message: "Request sent successfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.acceptOpponentRequest = async (request, response) => {
    try {
        const request_body = request.body;
        const { id } = request_body;
        const { quiz_id } = request_body.data

        const getTopicData = await quizzesModel.getQuizzesDataID(quiz_id);
        if (!getTopicData.status) return response.json({ status: false, message: getTopicData.message });

        const getNotification = await notificationsModel.getNotificationDataByQuiz(quiz_id)
        if (!getNotification.status) return response.json({ status: false, message: getNotification.message });
        const getNotificationData = getNotification.data

        if (getNotificationData.receiver_status != 2) return response.json({ status: false, message: "You are not able to play this quiz." });
        const getUserLT = await tokensModel.getUserLearningToken(id);
        if (!getUserLT.status) return response.json({ status: false, message: getUserLT.message });

        const learningToken = getUserLT.data
        if (learningToken.learning_token < getNotificationData.spent_learning_token) return response.json({ status: false, message: "you don\'t have enough balance learning token for play the quiz", data: {} });

        const editNoti = {
            'id': getNotificationData.id,
            // 'sender_title': 'Accepted your challenge in',
            // 'sender_body': 'You have 24 hours to play.',
            'sender_status': 3,//Play

            // 'receiver_title': 'Waiting',
            // 'receiver_body': 'Waiting.',
            'receiver_status': 4,//Waiting

            'updated_at': curruntTime,
        }

        const saveNotification = await notificationsModel.editNotificationsData(editNoti)
        if (!saveNotification.status) return response.json({ status: false, message: saveNotification.message });

        //Update learning token 
        learningToken.learning_token = learningToken.learning_token - getNotificationData.spent_learning_token
        const updateLT = await tokensModel.updateLearningToken(learningToken)
        if (!updateLT.status) return response.json({ status: false, message: updateLT.message });

        //Add Learning token history
        const learningToketnHis = { 'user_id': id, 'learning_token': getNotificationData.spent_learning_token, 'status': 2, 'reason_for': 2, 'quiz_id': quiz_id };
        const addLearningTokenHis = await tokensModel.addLearningTokenHis(learningToketnHis);
        if (!addLearningTokenHis.status) return response.json({ status: false, message: addLearningTokenHis.message });

        const ciphertext = await encode({ 'quiz_id': quiz_id });
        return response.json({ status: true, message: "Request accepted successfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.declineOpponentRequest = async (request, response) => {
    try {
        const request_body = request.body;
        const { id } = request_body;
        const { quiz_id } = request_body.data

        const getTopic = await quizzesModel.getQuizzesDataID(quiz_id);
        if (!getTopic.status) return response.json({ status: false, message: getTopic.message });
        const getTopicData = getTopic.data

        const getNotification = await notificationsModel.getNotificationDataByQuiz(quiz_id)
        if (!getNotification.status) return response.json({ status: false, message: getNotification.message });
        const getNotificationData = getNotification.data

        if (getNotificationData.receiver_status != 2) return response.json({ status: false, message: "You are not able to decline this quiz." });

        const getUserLT = await tokensModel.getUserLearningToken(getTopicData.player_id); // Oppotnent LT
        if (!getUserLT.status) return response.json({ status: false, message: getUserLT.message });
        const learningToken = getUserLT.data

        const editNoti = {
            'id': getNotificationData.id,
            'sender_status': 5,//Opponent Decline
            'receiver_status': 6,//You Decline
            'updated_at': curruntTime,
        }

        const saveNotification = await notificationsModel.editNotificationsData(editNoti)
        if (!saveNotification.status) return response.json({ status: false, message: saveNotification.message });

        //Update learning token 
        learningToken.learning_token = learningToken.learning_token + getNotificationData.spent_learning_token
        const updateLT = await tokensModel.updateLearningToken(learningToken)
        if (!updateLT.status) return response.json({ status: false, message: updateLT.message });

        //Add Learning token history
        const learningToketnHis = { 'user_id': id, 'learning_token': getNotificationData.spent_learning_token, 'status': 1, 'reason_for': 2, 'quiz_id': quiz_id };
        const addLearningTokenHis = await tokensModel.addLearningTokenHis(learningToketnHis);
        if (!addLearningTokenHis.status) return response.json({ status: false, message: addLearningTokenHis.message });

        const ciphertext = await encode({ 'quiz_id': quiz_id });
        return response.json({ status: true, message: "The game request decline successfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.withdrawOpponentRequest = async (request, response) => {
    try {
        const request_body = request.body;
        const { id } = request_body;
        const { quiz_id } = request_body.data

        const getTopic = await quizzesModel.getQuizzesDataID(quiz_id);
        if (!getTopic.status) return response.json({ status: false, message: getTopic.message });
        const getTopicData = getTopic.data

        const getNotification = await notificationsModel.getNotificationDataByQuiz(quiz_id)
        if (!getNotification.status) return response.json({ status: false, message: getNotification.message });
        const getNotificationData = getNotification.data

        if (getNotificationData.sender_status != 1) return response.json({ status: false, message: "You are not able to decline this quiz." });

        const getUserLT = await tokensModel.getUserLearningToken(id); // Oppotnent LT
        if (!getUserLT.status) return response.json({ status: false, message: getUserLT.message });
        const learningToken = getUserLT.data

        const editNoti = {
            'id': getNotificationData.id,
            'sender_status': 7,//Opponent Decline
            'receiver_status': 8,//You Decline
            'updated_at': curruntTime,
        }

        const saveNotification = await notificationsModel.editNotificationsData(editNoti)
        if (!saveNotification.status) return response.json({ status: false, message: saveNotification.message });

        //Update learning token 
        learningToken.learning_token = learningToken.learning_token + getNotificationData.spent_learning_token
        const updateLT = await tokensModel.updateLearningToken(learningToken)
        if (!updateLT.status) return response.json({ status: false, message: updateLT.message });

        //Add Learning token history
        const learningToketnHis = { 'user_id': id, 'learning_token': getNotificationData.spent_learning_token, 'status': 1, 'reason_for': 2, 'quiz_id': quiz_id };
        const addLearningTokenHis = await tokensModel.addLearningTokenHis(learningToketnHis);
        if (!addLearningTokenHis.status) return response.json({ status: false, message: addLearningTokenHis.message });

        const ciphertext = await encode({ 'quiz_id': quiz_id });
        return response.json({ status: true, message: "The game withdraw successfully..", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.playRequestedQuiz = async (request, response) => {
    try {
        const request_body = request.body;
        const { id } = request_body;
        const { quiz_id } = request_body.data

        const getTopic = await quizzesModel.getQuizzesDataID(quiz_id);
        if (!getTopic.status) return response.json({ status: false, message: getTopic.message });
        const getTopicData = getTopic.data

        const getNotification = await notificationsModel.getNotificationDataByQuiz(quiz_id)
        if (!getNotification.status) return response.json({ status: false, message: getNotification.message });
        const getNotificationData = getNotification.data

        if (getNotificationData.sender_status != 3) return response.json({ status: false, message: "You are not able to decline this quiz." });

        // const editNoti = {
        //     'id': getNotificationData.id,
        //     'sender_status': 12,//Opponent Decline
        //     // 'receiver_status': 13,//You Decline
        //     'updated_at': curruntTime,
        // }

        // const saveNotification = await notificationsModel.editNotificationsData(editNoti)
        // if (!saveNotification.status) return response.json({ status: false, message: saveNotification.message });

        const ciphertext = await encode({ 'quiz_id': quiz_id });
        return response.json({ status: true, message: "Request accepted successfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}


module.exports.getUserRanking = async (request, response) => {
    try {
        const request_body = request.body;
        const { id } = request_body;
        const { page_no, topic_id } = request_body.data

        const getUserList = await profilesModel.getUserListByRanking(topic_id);
        if (!getUserList.status) return response.json({ status: false, message: getUserList.message });
        var userList = getUserList.data;
        if (userList.length == 0) {
            const getUserListV2 = await profilesModel.getUserListByRankingAll();
            if (!getUserListV2.status) return response.json({ status: false, message: getUserListV2.message });
            userList = getUserListV2.data;
        }
        const ciphertext = await encode(userList);

        return response.json({ status: true, message: "Profile ranking loaded successfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}


module.exports.playWithRandomPlayer = async (request, response) => {
    try {
        const request_body = request.body;
        const { id } = request_body;
        const { topic_id, opponent_id, spent_learning_token, level } = request_body.data

        const getLevelData = await settingsModel.getLevelIdByName(level);
        if (!getLevelData.status) return response.json({ status: false, message: getLevelData.message });
        const levelDetail = getLevelData.data
        // TODO: check with topic
        // if (spent_learning_token != levelDetail.entry_fee) return response.json({ status: false, message: 'Please select other level for game.' });

        const getTopic = await topicsModel.getTopicById(topic_id);
        if (!getTopic.status) return response.json({ status: false, message: getTopic.message });
        const getTopicData = getTopic.data

        const getProfile = await profilesModel.getProfileData(id);
        if (!getProfile.status) return response.json({ status: false, message: getProfile.message });
        const getProfileData = getProfile.data

        const getOppoProfile = await profilesModel.getProfileData(opponent_id);
        if (!getOppoProfile.status) return response.json({ status: false, message: getOppoProfile.message });
        const getOppoProfileData = getOppoProfile.data

        const getUserLT = await tokensModel.getUserLearningToken(id);
        if (!getUserLT.status) return response.json({ status: false, message: getUserLT.message });

        const learningToken = getUserLT.data
        if (learningToken.learning_token < spent_learning_token) return response.json({ status: false, message: "you don\'t have enough balance learning token for play the quiz", data: {} });
        var quizzID = 0;
        var isBot = 0;
        if (getOppoProfileData.is_bot == 1) {
            isBot = 1;
            const addGame = {
                'player_id': id,
                'opponent_id': opponent_id,
                'topic_id': topic_id,
                'request_status': 1,
                'request_time': new Date(),
                'spent_learning_token': spent_learning_token,
                'winner_id': 0,
                'created_at': curruntTime,
                'is_timer_on': 0,
                'play_by_opponent': 1,
                'done_by_opponent': 1,
            }

            const saveGameData = await quizzesModel.addQuizzesData(addGame)
            if (!saveGameData.status) return response.json({ status: false, message: saveGameData.message });

            quizzID = saveGameData.data


            const getQuiz = await quizzesModel.getQuizzesDataID(quizzID);
            if (!getQuiz.status) return response.json({ status: false, message: getQuiz.message });
            const quizData = getQuiz.data

            var getData = {
                'id': id,
                'topic_id': topic_id,
                'limit': quizData.top_number_of_questions,
                'question_time': quizData.top_time_for_question,
                'regional_relevance': quizData.top_regional_relevance,
                'not_in': ''
            }

            const getAllQuestionsCount = await topicsModel.getAllQuestionsCountOfTopic(getData)
            if (!getAllQuestionsCount.status) return response.json({ status: false, message: getAllQuestionsCount.message });
            if (getAllQuestionsCount.data < quizData.top_number_of_questions) return response.json({ status: false, message: 'This topic has not enough questoins. Please try other topic for challenges.' });

            // Send Notification to the opponet for the paly the game 
            var pushData = {
                'sender_id': id,
                'sender_status': 3,//Play
                'receiver_id': opponent_id,
                'receiver_status': 4,//Waiting
                'notification_for': 1,
                'topic_id': topic_id,
                'quiz_id': quizzID,
                'status': 0,
                'created_at': curruntTime,

            }
            const saveNotification = await notificationsModel.addNotificationsData(pushData)
            if (!saveNotification.status) return response.json({ status: false, message: saveNotification.message });

            //Update learning token 
            learningToken.learning_token = learningToken.learning_token - spent_learning_token
            const updateLT = await tokensModel.updateLearningToken(learningToken)
            if (!updateLT.status) return response.json({ status: false, message: updateLT.message });

            //Add Learning token history
            const learningToketnHis = { 'user_id': id, 'learning_token': spent_learning_token, 'status': 2, 'reason_for': 2, 'quiz_id': quizzID };
            const addLearningTokenHis = await tokensModel.addLearningTokenHis(learningToketnHis);
            if (!addLearningTokenHis.status) return response.json({ status: false, message: addLearningTokenHis.message });


            //Save quizz questions

            var getData = {
                'id': id,
                'topic_id': topic_id,
                'limit': quizData.top_number_of_questions,
                'question_time': quizData.top_time_for_question,
                'regional_relevance': quizData.top_regional_relevance,
                'not_in': ''
            }

            const getUserQuestions = await topicsModel.getUserQuestionsOfTopic(getData)
            if (!getUserQuestions.status) return response.json({ status: false, message: getUserQuestions.message });
            const getUserQuestionsData = await getUserQuestions.data

            if (getUserQuestionsData.length) {
                var notInData = []
                await getUserQuestionsData.map((questions) => {
                    notInData.push(questions.question_id)
                });
                getData.not_in = notInData
            }

            const getQuestion = await questionnairesModel.getQuestionTopicForQuiz(getData);
            if (!getQuestion.status) return response.json({ status: false, message: getQuestion.message })
            var getQuestionData = getQuestion.data
            if (getQuestion.data.length < quizData.top_number_of_questions) {
                getData.not_in = []
                getData.limit = quizData.top_number_of_questions - getQuestionData.length
                if (getQuestionData.length > 0) {
                    var notInData = []
                    await getQuestionData.map((questions) => {
                        notInData.push(questions.id)
                    });
                    getData.not_in = notInData
                }
                const getQuestionV2 = await questionnairesModel.getQuestionTopicForQuiz(getData);
                if (!getQuestionV2.status) return response.json({ status: false, message: getQuestionV2.message })

                getQuestionData = getQuestionData.concat(getQuestionV2.data)
            }
            // console.log(getQuestionData);


            const insertData = []

            var bot_correct_answer_from = Math.round((levelDetail.bot_correct_answer_from * quizData.top_number_of_questions) / 100)
            var bot_correct_answer_to = Math.round((levelDetail.bot_correct_answer_to * quizData.top_number_of_questions) / 100)

            var min = Math.ceil(bot_correct_answer_from);
            var max = Math.floor(bot_correct_answer_to);
            var trueAnsWill = Math.floor(Math.random() * (max - min + 1)) + min;
            // console.log(trueAnsWill);
            var indexData = 1;
            await getQuestionData.map((questions) => {

                var bot_speed_from = Math.round((levelDetail.bot_speed_from * questions.question_time) / 100)
                var bot_speed_to = Math.round((levelDetail.bot_speed_to * questions.question_time) / 100)
                var minTime = Math.ceil(bot_speed_from);
                var maxTime = Math.floor(bot_speed_to);
                var ansTimeWill = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
                var isCorrect = 2
                if (indexData <= trueAnsWill) isCorrect = 1
                var randomWrong = Math.floor(Math.random() * 3) + 1
                var opponent_answer_key = (isCorrect == 1) ? 'correct_answer' : 'wrong_answer_' + randomWrong
                insertData.push([id, opponent_id, quizzID, questions.id, isCorrect, opponent_answer_key, ansTimeWill, 1])
                // var questionData = {
                //     'player_id': id,
                //     'opponent_id': opponent_id,
                //     'quiz_id': quizzID,
                //     'question_id': questions.id,
                //     'opponent_answer': isCorrect,
                //     'opponent_answer_key': opponent_answer_key,
                //     'opponent_spent_time': ansTimeWill,
                //     'status': 1,
                // }
                // insertData.push(questionData)
                indexData++
            });

            insertData.sort(() => Math.random() - 0.5)
            // console.log(insertData);

            const addQuestions = await questionnairesModel.addQuizQuestionsForBot(insertData)
            if (!addQuestions.status) return response.json({ status: false, message: addQuestions.message });

        } else {
            //TODO:  Play user 
        }

        const getQuestion = await questionnairesModel.getQuestionTopicForByQuizID(quizzID, isBot);
        if (!getQuestion.status) return response.json({ status: false, message: getQuestion.message });
        const getQuestionDataForPlayer = getQuestion.data;

        const ciphertext = await encode(getQuestionDataForPlayer);

        return response.json({ status: true, message: "Request sent successfully.", 'quiz_id': quizzID, data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}