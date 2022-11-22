const database = require("../config/db");

module.exports.addNotificationsData = async (postedData) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO notifications SET ?`, [postedData], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert notifications data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result.insertId, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while send notifications for game.', data: [] });
        });
    });
}

module.exports.editNotificationsData = async (postedData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE notifications SET ? WHERE id = ?`;
        database.query(updateQry, [postedData, postedData.id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update notification data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update notification data' });
        });
    });
}


// module.exports.getAllNotificationsList = async (id, limit, offset) => {
//     return new Promise(async resolve => {
//         let get_record = `SELECT
//                                 NOTI.id,
//                                 NOTI.receiver_title,
//                                 NOTI.receiver_body,
//                                 NOTI.sender_title,
//                                 NOTI.sender_body,
//                                 NOTI.sender_id,
//                                 NOTI.receiver_id,
//                                 NOTI.notification_for,
//                                 NOTI.topic_id,
//                                 TOPIC.name as topic_name,
//                                 TOPIC.color_code as topic_color_code,
//                                 QUE.spent_learning_token,
//                                 NOTI.quiz_id,
//                                 NOTI.created_at,
//                                 SEN.user_name AS sender_user_name,
//                                 SEN.full_name AS sender_full_name,
//                                 SEN.email AS sender_email,
//                                 SEN.country_id AS sender_country_id,
//                                 CASE WHEN SEN.avatar_id = '' THEN '' ELSE(SELECT AV.avatar FROM avatars AV WHERE AV.id = SEN.avatar_id) END AS sender_avatar,
//                                 REC.user_name AS receiver_user_name,
//                                 REC.full_name AS receiver_full_name,
//                                 REC.email AS receiver_email,
//                                 REC.country_id AS receiver_country_id,
//                                 CASE WHEN REC.avatar_id = '' THEN '' ELSE(SELECT AV.avatar FROM avatars AV WHERE AV.id = REC.avatar_id) END AS receiver_avatar
//                             FROM
//                                 notifications NOTI
//                             INNER JOIN topics TOPIC ON
//                                 TOPIC.id = NOTI.topic_id
//                             INNER JOIN quizzes QUE ON
//                                 QUE.id = NOTI.quiz_id
//                             INNER JOIN users SEN ON
//                                 SEN.id = NOTI.sender_id
//                             INNER JOIN users REC ON
//                                 REC.id = NOTI.receiver_id
//                             WHERE
//                                 NOTI.receiver_id = ? OR NOTI.sender_id = ?
//                             ORDER BY
//                                 NOTI.id DESC LIMIT ? OFFSET ?;`;
//         database.query(get_record, [id, id, limit, offset], async function (err, result) {
//             if (err) return resolve({ status: false, message: "Something is wrong.while get notification detail." + err });
//             if (result && result.length > 0) return resolve({ status: true, data: result });
//             return resolve({ status: true, message: "You dont't have notifications.", data: [] });
//         })
//     });
// }
module.exports.getAllNotificationsList = async (id, limit, offset) => {
    return new Promise(async resolve => {
        let get_record = `SELECT
                                NOTI.id,
                                NOTI.sender_id,
                                NOTI.receiver_id,
                                NOTI.sender_status,
                                NOTI.receiver_status,
                                NOTI.notification_for,
                                NOTI.topic_id,
                                TOPIC.name as topic_name,
                                TOPIC.icon as topic_icon,
                                TOPIC.color_code as topic_color_code,
                                QUE.spent_learning_token,
                                IFNULL((SELECT TFR.win_reward FROM topic_fees_and_rewards TFR WHERE TFR.topic_id = NOTI.topic_id AND TFR.entry_fee = QUE.spent_learning_token AND TFR.status = 1 LIMIT 1),0) AS win_learning_token,
                                QUE.request_time,
                                QUE.is_timer_on,
                                NOTI.quiz_id,
                                NOTI.created_at,
                                SEN.user_name AS sender_user_name,
                                SEN.full_name AS sender_full_name,
                                SEN.email AS sender_email,
                                SEN.country_id AS sender_country_id,
                                (SELECT CON.flag FROM countries CON WHERE CON.id = SEN.country_id AND CON.status = 1) AS sender_country_flag,
                                CASE WHEN SEN.avatar_id = '' THEN '' ELSE(SELECT AV.avatar FROM avatars AV WHERE AV.id = SEN.avatar_id) END AS sender_avatar,
                                IFNULL((SELECT XP.xp FROM experience_points XP WHERE XP.user_id = SEN.id AND XP.status = 1),0) AS sender_xp,
                                REC.user_name AS receiver_user_name,
                                REC.full_name AS receiver_full_name,
                                REC.email AS receiver_email,
                                REC.country_id AS receiver_country_id,
                                (SELECT CON.flag FROM countries CON WHERE CON.id = REC.country_id AND CON.status = 1) AS receiver_country_flag,
                                IFNULL((SELECT XP.xp FROM experience_points XP WHERE XP.user_id = REC.id AND XP.status = 1),0) AS receiver_xp,
                                CASE WHEN REC.avatar_id = '' THEN '' ELSE(SELECT AV.avatar FROM avatars AV WHERE AV.id = REC.avatar_id) END AS receiver_avatar
                            FROM
                                notifications NOTI
                            INNER JOIN topics TOPIC ON
                                TOPIC.id = NOTI.topic_id
                            INNER JOIN quizzes QUE ON
                                QUE.id = NOTI.quiz_id
                            INNER JOIN users SEN ON
                                SEN.id = NOTI.sender_id
                            INNER JOIN users REC ON
                                REC.id = NOTI.receiver_id
                            WHERE
                                NOTI.receiver_id = ? OR NOTI.sender_id = ?
                            ORDER BY
                                NOTI.id DESC LIMIT ? OFFSET ?;`;
        database.query(get_record, [id, id, limit, offset], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get notification detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: true, message: "You dont't have notifications.", data: [] });
        })
    });
}

