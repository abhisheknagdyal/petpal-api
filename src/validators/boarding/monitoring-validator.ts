import validations from '../common.js';
import { SUBSCRIPTION_LEVELS } from '../../constants/subscription-models.js';

export const monitoringValidator = [
	validations.required('requestId'),
	validations.required('userId'),
	validations.required('sessionURL'),
	validations.oneOf(
		'userSubscriptionModel',
		Object.values(SUBSCRIPTION_LEVELS)
	),
];

export const monitoringCloseValidator = [validations.required('requestId')];
