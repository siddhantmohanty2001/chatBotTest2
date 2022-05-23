const router = require("express").Router()
const  testController  = require('../controllers/test');

router.post("/test", testController?.test);

module.exports = router; 
