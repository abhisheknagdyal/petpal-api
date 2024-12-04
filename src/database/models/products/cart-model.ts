import mongoose, { Document, Schema } from 'mongoose';

type ICartItem = {
	product: mongoose.Types.ObjectId;
	quantity: number;
	color?: string;
	size?: string;
};

export type ICart = Document & {
	user: string;
	items: ICartItem[];
	createdAt: Date;
	updatedAt: Date;
};

export const CartItemSchema = new Schema<ICartItem>({
	product: {
		type: Schema.Types.ObjectId,
		ref: 'Product',
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
		default: 1,
	},
	color: {
		type: String,
		required: false,
	},
	size: {
		type: String,
		required: false,
	},
});

export const CartSchema = new Schema<ICart>(
	{
		user: { type: String },
		items: [CartItemSchema],
	},
	{ timestamps: true }
);

export const CartModel = mongoose.model<ICart>('Cart', CartSchema);
