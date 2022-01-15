import express, { Router } from 'express';
import { getRepository } from "typeorm";
var bodyParser = require('body-parser');
export var jsonParser = bodyParser.json();
import { Stats } from '../entity/Stats'

const router: Router = express.Router();

router.get('/', (req, res) => {
    res.send('Analytics section');
});

router.get('/stats', async (req, res) => {
    let analyticsRepository = await getRepository(Stats);
    res.send(await analyticsRepository.find());
})


router.post('/register/:id', async (req,res) => {
    var keyId = req.params.id;

    let analyticsRepository = await getRepository(Stats);

    let visitorsObject = await analyticsRepository.findOne({ key: keyId });
    if (!visitorsObject) {
        let analyticObject = new Stats();
        analyticObject.key = keyId;
        analyticObject.amount = 1;
        await analyticsRepository.save(analyticObject);
    } else {
        visitorsObject.amount = visitorsObject.amount + 1;
        await analyticsRepository.save(visitorsObject);
    }
    res.send('ok');
})

export const analyticsRouter: Router = router;
