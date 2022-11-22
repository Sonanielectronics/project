const database = require("../config/db");

module.exports.getAllPlayersList = async (data) => {
    return new Promise(async resolve => {
        var innerBot = ''
        var botWhere = ''
        if (data.is_bot && data.level) {
            innerBot = ` INNER JOIN bot_levels BL ON BL.user_id = PRO.id `
            botWhere = ` AND BL.level =  ${data.level} AND BL.status = 1 `
        }
        let get_record = `SELECT PRO.id,
                                    PRO.user_name,
                                    PRO.full_name,
                                    PRO.email,
                                    PRO.contact_no,
                                    PRO.is_email_verify,
                                    CASE WHEN PRO.is_email_verify = 0 THEN 'No' ELSE 'Yes' END AS email_verify,
                                    PRO.is_contact_verify,
                                    PRO.is_social_login,
                                    PRO.social_media_id,
                                    PRO.social_media_type,
                                    PRO.birth_year,
                                    PRO.avatar_id,
                                    PRO.country_id,
                                    PRO.status,
                                    PRO.created_at,
                                    CASE WHEN PRO.status = 0 THEN 'Yes' ELSE 'No' END AS user_block,
                                    PRO.otp,
                                    CASE WHEN PRO.avatar_id = '' THEN '' ELSE 
                                        (SELECT AV.avatar FROM avatars AV WHERE AV.id = PRO.avatar_id ) 
                                    END AS avatar,
                                    PRO.country_id,
                                    IFNULL(CON.name,null) AS country_name,
                                    IFNULL(CON.country_code,null) AS country_code,
                                    IFNULL(CON.flag,null) AS country_flag,
                                    IFNULL((SELECT XP.xp FROM experience_points XP WHERE XP.user_id = PRO.id AND XP.status = 1),0) AS xp,
                                    IFNULL((SELECT LP.lp FROM learning_points LP WHERE LP.user_id = PRO.id AND LP.status = 1),0) AS lp,
                                    IFNULL((SELECT LT.learning_token FROM token_learnings LT WHERE LT.user_id = PRO.id AND LT.status = 1),0) AS lt
                            FROM users PRO
                            LEFT JOIN countries CON ON CON.id = PRO.country_id 
                            ${innerBot}
                            WHERE PRO.is_bot = ${data.is_bot} ${botWhere} `


        if (data.search != null) get_record += ` AND ( PRO.user_name LIKE '%${data.search}%' OR PRO.full_name LIKE '%${data.search}%' OR PRO.email LIKE '%${data.search}%' )`
        get_record += ` ORDER BY PRO.id DESC `;
        if (data.limit && data.limit != 0) get_record += ` LIMIT ${data.limit} OFFSET ${data.offset}; `;
        database.query(get_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get players list." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Record not found." });
        })
    });
}

module.exports.getAllPlayersCount = async (data) => {
    return new Promise(async resolve => {
        var innerBot = ''
        var botWhere = ''
        if (data.is_bot && data.level) {
            innerBot = ` INNER JOIN bot_levels BL ON BL.user_id = PRO.id `
            botWhere = ` AND BL.level =  ${data.level} AND BL.status = 1 `
        }

        let get_record = `SELECT COUNT(DISTINCT (PRO.id)) AS total_record
                                        FROM users PRO
                                        ${innerBot}
                                        WHERE PRO.is_bot = ${data.is_bot} ${botWhere} `
        if (data.search != null) get_record += ` AND ( PRO.user_name LIKE '%${data.search}%' OR PRO.full_name LIKE '%${data.search}%' OR PRO.email LIKE '%${data.search}%') `
        database.query(get_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get players list." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0].total_record });
            return resolve({ status: true, data: 0 });
        })
    });
}