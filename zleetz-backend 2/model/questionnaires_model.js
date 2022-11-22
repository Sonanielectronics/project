const config = require("../config/config");
const database = require("../config/db");
const crypto = require('crypto');
var randomstring = require("randomstring");


module.exports.getAllQuestionList = async (question) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT
                                    QUE.id,
                                    QUE.question,
                                    QUE.correct_answer,
                                    QUE.wrong_answer_1,
                                    QUE.wrong_answer_2,
                                    QUE.wrong_answer_3,
                                    (
                                    SELECT NAME
                                FROM
                                    difficulty_levels
                                WHERE
                                    id = QUE.difficulty_level_id
                                ) AS difficulty_levels,
                                QUE.time_for_question,
                                QUE.time_for_answer,
                                (
                                    SELECT
                                        GROUP_CONCAT(TOP.name SEPARATOR ';') AS topics
                                    FROM
                                        question_topics QUETOP
                                    INNER JOIN topics TOP ON
                                        TOP.id = QUETOP.topic_id
                                    WHERE
                                        QUETOP.status = 1 AND QUETOP.question_id = QUE.id
                                ) AS topics,
                                CASE WHEN QUE.is_question_image = 1 THEN 'YES' ELSE 'NO'
                                END allow_image,
                                QUE.question_image AS image
                                FROM
                                    questionnaires QUE WHERE QUE.status = 1 ORDER BY QUE.id DESC;`;
        database.query(check_ex_record, [question], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get question detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: true, data: [] });

        })
    });
}

module.exports.getQuestionsByQue = async (question, correct_answer) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM questionnaires WHERE question = ? AND correct_answer = ? AND status = 1;`;
        database.query(check_ex_record, [question, correct_answer], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get question detail." + err });
            var isExist = false;
            if (result && result.length > 0) isExist = true;
            return resolve({ status: true, data: isExist });

        })
    });
}

module.exports.getQuestionsByID = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM questionnaires WHERE id = ? AND status = 1;`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get question detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, data: [], message: "Question record not found." });

        })
    });
}

module.exports.insertQuestionData = async (posted_data) => {
    return new Promise(async resolve => {
        var sql = database.query(`INSERT INTO questionnaires SET ? ;`, posted_data, function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert question data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert question data.', data: [] });
        });
    });
}

module.exports.insertQuestionReportData = async (posted_data) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO reported_questions SET ?`, posted_data, function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while report the question.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while report the question..', data: [] });
        });
    });
}

module.exports.insertQuestionCountryData = async (posted_data) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO question_countries_relevance (question_id, country_id) values ?`, [posted_data], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert countries data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert countries data.', data: [] });
        });
    });
}


module.exports.getQuestionCountry = async (id) => {
    return new Promise(async resolve => {
        let getRecord = `SELECT
                            CON.id,
                            CON.name,
                            CON.country_code
                        FROM
                            question_countries_relevance QCL
                        INNER JOIN countries CON ON
                            CON.id = QCL.country_id
                        WHERE
                            QCL.question_id = ? AND QCL.status = 1;`;
        database.query(getRecord, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get country detail." + err });
            return resolve({ status: true, data: result });
        })
    });
}


module.exports.getQuestionTopic = async (id) => {
    return new Promise(async resolve => {
        let getRecord = `SELECT
                            T.id,
                            T.name
                        FROM
                            question_topics QT
                        INNER JOIN topics T ON
                            T.id = QT.topic_id
                        WHERE
                            QT.question_id = ? AND QT.status = 1;`;
        database.query(getRecord, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get regions detail." + err });
            return resolve({ status: true, data: result });
        })
    });
}

module.exports.getQuestionByTopicID = async (id) => {
    return new Promise(async resolve => {
        let getRecord = `SELECT
                            T.id,
                            T.name
                        FROM
                            question_topics QT
                        INNER JOIN topics T ON
                            T.id = QT.topic_id
                        WHERE
                            T.id = ? AND QT.status = 1;`;
        database.query(getRecord, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get regions detail." + err });
            return resolve({ status: true, data: result });
        })
    });
}

module.exports.insertQuestionTopicData = async (posted_data) => {
    return new Promise(async resolve => {
        var sql = database.query(`INSERT INTO question_topics (question_id, topic_id) values ?`, [posted_data], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert topic data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert topic data.', data: [] });
        });
    });
}

module.exports.getQuestionById = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT 
                                id,
                                question,
                                correct_answer,
                                wrong_answer_1,
                                wrong_answer_2,
                                wrong_answer_3,
                                difficulty_level_id,
                                time_for_question,
                                time_for_answer,
                                is_question_image,
                                question_image,
                                status,created_at FROM questionnaires WHERE id = ? AND status = 1`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get Question detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, message: "Question not found." });
        })
    });
}


