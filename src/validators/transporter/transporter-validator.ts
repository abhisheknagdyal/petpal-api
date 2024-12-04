import validations from '../common.js';

export const transporterValidator = [
	validations.required('petId'),
	validations.required('locationFrom'),
	validations.required('locationTo'),
	validations.required('pickUpDate'),
];
