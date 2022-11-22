const database = require("../config/db");

//Country
module.exports.checkCountryByName = async (name, id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM countries WHERE name = ? AND status = 1 `;
        if (id && id != '') check_ex_record += ` AND id != ${id} ;`
        var sql = database.query(check_ex_record, [name], async function (err, result) {
            console.log(sql.sql);
            if (err) return resolve({ status: false, message: "Something is wrong.when get countries detail." + err });
            var isExist = false;
            if (result && result.length > 0) isExist = true;
            return resolve({ status: true, data: isExist });
        })
    });
}

module.exports.insertCountryData = async (posted_data) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO countries SET ?`, posted_data, function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert countries data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert countries data.', data: [] });
        });
    });
}

module.exports.getCountryById = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM countries WHERE id = ? AND status = 1`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get countries detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, message: "Selected country not found." });
        })
    });
}

module.exports.updateCountryData = async (updateData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE countries SET ? WHERE id = ?`;
        database.query(updateQry, [updateData, updateData.id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update countries data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update countries data' });
        });
    });
}

module.exports.getAllCountry = async (getAllData) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM countries WHERE status = 1 `;
        if (getAllData && getAllData.search != null) check_ex_record += ` AND name LIKE '%${getAllData.search}%' `
        if (getAllData && getAllData.limit != null && getAllData.offset != null) check_ex_record += ` LIMIT ${getAllData.limit} OFFSET ${getAllData.offset};`

        database.query(check_ex_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get countries detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Countries not found." });
        })
    });
}

module.exports.getAllCountryCount = async (getAllData) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT COUNT(DISTINCT (id)) AS total_record FROM countries WHERE status = 1 `;
        if (getAllData && getAllData.search != null) check_ex_record += ` AND name LIKE '%${getAllData.search}%' `
        database.query(check_ex_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get question detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0].total_record });
            return resolve({ status: true, data: 0 });
        })
    });
}

//Regions
module.exports.checkRegionsByName = async (name, country_id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM regions WHERE name = ? AND country_id = ? AND status = 1;`;
        database.query(check_ex_record, [name, country_id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get regions detail." + err });
            var isExist = false;
            if (result && result.length > 0) isExist = true;
            return resolve({ status: true, data: isExist });
        })
    });
}

module.exports.insertRegionsData = async (posted_data) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO regions SET ?`, posted_data, function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert regions data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert regions data.', data: [] });
        });
    });
}

module.exports.getRegionsById = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM regions WHERE id = ? AND status = 1`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get regions detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, message: "regions not found." });
        })
    });
}

module.exports.updateRegionsData = async (updateData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE regions SET ? WHERE id = ?`;
        database.query(updateQry, [updateData, updateData.id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update regions data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update regions data' });
        });
    });
}

module.exports.getAllRegions = async (country_id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM regions WHERE status = 1 AND country_id = ?;`;
        database.query(check_ex_record, [country_id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get regions detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "regions not found." });
        })
    });
}

module.exports.insertAvatarData = async (posted_data) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO avatars SET ?`, posted_data, function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert avatars data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert avatars data.', data: [] });
        });
    });
}

module.exports.getAvatarById = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM avatars WHERE status = 1 AND id = ?;`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get avatar detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "avatar not found." });
        })
    });
}

module.exports.updateAvatarData = async (updateData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE avatars SET ? WHERE id = ?`;
        database.query(updateQry, [updateData, updateData.id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update avatars data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update avatars data' });
        });
    });
}

module.exports.getAllAvatars = async () => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT id,name,status,avatar FROM avatars WHERE status = 1 ORDER BY id DESC ;`;
        database.query(check_ex_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get avatars detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "avatars not found." });
        })
    });
}

module.exports.getAllAccountTypeList = async (getAllData) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT ATYPE.id,ATYPE.account_type,ATYPE.description,ATYPE.status,ATYPE.icon FROM account_types ATYPE WHERE ATYPE.status = 1 `
        if (getAllData && getAllData.search != null) check_ex_record += ` AND ( ATYPE.account_type LIKE '%${getAllData.search}%' OR ATYPE.description LIKE '%${getAllData.search}%' ) `
        check_ex_record += ` ORDER BY ATYPE.id DESC `
        if (getAllData && getAllData.limit != null && getAllData.offset != null) check_ex_record += ` LIMIT ${getAllData.limit} OFFSET ${getAllData.offset};`
        database.query(check_ex_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get avatars detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Account type not found." });
        })
    });
}

