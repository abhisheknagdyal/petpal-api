import { body, param } from 'express-validator';

const validations = {
	paramId: (field: string) =>
		param(field).isMongoId().withMessage(`${field} is not a valid mongo Id`),
	required: (field: string) =>
		body(field).notEmpty().withMessage(`${field} is required`),
	number: (field: string) => body(field).isNumeric(),
	email: (field: string) =>
		body(field)
			.notEmpty()
			.withMessage(`${field} is required`)
			.isEmail()
			.withMessage(`Invalid ${field}`),
	minMax: (field: string, min: number, max: number) =>
		body(field)
			.notEmpty()
			.withMessage(`${field} is required`)
			.isLength({ min, max })
			.withMessage(`${field} character limit not satisfied`),
	oneOf: (field: string, list: any[]) =>
		body(field)
			.notEmpty()
			.withMessage(`${field} is required`)
			.isIn(list)
			.withMessage(`${field} must be one of ${list}`),
	nonEmptyArray: (field: string) =>
		body(field)
			.notEmpty()
			.withMessage(`${field} is required`)
			.isArray()
			.withMessage(`${field} must be an array`)
			.custom((arr) => {
				if (arr.length === 0) {
					throw new Error(`${field} array should not be empty`);
				}
			}),
};

export const idValidator = (field: string) => validations.paramId(field);

export default validations;
