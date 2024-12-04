import { Router } from 'express';
import { webhookController } from '../../controllers/payments/webhook-controller.js';

const app = Router();

app.post('/', webhookController);

export default app;
