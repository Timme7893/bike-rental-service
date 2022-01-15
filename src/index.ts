import express from 'express';
var bodyParser = require('body-parser');
import "reflect-metadata";
import { createConnection } from "typeorm";
var cors = require('cors')
import { getConnectionOptions, ConnectionOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

// =============================
// Database
// =============================

const getOptions = async () => {
    let connectionOptions: ConnectionOptions;
    connectionOptions = {
        type: 'postgres',
        synchronize: true,
        logging: false,
        extra: {
            ssl: {
                rejectUnauthorized: false
            },
        },
        entities: ['src/entity/*.*'],
    };
    if (process.env.DATABASE_URL) {
        Object.assign(connectionOptions, { url: process.env.DATABASE_URL });
    } else {
        connectionOptions = await getConnectionOptions();
    }

    return connectionOptions;
};

const connectDatabase = async (): Promise<void> => {
    const typeormconfig = await getOptions();
    await createConnection(typeormconfig);
};

connectDatabase().then(async () => {
    console.log('Connected to database');
});

// =============================
// End database section
// =============================

// =============================
// Start Express section
// =============================

import { applicationRouter } from './router';
export var jsonParser = bodyParser.json();


const app = express();
app.use(require('express-status-monitor')());
app.use(cors());
app.use(bodyParser.json());
app.use(applicationRouter);

app.listen(process.env.PORT || 9999, () => {
    console.log('ready on port ' + (process.env.PORT || 9999))
});

app.get('/', (req, res) => {
    res.send('Application is functioning.');
});

