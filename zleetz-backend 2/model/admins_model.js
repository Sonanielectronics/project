const config = require("../config/config");
const database = require("../config/db");
const crypto = require('crypto');
var randomstring = require("randomstring");

module.exports.checkEmail = async (email) => {
    return new Promise(async resolve => {
        let check_ex_email = `SELECT  PRO.id,PRO.user_name,PRO.email,PRO.contact_no,PRO.status,PRO.roles
                 FROM admins PRO WHERE PRO.email = "${email}";`;
        var sqlQuery = database.query(check_ex_email, async function (err, result) {
            if (err) {
                return resolve({ status: false, message: "Something is wrong.Please try again." + err, data: err });
            }
            if (result && result.length > 0) {
                return resolve({ status: false, message: "Email already exist!" });
            }
            return resolve({ status: true, message: "success" });
        })
    });
}


module.exports.insertProfilesData = async (posted_data) => {
    return new Promise(async resolve => {
        var sqlQuery = database.query(`INSERT INTO admins SET ?`, posted_data, function (err, result) {
            if (err) {
                return resolve({ status: false, message: 'Error while insert profiles data.' + err });
            }
            if (result && result.insertId) {
                return resolve({ status: true, data: result, message: 'success' });
            }
            return resolve({ status: false, message: 'Something went wrong. while insert profiles data.', data: [] });

        });
    });
}

module.exports.updateProfilesData = async (posted_data) => {
    return new Promise(async resolve => {
        var updateQry = `UPDATE admins SET ? WHERE id = ?`;
        var sqlQuery = database.query(updateQry, [posted_data, posted_data.id], function (err, result) {
            if (err) {
                return resolve({ status: false, message: 'Error while update profiles data.' + err });
            }
            if (result && result.affectedRows) {
                return resolve({ status: true, data: result, message: 'success' });
            }
            return resolve({ status: false, message: 'Something went wrong. while update profiles data' });
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

module.exports.getProfileByEmail = async (email) => {
    return new Promise(async resolve => {
        let check_ex_record = `SELECT  PRO.id,PRO.user_name,PRO.otp, PRO.email,PRO.contact_no,PRO.roles,PRO.status 
                            FROM admins PRO WHERE PRO.email = "${email}";`;
        var sqlQuery = database.query(check_ex_record, async function (err, result) {
            if (err) {
                return resolve({ status: false, message: "Something is wrong.when get profile detail." + err });
            }
            if (result && result.length > 0) {
                result = result[0];
                return resolve({ status: true, data: result, message: 'success' });
            }
            return resolve({ status: false, message: "User not found.Please try with other email." });
        })
    });
}

module.exports.loginQueryData = async (originalData) => {
    return new Promise(async resolve => {


        let exist_code_sql = `SELECT PRO.id,PRO.user_name,PRO.email,PRO.contact_no,PRO.roles,PRO.status FROM admins PRO WHERE 
                                PRO.password ="${originalData.password}"
                                AND PRO.email = "${originalData.email}";`;
        var sqlQuery = database.query(exist_code_sql, function (err, result) {
            if (err) {
                return resolve({ status: false, message: 'Error while get profiles data.' + err, data: err });
            }
            if (result && result.length > 0) {
                result = result[0];
                return resolve({ status: true, data: result, message: 'success' });
            }
            return resolve({ status: false, message: 'Email or password is incorrect.', data: [] });
        });
    });
}


module.exports.checkPassword = async (old_password, id) => {
    return new Promise(async resolve => {
        let checkPassword = `SELECT * FROM admins PRO WHERE PRO.password = '${old_password}' AND PRO.id = ${id};`;
        var sqlQuery = database.query(checkPassword, async function (err, result) {
            if (result && result.length > 0) {
                return resolve({ status: true, data: [], message: 'Record founded.' });
            }
            return resolve({ status: false, data: [], message: 'Your current password did not matched. Please, try again.' });
        })
    });
}

// module.exports.sendOtp = async (email, otp) => {
//     return new Promise(async resolve => {
//         let transporter = nodemailer.createTransport({
//             host: "smtp.gmail.com",//or "gmail"
//             port: 465,//optional
//             secure: true,//optional
//             auth: {
//                 user: "test.user25112020@gmail.com",
//                 pass: "trndjyzhvklmjfef"
//             }
//         });
//         var mailOptions = {
//             from:"test.user25112020@gmail.com",
//             to: email,
//             subject: "Otp for Forgot Password",
//             html:"<h3>Hello, your OTP for Password Reset is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" 
//         };

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.log("error"+error)
//                 return resolve({ status: false, data: [], message: 'Could not send OTP!' });
//             }

//             console.log("info "+info)
//             console.log('Message sent: %s', info.messageId);
//             console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
//             return resolve({ status: true, data: [], message: 'OTP sent!.' });
//         });
            

//     });
// }