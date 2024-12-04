import { type Request, type Response } from 'express';
import { CartModel } from '../../database/models/products/cart-model.js';
import { IRequest } from '../../middleware.js';
import { ProductModel } from '../../database/models/products/products-model.js';

const getMyCart = async (req: Request, res: Response) => {
	const userId = (req as IRequest).userToken.id;
	const response = await CartModel.findOne({ user: userId })
		.populate({
			path: 'items.product',
			model: 'Product',
		})
		.exec();
	if (!response) {
		res.status(404).json({ error: 'Cart not found' });
		return;
	}
	res.status(200).json(response);
	return;
};

const addToCart = async (req: Request, res: Response) => {
	const { quantity, productId, color, size } = req.body;
	const userId = (req as IRequest).userToken.id;
	const product = await ProductModel.findById(productId);
	if (!product) {
		res.status(404).json({ error: 'Product not found' });
		return;
	}
	let cart = await CartModel.findOne({ user: userId });
	if (!cart) {
		cart = new CartModel({
			user: userId,
			items: [{ product: productId, quantity, color, size }],
		});
	} else {
		const existingItemIndex = cart.items.findIndex(
			(item) => item.product.toString() === productId
		);
		if (existingItemIndex >= 0) {
			cart.items[existingItemIndex].quantity += quantity;
			cart.items[existingItemIndex].size =
				size || cart.items[existingItemIndex].size;
			cart.items[existingItemIndex].color =
				color || cart.items[existingItemIndex].color;
		} else {
			cart.items.push({ product: productId, quantity, color, size });
		}
	}
	await cart.save();
	res.status(200).json({ message: 'ok' });
	return;
};

const deleteFromCart = async (req: Request, res: Response) => {
	const { productId } = req.body;
	const userId = (req as IRequest).userToken.id;
	const product = await ProductModel.findById(productId);
	if (!product) {
		res.status(404).json({ error: 'Product not found' });
		return;
	}
	let cart = await CartModel.findOne({ user: userId });
	if (!cart) {
		res.status(404).json({ error: 'Cart not found' });
		return;
	}
	const existingItemIndex = cart.items.findIndex(
		(item) => item.product.toString() === productId
	);
	if (existingItemIndex >= 0) {
		cart.items.splice(existingItemIndex, 1);
	}
	await cart.save();
	res.status(200).json({ message: 'ok' });
	return;
};

export { getMyCart, addToCart, deleteFromCart };
