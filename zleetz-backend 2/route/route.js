// const { request, response } = require("express");
const express = require("express");
const router = express.Router();
const { validate } = require('../helper/server_validation');
const { isAuthenticate } = require('../helper/jwt');

//Auth Controller
//User Auth
const authController = require('../controllers/auth');
router.post('/signup', validate, authController.signup);
router.post('/login', validate, authController.userLogin);
router.post('/forgot-password', validate, authController.forgotPassword);
router.post('/verify-otp', validate, authController.verifyOtp);
router.post('/reset-password', validate, authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);

//Profile Controller
const profileController = require('../controllers/profiles');
router.post('/encode_data', profileController.encodeData);
router.post('/decode_data', profileController.decodeData);
router.put('/update-password', validate, isAuthenticate, profileController.updatePassword);
router.put('/update-profile', validate, isAuthenticate, profileController.updateProfileData);
router.get('/user/get', isAuthenticate, profileController.getProfileData);

const settingsController = require('../controllers/admin/settings');
router.get('/countries/get', isAuthenticate, settingsController.getCountry);
router.get('/avatars/get', settingsController.getAvatars);
router.get('/account-types/get', isAuthenticate, settingsController.getAllAccountType);
router.post('/contact-us', validate, settingsController.contactUs);
// router.post('/account-types/set', validate, isAuthenticate, settingsController.setAccountType);

//Topics
const topicsController = require('../controllers/admin/topics');
router.post('/topics/get', validate, isAuthenticate, topicsController.getAllTopics);
router.get('/topics/view/:id', isAuthenticate, topicsController.viewTopicsDetail);
router.get('/topics/get-by-categories/:id', isAuthenticate, topicsController.getAllTopicsByCategories);
router.get('/topics/list', isAuthenticate, topicsController.getTopicsList);
//Category
const categoriesController = require('../controllers/admin/categories');
router.get('/categories/get-all', isAuthenticate, categoriesController.getAllCategory);
router.get('/categories/get-by-account/:id', isAuthenticate, profileController.getAllCategoryByAccount);
router.post('/categories/set-user-category', validate, isAuthenticate, categoriesController.addUserCategories);
router.get('/categories/get-user-category', isAuthenticate, categoriesController.getUserCategories);

//Players
const opponentsController = require('../controllers/opponents');
router.post('/opponents/get-random', validate, isAuthenticate, opponentsController.getRandomOpponentsList);
router.post('/opponents/find-random-bot', validate, isAuthenticate, opponentsController.findBotOpponent);
router.post('/opponents/get-friends', validate, isAuthenticate, opponentsController.getFriendsOpponentsList);
router.post('/opponents/get-ranking', validate, isAuthenticate, opponentsController.getUserRanking);
router.post('/opponents/find-random', validate, isAuthenticate, opponentsController.findRandomOpponent);

router.post('/quiz/play-randomly', validate, isAuthenticate, opponentsController.playWithRandomPlayer);
router.post('/quiz/send-request', validate, isAuthenticate, opponentsController.sendOpponentRequest);
router.post('/quiz/send-request2', validate, isAuthenticate, opponentsController.sendOpponentRequestV2);
router.post('/quiz/accept-request', validate, isAuthenticate, opponentsController.acceptOpponentRequest);
router.post('/quiz/decline-request', validate, isAuthenticate, opponentsController.declineOpponentRequest);
router.post('/quiz/withdraw-request', validate, isAuthenticate, opponentsController.withdrawOpponentRequest);
router.post('/quiz/play-requested-quiz', validate, isAuthenticate, opponentsController.playRequestedQuiz);

//Notification
const notificationsController = require('../controllers/notifications');
router.post('/notifications/get-all', validate, isAuthenticate, notificationsController.getListOfNotifications);
router.get('/test-cookie', notificationsController.testCookie);
// router.post('/opponents/send-request', validate, isAuthenticate, opponentsController.sendOpponentRequest);


const quizzesController = require('../controllers/quizzes');
router.get('/match-token/training', isAuthenticate, quizzesController.getUserTrainingMatchToken);
router.get('/match-fees-rewards/:id', isAuthenticate, quizzesController.getTrainingMatchRewards);
router.post('/quiz/get-quiz-questions', validate, isAuthenticate, quizzesController.getQuizQuestions);
// router.post('/quiz/get-quiz-questionids', validate, isAuthenticate, quizzesController.getQuizQuestionsIDs);
// router.post('/quiz/get-quiz-questions/:id', validate, isAuthenticate, quizzesController.getQuizQuestions);
// router.post('/quiz/get-quiz-result/:id', validate, isAuthenticate, quizzesController.getQuizQuestions);
router.post('/quiz/submit-quiz-answers', validate, isAuthenticate, quizzesController.submitQuizAnswers);
router.post('/quiz/submit-time-out-answers', validate, isAuthenticate, quizzesController.timeOutQuizAnswers);
router.post('/quiz/is-accepted-by-opponent', validate, isAuthenticate, quizzesController.quizAcceptedByOpponent);
router.get('/quiz/is-player-done/:id', isAuthenticate, quizzesController.isPlayerDoneWithQue);
router.get('/quiz/get-detail/:id', isAuthenticate, quizzesController.getQuizDetailByID);
router.get('/quiz/get-result-data/:id', isAuthenticate, quizzesController.getQuizResultByID);
router.get('/quiz/stop-timer/:id', isAuthenticate, quizzesController.stopQuizTimer);
// router.post('/quiz/get-opponents-answers', validate, isAuthenticate, quizzesController.getOpponentsAnswers);

const questionnairesController = require('../controllers/admin/questionnaires');
router.post('/questions/report', validate, isAuthenticate, questionnairesController.reportTheQuestions);
router.get('/test', quizzesController.testFunction);



module.exports = router;