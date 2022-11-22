const isset = require('isset')
const moment = require('moment');
var randomstring = require("randomstring");

// All Controller
const { encode, uploadMaterialToAWS } = require('../../helper/common_functions');
const categoriesModel = require('../../model/categories_model');
const settingsModel = require('../../model/settings_model');
const readXlsxFile = require("read-excel-file/node");
const excelJS = require("exceljs");

module.exports.downloadCategoriesData = async (request, response) => {
    try {

        const getCategory = await categoriesModel.getAllCategoryList()
        if (!getCategory.status) return response.json({ status: false, message: getCategory.message, data: [] });
        const getCategoryData = getCategory.data;

        for (var i = 0; i < getCategoryData.length; i++) {
            var categoryID = getCategoryData[i].id;
            const catefoyAccount = await categoriesModel.getAllAccountTypeListByCatID(categoryID)
            getCategoryData[i].account_types = (catefoyAccount.status) ? catefoyAccount.data : {}
        }

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Categories List");

        worksheet.columns = [
            // { header: "S no.", key: "id" },
            { header: "Title", key: "title" },
            { header: "Description", key: "description" },
            { header: "Icon", key: "icon" },
            { header: "Color-Code", key: "color_code" },
            { header: "Account Types", key: "account_types" },
        ];
        getCategoryData.forEach((data) => { worksheet.addRow(data) });

        worksheet.getRow(1).eachCell((cell) => { cell.font = { bold: true } });
        response.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        response.setHeader("Content-Disposition", `attachment; filename=categories.xlsx`);

        return workbook.xlsx.write(response).then(() => { response.status(200) });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.uploadXlsxFile = async (request, response) => {
    try {
        if (request.files == undefined) return response.json({ status: false, message: "Please upload an excel file!", data: [] });
        if (isset(request.files) && (request.files.file)) {
            var categoryFile = request.files.file;
            var fileName = categoryFile.name;
            var splitFileName = fileName.split(" ").join("-");
            var newFileName = splitFileName;
            const uploadPath = ROOT_TEMPLATE_PATH + 'trashFiles/' + newFileName;
            await categoryFile.mv(uploadPath, (request, response), (err) => {
                if (err) return response.json({ status: false, message: "Something is wrong while add category image.", data: [] });
            });

            // var isValidFile = true;
            // const readFile = await readXlsxFile(uploadPath).then(async (categoryData) => {
            //     categoryData.shift();
            //     await categoryData.map(async (data) => {
            //         let insertAccCatIDs = []
            //         const getCategory = await categoriesModel.getCategoryByTitle(data[1])
            //         if (getCategory.data) {
            //            return false;
            //         }
            //     });
            // })
            // // return response.json({ status: false, message: data[1] + " title already exist. Please make sure listed all title will unique.", data: isValidFile });
            // return response.json({ status: false, message: " title already exist. Please make sure listed all title will unique.", data: isValidFile });
            var isValidData = { status: true }
            await readXlsxFile(uploadPath).then(async (categoryData) => {
                categoryData.shift();
                for (var i = 0; i < categoryData.length; i++) {
                    let insertAccCatIDs = []
                    const getCategory = await categoriesModel.getCategoryByTitle(categoryData[i][0])
                    if (!getCategory.status) {
                        isValidData = { 'status': false, 'message': getCategory.message, 'data': [] }
                        break;
                    }
                    if (getCategory.isExist) {
                        isValidData = { status: false, message: "Some category name already exists. Please try with different name.", data: [] }
                        break;
                    }

                    if (!getCategory.isExist && categoryData[i][4]) {
                        const listOfType = categoryData[i][4].split(';');
                        if (listOfType.length >= 0) {
                            for (var j = 0; j < listOfType.length; j++) {
                                const isExistCategory = await settingsModel.getAccountTypeByName(listOfType[j]);
                                if (!isExistCategory.isExist) {
                                    isValidData = { status: false, message: "Some account type is not exists. Please try with different name.", data: [] }
                                    break;
                                }
                                if (isExistCategory.isExist) insertAccCatIDs.push(isExistCategory.data.id)
                            }
                            if (!isValidData.status) {
                                isValidData = isValidData
                                break;
                            }
                        }
                        // var insertCatData = { 'title': categoryData[i][0], 'description': categoryData[i][1], 'icon': categoryData[i][2], 'color_code': categoryData[i][3], 'status': 1 }

                        // const addData = await categoriesModel.insertCategoryData(insertCatData);
                        // if (!addData.status) {
                        //     isValidData = { status: false, message: addData.message, data: [] }
                        //     break;
                        // }
                        // if (addData.status) {
                        //     var catID = addData.data.insertId;
                        //     let insertAccCatData = []
                        //     await insertAccCatIDs.map((account_type_id) => {
                        //         insertAccCatData.push([account_type_id, catID])
                        //     });
                        //     const addAccountCategory = await categoriesModel.insertCatagoryAccountData(insertAccCatData);
                        // }
                    }
                }



                // await categoryData.map(async (data) => {
                //     let insertAccCatIDs = []
                //     const getCategory = await categoriesModel.getCategoryByTitle(data[1])
                //     if (!getCategory.isExist && data[5]) {
                //         const listOfType = data[5].split(';');
                //         if (listOfType.length >= 0) {
                //             for (var i = 0; i < listOfType.length; i++) {
                //                 const isExistCategory = await settingsModel.getAccountTypeByName(listOfType[i]);
                //                 if (isExistCategory.isExist) insertAccCatIDs.push(isExistCategory.data.id)
                //             }
                //         }
                //         var insertCatData = { 'title': data[1], 'description': data[2], 'icon': data[3], 'color_code': data[4], 'status': 1 }

                //         const addData = await categoriesModel.insertCategoryData(insertCatData);
                //         if (addData.status) {
                //             var catID = addData.data.insertId;
                //             let insertAccCatData = []
                //             await insertAccCatIDs.map((account_type_id) => {
                //                 insertAccCatData.push([account_type_id, catID])
                //             });
                //             const addAccountCategory = await categoriesModel.insertCatagoryAccountData(insertAccCatData);
                //         }
                //     }
                // });
            })
            if (!isValidData.status) return response.json(isValidData);


            await readXlsxFile(uploadPath).then(async (categoryData) => {
                categoryData.shift();
                for (var i = 0; i < categoryData.length; i++) {
                    let insertAccCatIDs = []
                    const getCategory = await categoriesModel.getCategoryByTitle(categoryData[i][0])

                    if (!getCategory.isExist && categoryData[i][4]) {
                        const listOfType = categoryData[i][4].split(';');
                        if (listOfType.length >= 0) {
                            for (var j = 0; j < listOfType.length; j++) {
                                const isExistCategory = await settingsModel.getAccountTypeByName(listOfType[j]);
                                if (isExistCategory.isExist) insertAccCatIDs.push(isExistCategory.data.id)
                            }
                        }
                        var insertCatData = { 'title': categoryData[i][0], 'description': categoryData[i][1], 'icon': categoryData[i][2], 'color_code': categoryData[i][3], 'status': 1 }

                        const addData = await categoriesModel.insertCategoryData(insertCatData);
                        if (!addData.status) {
                            isValidData = { status: false, message: addData.message, data: [] }
                            break;
                        }
                        if (addData.status) {
                            var catID = addData.data.insertId;
                            let insertAccCatData = []
                            await insertAccCatIDs.map((account_type_id) => {
                                insertAccCatData.push([account_type_id, catID])
                            });
                            const addAccountCategory = await categoriesModel.insertCatagoryAccountData(insertAccCatData);
                        }
                    }
                }

            })
            if (!isValidData.status) return response.json(isValidData);


            return response.json({ status: true, message: "Category added successfully.", data: [] });
        }
        return response.json({ status: false, message: "Please upload an excel file!", data: [] });


    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.downloadCategoriesFile = async (request, response) => {
    try {
        const uploadPath = ROOT_TEMPLATE_PATH + '/sample-files/categories-sample-file.xlsx';
        return response.download(uploadPath);
    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.addCategory = async (request, response) => {
    try {

        const request_body = request.body;
        const { title, description, account_types, color_code } = request_body.data;
        var newFileName = "";
        const accountTypes = JSON.parse(account_types);
        if (accountTypes.length <= 0)
            return response.json({ status: false, message: "Please select valid account type.", data: [] });
        const getExistCategory = await categoriesModel.getCategoryByTitle(title)

        if (!getExistCategory.status) return response.json({ status: false, message: getExistCategory.message, data: [] });
        if (getExistCategory.isExist) return response.json({ status: false, message: "Category title already exists. Please try with different title.", data: [] });

        if (isset(request.files) && (request.files.file)) {
            var categoryImage = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(categoryImage, 'categoryImg/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        }

        var insertCatData = {
            'title': title,
            'description': (description) ? description : "",
            'icon': newFileName,
            'color_code': color_code,
            'created_by': request_body.id,
            'status': 1,
        }

        const addData = await categoriesModel.insertCategoryData(insertCatData);
        if (!addData.status) return response.json({ status: false, message: addData.message, data: [] });

        const catID = addData.data.insertId;
        const insertAccCatData = []
        await accountTypes.map((account_type_id) => {
            insertAccCatData.push([account_type_id, catID])
        });

        const addAccountCategory = await categoriesModel.insertCatagoryAccountData(insertAccCatData);
        if (!addAccountCategory.status) return response.json({ status: false, message: addAccountCategory.message, data: [] });

        return response.json({ status: true, message: "Category added successfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.editCategory = async (request, response) => {
    try {

        const request_body = request.body;
        const { id, title, description, account_types, color_code } = request_body.data;
        const accountTypes = JSON.parse(account_types);
        if (accountTypes.length <= 0)
            return response.json({ status: false, message: "Please select valid account type.", data: [] });
        const getCategoryData = await categoriesModel.getCategoryById(id)
        if (!getCategoryData.status) return response.json({ status: false, message: getCategoryData.message, data: [] });

        if (getCategoryData.data.title != title) {
            const getExistCategory = await categoriesModel.getCategoryByTitle(title, id)
            console.log(id);
            console.log(getExistCategory);
            if (!getExistCategory.status) return response.json({ status: false, message: getExistCategory.message, data: [] });
            if (getExistCategory.isExist) return response.json({ status: false, message: "Category title already exists. Please try with different title.", data: [] });
        }

        var newFileName = "";
        if (isset(request.files) && (request.files.file)) {
            var categoryImage = request.files.file;
            const movetoAWS = await uploadMaterialToAWS(categoryImage, 'categoryImg/');
            if (!movetoAWS.status) return response.json({ status: false, message: movetoAWS.message, data: [] });
            if (movetoAWS.data) newFileName = movetoAWS.data
        }

        var updateCatData = {
            'id': id,
            'color_code': color_code,
            'title': title,
            'description': (description) ? description : getCategoryData.data.description,
            'icon': (newFileName) ? newFileName : getCategoryData.data.icon,
            'updated_at': moment(new Date()).format('YYYY-MM-DD hh:mm:00'),
            'status': 1,
        }

        const updateData = await categoriesModel.updateCategoryData(updateCatData);
        if (!updateData.status) return response.json({ status: false, message: updateData.message, data: [] });

        const insertAccCatData = []
        await accountTypes.map((account_type_id) => {
            insertAccCatData.push([account_type_id, id])
        });

        const updateCatagoryAccount = await categoriesModel.updateCatagoryAccountData(id);
        if (!updateCatagoryAccount.status) return response.json({ status: false, message: updateCatagoryAccount.message, data: [] });
        const addAccountCategory = await categoriesModel.insertCatagoryAccountData(insertAccCatData);
        if (!addAccountCategory.status) return response.json({ status: false, message: addAccountCategory.message, data: [] });

        return response.json({ status: true, message: "category updated succsessfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.deleteCategory = async (request, response) => {
    try {
        const { id } = request.params;

        const isCategoryExist = await categoriesModel.isCategoryExistWithTopic(id)
        if (!isCategoryExist.status) return response.json({ status: false, message: isCategoryExist.message, data: [] });
        if (!isCategoryExist.isRecord) return response.json({ status: false, message: 'This category link with Topic, You can not delete this from list.', data: [] });

        const getCategoryData = await categoriesModel.getCategoryById(id)
        if (!getCategoryData.status) return response.json({ status: false, message: getCategoryData.message, data: [] });
        var updateCatData = { 'id': id, 'updated_at': moment(new Date()).format('YYYY-MM-DD hh:mm:00'), 'status': 0, }

        var updateData = await categoriesModel.updateCategoryData(updateCatData);
        if (!updateData.status) return response.json({ status: false, message: updateData.message, data: [] });

        return response.json({ status: true, message: "category delete succsessfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getCategory = async (request, response) => {
    try {

        const { id } = request.params;
        const getCategoryData = await categoriesModel.getCategoryById(id)
        if (!getCategoryData.status) return response.json({ status: false, message: getCategoryData.message, data: [] });

        const ciphertext = await encode(getCategoryData);
        return response.json({ status: true, message: "Category get succsessfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getAllCategory = async (request, response) => {
    try {

        const getCategory = await categoriesModel.getAllCategoryList()
        if (!getCategory.status) return response.json({ status: false, message: getCategory.message, data: [] });
        const getCategoryData = getCategory.data;

        for (var i = 0; i < getCategoryData.length; i++) {
            var categoryID = getCategoryData[i].id;
            const catefoyAccount = await categoriesModel.getAllCategoryAccountByCatID(categoryID)
            getCategoryData[i].account_types = (catefoyAccount.status) ? catefoyAccount.data : {}
        }

        const ciphertext = await encode(getCategoryData);
        return response.json({ status: true, message: "Category list loaded succsessfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getAllCategoryList = async (request, response) => {
    try {

        const request_body = request.body;
        const { page_no, search } = request_body.data;

        var pageNo = page_no ? page_no : 1;
        var searchData = search ? search : null;
        var limit = 10;
        var offset = ((pageNo - 1) * limit) > 0 ? (pageNo - 1) * limit : 0;
        var getAllData = { 'limit': limit, 'offset': offset, 'search': searchData }

        const getCategory = await categoriesModel.getAllCategoryList(getAllData)
        const getCategoryCount = await categoriesModel.getAllCategoryListCount(getAllData)
        if (!getCategoryCount.status) return response.json({ status: false, message: getCategoryCount.message, data: [] });
        if (!getCategory.status) return response.json({ status: false, message: getCategory.message, data: [] });
        const getCategoryData = getCategory.data;

        for (var i = 0; i < getCategoryData.length; i++) {
            var categoryID = getCategoryData[i].id;
            const catefoyAccount = await categoriesModel.getAllCategoryAccountByCatID(categoryID)
            getCategoryData[i].account_types = (catefoyAccount.status) ? catefoyAccount.data : {}
        }

        const ciphertext = await encode(getCategoryData);
        return response.json({ status: true, message: "Category list loaded succsessfully.", count: getCategoryCount.data, data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getAllCategoryByAccount = async (request, response) => {
    try {
        const { id } = request.params;

        const getCategoryData = await categoriesModel.getAllCategoryByAccountList(id)
        if (!getCategoryData.status) return response.json({ status: false, message: getCategoryData.message, data: [] });

        const ciphertext = await encode(getCategoryData.data);
        return response.json({ status: true, message: "Category list loaded succsessfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.addUserCategories = async (request, response) => {
    try {
        const request_body = request.body;
        const { categories } = request_body.data;
        const { id } = request_body;

        const categoryList = JSON.parse(categories);

        if (categoryList.length <= 0) return response.json({ status: false, message: "Please select valid categories type.", data: [] });

        const userID = request_body.id
        const insertUserCatData = []

        await categoryList.map((category_id) => {
            insertUserCatData.push([category_id, userID])
        });

        const updateCatagory = await categoriesModel.updateCatagoryUserData(id);
        if (!updateCatagory.status) return response.json({ status: false, message: updateCatagory.message, data: [] });
        const addCategory = await categoriesModel.insertCatagoryUserData(insertUserCatData);
        if (!addCategory.status) return response.json({ status: false, message: addCategory.message, data: [] });

        return response.json({ status: true, message: "User category added succsessfully.", data: [] });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}

module.exports.getUserCategories = async (request, response) => {
    try {
        const request_body = request.body;
        const userID = request_body.id

        const getCatagory = await categoriesModel.getUserCatagoryData(userID);
        if (!getCatagory.status) return response.json({ status: false, message: getCatagory.message, data: [] });
        const getCategoryData = getCatagory.data;

        for (var i = 0; i < getCategoryData.length; i++) {
            var categoryID = getCategoryData[i].id;
            const catefoyAccount = await categoriesModel.getAllCategoryAccountByCatID(categoryID)
            getCategoryData[i].account_types = (catefoyAccount.status) ? catefoyAccount.data : {}
        }

        const ciphertext = await encode(getCategoryData);

        return response.json({ status: true, message: "Category loadded succsessfully.", data: ciphertext });

    } catch (Err) {
        console.log(Err);
        return response.json({ status: false, message: "Something is wrong.Please try again.", data: [], error: Err });
    }
}
