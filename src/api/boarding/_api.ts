import { Router } from 'express';
import boardingApi from './boarding.js';
import monitoringApi from './monitoring.js';

const app = Router();

app.use('/v1', boardingApi);
app.use('/v2', monitoringApi);

export default app;
