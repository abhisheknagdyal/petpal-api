import { Router } from 'express';
import { cartValidator } from '../../validators/products/cart-validator.js';
import {
	getMyWishlist,
	wishlistAction,
} from '../../controllers/products/wishlist-controller.js';
import { validateRequest } from '../../middleware.js';
import validations from '../../validators/common.js';

const app = Router();

app.get('/', getMyWishlist);
app.post(
	'/',
	validations.required('productId'),
	validateRequest(),
	wishlistAction
);

export default app;
