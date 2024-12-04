import validations from '../common.js';

export const groomerValidator = [
	validations.required('petType'),
	validations.required('petId'),
	validations.required('timeSlot'),
];
