import validations from '../common.js';
import SUBSCRIPTION_MODELS from '../../constants/subscription-models.js';

export const createSubscriptionValidator = [
	validations.oneOf('subscription_model', [...SUBSCRIPTION_MODELS.keys()]),
	validations.required('path'),
	validations.oneOf('term', ['month', 'year']),
];
