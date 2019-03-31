const express = require('express');
const bnApps = require('../models/bnApp.js');
const evals = require('../models/evaluation.js');
const testSubmission = require('../models/bnTest/testSubmission');
const users = require('../models/user.js');
const api = require('../models/api.js');
const logs = require('../models/log.js');

const router = express.Router();

router.use(api.isLoggedIn);
router.use(api.isNat);

/* GET bn app page */
router.get('/', async (req, res, next) => {
    res.render('evaluations/appeval', { 
        title: 'BN Application Evaluations', 
        script: '../javascripts/appEval.js', 
        isEval: true, 
        isBnOrNat: res.locals.userRequest.group == 'bn' || res.locals.userRequest.group == 'nat',
        isNat: res.locals.userRequest.group == 'nat'
    });
});

//population
const defaultPopulate = [
    { populate: 'applicant', display: 'username osuId', model: users.User },
    { populate: 'test', display: 'totalScore', model: testSubmission.TestSubmission },
    { populate: 'evaluations', display: 'evaluator behaviorComment moddingComment vote', model: evals.Evaluation },
    { innerPopulate: 'evaluations', model: evals.Evaluation, populate: { path: 'evaluator', select: 'username osuId', model: users.User } },
];

/* GET applicant listing. */
router.get('/relevantInfo', async (req, res, next) => {
    const [a] = await Promise.all([
        await bnApps.service.query({active: true, test: { $exists: true }}, defaultPopulate, {createdAt: 1}, true ),
    ]);
    res.json({ a: a, evaluator: req.session.mongoId });
});


/* POST submit or edit eval */
router.post('/submitEval/:id', async (req, res) => {
    if(req.body.evaluationId){
        await evals.service.update(req.body.evaluationId, {behaviorComment: req.body.behaviorComment, moddingComment: req.body.moddingComment, vote: req.body.vote});
    }else{
        let ev = await evals.service.create(req.session.mongoId, req.body.behaviorComment, req.body.moddingComment, req.body.vote);
        await bnApps.service.update(req.params.id, {$push: {evaluations: ev._id}});
    }
    let a = await bnApps.service.query({ _id: req.params.id }, defaultPopulate)
    res.json(a);
    logs.service.create(req.session.mongoId, 
        `${req.body.evaluationId ? 'Updated' : 'Submitted'} ${a.mode} BN app evaluation for "${a.applicant.username}"`);
});

/* POST set group eval */
router.post('/setGroupEval/', async (req, res) => {
    for (let i = 0; i < req.body.checkedApps.length; i++) {
        await bnApps.service.update(req.body.checkedApps[i], {discussion: true});
    }

    let a = await bnApps.service.query({active: true}, defaultPopulate, {createdAt: 1}, true );
    res.json(a);
    logs.service.create(req.session.mongoId, 
        `Set ${req.body.checkedApps.length} BN app${req.body.checkedApps.length == 1 ? '' : 's'} as group evaluation`)
});

/* POST set invidivual eval */
router.post('/setIndividualEval/', async (req, res) => {
    for (let i = 0; i < req.body.checkedApps.length; i++) {
        await bnApps.service.update(req.body.checkedApps[i], {discussion: false});
    }
    
    let a = await bnApps.service.query({active: true}, defaultPopulate, {createdAt: 1}, true );
    res.json(a);
    logs.service.create(req.session.mongoId, 
        `Set ${req.body.checkedApps.length} BN app${req.body.checkedApps.length == 1 ? '' : 's'} as individual evaluation`)
});

/* POST set evals as complete */
router.post('/setComplete/', async (req, res) => {
    for (let i = 0; i < req.body.checkedApps.length; i++) {
        let a = await bnApps.service.query({_id: req.body.checkedApps[i]});
        let u = await users.service.query({_id: a.applicant});
        if(a.consensus == 'pass'){
            await users.service.update(u.id, {$push: {modes: a.mode}});
            await users.service.update(u.id, {$push: {probation: a.mode}});
            if(u.group == 'user'){
                await users.service.update(u.id, {group: 'bn'});
            }
        }
        await bnApps.service.update(a.id, {active: false});
    }
    
    let a = await bnApps.service.query({active: true}, defaultPopulate, {createdAt: 1}, true );
    res.json(a);
    logs.service.create(req.session.mongoId, 
        `Set ${req.body.checkedApps.length} BN app${req.body.checkedApps.length == 1 ? '' : 's'} as completed`);

});

/* POST set consensus of eval */
router.post('/setConsensus/:id', async (req, res) => {
    await bnApps.service.update(req.params.id, {consensus: req.body.consensus})
    let a = await bnApps.service.query({_id: req.params.id}, defaultPopulate);
    res.json(a);
    logs.service.create(req.session.mongoId, 
        `Set consensus of ${a.applicant.username}'s ${a.mode} BN app as ${req.body.consensus}`);
});

module.exports = router;
