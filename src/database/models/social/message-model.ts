import mongoose, { type Document } from 'mongoose';
import { DocumentResult } from '../../common.js';

type Message = Document &
	DocumentResult<any> & {
		senderId: string;
		receiverId: string;
		message: string;
	};

const messageSchema = new mongoose.Schema<Message>(
	{
		senderId: {
			type: String,
			required: true,
		},
		receiverId: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

export const MessageModel = mongoose.model<Message>('Messages', messageSchema);
