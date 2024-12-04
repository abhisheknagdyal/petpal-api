import { Router } from 'express';
import productsApi from './products.js';
import cartApi from './cart.js';
import wishlistsApi from './wishlists.js';

const app = Router();

app.use('/products', productsApi);
app.use('/cart', cartApi);
app.use('/wishlist', wishlistsApi);

export default app;
