const database = require("../config/db");

module.exports.addLearningToken = async (postedData) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO token_learnings SET ?`, [postedData], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert Learning token data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert Learning token data.', data: [] });
        });
    });
}

module.exports.updateLearningToken = async (updateData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE token_learnings SET ? WHERE id = ?`;
        database.query(updateQry, [updateData, updateData.id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update Learning token data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update Learning token data' });
        });
    });
}
module.exports.addTrainingMatchToken = async (postedData) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO training_match_token SET ?`, [postedData], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert Match token data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert Match token data.', data: [] });
        });
    });
}

module.exports.editTrainingMatchToken = async (updateData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE training_match_token SET ? WHERE id = ?`;
        database.query(updateQry, [updateData, updateData.id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update Match token data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update Match token data' });
        });
    });
}

module.exports.getTrainingMatchTokenById = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM training_match_token WHERE id = ? AND status = 1`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get Match token detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, message: "Selected Match token not found." });
        })
    });
}
module.exports.isTrainingMatchTokenIsExist = async (options) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM training_match_token WHERE options = ? AND status = 1`;
        database.query(check_ex_record, [options], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get Match token detail." + err });
            if (result && result.length > 0) return resolve({ status: true, isExist: true });
            return resolve({ status: true, isExist: false });
        })
    });
}

module.exports.addExperiencePoints = async (postedData) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO experience_points SET ?`, [postedData], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert experience points data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert experience points data.', data: [] });
        });
    });
}

module.exports.addLearningPoints = async (postedData) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO learning_points SET ?`, [postedData], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert learning points data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert learning points data.', data: [] });
        });
    });
}

module.exports.addLearningTokenHis = async (postedData) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO learning_token_histories SET ?`, [postedData], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert Learning token history data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert Learning token history data.', data: [] });
        });
    });
}

module.exports.getUserLearningToken = async (id) => {
    return new Promise(async resolve => {
        let getToken = `SELECT * FROM token_learnings LT WHERE LT.user_id = ?;`;
        var sqlQuery = database.query(getToken, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while get toketn data.' + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, data: [], message: 'You don\'t have enough learning token.' });
        })
    });
}

module.exports.getExperiencePoints = async (id) => {
    return new Promise(async resolve => {
        let getToken = `SELECT * FROM experience_points XP WHERE XP.user_id = ?;`;
        var sqlQuery = database.query(getToken, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while get xp data.' + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, data: [], message: 'We are not getting you xp. Please, try again.' });
        })
    });
}

module.exports.getLearningPoints = async (id) => {
    return new Promise(async resolve => {
        let getToken = `SELECT * FROM learning_points LP WHERE LP.user_id = ?;`;
        var sqlQuery = database.query(getToken, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while get lp data.' + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0], message: 'Record founded.' });
            return resolve({ status: false, data: [], message: 'We are not getting you lp. Please, try again.' });
        })
    });
}

module.exports.updateLearningPoints = async (updateData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE learning_points SET ? WHERE user_id = ?`;
        database.query(updateQry, [updateData, updateData.user_id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update Match token data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update Match token data' });
        });
    });
}

module.exports.updateExperiencePoints = async (updateData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE experience_points SET ? WHERE user_id = ?`;
        database.query(updateQry, [updateData, updateData.user_id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update Match token data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update Match token data' });
        });
    });
}

module.exports.addExperiencePointHistory = async (updateData) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO topic_experience_points SET ?`, [updateData], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert experience points data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert experience points data.', data: [] });
        });
    });
}


module.exports.getTrainingMatchToken = async () => {
    return new Promise(async resolve => {
        let getToken = `SELECT *,0 AS 'is_lock'  FROM training_match_token TMT WHERE TMT.status = 1 ORDER BY TMT.sort ASC;`;
        var sqlQuery = database.query(getToken, async function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while get match token data.' + err });
            if (result && result.length > 0) return resolve({ status: true, data: result, message: 'Record founded.' });
            return resolve({ status: false, data: [], message: 'We are not getting match token. Please, try again.' });
        })
    });
}
module.exports.getTrainingMatchTokenByEntryFee = async (entry_fee, topic_id) => {
    return new Promise(async resolve => {
        let getToken = `SELECT * FROM topic_fees_and_rewards TMT WHERE TMT.status = 1 AND TMT.entry_fee = ? AND TMT.topic_id = ? LIMIT 1;`;
        var sqlQuery = database.query(getToken, [entry_fee, topic_id], async function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while get match token data.' + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0], message: 'Record founded.' });
            return resolve({ status: false, data: [], message: 'something is wrong getting match token. Please, try again.' });
        })
    });
}

