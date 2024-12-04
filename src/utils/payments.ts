import type { Stripe } from 'stripe';
import SUBSCRIPTION_MODELS from '../constants/subscription-models.js';

const termMap = {
	month: 'priceMonthly',
	year: 'priceYearly',
};

export const generateSubscriptionLineItems = (
	id: number,
	term: 'month' | 'year'
) => {
	const selected_model: { [key: string]: any } = SUBSCRIPTION_MODELS.get(id)!;
	return [
		{
			price_data: {
				recurring: {
					interval:
						term as Stripe.Checkout.SessionCreateParams.LineItem.PriceData.Recurring.Interval,
				},
				currency: 'INR',
				product_data: {
					name: selected_model.name,
				},
				unit_amount: selected_model[termMap[term]],
			},
			quantity: 1,
		},
	];
};

export const generateOrderLineItems = (cart: any) => {
	return cart.items.map((item: any) => ({
		price_data: {
			currency: 'INR',
			product_data: {
				name: item.product.name,
				description: item.product.description,
				images: item.product.images,
			},
			unit_amount: Math.round(item.product.price * 100),
		},
		quantity: item.quantity,
	}));
};
