import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

import axios from 'axios'

import './Main.css'
import { RiLogoutBoxLine } from "react-icons/ri";
import { IoSettingsOutline, IoSend } from "react-icons/io5";
import { BiExpandHorizontal } from "react-icons/bi";
import { MdDeleteOutline } from "react-icons/md";

import { sendMessage, setMessageListener, removeMessageListener } from "../Socket.js"

import { v4 as uuidv4 } from 'uuid'

function Main({onNavigation}) {

	const navigate = useNavigate()
	const { phoneNumber } = "+381..." //from jwt
	const [message, setMessage] = useState("")
	const [settingsShow, setSettingsShow] = useState(false);
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


	const settings = () => { setSettingsShow(true) }
	const settingsClose = () => { setSettingsShow(false) }

	const deleteAccount = async() => { 
		
		try {

			// call /auth to get new access_token if it expired before trying to delete to avoid bugs
			await axios.post('http://localhost:3001/api/auth', null, { withCredentials: true });
			
			const response = await axios.delete('http://localhost:3001/api/delete-account', { withCredentials: true })

			if (response.status === 200) {
				onNavigation()
				navigate("/login")
			}

		} catch(error) { console.log(error.message) }

	}

	const chatView = () => {
		// expand or hide -> adapt chat width  
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
				<RiLogoutBoxLine className='icon' onClick={logOut} />
				<IoSettingsOutline className='icon' onClick={settings}/>
				<BiExpandHorizontal className='icon' onClick={chatView}/>
			</div>

			<div className='h-100 w-25 text-white text-break text-center bg-custom-grey'>
				<h2 className='my-2'>Rooms</h2>
				{/* rooms here */}
			</div>

			<div className="d-flex flex-column h-100 w-72">
				<div className="flex-grow-1 mb-20">
					<div className='p-3'>
						{messageHistory.map((message) => (
							<div key={message["id"]} className='text-white bg-custom-grey mb-1 mt-2 message-container'>
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
					<Button type="submit" className="btn-success rounded-0"><IoSend className='text-white m-1'/></Button>
				</Form>
			</div>

			<Modal 
				show={ settingsShow }
				onHide={ settingsClose }
				backdrop="static"
				keyboard={false}
				centered>

				<Modal.Header closeButton> 
					<Modal.Title>Settings</Modal.Title> 
				</Modal.Header>

				<Modal.Body>
					<div className='d-flex flex-row w-100 bg-grey'>
						<p className='w-85 m-0'>Delete your account.</p>
						<MdDeleteOutline className='settings-icon w-15' onClick={deleteAccount}/>
					</div>
        		</Modal.Body>

				<Modal.Footer>
					<Button className='btn-success' onClick={settingsClose}>Close</Button>
				</Modal.Footer>
				
			</Modal>
		</div>

	)
}

export default Main