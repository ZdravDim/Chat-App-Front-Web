import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

import axios from 'axios'

import './Main.css'
import { RiLogoutBoxLine } from "react-icons/ri";
import { IoSettingsOutline, IoSend, IoAdd } from "react-icons/io5";
import { BiExpandHorizontal } from "react-icons/bi";
import { MdDeleteOutline, MdOutlineDone } from "react-icons/md";


import { sendMessage, setMessageListener, removeMessageListener, joinRoom } from "../Socket.js"

import { v4 as uuidv4 } from 'uuid'

function Main({onNavigation}) {

	const navigate = useNavigate()
	const { phoneNumber } = "+381..." //from jwt
	const [showRooms, setShowRooms] = useState(true)
	const [message, setMessage] = useState("")
	const [settingsShow, setSettingsShow] = useState(false);
	const [createRoomShow, setCreateRoomShow] = useState(false);
	const [rooms, setRooms] = useState([])
	const [currentRoom, setCurrentRoom] = useState(null)
	const [createRoomName, setCreateRoomName] = useState('');
	const [emptyRoomName, setEmptyRoomName] = useState(false)
	const inputFieldReference = useRef(null);

	const [messageHistory, setMessageHistory] = useState([]);

	const handleMessage = (message) => {
		setMessageHistory(prevMessages => [...prevMessages, message]);
	};

	useEffect(() => {

		// retrieve rooms from firestore
		const data = {
			id: '1',
			phoneNumber: '+38164123456',
			message: 'This is a test message from someone to no one, bla bla bla bla this is a test message from no one to someone bla bla bla bla...'
		}
		setMessageHistory([data]);

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


	const createRoomVisible = () => { setCreateRoomShow(true) }
	const createRoomHide = () => { setCreateRoomShow(false) }

	const addRoom = (roomName) => {
		setRooms(prevRooms => [...prevRooms, {
			id: 1, // change to uuidv4
			name: roomName
		}])
	}

	const createRoom = () => { 

		if (createRoomName.length) {
			
			addRoom(createRoomName)

			setCreateRoomShow(false)
			setEmptyRoomName(false)
			setCreateRoomName('')
		}
		else setEmptyRoomName(true)

	 }

	const openRoom = (newRoom) => {
		joinRoom(currentRoom, newRoom)
		setCurrentRoom(newRoom)
	}

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
			<div className='w-8 text-center'>
				<RiLogoutBoxLine className='icon' onClick={logOut} />
				<IoSettingsOutline className='icon' onClick={settings}/>
				<IoAdd className='icon' onClick={() => { setEmptyRoomName(false); createRoomVisible()}}/>
				<BiExpandHorizontal className='icon' onClick={() => setShowRooms(!showRooms)}/>
			</div>

			{ showRooms &&
				<div className='h-100 w-25 text-white text-break text-center bg-custom-grey'>
				<h2 className='my-3'>Rooms</h2>
					{rooms.map((room) => (
						<div tabIndex={-1} onClick={() => openRoom(room["name"])} className='bg-success m-2 cursor-pointer'>
							{room["name"]}
						</div>
					))}
				</div>
			}

			<div className="d-flex flex-column h-100 flex-grow">
				<div className="flex-grow-1 mb-20">
					<div className='p-3'>
						{messageHistory.map((message) => (
							<div className='message-width'>
								<p style={{ paddingLeft: '1rem' }} className='text-white mb-0'>{message["phoneNumber"]}</p>
								<div key={message["id"]} className='text-white bg-custom-grey mb-1 mt-2 py-2 px-3 message-container'>
									{message["message"]}
								</div>
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

			<Modal 
				show={ createRoomShow }
				onHide={ createRoomHide }
				backdrop="static"
				keyboard={false}
				centered>

				<Modal.Header closeButton> 
					<Modal.Title>Create new Room</Modal.Title> 
				</Modal.Header>

				<Modal.Body>
					<Form.Control className='shadow-none' type="text" placeholder="Room name" onChange={ (event) => setCreateRoomName(event.target.value) } />
					{emptyRoomName && <p className='text-danger mb-0'>Room name can't be empty</p> }
				</Modal.Body>

				<Modal.Footer> 
					<MdOutlineDone className='settings-icon w-15' onClick={ createRoom }/> 
				</Modal.Footer>
			
			</Modal>	

		</div>

	)
}

export default Main