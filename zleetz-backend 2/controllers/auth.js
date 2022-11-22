const config = require("../config/config");
const JWTSecretKey = config.jwtsecretkey;
var jwt = require('jsonwebtoken');

const crypto = require('crypto');
var randomstring = require("randomstring");

// All Controller
const { encode, decode, fileValidationFunction, sendOTPEmail, sendEmailToUser } = require('../helper/common_functions');
const profilesModel = require('../model/profiles_model');
const tokensModel = require('../model/tokens_model');
const settingsModel = require('../model/settings_model');

function hashPassword(password) {
    password = config.password_salt + password;
    var hash = crypto.createHash('sha1');
    hash.update(password);
    var value = hash.digest('hex');
    return value;
}

module.exports.signup = async (request, response) => {
    try {
        const request_body = request.body;

        const { email, user_name, password, avatar_id } = request_body.data;

        const check_username = await profilesModel.checkUserName(user_name);
        if (!check_username.status) return response.json({ status: false, message: check_username.message });
        if (check_username.isExist) return response.json({ status: false, message: "User name already exist! Please try with different name." });

        const check_email = await profilesModel.checkEmail(email);
        if (!check_email.status) return response.json({ status: false, message: check_email.message });
        if (check_email.isExist) return response.json({ status: false, message: "Email already exist! Please try with different email." });
        if (password.length < 6) return response.json({ status: false, message: "You have to enter at least 6 digit password!" });

        const verification_code = randomstring.generate(10)
        //SingUp Code
        var insert_profile_data = { 'user_name': user_name, 'email': email, 'password': hashPassword(password), 'status': 1, 'is_social_login': 0, 'avatar_id': avatar_id, 'verification_code': verification_code }
        // Insert
        const add_profile = await profilesModel.insertProfilesData(insert_profile_data);
        if (!add_profile.status) return response.json({ status: false, message: add_profile.message });

        var profile_id = add_profile.data.insertId;
        //Send Verification Mail
        let update_data_val = { id: profile_id, otp: randomstring.generate({ length: 6, charset: 'numeric' }) };

        const updateProfile = await profilesModel.updateProfilesData(update_data_val);
        if (!updateProfile.status) return response.json({ status: updateProfile.status, message: updateProfile.message });

        // send verify email or sms
        const getProfileDetial = await profilesModel.getProfileData(profile_id);

        if (!getProfileDetial.status) return response.json({ status: false, data: getProfileDetial.message });

        //Add Learning token
        //Defult 100 Learning token 
        let learningToketn = { 'user_id': profile_id, 'learning_token': 100, 'status': 1 };
        const addLearningToken = await tokensModel.addLearningToken(learningToketn);
        if (!addLearningToken.status) return response.json({ status: false, message: addLearningToken.message });

        //Defult 0 Experience Points
        let xPoints = { 'user_id': profile_id, 'xp': 0, 'status': 1 };
        const addExperiencePoints = await tokensModel.addExperiencePoints(xPoints);
        if (!addExperiencePoints.status) return response.json({ status: false, message: addExperiencePoints.message });

        //Defult 0 Learnuing Points
        let lPoints = { 'user_id': profile_id, 'lp': 0, 'status': 1 };
        const addLearningPoints = await tokensModel.addLearningPoints(lPoints);
        if (!addLearningPoints.status) return response.json({ status: false, message: addLearningPoints.message });


        //Add Learning token history
        let learningToketnHis = { 'user_id': profile_id, 'learning_token': 100, 'status': 1, 'reason_for': 1 };
        const addLearningTokenHis = await tokensModel.addLearningTokenHis(learningToketnHis);
        if (!addLearningTokenHis.status) return response.json({ status: false, message: addLearningTokenHis.message });

        var result = getProfileDetial.data;

        const fullUrl = `https://backend.zleetz.com`;
        const verifyData = await encode({ 'id': result.id, 'verification_code': verification_code });

        var sendMailData = {
            subject: 'Zleetz Email Verification',
            email: email,
            username: user_name,
            context: { name: user_name, link: `${fullUrl}/verify-email?verify=${verifyData}`, email: email },
            template: 'verify-account',
        }

        const sendMail = await sendEmailToUser(sendMailData)
        if (!sendMail.status) return response.json({ status: false, message: sendMail.message });

        const ciphertext = await encode(result);
        var token = jwt.sign(JSON.stringify(result), JWTSecretKey);

        return response.json({ status: true, message: "Sign up successfully.", data: ciphertext, jwt: token });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.userLogin = async (request, response) => {
    try {

        const request_body = request.body;
        const originalData = request_body.data;

        if (originalData.is_social_login == 0) {
            if (!originalData.password) return response.json({ status: false, message: "Please enter password." });
            originalData.password = hashPassword(originalData.password);

            const getProfileEmail = await profilesModel.checkEmail(originalData.email);
            if (!getProfileEmail.isExist) return response.json({ status: false, message: "User is not exist. Please try with your email." });

            const getProfileResult = await profilesModel.loginQueryData(originalData);
            if (getProfileResult.status == false) return response.json({ status: false, message: getProfileResult.message });
            const profileData = getProfileResult.data
            if (profileData.status = 0) return response.json({ status: false, message: "You are blocked due violence please contact your administrator.", data: [] });
            var token = jwt.sign(JSON.stringify(profileData), JWTSecretKey);
            const ciphertext = await encode(profileData);
            if (profileData.is_email_verify == 1) return response.json({ status: true, message: "Login succsess.", data: ciphertext, jwt: token });

            const fullUrl = `https://backend.zleetz.com`;
            const verification_code = randomstring.generate(10)

            let update_data_val = { id: profileData.id, verification_code: verification_code };

            const updateProfile = await profilesModel.updateProfilesData(update_data_val);
            if (!updateProfile.status) return response.json({ status: updateProfile.status, message: updateProfile.message });

            const verifyData = await encode({ 'id': profileData.id, 'verification_code': verification_code });

            var sendMailData = {
                subject: 'Zleetz Email Verification',
                email: profileData.email,
                username: profileData.user_name,
                context: { name: profileData.user_name, link: `${fullUrl}/verify-email?verify=${verifyData}`, email: profileData.email },
                template: 'verify-account',
            }

            const sendMail = await sendEmailToUser(sendMailData)
            if (!sendMail.status) return response.json({ status: false, message: sendMail.message });

            return response.json({ status: false, message: "Email is not verified yet. please verify first then login again.", data: [] });

        } else {
            const { email, is_social_login, social_media_type, social_media_id, user_name } = originalData
            var new_user_name = user_name
            if (!email || !is_social_login || !social_media_type || !social_media_id || !user_name)
                return response.json({ status: false, message: "All fields are required!" });

            const existSocial = await profilesModel.checkAndGetSocialMediaDataExists(social_media_type, social_media_id);
            if (!existSocial.status) return response.json({ status: false, message: existSocial.message });
            if (existSocial.isExist) {
                var result = existSocial.data;
                const ciphertext = await encode(result);
                var token = jwt.sign(JSON.stringify(result), JWTSecretKey);

                return response.json({ status: true, message: "User loging successfully.", data: ciphertext, jwt: token });
            } else {
                const check_username = await profilesModel.checkUserName(new_user_name);
                if (!check_username.status) return response.json({ status: false, message: check_username.message });
                if (check_username.isExist) {
                    new_user_name = email.split('@')[0]
                }

                var insert_profile_data = {
                    'user_name': new_user_name,
                    'email': email,
                    'password': hashPassword('Zleetz@2022'),
                    'status': 1,
                    'is_social_login': is_social_login,
                    'social_media_type': social_media_type,
                    'social_media_id': social_media_id,
                    'is_email_verify': (social_media_type == 'google') ? 1 : 0
                }
                // Insert
                const add_profile = await profilesModel.insertProfilesData(insert_profile_data);
                if (!add_profile.status) return response.json({ status: false, message: add_profile.message });
                var profile_id = add_profile.data.insertId;

                //Add Learning token
                //Defult 100 Learning token 
                let learningToketn = { 'user_id': profile_id, 'learning_token': 100, 'status': 1 };
                const addLearningToken = await tokensModel.addLearningToken(learningToketn);
                if (!addLearningToken.status) return response.json({ status: false, message: addLearningToken.message });

                //Defult 0 Experience Points
                let xPoints = { 'user_id': profile_id, 'xp': 0, 'status': 1 };
                const addExperiencePoints = await tokensModel.addExperiencePoints(xPoints);
                if (!addExperiencePoints.status) return response.json({ status: false, message: addExperiencePoints.message });


                //Defult 0 Learnuing Points
                let lPoints = { 'user_id': profile_id, 'lp': 0, 'status': 1 };
                const addLearningPoints = await tokensModel.addLearningPoints(lPoints);
                if (!addLearningPoints.status) return response.json({ status: false, message: addLearningPoints.message });


                //Add Learning token history
                let learningToketnHis = { 'user_id': profile_id, 'learning_token': 100, 'status': 1, 'reason_for': 1 };
                const addLearningTokenHis = await tokensModel.addLearningTokenHis(learningToketnHis);
                if (!addLearningTokenHis.status) return response.json({ status: false, message: addLearningTokenHis.message });


                const getProfileDetial = await profilesModel.getProfileData(profile_id);

                if (!getProfileDetial.status) return response.json({ status: false, data: getProfileDetial.message });

                var result = getProfileDetial.data;
                const ciphertext = await encode(result);
                var token = jwt.sign(JSON.stringify(result), JWTSecretKey);

                return response.json({ status: true, message: "User loging successfully.", data: ciphertext, jwt: token });
            }

        }


    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.forgotPassword = async (request, response) => {
    try {
        const request_body = request.body;
        const originalData = request_body.data;

        const getProfileByEmail = await profilesModel.getProfileByEmail(originalData.email);
        if (!getProfileByEmail.status) return response.json({ status: getProfileByEmail.status, message: getProfileByEmail.message });

        var profile_id = getProfileByEmail.data.id;
        const update_data_val = { id: profile_id, otp: randomstring.generate({ length: 6, charset: 'numeric' }) };

        // var subject = "Otp for Forgot Password"
        // var html = "<h3>Hello, your OTP for Password Reset is </h3>" + "<h1 style='font-weight:bold;'>" + update_data_val.otp + "</h1>"
        // const sendOTP = await sendOTPEmail(originalData.email, subject, html)
        // var sendOTP = await profilesModel.sendOtp(originalData.email, update_data_val.otp)

        var sendMailData = {
            subject: 'Request for reset password',
            email: originalData.email,
            username: getProfileByEmail.data.user_name,
            context: { name: getProfileByEmail.data.user_name, otp: update_data_val.otp, email: originalData.email },
            template: 'forgot-password'
        }

        const sendMail = await sendEmailToUser(sendMailData)
        if (!sendMail.status) return response.json({ status: false, message: sendMail.message });

        const updateProfile = await profilesModel.updateProfilesData(update_data_val);
        if (!updateProfile.status) {
            return response.json({ status: updateProfile.status, message: updateProfile.message });
        }

        return response.json({ status: true, message: "OTP Code has been sent to your email please check your email." });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.verifyOtp = async (request, response) => {
    try {
        const request_body = request.body;
        const { email, otp } = request_body.data;

        const getProfileByEmail = await profilesModel.getProfileByEmail(email);
        if (!getProfileByEmail.status) return response.json({ status: getProfileByEmail.status, message: getProfileByEmail.message });

        if (getProfileByEmail.data.otp != otp) return response.json({ status: false, message: "Incorrect OTP. Please, try again." });
        return response.json({ status: true, message: "Valid OTP." });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.resetPassword = async (request, response) => {
    try {
        const request_body = request.body;
        const { email, password } = request_body.data;

        const getProfileByEmail = await profilesModel.getProfileByEmail(email);
        if (!getProfileByEmail.status) return response.json({ status: false, message: getProfileByEmail.message });

        var profile_id = getProfileByEmail.data.id;

        if (password.length < 6) return response.json({ status: false, message: "You have to enter at least 6 digit!" });

        let update_data_val = { id: profile_id, password: hashPassword(password), otp: '' };

        const updateProfile = await profilesModel.updateProfilesData(update_data_val);
        if (!updateProfile.status) return response.json({ status: false, message: updateProfile.message });

        return response.json({ status: true, message: "The Password Successfully Updated." });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}


module.exports.verifyEmail = async (request, response) => {
    try {
        const query = request.originalUrl;
        const body = query.split('verify=')[1]
        const decordData = await decode(body)
        if (!decordData.id || !decordData.verification_code) return response.status(200).sendFile(global.ROOT_HTML_TEMPLATE_PATH + "html-template/verify_failed.html");

        const checkData = { 'verification_code': decordData.verification_code ? decordData.verification_code.toString() : "", 'id': decordData.id ? parseInt(decordData.id) : 0 }
        const checkValidCode = await profilesModel.checkVerifyCodeIsValid(checkData);
        if (!checkValidCode.status || !checkValidCode.isExist) return response.status(200).sendFile(global.ROOT_HTML_TEMPLATE_PATH + "html-template/verify_failed.html");

        const updateData = { id: decordData.id, verification_code: null, is_email_verify: 1 };
        const updateProfile = await profilesModel.updateProfilesData(updateData);
        if (!updateProfile.status) return response.status(200).sendFile(global.ROOT_HTML_TEMPLATE_PATH + "html-template/verify_failed.html");
        return response.status(200).sendFile(global.ROOT_HTML_TEMPLATE_PATH + "html-template/verify_success.html");

    } catch (e) {
        return response.status(200).sendFile(global.ROOT_HTML_TEMPLATE_PATH + "html-template/verify_failed.html");
    }
}

//Bots Settings
module.exports.addBotsData = async (request, response) => {
    try {
        const request_body = request.body;
        const { name, level, avatar_id, country_id } = request_body.data;


        const getLevelId = await settingsModel.getLevelIdByName(level);
        if (!getLevelId.status) return response.json({ status: false, message: getLevelId.message });
        const levelId = getLevelId.data.id
        const check_username = await profilesModel.checkUserName(name);
        if (!check_username.status) return response.json({ status: false, message: check_username.message });
        if (check_username.isExist) return response.json({ status: false, message: "User name already exist! Please try with different name." });
        var newName = name.replace(/[^A-Z0-9]/ig, "").toLowerCase();
        var insert_profile_data = {
            'user_name': newName,
            'full_name': name,
            'email': newName + '@zleetz.com',
            'password': hashPassword('Zleetz@2022'),
            'status': 1,
            'is_email_verify': 1,
            'is_contact_verify': 1,
            'is_bot': 1,
            'is_active': 1,
            'is_social_login': 0,
            'avatar_id': avatar_id,
            'country_id': country_id,

        }
        // Insert
        const add_profile = await profilesModel.insertProfilesData(insert_profile_data);
        if (!add_profile.status) return response.json({ status: false, message: add_profile.message });

        var profile_id = add_profile.data.insertId;
        //Defult 100 Learning token 
        let learningToketn = { 'user_id': profile_id, 'learning_token': 100, 'status': 1 };
        const addLearningToken = await tokensModel.addLearningToken(learningToketn);
        if (!addLearningToken.status) return response.json({ status: false, message: addLearningToken.message });

        //Defult 0 Experience Points
        let xPoints = { 'user_id': profile_id, 'xp': 0, 'status': 1 };
        const addExperiencePoints = await tokensModel.addExperiencePoints(xPoints);
        if (!addExperiencePoints.status) return response.json({ status: false, message: addExperiencePoints.message });

        //Defult 0 Learnuing Points
        let lPoints = { 'user_id': profile_id, 'lp': 0, 'status': 1 };
        const addLearningPoints = await tokensModel.addLearningPoints(lPoints);
        if (!addLearningPoints.status) return response.json({ status: false, message: addLearningPoints.message });

        //Add Learning token history
        let learningToketnHis = { 'user_id': profile_id, 'learning_token': 100, 'status': 1, 'reason_for': 1 };
        const addLearningTokenHis = await tokensModel.addLearningTokenHis(learningToketnHis);
        if (!addLearningTokenHis.status) return response.json({ status: false, message: addLearningTokenHis.message });

        var insertLevelData = { 'user_id': profile_id, 'level': levelId, 'status': 1 }
        const addLevel = await settingsModel.addBotUserLevel(insertLevelData)
        if (!addLevel.status) return response.json({ status: false, message: addLevel.message });
        return response.json({ status: true, message: "Boat added successfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.editBotsData = async (request, response) => {
    try {

        const request_body = request.body;
        const { id, name, country_code, status } = request_body.data;

        const getCountryData = await settingsModel.getCountryById(id)
        if (!getCountryData.status) return response.json({ status: false, message: getCountryData.message, data: [] });
        if (getCountryData.data.name != name) {
            const getExistCountry = await settingsModel.checkCountryByName(name, id)
            if (!getExistCountry.status) return response.json({ status: false, message: getExistCountry.message, data: [] });
            if (getExistCountry.data) return response.json({ status: false, message: "Country already exists. Please try with different Country name.", data: [] });
        }

        var newFileName = ""
        if (isset(request.files) && (request.files.file)) {
            var countryFlag = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(countryFlag, 'countryFlag/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        }

        var updateData = {
            'id': id,
            'name': name,
            'flag': (newFileName) ? newFileName : getCountryData.data.flag,
            'country_code': (country_code) ? country_code : getCountryData.data.country_code,
            'status': status
        }
        var updateCountryData = await settingsModel.updateCountryData(updateData);
        if (!updateCountryData.status) return response.json({ status: false, message: updateCountryData.message, data: [] });

        return response.json({ status: true, message: "Country updated succsessfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getBotsList = async (request, response) => {
    try {
        const getCountryData = await settingsModel.getAllCountry()
        if (!getCountryData.status) return response.json({ status: false, message: getCountryData.message, data: [] });
        const ciphertext = await encode(getCountryData);
        return response.json({ status: true, message: "Country get succsessfully.", data: ciphertext });
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}
