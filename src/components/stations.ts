import express, { Router } from 'express';
import { getRepository } from "typeorm";
var bodyParser = require('body-parser');
export var jsonParser = bodyParser.json();
import { Station } from '../entity/Station'
import { AuthRequest, authMiddleware, analyticsMiddleware } from './middleware'

const router: Router = express.Router();

router.get('/', [authMiddleware, analyticsMiddleware], async (reg: AuthRequest, res) => {
    let stationRespository = await getRepository(Station);
    let list = await stationRespository.find();

    if (list.length === 0) {
        res.send({ code: 200, message: 'There are no stations registered.'});
    } else {
        res.send(list);
    }
});

router.post('/add', [authMiddleware, jsonParser, analyticsMiddleware], async (req: AuthRequest, res) => {

    let body = req.body;
    let location = body.location.toLowerCase();

    if (!location) {
        res.send({ code: 404, message: 'The location is not provided.'});
        return;
    }

    let stationRespository = await getRepository(Station);
    let stationObject = await stationRespository.findOne({ location: location });

    if (stationObject) {
        res.send({ code: 404, message: 'Station with this location is already registered.'});
        return;
    }

    let newStationObject = new Station();
    newStationObject.location = location;

    await stationRespository.save(newStationObject);

    res.send({ code: 200, message: 'Station registered.'});
})

router.post('/remove/:id', [authMiddleware, analyticsMiddleware], async (reg: AuthRequest, res) => {

    let stationId = Number(reg.params.id);

    if (!stationId) {
        res.send({ code: 404, message: 'Station id is not provided.'});
        return;
    }

    let stationRespository = await getRepository(Station);
    let stationObject = await stationRespository.findOne({ id: stationId });

    if (!stationObject) {
        res.send({ code: 404, message: 'Station does not exists.'});
        return;
    }

    await stationRespository.delete(stationObject);
    res.send({ code: 200, message: 'Station ' + stationId + ' deleted.'});

});

export const stationsRouter: Router = router;
