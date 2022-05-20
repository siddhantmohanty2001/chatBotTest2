const router = require("express").Router();
const reachUsController = require('../controllers/contactUs');

router.post("/contactUs", reachUsController?.contactUs);

module.exports = router;
