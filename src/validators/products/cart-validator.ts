import validations from '../common.js';

export const cartValidator = [
	validations.required('productId'),
	validations.required('quantity'),
];

export const deleteCartValidator = [validations.required('productId')];
