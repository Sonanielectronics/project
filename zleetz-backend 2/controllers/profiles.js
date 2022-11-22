const config = require("../config/config");

const JWTSecretKey = config.jwtsecretkey;
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
var randomstring = require("randomstring");
var commonFunction = require('../helper/common_functions');
var profilesModel = require('../model/profiles_model');
var categoriesModel = require('../model/categories_model');
const moment = require('moment');
const curruntTime = moment(new Date()).format('YYYY-MM-DD hh:mm:00')

function hashPassword(password) {
    password = config.password_salt + password;
    var hash = crypto.createHash('sha1');
    hash.update(password);
    var value = hash.digest('hex');
    return value;
}

module.exports.encodeData = async (request, response) => {
    try {
        const ciphertext = await commonFunction.encode(request.body);
        return response.json(ciphertext);
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.decodeData = async (request, response) => {
    try {
        var encodedData = request.body;
        const ciphertext = await commonFunction.decode(encodedData.data);
        return response.json(ciphertext);
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}


module.exports.updatePassword = async (request, response) => {
    try {
        const request_body = request.body;
        const { old_password, password } = request_body.data;

        var profile_id = request_body.id;
        var oldPassword = hashPassword(old_password);
        const checkPassword = await profilesModel.checkPassword(oldPassword, profile_id);
        if (!checkPassword.status) return response.json({ status: false, message: checkPassword.message });
        if (password.length < 6) return response.json({ status: false, message: "You have to enter at least 6 digit!" });

        let update_data_val = { id: profile_id, password: hashPassword(password) };

        const updateProfile = await profilesModel.updateProfilesData(update_data_val);
        if (!updateProfile.status) return response.json({ status: false, message: updateProfile.message });

        return response.json({ status: true, message: "The Password Successfully Updated." });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.updateProfileData = async (request, response) => {
    try {
        const request_body = request.body;
        const { full_name, birth_year, country_id, avatar_id } = request_body.data;
        const { id } = request_body;

        const getProfile = await profilesModel.getProfileData(id);
        if (!getProfile.status) return response.json({ status: false, message: getProfile.message });

        let update_data_val = {
            'id': id,
            'full_name': full_name,
            'birth_year': birth_year,
            'avatar_id': avatar_id,
            // 'contact_no': contact_no,
            'country_id': country_id,
            'updated_at': curruntTime
        };

        const updateProfile = await profilesModel.updateProfilesData(update_data_val);
        if (!updateProfile.status) return response.json({ status: false, message: updateProfile.message });

        const getProfileData = await profilesModel.getProfileData(id);
        const ciphertext = await commonFunction.encode(getProfileData.data);
        var token = jwt.sign(JSON.stringify(getProfileData.data), JWTSecretKey);

        return response.json({ status: true, message: "The Profile successfully updated.", data: ciphertext, jwt: token });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getProfileData = async (request, response) => {
    try {
        const request_body = request.body;
        const { id } = request_body;

        const getProfileData = await profilesModel.getProfileData(id);

        const ciphertext = await commonFunction.encode(getProfileData.data);
        var token = jwt.sign(JSON.stringify(getProfileData.data), JWTSecretKey);

        return response.json({ status: true, message: "The Profile successfully updated.", data: ciphertext, jwt: token });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}


module.exports.getAllCategoryByAccount = async (request, response) => {
    try {
        const { id } = request.params;
        const request_body = request.body;
        const userID = request_body.id
        const getCategoryData = await categoriesModel.getAllCategoryByAccountList(id)
        if (!getCategoryData.status) return response.json({ status: false, message: getCategoryData.message, data: [] });

        //Set User account type id
        let update_data_val = { 'id': userID, 'account_type_id': id, 'updated_at': curruntTime };

        const updateProfile = await profilesModel.updateProfilesData(update_data_val);
        if (!updateProfile.status) return response.json({ status: false, message: updateProfile.message });

        const ciphertext = await commonFunction.encode(getCategoryData.data);
        return response.json({ status: true, message: "Category list loaded succsessfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}



// module.exports.editProfilePic = async (request, response) => {
//     try {
//         if (request.files && request.files.profile) {
//             const request_body = request.body;
//             const profileID = request_body.id;

//             const profilePic = request.files.profile;

//             var fileName = profilePic.name;
//             var splitFileName = fileName.split(" ").join("-");
//             // generate unique name
//             const checkFileValidation = await commonFunction.fileValidationFunction(profilePic);
//             if (!checkFileValidation.status) {
//                 return response.json({ status: false, message: checkFileValidation.message, data: [] });
//             }
//             var newFileName = randomstring.generate({ length: 20, charset: 'numeric' }) + '.' + splitFileName;
//             const uploadPath = PROFILE_CONTENT_IMG_PATH + newFileName;
//             await profilePic.mv(uploadPath, (request, response), (err) => {
//                 if (err) {
//                     return response.json({ status: false });
//                 }
//             });

//             let update_data_val = { 'id': profileID, 'profile_pic': newFileName };

//             var updateProfile = await profiles_model.updateProfilesData(update_data_val);
//             if (!updateProfile.status) {
//                 return response.json({ status: updateProfile.status, message: updateProfile.message });
//             }

//             return response.json({ status: true, message: "The Profile picture updated.", data: [] });
//         }
//         return response.json({ status: false, message: "Please select valid image.", data: [] });

//     } catch (Err) {
//         console.log(Err);
//         return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
//     }
// }

// module.exports.mobileVerify = async (request, response) => {
//     try {
//         const request_body = request.body;
//         const originalData = request_body.data;

//         var getProfile = await profiles_model.getProfileData(request_body.id);

//         if (!getProfile.status) {
//             return response.json({ status: getProfile.status, message: getProfile.message });
//         }
//         var profileData = getProfile.data;
//         if (profileData.otp != originalData.otp || profileData.otp == "" || originalData.otp == "") {
//             return response.json({ status: false, message: "Incorrect OTP. Please, try again." });
//         }
//         let update_data_val = { 'id': profileData.id, 'otp': '', 'is_contact_verify': '1' };


//         var updateProfile = await profiles_model.updateProfilesData(update_data_val);
//         if (!updateProfile.status) {
//             return response.json({ status: updateProfile.status, message: updateProfile.message });
//         }

//         return response.json({ status: true, message: "OTP verify successfully.", data: [] });

//     } catch (Err) {
//         console.log(Err);
//         return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
//     }
// }