module.exports.getAllNotificationsListCount = async (id) => {
    return new Promise(async resolve => {
        var sql = database.query(`SELECT count(DISTINCT (NOTI.id)) AS total_record 
                            FROM
                                notifications NOTI
                            INNER JOIN topics TOPIC ON
                                TOPIC.id = NOTI.topic_id
                            INNER JOIN quizzes QUE ON
                                QUE.id = NOTI.quiz_id
                            INNER JOIN users SEN ON
                                SEN.id = NOTI.sender_id
                            INNER JOIN users REC ON
                                REC.id = NOTI.receiver_id
                            WHERE
                                NOTI.receiver_id = ? OR NOTI.sender_id = ?;`, [id, id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get topics detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0].total_record });
            return resolve({ status: true, data: 0 });
        })
    });
}

module.exports.getNotificationDataByQuiz = async (quiz_id) => {
    return new Promise(async resolve => {
        database.query(`SELECT NOTI.id,
                                NOTI.receiver_id,
                                NOTI.receiver_title,
                                NOTI.receiver_body,
                                NOTI.receiver_status,

                                NOTI.sender_id,
                                NOTI.sender_title,
                                NOTI.sender_body,
                                NOTI.sender_status,
                                
                                NOTI.notification_for,
                                NOTI.topic_id,
                                TOPIC.name as topic_name,
                                TOPIC.color_code as topic_color_code,
                                QUE.spent_learning_token,
                                QUE.is_timer_on,
                                NOTI.quiz_id,
                                NOTI.created_at
                            FROM notifications NOTI
                            INNER JOIN topics TOPIC ON
                                TOPIC.id = NOTI.topic_id
                            INNER JOIN quizzes QUE ON
                                QUE.id = NOTI.quiz_id
                                WHERE NOTI.quiz_id = ?`, [quiz_id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get topics detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, message: "This quiz notification not found in the list." });
        })
    });
}
