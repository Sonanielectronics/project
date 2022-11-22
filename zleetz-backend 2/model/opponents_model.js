const database = require("../config/db");

module.exports.getOpponentByExperiencePoints = async (getAllData) => {
    // TODO: Make it is_active

    return new Promise(async resolve => {
        let getProfiles = `SELECT PRO.id,
                                    PRO.user_name,
                                    PRO.full_name,
                                    XP.xp,
                                    PRO.avatar_id,
                                    CASE WHEN PRO.avatar_id = '' THEN '' ELSE 
                                        (SELECT AV.avatar FROM avatars AV WHERE AV.id = PRO.avatar_id ) 
                                    END AS avatar ,
                                    PRO.country_id,
                                   IFNULL(CON.name,null) AS country_name,
                                    IFNULL(CON.country_code,null) AS country_code,
                                    IFNULL(CON.flag,null) AS country_flag
                                    FROM users PRO 
                                    INNER JOIN experience_points XP ON XP.user_id = PRO.id
                                    LEFT JOIN countries CON ON CON.id = PRO.country_id
                                    WHERE PRO.id != ? AND PRO.is_bot = 0 `;
        // WHERE PRO.id != ? AND XP.xp <= ? AND PRO.is_active = 1 AND PRO.is_bot = 0  `;
        if (getAllData.search != null) getProfiles += ` AND PRO.user_name LIKE '%${getAllData.search}%' `
        getProfiles += ` GROUP BY PRO.id ORDER BY XP.xp DESC LIMIT ${getAllData.limit} OFFSET ${getAllData.offset};`;

        var sqlQuery = database.query(getProfiles, [getAllData.id, getAllData.xp], async function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while get opponent user list.' + err });
            if (result && result.length > 0) return resolve({ status: true, data: result, message: 'Record founded.' });
            return resolve({ status: false, data: [], message: 'We are not found any opponent right now. Please try again.' });
        })
    });
}

module.exports.getOpponentByExperiencePointsCount = async (getAllData) => {
    return new Promise(async resolve => {
        let getProfiles = `SELECT COUNT(DISTINCT (PRO.id)) as total_record 
                                    FROM users PRO 
                                    INNER JOIN experience_points XP ON XP.user_id = PRO.id
                                    WHERE PRO.id != ? AND PRO.is_bot = 0 `;
        // WHERE PRO.id != ? AND XP.xp <= ? AND PRO.is_active = 1 AND PRO.is_bot = 0  `;
        if (getAllData.search != null) getProfiles += ` AND PRO.user_name LIKE '%${getAllData.search}%' ;`

        var sqlQuery = database.query(getProfiles, [getAllData.id, getAllData.xp], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get opponent list." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0].total_record });
            return resolve({ status: true, data: 0 });
        })
    });
}



module.exports.getRandomOpponentByExperiencePoints = async (getAllData) => {
    // TODO: Make it is_active

    return new Promise(async resolve => {
        let getProfiles = `SELECT PRO.id,
                                    PRO.user_name,
                                    PRO.full_name,
                                    XP.xp,
                                    PRO.avatar_id,
                                    CASE WHEN PRO.avatar_id = '' THEN '' ELSE 
                                        (SELECT AV.avatar FROM avatars AV WHERE AV.id = PRO.avatar_id ) 
                                    END AS avatar ,
                                    PRO.country_id,
                                   IFNULL(CON.name,null) AS country_name,
                                    IFNULL(CON.country_code,null) AS country_code,
                                    IFNULL(CON.flag,null) AS country_flag
                                    FROM users PRO 
                                    INNER JOIN experience_points XP ON XP.user_id = PRO.id
                                    INNER JOIN bot_levels BL ON BL.user_id = PRO.id
                                    LEFT JOIN countries CON ON CON.id = PRO.country_id
                                    WHERE PRO.id != ? AND PRO.is_bot = 1 AND BL.level = ${getAllData.level} `;
        // WHERE PRO.id != ? AND XP.xp <= ? AND PRO.is_active = 1 AND PRO.is_bot = 0  `;
        if (getAllData.search != null) getProfiles += ` AND PRO.user_name LIKE '%${getAllData.search}%' `
        getProfiles += ` GROUP BY PRO.id ORDER BY XP.xp DESC,PRO.id DESC LIMIT ${getAllData.limit} OFFSET ${getAllData.offset};`;

        var sqlQuery = database.query(getProfiles, [getAllData.id, getAllData.xp], async function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while get opponent user list.' + err });
            if (result && result.length > 0) return resolve({ status: true, data: result, message: 'Record founded.' });
            return resolve({ status: false, data: [], message: 'We are not found any opponent right now. Please try again.' });
        })
    });
}

