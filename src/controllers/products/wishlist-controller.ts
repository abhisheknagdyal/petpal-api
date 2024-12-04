import type { Request, Response } from 'express';
import { IRequest } from '../../middleware.js';
import { WishlistModel } from '../../database/models/products/wishlist-model.js';
import { ProductModel } from '../../database/models/products/products-model.js';

const getMyWishlist = async (req: Request, res: Response) => {
	const userId = (req as IRequest).userToken.id;
	const response = await WishlistModel.findOne({ user: userId })
		.populate({
			path: 'items.product',
			model: 'Product',
		})
		.exec();
	if (!response) {
		res.status(404).json({ error: 'Wishlist not found' });
		return;
	}
	res.status(200).json(response);
	return;
};

const wishlistAction = async (req: Request, res: Response) => {
	const { productId } = req.body;
	const userId = (req as IRequest).userToken.id;
	const product = await ProductModel.findById(productId);
	if (!product) {
		res.status(404).json({ error: 'Product not found' });
		return;
	}
	let wishlist = await WishlistModel.findOne({ user: userId });
	if (!wishlist) {
		wishlist = new WishlistModel({
			user: userId,
			items: [{ product: productId }],
		});
	} else {
		const existingItemIndex = wishlist.items.findIndex(
			(item) => item.product.toString() === productId
		);
		if (existingItemIndex >= 0) {
			wishlist.items.splice(existingItemIndex, 1);
		} else {
			wishlist.items.push({ product: productId });
		}
	}
	await wishlist.save();
	res.status(200).json({ message: 'ok' });
	return;
};

export { getMyWishlist, wishlistAction };
