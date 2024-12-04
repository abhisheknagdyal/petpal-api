import { Router } from 'express';
import subscriptionsApi from './subscriptions.js';
import webhookApi from './webhook.js';
import ordersApi from './orders.js';

const app = Router();

app.use('/subscriptions', subscriptionsApi);
app.use('/orders', ordersApi);
app.use('/webhook', webhookApi);

export default app;
