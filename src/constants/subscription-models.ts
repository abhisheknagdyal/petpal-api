export type SubscriptionPlan = 'basic' | 'plus' | 'gold';

export const SUBSCRIPTION_LEVELS = {
	BASIC: 'basic',
	PLUS: 'plus',
	GOLD: 'gold',
} as const;

export const SUBSCRIPTION_INDEX_MAP = [
	SUBSCRIPTION_LEVELS.BASIC,
	SUBSCRIPTION_LEVELS.PLUS,
	SUBSCRIPTION_LEVELS.GOLD,
] as const;

const SUBSCRIPTION_MODELS = new Map([
	[
		1,
		{
			priceMonthly: 0,
			priceYearly: 0,
			name: 'Basic',
			fieldId: SUBSCRIPTION_LEVELS.BASIC,
		},
	],
	[
		2,
		{
			priceMonthly: 10000 * 100,
			priceYearly: 100000 * 100,
			name: 'Plus+',
			fieldId: SUBSCRIPTION_LEVELS.PLUS,
		},
	],
	[
		3,
		{
			priceMonthly: 50000 * 100,
			priceYearly: 500000 * 100,
			name: 'Gold*',
			fieldId: SUBSCRIPTION_LEVELS.GOLD,
		},
	],
]);

export default SUBSCRIPTION_MODELS;
