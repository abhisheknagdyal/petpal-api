import { type Document, type Model } from 'mongoose';

export const createOne = async <T extends Document>(
	model: Model<T>,
	data: Partial<T>
) => {
	try {
		return await model.create(data);
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const findCombination = async <T extends Document>(
	model: Model<T>,
	data: any
) => {
	try {
		return await model.findOne(data);
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const createMany = async <T extends Document>(
	model: Model<T>,
	data: Partial<T>[]
) => {
	try {
		return await model.insertMany(data);
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const getMany = async <T extends Document>(
	model: Model<T>,
	query = {},
	excludeField?: string,
	skip: number = 0
) => {
	try {
		const [documents, count] = await Promise.all([
			model.find(query, excludeField).skip(skip).limit(10),
			model.countDocuments(query),
		]);
		return [count, documents];
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const getOne = async <T extends Document>(
	model: Model<T>,
	id: string
) => {
	try {
		return await model.findById(id);
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const getOneByField = async <T extends Document>(
	model: Model<T>,
	field: any,
	query: any
) => {
	try {
		return await model.findOne({ [field]: query });
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const updateOne = async <T extends Document>(
	model: Model<T>,
	id: string,
	data = {}
) => {
	try {
		return await model.findByIdAndUpdate(id, data, {
			new: true,
			runValidators: true,
		});
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const deleteOne = async <T extends Document>(
	model: Model<T>,
	id: string
) => {
	try {
		return await model.findByIdAndDelete(id);
	} catch (error: any) {
		throw new Error(error.message);
	}
};
