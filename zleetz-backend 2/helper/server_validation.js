const Joi = require('@hapi/joi');
const isset = require('isset');

var commonFunction = require('./common_functions');

const validate = async (req, res, next) => {
    try {
        var method = req.url;
        // console.log(method);

        var requestData = req.body;
        if (isset(requestData.data)) {
            const data = await commonFunction.decode(requestData.data);
            if (method === "/signup") {

                var checkData = {
                    user_name: Joi.required(),
                    email: Joi.required(),
                    password: Joi.string().required(),
                    avatar_id: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }

            if (method === "/login") {
                delete data.files;
                var checkData = {
                    password: Joi.string().optional(),
                    email: Joi.string().required(),
                    is_social_login: Joi.number().valid(0, 1).required(),
                    social_media_type: Joi.string().when('is_social_login', { is: 1, then: Joi.string().valid('google', 'facebook').required() }),
                    social_media_id: Joi.string().when('social_media_type', { is: 'google', then: Joi.string().required().label("Please provide valid Google ID.") }).concat(Joi.string().when('social_media_type', { is: 'facebook', then: Joi.string().required().label("Please provide valid Facebook ID.") })),
                    user_name: Joi.string().when('is_social_login', { is: 1, then: Joi.string().required() }),
                };
                schema = Joi.object().keys(checkData);
            }

            if (method === "/forgot-password") {
                delete data.files;
                schema = Joi.object().keys({
                    email: Joi.string().required(),
                });
            }
            if (method === "/verify-otp") {
                delete data.files;
                schema = Joi.object().keys({
                    email: Joi.required(),
                    otp: Joi.required()
                });
            }
            if (method === "/reset-password") {
                delete data.files;
                schema = Joi.object().keys({
                    email: Joi.string().required(),
                    password: Joi.string().required(),
                    // otp: Joi.number().required(),
                });
            }

            if (method === "/update-password") {
                var checkData = {
                    old_password: Joi.required(),
                    password: Joi.required(),
                };
                schema = Joi.object().keys(checkData);
            }

            if (method === "/update-profile") {
                var checkData = {
                    full_name: Joi.string().required(),
                    birth_year: Joi.number().required(),
                    // contact_no: Joi.number().required(),
                    country_id: Joi.number().required(),
                    avatar_id: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }

            if (method === "/topics/get") {
                delete data.files;
                var checkData = {
                    page_no: Joi.string().required(),
                    search: Joi.string().optional().allow(''),
                    category_id: Joi.number().optional().allow(''),
                };
                schema = Joi.object().keys(checkData);
            }

            if (method === "/opponents/get-random") {
                delete data.files;
                var checkData = {
                    page_no: Joi.string().required(),
                    search: Joi.string().optional().allow(''),
                    level: Joi.string().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/opponents/get-friends") {
                delete data.files;
                var checkData = {
                    page_no: Joi.string().required(),
                    search: Joi.string().optional().allow(''),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/quiz/play-randomly") {
                delete data.files;
                var checkData = {
                    topic_id: Joi.number().required(),
                    opponent_id: Joi.number().required(),
                    spent_learning_token: Joi.number().required(),
                    level: Joi.string().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/quiz/send-request") {
                delete data.files;
                var checkData = {
                    topic_id: Joi.number().required(),
                    opponent_id: Joi.number().required(),
                    spent_learning_token: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/quiz/send-request2") {
                delete data.files;
                var checkData = {
                    topic_id: Joi.number().required(),
                    opponent_id: Joi.number().required(),
                    spent_learning_token: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/categories/set-user-category") {
                delete data.files;
                var checkData = {
                    categories: Joi.array().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/notifications/get-all") {
                delete data.files;
                var checkData = {
                    page_no: Joi.string().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/quiz/play-requested-quiz" || method === "/quiz/accept-request" || method === "/quiz/decline-request" || method === "/quiz/withdraw-request" || method === "/quiz/get-quiz-questions") {
                delete data.files;
                var checkData = {
                    quiz_id: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            // if (method === "/quiz/get-quiz-questions") {
            //     delete data.files;
            //     var checkData = {
            //         quiz_id: Joi.number().required(),
            //     };
            //     schema = Joi.object().keys(checkData);
            // }
            if (method === "/opponents/get-ranking") {
                delete data.files;
                var checkData = {
                    page_no: Joi.number().required(),
                    topic_id: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/quiz/submit-quiz-answers") {
                delete data.files;
                var checkData = {
                    quiz_id: Joi.number().required(),
                    question_id: Joi.number().required(),
                    spent_time: Joi.number().required(),
                    answer_key: Joi.string().required(),
                    answer: Joi.string().required(),
                    is_first: Joi.number().required(),
                    is_last: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/quiz/submit-time-out-answers") {
                delete data.files;
                var checkData = {
                    quiz_id: Joi.number().required(),
                    question_id: Joi.number().required(),
                    spent_time: Joi.number().required(),
                    is_first: Joi.number().required(),
                    is_last: Joi.number().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/quiz/is-accepted-by-opponent") {
                delete data.files;
                var checkData = {
                    quiz_id: Joi.number().required(),
                    opponent_id: Joi.number().required(),

                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/questions/report") {
                delete data.files;
                var checkData = {
                    question_id: Joi.number().required(),
                    report_reason: Joi.string().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/contact-us") {
                delete data.files;
                var checkData = {
                    name: Joi.string().required(),
                    contact_no: Joi.string().required(),
                    email: Joi.string().required(),
                    message: Joi.string().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/opponents/find-random-bot") {
                delete data.files;
                var checkData = {
                    level: Joi.string().required(),
                };
                schema = Joi.object().keys(checkData);
            }
            if (method === "/opponents/find-random") {
                delete data.files;
                var checkData = {
                    level: Joi.string().required(),
                    topic_id: Joi.number().required(),
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