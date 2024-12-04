import { type Server, type Socket } from 'socket.io';
import { chatInitializer } from '../utils/gpt-config.js';
import { PetsModel } from '../database/models/pets/my-pets-model.js';
import { getOne } from '../database/crud.js';
import { socketMiddleware } from '../middleware.js';
import { MessageModel } from '../database/models/social/message-model.js';

const usersToSocketMap = new Map();
const petDataSocketMap = new Map();

const handleChatSocketConnection = (io: Server) => {
	io.use(socketMiddleware);
	io.on('connection', async (socket: Socket) => {
		socket.on('join', (userId) => {
			usersToSocketMap.set(userId, socket.id);
		});

		socket.on('register', async (petId) => {
			const petData = await getOne(PetsModel, petId);
			if (!petData) {
				socket.disconnect();
			}
			petDataSocketMap.set(socket.id, petData);
		});

		socket.on(
			'private_message',
			({ senderId, receiverId, message, createdAt }) => {
				const receiverSocketId = usersToSocketMap.get(receiverId);
				if (receiverSocketId) {
					io.to(receiverSocketId).emit('private_message', {
						senderId,
						message,
						createdAt,
					});
				}
				const newMessage = new MessageModel({ senderId, receiverId, message });
				newMessage.save(); // optimistic save
			}
		);

		socket.on('typing', ({ receiverId }) => {
			const receiverSocketId = usersToSocketMap.get(receiverId);
			if (receiverSocketId) {
				io.to(receiverSocketId).emit('typing');
			}
		});

		socket.on('stop-typing', ({ receiverId }) => {
			const receiverSocketId = usersToSocketMap.get(receiverId);
			if (receiverSocketId) {
				io.to(receiverSocketId).emit('stop-typing');
			}
		});

		socket.on('user-event', async (messageContext: [], message: string) => {
			try {
				const petData = petDataSocketMap.get(socket.id);
				const chat = await chatInitializer(messageContext, petData);
				const gptResponse = await chat.sendMessage(message);
				socket.emit('bot-event', gptResponse);
			} catch (error) {
				socket.emit('bot-event', {
					error: 'An error occurred while processing your message.',
				});
			}
		});

		socket.on('disconnect', async () => {
			for (const [userId, socketId] of usersToSocketMap.entries()) {
				if (socketId === socket.id) {
					usersToSocketMap.delete(userId);
					break;
				}
			}
			for (const [socketId] of petDataSocketMap.entries()) {
				if (socketId === socket.id) {
					petDataSocketMap.delete(socket.id);
					break;
				}
			}
		});
	});
};

export default handleChatSocketConnection;
