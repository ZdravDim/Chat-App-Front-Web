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

function Main({onNavigation}) {

	const navigate = useNavigate()

	const [userData, setUserData] = useState(null)

	const [showRooms, setShowRooms] = useState(true)

	const [rooms, setRooms] = useState([])
	const [currentRoom, setCurrentRoom] = useState(null)

	const [settingsModal, setSettingsModal] = useState(false);
	const [createRoomModal, setCreateRoomModal] = useState(false);
	const [joinRoomModal, setJoinRoomModal] = useState(false);

	const [RoomModalName, setRoomModalName] = useState('');
	const [emptyRoomName, setEmptyRoomName] = useState(false)
	const [roomNameError, setRoomNameError] = useState(false)
	
	const inputFieldReference = useRef(null);
	const messageBodyRef = useRef(null);

	const [maxHeight, setMaxHeight] = useState(window.innerHeight);

	const [message, setMessage] = useState("")
	const [messageHistory, setMessageHistory] = useState([]);

	const handleMessage = (message) => { setMessageHistory(prevMessages => [...prevMessages, message]) };

	const moveScrollBarDown = () => {
		if (messageBodyRef.current) {
			const { scrollHeight, clientHeight } = messageBodyRef.current;
			messageBodyRef.current.scrollTop = scrollHeight - clientHeight;
		}
	}

	useEffect(() => {
		moveScrollBarDown()
	}, [currentRoom, messageHistory]);

	useEffect(() => {

		async function fetchUserData() {
			try {
				const response = await axios.post('https://chatappbackendrs.azurewebsites.net/api/user-data', null, { withCredentials: true })
				if (response.status === 200) setUserData(response.data)
			}
			catch(error) {
				console.log(error.message)
			}
		}

		async function fetchUserRooms() {
			try {
				const response = await axios.post('https://chatappbackendrs.azurewebsites.net/api/user-rooms', null, { withCredentials: true })
				if (response.status === 200) setRooms(response.data.rooms)
			}
			catch(error) {
				console.log(error.message)
			}
		}

		fetchUserData()
		fetchUserRooms()

		const updateMaxHeight = () => { setMaxHeight(window.innerHeight) }

        updateMaxHeight();

        window.addEventListener('resize', updateMaxHeight);

		setMessageListener(handleMessage);

		return () => {
			removeMessageListener(handleMessage)
			window.removeEventListener('resize', updateMaxHeight)
		};

	  }, []);

	const sendMessageToRoom = (event) => {

		event.preventDefault()

		if (!message.length) return

		// send to socket
		sendMessage(currentRoom, message, userData.phoneNumber, userData.userColor)
	
		// Clear the message input field after sending
		setMessage("")
		inputFieldReference.current.value = ""
	}

	const addRoom = (roomName) => { setRooms(prevRooms => [...prevRooms, roomName]) }

	const helperFunction = () => {
		setCreateRoomModal(false)
		setJoinRoomModal(false)
		setEmptyRoomName(false)
		setRoomNameError(false)
	}

	const sortMessagesByTimestamp = (a, b) => {
		return a.timestamp - b.timestamp
	}

	const JoinOrCreateRoom = async(createRoom = false) => {

		if (RoomModalName.length) {
			
			const postData = { roomName: RoomModalName }

			try {
				const response = await axios.post('https://chatappbackendrs.azurewebsites.net/api/room-exists', postData, { withCredentials: true })

				if (response.data.roomExists) {

					if (createRoom) {
						setRoomNameError(true)
						return
					}
					const room_messages = await joinRoom(currentRoom, RoomModalName, userData.phoneNumber, false)
					setMessageHistory(room_messages.sort(sortMessagesByTimestamp))
					helperFunction()
				}
				else {

					if (!createRoom) {
						setRoomNameError(true)
						return
					}
					const room_messages = await joinRoom(currentRoom, RoomModalName, userData.phoneNumber, true)
					setMessageHistory(room_messages.sort(sortMessagesByTimestamp))
				}

				addRoom(RoomModalName)
				setCurrentRoom(RoomModalName)
				helperFunction()
			}
			catch(error) {
				console.log(error.message)
				helperFunction()
			}
			finally { setRoomModalName('') }
		}
		else setEmptyRoomName(true)

	}

	const leaveCurrentRoom = () => {
		leaveRoom(userData.phoneNumber, currentRoom)
		setRooms(rooms => rooms.filter(room => room !== currentRoom))
		setCurrentRoom(null)
	}

	const openRoom = async(newRoom) => {
		const room_messages = await joinRoom(currentRoom, newRoom, userData.phoneNumber, false)
		setMessageHistory(room_messages.sort(sortMessagesByTimestamp))
		setCurrentRoom(newRoom)
	}

	const deleteAccount = async() => { 
		
		try {

			await axios.post('https://chatappbackendrs.azurewebsites.net/api/auth', null, { withCredentials: true });
			
			const response = await axios.delete('https://chatappbackendrs.azurewebsites.net/api/delete-account', { withCredentials: true })

			if (response.status === 200) {
				onNavigation()
				navigate("/login")
			}

		} catch(error) { console.log(error.message) }

	}

	const logOut = async() => {

		try {

			const response = await axios.get('https://chatappbackendrs.azurewebsites.net/api/logout', { withCredentials: true })

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
				<RiLoginBoxLine className='icon' onClick={ () => { setEmptyRoomName(false); setRoomNameError(false); setJoinRoomModal(true) }}/>
				<IoSettingsOutline className='icon' onClick= { () => setSettingsModal(true) }/>
				<IoAdd className='icon' onClick={() => { setEmptyRoomName(false); setRoomNameError(false); setCreateRoomModal(true)}}/>
				<BiExpandHorizontal className='icon' onClick={() => setShowRooms(!showRooms)}/>
			</div>

			{ showRooms &&
				<div className='h-100 w-20 text-white text-break text-center bg-custom-grey'>
					<h1 className='mt-3 mb-4'>Rooms</h1>
					<div style={{ maxHeight: maxHeight - 150, overflowY: 'auto' }}>
						{rooms.map((room) => (
							<div style={{ fontSize: 22 }} key={room} tabIndex={-1} onClick={() => openRoom(room)} className='rounded-1 bg-success my-2 mx-3 cursor-pointer p-3'>
								{room}
							</div>
						))}
					</div>
				</div>
			}

			{ currentRoom &&
				<div className="d-flex flex-column h-100 flex-grow text-white">
					<div className="p-3 flex-grow-1 mb-20">
						<div className='text-center' style={{height: 60}}>
							<h2 className='text-center d-inline-block'>{currentRoom}</h2>
							<Button style={{height: 40, width: 70, float: 'right'}} className='btn btn-danger rounded-0 d-inline-block' onClick={() => leaveCurrentRoom()}>Leave</Button>
						</div>

						<div ref={messageBodyRef} className='pt-3 hideScrollbar' style={{ maxHeight: maxHeight - 180, overflowY: 'auto' }}>
							{messageHistory.map((message) => {
								const messageDate = new Date(message.timestamp);
								const formattedHours = String(messageDate.getHours()).padStart(2, '0');
    							const formattedMinutes = String(messageDate.getMinutes()).padStart(2, '0');
								return (
									<div key={message.id} className='d-flex flex-column'>
										<div className={`message-width message-container text-white bg-custom-grey mb-1 mt-2 py-2 px-3 ${message.senderNumber === userData.phoneNumber ? 'align-self-end' : 'align-self-start'}`}>
											<p className='mb-0' style={{ color: message.senderColor }}>{message.senderNumber}</p>
											<p className='mb-0'>{message.messageBody}</p>
											<p className='mb-0 text-secondary text-end'>{formattedHours}:{formattedMinutes}</p>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				
					<Form onSubmit={sendMessageToRoom} className='d-flex w-100 p-3'>
						<Form.Control
						ref={inputFieldReference}
						type="text"
						placeholder="Enter a message..."
						className="shadow-none rounded-0"
						onChange={(event) => { setMessage(event.target.value); moveScrollBarDown() }}
						onFocus={ () => moveScrollBarDown() }
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
					{ emptyRoomName && <p className='text-danger mb-0'>Room name can't be empty</p> }
					{ roomNameError && <p className='text-danger mb-0'>Room already exists</p> }
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
					{ emptyRoomName && <p className='text-danger mb-0'>Room name can't be empty</p> }
					{ roomNameError && <p className='text-danger mb-0'>Room does not exist</p> }
				</Modal.Body>

				<Modal.Footer> 
					<MdOutlineDone className='settings-icon w-15' onClick={ () => JoinOrCreateRoom() }/> 
				</Modal.Footer>
			
			</Modal>
			
		</div>

	)
}

export default Main