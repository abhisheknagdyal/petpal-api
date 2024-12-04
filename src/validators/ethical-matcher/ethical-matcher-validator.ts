import validations from '../common.js';

export const ethicalMatcherValidator = [
	validations.required('myPet'),
	validations.required('potentialPet'),
];
