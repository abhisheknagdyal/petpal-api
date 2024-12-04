import { type Request, type Response } from 'express';
import { User } from '../../database/models/auth/auth-model.js';
import { PetsModel } from '../../database/models/pets/my-pets-model.js';
import { getOneByField } from '../../database/crud.js';
import { SocialSignatureModel } from '../../database/models/social/social-signature-model.js';
import { IRequest } from '../../middleware.js';
import { MessageModel } from '../../database/models/social/message-model.js';

const getAllUsersWithPetData = async (
	req: Request,
	res: Response
): Promise<void> => {
	const mySignature = await getOneByField(
		SocialSignatureModel,
		'userId',
		(req as IRequest).userToken.id
	);

	if (!mySignature) {
		res.status(404).json({ error: `User doesn't have a social signature` });
		return;
	}

	const userQuery = {
		isAdmin: false,
		isActive: true,
		isPersonnelGroomer: false,
		isPersonnelBoarder: false,
		subscriptionModel: 'gold',
		_id: {
			$nin: [
				(req as IRequest).userToken.id,
				...(mySignature.likes ? mySignature.likes : []),
				...(mySignature.unlikes ? mySignature.unlikes : []),
				...(mySignature.matches ? mySignature.matches : []),
			],
		},
	};

	const [count, users] = await Promise.all([
		User.countDocuments(userQuery),
		User.find(userQuery)
			.skip(+req.query.skip! || 0)
			.limit(10)
			.select('details.name details.photo_url username'),
	]);

	const userIds = users.map((item) => item._id);
	const pets = await PetsModel.find({ owner_id: { $in: userIds } }).select(
		'owner_id name size species breed age gender photo_url'
	);

	const map = userIds.map((id) => {
		const userData = users.find((u) => u._id === id);
		const petData = pets.filter((p) => p.owner_id === (id as any).toString());
		return {
			...(userData as any)?._doc,
			pets: petData,
		};
	});

	res.status(200).json({ count, results: map });
	return;
};

const likeUser = async (req: Request, res: Response): Promise<void> => {
	const likedUser = req.body.userId;
	const userId = (req as IRequest).userToken.id;
	const social = await SocialSignatureModel.findOne({ userId });
	const socialLikedUser = await SocialSignatureModel.findOne({
		userId: likedUser,
	});

	if (!social) {
		res
			.status(404)
			.json({ message: 'Social signature not found for the user.' });
		return;
	}

	if (social?.likes?.includes(likedUser)) {
		res.status(400).json({ message: 'User has already liked this user.' });
		return;
	}

	if (!socialLikedUser) {
		res
			.status(404)
			.json({ message: 'Social signature not found for the liked user.' });
		return;
	}

	social?.likes?.push(likedUser);
	await social.save();

	if (socialLikedUser?.likes?.includes(userId)) {
		social?.matches?.push(likedUser);
		socialLikedUser?.matches?.push(userId);

		await social.save();
		await socialLikedUser.save();

		res.status(200).json({ message: 'Match found' });
		return;
	}

	res.status(200).json({ message: 'User liked' });
	return;
};

const unlikeUser = async (req: Request, res: Response): Promise<void> => {
	const unlikedUser = req.body.userId;
	const userId = (req as IRequest).userToken.id;
	const social = await SocialSignatureModel.findOne({ userId });

	if (!social) {
		res
			.status(404)
			.json({ message: 'Social signature not found for the user.' });
		return;
	}

	if (social?.unlikes?.includes(unlikedUser)) {
		res.status(400).json({ message: 'User has already unliked this user.' });
		return;
	}

	social?.unlikes?.push(unlikedUser);
	await social.save();
	res.status(200).json({ message: 'User unliked' });
	return;
};

const unMatchUser = async (req: Request, res: Response): Promise<void> => {
	const unMatchedUser = req.body.userId;
	const userId = (req as IRequest).userToken.id;
	const social = await SocialSignatureModel.findOne({ userId });
	const socialUnMatchedUser = await SocialSignatureModel.findOne({
		userId: unMatchedUser,
	});

	if (!social) {
		res
			.status(404)
			.json({ message: 'Social signature not found for the user.' });
		return;
	}

	if (
		!social?.matches?.includes(unMatchedUser) &&
		!social?.breedingMatches?.includes(unMatchedUser)
	) {
		res.status(400).json({ message: 'User has already unmatched this user.' });
		return;
	}

	if (social?.matches?.includes(unMatchedUser)) {
		if (
			social?.matches?.includes(unMatchedUser) &&
			socialUnMatchedUser?.matches?.includes(userId)
		) {
			social?.matches?.splice(social?.matches?.indexOf(unMatchedUser), 1);
			socialUnMatchedUser?.matches?.splice(
				socialUnMatchedUser?.matches?.indexOf(userId),
				1
			);
			await social.save();
			await socialUnMatchedUser.save();

			res.status(200).json({ message: 'Unmatched' });
			return;
		}
	}

	if (social?.breedingMatches?.includes(unMatchedUser)) {
		if (
			social?.breedingMatches?.includes(unMatchedUser) &&
			socialUnMatchedUser?.breedingMatches?.includes(userId)
		) {
			social?.breedingMatches?.splice(
				social?.breedingMatches?.indexOf(unMatchedUser),
				1
			);
			socialUnMatchedUser?.breedingMatches?.splice(
				socialUnMatchedUser?.breedingMatches?.indexOf(userId),
				1
			);
			await social.save();
			await socialUnMatchedUser.save();

			res.status(200).json({ message: 'Unmatched' });
			return;
		}
	}

	res.status(400).json({ error: 'Some error occurred' });
	return;
};

