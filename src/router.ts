import express, { Router } from 'express';
import { authRouter } from './components/authentication';
import { analyticsRouter } from './components/analytics';
import { stationsRouter } from './components/stations'
import { bikesRouter } from './components/bikes'
import { serviceRouter }  from './components/service'

const router: Router = express.Router();
router.use('/auth', authRouter);
router.use('/analytics', analyticsRouter);
router.use('/stations', stationsRouter);
router.use('/bikes', bikesRouter);
router.use('/service', serviceRouter);


export const applicationRouter: Router = router;