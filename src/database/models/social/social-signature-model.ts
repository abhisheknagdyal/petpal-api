import mongoose, { type Document } from 'mongoose';
import { DocumentResult } from '../../common.js';

type SocialSchema = Document &
	DocumentResult<any> & {
		userId: any;
		likes?: any[];
		unlikes?: any[];
		matches?: any[];
		breedingMatches?: any[];
	};

const socialSchema = new mongoose.Schema<SocialSchema>({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	unlikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	breedingMatches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

export const SocialSignatureModel = mongoose.model(
	'Social Signature',
	socialSchema
);
