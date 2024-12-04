import mongoose, { type Document } from 'mongoose';
import { DocumentResult } from '../../common.js';
import { CartSchema } from '../products/cart-model.js';

export type Orders = Document &
	DocumentResult<any> & {
		invoiceId: string;
		cart: any;
	};

const ordersSchema = new mongoose.Schema<Orders>(
	{
		cart: CartSchema,
		invoiceId: { type: String, required: true },
	},
	{ timestamps: true }
);

ordersSchema.pre('find', function () {
	this.sort({ createdAt: -1 });
});

export const OrdersModel = mongoose.model<Orders>('Orders', ordersSchema);