module.exports.findRandomBotByLevel = async (getAllData) => {
    return new Promise(async resolve => {
        let getProfiles = `SELECT PRO.id,
                                    PRO.user_name,
                                    PRO.full_name,
                                    XP.xp,
                                    PRO.avatar_id,
                                    PRO.is_bot,
                                    CASE WHEN PRO.avatar_id = '' THEN '' ELSE 
                                        (SELECT AV.avatar FROM avatars AV WHERE AV.id = PRO.avatar_id ) 
                                    END AS avatar ,
                                    PRO.country_id,
                                   IFNULL(CON.name,null) AS country_name,
                                    IFNULL(CON.country_code,null) AS country_code,
                                    IFNULL(CON.flag,null) AS country_flag
                                    FROM users PRO 
                                    INNER JOIN experience_points XP ON XP.user_id = PRO.id
                                    INNER JOIN bot_levels BL ON BL.user_id = PRO.id
                                    LEFT JOIN countries CON ON CON.id = PRO.country_id
                                    WHERE PRO.id != ? AND PRO.is_bot = 1 AND BL.level = ${getAllData.level} GROUP BY PRO.id ORDER BY RAND() LIMIT 1;`;
        var sqlQuery = database.query(getProfiles, [getAllData.id, getAllData.xp], async function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while get opponent user list.' + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0], message: 'Record founded.' });
            return resolve({ status: false, data: [], message: 'We are not found any opponent right now. Please try again later.' });
        })
    });
}


module.exports.getRandomOpponentByLevel = async (getAllData) => {
    return new Promise(async resolve => {
        let getProfiles = `SELECT PRO.id,
                                    PRO.user_name,
                                    PRO.full_name,
                                    XP.xp,
                                    PRO.avatar_id,
                                    PRO.is_bot,
                                    CASE WHEN PRO.avatar_id = '' THEN '' ELSE 
                                        (SELECT AV.avatar FROM avatars AV WHERE AV.id = PRO.avatar_id ) 
                                    END AS avatar ,
                                    PRO.country_id,
                                   IFNULL(CON.name,null) AS country_name,
                                    IFNULL(CON.country_code,null) AS country_code,
                                    IFNULL(CON.flag,null) AS country_flag
                                    FROM users PRO 
                                    INNER JOIN experience_points XP ON XP.user_id = PRO.id
                                    LEFT JOIN countries CON ON CON.id = PRO.country_id
                                    WHERE PRO.id = ? AND PRO.is_bot = 0 GROUP BY PRO.id ORDER BY RAND() LIMIT 1;`;
        var sqlQuery = database.query(getProfiles, [getAllData.id], async function (err, result) {
            // console.log(sqlQuery.sql);
            if (err) return resolve({ status: false, message: 'Error while get opponent user list.' + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0], message: 'Record founded.' });
            return resolve({ status: false, data: [], message: 'We are not found any opponent right now. Please try again later.' });
        })
    });
}

module.exports.getRandomOpponentByExperiencePointsCount = async (getAllData) => {
    return new Promise(async resolve => {
        let getProfiles = `SELECT COUNT(DISTINCT (PRO.id)) as total_record 
                                    FROM users PRO 
                                    INNER JOIN experience_points XP ON XP.user_id = PRO.id
                                    INNER JOIN bot_levels BL ON BL.user_id = PRO.id
                                    WHERE PRO.id != ? AND PRO.is_bot = 1 AND BL.level = ${getAllData.level} `;
        // WHERE PRO.id != ? AND XP.xp <= ? AND PRO.is_active = 1 AND PRO.is_bot = 0  `;
        if (getAllData.search != null) getProfiles += ` AND PRO.user_name LIKE '%${getAllData.search}%' ;`

        var sqlQuery = database.query(getProfiles, [getAllData.id, getAllData.xp], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get opponent list." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0].total_record });
            return resolve({ status: true, data: 0 });
        })
    });
}