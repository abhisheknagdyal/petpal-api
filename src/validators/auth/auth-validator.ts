import validations from '../common.js';

export const selfRegistrationValidator = [
	validations.required('username'),
	validations.minMax('password', 4, 12),
	validations.email('email'),
];

export const userRegistrationValidator = [
	validations.required('username'),
	validations.email('email'),
];

export const activationValidator = [
	validations.required('password'),
	validations.required('id'),
	validations.required('key'),
];

export const loginValidator = [
	validations.email('email'),
	validations.minMax('password', 4, 12),
];

export const checkValidator = [
	validations.required('id'),
	validations.required('key'),
];

export const userUpdateValidator = [
	validations.required('name'),
	validations.required('contact'),
	validations.required('address'),
];

export const groomerBoarderValidator = [
	validations.required('name'),
	validations.required('contact'),
	validations.required('city'),
];

export const transporterValidator = [
	validations.required('name'),
	validations.required('contact'),
];
