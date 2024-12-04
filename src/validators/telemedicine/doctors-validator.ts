import validations from '../common.js';

export const doctorsValidator = [
	validations.required('name'),
	validations.required('specialization'),
	validations.required('licenseNumber'),
	validations.email('contact.email'),
	validations.required('contact.phone'),
	validations.required('clinicAddress'),
	validations.required('experienceYears'),
	validations.number('experienceYears'),
];
