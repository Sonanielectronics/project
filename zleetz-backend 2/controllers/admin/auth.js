const config = require("../../config/config");
const JWTSecretKey = config.jwtsecretkey;
var jwt = require('jsonwebtoken');
// const isset = require('isset');

const crypto = require('crypto');
var randomstring = require("randomstring");

// All Controller
var commonFunction = require('../../helper/common_functions');
var profiles_model = require('../../model/admins_model');

function hashPassword(password) {
    password = config.password_salt + password;
    var hash = crypto.createHash('sha1');
    hash.update(password);
    var value = hash.digest('hex');
    return value;
}

module.exports.userLogin = async (request, response) => {
    try {

        const request_body = request.body;
        const originalData = request_body.data;
        originalData.password = hashPassword(originalData.password);

        var getProfileResult = await profiles_model.loginQueryData(originalData);

        if (getProfileResult.status == false) {
            response.header("Access-Control-Allow-Origin", "*");
            return response.json({ status: false, message: getProfileResult.message });
        }

        if (getProfileResult.data && getProfileResult.status == true) {
            result = getProfileResult.data;

            var token = jwt.sign(JSON.stringify(result), JWTSecretKey);
            const ciphertext = await commonFunction.encode(result);
            response.header("Access-Control-Allow-Origin", "*");
            return response.json({ status: true, message: "Login successfully.", data: ciphertext, jwt: token });
        } else {
            response.header("Access-Control-Allow-Origin", "*");
            return response.json({ status: false, message: "Email or password is incorrect." });
        }


    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.signup = async (request, response) => {
    try {
        const request_body = request.body;

        const originalData = request_body.data;
        var check_email = await profiles_model.checkEmail(originalData.email);

        if (originalData.password.length < 6) {
            return response.json({ status: false, message: "You have to enter at least 6 digit password!" });
        }

        if (!check_email.status) {
            return response.json({ status: false, message: check_email.message });
        } else {

            //SingUp Code
            var insert_profile_data = {
                'user_name': originalData.user_name,
                'contact_no': originalData.contact_no,
                'email': originalData.email,
                'password': hashPassword(originalData.password),
                'status': 1,
                'roles': 1,
            }

            // Insert
            var add_profile = await profiles_model.insertProfilesData(insert_profile_data);

            if (!add_profile.status) {
                return response.json({ status: false, message: add_profile.message });
            } else {
                var profile_id = add_profile.data.insertId;

                //Send Verification Mail
                let update_data_val = { id: profile_id, otp: randomstring.generate({ length: 6, charset: 'numeric' }) };

                var updateProfile = await profiles_model.updateProfilesData(update_data_val);

                if (!updateProfile.status) {
                    return response.json({ status: updateProfile.status, message: updateProfile.message });
                }
                // send verify email or sms
                var getProfileDetial = await profiles_model.getProfileData(profile_id);

                if (!getProfileDetial.status) {
                    return resolve({ status: false, data: getProfileDetial.message });
                } else {
                    var result = getProfileDetial.data;
                    const ciphertext = await commonFunction.encode(result);
                    var token = jwt.sign(JSON.stringify(result), JWTSecretKey);

                    return response.json({ status: true, message: "The Profile successfully added.", data: ciphertext, jwt: token });
                }
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

        var getProfileByEmail = await profiles_model.getProfileByEmail(originalData.email);

        if (!getProfileByEmail.status) {
            return response.json({ status: getProfileByEmail.status, message: getProfileByEmail.message });
        }
        var profile_id = getProfileByEmail.data.id;
        let update_data_val = { id: profile_id, otp: randomstring.generate({ length: 6, charset: 'numeric' }) };

        var subject = "Otp for Forgot Password"
        var html = "<h3>Hello, your OTP for Password Reset is </h3>" + "<h1 style='font-weight:bold;'>" + update_data_val.otp + "</h1>"
        var sendOTP = await commonFunction.sendOTPEmail(originalData.email, subject, html)
        // var sendOTP = await profiles_model.sendOtp(originalData.email, update_data_val.otp)
        if (!sendOTP.status) {
            return response.json({ status: sendOTP.status, message: sendOTP.message })
        }

        var updateProfile = await profiles_model.updateProfilesData(update_data_val);
        if (!updateProfile.status) {
            return response.json({ status: updateProfile.status, message: updateProfile.message });
        }

        return response.json({ status: true, message: "OTP Code has been sent to your email please check your email." });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.resetPassword = async (request, response) => {
    try {
        const request_body = request.body;
        const originalData = request_body.data;

        var getProfileData = await profiles_model.getProfileByEmail(originalData.email);

        if (!getProfileData.status) {
            return response.json({ status: getProfileData.status, message: getProfileData.message });
        }
        var profile_id = getProfileData.data.id;

        if (getProfileData.data.otp != originalData.otp) {
            return response.json({ status: false, message: "Incorrect OTP. Please, try again." });
        }

        if (originalData.password.length < 6) {
            return response.json({ status: false, message: "You have to enter at least 6 digit password!" });
        }

        var password = hashPassword(originalData.password);
        let update_data_val = { id: profile_id, password: password, otp: null };

        var updateProfile = await profiles_model.updateProfilesData(update_data_val);
        if (!updateProfile.status) {
            return response.json({ status: updateProfile.status, message: updateProfile.message });
        }

        return response.json({ status: true, message: "The Password Successfully Updated." });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.updatePassword = async (request, response) => {
    try {
        const request_body = request.body;
        const originalData = request_body.data;

        var profile_id = request_body.id;
        var old_password = hashPassword(originalData.old_password);
        var checkPassword = await profiles_model.checkPassword(old_password, profile_id);

        if (originalData.password.length < 6) {
            return response.json({ status: false, message: "You have to enter at least 6 digit!" });
        }
        if (!checkPassword.status) {
            return response.json({ status: checkPassword.status, message: checkPassword.message });
        }

        var new_password = hashPassword(originalData.password);
        let update_data_val = { id: profile_id, password: new_password };

        var updateProfile = await profiles_model.updateProfilesData(update_data_val);
        if (!updateProfile.status) {
            return response.json({ status: updateProfile.status, message: updateProfile.message });
        }

        return response.json({ status: true, message: "The Password Successfully Updated." });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}