import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import axios from 'axios'

import './Main.css'
import { RiLogoutBoxLine } from "react-icons/ri";

import { sendMessage, setMessageListener, removeMessageListener } from "../Socket.js"

import { v4 as uuidv4 } from 'uuid'

function Main({onNavigation}) {

	const navigate = useNavigate()
	const { phoneNumber } = "+381..." //from jwt
	const [message, setMessage] = useState("")
	const inputFieldReference = useRef(null);

	const [messageHistory, setMessageHistory] = useState([]);

	const handleMessage = (message) => {
		setMessageHistory(prevMessages => [...prevMessages, message]);
	};

	useEffect(() => {

		setMessageListener(handleMessage);

		return () => { removeMessageListener(handleMessage); };

	  }, []);

	const sendMessageToRoom = (event) => {
		event.preventDefault();

		if (!message.length) return
		const id = uuidv4()

		// send to socket
		sendMessage(message, phoneNumber, id)
	
		// Clear the message input field after sending
		setMessage("");
		inputFieldReference.current.value = "";
	}

	const logOut = async() => {

		try {

			const response = await axios.get('http://localhost:3001/api/logout', { withCredentials: true })

			if (response.status === 200) {
				onNavigation()
				navigate("/login")
			}

		} catch(error) { console.log(error.message) }

	}

	return (
		<div className='d-flex flex-row h-100 bg-dark'>
			<div className='w-3 text-center'>
				<RiLogoutBoxLine className='mt-3 text-white logout-icon' onClick={logOut} />
			</div>

			<div className='h-100 w-25 text-white text-break text-center bg-custom-grey'>
				<h2 className='my-2'>Rooms</h2>
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