module.exports.updateQuestionData = async (updateData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE questionnaires SET ? WHERE id = ?`;
        database.query(updateQry, [updateData, updateData.id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update Question data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update Question data' });
        });
    });
}

module.exports.updateQueCountryData = async (questionID) => {
    return new Promise(async resolve => {
        database.query(`UPDATE question_countries_relevance SET status = 0 WHERE question_id = ?`, [questionID], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update question country data.' + err });
            return resolve({ status: true, message: 'success' });
        });
    });
}

module.exports.updateQueTopicData = async (questionID) => {
    return new Promise(async resolve => {
        database.query(`UPDATE question_topics SET status = 0 WHERE question_id = ?`, [questionID], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update question topic data.' + err });
            return resolve({ status: true, message: 'success' });
        });
    });
}


module.exports.getAllQuestionsList = async (data) => {
    return new Promise(async resolve => {
        var topicJoin = '';
        if (data.topic_id) topicJoin = ` INNER JOIN question_topics QUE_TOP ON QUE_TOP.question_id = QUE.id `

        let get_record = `SELECT 
                                    QUE.id,
                                    QUE.question,
                                    QUE.correct_answer,
                                    QUE.wrong_answer_1,
                                    QUE.wrong_answer_2,
                                    QUE.wrong_answer_3,
                                    QUE.difficulty_level_id,
                                    QUE.time_for_question,
                                    QUE.time_for_answer,
                                    QUE.is_question_image,
                                    QUE.question_image,
                                    QUE.status,
                                    QUE.created_at,
                                    (SELECT GROUP_CONCAT(DISTINCT(T.name) SEPARATOR ';') AS topics FROM question_topics QT INNER JOIN topics T ON T.id = QT.topic_id WHERE QT.question_id = QUE.id AND QT.status = 1) AS topic_list
                                FROM questionnaires QUE
                                ${topicJoin}
                                WHERE QUE.status = 1`

        if (data.search != null) get_record += ` AND QUE.question LIKE '%${data.search}%' `
        if (data.topic_id) get_record += ` AND QUE_TOP.topic_id = '${data.topic_id}' `;
        get_record += ` GROUP BY QUE.id ORDER BY QUE.id DESC LIMIT ${data.limit} OFFSET ${data.offset};`;
        database.query(get_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get question list1." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Record not found." });
        })
    });
}

module.exports.getAllQuestionsCount = async (data) => {
    return new Promise(async resolve => {
        var topicJoin = '';
        if (data.topic_id) topicJoin = ` INNER JOIN question_topics QUE_TOP ON QUE_TOP.question_id = QUE.id `

        let get_record = `SELECT COUNT(DISTINCT (QUE.id)) AS total_record
                                FROM questionnaires QUE
                                ${topicJoin}
                                WHERE QUE.status = 1`

        if (data.search != null) get_record += ` AND QUE.question LIKE '%${data.search}%' `
        if (data.topic_id) get_record += ` AND QUE_TOP.topic_id = '${data.topic_id}' `;

        database.query(get_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get question detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0].total_record });
            return resolve({ status: true, data: 0 });
        })
    });
}

// module.exports.getQuestionTopicForQuiz = async (data) => {
//     return new Promise(async resolve => {
//         let get_record = `SELECT
//                             QUE.id,
//                             QUE.question,
//                             QUE.correct_answer,
//                             QUE.wrong_answer_1,
//                             QUE.wrong_answer_2,
//                             QUE.wrong_answer_3,
//                             QUE.difficulty_level_id,
//                             QUE.regional_relevance,
//                             QUE.time_for_question,
//                             QUE.time_for_answer,
//                             QUE.is_question_image,
//                             QUE.question_image,
//                             QUE.status,
//                             QUE.created_at,
//                             (
//                                 QUE.time_for_question + QUE.time_for_answer
//                             ) AS question_time
//                         FROM
//                             questionnaires QUE
//                         INNER JOIN question_topics QUE_TOP ON
//                             QUE_TOP.question_id = QUE.id
//                         WHERE QUE.status = 1
//                             AND QUE_TOP.topic_id = ${data.topic_id}
//                             AND QUE.regional_relevance = '${data.regional_relevance}'
//                         GROUP BY QUE.id
//                         HAVING question_time <= ${data.question_time}
//                         LIMIT ${data.limit}`

//         database.query(get_record, async function (err, result) {
//             if (err) return resolve({ status: false, message: "Something is wrong.while get question list." + err });
//             if (result && result.length > 0) return resolve({ status: true, data: result });
//             return resolve({ status: false, message: "This topic Question not found." });
//         })
//     });
// }

module.exports.getQuestionTopicForQuiz = async (data) => {
    return new Promise(async resolve => {
        var notIn = ''
        //FIXME:check con for not in que
        if (data.not_in.length != 0) notIn = ` AND QUE.id NOT IN (${data.not_in}) `
        let get_record = `SELECT
                            QUE.id,
                            QUE.question,
                            QUE.correct_answer,
                            QUE.wrong_answer_1,
                            QUE.wrong_answer_2,
                            QUE.wrong_answer_3,
                            (
                                QUE.time_for_question + QUE.time_for_answer
                            ) AS question_time
                        FROM
                            questionnaires QUE
                        INNER JOIN question_topics QUE_TOP ON
                            QUE_TOP.question_id = QUE.id
                        WHERE QUE.status = 1
                            AND QUE_TOP.topic_id = ${data.topic_id}
                            AND QUE.regional_relevance = '${data.regional_relevance}'
                            ${notIn}
                        GROUP BY QUE.id
                        HAVING question_time <= ${data.question_time}
                        ORDER BY RAND() 
                        LIMIT ${data.limit};`
        database.query(get_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get question list2." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: true, message: "This topic Question not found.", data: [] });
        })
    });
}
module.exports.getQuestionTopicForByQuizID = async (quiz_id, is_bot) => {
    return new Promise(async resolve => {
        var selectTime = ``
        if (is_bot && is_bot == 1) selectTime = ` QQA.opponent_spent_time AS bot_time, `
        let get_record = `SELECT
                            QUE.id,
                            QQA.id as question_id,
                            QUE.question,
                            QUE.correct_answer,
                            QUE.wrong_answer_1,
                            QUE.wrong_answer_2,
                            QUE.wrong_answer_3,
                            ${selectTime}
                            (
                                QUE.time_for_question + QUE.time_for_answer
                            ) AS question_time
                        FROM
                            questionnaires QUE
                        INNER JOIN quiz_questions_answers QQA ON
                            QQA.question_id = QUE.id
                        WHERE QUE.status = 1
                            AND QQA.quiz_id = ?
                        ORDER BY QUE.id DESC`
        database.query(get_record, [quiz_id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get question list." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "This topic Question not found." });
        })
    });
}