const getStatus = async (req: Request, res: Response): Promise<void> => {
	const checkId = req.params.id;
	const userId = (req as IRequest).userToken.id;
	const social = await SocialSignatureModel.findOne({ userId });
	const socialCheckUser = await SocialSignatureModel.findOne({
		userId: checkId,
	});

	if (!social) {
		res
			.status(404)
			.json({ message: 'Social signature not found for the user.' });
		return;
	}

	if (!socialCheckUser) {
		res
			.status(404)
			.json({ message: 'Social signature not found for checkUser.' });
		return;
	}

	if (
		!social?.matches?.includes(checkId) &&
		!social?.breedingMatches?.includes(checkId)
	) {
		res.status(404).json({ message: 'match not found' });
		return;
	}

	const user = await User.findById(checkId).select(
		'details.name details.photo_url username'
	);

	res.status(200).json(user);
	return;
};

const getMessagesById = async (req: Request, res: Response): Promise<void> => {
	const senderId = (req as IRequest).userToken.id;
	const receiverId = req.params.id;

	const messages = await MessageModel.find({
		$or: [
			{ senderId: senderId, receiverId: receiverId },
			{ senderId: receiverId, receiverId: senderId },
		],
	}).sort({ timestamp: 1 });
	res.status(200).json(messages);
	return;
};

const getMyBreedingMatches = async (
	req: Request,
	res: Response
): Promise<void> => {
	const userId = (req as IRequest).userToken.id;
	const social = await SocialSignatureModel.findOne({ userId });

	if (!social) {
		res
			.status(404)
			.json({ message: 'Social signature not found for the user.' });
		return;
	}

	const userQuery = {
		_id: {
			$in: [...(social.breedingMatches ? social.breedingMatches : [])],
		},
	};

	const users = await User.find(userQuery).select(
		'details.name details.photo_url username'
	);

	const userIds = users.map((user) => user._id);
	const latestMessages = await MessageModel.find({
		$or: [
			{ senderId: { $in: userIds }, receiverId: userId },
			{ senderId: userId, receiverId: { $in: userIds } },
		],
	}).sort({ createdAt: -1 });

	const usersWithMessages = users.map((user) => {
		const message = latestMessages.find(
			(msg) =>
				msg.senderId.toString() === userId ||
				msg.receiverId.toString() === userId
		);
		return {
			...user.toObject(),
			latestMessage: message ? message.message : null,
			latestMessageSenderId: message ? message.senderId : null,
			messageDate: message ? message.createdAt : null,
		};
	});

	res.status(200).json(usersWithMessages);
	return;
};

const getMyMatches = async (req: Request, res: Response): Promise<void> => {
	const userId = (req as IRequest).userToken.id;
	const social = await SocialSignatureModel.findOne({ userId });

	if (!social) {
		res
			.status(404)
			.json({ message: 'Social signature not found for the user.' });
		return;
	}

	const userQuery = {
		_id: {
			$in: [...(social.matches ? social.matches : [])],
		},
	};

	const users = await User.find(userQuery).select(
		'details.name details.photo_url username'
	);

	const userIds = users.map((user) => user._id);
	const latestMessages = await MessageModel.find({
		$or: [
			{ senderId: { $in: userIds }, receiverId: userId },
			{ senderId: userId, receiverId: { $in: userIds } },
		],
	}).sort({ createdAt: -1 });

	const usersWithMessages = users.map((user) => {
		const message = latestMessages.find(
			(msg) =>
				msg.senderId.toString() === userId ||
				msg.receiverId.toString() === userId
		);
		return {
			...user.toObject(),
			latestMessage: message ? message.message : null,
			latestMessageSenderId: message ? message.senderId : null,
			messageDate: message ? message.createdAt : null,
		};
	});

	res.status(200).json(usersWithMessages);
	return;
};

const createBreedingMatch = async (
	req: Request,
	res: Response
): Promise<void> => {
	const breedMatchUser = req.body.userId;
	const userId = (req as IRequest).userToken.id;
	const social = await SocialSignatureModel.findOne({ userId });
	const socialBreedMatchUser = await SocialSignatureModel.findOne({
		userId: breedMatchUser,
	});

	if (!social) {
		res
			.status(404)
			.json({ message: 'Social signature not found for the user.' });
		return;
	}

	if (!socialBreedMatchUser) {
		res
			.status(404)
			.json({ message: 'Social signature not found for checkUser.' });
		return;
	}

	social?.breedingMatches?.push(breedMatchUser);
	socialBreedMatchUser?.breedingMatches?.push(userId);

	await social.save();
	await socialBreedMatchUser.save();

	res.status(200).json({ message: 'match created' });
	return;
};

export {
	getAllUsersWithPetData,
	likeUser,
	unlikeUser,
	unMatchUser,
	getStatus,
	getMessagesById,
	getMyMatches,
	createBreedingMatch,
	getMyBreedingMatches,
};
