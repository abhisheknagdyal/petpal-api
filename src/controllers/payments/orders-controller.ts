import { Request, Response } from 'express';
import Stripe from 'stripe';
import {
	STRIPE_DEV_SECRET_KEY,
	STRIPE_REDIRECT,
} from '../../constants/secrets.js';
import { CartModel } from '../../database/models/products/cart-model.js';
import { IRequest } from '../../middleware.js';
import { generateOrderLineItems } from '../../utils/payments.js';
import { OrdersModel } from '../../database/models/orders/orders-model.js';

const stripe = new Stripe(STRIPE_DEV_SECRET_KEY);

const getMyOrders = async (req: Request, res: Response): Promise<void> => {
	const userId = (req as IRequest).userToken.id;
	const query = {
		'cart.user': userId,
	};
	const [count, documents] = await Promise.all([
		OrdersModel.countDocuments(query),
		OrdersModel.find(query)
			.skip(+req.query.skip! || 0)
			.limit(10)
			.sort({ createdAt: -1 })
			.populate({
				path: 'cart.items.product',
				model: 'Product',
			}),
	]);
	res.status(200).json({ count, results: documents });
	return;
};

const getInvoiceLink = async (req: Request, res: Response): Promise<void> => {
	const response = await stripe.invoices.retrieve(req.params.id);
	const { hosted_invoice_url, invoice_pdf } = response;
	res.status(200).json({ hosted_invoice_url, invoice_pdf });
};

const createOrder = async (req: Request, res: Response): Promise<void> => {
	const urlWithPath = `${STRIPE_REDIRECT}${req.body.path}`;
	const myCart = await CartModel.findOne({
		user: (req as IRequest).userToken.id,
	}).populate({
		path: 'items.product',
		model: 'Product',
	});
	const order = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		mode: 'payment',
		invoice_creation: {
			enabled: true,
		},
		success_url: urlWithPath,
		cancel_url: urlWithPath,
		line_items: generateOrderLineItems(myCart),
		metadata: {
			user_id: (req as IRequest).userToken.id,
		},
	});
	res.status(201).json(order);
	return;
};

export { getMyOrders, createOrder, getInvoiceLink };
