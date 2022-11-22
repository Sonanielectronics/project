// const { request, response } = require("express");
const express = require("express");
const router = express.Router();
const { validate } = require('../helper/admin_validation');
const { isAdminAuthenticate } = require('../helper/jwt');

const authController = require('../controllers/admin/auth');
//Admin Auth
router.post('/login', validate, authController.userLogin);
router.post('/signup', validate, authController.signup);
router.post('/forgot-password', validate, authController.forgotPassword);
router.post('/reset-password', validate, authController.resetPassword);
router.post('/update-password', validate, isAdminAuthenticate, authController.updatePassword);

const categoriesController = require('../controllers/admin/categories');
router.post('/categories/add', validate, isAdminAuthenticate, categoriesController.addCategory);
router.put('/categories/edit', validate, isAdminAuthenticate, categoriesController.editCategory);
router.delete('/categories/delete/:id', isAdminAuthenticate, categoriesController.deleteCategory);
router.get('/categories/get/:id', isAdminAuthenticate, categoriesController.getCategory);
router.get('/categories/get-all', isAdminAuthenticate, categoriesController.getAllCategory);
router.post('/categories/get-list', validate, isAdminAuthenticate, categoriesController.getAllCategoryList);
router.post('/categories/upload-bulk-data', isAdminAuthenticate, categoriesController.uploadXlsxFile);
router.get('/categories/download-sample-file', categoriesController.downloadCategoriesFile);
router.get('/categories/download-data', categoriesController.downloadCategoriesData);

const settingsController = require('../controllers/admin/settings');

router.get('/dashboard', isAdminAuthenticate, settingsController.getDashboardData);
//countries
router.post('/countries/add', validate, isAdminAuthenticate, settingsController.addCountry);
router.put('/countries/edit', validate, isAdminAuthenticate, settingsController.editCountry);
router.get('/countries/get', isAdminAuthenticate, settingsController.getCountry);
router.post('/countries/get-list', validate, isAdminAuthenticate, settingsController.getCountryList);
router.post('/get-contact-us', validate, isAdminAuthenticate, settingsController.getAllContactUsList);
router.get('/read-contact-us/:id', isAdminAuthenticate, settingsController.readContactUs);
//regions
router.post('/regions/add', validate, isAdminAuthenticate, settingsController.addRegions);
router.put('/regions/edit', validate, isAdminAuthenticate, settingsController.editRegions);
router.get('/regions/get/:country_id', isAdminAuthenticate, settingsController.getRegions);

//countries
router.post('/difficulty_levels/add', validate, isAdminAuthenticate, settingsController.addDifficultyLevel);
router.put('/difficulty_levels/edit', validate, isAdminAuthenticate, settingsController.editDifficultyLevel);
router.get('/difficulty_levels/get', isAdminAuthenticate, settingsController.getDifficultyLevel);

//Avatar
router.post('/avatars/add', validate, isAdminAuthenticate, settingsController.addAvatars);
router.delete('/avatars/delete/:id', isAdminAuthenticate, settingsController.deleteAvatars);
router.get('/avatars/get', isAdminAuthenticate, settingsController.getAvatars);

//Account Types
router.post('/account-types/add', validate, isAdminAuthenticate, settingsController.addAccountType);
router.put('/account-types/edit', validate, isAdminAuthenticate, settingsController.editAccountType);
router.get('/account-types/get', isAdminAuthenticate, settingsController.getAllAccountType);
router.post('/account-types/get-list', validate, isAdminAuthenticate, settingsController.getAllAccountTypeList);
router.post('/account-types/upload-bulk-data', isAdminAuthenticate, settingsController.uploadXlsxFile);
router.get('/account-types/download-sample-file', settingsController.downloadAccountTypesFile);
router.get('/account-types/download-data', settingsController.downloadAccountTypesData);

//Topics
const topicsController = require('../controllers/admin/topics');
router.post('/topics/add', validate, isAdminAuthenticate, topicsController.addTopics);
router.put('/topics/edit', validate, isAdminAuthenticate, topicsController.editTopics);
router.post('/topics/get', validate, isAdminAuthenticate, topicsController.getAllTopics);
router.get('/topics/view/:id', isAdminAuthenticate, topicsController.viewTopicsDetail);
router.delete('/topics/delete/:id', isAdminAuthenticate, topicsController.deleteTopicsDetail);
router.post('/topics/upload-bulk-data', isAdminAuthenticate, topicsController.uploadXlsxFile);
router.get('/topics/download-sample-file', topicsController.downloadTopicsSampleFile);
router.get('/topics/download-data', topicsController.downloadTopicsData);

//Questions
const questionnairesController = require('../controllers/admin/questionnaires');
router.post('/questionnaires/add', validate, isAdminAuthenticate, questionnairesController.addQuestions);
router.put('/questionnaires/edit', validate, isAdminAuthenticate, questionnairesController.editQuestions);
router.post('/questionnaires/get', validate, isAdminAuthenticate, questionnairesController.getAllQuestions);
router.delete('/questionnaires/delete/:id', isAdminAuthenticate, questionnairesController.deleteQuestions);
router.get('/questionnaires/view/:id', isAdminAuthenticate, questionnairesController.viewQuestions);
router.post('/questionnaires/upload-bulk-data', isAdminAuthenticate, questionnairesController.uploadXlsxFile);
router.get('/questionnaires/download-sample-file', questionnairesController.downloadQuestionnairesFile);
router.get('/questionnaires/download-data', questionnairesController.downloadQuestionnairesData);
router.post('/questionnaires/get-report-questions', validate, isAdminAuthenticate, questionnairesController.getReportQuestions);

//Player
const quizzesController = require('../controllers/quizzes');
router.get('/match-fees-rewards/:id', isAdminAuthenticate, quizzesController.getTrainingMatchRewards);
router.post('/match-fees-rewards/add', validate, isAdminAuthenticate, quizzesController.addTrainingMatchRewards);
router.put('/match-fees-rewards/edit', validate, isAdminAuthenticate, quizzesController.editTrainingMatchRewards);
router.delete('/match-fees-rewards/:id', isAdminAuthenticate, quizzesController.deleteTrainingMatchRewards);

//Player
router.get('/default-match-fees-rewards', isAdminAuthenticate, quizzesController.getDefaultMatchRewards);
router.post('/default-match-fees-rewards/add', validate, isAdminAuthenticate, quizzesController.addDefaultMatchRewards);
router.put('/default-match-fees-rewards/edit', validate, isAdminAuthenticate, quizzesController.editDefaultMatchRewards);
router.delete('/default-match-fees-rewards/:id', isAdminAuthenticate, quizzesController.deleteDefaultMatchRewards);

const playersController = require('../controllers/admin/players');
router.post('/players/get', validate, isAdminAuthenticate, playersController.getAllPlayerList);
router.delete('/players/delete/:id', isAdminAuthenticate, playersController.deletePlayer);
router.post('/players/verify', validate, isAdminAuthenticate, playersController.verifyPlayer);
router.post('/players/block', validate, isAdminAuthenticate, playersController.blockPlayer);
router.get('/players/download-data', playersController.downloadPlayerData);

const botsController = require('../controllers/auth');
router.post('/bots/add', validate, isAdminAuthenticate, botsController.addBotsData);
// router.put('/bots/edit', validate, isAdminAuthenticate, settingsController.editBotsData);
// router.get('/bots/get-list', isAdminAuthenticate, settingsController.getBotsList);
// const cronController = require('../controllers/admin/cron');
// router.get('/cron', cronController.expiredQuiz);

module.exports = router;