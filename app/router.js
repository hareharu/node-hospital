var router = require('express').Router();
var morgan = require('morgan');
var fs = require('fs');

router.use('/report/f39', require('../report/f39'));
router.use('/report/pos', require('../report/pos'));

router.use('/who', require('../api/who'));
router.use('/vcparser', require('../api/vcparser'));

router.use('/pmonitor', require('../api/pmonitor'));

if (process.env.NODE_ENV === 'production') router.use(morgan('API call;:ip;:user;:method;:url;:status;:res[content-length];:response-time'));

router.use('/settings', require('../api/settings'));

router.use('/ambulance', require('../api/ambulance'));
router.use('/cancer', require('../api/cancer'));
router.use('/doctor', require('../api/doctor'));
router.use('/eirparser', require('../api/eirparser'));
router.use('/epicrisis', require('../api/epicrisis'));
if (fs.existsSync(process.env.FPR_BASE) === true) router.use('/fprocessor', require('../api/fprocessor'));
router.use('/hardware', require('../api/hardware'));
router.use('/homelinks', require('../api/homelinks'));
router.use('/kanban', require('../api/kanban'));
router.use('/news', require('../api/news'));
router.use('/passwords', require('../api/passwords'));
router.use('/patient', require('../api/patient'));
router.use('/phonebook', require('../api/phonebook'));

router.use('/query', require('../api/query'));
router.use('/records', require('../api/records'));
router.use('/reestr', require('../api/reestr'));
router.use('/references', require('../api/references'));
router.use('/rznsoap', require('../api/rznsoap'));
router.use('/schedule', require('../api/schedule'));
router.use('/service', require('../api/service'));
router.use('/userroles', require('../api/userroles'));

router.use('/video', require('../api/video'));

module.exports = router;