module.exports.getAllAccountTypeListCount = async (getAllData) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT COUNT(DISTINCT (ATYPE.id)) AS total_record FROM account_types ATYPE WHERE ATYPE.status = 1 `;
        if (getAllData && getAllData.search != null) check_ex_record += ` AND ( ATYPE.account_type LIKE '%${getAllData.search}%' OR ATYPE.description LIKE '%${getAllData.search}%' ) `
        database.query(check_ex_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get question detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0].total_record });
            return resolve({ status: true, data: 0 });
        })
    });
}

module.exports.getAccountTypeByName = async (account_type) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM account_types WHERE account_type = ? AND status = 1;`;
        database.query(check_ex_record, [account_type], async function (err, result) {
            if (err) return resolve({ status: false, isExist: false, message: "Something is wrong.when get account type detail." + err });
            if (result && result.length > 0) return resolve({ status: true, isExist: true, data: result[0] });
            return resolve({ status: true, isExist: false, data: [] });
        })
    });
}

module.exports.getCountryByIdName = async (name) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM countries WHERE name = ? AND status = 1;`;
        database.query(check_ex_record, [name], async function (err, result) {
            if (err) return resolve({ status: false, isExist: false, message: "Something is wrong.when get countries detail." + err });
            if (result && result.length > 0) return resolve({ status: true, isExist: true, data: result[0] });
            return resolve({ status: true, isExist: false, data: [] });
        })
    });
}

module.exports.insertAccountTypeData = async (posted_data) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO account_types SET ?`, posted_data, function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert account type data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert account type data.', data: [] });
        });
    });
}
module.exports.getAccountTypeById = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM account_types WHERE id = ? AND status = 1`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get account type detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, message: "Selected account type not found." });
        })
    });
}
module.exports.updateAccountTypeData = async (updateData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE account_types SET ? WHERE id = ?`;
        database.query(updateQry, [updateData, updateData.id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while account type data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update account type data' });
        });
    });
}


//DifficultyLevel
module.exports.checkDifficultyLevelByName = async (name) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM difficulty_levels WHERE name = ? AND status = 1;`;
        database.query(check_ex_record, [name], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get difficulty level detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0], isExist: true });
            return resolve({ status: true, data: [], isExist: false });
        })
    });
}

module.exports.insertDifficultyLevelData = async (posted_data) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO difficulty_levels SET ?`, posted_data, function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert difficulty level data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert difficulty level data.', data: [] });
        });
    });
}

module.exports.getDifficultyLevelById = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM difficulty_levels WHERE id = ? AND status = 1`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get difficulty level detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, message: "Selected difficulty level not found." });
        })
    });
}

module.exports.updateDifficultyLevelData = async (updateData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE difficulty_levels SET ? WHERE id = ?`;
        database.query(updateQry, [updateData, updateData.id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update difficulty level data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update difficulty level data' });
        });
    });
}

