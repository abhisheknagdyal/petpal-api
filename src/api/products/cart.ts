import { Router } from 'express';
import {
	cartValidator,
	deleteCartValidator,
} from '../../validators/products/cart-validator.js';
import {
	getMyCart,
	addToCart,
	deleteFromCart,
} from '../../controllers/products/cart-controller.js';
import { validateRequest } from '../../middleware.js';

const app = Router();

app.get('/', getMyCart);
app.post('/', ...cartValidator, validateRequest(), addToCart);
app.delete(
	'/delete',
	...deleteCartValidator,
	validateRequest(),
	deleteFromCart
);

export default app;
