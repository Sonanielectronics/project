const quizzesModel = require('../../model/quizzes_model');
const moment = require('moment');
const curruntTime = moment(new Date()).format('YYYY-MM-DD hh:mm:00')


module.exports.expiredQuiz = async (request, response) => {
    try {
        const today = Math.round(new Date().getTime() / 1000);
        const yesTimestamp = (today - (24 * 3600)) * 1000;
        const yesterday = moment(new Date(yesTimestamp)).format('YYYY-MM-DD hh:mm:00')

        const getExpiredQuiz = await quizzesModel.getExpiredQuizList(yesterday);
        if (!getExpiredQuiz.status) return true;
        const expiredQuizData = getExpiredQuiz.data
        if (expiredQuizData.length > 0) {
            const updateQuiz = await quizzesModel.expiredQuiz(yesterday, curruntTime)
        }
        return true;
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}
