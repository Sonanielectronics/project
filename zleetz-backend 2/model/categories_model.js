const config = require("../config/config");
const database = require("../config/db");
const crypto = require('crypto');
var randomstring = require("randomstring");

module.exports.insertCategoryData = async (posted_data) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO categories SET ?`, posted_data, function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert categories data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert categories data.', data: [] });
        });
    });
}


module.exports.getAllCategoryList = async (getAllData) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT
                                    CAT.id,
                                    CAT.title,
                                    CAT.description,
                                    CAT.color_code,
                                    CAT.icon,
                                    CAT.status,
                                    CAT.created_at,
                                    (SELECT GROUP_CONCAT(DISTINCT(ACT.account_type) SEPARATOR ';') AS account_type FROM category_accounts CA INNER JOIN account_types ACT ON ACT.id = CA.account_type_id WHERE CA.category_id = CAT.id AND CA.status = 1) AS account_type_list
                                FROM
                                    categories CAT
                                WHERE
                                    CAT.status = 1`;

        if (getAllData && getAllData.search != null) check_ex_record += ` AND CAT.title LIKE '%${getAllData.search}%' `
        check_ex_record += ` ORDER BY CAT.id DESC `
        if (getAllData && getAllData.limit != null && getAllData.offset != null) check_ex_record += ` LIMIT ${getAllData.limit} OFFSET ${getAllData.offset};`

        database.query(check_ex_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get category detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Category not found." });
        })
    });
}

module.exports.getAllCategoryListCount = async (getAllData) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT COUNT(DISTINCT (CAT.id)) AS total_record FROM categories CAT WHERE CAT.status = 1 `;
        if (getAllData && getAllData.search != null) check_ex_record += ` AND CAT.title LIKE '%${getAllData.search}%' `
        database.query(check_ex_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get question detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0].total_record });
            return resolve({ status: true, data: 0 });
        })
    });
}

module.exports.getAllCategoryByAccountList = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT
                                    CAT.id,
                                    CAT.title,
                                    CAT.description,
                                    CAT.color_code,
                                    CAT.icon,
                                    CAT.status,
                                    CAT.created_at,
                                    (
                                    SELECT
                                        COUNT(*) user_likes
                                    FROM
                                        user_categories AS UCAT
                                    WHERE
                                        UCAT.status = 1 AND UCAT.category_id = CAT.id
                                ) AS uset_likes
                                FROM
                                    categories CAT
                                INNER JOIN category_accounts CAT_ACC ON
                                    CAT_ACC.category_id = CAT.id
                                WHERE
                                    CAT.status = 1 AND CAT_ACC.account_type_id = ?
                                GROUP BY CAT.id
                                ORDER BY uset_likes DESC;`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get category detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Category not found." });
        })
    });
}

module.exports.getCategoryById = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT id,title,description,color_code,icon,status,created_at FROM categories WHERE id = ? AND status = 1`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get category detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, message: "Category not found." });
        })
    });
}

module.exports.isCategoryExistWithTopic = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM topic_categories WHERE category_id = ? AND status = 1`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get category detail." + err });
            if (result && result.length > 0) return resolve({ status: true, isRecord: false });
            return resolve({ status: true, isRecord: true });
        })
    });
}

module.exports.getCategoryByTitle = async (title, id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM categories WHERE title = ? AND status = 1`;
        if (id && id != '') check_ex_record += ` AND id != ${id} ;`
        database.query(check_ex_record, [title], async function (err, result) {
            if (err) return resolve({ status: false, isExist: false, message: "Something is wrong.when get category detail." + err });
            if (result && result.length > 0) {
                return resolve({ status: true, data: result[0], isExist: true });
            }
            return resolve({ status: true, data: false, isExist: false });
        })
    });
}


module.exports.updateCategoryData = async (updateCatData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE categories SET ? WHERE id = ?`;
        database.query(updateQry, [updateCatData, updateCatData.id], function (err, result) {
            if (err) {
                return resolve({ status: false, message: 'Error while update categories data.' + err });
            }
            if (result && result.affectedRows) {
                return resolve({ status: true, data: result, message: 'success' });
            }
            return resolve({ status: false, message: 'Something went wrong. while update categories data' });
        });
    });
}



module.exports.getProfileData = async (profile_id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT PRO.id,PRO.user_name,PRO.email,PRO.contact_no,PRO.status,PRO.otp,PRO.roles
                            FROM admins PRO WHERE PRO.id = ${profile_id};`;
        var sqlQuery = database.query(check_ex_record, async function (err, result) {
            if (err) {
                return resolve({ status: false, message: "Something is wrong.when get profile detail." + err });
            }
            if (result && result.length > 0) {
                result = result[0];
                return resolve({ status: true, data: result, message: 'success' });
            }
            return resolve({ status: false, message: "Something is wrong.Please try again." });
        })
    });
}

module.exports.insertCatagoryAccountData = async (posted_data) => {
    return new Promise(async resolve => {
        const errorCheck = database.query(`INSERT INTO category_accounts (account_type_id, category_id) values ?`, [posted_data], function (err, result) {

            if (err) return resolve({ status: false, message: 'Error while insert account type with category data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert account type with category data.', data: [] });
        });
    });
}

module.exports.updateCatagoryAccountData = async (category_id) => {
    return new Promise(async resolve => {
        database.query(`UPDATE category_accounts SET status = 0 WHERE category_id = ?`, [category_id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update account type with category data.' + err });
            return resolve({ status: true, message: 'success' });
        });
    });
}


module.exports.insertCatagoryUserData = async (posted_data) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO user_categories (category_id, user_id) values ?`, [posted_data], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert account type with category data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert account type with category data.', data: [] });
        });
    });
}

module.exports.updateCatagoryUserData = async (userID) => {
    return new Promise(async resolve => {
        database.query(`UPDATE user_categories SET status = 0 WHERE user_id = ?`, [userID], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update account type with category data.' + err });
            return resolve({ status: true, message: 'success' });
        });
    });
}

module.exports.getUserCatagoryData = async (userID) => {
    return new Promise(async resolve => {
        var getQry = `SELECT
                            CAT.id,
                            CAT.title,
                            CAT.description,
                            CAT.icon,
                            CAT.color_code,
                            IFNULL(UC.id, 0) AS user_category
                        FROM
                            categories CAT
                        LEFT JOIN user_categories UC ON
                            CAT.id = UC.category_id AND UC.user_id = ? AND UC.status = 1
                        WHERE
                            CAT.status = 1
                        GROUP BY
                            CAT.id
                        ORDER BY user_category DESC, CAT.id DESC;`
        database.query(getQry, [userID], function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get category detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Category not found." });
        });
    });
}

module.exports.getAllCategoryAccountByCatID = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT
                                    ACT.id,ACT.account_type
                                FROM
                                    account_types ACT
                                WHERE
                                    ACT.id IN(
                                        SELECT CA.account_type_id 
                                            FROM category_accounts CA 
                                            WHERE CA.status = 1 AND CA.category_id = ?) 
                                    AND ACT.status = 1;`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get category detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Category not found." });
        })
    });
}
module.exports.getAllAccountTypeListByCatID = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT
                                    GROUP_CONCAT(ACT.account_type SEPARATOR ';') AS account_type
                                FROM
                                    account_types ACT
                                WHERE
                                    ACT.id IN(
                                        SELECT CA.account_type_id 
                                            FROM category_accounts CA 
                                            WHERE CA.status = 1 AND CA.category_id = ?) 
                                    AND ACT.status = 1;`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get category detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0].account_type });
            return resolve({ status: true, message: "Category not found.", data: [] });
        })
    });
}