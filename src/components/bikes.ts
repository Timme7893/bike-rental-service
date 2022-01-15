import express, { Router } from 'express';
import { getRepository } from "typeorm";
var bodyParser = require('body-parser');
export var jsonParser = bodyParser.json();
import { Bike } from '../entity/Bike'
import { Station } from '../entity/Station'
import { AuthRequest, authMiddleware, analyticsMiddleware } from './middleware'

const router: Router = express.Router();

router.get('/', [authMiddleware, analyticsMiddleware], async (req: AuthRequest, res) => {
    let bikeRespository = await getRepository(Bike);
    let list = await bikeRespository.find();

    if (list.length === 0) {
        res.send({ code: 200, message: 'There are no bikes registered.'});
    } else {
        res.send(list);
    }
});

router.post('/add', [authMiddleware, analyticsMiddleware,jsonParser], async (req: AuthRequest, res) => {

    let body = req.body;
    let stationId = Number(body.stationId);
    let type = body.type.toLowerCase();

    if (!stationId || !type) {
        res.send({ code: 404, message: 'Missing parameters. (stationId and type)'});
        return;
    }

    let stationRespository = await getRepository(Station);
    let stationObject = await stationRespository.findOne({ id: stationId });

    if (!stationObject) {
        res.send({ code: 404, message: 'Station does not exists.'});
        return;
    }

    let maintenance = false;
    let code = generateCode();
    let locked = true;
    let paused = false;

    let bikeObject = new Bike();
    bikeObject.code = code;
    bikeObject.type = type;
    bikeObject.station = stationId;
    bikeObject.maintenance = maintenance;
    bikeObject.locked = locked;
    bikeObject.paused = paused;

    let bikeRepository = await getRepository(Bike);
    await bikeRepository.save(bikeObject);

    res.send({ code: 200, message: 'Bike added!'});

});

router.post('/remove/:id', [authMiddleware, analyticsMiddleware], async (req: AuthRequest, res) => {

    let bikeId = Number(req.params.id);

    if (!bikeId) {
        res.send({ code: 404, message: 'Bike id is not provided.'});
        return;
    }

    let bikeRepository = await getRepository(Bike);
    let bikeObject = await bikeRepository.findOne({ id: bikeId });

    if (!bikeObject) {
        res.send({ code: 404, message: 'Bike does not exists.'});
        return;
    }

    await bikeRepository.delete(bikeObject);
    res.send({ code: 200, message: 'Bike ' + bikeId + ' deleted.'});

});

function generateCode() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 30; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

export const bikesRouter: Router = router;
