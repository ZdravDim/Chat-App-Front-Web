import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

import axios from 'axios'

import './Main.css'
import { RiLogoutBoxLine, RiLoginBoxLine } from "react-icons/ri";
import { IoSettingsOutline, IoSend, IoAdd } from "react-icons/io5";
import { BiExpandHorizontal } from "react-icons/bi";
import { MdDeleteOutline, MdOutlineDone } from "react-icons/md";


import { sendMessage, setMessageListener, removeMessageListener, joinRoom, leaveRoom } from "../Socket.js"

import { v4 as uuidv4 } from 'uuid'

function Main({onNavigation}) {

	const navigate = useNavigate()

	const [userData, setUserData] = useState(null)

	const [showRooms, setShowRooms] = useState(true)

	const [message, setMessage] = useState("")

	const [settingsModal, setSettingsModal] = useState(false);
	const [createRoomModal, setCreateRoomModal] = useState(false);
	const [joinRoomModal, setJoinRoomModal] = useState(false);

	const [rooms, setRooms] = useState([])
	const [currentRoom, setCurrentRoom] = useState(null)

	const [RoomModalName, setRoomModalName] = useState('');
	const [emptyRoomName, setEmptyRoomName] = useState(false)
	
	const inputFieldReference = useRef(null);

	const [messageHistory, setMessageHistory] = useState([]);

	const handleMessage = (message) => {
		setMessageHistory(prevMessages => [...prevMessages, message]);
	};

	useEffect(() => {

		async function fetchUserData() {
			try {
				const response = await axios.post('http://localhost:3001/api/user-data', null, { withCredentials: true })
				if (response.status === 200) setUserData(response.data)
			}
			catch(error) {
				console.log(error.message)
			}
		}

		async function fetchUserRooms() {
			try {
				const response = await axios.post('http://localhost:3001/api/user-rooms', null, { withCredentials: true })
				if (response.status === 200) setRooms(response.data.rooms)
			}
			catch(error) {
				console.log(error.message)
			}
		}

		fetchUserData()
		fetchUserRooms()

		// retrieve rooms from firestore

		setMessageListener(handleMessage);

		return () => { removeMessageListener(handleMessage); };

	  }, []);

	const sendMessageToRoom = (event) => {
		event.preventDefault();

		if (!message.length) return
		const id = uuidv4()

		// send to socket
		sendMessage(currentRoom, message, userData.phoneNumber, id)
	
		// Clear the message input field after sending
		setMessage("");
		inputFieldReference.current.value = "";
	}

	const addRoom = (roomName) => {
		setRooms(prevRooms => [...prevRooms, roomName])
	}

	const JoinOrCreateRoom = async(createRoom = false) => {

		if (RoomModalName.length) {
			
			const postData = { roomName: RoomModalName }

			try {
				const response = await axios.post('http://localhost:3001/api/room-exists', postData, { withCredentials: true })

				if (response.data.roomExists) {

					if (createRoom) {
						// ...
						alert("Soba vec postoji")
						return
					}
					joinRoom(currentRoom, RoomModalName, userData.phoneNumber)
				}
				else {

					if (!createRoom) {
						// ...
						alert("Soba ne postoji")
						return
					}
					joinRoom(currentRoom, RoomModalName, userData.phoneNumber, true)
				}

				// setMessageHistory mora nekako

				addRoom(RoomModalName)
				setCurrentRoom(RoomModalName)
			}
			catch(error) {
				console.log(error.message)
			}
			finally {
				setCreateRoomModal(false)
				setJoinRoomModal(false)
				setEmptyRoomName(false)
				setRoomModalName('')
			}
		}
		else setEmptyRoomName(true)

	}

	const leaveCurrentRoom = () => {
		leaveRoom(userData.phoneNumber, currentRoom)
		setRooms(rooms => rooms.filter(room => room !== currentRoom))
		setCurrentRoom(null)
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
				<RiLoginBoxLine className='icon' onClick={ () => { setEmptyRoomName(false); setJoinRoomModal(true) }}/>
				<IoSettingsOutline className='icon' onClick= { () => setSettingsModal(true) }/>
				<IoAdd className='icon' onClick={() => { setEmptyRoomName(false); setCreateRoomModal(true)}}/>
				<BiExpandHorizontal className='icon' onClick={() => setShowRooms(!showRooms)}/>
			</div>

			{ showRooms &&
				<div className='h-100 w-25 text-white text-break text-center bg-custom-grey'>
				<h2 className='my-3'>Rooms</h2>
					{rooms.map((room) => (
						<div key={room} tabIndex={-1} onClick={() => openRoom(room)} className='bg-success m-2 cursor-pointer'>
							{room}
						</div>
					))}
				</div>
			}

			{ currentRoom &&
				<div className="d-flex flex-column h-100 flex-grow text-white">
					<div className="p-3 flex-grow-1 mb-20">
						<div style={{height: 60}}>
							<h3 className='text-center d-inline-block'>{currentRoom}</h3>
							<Button style={{height: 40, width: 70, float: 'right'}} className='btn btn-danger rounded-0 d-inline-block' onClick={() => leaveCurrentRoom()}>Leave</Button>
						</div>

						<div className='pt-3'>
							{messageHistory.map((message) => (
								<div className='message-width'>
									<p style={{ paddingLeft: '1rem' }} className='mb-0'>{message.phoneNumber}</p>
									<div key={message.id} className='text-white bg-custom-grey mb-1 mt-2 py-2 px-3 message-container'>
										{message.message}
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
			}

			<Modal 
				show={ settingsModal }
				onHide={ () => setSettingsModal(false) }
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
					<Button className='btn-success' onClick={() => setSettingsModal(false)}>Close</Button>
				</Modal.Footer>
				
			</Modal>

			<Modal 
				show={ createRoomModal }
				onHide={ () => setCreateRoomModal(false) }
				backdrop="static"
				keyboard={false}
				centered>

				<Modal.Header closeButton> 
					<Modal.Title>Create new Room</Modal.Title> 
				</Modal.Header>

				<Modal.Body>
					<Form.Control className='shadow-none' type="text" placeholder="Room name" onChange={ (event) => setRoomModalName(event.target.value) } />
					{emptyRoomName && <p className='text-danger mb-0'>Room name can't be empty</p> }
				</Modal.Body>

				<Modal.Footer> 
					<MdOutlineDone className='settings-icon w-15' onClick={ () => JoinOrCreateRoom(true) }/> 
				</Modal.Footer>
			
			</Modal>	


			<Modal 
				show={ joinRoomModal }
				onHide={ () => setJoinRoomModal(false) }
				backdrop="static"
				keyboard={false}
				centered>

				<Modal.Header closeButton> 
					<Modal.Title>Join new Room</Modal.Title> 
				</Modal.Header>

				<Modal.Body>
					<Form.Control className='shadow-none' type="text" placeholder="Room name" onChange={ (event) => setRoomModalName(event.target.value) } />
					{emptyRoomName && <p className='text-danger mb-0'>Room name can't be empty</p> }
				</Modal.Body>

				<Modal.Footer> 
					<MdOutlineDone className='settings-icon w-15' onClick={ () => JoinOrCreateRoom() }/> 
				</Modal.Footer>
			
			</Modal>	



			
		</div>

	)
}

export default Main