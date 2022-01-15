import { AuthRequest, authMiddleware } from './middleware';
import express, { Router, Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { getRepository } from "typeorm";
import { User } from '../entity/User';

var bodyParser = require('body-parser');
export var jsonParser = bodyParser.json();

const router: Router = express.Router();

router.get('/', (req, res) => {
    res.send('Auth section');
});

router.post('/login', jsonParser, (req, res) => {
    console.log('request to /login');

    let userRepository = getRepository(User);
    let body = req.body;

    let user = userRepository.findOne({ email: body.email, password: body.password });

    user.then(user => {
        if (!user) {
            res.send('acces denied');
            return;
        }

        console.log(user);

        const token = sign({ user: { id: user.id, name: user.name } }, 'code123');
        res.send(token);
    });

});

router.post('/register/user', jsonParser, async (req, res) => {


    var body = req.body;
    var name = body.name;
    var email = body.email;
    var password = body.password;

    let userRepository = await getRepository(User);
    let user = new User();
    user.name = name;
    user.email = email;
    user.password = password;

    await userRepository.save(user);
    res.send('User saved.');

});

router.get('/testaccount', authMiddleware, (req: AuthRequest, res) => {
    res.send('The user id: ' + req.user.id);
});

export const authRouter: Router = router;
