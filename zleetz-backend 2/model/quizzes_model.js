const database = require("../config/db");

module.exports.addQuizzesData = async (postedData) => {
    return new Promise(async resolve => {
        var sql = database.query(`INSERT INTO quizzes SET ?`, [postedData], function (err, result) {

            if (err) return resolve({ status: false, message: 'Error while insert quizz data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result.insertId, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while send request for game.', data: [] });
        });
    });
}

module.exports.editQuizzesData = async (updateData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE quizzes SET ? WHERE id = ?`;
        database.query(updateQry, [updateData, updateData.id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update Quiz data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update Quiz data' });
        });
    });
}

module.exports.getQuizzesDataID = async (quiz_id) => {
    return new Promise(async resolve => {
        let getData = `SELECT
                            QUE.id,
                            QUE.player_id,
                            QUE.opponent_id,
                            QUE.topic_id,
                            QUE.request_status,
                            QUE.request_time,
                            QUE.winner_id,
                            QUE.is_draw,
                            QUE.spent_learning_token,
                            IFNULL((SELECT TFR.win_reward FROM topic_fees_and_rewards TFR WHERE TFR.topic_id = QUE.topic_id AND TFR.entry_fee = QUE.spent_learning_token AND TFR.status = 1 LIMIT 1),0) AS win_learning_token,
                            QUE.play_by_player,
                            QUE.done_by_player,
                            QUE.play_by_opponent,
                            QUE.done_by_opponent,
                            QUE.is_timer_on,
                            TOP.name AS top_name,
                            TOP.description AS top_description,
                            TOP.access AS top_access,
                            TOP.access_code AS top_access_code,
                            TOP.regional_relevance AS top_regional_relevance,
                            TOP.color_code AS top_color_code,
                            TOP.search_tags AS top_search_tags,
                            TOP.icon AS top_icon,
                            TOP.game_mode AS top_game_mode,
                            TOP.match_format AS top_match_format,
                            TOP.number_of_questions AS top_number_of_questions,
                            TOP.time_for_question AS top_time_for_question,
                            SEN.user_name AS sender_user_name,
                            SEN.full_name AS sender_full_name,
                            SEN.country_id AS sender_country_id,
                            (SELECT CON.flag FROM countries CON WHERE CON.id = SEN.country_id AND CON.status = 1) AS sender_country_flag,
                            IFNULL((SELECT XP.xp FROM experience_points XP WHERE XP.user_id = SEN.id AND XP.status = 1),0) AS sender_xp, 
                            IFNULL((SELECT LP.lp FROM learning_points LP WHERE LP.user_id = SEN.id AND LP.status = 1),0) AS sender_lp,
                            IFNULL((SELECT LT.learning_token FROM token_learnings LT WHERE LT.user_id = SEN.id AND LT.status = 1),0) AS sender_lt,
                            CASE WHEN SEN.avatar_id = '' THEN '' ELSE(SELECT AV.avatar FROM avatars AV WHERE AV.id = SEN.avatar_id) END AS sender_avatar,
                            REC.user_name AS receiver_user_name,
                            REC.is_bot AS is_bot,
                            REC.full_name AS receiver_full_name,
                            REC.country_id AS receiver_country_id,
                            (SELECT CON.flag FROM countries CON WHERE CON.id = REC.country_id AND CON.status = 1) AS receiver_country_flag,
                            CASE WHEN REC.avatar_id = '' THEN '' ELSE(SELECT AV.avatar FROM avatars AV WHERE AV.id = REC.avatar_id) END AS receiver_avatar,
                            IFNULL((SELECT XP.xp FROM experience_points XP WHERE XP.user_id = REC.id AND XP.status = 1 ),0) AS receiver_xp,
                            IFNULL((SELECT LP.lp FROM learning_points LP WHERE LP.user_id = REC.id AND LP.status = 1),0) AS receiver_lp,
                            IFNULL((SELECT LT.learning_token FROM token_learnings LT WHERE REC.id = LT.user_id AND LT.status = 1),0) AS receiver_lt
                        FROM
                            quizzes QUE
                        INNER JOIN topics TOP ON
                            TOP.id = QUE.topic_id
                        INNER JOIN users SEN ON
                            SEN.id = QUE.player_id
                        INNER JOIN users REC ON
                            REC.id = QUE.opponent_id
                        WHERE
                            QUE.status = 1 AND QUE.id = ? AND TOP.status = 1;`;

        var sqlQuery = database.query(getData, [quiz_id], async function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while get quiz data.' + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0], message: 'Record founded.' });
            return resolve({ status: false, data: [], message: 'Record not found, Please try again.' });
        })
    });
}

module.exports.getExpiredQuizList = async (yesterday) => {
    return new Promise(async resolve => {
        let getData = `SELECT * FROM notifications WHERE created_at <= ? AND(receiver_status = 2 OR sender_status = 3);`;
        var sqlQuery = database.query(getData, [yesterday], async function (err, result) {
            console.log(sqlQuery.sql);
            if (err) return resolve({ status: false, message: 'Error while get quiz data.' + err });
            return resolve({ status: true, data: result, message: 'Record founded.' });
        })
    });
}

module.exports.expiredQuiz = async (yesterday, curruntTime) => {
    return new Promise(async resolve => {
        const updateQuiz = { 'receiver_status': 11, 'sender_status': 11, 'updated_at': curruntTime }
        let editData = `UPDATE notifications SET ? WHERE created_at <= ? AND(receiver_status = 2 OR sender_status = 3);`;
        var sqlQuery = database.query(editData, [updateQuiz, yesterday], async function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while get quiz data.' + err });
            return resolve({ status: true, data: result, message: 'Record founded.' });
        })
    });
}
