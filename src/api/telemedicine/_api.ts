import { Router } from 'express';
import doctorsApi from './doctors.js';

const app = Router();

app.use('/doctors', doctorsApi);

export default app;
