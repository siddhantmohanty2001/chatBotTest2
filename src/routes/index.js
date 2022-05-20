const router = require("express").Router();
const reachUsRoutes = require('./contactUs');
const defaultRoutes = require('./default');
const detectNameRoutes = require('./detectName');
const generalRoutes = require('./general');
const logsRoutes = require('./logs');
const testRoutes = require('./test');

router.use('/reachUs', reachUsRoutes);
router.use('/default', defaultRoutes);
router.use('/detectName', detectNameRoutes);
router.use('/general', generalRoutes);
router.use('/logs', logsRoutes);
router.use('/test', testRoutes);

module.exports = router;
