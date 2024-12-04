import { type Response, type Request } from 'express';
import { getMany } from '../../database/crud.js';
import { User } from '../../database/models/auth/auth-model.js';

const getUsers = async (req: Request, res: Response): Promise<void> => {
	const [count, users] = await getMany(
		User,
		{
			$or: [
				{ isAdmin: true },
				{ isPersonnelGroomer: true },
				{ isPersonnelBoarder: true },
				{ isPersonnelTransporter: true },
			],
		},
		'-password',
		+req.query.skip!
	);
	res.status(200).json({ count, results: users });
	return;
};

export { getUsers };
