import { type Request, type Response } from 'express';
import {
	createOne,
	deleteOne,
	getOne,
	updateOne,
} from '../../database/crud.js';
import { ProductModel } from '../../database/models/products/products-model.js';
import { CartModel } from '../../database/models/products/cart-model.js';
import mongoose from 'mongoose';
import imageUploader from '../../utils/image-uploader.js';

const mapSortOrder: { [k: string]: -1 | 1 } = {
	highToLow: -1,
	lowToHigh: 1,
};

const getProducts = async (req: Request, res: Response): Promise<void> => {
	const { category, sort, petType } = req.query;
	const sortOrder = mapSortOrder[sort as string];
	const query = {
		...(category ? { category } : {}),
		...(petType ? { petType } : {}),
	};
	const [count, documents] = await Promise.all([
		ProductModel.countDocuments(query),
		ProductModel.find(query)
			.sort(sortOrder ? { price: sortOrder } : {})
			.select('-location -owner_id')
			.skip(Number(req.query.skip) || 0)
			.limit(10),
	]);
	res.status(200).json({ count, results: documents });
	return;
};

const getSingleProduct = async (req: Request, res: Response): Promise<void> => {
	const response = await getOne(ProductModel, req.params.id);
	if (!response) {
		res.status(404).json({ error: `Product not found: ${req.params.id}` });
		return;
	}
	res.status(200).json(response);
	return;
};

const getFilters = async (req: Request, res: Response): Promise<void> => {
	const categories = await ProductModel.distinct('category');
	const petType = await ProductModel.distinct('petType');
	res.status(200).json({ categories: categories, petType: petType });
	return;
};

const createProduct = async (req: Request, res: Response): Promise<void> => {
	const imageUrls = await Promise.all(
		req.body.images.map(async (image: string) => {
			return await imageUploader(image);
		})
	);
	const filteredUrls = imageUrls.filter(Boolean);
	const response = await createOne(ProductModel, {
		...req.body,
		images: filteredUrls,
	});
	res.status(201).json({ message: `Product created: ${response._id}` });
	return;
};

const updateProduct = async (req: Request, res: Response): Promise<void> => {
	const existingProduct = await getOne(ProductModel, req.params.id);
	if (!existingProduct) {
		res.status(404).json({ error: `Product not found: ${req.params.id}` });
		return;
	}
	const images = req.body.images || [];
	const imageUrls = await Promise.all(
		images?.map(async (image: string) => {
			return await imageUploader(image);
		})
	);
	const filteredUrls = imageUrls.filter(Boolean);
	await updateOne(ProductModel, req.params.id, {
		...existingProduct._doc,
		...req.body,
		...(filteredUrls.length ? { images: filteredUrls } : {}),
	});
	res.status(200).json({ message: `Pet updated: ${existingProduct._id}` });
	return;
};

const deleteProduct = async (req: Request, res: Response): Promise<void> => {
	const existingProduct = await getOne(ProductModel, req.params.id);
	if (!existingProduct) {
		res.status(404).json({ error: `Product not found: ${req.params.id}` });
		return;
	}
	await deleteOne(ProductModel, req.params.id);
	res.status(200).json({ message: `Product Deleted: ${existingProduct._id}` });
	return;
};

async function updateProductStockWithTransaction(cartId: string) {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const cart = await CartModel.findById(cartId)
			.populate('items.product')
			.session(session);

		if (!cart) {
			return `Cart with ID ${cartId} not found`;
		}

		for (const item of cart.items) {
			const productId = item.product._id;
			const quantity = item.quantity;

			const product = await ProductModel.findById(productId).session(session);

			if (!product) {
				return `Product with ID ${productId} not found`;
			}

			if (product.stock < quantity) {
				return `Not enough stock for product ${product.name}`;
			}

			product.stock -= quantity;
			await product.save({ session });
		}

		await session.commitTransaction();
	} catch (error) {
		// Rollback the transaction if an error occurs
		await session.abortTransaction();
		return 'Error during transaction, changes rolled back:';
	} finally {
		await session.endSession();
	}
	return true;
}

export {
	getProducts,
	getSingleProduct,
	getFilters,
	createProduct,
	updateProduct,
	deleteProduct,
	updateProductStockWithTransaction,
};
