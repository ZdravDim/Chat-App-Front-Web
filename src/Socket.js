import { io } from 'socket.io-client';

let socket = null;

const socket_connect = () => {
    const URL = 'http://localhost:3001';

    socket = io(URL);

    socket.on('message', handleIncomingMessage);
    socket.on("connect_error", onError);
}

export function joinRoom(oldRoom, newRoom) {
    // oldRoom can be null!!!!!
    // leave oldRoom and join newRoom
    alert(oldRoom + " " + newRoom)
}

export const socket_disconnect = () => {
    if (socket) socket.disconnect()
}

export function sendMessage(message, phoneNumber, id) {
    if (socket) {
		socket.emit('message', {
			phoneNumber: phoneNumber,
			message: message,
			id: id
		});
    }
    else console.log("Error: Message not sent (socket = null).")
}

let messageListener = null;

// Show new message to screen (push to messageHistory array)
function handleIncomingMessage(newMessage) { if (messageListener && typeof messageListener === 'function') messageListener(newMessage) }

//handle connections error
function onError(error) { console.log(error.message) }

export function setMessageListener(listener) { messageListener = listener }
export function removeMessageListener() { messageListener = null }

export default socket_connect