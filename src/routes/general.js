const router = require("express").Router()
const generalRoutes  = require('../controllers/general');

router.post("/emailandPhone", generalRoutes?.emailAndPhone);
router.post("/skip", generalRoutes?.skip);
router.post("/no", generalRoutes?.no);
router.post("/readMore", generalRoutes?.readMore);

module.exports = router; 


