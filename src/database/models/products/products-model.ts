import mongoose, { type Document } from 'mongoose';
import { DocumentResult } from '../../common.js';

type Product = Document &
	DocumentResult<any> & {
		name: string;
		description: string;
		category: 'Food' | 'Toys' | 'Accessories' | 'Grooming' | 'Healthcare';
		price: number;
		stock: number;
		brand?: string;
		petType: 'Dog' | 'Cat' | 'Bird' | 'Reptile' | 'Fish' | 'Small Animal';
		isFeatured?: boolean;
		images?: string[];
		rating: number;
		sizesAvailable?: string[];
		colorsAvailable?: string[];
	};

const productSchema = new mongoose.Schema<Product>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			enum: ['Food', 'Toys', 'Accessories', 'Grooming', 'Healthcare'],
			required: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		stock: {
			type: Number,
			required: true,
			min: 0,
		},
		brand: {
			type: String,
			trim: true,
		},
		petType: {
			type: String,
			enum: ['Dog', 'Cat', 'Bird', 'Reptile', 'Fish', 'Small Animal'],
			required: true,
		},
		rating: {
			type: Number,
			min: 0,
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
		images: [
			{
				type: String,
			},
		],
		sizesAvailable: [
			{
				type: String,
			},
		],
		colorsAvailable: [
			{
				type: String,
			},
		],
	},
	{ timestamps: true }
);

productSchema.pre('find', function () {
	this.sort({ createdAt: -1 });
});

export const ProductModel = mongoose.model<Product>('Product', productSchema);
