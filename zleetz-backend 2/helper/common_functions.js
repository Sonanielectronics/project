var express = require("express");
var CryptoJS = require("crypto-js");
var path = require("path");
const secretKey = 'abcdefghijklmnopqrstuvwxyzyxwvutsrqponmlkjihgfedcba';
const nodemailer = require("nodemailer");
const AWS = require('aws-sdk');
const randomstring = require("randomstring");

const hbs = require('nodemailer-express-handlebars')

module.exports.encode = async (text) => {
    return new Promise(async resolve => {
        const data = CryptoJS.AES.encrypt(JSON.stringify(text), secretKey).toString();
        return resolve(data);
    })
}

module.exports.decode = async (text) => {
    return new Promise(async resolve => {
        try {
            var bytes = CryptoJS.AES.decrypt(text, secretKey);
            var originalText = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            return resolve(originalText);
        } catch (Err) {
            console.log(Err);
            return resolve({ status: false, message: 'Something is wrong.while send request.' });
        }
    })
}

module.exports.fileValidationFunction = (name) => {
    let targetFile = name;
    let extName = path.extname(targetFile.name);
    var allowedExtension = ['.png', '.jpg', '.jpeg'];
    if (!allowedExtension.includes(extName)) {
        return ({ status: false, message: 'Invalid file type', data: [] });
    }
    if (targetFile.size > 20 * 1024 * 1024) {
        return ({ status: false, message: 'File is too Large', data: [] });
    }
    return ({ status: true });
}

module.exports.sendOTPEmail = async (email, subject, html) => {
    return new Promise(async resolve => {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",//or "gmail"
            port: 465,//optional
            secure: true,//optional
            auth: {
                user: "test.user25112020@gmail.com",
                pass: "zmdjwxnvoamqwbgi"
            }
        });
        var mailOptions = {
            from: "test.user25112020@gmail.com",
            to: email,
            subject: subject,
            html: html
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("error" + error)
                return resolve({ status: false, data: [], message: 'Could not send OTP!' });
            }

            console.log("info " + info)
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            return resolve({ status: true, data: [], message: 'OTP sent!.' });
        });


    });
}

module.exports.uploadMaterialToAWS = (fileData, path) => {
    return new Promise(resolve => {
        const acceptFiles = ['image/svg', 'image/svg+xml', 'image/png', 'image/x-citrix-png', 'image/x-png', 'image/jpeg', 'image/x-citrix-jpeg', 'image/bmp'];
        const allowedExtension = ['png', 'jpg', 'jpeg', 'svg'];

        const fileExt = fileData.name.split('.')[fileData.name.split('.').length - 1].toLowerCase()
        // var fileName = fileData.name
        const contentType = fileData.mimetype
        const ContentEncoding = fileData.encoding
        const fileSize = fileData.size
        const fileNameAWS = randomstring.generate({ length: 20, charset: 'numeric' }) + '.' + fileData.name.split(" ").join("-");
        const sizeLimit = 2 * 1024 * 1024;
        if (fileSize > sizeLimit) return resolve({ status: false, message: "File must be smaller than 2MB." });
        if (!acceptFiles.includes(contentType) || !allowedExtension.includes(fileExt)) return resolve({ status: false, message: "Only accept image as upload picture." });

        AWS.config.update({
            accessKeyId: process.env.AWS_S3_ACCESSKEYID,
            secretAccessKey: process.env.AWS_S3_SECRETKEY,
            region: process.env.AWS_S3_REGION
        });

        const awsKey = 'content/' + path + fileNameAWS

        const s3 = new AWS.S3();
        const fileContent = Buffer.from(fileData.data, 'binary');

        // Setting up S3 upload parameters
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: awsKey, // File name you want to save as in S3
            Body: fileContent,
            ContentEncoding: ContentEncoding,
            ContentType: contentType
        };

        s3.upload(params, function (err, data) {
            if (err) return resolve({ status: false, message: "Errow while uploading image on s3." });
            console.log(data.Location);
            return resolve({ status: true, data: data.Location });
        });

    });
}

module.exports.uploadExcelToAWS = (fileData, path) => {
    return new Promise(resolve => {
        const acceptFiles = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.spreadsheetml.template'];
        const allowedExtension = ['xlsx', 'xlsm', 'xlsb', 'xltx', 'xltm', 'xls'];

        const fileExt = fileData.name.split('.')[fileData.name.split('.').length - 1].toLowerCase()
        // var fileName = fileData.name
        const contentType = fileData.mimetype
        const ContentEncoding = fileData.encoding
        const fileSize = fileData.size
        const fileNameAWS = randomstring.generate({ length: 20, charset: 'numeric' }) + '.' + fileData.name.split(" ").join("-");
        const sizeLimit = 5 * 1024 * 1024;
        if (fileSize > sizeLimit) return resolve({ status: false, message: "File must be smaller than 5MB." });
        if (!acceptFiles.includes(contentType) || !allowedExtension.includes(fileExt)) return resolve({ status: false, message: "Only accept excel as upload file." });

        AWS.config.update({
            accessKeyId: process.env.AWS_S3_ACCESSKEYID,
            secretAccessKey: process.env.AWS_S3_SECRETKEY,
            region: process.env.AWS_S3_REGION
        });

        const awsKey = 'excelFiles/' + path + fileNameAWS

        const s3 = new AWS.S3();
        const fileContent = Buffer.from(fileData.data, 'binary');

        // Setting up S3 upload parameters
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: awsKey, // File name you want to save as in S3
            Body: fileContent,
            ContentEncoding: ContentEncoding,
            ContentType: contentType
        };

        s3.upload(params, function (err, data) {
            if (err) return resolve({ status: false, message: "Errow while uploading image on s3." });
            console.log(data.Location);
            return resolve({ status: true, data: data.Location });
        });

    });
}

module.exports.sendEmailToUser = async (mailData) => {
    return new Promise(async resolve => {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",//or "gmail"
            port: 465,//optional
            secure: true,//optional
            auth: {
                user: "test.user25112020@gmail.com",
                pass: "zmdjwxnvoamqwbgi"
            }
        });

        const handlebarOptions = {
            viewEngine: {
                partialsDir: path.resolve('./views/'),
                defaultLayout: false,
            },
            viewPath: path.resolve('./views/'),
        };

        // use a template file with nodemailer
        transporter.use('compile', hbs(handlebarOptions))

        var mailOptions = {
            from: "contact@zleetz.com",
            to: mailData.email,
            subject: mailData.subject,
            template: mailData.template,
            context: mailData.context
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return resolve({ status: false, data: [], message: 'Could not send OTP!' });
            return resolve({ status: true, data: [], message: 'OTP sent!.' });
        });

    });
}

module.exports.sendEmailToAdmin = async (mailData) => {
    return new Promise(async resolve => {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",//or "gmail"
            port: 465,//optional
            secure: true,//optional
            auth: {
                user: "test.user25112020@gmail.com",
                pass: "zmdjwxnvoamqwbgi"
            }
        });

        const handlebarOptions = {
            viewEngine: {
                partialsDir: path.resolve('./views/'),
                defaultLayout: false,
            },
            viewPath: path.resolve('./views/'),
        };

        // use a template file with nodemailer
        transporter.use('compile', hbs(handlebarOptions))

        var mailOptions = {
            from: "contact@zleetz.com",
            to: 'vipul.technomads@gmail.com',
            subject: mailData.subject,
            template: mailData.template,
            context: mailData.context
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return resolve({ status: false, data: [], message: 'Could not send OTP!' });
            return resolve({ status: true, data: [], message: 'OTP sent!.' });
        });

    });
}
