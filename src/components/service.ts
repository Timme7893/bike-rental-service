import express, { Router } from 'express';
import { getRepository } from "typeorm";
var bodyParser = require('body-parser');
export var jsonParser = bodyParser.json();
import { Bike } from '../entity/Bike'
import { analyticsMiddleware } from './middleware'

const { createMollieClient } = require('@mollie/api-client');
const mollieClient = createMollieClient({ apiKey: '' });

const router: Router = express.Router();

var rentedBikes = new Map<number,number>();

router.get('/unlock/:code', [analyticsMiddleware], async (req, res) => {

    let code = req.params.code;

    if (!code) {
        res.send({ code: 404, message: 'Missing code parameter.'});
        return;
    }

    let bikeRepository = await getRepository(Bike);
    let bikeObject = await bikeRepository.findOne({ code: code })

    if (!bikeObject) {
        res.send({ code: 404, message: 'Invalid code.'});
        return;
    }

    if (bikeObject.locked === false) {
        res.send({ code: 404, message: 'Bike already unlocked.'});
        return;
    }

    bikeObject.locked = false;
    await bikeRepository.save(bikeObject);

    // send signal to bike.
    let timestamp = Date.now();
    rentedBikes.set(bikeObject.id, timestamp);

    res.send({ code: 200, status: 'Bike ' + bikeObject.id + ' unlocked'});

});

router.get('/lock/:code', [analyticsMiddleware], async (req, res) => {

    let code = req.params.code;

    if (!code) {
        res.send({ code: 404, message: 'Missing code parameter.'});
        return;
    }

    let bikeRepository = await getRepository(Bike);
    let bikeObject = await bikeRepository.findOne({ code: code })

    if (!bikeObject) {
        res.send({ code: 404, message: 'Invalid code.'});
        return;
    }

    if (bikeObject.locked === true) {
        res.send({ code: 404, message: 'Bike already locked.'});
        return;
    }

    let unlockedTimestamp = rentedBikes.get(bikeObject.id);

    const timePassed = Date.now() - unlockedTimestamp;
    const rentedTime = Math.floor(timePassed / 1000);

    let feePerSecond = 0.05;
    let cost = rentedTime * feePerSecond;
    let costString = cost.toFixed(2);


    // send signal to bike to lock.

    rentedBikes.delete(bikeObject.id);

    bikeObject.locked = true;
    await bikeRepository.save(bikeObject);

    mollieClient.payments.create({
        amount: {
          value: costString,
          currency: 'EUR'
        },
        description: 'Bike rental',
        redirectUrl: 'https://bike-rental-api.herokuapp.com/service/confirmed',
        webhookUrl:  'https://bike-rental-api.herokuapp.com/service/webhook'
      })
        .then(payment => {
          res.send({ code: 200, rentedTime: rentedTime, cost: '€' + cost, status: "Bike " + bikeObject.id + " locked", paymentUrl: payment.getCheckoutUrl()});
        })
        .catch(error => {
          console.log(error);
          res.send({ code: 200, rentedTime: rentedTime, cost: '€' + cost, status: "Bike " + bikeObject.id + " locked", message: "payment setup failed"});
        });

});

router.post('/webhook', [analyticsMiddleware], async (req, res) => {
    console.log('Invoice has been paid.');
});

router.get('/confirmed', [analyticsMiddleware], async (req, res) => {
    res.send('Thank you using our service.');
});

export const serviceRouter: Router = router;