// module.exports.getQuestionIDsTopicForByQuizID = async (quiz_id) => {
//     return new Promise(async resolve => {
//         let get_record = `SELECT
//                             QUE.id,
//                             QQA.id as question_id,
//                             QUE.question,
//                             QUE.correct_answer,
//                             QUE.wrong_answer_1,
//                             QUE.wrong_answer_2,
//                             QUE.wrong_answer_3,
//                             (
//                                 QUE.time_for_question + QUE.time_for_answer
//                             ) AS question_time
//                         FROM
//                             questionnaires QUE
//                         INNER JOIN quiz_questions_answers QQA ON
//                             QQA.question_id = QUE.id
//                         WHERE QUE.status = 1
//                             AND QQA.quiz_id = ?
//                         ORDER BY QUE.id DESC`
//         database.query(get_record, [quiz_id], async function (err, result) {
//             if (err) return resolve({ status: false, message: "Something is wrong.while get question list3." + err });
//             if (result && result.length > 0) return resolve({ status: true, data: result });
//             return resolve({ status: false, message: "This topic Question not found." });
//         })
//     });
// }

module.exports.addQuestionsAnswers = async (posted_data) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO quiz_questions_answers SET ?`, posted_data, function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert question data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert question data.', data: [] });
        });
    });
}

module.exports.addQuizQuestions = async (posted_data) => {
    return new Promise(async resolve => {
        var sql = database.query(`INSERT INTO quiz_questions_answers (player_id,opponent_id,quiz_id, question_id,status) values ?`, [posted_data], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert questions of quiz data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert question data.', data: [] });
        });
    });
}

module.exports.addQuizQuestionsForBot = async (posted_data) => {
    return new Promise(async resolve => {
        var sql = database.query(`INSERT INTO quiz_questions_answers (player_id, opponent_id, quiz_id, question_id, opponent_answer,opponent_answer_key,opponent_spent_time,status) values ?`, [posted_data], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert questions of quiz data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert question data.', data: [] });
        });
    });
}

module.exports.editQuestionsAnswers = async (posted_data) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE quiz_questions_answers SET ? WHERE quiz_id = ? AND question_id = ?`;
        var sql = database.query(updateQry, [posted_data, posted_data.quiz_id, posted_data.question_id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while save answer data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update answers data' });
        });
    });
}

