import mongoose from 'mongoose';
import { Pet } from './my-pets-model.js';

type Adopt = Pet & { adoption_status: 'available' | 'pending' };

const petSchema = new mongoose.Schema<Adopt>(
	{
		name: { type: String, required: true },
		species: { type: String, required: true },
		breed: { type: String, required: true },
		age: { type: Number, required: true },
		gender: String,
		size: { type: String, enum: ['small', 'medium', 'large'] }, // small, medium, large
		color: String,
		weight: { type: Number, required: true },
		spayed_neutered: Boolean,
		vaccinated: Boolean,
		description: String,
		medical_conditions: String,
		last_checkup_date: Date,
		location: String,
		owner_id: String,
		good_with_children: Boolean,
		good_with_pets: Boolean,
		activity_level: { type: String, enum: ['low', 'mid', 'high'] }, // low, mid, high
		special_needs: String,
		photo_url: String,
		adoption_status: { type: String, enum: ['available', 'pending'] },
	},
	{ timestamps: true }
);

petSchema.pre('find', function () {
	this.sort({ createdAt: -1 });
});

export const AdoptionModel = mongoose.model<Adopt>('Adoption', petSchema);
