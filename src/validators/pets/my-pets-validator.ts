import validations from '../common.js';

export const petsValidator = [
	validations.required('name'),
	validations.required('species'),
	validations.required('breed'),
	validations.required('age'),
	validations.number('age'),
	validations.required('weight'),
	validations.number('weight'),
	validations.oneOf('size', ['small', 'medium', 'large']),
	validations.oneOf('activity_level', ['low', 'mid', 'high']),
];
