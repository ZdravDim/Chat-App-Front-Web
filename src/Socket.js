import axios from 'axios';
import { io } from 'socket.io-client';

let socket = null;

const socket_connect = () => {
    const URL = 'http://localhost:3001';

    socket = io(URL);

    socket.on('message', handleIncomingMessage);
    socket.on("connect_error", onError);
}

export async function joinRoom(oldRoom, newRoom, phoneNumber, createRoom) {
    if (socket) {
        if (oldRoom) socket.emit('leave', phoneNumber, oldRoom, false)
        socket.emit('join', phoneNumber, newRoom, createRoom)

        try {
            const response = await axios.post("http://localhost:3001/api/room-messages", newRoom, { withCredentials: true })
            if (response.status === 200) return response.data.messagesArray
            return []
        } 
        catch(error) {
            console.log("Error loading room messages" + error.message)
            return []
        }
    }
    else console.log("Cannot join room: Socket is null!")
}

export function leaveRoom(phoneNumber, roomName) {
    if (socket) socket.emit('leave', phoneNumber, roomName, true)
    else console.log("Cannot leave room: Socket is null!")
}

export const socket_disconnect = () => {
    if (socket) socket.disconnect()
}

export function sendMessage(roomName, messageBody, senderNumber) {
    if (socket) {
		socket.emit('message-to-room', {
            roomName: roomName,
			senderNumber: senderNumber,
			messageBody: messageBody
		});
    }
    else console.log("Error: Message not sent (socket = null).")
}

let messageListener = null

// Show new message to screen (push to messageHistory array)
function handleIncomingMessage(newMessage) { if (messageListener && typeof messageListener === 'function') messageListener(newMessage) }

//handle connections error
function onError(error) { console.log(error.message) }

export function setMessageListener(listener) { messageListener = listener }
export function removeMessageListener() { messageListener = null }

export default socket_connect