module.exports.getSingleQuestionsByTopic = async (quiz_id, question_id) => {
    return new Promise(async resolve => {
        let checkExRecord = `SELECT * FROM quiz_questions_answers WHERE quiz_id = ? AND question_id = ? LIMIT 1;`;
        database.query(checkExRecord, [quiz_id, question_id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get question detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, data: "Something is wrong.when get question data." });
        })
    });
}

module.exports.getQuizQuestionByID = async (id) => {
    return new Promise(async resolve => {
        let checkExRecord = `SELECT * FROM quiz_questions_answers WHERE id = ? LIMIT 1;`;
        database.query(checkExRecord, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get question detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, data: "Something is wrong.when get question data." });
        })
    });
}

module.exports.isPlayerSameQuestion = async (id, question_id, player_id, player_answer) => {
    return new Promise(async resolve => {
        let checkExRecord = `SELECT * FROM quiz_questions_answers WHERE ${player_id} = ? AND question_id = ? AND ${player_answer} != 0;`;
        let qry = database.query(checkExRecord, [id, question_id], async function (err, result) {

            if (err) return resolve({ status: false, message: "Something is wrong.when get question detail." + err });
            var isExist = false;
            if (result && result.length > 0) { isExist = true; }
            return resolve({ status: true, data: isExist });
        })
    });
}


