import validations from '../common.js';

export const productsValidator = [
	validations.required('name'),
	validations.required('description'),
	validations.oneOf('category', [
		'Food',
		'Toys',
		'Accessories',
		'Grooming',
		'Healthcare',
	]),
	validations.required('price'),
	validations.required('stock'),
	validations.number('price'),
	validations.number('stock'),
	validations.oneOf('petType', [
		'Dog',
		'Cat',
		'Bird',
		'Reptile',
		'Fish',
		'Small Animal',
	]),
];
