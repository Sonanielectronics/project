const Joi = require('@hapi/joi');
const isset = require('isset');

var commonFunction = require('./common_functions');

const validate = async (req, res, next) => {
    try {
        var method = req.url;
        // console.log(method                                                                                                                                                                      );

        var requestData = req.body;
        if (isset(requestData.data)) {
            const data = await commonFunction.decode(requestData.data);
            if (method === "/signup") {

                var checkData = {
                    user_name: Joi.required(),
                    email: Joi.required(),
                    contact_no: Joi.number().required(),
                    password: Joi.string().required(),
                };
                schema = Joi.object().keys(checkData);
            }

            if (method === "/login") {
                delete data.files;
                var checkData = {
                    password: Joi.string().required(),
                    email: Joi.string().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/forgot-password") {
                delete data.files;
                var checkData = {
                    email: Joi.string().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/reset-password") {
                delete data.files;
                var checkData = {
                    email: Joi.string().required(),
                    otp: Joi.string().required(),
                    password: Joi.string().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/update-password") {
                delete data.files;
                var checkData = {
                    old_password: Joi.string().required(),
                    password: Joi.string().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/categories/add") {
                delete data.files;
                var checkData = {
                    title: Joi.string().trim().min(3).required(),
                    description: Joi.string().optional().allow(''),
                    account_types: Joi.array().required(),
                    color_code: Joi.string().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/categories/edit") {
                delete data.files;
                var checkData = {
                    id: Joi.number().required(),
                    title: Joi.string().trim().min(3).required(),
                    description: Joi.string().optional().allow(''),
                    account_types: Joi.array().required(),
                    color_code: Joi.string().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/categories/get-list") {
                delete data.files;
                var checkData = {
                    page_no: Joi.string().required(),
                    search: Joi.string().optional().allow(''),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/account-types/get-list") {
                delete data.files;
                var checkData = {
                    page_no: Joi.string().required(),
                    search: Joi.string().optional().allow(''),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/countries/add") {
                delete data.files;
                var checkData = {
                    name: Joi.string().trim().min(3).required(),
                    country_code: Joi.string().optional().allow(''),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/countries/get-list") {
                delete data.files;
                var checkData = {
                    page_no: Joi.string().required(),
                    search: Joi.string().optional().allow(''),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/countries/edit") {
                delete data.files;
                var checkData = {
                    id: Joi.number().required(),
                    name: Joi.string().trim().min(3).required(),
                    country_code: Joi.string().optional().allow(''),
                    status: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/regions/add") {
                delete data.files;
                var checkData = {
                    name: Joi.string().trim().min(3).required(),
                    country_id: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/regions/edit") {
                delete data.files;
                var checkData = {
                    id: Joi.number().required(),
                    country_id: Joi.number().required(),
                    name: Joi.string().trim().min(3).required(),
                    status: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/topics/add") {
                delete data.files;
                var checkData = {
                    name: Joi.string().trim().min(3).required(),
                    description: Joi.string().required(),
                    access: Joi.string().valid('Open', 'Close').required(),//	Open,Close	
                    regional_relevance: Joi.string().valid('Global', 'Local').required(),//	Global,Local	
                    game_mode: Joi.string().valid('Training', 'Tournament').required(),//	Global,Local	
                    match_format: Joi.string().valid('Blitz', 'Classic').required(),//	Global,Local	
                    number_of_questions: Joi.number().required(),
                    time_for_question: Joi.number().required(),
                    color_code: Joi.string().required(),
                    categories: Joi.array().required(),
                    search_tags: Joi.array().required(),
                    countries: Joi.array().optional().allow(''),
                    access_code: Joi.string().optional().allow(''),
                    allow_bot: Joi.number().valid(0, 1).required(), //0=Off,1=On
                    // experience_point: Joi.number().required(),
                    // tournament_point: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/topics/edit") {
                delete data.files;
                var checkData = {
                    id: Joi.number().required(),
                    name: Joi.string().trim().min(3).required(),
                    description: Joi.string().required(),
                    access: Joi.string().valid('Open', 'Close').required(),//	Open,Close	
                    regional_relevance: Joi.string().valid('Global', 'Local').required(),//	Global,Local	
                    color_code: Joi.string().required(),
                    categories: Joi.array().required(),
                    search_tags: Joi.array().required(),
                    countries: Joi.array().optional().allow(''),
                    access_code: Joi.string().optional().allow(''),
                    game_mode: Joi.string().valid('Training', 'Tournament').required(),//	Global,Local	
                    match_format: Joi.string().valid('Blitz', 'Classic').required(),//	Global,Local	
                    number_of_questions: Joi.number().required(),
                    time_for_question: Joi.number().required(),
                    allow_bot: Joi.number().valid(0, 1).required(), //0=Off,1=On
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/topics/get") {
                delete data.files;
                var checkData = {
                    page_no: Joi.string().optional().allow(''),
                    search: Joi.string().optional().allow(''),
                    access: Joi.string().valid('Open', 'Close', 'All').required(),
                    regional_relevance: Joi.string().valid('Global', 'Local', 'All').optional(),
                    countries: Joi.array().optional().allow(''),
                    category_id: Joi.number().optional().allow(''),

                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/avatars/add") {
                delete data.files;
                var checkData = {
                    name: Joi.string().trim().min(1).required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/questionnaires/add") {
                delete data.files;
                var checkData = {
                    question: Joi.string().trim().min(3).required(),
                    correct_answer: Joi.string().trim().min(1).required(),
                    wrong_answer_1: Joi.string().trim().min(1).required(),
                    wrong_answer_2: Joi.string().trim().min(1).required(),
                    wrong_answer_3: Joi.string().trim().min(1).required(),
                    difficulty_level_id: Joi.number().required(), //General Knowledge / Specialized Knowledge	
                    // regional_relevance: Joi.string().valid('Global', 'Local').required(), //Global,Local	
                    time_for_question: Joi.number().required(),
                    time_for_answer: Joi.number().required(),
                    is_question_image: Joi.number().valid(0, 1).required(), //0=Off,1=On
                    // countries: Joi.array().optional().allow(''),
                    topics: Joi.array().optional().allow(''),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/questionnaires/edit") {
                delete data.files;
                var checkData = {
                    id: Joi.number().required(),
                    question: Joi.string().trim().min(3).required(),
                    correct_answer: Joi.string().trim().min(1).required(),
                    wrong_answer_1: Joi.string().trim().min(1).required(),
                    wrong_answer_2: Joi.string().trim().min(1).required(),
                    wrong_answer_3: Joi.string().trim().min(1).required(),
                    difficulty_level_id: Joi.number().required(), //General Knowledge / Specialized Knowledge	
                    // regional_relevance: Joi.string().valid('Global', 'Local').required(), //Global,Local	
                    time_for_question: Joi.number().required(),
                    time_for_answer: Joi.number().required(),
                    is_question_image: Joi.number().valid(0, 1).required(), //0=Off,1=On
                    // countries: Joi.array().optional().allow(''),
                    topics: Joi.array().optional().allow(''),
                };
                schema = Joi.object().keys(checkData);
            }

            if (method === "/questionnaires/get") {
                delete data.files;
                var checkData = {
                    page_no: Joi.string().required(),
                    search: Joi.string().optional().allow(''),
                    topic_id: Joi.number().optional().allow(''),
                    // regional_relevance: Joi.string().valid('Global', 'Local', 'All').required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/account-types/add") {
                delete data.files;
                var checkData = {
                    account_type: Joi.string().trim().min(1).required(),
                    description: Joi.string().trim().min(1).required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/account-types/edit") {
                delete data.files;
                var checkData = {
                    id: Joi.number().required(),
                    account_type: Joi.string().trim().min(1).required(),
                    description: Joi.string().trim().min(1).required(),
                    status: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }

            if (method === "/difficulty_levels/add") {
                delete data.files;
                var checkData = {
                    name: Joi.string().trim().min(3).required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/difficulty_levels/edit") {
                delete data.files;
                var checkData = {
                    id: Joi.number().required(),
                    name: Joi.string().trim().min(3).required(),
                    status: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/match-fees-rewards/add") {
                delete data.files;
                var checkData = {
                    topic_id: Joi.number().required(),
                    options: Joi.string().required(),
                    entry_fee: Joi.number().required(),
                    win_reward: Joi.number().required(),
                    comments: Joi.string().optional().allow(''),
                    color_code: Joi.string().required(),
                    game_mode: Joi.string().required(),
                    unit: Joi.string().required(),
                    // is_free: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/match-fees-rewards/edit") {
                delete data.files;
                var checkData = {
                    id: Joi.number().required(),
                    topic_id: Joi.number().required(),
                    options: Joi.string().required(),
                    entry_fee: Joi.number().required(),
                    win_reward: Joi.number().required(),
                    comments: Joi.string().optional().allow(''),
                    color_code: Joi.string().required(),
                    game_mode: Joi.string().required(),
                    unit: Joi.string().required(),
                    // is_free: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/default-match-fees-rewards/add") {
                delete data.files;
                var checkData = {
                    options: Joi.string().required(),
                    entry_fee: Joi.number().required(),
                    win_reward: Joi.number().required(),
                    color_code: Joi.string().required(),
                    game_mode: Joi.string().required(),
                    unit: Joi.string().required(),
                    bot_speed_from: Joi.number().min(0).max(100).required(),
                    bot_speed_to: Joi.number().min(0).max(100).greater(Joi.ref('bot_speed_from')).required(),
                    bot_correct_answer_from: Joi.number().min(0).max(100).required(),
                    bot_correct_answer_to: Joi.number().min(0).max(100).greater(Joi.ref('bot_correct_answer_from')).required(),
                    bot_error_from: Joi.number().min(0).max(100).required(),
                    bot_error_to: Joi.number().min(0).max(100).greater(Joi.ref('bot_error_from')).required(),

                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/default-match-fees-rewards/edit") {
                delete data.files;
                var checkData = {
                    id: Joi.number().required(),
                    options: Joi.string().required(),
                    entry_fee: Joi.number().required(),
                    win_reward: Joi.number().required(),
                    color_code: Joi.string().required(),
                    game_mode: Joi.string().required(),
                    unit: Joi.string().required(),
                    bot_speed_from: Joi.number().min(0).max(100).required(),
                    bot_speed_to: Joi.number().min(0).max(100).greater(Joi.ref('bot_speed_from')).required(),
                    bot_correct_answer_from: Joi.number().min(0).max(100).required(),
                    bot_correct_answer_to: Joi.number().min(0).max(100).greater(Joi.ref('bot_correct_answer_from')).required(),
                    bot_error_from: Joi.number().min(0).max(100).required(),
                    bot_error_to: Joi.number().min(0).max(100).greater(Joi.ref('bot_error_from')).required(),
                };
                schema = Joi.object().keys(checkData);
            }


            if (method === "/get-contact-us") {
                delete data.files;
                var checkData = {
                    page_no: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }

            if (method === "/questionnaires/get-report-questions") {
                delete data.files;
                var checkData = {
                    page_no: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }

            if (method === "/players/get") {
                delete data.files;
                var checkData = {
                    page_no: Joi.number().required(),
                    is_bot: Joi.number().valid(1, 0).required(),
                    search: Joi.string().optional().allow(''),
                    level: Joi.number().optional().allow(''),
                    // start_date: Joi.date().optional().allow(''),
                    // end_date: Joi.date().optional().allow(''),
                };
                schema = Joi.object().keys(checkData);
            }

            if (method === "/players/verify") {
                delete data.files;
                var checkData = {
                    user_id: Joi.number().required(),
                    email_verify: Joi.number().valid(1, 0).required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/players/block") {
                delete data.files;
                var checkData = {
                    user_id: Joi.number().required(),
                    status: Joi.number().valid(1, 0).required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/bots/add") {
                delete data.files;
                var checkData = {
                    name: Joi.string().trim().min(3).required(),
                    level: Joi.string().trim().min(3).required(),
                    avatar_id: Joi.number().required(),
                    country_id: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }

            req.body.data = data;

            Joi.validate(data, schema, (err) => {
                if (err) {
                    return res.status(200).json({
                        status: false,
                        message: err.details[0].message,
                        data: []
                    })
                } else {
                    return next();
                }
            });
        } else {
            return res.status(200).json({
                status: false,
                message: "Data must be required",
            })
        }
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            status: false,
            message: "Server velidation is fail.",
            data: []
        })
    }
};

module.exports = {
    validate
};