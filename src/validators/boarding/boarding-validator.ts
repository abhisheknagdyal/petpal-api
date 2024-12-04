import validations from '../common.js';

export const boardingValidator = [
	validations.required('petType'),
	validations.required('petId'),
	validations.required('timeSlot'),
];