module.exports.getTrainingMatchTokenByTopic = async (id, profile_id) => {
    return new Promise(async resolve => {
        let getToken = `SELECT
                            TFR.id,
                            TFR.topic_id,
                            TFR.options,
                            TFR.percentage,
                            TFR.entry_fee,
                            TFR.win_reward,
                            TFR.icon,
                            TFR.color_code,
                            TFR.game_mode,
                            TFR.unit,
                            CASE WHEN percentage <= user_pr THEN 0 ELSE 1
                        END AS is_lock
                        FROM
                            topic_fees_and_rewards TFR
                        INNER JOIN(
                            SELECT
                            TOPIC.id,
                            ROUND(IFNULL((IFNULL((
                                        SELECT
                                            COUNT(DISTINCT(QQA.question_id))
                                        FROM
                                            quiz_questions_answers QQA
                                        INNER JOIN quizzes QUIZ ON
                                            QUIZ.id = QQA.quiz_id
                                        WHERE
                                            QQA.status = 1 AND(
                                                QQA.player_id = ${profile_id} OR QQA.opponent_id = ${profile_id}
                                            ) AND(
                                                CASE WHEN QQA.player_id = ${profile_id} THEN QQA.player_answer != 0
                                            END OR CASE WHEN QQA.opponent_id = ${profile_id} THEN QQA.opponent_answer != 0
                                    END
                                    ) AND QUIZ.topic_id = TOPIC.id
                                ),
                                0
                            ) * 100
                        ) / IFNULL(
                            (
                            SELECT
                                COUNT(*) AS total_record
                            FROM
                                question_topics QT
                            WHERE
                                QT.status = 1 AND QT.topic_id = TOPIC.id
                        ),0),0),2) AS user_pr
                        FROM
                            topics TOPIC
                        WHERE
                            TOPIC.id = ${id} AND TOPIC.status = 1) AS TOP_DATA
                        ON
                            TOP_DATA.id = TFR.topic_id
                        WHERE
                            TFR.status = 1 AND TFR.topic_id = ${id}
                        ORDER BY
                            TFR.entry_fee ASC,
                            TFR.win_reward ASC;`;
        var sqlQuery = database.query(getToken, async function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while get match token data.' + err });
            if (result && result.length > 0) return resolve({ status: true, data: result, message: 'Record founded.' });
            return resolve({ status: true, data: [] });
        })
    });
}

module.exports.addTrainingMatchFeesAndRewards = async (postedData) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO topic_fees_and_rewards SET ?`, [postedData], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert Match token data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert Match token data.', data: [] });
        });
    });
}


module.exports.editTrainingMatchFeesAndRewards = async (updateData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE topic_fees_and_rewards SET ? WHERE id = ?`;
        database.query(updateQry, [updateData, updateData.id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update Match token data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update Match token data' });
        });
    });
}

module.exports.getTrainingMatchFeesAndRewards = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM topic_fees_and_rewards WHERE id = ? AND status = 1`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get Match token detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, message: "Selected Match token not found." });
        })
    });
}

module.exports.isTrainingMatchFeesAndRewardsIsExist = async (options, topic_id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM topic_fees_and_rewards WHERE options = ? AND topic_id = ? AND status = 1`;
        database.query(check_ex_record, [options, topic_id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get Match token detail." + err });
            if (result && result.length > 0) return resolve({ status: true, isExist: true });
            return resolve({ status: true, isExist: false });
        })
    });
}

module.exports.getDefaultMatchFeesAndRewards = async () => {
    return new Promise(async resolve => {
        let getToken = `SELECT * FROM default_fees_and_rewards DFR WHERE DFR.status = 1 ORDER BY DFR.entry_fee ASC;`;
        database.query(getToken, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get Match fees and rewards detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "There have no default match fees & rewards.Please add first." });
        })
    });
}

module.exports.addDefaultMatchFeesAndRewards = async (postedData) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO default_fees_and_rewards SET ?`, [postedData], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert Match token data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert Match token data.', data: [] });
        });
    });
}

module.exports.getDefaultMatchFeesAndRewardsByID = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM default_fees_and_rewards WHERE id = ? AND status = 1`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get Match token detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, message: "Selected Match token not found." });
        })
    });
}

module.exports.editDefaultMatchFeesAndRewards = async (updateData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE default_fees_and_rewards SET ? WHERE id = ?`;
        database.query(updateQry, [updateData, updateData.id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update Match token data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update Match token data' });
        });
    });
}



module.exports.isDefaultMatchFeesAndRewardsIsExist = async (options) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM default_fees_and_rewards WHERE options = ? AND status = 1`;
        database.query(check_ex_record, [options], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get Match token detail." + err });
            if (result && result.length > 0) return resolve({ status: true, isExist: true });
            return resolve({ status: true, isExist: false });
        })
    });
}


module.exports.addExperienceHistoryPoints = async (postedData) => {
    return new Promise(async resolve => {
        var whereCon = `user_id = ${postedData.user_id} AND topic_id = ${postedData.topic_id}`;
        database.query(`SELECT * FROM experience_points_histories WHERE ${whereCon};`, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get experience points history data." + err });
            if (result && result.length > 0) {
                postedData.xp = postedData.xp + result[0].xp
                database.query(`UPDATE experience_points_histories SET ? WHERE ${whereCon};`, [postedData], function (err, result) {
                    if (err) return resolve({ status: false, message: 'Error while update experience points history data.' + err });
                });
            } else {
                database.query(`INSERT INTO experience_points_histories SET ?`, [postedData], function (err, result) {
                    if (err) return resolve({ status: false, message: 'Error while insert experience points history data.' + err });
                });
            }
            return resolve({ status: true });
        })
    });
}