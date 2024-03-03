import axios from 'axios'
import { io } from 'socket.io-client'

let socket = null
let messageListener = null
let roomListener = null

const socket_connect = () => {
    const URL = 'http://localhost:3001'

    socket = io(URL)

    socket.on('message', (newMessage) => {
        if (messageListener && typeof messageListener === 'function') messageListener(newMessage)
    })

    socket.on('update-rooms', (phoneNumber, roomName) => {
        if (roomListener && typeof roomListener === 'function') roomListener(phoneNumber, roomName)  
    })

    socket.on("connect_error", (error) => { console.log("Error initiating WebSocket connection: " + error.message) })
}

export async function joinRoom(oldRoom, newRoom, phoneNumber, createRoom) {
    if (socket) {
        if (oldRoom) socket.emit('leave', phoneNumber, oldRoom, false)
        socket.emit('join', phoneNumber, newRoom, createRoom)

        try {
            const response = await axios.post("http://localhost:3001/api/room-messages", { roomName: newRoom }, { withCredentials: true })
            if (response.status === 200) return response.data.messagesArray
            return []
        } 
        catch(error) {
            console.log("Error loading room messages" + error.message)
            return []
        }
    }
    console.log("Cannot join room: Socket is null!")
    return []
}

export function leaveRoom(phoneNumber, roomName) {
    if (socket) socket.emit('leave', phoneNumber, roomName, true)
    else console.log("Cannot leave room: Socket is null!")
}

export const socket_disconnect = () => {
    if (socket) socket.disconnect()
}

export function sendMessage(roomName, messageBody, senderNumber, senderColor) {
    if (socket) {
		socket.emit('message-to-room', {
            roomName: roomName,
			senderNumber: senderNumber,
            senderColor: senderColor,
			messageBody: messageBody
		})
    }
    else console.log("Error: Message not sent (socket = null).")
}

export function setMessageListener(listener) { messageListener = listener }
export function removeMessageListener() { messageListener = null }

export function setRoomListener(listener) { roomListener = listener }
export function removeRoomListener() { roomListener = null }

export default socket_connect