import mongoose, { Document, Schema, Model } from 'mongoose';

type IWishlistItem = {
	product: mongoose.Types.ObjectId;
};

type IWishlist = Document & {
	user: string;
	items: IWishlistItem[];
};

const wishlistItemSchema = new Schema<IWishlistItem>({
	product: {
		type: Schema.Types.ObjectId,
		ref: 'Product',
		required: true,
	},
});

const wishlistSchema = new Schema<IWishlist>(
	{
		user: { type: String },
		items: [wishlistItemSchema],
	},
	{ timestamps: true }
);

export const WishlistModel = mongoose.model<IWishlist>(
	'Wishlists',
	wishlistSchema
);
