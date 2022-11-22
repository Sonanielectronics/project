
var config = require('../config/config');
const jwt = require("jsonwebtoken");
const isset = require('isset');
const adminModel = require('../model/admins_model')
module.exports.verifyJWTToken = (token) => {
    return new Promise(resolve => {
        jwt.verify(token, config.jwtsecretkey, async (err, result) => {
            if (err) {
                return resolve({ status: false, message: 'Accesstoken has Expired!' });
            } else {
                if (result) {
                    return resolve({ status: true, data: result.id });
                } else {
                    return resolve({ status: false, message: 'Invalid token or expired!' });
                }
            }
        })
    });
}
module.exports.isAuthenticate = (req, res, next) => {

    let token = req.headers.authorization;
    jwt.verify(token, config.jwtsecretkey, async (err, result) => {
        if (err) {
            return res.status(200).json({ status: false, message: "Something is wrong in Authentication.Please try again.", isAuth: false, data: [] });
        } else {
            if (result) {
                if (isset(result.id)) {

                    req.body.id = result.id;
                    return next();
                } else {
                    return res.status(200).json({ status: false, message: "Profile is missing in token!", isAuth: false, data: [] });
                }
            } else {
                return res.status(200).json({ status: false, message: "Invalid token or expired!", isAuth: false, data: [] });
            }
        }
    });
}
module.exports.isAdminAuthenticate = (req, res, next) => {

    let token = req.headers.authorization;
    jwt.verify(token, config.jwtsecretkey, async (err, result) => {
        if (err) {
            return res.status(498).json({ status: false, message: "Something is wrong in Authentication.Please try again.", isAuth: false, data: [] });
        } else {
            if (result) {
                if (isset(result.id)) {
                    const getAdminData = await adminModel.getProfileByEmail(result.email);
                    if (!getAdminData.status) {
                        return res.status(498).json({ status: false, message: "Invalid token or expired!", isAuth: false, data: [] });
                    }
                    req.body.id = result.id;
                    return next();
                } else {
                    return res.status(498).json({ status: false, message: "Profile is missing in token!", isAuth: false, data: [] });
                }
            } else {
                return res.status(498).json({ status: false, message: "Invalid token or expired!", isAuth: false, data: [] });
            }
        }
    });
}