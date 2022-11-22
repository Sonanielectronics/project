const database = require("../config/db");
const moment = require('moment');
const curruntTime = moment(new Date()).format('YYYY-MM-DD hh:mm:00')

module.exports.checkTopicName = async (name) => {
    return new Promise(async resolve => {
        console.log(name);
        let check_ex_record = `SELECT * FROM topics WHERE name = ? AND status = 1;`;
        let check = database.query(check_ex_record, [name], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get topics detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0], isExist: true });
            return resolve({ status: true, data: [], isExist: false });
        })
    });
}

module.exports.insertTopicData = async (posted_data) => {
    return new Promise(async resolve => {
        var sql = database.query(`INSERT INTO topics SET ?`, posted_data, async function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert topics data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert topics data.', data: [] });
        });
    });
}

module.exports.getTopicCategories = async (id) => {
    return new Promise(async resolve => {
        let getRecord = `SELECT
                                CAT.id,
                                CAT.title,
                                CAT.description,
                                CAT.icon
                            FROM
                                topic_categories TC
                            INNER JOIN categories CAT ON
                                CAT.id = TC.category_id
                            WHERE
                                TC.topic_id = ? AND TC.status = 1;`;
        database.query(getRecord, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get category detail." + err });
            return resolve({ status: true, data: result });
        })
    });
}
module.exports.getTopicCategoriesList = async (id) => {
    return new Promise(async resolve => {
        let getRecord = `SELECT GROUP_CONCAT(CAT.title SEPARATOR ';') AS title
                            FROM
                                topic_categories TC
                            INNER JOIN categories CAT ON
                                CAT.id = TC.category_id
                            WHERE
                                TC.topic_id = ? AND TC.status = 1;`;
        database.query(getRecord, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get category detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0].title });
            return resolve({ status: true, message: "Category not found.", data: [] });
        })
    });
}

module.exports.insertTopicCategoryData = async (posted_data) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO topic_categories (topic_id, category_id) values ?`, [posted_data], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert topics data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert topics data.', data: [] });
        });
    });
}

module.exports.updateTopicCategoryData = async (topic_id) => {
    return new Promise(async resolve => {
        database.query(`UPDATE topic_categories SET status=0 WHERE topic_id = ?`, [topic_id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update topics category data.' + err });
            return resolve({ status: true, message: 'success' });
        });
    });
}


module.exports.getTopicCountry = async (id) => {
    return new Promise(async resolve => {
        let getRecord = `SELECT
                            CON.id,
                            CON.name,
                            CON.country_code
                        FROM
                            topic_countries_relevance TCL
                        INNER JOIN countries CON ON
                            CON.id = TCL.country_id
                        WHERE
                            TCL.topic_id = ? AND TCL.status = 1;`;
        database.query(getRecord, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get regions detail." + err });
            return resolve({ status: true, data: result });
        })
    });
}
module.exports.getTopicCountryList = async (id) => {
    return new Promise(async resolve => {
        let getRecord = `SELECT
                            GROUP_CONCAT(CON.name SEPARATOR ';') AS name
                        FROM
                            topic_countries_relevance TCL
                        INNER JOIN countries CON ON
                            CON.id = TCL.country_id
                        WHERE
                            TCL.topic_id = ? AND TCL.status = 1;`;
        database.query(getRecord, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get regions detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0].name });
            return resolve({ status: true, message: "Category not found.", data: [] });
        })
    });
}

module.exports.insertTopicCountriesData = async (posted_data) => {
    return new Promise(async resolve => {
        database.query(`INSERT INTO topic_countries_relevance (topic_id, country_id,status ) values ?`, [posted_data], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while insert countries data.' + err });
            if (result && result.insertId) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while insert countries data.', data: [] });
        });
    });
}

module.exports.updateTopicCountriesData = async (topic_id) => {
    return new Promise(async resolve => {
        database.query(`UPDATE topic_countries_relevance SET status=0 WHERE topic_id = ?`, [topic_id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update topics countries data.' + err });
            return resolve({ status: true, message: 'success' });
        });
    });
}

module.exports.getTopicById = async (id) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT TOPIC.id,
                                    TOPIC.name,
                                    TOPIC.description,
                                    TOPIC.access,
                                    TOPIC.access_code,
                                    TOPIC.regional_relevance,
                                    TOPIC.color_code,
                                    TOPIC.search_tags,
                                    TOPIC.game_mode,
                                    TOPIC.allow_bot,
                                    TOPIC.match_format,
                                    TOPIC.number_of_questions,
                                    TOPIC.time_for_question,
                                    TOPIC.icon,
                                    TOPIC.created_at,
                                    TOPIC.updated_at
                                FROM topics TOPIC WHERE TOPIC.id = ? AND TOPIC.status = 1`;
        database.query(check_ex_record, [id], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get countries detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0] });
            return resolve({ status: false, message: "Selected topic not found." });
        })
    });
}