module.exports.getAllDifficultyLevel = async () => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM difficulty_levels WHERE status = 1;`;
        database.query(check_ex_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get difficulty level detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Difficulty level not found." });
        })
    });
}

module.exports.getTotalCategories = async () => {
    return new Promise(async resolve => {
        database.query(`SELECT COUNT(*) AS total_record FROM categories WHERE status = 1`, async function (err, result) {
            var total_record = 0
            if (err) total_record = 0
            if (result && result.length > 0) total_record = result[0].total_record
            return resolve({ status: true, data: total_record });
        })
    });
}

module.exports.getTotalTopics = async () => {
    return new Promise(async resolve => {
        database.query(`SELECT COUNT(*) AS total_record FROM topics WHERE status = 1`, async function (err, result) {
            var total_record = 0
            if (err) total_record = 0
            if (result && result.length > 0) total_record = result[0].total_record
            return resolve({ status: true, data: total_record });
        })
    });
}

module.exports.getTotalQuestions = async () => {
    return new Promise(async resolve => {
        database.query(`SELECT COUNT(*) AS total_record FROM questionnaires WHERE status = 1`, async function (err, result) {
            var total_record = 0
            if (err) total_record = 0
            if (result && result.length > 0) total_record = result[0].total_record
            return resolve({ status: true, data: total_record });
        })
    });
}

module.exports.getTotalAccountTypes = async () => {
    return new Promise(async resolve => {
        database.query(`SELECT COUNT(*) AS total_record FROM account_types WHERE status = 1`, async function (err, result) {
            var total_record = 0
            if (err) total_record = 0
            if (result && result.length > 0) total_record = result[0].total_record
            return resolve({ status: true, data: total_record });
        })
    });
}

module.exports.getTotalPlayers = async () => {
    return new Promise(async resolve => {
        database.query(`SELECT COUNT(*) AS total_record FROM users;`, async function (err, result) {
            var total_record = 0
            if (err) total_record = 0
            if (result && result.length > 0) total_record = result[0].total_record
            return resolve({ status: true, data: total_record });
        })
    });
}

module.exports.getTotalUnreadMessage = async () => {
    return new Promise(async resolve => {
        database.query(`SELECT COUNT(*) AS total_record FROM contact_us CU WHERE CU.is_read = 0;`, async function (err, result) {
            var total_record = 0
            if (err) total_record = 0
            if (result && result.length > 0) total_record = result[0].total_record
            return resolve({ status: true, data: total_record });
        })
    });
}

module.exports.getAllCategoriesByAccountID = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT
                                    CAT.id,
                                    CAT.title
                                FROM
                                    category_accounts CA
                                INNER JOIN categories AS CAT
                                ON
                                    CAT.id = CA.category_id
                                WHERE
                                    CA.account_type_id = ? AND CAT.status = 1 AND CA.status = 1;;`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get category detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: true, message: "Category not found.", data: [] });
        })
    });
}


module.exports.insertContactUSData = async (posted_data) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO contact_us SET ?`, posted_data, function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while send contact us data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert contact us data.', data: [] });
        });
    });
}

module.exports.getAllContactUsCount = async () => {
    return new Promise(async resolve => {
        database.query(`SELECT COUNT(*) AS total_record FROM contact_us WHERE status = 1`, async function (err, result) {
            var total_record = 0
            if (err) total_record = 0
            if (result && result.length > 0) total_record = result[0].total_record
            return resolve({ status: true, data: total_record });
        })
    });
}


module.exports.getAllContactUsList = async (data) => {
    return new Promise(async resolve => {
        let get_record = `SELECT * FROM contact_us WHERE status = 1 ORDER BY id DESC LIMIT ${data.limit} OFFSET ${data.offset};`
        database.query(get_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get contuc us list." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Record not found." });
        })
    });
}

module.exports.updateContactUSData = async (updateData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE contact_us SET ? WHERE id = ?`;
        database.query(updateQry, [updateData, updateData.id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update contact us data.' + err });
            return resolve({ status: true, data: [], message: 'success' });
        });
    });
}

