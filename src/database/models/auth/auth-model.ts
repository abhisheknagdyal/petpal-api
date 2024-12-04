import mongoose, { type Document } from 'mongoose';

export type User = Document & {
	username: string;
	password: string;
	email: string;
	isActive: boolean;
	isAdmin: boolean;
	isPersonnelBoarder: boolean;
	isPersonnelGroomer: boolean;
	isPersonnelTransporter: boolean;
	subscriptionModel: 'basic' | 'plus' | 'gold';
	subscriptionRefId: any;
	details: {
		name: string;
		contact: string;
		address: string;
	};
};

const userSchema = new mongoose.Schema<User>(
	{
		username: { type: String, required: true },
		password: { type: String, required: true },
		email: { type: String, unique: true, required: true },
		isActive: Boolean,
		isAdmin: Boolean,
		isPersonnelBoarder: Boolean,
		isPersonnelGroomer: Boolean,
		isPersonnelTransporter: Boolean,
		subscriptionModel: {
			type: String,
			required: true,
			enum: ['basic', 'plus', 'gold'],
		},
		subscriptionRefId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Subscriptions',
		},
		details: { type: Object },
	},
	{ timestamps: true }
);

userSchema.pre('find', function () {
	this.sort({ createdAt: -1 });
});

export const User = mongoose.model<User>('User', userSchema);
