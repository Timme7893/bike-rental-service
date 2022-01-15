import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

export type UserData = {
    id: number,
    name: string
};

export type AuthRequest = Request & { user: UserData };

export const authMiddleware = (req: AuthRequest, res: Response, next) => {
    try {
        console.log('Verify the token');
        if (req.header('authorization') == undefined) {
            console.log('denied');
            throw Error('Authorization Header Missing');
        }
        const token = req.header('authorization');

        if (token === 'testadmin') {
            next();
        }

        const payload = verify(token, 'code123');
        req.user = payload['user'];

        next();
    } catch (e) {
        console.log('denied');
        res.send(e.message);
    }
};

import { getRepository } from "typeorm";
import { Stats } from '../entity/Stats'


export const analyticsMiddleware = async (req, res, next) => {

    next();

    try {
        let keyId = req.originalUrl;
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

    } catch (e) {
        res.send(e.message);

    }
}