module.exports.addBotUserLevel = async (posted_data) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO bot_levels SET ?`, posted_data, function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert bot levels data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert bot levels data.', data: [] });
        });
    });
}

module.exports.getLevelIdByName = async (name) => {
    return new Promise(async resolve => {
        let get_record = `SELECT * FROM default_fees_and_rewards WHERE options = ? AND status = 1 LIMIT 1;`
        database.query(get_record, [name], async function (err, result) {
            if (err) return resolve({ status: false, message: "Selected level not found in database." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, message: "Selected level not found in database." });
        })
    });
}

module.exports.findRandomOpponents = async (postedData) => {
    return new Promise(async resolve => {
        // { 'id': id, 'level': level, 'topic_id': topic_id }
        let get_record = `SELECT * FROM find_random_opponents WHERE user_id != ? AND topic_id = ? AND level = ? LIMIT 1;`
        var sql7 = database.query(get_record, [postedData.user_id, postedData.topic_id, postedData.level], async function (err, result) {
            console.log(sql7.sql, ' ++++ sql7');
            if (err) return resolve({ status: false, message: "Something is wrong while get random opponents.Please contact support team." + err });

            if (result && result.length > 0) {
                return resolve({ status: true, data: result });
            }
            return resolve({ status: true, message: "Selected level not found in database.", data: [] });
        })
    });
}


module.exports.addRandomOpponentSearchData = async (postedData) => {
    return new Promise(async resolve => {
        var whereCon = `user_id = ${postedData.user_id} AND topic_id = ${postedData.topic_id} AND level = '${postedData.level}' `;
        var sql1 = database.query(`SELECT * FROM find_random_opponents WHERE ${whereCon};`, async function (err, result) {
            console.log(sql1.sql, '+++++ sql1');
            if (err) return resolve({ status: false, message: "Something is wrong.when find random opponent." + err });
            if (result && result.length > 0) {
                // postedData.status = 1
                var sql2 = database.query(`UPDATE find_random_opponents SET ? WHERE ${whereCon};`, [postedData], function (err, result) {
                    // console.log(sql2.sql, '+++++ sql2');
                    if (err) return resolve({ status: false, message: 'Something is wrong.when find random opponent.' + err });
                });
                return resolve({ status: true });
            }
            else {
                var sql3 = database.query(`INSERT INTO find_random_opponents SET ?`, [postedData], function (err, result) {
                    // console.log(sql3.sql, '+++++ sql3');
                    if (err) return resolve({ status: false, message: 'Something is wrong.when find random opponent.' + err });
                });
            }
            return resolve({ status: true });
        })
    });
}

module.exports.updateRandomOpponentSearchData = async (postedData) => {
    return new Promise(async resolve => {
        var whereCon = `id = ${postedData.id}`;

        var sql4 = database.query(`UPDATE find_random_opponents SET ? WHERE ${whereCon};`, [postedData], function (err, result) {
            // console.log(sql4.sql, '+++++ sql4');
            if (err) return resolve({ status: false, message: "Something is wrong.when find random opponent." + err });
            return resolve({ status: true });
        })
    });
}

module.exports.deleteRandomOpponentSearchData = async (id) => {
    return new Promise(async resolve => {

        var sql4 = database.query(`DELETE FROM find_random_opponents WHERE id = ?;`, [id], function (err, result) {
            // console.log(sql4.sql, '+++++ sql4');
            if (err) return resolve({ status: false, message: "Something is wrong.when find random opponent." + err });
            return resolve({ status: true });
        })
    });
}


module.exports.findRandomOpponentsV2 = async (postedData) => {
    return new Promise(async resolve => {
        let get_record = `SELECT * FROM find_random_opponents WHERE (user_one != ? OR user_two != ? ) AND topic_id = ? AND level = ? AND status = 1 LIMIT 1;`
        var sql7 = database.query(get_record, [postedData.user_id, postedData.user_id, postedData.topic_id, postedData.level], async function (err, result) {
            // console.log(sql7.sql);
            if (err) return resolve({ status: false, message: "Something is wrong while get random opponents.Please contact support team." + err });
            return resolve({ status: true, data: result });
        })
    });
}


module.exports.updateRandomOpponentSearchDataV2 = async (postedData) => {
    return new Promise(async resolve => {
        var sql4 = database.query(`UPDATE find_random_opponents SET ? WHERE id = ?;`, [postedData, postedData.id], function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when find random opponent." + err });
            return resolve({ status: true });
        })
    });
}


module.exports.addRandomOpponentSearchDataV2 = async (postedData) => {
    return new Promise(async resolve => {
        var sql3 = database.query(`INSERT INTO find_random_opponents SET ?`, [postedData], function (err, result) {
            if (err) return resolve({ status: false, message: 'Something is wrong.when find random opponent.' + err });
            return resolve({ status: true });
        });
    });
}