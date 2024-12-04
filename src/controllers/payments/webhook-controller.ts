import { type Request, type Response } from 'express';
import Stripe from 'stripe';
import {
	createOne,
	deleteOne,
	getOneByField,
	updateOne,
} from '../../database/crud.js';
import { User } from '../../database/models/auth/auth-model.js';
import {
	STRIPE_DEV_SECRET_KEY,
	STRIPE_DEV_WEBHOOK_KEY,
} from '../../constants/secrets.js';
import { SubscriptionsModel } from '../../database/models/subscriptions/subscriptions-model.js';
import { OrdersModel } from '../../database/models/orders/orders-model.js';
import { CartModel } from '../../database/models/products/cart-model.js';
import { updateProductStockWithTransaction } from '../products/products-controller.js';
import { SocialSignatureModel } from '../../database/models/social/social-signature-model.js';

export type MetaData = {
	user_id: string;
	current_model: string;
	new_model: string;
};

const stripe = new Stripe(STRIPE_DEV_SECRET_KEY);

const webhookController = async (
	req: Request,
	res: Response
): Promise<void> => {
	const sig = req.headers['stripe-signature'];
	let event;
	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			sig!,
			STRIPE_DEV_WEBHOOK_KEY
		);
	} catch (err: any) {
		console.error('Webhook signature verification failed.', err.message);
		res.status(400).send(`Webhook Error: ${err.message}`);
		return;
	}

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object;
		if (session.mode === 'subscription') {
			const subCreated = await createOne(SubscriptionsModel, {
				details: session,
			});
			const { user_id, new_model } = session.metadata as MetaData;
			await updateOne(User, user_id, {
				subscriptionModel: new_model,
				subscriptionRefId: subCreated._id,
			});
			if (new_model === 'gold') {
				await createOne(SocialSignatureModel, {
					userId: user_id,
				});
			}
		}
		if (session.mode === 'payment') {
			const { user_id } = session.metadata as MetaData;
			const myCart = await getOneByField(CartModel, 'user', user_id);
			if (!myCart) {
				res.status(400).send('Cart does not exist');
				return;
			}
			await createOne(OrdersModel, {
				cart: myCart,
				invoiceId: session.invoice as string,
			});
			await updateProductStockWithTransaction(myCart._id as string);
			await deleteOne(CartModel, myCart._id as string);
		}
	}

	res.json({ received: true });
	return;
};

export { webhookController };