module.exports.getQuizResultByQuizID = async (quiz_id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT
                                    player_id,
                                    SUM(IF(player_answer = 1, 1, 0)) AS player_correct_answer,
                                    SUM(
                                        IF(
                                            player_answer = 1,
                                            player_spent_time,
                                            0
                                        )
                                    ) AS player_correct_answer_time,
                                    SUM(player_spent_time) AS player_answer_time,
                                    opponent_id,
                                    SUM(IF(opponent_answer = 1, 1, 0)) AS opponent_correct_answer,
                                    SUM(
                                        IF(
                                            opponent_answer = 1,
                                            opponent_spent_time,
                                            0
                                        )
                                    ) AS opponent_correct_answer_time,
                                    SUM(opponent_spent_time) AS opponent_answer_time
                                FROM
                                    quiz_questions_answers
                                WHERE
                                    quiz_id = ?`;
        database.query(check_ex_record, [quiz_id], async function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while get quiz result data.' + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0], message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while get quiz result data.', data: [] });

        })
    });
}


module.exports.getQuizResultWithAnswerByUserID = async (getAnsData) => {
    return new Promise(async resolve => {
        let checkExRecord = `SELECT
                                    QQA.id,
                                    QQA.question_id,
                                    QUE.question,
                                    QUE.question_image,
                                    QUE.correct_answer,
                                    QQA.${getAnsData.player_answer} AS player_answer,
                                    QQA.${getAnsData.player_spent_time} AS player_spent_time,
                                    QQA.${getAnsData.player_time_out} AS player_time_out,
                                    CASE 
                                        WHEN (QQA.${getAnsData.player_answer_key} = 'wrong_answer_1') THEN  QUE.wrong_answer_1 
                                        WHEN (QQA.${getAnsData.player_answer_key} = 'wrong_answer_2') THEN  QUE.wrong_answer_2 
                                        WHEN (QQA.${getAnsData.player_answer_key} = 'wrong_answer_3') THEN  QUE.wrong_answer_3 
                                    ELSE QUE.correct_answer END AS player_answer_key
                                FROM
                                    quiz_questions_answers QQA
                                INNER JOIN questionnaires QUE ON
                                    QUE.id = QQA.question_id
                                WHERE
                                    QQA.quiz_id = ${getAnsData.quiz_id} ORDER BY QQA.question_id DESC`;
        let qry = database.query(checkExRecord, async function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while get quiz result data.' + err });
            if (result && result.length > 0) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while get quiz result data.', data: [] });
        })
    });
}


module.exports.getReportQuestionsList = async (data) => {
    return new Promise(async resolve => {
        let get_record = `SELECT 
                                    RQUE.id,
                                    QUE.id as question_id,
                                    QUE.question,
                                    QUE.correct_answer,
                                    QUE.wrong_answer_1,
                                    QUE.wrong_answer_2,
                                    QUE.wrong_answer_3,
                                    QUE.question_image,
                                    PRO.id as user_id,
                                    PRO.user_name,
                                    PRO.full_name,
                                    PRO.email,
                                    PRO.contact_no,
                                    RQUE.report_reason,
                                    RQUE.created_at
                                FROM reported_questions RQUE
                                INNER JOIN questionnaires QUE ON
                                    QUE.id = RQUE.question_id
                                INNER JOIN users PRO ON
                                    PRO.id = RQUE.user_id
                                WHERE RQUE.status = 1`

        get_record += ` ORDER BY RQUE.id DESC LIMIT ${data.limit} OFFSET ${data.offset};`;

        database.query(get_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get reporeted questions list." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Record not found." });
        })
    });
}


module.exports.getReportQuestionsCount = async () => {
    return new Promise(async resolve => {
        let get_record = `SELECT  count(DISTINCT(RQUE.id)) AS total_record
                            FROM reported_questions RQUE
                            INNER JOIN questionnaires QUE ON
                                QUE.id = RQUE.question_id
                            INNER JOIN users PRO ON
                                PRO.id = RQUE.user_id
                            WHERE RQUE.status = 1;`
        database.query(get_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get question detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0].total_record });
            return resolve({ status: true, data: 0 });
        })
    });
}