module.exports.updateTopicData = async (updateData) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE topics SET ? WHERE id = ?`;
        database.query(updateQry, [updateData, updateData.id], function (err, result) {
            if (err) return resolve({ status: false, message: 'Error while update topic data.' + err });
            if (result && result.affectedRows) return resolve({ status: true, data: result, message: 'success' });
            return resolve({ status: false, message: 'Something went wrong. while update topic data' });
        });
    });
}

module.exports.getAllTopicList = async (data) => {
    return new Promise(async resolve => {
        // { 'limit': limit, 'offset': offset, 'searchData': searchData, 'access': access, 'regional_relevance': regional_relevance, 'countries': countriesList }
        var countriesJoin = ''
        var categoryJoin = ''
        if (data.countries && data.countries.length > 0) countriesJoin = ` INNER JOIN topic_countries_relevance TOPIC_CON ON TOPIC_CON.topic_id = TOPIC.id `
        if (data.category_id && data.category_id != null && data.category_id != '') categoryJoin = ` INNER JOIN topic_categories TOPIC_CAT ON TOPIC_CAT.topic_id = TOPIC.id AND TOPIC_CAT.status = 1 AND TOPIC_CAT.category_id = ${data.category_id}`
        let get_record = `SELECT TOPIC.id,
                                    TOPIC.name,
                                    TOPIC.description,
                                    TOPIC.access,
                                    TOPIC.access_code,
                                    TOPIC.regional_relevance,
                                    TOPIC.color_code,
                                    TOPIC.search_tags,
                                    TOPIC.game_mode,
                                    TOPIC.match_format,
                                    TOPIC.number_of_questions,
                                    TOPIC.time_for_question,
                                    TOPIC.icon,
                                    TOPIC.allow_bot,
                                    TOPIC.created_at,
                                    TOPIC.updated_at,
                                    (SELECT GROUP_CONCAT(DISTINCT(CAT.title) SEPARATOR ';') AS title FROM topic_categories TC INNER JOIN categories CAT ON CAT.id = TC.category_id WHERE TC.topic_id = TOPIC.id AND TC.status = 1) AS category_list
                                FROM topics TOPIC
                                ${countriesJoin}
                                ${categoryJoin}
                                WHERE TOPIC.status = 1`;
        if (data.search && data.search != null) get_record += ` AND (TOPIC.name LIKE '%${data.search}%' OR TOPIC.search_tags LIKE '%${data.search}%' ) `
        if (data.regional_relevance && data.regional_relevance != 'All') get_record += ` AND TOPIC.regional_relevance = '${data.regional_relevance}' `
        if (data.access && data.access != 'All') get_record += ` AND TOPIC.access = '${data.access}' `
        if (data.countries && data.countries.length > 0) get_record += ` AND TOPIC_CON.country_id IN (${data.countries}) `
        if (data.category_id && data.category_id != null && data.category_id != '') get_record += ` AND TOPIC_CAT.category_id = ${data.category_id} `
        get_record += ` GROUP BY TOPIC.id ORDER BY TOPIC.id DESC `;
        if (data.limit && data.limit != 0) get_record += ` LIMIT ${data.limit} OFFSET ${data.offset};`;

        database.query(get_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get topics detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Record not found." });
        })
    });
}



module.exports.getAllTopicData = async (data) => {
    return new Promise(async resolve => {
        let get_record = `SELECT TOPIC.id,
                                    TOPIC.name,
                                    TOPIC.description,
                                    TOPIC.access,
                                    TOPIC.access_code,
                                    TOPIC.regional_relevance,
                                    TOPIC.color_code,
                                    REPLACE(REPLACE(REPLACE(TOPIC.search_tags,']',''),'[',''),'"','') AS search_tags,
                                    TOPIC.game_mode,
                                    TOPIC.match_format,
                                    TOPIC.allow_bot,
                                    TOPIC.number_of_questions,
                                    TOPIC.time_for_question,
                                    TOPIC.experience_point,
                                    TOPIC.icon,
                                    TOPIC.created_at,
                                    TOPIC.updated_at
                                FROM topics TOPIC
                                WHERE TOPIC.status = 1 ORDER BY TOPIC.id DESC`;
        database.query(get_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get topics detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Record not found." });
        })
    });
}

module.exports.getAllTopicListByCategories = async (catID, userID) => {
    return new Promise(async resolve => {

        let get_record = `SELECT
                                TOPIC.id,
                                TOPIC.name,
                                TOPIC.description,
                                TOPIC.access,
                                TOPIC.access_code,
                                TOPIC.regional_relevance,
                                TOPIC.color_code,
                                TOPIC.search_tags,
                                TOPIC.icon,
                                TOPIC.game_mode,
                                TOPIC.match_format,
                                TOPIC.created_at,
                                TOPIC.updated_at,
                                (
                                    SELECT
                                        COUNT(*) AS total_record
                                    FROM
                                        quizzes QUIZ
                                    WHERE
                                        QUIZ.status = 1 AND QUIZ.topic_id = TC.topic_id
                                ) AS all_quiz,
                                (
                                SELECT
                                    COUNT(*) AS total_record
                                FROM
                                    question_topics QT
                                WHERE
                                    QT.status = 1 AND QT.topic_id = TC.topic_id
                            ) AS all_que,
                            (
                                SELECT
                                    COUNT(DISTINCT(QQA.question_id))
                                FROM
                                    quiz_questions_answers QQA
                                INNER JOIN quizzes QUIZ ON
                                    QUIZ.id = QQA.quiz_id
                                WHERE
                                    QQA.status = 1 
                                    AND (QQA.player_id = ? OR QQA.opponent_id = ?)
                                    AND (CASE WHEN QQA.player_id = ? THEN QQA.player_answer != 0 END 
                                        OR CASE WHEN QQA.opponent_id = ? THEN QQA.opponent_answer != 0 END )
                                    AND QUIZ.topic_id = TC.topic_id
                            ) AS user_que
                            FROM
                                topic_categories TC
                            INNER JOIN topics TOPIC ON
                                TOPIC.id = TC.topic_id
                            WHERE
                                TC.category_id = ? 
                                AND TC.status = 1 
                                AND TOPIC.status = 1
                            GROUP BY TOPIC.id
                            ORDER BY all_quiz DESC, all_que DESC;`
        var sql = database.query(get_record, [userID, userID, userID, userID, catID], async function (err, result) {
            // console.log(sql.sql);
            if (err) return resolve({ status: false, message: "Something is wrong.while get topics detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Record not found." });
        })
    });
}

module.exports.getTopicList = async (data) => {
    return new Promise(async resolve => {
        database.query(`SELECT TOPIC.id,TOPIC.name FROM topics TOPIC WHERE TOPIC.status = 1 ORDER BY TOPIC.id DESC`, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get topics detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Record not found." });
        })
    });
}

module.exports.getAllTopicListCount = async (data) => {
    return new Promise(async resolve => {
        var countriesJoin = ''
        var categoryJoin = ''
        if (data.countries && data.countries.length > 0) countriesJoin = ` INNER JOIN topic_countries_relevance TOPIC_CON ON TOPIC_CON.topic_id = TOPIC.id `
        if (data.category_id && data.category_id != null && data.category_id != '') categoryJoin = ` INNER JOIN topic_categories TOPIC_CAT ON TOPIC_CAT.topic_id = TOPIC.id AND TOPIC_CAT.status = 1 AND TOPIC_CAT.category_id = ${data.category_id}`


        let get_record = `SELECT COUNT(DISTINCT (TOPIC.id)) AS total_record
                                FROM topics TOPIC
                                 ${countriesJoin}
                                ${categoryJoin}
                                WHERE TOPIC.status = 1 `
        if (data.search && data.search != null) get_record += ` AND (TOPIC.name LIKE '%${data.search}%' OR TOPIC.search_tags LIKE '%${data.search}%' ) `
        if (data.regional_relevance && data.regional_relevance != 'All') get_record += ` AND TOPIC.regional_relevance = '${data.regional_relevance}' `
        if (data.access && data.access != 'All') get_record += ` AND TOPIC.access = '${data.access}' `
        if (data.countries && data.countries.length > 0) get_record += ` AND TOPIC_CON.country_id IN (${data.countries}) `
        if (data.category_id && data.category_id != null && data.category_id != '') get_record += ` AND TOPIC_CAT.category_id = ${data.category_id} `

        database.query(get_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get topics detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0].total_record });
            return resolve({ status: true, data: 0 });
        })
    });
}

// module.exports.getAllQuestionsCountOfTopic = async (topic_id) => {
//     return new Promise(async resolve => {
//         let get_record = `SELECT count(*) AS total_record FROM question_topics QT WHERE QT.status = 1 AND QT.topic_id = ?`;
//         var sql = database.query(get_record, [topic_id], async function (err, result) {
//             if (err) return resolve({ status: false, message: "Something is wrong.while get questions detail." + err });
//             if (result && result.length > 0) return resolve({ status: true, data: result[0].total_record });
//             return resolve({ status: true, data: 0 });
//         })
//     });
// }

module.exports.getAllQuestionsCountOfTopic = async (data) => {
    return new Promise(async resolve => {
        var notIn = ''
        //FIXME:check con for not in que
        if (data.not_in.length != 0) notIn = ` AND QUE.id NOT IN (${data.not_in}) `
        let get_record = `SELECT
                            count(DISTINCT (QUE.id)) AS total_record
                        FROM
                            questionnaires QUE
                        INNER JOIN question_topics QUE_TOP ON
                            QUE_TOP.question_id = QUE.id
                        WHERE QUE.status = 1
                            AND QUE_TOP.topic_id = ${data.topic_id}
                            AND QUE.regional_relevance = '${data.regional_relevance}'
                            AND (QUE.time_for_question + QUE.time_for_answer)  <= ${data.question_time}
                            ${notIn};`
        database.query(get_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get question list2." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result[0].total_record });
            return resolve({ status: true, message: "This topic Question not found.", data: [] });
        })
    });
}

module.exports.getUserQuestionsOfTopic = async (getData) => {
    return new Promise(async resolve => {
        let get_record = `SELECT 
                             DISTINCT QQA.question_id AS question_id,
                             (QUE.time_for_question + QUE.time_for_answer) AS question_time
                        FROM
                            quiz_questions_answers QQA
                        INNER JOIN questionnaires QUE ON
                            QUE.id = QQA.question_id
                        INNER JOIN quizzes QUI ON
                            QUI.id = QQA.quiz_id
                        INNER JOIN topics TOPIC ON
                            TOPIC.id = QUI.topic_id
                        WHERE
                            QUI.player_id = ?
                            AND TOPIC.id = ?
                            AND QUE.regional_relevance = ?
                            HAVING question_time <= ?;`;
        var qry = database.query(get_record, [getData.id, getData.topic_id, getData.regional_relevance, getData.question_time], async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get questions detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: true, data: [] });
        })
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












module.exports.getAllCountry = async () => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT * FROM countries WHERE status = 1;`;
        database.query(check_ex_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.when get countries detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Countries not found." });
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


module.exports.getTopicListByPopularity = async () => {
    return new Promise(async resolve => {

        let get_record = `SELECT
                            TOPIC.id,
                            TOPIC.name,
                            TOPIC.description,
                            TOPIC.access,
                            TOPIC.access_code,
                            TOPIC.regional_relevance,
                            TOPIC.color_code,
                            REPLACE(REPLACE(REPLACE(TOPIC.search_tags,']',''),'[',''),'"','') AS search_tags,
                            TOPIC.game_mode,
                            TOPIC.match_format,
                            TOPIC.number_of_questions,
                            TOPIC.time_for_question,
                            TOPIC.experience_point,
                            TOPIC.icon,
                            TOPIC.created_at,
                            TOPIC.updated_at,
                            (
                                SELECT
                                    COUNT(*) AS total_record
                                FROM
                                    quizzes QUIZ
                                WHERE
                                    QUIZ.status = 1 AND QUIZ.topic_id = TOPIC.id
                            ) AS all_quiz,
                            (
                                SELECT
                                    COUNT(*) AS total_record
                                FROM
                                    question_topics QT
                                WHERE
                                    QT.status = 1 AND QT.topic_id = TOPIC.id
                            ) AS all_que
                            FROM
                                topics TOPIC
                            WHERE
                                TOPIC.status = 1
                            GROUP BY
                                TOPIC.id
                            ORDER BY
                                all_quiz DESC,
                                all_que DESC;`;

        database.query(get_record, async function (err, result) {
            if (err) return resolve({ status: false, message: "Something is wrong.while get topics detail." + err });
            if (result && result.length > 0) return resolve({ status: true, data: result });
            return resolve({ status: false, message: "Record not found." });
        })
    });
}
