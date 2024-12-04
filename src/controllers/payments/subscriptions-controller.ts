import { type Request, type Response } from 'express';
import Stripe from 'stripe';
import { generateSubscriptionLineItems } from '../../utils/payments.js';
import SUBSCRIPTION_MODELS from '../../constants/subscription-models.js';
import {
	deleteOne,
	getOne,
	getOneByField,
	updateOne,
} from '../../database/crud.js';
import { User } from '../../database/models/auth/auth-model.js';
import {
	STRIPE_DEV_SECRET_KEY,
	STRIPE_REDIRECT,
} from '../../constants/secrets.js';
import { IRequest } from '../../middleware.js';
import { MetaData } from './webhook-controller.js';
import { SubscriptionsModel } from '../../database/models/subscriptions/subscriptions-model.js';
import { SocialSignatureModel } from '../../database/models/social/social-signature-model.js';

const stripe = new Stripe(STRIPE_DEV_SECRET_KEY);

const getAvailableSubscriptions = async (req: Request, res: Response) => {
	res.status(200).json({ models: [...SUBSCRIPTION_MODELS] });
};

const createSubscription = async (
	req: Request,
	res: Response
): Promise<void> => {
	const requested_model = SUBSCRIPTION_MODELS.get(req.body.subscription_model)!;
	const urlWithPath = `${STRIPE_REDIRECT}${req.body.path}`;
	if (
		requested_model.fieldId === (req as IRequest).userToken.subscription_model
	) {
		res.status(403).json({
			error: `User is already subscribed to ${requested_model.name} plan`,
		});
		return;
	}
	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		mode: 'subscription',
		line_items: generateSubscriptionLineItems(
			req.body.subscription_model,
			req.body.term
		),
		success_url: urlWithPath,
		cancel_url: urlWithPath,
		metadata: {
			user_id: (req as IRequest).userToken.id,
			current_model: (req as IRequest).userToken.subscription_model,
			new_model: requested_model.fieldId,
		} as MetaData,
	});
	res.status(200).json({ session });
	return;
};

const cancelSubscription = async (
	req: Request,
	res: Response
): Promise<void> => {
	const user = await getOne(User, (req as IRequest).userToken.id);
	if (!user?.subscriptionRefId) {
		res.status(404).json({ error: 'User doesnt have a subscription' });
		return;
	}
	const subscription = await getOne(
		SubscriptionsModel,
		user?.subscriptionRefId
	);
	const socialSignature = await getOneByField(
		SocialSignatureModel,
		'userId',
		(req as IRequest).userToken.id
	);
	if (!subscription) {
		res.status(404).json({ error: 'Subscription not found' });
		return;
	}
	const s = await stripe.subscriptions.cancel(
		subscription.details.subscription
	);
	if (!s) {
		res.status(400).json({ error: `Couldn't cancel subscription` });
		return;
	}
	await deleteOne(SubscriptionsModel, subscription._id as string);
	if (socialSignature) {
		await deleteOne(SocialSignatureModel, socialSignature._id as string);
	}
	const response = await updateOne(User, (req as IRequest).userToken.id, {
		subscriptionModel: SUBSCRIPTION_MODELS.get(1)!.fieldId,
		subscriptionRefId: null,
	});
	res.status(200).json({ subscription_model: response?.subscriptionModel });
	return;
};

export { getAvailableSubscriptions, createSubscription, cancelSubscription };
