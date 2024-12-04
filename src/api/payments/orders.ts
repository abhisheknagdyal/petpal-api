import { Router } from 'express';
import {
	createOrder,
	getMyOrders,
	getInvoiceLink,
} from '../../controllers/payments/orders-controller.js';
import { createOrdersValidator } from '../../validators/payments/orders-validator.js';
import { validateRequest } from '../../middleware.js';

const app = Router();

app.get('/', getMyOrders);
app.get('/invoice/:id', getInvoiceLink);
app.post('/', ...createOrdersValidator, validateRequest(), createOrder);

export default app;
