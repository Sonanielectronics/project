const config = require("../config/config");

const JWTSecretKey = config.jwtsecretkey;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const randomstring = require("randomstring");
const { encode, uploadMaterialToAWS } = require('../helper/common_functions');
const profilesModel = require('../model/profiles_model');
const tokensModel = require('../model/tokens_model');
const quizzesModel = require('../model/quizzes_model');
const questionnairesModel = require('../model/questionnaires_model');
const notificationsModel = require('../model/notifications_model');
const topicsModel = require('../model/topics_model');
const moment = require('moment');
const isset = require("isset");
const curruntTime = moment(new Date()).format('YYYY-MM-DD hh:mm:00')

function hashPassword(password) {
    password = config.password_salt + password;
    var hash = crypto.createHash('sha1');
    hash.update(password);
    var value = hash.digest('hex');
    return value;
}

module.exports.encodeData = async (request, response) => {
    try {
        const ciphertext = await encode(request.body);
        return response.json(ciphertext);
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.decodeData = async (request, response) => {
    try {
        var encodedData = request.body;
        const ciphertext = await decode(encodedData.data);
        return response.json(ciphertext);
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.updatePassword = async (request, response) => {
    try {
        const request_body = request.body;
        const { old_password, password } = request_body.data;

        var profile_id = request_body.id;
        var oldPassword = hashPassword(old_password);
        const checkPassword = await profilesModel.checkPassword(oldPassword, profile_id);
        if (!checkPassword.status) return response.json({ status: false, message: checkPassword.message });
        if (password.length < 6) return response.json({ status: false, message: "You have to enter at least 6 digit!" });

        let update_data_val = { id: profile_id, password: hashPassword(password) };

        const updateProfile = await profilesModel.updateProfilesData(update_data_val);
        if (!updateProfile.status) return response.json({ status: false, message: updateProfile.message });

        return response.json({ status: true, message: "The Password Successfully Updated." });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.updateProfileData = async (request, response) => {
    try {
        const request_body = request.body;
        const { full_name, birth_year, country_id, contact_no, avatar_id } = request_body.data;
        const { id } = request_body;

        const getProfile = await profilesModel.getProfileData(id);
        if (!getProfile.status) return response.json({ status: false, message: getProfile.message });

        let update_data_val = {
            'id': id,
            'full_name': full_name,
            'birth_year': birth_year,
            'avatar_id': avatar_id,
            'contact_no': contact_no,
            'country_id': country_id,
            'updated_at': curruntTime
        };

        const updateProfile = await profilesModel.updateProfilesData(update_data_val);
        if (!updateProfile.status) return response.json({ status: false, message: updateProfile.message });

        const getProfileData = await profilesModel.getProfileData(id);
        const ciphertext = await encode(getProfileData.data);
        var token = jwt.sign(JSON.stringify(getProfileData.data), JWTSecretKey);

        return response.json({ status: true, message: "The Profile successfully updated.", data: ciphertext, jwt: token });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getProfileData = async (request, response) => {
    try {
        const request_body = request.body;
        const { id } = request_body;

        const getProfile = await profilesModel.getProfileData(id);
        if (!getProfile.status) return response.json({ status: false, message: getProfile.message });

        let update_data_val = {
            'id': id,
            'full_name': full_name,
            'birth_year': birth_year,
            'avatar_id': avatar_id,
            'contact_no': contact_no,
            'country_id': country_id,
            'updated_at': curruntTime
        };

        const updateProfile = await profilesModel.updateProfilesData(update_data_val);
        if (!updateProfile.status) return response.json({ status: false, message: updateProfile.message });

        const getProfileData = await profilesModel.getProfileData(id);
        const ciphertext = await encode(getProfileData.data);
        var token = jwt.sign(JSON.stringify(getProfileData.data), JWTSecretKey);

        return response.json({ status: true, message: "The Profile successfully updated.", data: ciphertext, jwt: token });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getTrainingMatchRewards = async (request, response) => {
    try {
        const request_body = request.body;
        const { id } = request.params;
        const profile_id = request_body.id;
        const getTopicDetail = await topicsModel.getTopicById(id);
        if (!getTopicDetail.status) return response.json({ status: false, message: getTopicDetail.message, data: [] });

        var getTrainingMatchToken = await tokensModel.getTrainingMatchTokenByTopic(id, profile_id);
        if (!getTrainingMatchToken.status) return response.json({ status: false, message: getTrainingMatchToken.message, data: [] });
        if (getTrainingMatchToken.data.length == 0) {

            const getFeesNRewards = await tokensModel.getDefaultMatchFeesAndRewards()
            if (!getFeesNRewards.status) return response.json({ status: false, message: getFeesNRewards.message, data: [] });
            const feesNRewardData = getFeesNRewards.data
            if (feesNRewardData.length < 0) return response.json({ status: false, message: 'There have not added default match fees & rewards.Please add first', data: [] });

            //Add Default Fees And Rewards
            var isValidData = { status: true }
            for (var i = 0; i < feesNRewardData.length; i++) {
                var insertData = {
                    'topic_id': id,
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

                var addData = await tokensModel.addTrainingMatchFeesAndRewards(insertData);
                if (!addData.status) {
                    isValidData = { status: false, message: addData.message, data: [] };
                    break;
                }
            }
            if (!isValidData.status) { return response.json(isValidData); }
            getTrainingMatchToken = await tokensModel.getTrainingMatchTokenByTopic(id, profile_id);
        }

        const ciphertext = await encode(getTrainingMatchToken.data);
        return response.json({ status: true, message: "Match token loaded successfully.", data: ciphertext });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.addTrainingMatchRewards = async (request, response) => {
    try {

        const request_body = request.body;
        const { topic_id, options, entry_fee, win_reward, comments, color_code, game_mode, unit } = request_body.data;

        const getTrainingMatchToken = await tokensModel.isTrainingMatchFeesAndRewardsIsExist(options, topic_id);
        if (!getTrainingMatchToken.status) return response.json({ status: false, message: getTrainingMatchToken.message, data: [] });
        if (getTrainingMatchToken.isExist) return response.json({ status: false, message: 'This match token is already exist.', data: [] });

        var newFileName = "";
        if (isset(request.files) && (request.files.file)) {
            var matchTokenImage = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(matchTokenImage, 'matchTokenImage/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        } else {
            return response.json({ status: false, message: "Please select valid match token image.", data: [] });
        }

        const insertData = {
            'topic_id': topic_id,
            'options': options,
            'entry_fee': entry_fee,
            'win_reward': win_reward,
            'color_code': color_code,
            'comments': comments,
            'game_mode': 'Training',
            'unit': 'LT',

            'icon': newFileName,
            'status': 1,
            'created_at': curruntTime,
        }

        var addData = await tokensModel.addTrainingMatchFeesAndRewards(insertData);
        if (!addData.status) return response.json({ status: false, message: addData.message, data: [] });

        return response.json({ status: true, message: "Match token added successfully.", data: [] });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.editTrainingMatchRewards = async (request, response) => {
    try {

        const request_body = request.body;
        const { id, topic_id, options, entry_fee, win_reward, comments, color_code, game_mode, unit } = request_body.data;

        var getData = await tokensModel.getTrainingMatchFeesAndRewards(id);
        if (!getData.status) return response.json({ status: false, message: getData.message, data: [] });

        if (getData.data.options != options) {
            const getTrainingMatchToken = await tokensModel.isTrainingMatchFeesAndRewardsIsExist(options, topic_id);
            if (!getTrainingMatchToken.status) return response.json({ status: false, message: getTrainingMatchToken.message, data: [] });
            if (getTrainingMatchToken.isExist) return response.json({ status: false, message: 'This match token is already exist.', data: [] });
        }


        const getTokenData = getData.data
        var newFileName = "";
        if (isset(request.files) && (request.files.file)) {
            var matchTokenImage = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(matchTokenImage, 'matchTokenImage/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        }

        const insertData = {
            'id': id,
            'topic_id': topic_id,
            'options': options,
            'entry_fee': entry_fee,
            'win_reward': win_reward,
            'color_code': color_code,
            'comments': comments,
            'game_mode': 'Training',
            'unit': 'LT',
            'icon': (newFileName) ? newFileName : getTokenData.icon,
            'status': 1,
            'updated_at': curruntTime,
        }


        var addData = await tokensModel.editTrainingMatchFeesAndRewards(insertData);
        if (!addData.status) return response.json({ status: false, message: addData.message, data: [] });

        return response.json({ status: true, message: "Match token loaded successfully.", data: [] });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.deleteTrainingMatchRewards = async (request, response) => {
    try {
        const { id } = request.params;
        var getData = await tokensModel.getTrainingMatchFeesAndRewards(id);
        if (!getData.status) return response.json({ status: false, message: getData.message, data: [] });

        const updateData = { 'id': id, 'status': 0, 'updated_at': curruntTime }
        const editData = await tokensModel.editTrainingMatchFeesAndRewards(updateData);
        if (!editData.status) return response.json({ status: false, message: editData.message, data: [] });

        return response.json({ status: true, message: "Match token deleted successfully.", data: [] });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getUserTrainingMatchToken = async (request, response) => {
    try {
        const request_body = request.body;
        const { id } = request_body;

        const getProfile = await profilesModel.getProfileData(id);
        if (!getProfile.status) return response.json({ status: false, message: getProfile.message });

        const getTrainingMatchToken = await tokensModel.getTrainingMatchToken(id);

        const ciphertext = await encode(getTrainingMatchToken.data);
        return response.json({ status: true, message: "Match token loaded successfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getQuizQuestions = async (request, response) => {
    try {
        const request_body = request.body;
        const { quiz_id } = request_body.data
        const { id } = request_body;

        const getQuiz = await quizzesModel.getQuizzesDataID(quiz_id);
        if (!getQuiz.status) return response.json({ status: false, message: getQuiz.message });
        const quizData = getQuiz.data
        var isMe = false
        if (id == quizData.player_id) isMe = true
        var getDiffInHR = (new Date(curruntTime).getTime() - new Date(quizData.request_time).getTime()) / 3600000;

        if (getDiffInHR >= 24) return response.json({ status: false, message: "Quiz alraedy expired.", data: [] });

        if (quizData.request_status == 2) return response.json({ status: false, message: "Quiz alraedy accepted by opponent.", data: [] });
        if (quizData.request_status == 3) return response.json({ status: false, message: "Quiz rejected by opponent.", data: [] });
        if (quizData.request_status == 4) return response.json({ status: false, message: "Quiz alraedy expired.", data: [] });
        // var Difference_In_Days = Difference_In_Time ;

        const getQuestion = await questionnairesModel.getQuestionTopicForByQuizID(quiz_id, 0);
        if (!getQuestion.status) return response.json({ status: false, message: getQuestion.message });
        const getQuestionData = getQuestion.data;

        const ciphertext = await encode(getQuestionData);
        return response.json({ status: true, message: "Quiz question loaded successfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}


// module.exports.getQuizQuestionsIDs = async (request, response) => {
//     try {
//         const request_body = request.body;
//         const { quiz_id } = request_body.data
//         const { id } = request_body;

//         const getQuiz = await quizzesModel.getQuizzesDataID(quiz_id);
//         if (!getQuiz.status) return response.json({ status: false, message: getQuiz.message });
//         const quizData = getQuiz.data
//         var isMe = false
//         if (id == quizData.player_id) isMe = true
//         var getDiffInHR = (new Date(curruntTime).getTime() - new Date(quizData.request_time).getTime()) / 3600000;

//         if (getDiffInHR >= 24) return response.json({ status: false, message: "Quiz alraedy expired.", data: [] });

//         if (quizData.request_status == 2) return response.json({ status: false, message: "Quiz alraedy accepted by opponent.", data: [] });
//         if (quizData.request_status == 3) return response.json({ status: false, message: "Quiz rejected by opponent.", data: [] });
//         if (quizData.request_status == 4) return response.json({ status: false, message: "Quiz alraedy expired.", data: [] });
//         // var Difference_In_Days = Difference_In_Time ;

//         const getQuestion = await questionnairesModel.getQuestionIDsTopicForByQuizID(quiz_id);
//         if (!getQuestion.status) return response.json({ status: false, message: getQuestion.message });
//         const getQuestionData = getQuestion.data;

//         const ciphertext = await encode(getQuestionData);
//         return response.json({ status: true, message: "Quiz question loaded successfully.", data: ciphertext });

//     } catch (Err) {
//         console.log(Err);
//         return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
//     }
// }


module.exports.submitQuizAnswers = async (request, response) => {
    try {
        const request_body = request.body;
        const { quiz_id, answer_key, question_id, spent_time, answer, is_first, is_last } = request_body.data
        const { id } = request_body;
        //Get Quiz data
        const getQuiz = await quizzesModel.getQuizzesDataID(quiz_id);
        if (!getQuiz.status) return response.json({ status: false, message: getQuiz.message });
        const quizData = getQuiz.data


        const getTopicDetail = await topicsModel.getTopicById(quizData.topic_id);
        if (!getTopicDetail.status) return response.json({ status: false, message: getTopicDetail.message, data: [] });
        const topicData = getTopicDetail.data

        //Check login user is sender or reciver (sender mean me/player)
        var isMe = false
        var player_answer = 'opponent_answer'
        var player_answer_key = 'opponent_answer_key'
        var player_spent_time = 'opponent_spent_time'
        var play_by_player = 'play_by_opponent'
        var done_by_player = 'done_by_opponent'
        var player_time_out = 'opponent_time_out'
        var player_id = 'opponent_id'
        if (id == quizData.player_id) {
            isMe = true
            player_answer = 'player_answer'
            player_answer_key = 'player_answer_key'
            player_spent_time = 'player_spent_time'
            play_by_player = 'play_by_player'
            player_id = 'player_id'
            done_by_player = 'done_by_player'
            player_time_out = 'player_time_out'
        }

        //Get question by id
        const getQuestion = await questionnairesModel.getQuestionById(question_id);
        if (!getQuestion.status) return response.json({ status: false, message: getQuestion.message });
        const getQuestionData = getQuestion.data
        //cross check if answer key is correct but answer is wrong
        if (answer_key == 'correct_answer' && getQuestionData.correct_answer != answer) return response.json({ status: false, message: 'Please try again.' });
        //update quiz data once answer send

        if (is_first == 1) {
            //check user if try to play again with same quiz
            // if (isMe && quizData.play_by_player == 1) return response.json({ status: false, message: 'You are not play this quiz again.' });
            // if (!isMe && quizData.play_by_opponent == 1) return response.json({ status: false, message: 'You are not play this quiz again.' });

            const updateQuiz = { 'id': quiz_id, [play_by_player]: 1, 'updated_at': curruntTime }
            const editQuiz = await quizzesModel.editQuizzesData(updateQuiz)
            if (!editQuiz.status) return response.json({ status: false, message: editQuiz.message });
        }

        // var getDiffInHR = (new Date(curruntTime).getTime() - new Date(quizData.request_time).getTime()) / 3600000;

        var addData = {
            'quiz_id': quiz_id,
            'question_id': question_id,
            [player_answer]: (answer_key == 'correct_answer') ? 1 : 2,
            [player_answer_key]: answer_key,
            [player_spent_time]: spent_time,
            'status': 1,
            'updated_at': curruntTime,
        }

        //get user (is any single player play then there have one entry so at that time we just need to update)


        const getAnswer = await questionnairesModel.getSingleQuestionsByTopic(quiz_id, question_id)
        if (!getAnswer.status) return response.json({ status: false, message: getAnswer.message, data: [] });
        const getAnswerData = getAnswer.data

        //TODO:Uncomment
        // if (getAnswerData[player_answer] != 0) return response.json({ status: false, message: "You are not able to give answer twice." });
        const addAnswer = await questionnairesModel.editQuestionsAnswers(addData)
        if (!addAnswer.status) return response.json({ status: false, message: addAnswer.message });

        if (answer_key == 'correct_answer') {
            const getUserEP = await tokensModel.getExperiencePoints(id);
            if (!getUserEP.status) return response.json({ status: false, message: getUserEP.message });
            const userXpData = getUserEP.data

            const getUserExQue = await questionnairesModel.isPlayerSameQuestion(id, question_id, player_id, player_answer)
            if (!getUserExQue.status) return response.json({ status: false, message: getUserExQue.message, data: [] });

            var addXP = 10
            let xPoints = { 'user_id': id, 'xp': userXpData.xp + addXP, 'status': 1 };
            // console.log(xPoints);
            // console.log(userXpData);
            const editExperiencePoints = await tokensModel.updateExperiencePoints(xPoints);
            if (!editExperiencePoints.status) return response.json({ status: false, message: editExperiencePoints.message });

            var xpHisData = { 'user_id': id, 'topic_id': quizData.topic_id, 'xp': addXP }
            const saveXPHistory = await tokensModel.addExperienceHistoryPoints(xpHisData);
            if (!saveXPHistory.status) return response.json({ status: false, message: saveXPHistory.message, data: [] });
            //Add Experience Points History
            let addXpPoints = { 'user_id': id, 'topic_id': quizData.topic_id, 'xp': addXP, 'created_at': curruntTime };
            const addExPointsHis = await tokensModel.addExperiencePointHistory(addXpPoints);
            if (!addExPointsHis.status) return response.json({ status: false, message: addExPointsHis.message });

            if (!getUserExQue.data) {
                const getUserLP = await tokensModel.getLearningPoints(id);
                if (!getUserLP.status) return response.json({ status: false, message: getUserLP.message });
                const userLPData = getUserLP.data
                let xPoints = { 'user_id': id, 'lp': userLPData.lp + 1, 'status': 1 };
                const editLearningPoints = await tokensModel.updateLearningPoints(xPoints);
                if (!editLearningPoints.status) return response.json({ status: false, message: editLearningPoints.message });
            }
        }

        //If opponent donw with the answer we will show correct or wrong answer
        var winner_id = 0;
        var isDraw = false
        var getFinalResultArray = []
        if (is_last == 1) {
            quizData[done_by_player] = 1
            var newXP = 0
            if (quizData.done_by_player == 1 && quizData.done_by_opponent == 1) {
                const getResult = await questionnairesModel.getQuizResultByQuizID(quiz_id)
                if (!getResult.status) return response.json({ status: false, message: getResult.message });
                const resultData = getResult.data
                var speedy_used = 0;
                if (resultData.player_answer_time < resultData.opponent_answer_time) {
                    speedy_used = resultData.player_id
                } else {
                    speedy_used = resultData.opponent_id
                }

                //TODO: IF have all point and time same 
                if (resultData.player_correct_answer == resultData.opponent_correct_answer) {
                    if (resultData.player_correct_answer_time == resultData.opponent_correct_answer_time) {
                        isDraw = true
                    } else if (resultData.player_correct_answer_time < resultData.opponent_correct_answer_time) {
                        winner_id = resultData.player_id
                    } else {
                        winner_id = resultData.opponent_id
                    }
                } else if (resultData.player_correct_answer < resultData.opponent_correct_answer) {
                    winner_id = resultData.opponent_id
                } else {
                    winner_id = resultData.player_id
                }
                //TODO: check lt proper

                const getMatchToken = await tokensModel.getTrainingMatchTokenByEntryFee(quizData.spent_learning_token, quizData.topic_id)
                if (!getMatchToken.status) return response.json({ status: false, message: getMatchToken.message });
                const matchTokenData = getMatchToken.data
                const winningToken = matchTokenData.win_reward;
                const entryFeeToken = matchTokenData.entry_fee;

                if (isDraw) {

                    // Sender
                    const getSenderLT = await tokensModel.getUserLearningToken(quizData.player_id);
                    if (!getSenderLT.status) return response.json({ status: false, message: getSenderLT.message });
                    const senderLearningToken = getSenderLT.data

                    senderLearningToken.learning_token = senderLearningToken.learning_token + entryFeeToken
                    const updateSenderLT = await tokensModel.updateLearningToken(senderLearningToken)
                    if (!updateSenderLT.status) return response.json({ status: false, message: updateSenderLT.message });

                    //Add Learning token history
                    const senLearningToketnHis = { 'user_id': quizData.player_id, 'learning_token': entryFeeToken, 'status': 1, 'reason_for': 2, 'quiz_id': quiz_id };
                    const addSenLearningTokenHis = await tokensModel.addLearningTokenHis(senLearningToketnHis);
                    if (!addSenLearningTokenHis.status) return response.json({ status: false, message: addSenLearningTokenHis.message });

                    //Opponent
                    const getOppoLT = await tokensModel.getUserLearningToken(quizData.opponent_id);
                    if (!getOppoLT.status) return response.json({ status: false, message: getOppoLT.message });
                    const oppoLearningToken = getOppoLT.data

                    oppoLearningToken.learning_token = oppoLearningToken.learning_token + entryFeeToken
                    const updateOppoLT = await tokensModel.updateLearningToken(oppoLearningToken)
                    if (!updateOppoLT.status) return response.json({ status: false, message: updateOppoLT.message });

                    //Add Learning token history
                    const oppoLearningToketnHis = { 'user_id': quizData.opponent_id, 'learning_token': entryFeeToken, 'status': 1, 'reason_for': 2, 'quiz_id': quiz_id };
                    const oppoSenLearningTokenHis = await tokensModel.addLearningTokenHis(oppoLearningToketnHis);
                    if (!oppoSenLearningTokenHis.status) return response.json({ status: false, message: oppoSenLearningTokenHis.message });


                } else {
                    const getUserLT = await tokensModel.getUserLearningToken(winner_id);
                    if (!getUserLT.status) return response.json({ status: false, message: getUserLT.message });
                    const learningToken = getUserLT.data

                    learningToken.learning_token = learningToken.learning_token + winningToken
                    const updateLT = await tokensModel.updateLearningToken(learningToken)
                    if (!updateLT.status) return response.json({ status: false, message: updateLT.message });

                    //Add Learning token history
                    const learningToketnHis = { 'user_id': winner_id, 'learning_token': winningToken, 'status': 1, 'reason_for': 2, 'quiz_id': quiz_id };
                    const addLearningTokenHis = await tokensModel.addLearningTokenHis(learningToketnHis);
                    if (!addLearningTokenHis.status) return response.json({ status: false, message: addLearningTokenHis.message });
                }

                const getNotification = await notificationsModel.getNotificationDataByQuiz(quiz_id)
                if (!getNotification.status) return response.json({ status: false, message: getNotification.message });
                const getNotificationData = getNotification.data

                const editNoti = {
                    'id': getNotificationData.id,
                    'sender_status': (isDraw) ? 12 : 10,//Owner loss
                    'receiver_status': (isDraw) ? 12 : 9,//Opponent win
                    'updated_at': curruntTime,
                }
                if (!isDraw) {
                    if (quizData.player_id == winner_id) {
                        editNoti.sender_status = 9//Owner win
                        editNoti.receiver_status = 10//Opponent loss

                        const getWinerUserEP = await tokensModel.getExperiencePoints(winner_id);
                        if (!getWinerUserEP.status) return response.json({ status: false, message: getWinerUserEP.message });
                        const winnerUserXpData = getWinerUserEP.data
                        var xPointData = (winner_id == speedy_used) ? 20 : 10;
                        let winnerXPoints = { 'user_id': winner_id, 'xp': winnerUserXpData.xp + xPointData, 'status': 1 };
                        const editWinnerExperiencePoints = await tokensModel.updateExperiencePoints(winnerXPoints);
                        if (!editWinnerExperiencePoints.status) return response.json({ status: false, message: editWinnerExperiencePoints.message });

                        var xpHisData = { 'user_id': winner_id, 'topic_id': quizData.topic_id, 'xp': xPointData }
                        const saveXPHistory = await tokensModel.addExperienceHistoryPoints(xpHisData);
                        if (!saveXPHistory.status) return response.json({ status: false, message: saveXPHistory.message, data: [] });
                    } else {
                        const getLoserUserEP = await tokensModel.getExperiencePoints(quizData.player_id);
                        if (!getLoserUserEP.status) return response.json({ status: false, message: getLoserUserEP.message });
                        const loserUserXpData = getLoserUserEP.data
                        var xPointData = (winner_id == speedy_used) ? 20 : 10;
                        let loserXPoints = { 'user_id': quizData.player_id, 'xp': loserUserXpData.xp + xPointData, 'status': 1 };
                        const editLoserExperiencePoints = await tokensModel.updateExperiencePoints(loserXPoints);
                        if (!editLoserExperiencePoints.status) return response.json({ status: false, message: editLoserExperiencePoints.message });

                        var xpHisData = { 'user_id': quizData.player_id, 'topic_id': quizData.topic_id, 'xp': xPointData }
                        const saveXPHistory = await tokensModel.addExperienceHistoryPoints(xpHisData);
                        if (!saveXPHistory.status) return response.json({ status: false, message: saveXPHistory.message, data: [] });
                    }
                }

                const saveNotification = await notificationsModel.editNotificationsData(editNoti)
                if (!saveNotification.status) return response.json({ status: false, message: saveNotification.message });


            }
            var getAnsData = {
                'id': id,
                'quiz_id': quiz_id,
                'player_id': player_id,
                'player_answer': player_answer,
                'player_answer_key': player_answer_key,
                'player_spent_time': player_spent_time,
                'player_time_out': player_time_out,
            }

            const getFinalResult = await questionnairesModel.getQuizResultWithAnswerByUserID(getAnsData);
            if (!getFinalResult.status) return response.json({ status: false, message: getFinalResult.message });
            getFinalResultArray = getFinalResult.data
            const updateQuiz = { 'id': quiz_id, 'winner_id': (!isDraw) ? winner_id : 0, 'is_draw': (isDraw) ? 1 : 0, [done_by_player]: 1, 'updated_at': curruntTime }
            const editQuiz = await quizzesModel.editQuizzesData(updateQuiz)
            if (!editQuiz.status) return response.json({ status: false, message: editQuiz.message });

            //get player summury if play with same question_id at that time we will not any xp






        }

        const ciphertext = await encode(getFinalResultArray);
        return response.json({ status: true, message: "success.", "winner_id": (!isDraw) ? winner_id : '-1', data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}


module.exports.getQuizDetailByID = async (request, response) => {
    try {
        const { id } = request.params;

        const getQuiz = await quizzesModel.getQuizzesDataID(id);
        if (!getQuiz.status) return response.json({ status: false, message: getQuiz.message });
        const quizzesData = getQuiz.data

        const ciphertext = await encode(quizzesData);
        return response.json({ status: true, message: "Quiz loaded successfully.", data: ciphertext });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}



module.exports.stopQuizTimer = async (request, response) => {
    try {
        const { id } = request.params;

        const getQuiz = await quizzesModel.getQuizzesDataID(id);
        if (!getQuiz.status) return response.json({ status: false, message: getQuiz.message });

        const updateQuiz = { 'id': id, 'is_timer_on': 0, 'updated_at': curruntTime }
        const editQuiz = await quizzesModel.editQuizzesData(updateQuiz)
        if (!editQuiz.status) return response.json({ status: false, message: editQuiz.message });

        return response.json({ status: true, message: "Quiz updated successfully.", data: [] });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}


module.exports.quizAcceptedByOpponent = async (request, response) => {
    try {
        const request_body = request.body;
        const { quiz_id, opponent_id } = request_body.data
        const { id } = request_body;


        const getNotification = await notificationsModel.getNotificationDataByQuiz(quiz_id)
        if (!getNotification.status) return response.json({ status: false, message: getNotification.message });
        const getNotificationData = getNotification.data
        var sendStatus = 0;
        if (getNotificationData.receiver_id == opponent_id && getNotificationData.sender_id == id && getNotificationData.receiver_status == 4 && getNotificationData.sender_status == 3) {
            sendStatus = 1;
        } else if (getNotificationData.receiver_id == opponent_id && getNotificationData.sender_id == id && getNotificationData.receiver_status == 6 && getNotificationData.sender_status == 5) {
            sendStatus = 2;
        }
        const ciphertext = await encode(sendStatus);
        return response.json({ status: true, data: ciphertext });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.isPlayerDoneWithQue = async (request, response) => {
    try {
        const { id } = request.params;

        const getQuizQue = await questionnairesModel.getQuizQuestionByID(id)
        if (!getQuizQue.status) return response.json({ status: false, message: getQuizQue.message });
        const getQuizQueData = getQuizQue.data

        const ciphertext = await encode(getQuizQueData);
        return response.json({ status: true, data: ciphertext });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getQuizResultByID = async (request, response) => {
    try {
        const quiz_id = request.params.id;
        const request_body = request.body;
        const { id } = request_body;

        const getQuiz = await quizzesModel.getQuizzesDataID(quiz_id);
        if (!getQuiz.status) return response.json({ status: false, message: getQuiz.message });
        const quizData = getQuiz.data
        var player_answer = 'opponent_answer'
        var player_answer_key = 'opponent_answer_key'
        var player_spent_time = 'opponent_spent_time'
        var player_time_out = 'opponent_time_out'
        var player_id = 'opponent_id'
        if (id == quizData.player_id) {
            player_answer = 'player_answer'
            player_answer_key = 'player_answer_key'
            player_spent_time = 'player_spent_time'
            player_time_out = 'player_time_out'
            player_id = 'player_id'
        }

        var getAnsData = {
            'id': id,
            'quiz_id': quiz_id,
            'player_id': player_id,
            'player_answer': player_answer,
            'player_answer_key': player_answer_key,
            'player_spent_time': player_spent_time,
            'player_time_out': player_time_out,
        }

        const getFinalResult = await questionnairesModel.getQuizResultWithAnswerByUserID(getAnsData);
        if (!getFinalResult.status) return response.json({ status: false, message: getFinalResult.message });
        const getFinalResultArray = getFinalResult.data

        const ciphertext = await encode(getFinalResultArray);
        return response.json({ status: true, message: "Quiz loaded successfully.", data: ciphertext });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.timeOutQuizAnswers = async (request, response) => {
    try {
        const request_body = request.body;
        const { quiz_id, question_id, spent_time, is_first, is_last } = request_body.data
        const { id } = request_body;
        //Get Quiz data
        const getQuiz = await quizzesModel.getQuizzesDataID(quiz_id);
        if (!getQuiz.status) return response.json({ status: false, message: getQuiz.message });
        const quizData = getQuiz.data
        //Check login user is sender or reciver (sender mean me/player)
        var isMe = false
        var player_spent_time = 'opponent_spent_time'
        var play_by_player = 'play_by_opponent'
        var done_by_player = 'done_by_opponent'
        var player_time_out = 'opponent_time_out'
        var player_answer = 'opponent_answer'
        var player_id = 'opponent_id'
        var player_answer_key = 'opponent_answer_key'
        if (id == quizData.player_id) {
            isMe = true
            player_spent_time = 'player_spent_time'
            play_by_player = 'play_by_player'
            player_id = 'player_id'
            done_by_player = 'done_by_player'
            player_time_out = 'player_time_out'
            player_answer = 'player_answer'
            player_answer_key = 'player_answer_key'
        }

        //Get question by id
        const getQuestion = await questionnairesModel.getQuestionById(question_id);
        if (!getQuestion.status) return response.json({ status: false, message: getQuestion.message });
        const getQuestionData = getQuestion.data
        //cross check if answer key is correct but answer is wrong

        if (is_first == 1) {
            //check user if try to play again with same quiz

            const updateQuiz = { 'id': quiz_id, [play_by_player]: 1, 'updated_at': curruntTime }
            const editQuiz = await quizzesModel.editQuizzesData(updateQuiz)
            if (!editQuiz.status) return response.json({ status: false, message: editQuiz.message });
        }

        var addData = {
            'quiz_id': quiz_id,
            'question_id': question_id,
            [player_answer]: 0,
            [player_spent_time]: spent_time,
            [player_time_out]: 1,
            'status': 1,
            'updated_at': curruntTime,

        }


        //TODO:Uncomment
        // if (getAnswerData[player_answer] != 0) return response.json({ status: false, message: "You are not able to give answer twice." });
        const addAnswer = await questionnairesModel.editQuestionsAnswers(addData)
        if (!addAnswer.status) return response.json({ status: false, message: addAnswer.message });



        //If opponent donw with the answer we will show correct or wrong answer
        var winner_id = 0;
        var isDraw = false;
        var getFinalResultArray = []
        if (is_last == 1) {
            quizData[done_by_player] = 1
            if (quizData.done_by_player == 1 && quizData.done_by_opponent == 1) {
                const getResult = await questionnairesModel.getQuizResultByQuizID(quiz_id)
                if (!getResult.status) return response.json({ status: false, message: getResult.message });
                const resultData = getResult.data
                var speedy_used = 0;
                if (resultData.player_answer_time < resultData.opponent_answer_time) {
                    speedy_used = resultData.player_id
                } else {
                    speedy_used = resultData.opponent_id
                }
                //TODO: IF have all point and time same 
                if (resultData.player_correct_answer == resultData.opponent_correct_answer) {
                    if (resultData.player_correct_answer_time == resultData.opponent_correct_answer_time) {
                        isDraw = true
                    } else if (resultData.player_correct_answer_time < resultData.opponent_correct_answer_time) {
                        winner_id = resultData.player_id
                    } else {
                        winner_id = resultData.opponent_id
                    }
                } else if (resultData.player_correct_answer < resultData.opponent_correct_answer) {
                    winner_id = resultData.opponent_id
                } else {
                    winner_id = resultData.player_id
                }
                //TODO: check lt proper


                const getMatchToken = await tokensModel.getTrainingMatchTokenByEntryFee(quizData.spent_learning_token, quizData.topic_id)
                if (!getMatchToken.status) return response.json({ status: false, message: getMatchToken.message });
                const matchTokenData = getMatchToken.data
                const winningToken = matchTokenData.win_reward;
                const entryFeeToken = matchTokenData.entry_fee;

                if (isDraw) {

                    // Sender
                    const getSenderLT = await tokensModel.getUserLearningToken(quizData.player_id);
                    if (!getSenderLT.status) return response.json({ status: false, message: getSenderLT.message });
                    const senderLearningToken = getSenderLT.data

                    senderLearningToken.learning_token = senderLearningToken.learning_token + entryFeeToken
                    const updateSenderLT = await tokensModel.updateLearningToken(senderLearningToken)
                    if (!updateSenderLT.status) return response.json({ status: false, message: updateSenderLT.message });

                    //Add Learning token history
                    const senLearningToketnHis = { 'user_id': quizData.player_id, 'learning_token': entryFeeToken, 'status': 1, 'reason_for': 2, 'quiz_id': quiz_id };
                    const addSenLearningTokenHis = await tokensModel.addLearningTokenHis(senLearningToketnHis);
                    if (!addSenLearningTokenHis.status) return response.json({ status: false, message: addSenLearningTokenHis.message });

                    //Opponent
                    const getOppoLT = await tokensModel.getUserLearningToken(quizData.opponent_id);
                    if (!getOppoLT.status) return response.json({ status: false, message: getOppoLT.message });
                    const oppoLearningToken = getOppoLT.data

                    oppoLearningToken.learning_token = oppoLearningToken.learning_token + entryFeeToken
                    const updateOppoLT = await tokensModel.updateLearningToken(oppoLearningToken)
                    if (!updateOppoLT.status) return response.json({ status: false, message: updateOppoLT.message });

                    //Add Learning token history
                    const oppoLearningToketnHis = { 'user_id': quizData.opponent_id, 'learning_token': entryFeeToken, 'status': 1, 'reason_for': 2, 'quiz_id': quiz_id };
                    const oppoSenLearningTokenHis = await tokensModel.addLearningTokenHis(oppoLearningToketnHis);
                    if (!oppoSenLearningTokenHis.status) return response.json({ status: false, message: oppoSenLearningTokenHis.message });


                } else {

                    const getUserLT = await tokensModel.getUserLearningToken(winner_id);
                    if (!getUserLT.status) return response.json({ status: false, message: getUserLT.message });
                    const learningToken = getUserLT.data

                    learningToken.learning_token = learningToken.learning_token + winningToken
                    const updateLT = await tokensModel.updateLearningToken(learningToken)
                    if (!updateLT.status) return response.json({ status: false, message: updateLT.message });

                    //Add Learning token history
                    const learningToketnHis = { 'user_id': winner_id, 'learning_token': winningToken, 'status': 1, 'reason_for': 2, 'quiz_id': quiz_id };
                    const addLearningTokenHis = await tokensModel.addLearningTokenHis(learningToketnHis);
                    if (!addLearningTokenHis.status) return response.json({ status: false, message: addLearningTokenHis.message });
                }
                const getNotification = await notificationsModel.getNotificationDataByQuiz(quiz_id)
                if (!getNotification.status) return response.json({ status: false, message: getNotification.message });
                const getNotificationData = getNotification.data

                const editNoti = {
                    'id': getNotificationData.id,
                    'sender_status': (isDraw) ? 12 : 10,//Owner loss
                    'receiver_status': (isDraw) ? 12 : 9,//Opponent win
                    'updated_at': curruntTime,
                }
                if (!isDraw) {
                    if (quizData.player_id == winner_id) {
                        editNoti.sender_status = 9//Owner win
                        editNoti.receiver_status = 10//Opponent loss
                    }
                }
                const saveNotification = await notificationsModel.editNotificationsData(editNoti)
                if (!saveNotification.status) return response.json({ status: false, message: saveNotification.message });


            }
            var getAnsData = {
                'id': id,
                'quiz_id': quiz_id,
                'player_id': player_id,
                'player_answer': player_answer,
                'player_answer_key': player_answer_key,
                'player_spent_time': player_spent_time,
                'player_time_out': player_time_out,
            }

            const getFinalResult = await questionnairesModel.getQuizResultWithAnswerByUserID(getAnsData);
            if (!getFinalResult.status) return response.json({ status: false, message: getFinalResult.message });
            getFinalResultArray = getFinalResult.data

            const updateQuiz = { 'id': quiz_id, 'winner_id': (!isDraw) ? winner_id : 0, 'is_draw': (isDraw) ? 1 : 0, [done_by_player]: 1, 'updated_at': curruntTime }
            const editQuiz = await quizzesModel.editQuizzesData(updateQuiz)
            if (!editQuiz.status) return response.json({ status: false, message: editQuiz.message });
        }

        const ciphertext = await encode(getFinalResultArray);
        return response.json({ status: true, message: "success.", "winner_id": (!isDraw) ? winner_id : '-1', data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}


module.exports.getDefaultMatchRewards = async (request, response) => {
    try {

        const getTrainingMatchToken = await tokensModel.getDefaultMatchFeesAndRewards();
        if (!getTrainingMatchToken.status) return response.json({ status: false, message: editQuiz.message });
        const ciphertext = await encode(getTrainingMatchToken.data);
        return response.json({ status: true, message: "Match token loaded successfully.", data: ciphertext });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.addDefaultMatchRewards = async (request, response) => {
    try {

        const request_body = request.body;
        const { options, entry_fee, win_reward, color_code, game_mode, unit, bot_speed_from, bot_speed_to, bot_correct_answer_from, bot_correct_answer_to, bot_error_from, bot_error_to } = request_body.data;

        const getTrainingMatch = await tokensModel.isDefaultMatchFeesAndRewardsIsExist(options);
        if (!getTrainingMatch.status) return response.json({ status: false, message: getTrainingMatch.message, data: [] });
        if (getTrainingMatch.isExist) return response.json({ status: false, message: 'This match fees and rewards is already exist.', data: [] });

        var newFileName = "";
        if (isset(request.files) && (request.files.file)) {
            var matchTokenImage = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(matchTokenImage, 'matchTokenImage/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        } else {
            return response.json({ status: false, message: "Please select valid match fees and rewards image.", data: [] });
        }

        const insertData = {
            'options': options,
            'entry_fee': entry_fee,
            'win_reward': win_reward,
            'color_code': color_code,
            'game_mode': game_mode,
            'unit': unit,
            'icon': newFileName,
            'status': 1,
            'created_at': curruntTime,
            'bot_speed_from': bot_speed_from,
            'bot_speed_to': bot_speed_to,
            'bot_correct_answer_from': bot_correct_answer_from,
            'bot_correct_answer_to': bot_correct_answer_to,
            'bot_error_from': bot_error_from,
            'bot_error_to': bot_error_to
        }

        var addData = await tokensModel.addDefaultMatchFeesAndRewards(insertData);
        if (!addData.status) return response.json({ status: false, message: addData.message, data: [] });

        return response.json({ status: true, message: "Match fees and rewards added successfully.", data: [] });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.editDefaultMatchRewards = async (request, response) => {
    try {

        const request_body = request.body;
        console.log(request_body.data);
        const { id, options, entry_fee, win_reward, color_code, game_mode, unit, bot_speed_from, bot_speed_to, bot_correct_answer_from, bot_correct_answer_to, bot_error_from, bot_error_to } = request_body.data;

        var getData = await tokensModel.getDefaultMatchFeesAndRewardsByID(id);
        if (!getData.status) return response.json({ status: false, message: getData.message, data: [] });

        if (getData.data.options != options) {
            const getTrainingMatch = await tokensModel.isDefaultMatchFeesAndRewardsIsExist(options);
            if (!getTrainingMatch.status) return response.json({ status: false, message: getTrainingMatch.message, data: [] });
            if (getTrainingMatch.isExist) return response.json({ status: false, message: 'This match fees and rewards is already exist.', data: [] });
        }


        const getTokenData = getData.data
        var newFileName = "";
        if (isset(request.files) && (request.files.file)) {
            var matchTokenImage = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(matchTokenImage, 'matchTokenImage/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        }

        const insertData = {
            'id': id,
            'options': options,
            'entry_fee': entry_fee,
            'win_reward': win_reward,
            'color_code': color_code,
            'game_mode': game_mode,
            'unit': unit,
            'icon': (newFileName) ? newFileName : getTokenData.icon,
            'status': 1,
            'updated_at': curruntTime,
            'bot_speed_from': bot_speed_from,
            'bot_speed_to': bot_speed_to,
            'bot_correct_answer_from': bot_correct_answer_from,
            'bot_correct_answer_to': bot_correct_answer_to,
            'bot_error_from': bot_error_from,
            'bot_error_to': bot_error_to
        }


        var addData = await tokensModel.editDefaultMatchFeesAndRewards(insertData);
        if (!addData.status) return response.json({ status: false, message: addData.message, data: [] });

        return response.json({ status: true, message: "Match token loaded successfully.", data: [] });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.deleteDefaultMatchRewards = async (request, response) => {
    try {
        const { id } = request.params;
        var getData = await tokensModel.getDefaultMatchFeesAndRewardsByID(id);
        if (!getData.status) return response.json({ status: false, message: getData.message, data: [] });

        const updateData = { 'id': id, 'status': 0, 'updated_at': curruntTime }
        const editData = await tokensModel.editDefaultMatchFeesAndRewards(updateData);
        if (!editData.status) return response.json({ status: false, message: editData.message, data: [] });

        return response.json({ status: true, message: "Match token deleted successfully.", data: [] });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}


module.exports.testFunction = async (request, response) => {
    try {

        var xpHisData = { 'user_id': 1, 'topic_id': 1, 'xp': 10 }
        const saveXPHistory = await tokensModel.addExperienceHistoryPoints(xpHisData);
        if (!saveXPHistory.status) return response.json({ status: false, message: saveXPHistory.message, data: [] });
        return response.json({ status: true, message: "loaded successfully.", data: getData.data });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}