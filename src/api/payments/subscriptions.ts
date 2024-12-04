import { Router } from 'express';
import {
	getAvailableSubscriptions,
	createSubscription,
	cancelSubscription,
} from '../../controllers/payments/subscriptions-controller.js';
import { validateRequest } from '../../middleware.js';
import { createSubscriptionValidator } from '../../validators/payments/subscriptions-validator.js';

const app = Router();

app.get('/', getAvailableSubscriptions);
app.post(
	'/create',
	...createSubscriptionValidator,
	validateRequest(),
	createSubscription
);
app.put('/cancel', cancelSubscription);

export default app;
