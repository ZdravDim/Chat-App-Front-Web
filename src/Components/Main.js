import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import axios from 'axios'

import './Main.css'
import { RiLogoutBoxLine } from "react-icons/ri";
import { socket } from '../Socket.js'
import { v4 as uuidv4 } from 'uuid'

function Main({onNavigation}) {

	const navigate = useNavigate()
	const { phoneNumber } = "..." //from jwt
	const [message, setMessage] = useState("")
	const [messageHistory, setMessageHistory] = useState([]);
	const inputFieldReference = useRef(null);

	const sendMessageToRoom = (event) => {
		event.preventDefault();

		if (!message.length) return
		const id = uuidv4()

		// Send message
		socket.emit('message', {
			phoneNumber: phoneNumber,
			message: message,
			id: id
		});
	
		// Clear the message input field after sending
		setMessage("");
		inputFieldReference.current.value = "";
	}

	// eslint-disable-next-line
	const [isConnected, setIsConnected] = useState(socket.connected);

	useEffect(() => {
		// Connect
		function onConnect() { setIsConnected(true); }
		// Push new message
		function handleIncomingMessage(newMessage) { setMessageHistory(prevMessages => [...prevMessages, newMessage]); }
		// Disconnect
		function onDisconnect() { setIsConnected(false); }

		socket.on('connect', onConnect);
		socket.on('message', handleIncomingMessage);
		socket.on('disconnect', onDisconnect);

		return () => {
			socket.off('connect', onConnect);
			socket.off('message', handleIncomingMessage);
			socket.off('disconnect', onDisconnect);
		};
	}, []);

	const logOut = () => {

		axios.get('http://localhost:3001/logout', { withCredentials: true })
		.then(function (response) {
			if (response.status === 200) {
				onNavigation()
				navigate("/login")
			}
		})
		.catch(function (error) {
			console.log(error);
		});
	}

	return (
		<div className='d-flex flex-row h-100 bg-dark'>
			<div className='w-3 text-center'>
				<RiLogoutBoxLine className='mt-3 text-white logout-icon' onClick={logOut} />
			</div>

			<div className='h-100 w-25 text-white text-break text-center bg-custom-grey'>
				<h2 className='my-2'>Rooms</h2>
				<p>{phoneNumber}</p> {/* TO DELETE */}
				{/* rooms here */}
			</div>

			<div className="d-flex flex-column h-100 w-72">
				<div className="flex-grow-1 mb-auto">
					<div className='p-2'>
						{messageHistory.map((message) => (
							<div key={message["id"]} className='text-white'>
								{message["phoneNumber"]}: {message["message"]}
							</div>
						))}
					</div>
				</div>
			
				<Form onSubmit={sendMessageToRoom} className='d-flex w-100 p-3'>
					<Form.Control
					ref={inputFieldReference}
					type="text"
					placeholder="Enter a message..."
					className="shadow-none rounded-0"
					onChange={(event) => setMessage(event.target.value)}
					/>  
					<Button type="submit" className="btn-success rounded-0">Send</Button>
				</Form>
			</div>
		</div>
	)
}

export default Main