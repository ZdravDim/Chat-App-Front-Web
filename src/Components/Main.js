import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

import axios from 'axios'

import './Main.css'
import { RiLogoutBoxLine, RiLoginBoxLine } from "react-icons/ri"
import { IoSettingsOutline, IoSend, IoAdd } from "react-icons/io5"
import { BiExpandHorizontal } from "react-icons/bi"
import { MdDeleteOutline, MdOutlineDone } from "react-icons/md"
import { IoMdContact } from "react-icons/io"


import { sendMessage, setMessageListener, removeMessageListener, joinRoom, leaveRoom } from "../Socket.js"

function Main({onNavigation}) {

	const navigate = useNavigate()

	const [userData, setUserData] = useState(null)

	const [showRooms, setShowRooms] = useState(true)

	const [rooms, setRooms] = useState([])
	const [currentRoom, setCurrentRoom] = useState(null)

	const [settingsModal, setSettingsModal] = useState(false)
	const [createRoomModal, setCreateRoomModal] = useState(false)
	const [joinRoomModal, setJoinRoomModal] = useState(false)
	const [addContactModal, setAddContactModal] = useState(false)
	
	const [contactPhoneNumber, setContactPhoneNumber] = useState('')
	const [contactData, setContactData] = useState({})

	const [RoomModalName, setRoomModalName] = useState('')

	const [sameUserError, setSameUserError] = useState(false)
	const [emptyInputError, setEmptyInputError] = useState(false)
	const [inputValueError, setInputValueError] = useState(false)
	const [roomAlreadyJoinedError, setRoomAlredyJoinedError] = useState(false)
	const [contactAlreadyAdded, setContactAlreadyAdded] = useState(false)
	
	const inputFieldReference = useRef(null)
	const messageBodyRef = useRef(null)

	const [maxHeight, setMaxHeight] = useState(window.innerHeight)

	const [message, setMessage] = useState("")
	const [messageHistory, setMessageHistory] = useState([])

	const handleMessage = (message) => { setMessageHistory(prevMessages => [...prevMessages, message]) }

	const moveScrollBarDown = () => {
		if (messageBodyRef.current) {
			const { scrollHeight, clientHeight } = messageBodyRef.current
			messageBodyRef.current.scrollTop = scrollHeight - clientHeight
		}
	}

	useEffect(() => {
		moveScrollBarDown()
	}, [currentRoom, messageHistory])

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

		const updateMaxHeight = () => { setMaxHeight(window.innerHeight) }

        updateMaxHeight()

        window.addEventListener('resize', updateMaxHeight)

		setMessageListener(handleMessage)

		return () => {
			removeMessageListener(handleMessage)
			window.removeEventListener('resize', updateMaxHeight)
		}

	  }, [])

	const sendMessageToRoom = (event) => {

		event.preventDefault()

		if (!message.length) return

		// send to socket
		sendMessage(currentRoom, message, userData.phoneNumber, userData.userColor)

		moveRoomToFirstPosition(message.timestamp)
		
		// Clear the message input field after sending
		setMessage("")
		inputFieldReference.current.value = ""
	}

	const addRoom = (room) => {
		setRooms(prevRooms => [room, ...prevRooms])
	}

	const moveRoomToFirstPosition = (timestamp) => {

		let tempRooms = [...rooms]
		let index = -1

		for (let i = 0; i < tempRooms.length; i++) {
			if (tempRooms[i].roomName === currentRoom) {
				index = i
				break
			}
		}

		tempRooms[index].latestTimestamp = Date.now() // not real time, just to push message to top, upon refresh it gets real value

		setRooms(tempRooms)

	}

	const helperFunction = () => {
		setCreateRoomModal(false)
		setJoinRoomModal(false)
		setEmptyInputError(false)
		setInputValueError(false)
	}

	const sortRoomsByLatestMessage = (a, b) => {
		return b.latestTimestamp - a.latestTimestamp
	}

	const sortMessagesByTimestamp = (a, b) => {
		return a.timestamp - b.timestamp
	}

	const addContact = async() => {

		if (!contactPhoneNumber) {
			setSameUserError(false)
			setContactAlreadyAdded(false)
			setInputValueError(false)
			setEmptyInputError(true)
			return
		}

		if (contactPhoneNumber === userData.phoneNumber) {
			setSameUserError(true)
			setEmptyInputError(false)
			setContactAlreadyAdded(false)
			setInputValueError(false)
			return
		}

		try {
			
			let postData = { phoneNumber: contactPhoneNumber }
			let response = await axios.post('http://localhost:3001/api/user-exists', postData, { withCredentials: true })

			if (response.status === 200) {
				if (response.data.userExists) {
					
					let postData = { 
						phoneNumber1: userData.phoneNumber,
						phoneNumber2: contactPhoneNumber
					}
					
					response = await axios.post('http://localhost:3001/api/private-room-exists', postData, { withCredentials: true })

					if (response.status === 200) {
						if (!response.data.roomExists) {

							const roomName = userData.phoneNumber + contactPhoneNumber

							JoinOrCreatePrivateRoom(roomName, true)

							let roomData = {
								roomName: roomName, 
								isPrivateRoom: true
							}
							roomData[userData.phoneNumber] = response.data.user1
							roomData[contactPhoneNumber] = response.data.user2

							addRoom(roomData)
							setCurrentRoom(roomName)
							setContactData({
								phoneNumber: contactPhoneNumber,
								name: roomData[contactPhoneNumber].name,
								surname: roomData[contactPhoneNumber].surname
							})
							setAddContactModal(false)
							return
						}

						setContactAlreadyAdded(true)
						setInputValueError(false)
						setEmptyInputError(false)
						setSameUserError(false)
						return
					}

					return
				}

				setEmptyInputError(false)
				setContactAlreadyAdded(false)
				setSameUserError(false)
				setInputValueError(true)
				return
			}
		} 
		catch(error) { console.log("Error adding contact: " + error.message) } 
	}

	const JoinOrCreatePrivateRoom = async(roomName, createRoom = false) => {

		try {
			const room_messages = await joinRoom(currentRoom, roomName, userData.phoneNumber, createRoom)
			setMessageHistory(room_messages.sort(sortMessagesByTimestamp))
		}
		catch(error) {
			console.log("Error joining private room: " + error.message)
		}
	}

	const JoinOrCreateRoom = async(createRoom = false) => {

		if (RoomModalName.length) {
			
			const postData = {
				roomName: RoomModalName,
				phoneNumber: userData.phoneNumber
			}

			try {
				let response = await axios.post('http://localhost:3001/api/room-exists', postData, { withCredentials: true })

				if (response.data.roomExists) {

					if (createRoom) {
						setInputValueError(true)
						setEmptyInputError(false)
						return
					}

					if (response.data.userIsJoined) {
						setRoomAlredyJoinedError(true)
						setEmptyInputError(false)
						setInputValueError(false)
						return
					}

					const room_messages = await joinRoom(currentRoom, RoomModalName, userData.phoneNumber, false)
					setMessageHistory(room_messages.sort(sortMessagesByTimestamp))
				}
				else {

					if (!createRoom) {
						setInputValueError(true)
						setEmptyInputError(false)
						setRoomAlredyJoinedError(false)
						return
					}
					const room_messages = await joinRoom(currentRoom, RoomModalName, userData.phoneNumber, true)
					setMessageHistory(room_messages.sort(sortMessagesByTimestamp))
				}

				addRoom({roomName: RoomModalName, isPrivateRoom: false, })
				setCurrentRoom(RoomModalName)
				helperFunction()
			}
			catch(error) {
				console.log(error.message)
				helperFunction()
			}
		}
		else {
			setEmptyInputError(true)
			setInputValueError(false)
			setRoomAlredyJoinedError(false)
		}

	}

	const leaveCurrentRoom = () => {
		leaveRoom(userData.phoneNumber, currentRoom)
		setRooms(rooms => rooms.filter(room => room.roomName !== currentRoom))
		setCurrentRoom(null)
	}

	const getContactData = (phoneNumber, room) => {
		let contactNumber = ""
		let phoneNumbers = []

		function extractPhoneNumbers(inputString) {
			const startIndex = inputString.indexOf('+', inputString.indexOf('+') + 1)
			return [inputString.slice(0, startIndex), inputString.slice(startIndex)]
		}

		if (room.isPrivateRoom) {
			phoneNumbers = extractPhoneNumbers(room.roomName)
			contactNumber = (phoneNumbers[0] === phoneNumber) ? phoneNumbers[1] : phoneNumbers[0]
		}

		const data = {
			"phoneNumber": contactNumber,
			"name": room[contactNumber].name,
			"surname": room[contactNumber].surname
		}

		return data
	}
	
	const openRoom = async(newRoom) => {
		const room_messages = await joinRoom(currentRoom, newRoom.roomName, userData.phoneNumber, false)
		setMessageHistory(room_messages.sort(sortMessagesByTimestamp))
		setCurrentRoom(newRoom.roomName)
		if (newRoom.isPrivateRoom) setContactData(getContactData(userData.phoneNumber, newRoom))
		
	}

	const deleteAccount = async() => { 
		
		try {

			await axios.post('http://localhost:3001/api/auth', null, { withCredentials: true })
			
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
			<div className='d-flex flex-column align-items-center w-8 text-center'>
				<IoMdContact className='icon' onClick={() => { setInputValueError(false); setEmptyInputError(false); setAddContactModal(true) }}/>
				<RiLoginBoxLine className='icon' onClick={ () => { setEmptyInputError(false); setInputValueError(false); setRoomAlredyJoinedError(false); setJoinRoomModal(true) }}/>
				<IoAdd className='icon' onClick={() => { setEmptyInputError(false); setInputValueError(false); setCreateRoomModal(true)}}/>
				<BiExpandHorizontal className='icon' onClick={() => setShowRooms(!showRooms)}/>
				<div className='flex-grow-1'></div>
				<RiLogoutBoxLine className='icon' onClick={logOut} />
				<IoSettingsOutline className='icon mb-3' onClick= { () => setSettingsModal(true) }/>
			</div>

			{ showRooms &&
				<div className='h-100 w-20 text-white text-break text-center bg-custom-grey'>
					<h1 className='mt-3 mb-4'>Rooms</h1>
					<div style={{ maxHeight: maxHeight - 150, overflowY: 'auto' }} className='hideScrollbar'>
						{rooms.sort(sortRoomsByLatestMessage).map((room) => {
							let contact = {}

							if (room.isPrivateRoom) contact = getContactData(userData.phoneNumber, room)

							return <div style={{ fontSize: 22 }} key={room.roomName} tabIndex={-1} onClick={() => openRoom(room)} className='bg-success rounded-1 my-2 mx-3 cursor-pointer p-3'>
								{!room.isPrivateRoom ? 
									<p className='mb-0'>{room.roomName}</p> 
									: 
									<> 
										<p className='mb-0'>{contact.name} {contact.surname}</p>
										<p className='mb-0' style={{ fontSize: 17 }}>{contact.phoneNumber}</p>
									</>
								}
							</div>
						})}
					</div>
				</div>
			}

			{ currentRoom &&
				<div className="d-flex flex-column h-100 flex-grow text-white">
					<div className="p-3 flex-grow-1 mb-20">
						<div className='position-relative text-center' style={{height: 60}}>
							<h2 className='text-center d-inline-block'>{
								(currentRoom[0] === '+') ? (contactData.name + " " + contactData.surname) : currentRoom
							}</h2>
							<Button className='position-absolute end-0 btn btn-danger rounded-0' onClick={() => leaveCurrentRoom()}>{currentRoom[0] === '+' ? "Remove Contact" : "Leave"}</Button>
						</div>

						<div ref={messageBodyRef} className='pt-3 hideScrollbar' style={{ maxHeight: maxHeight - 180, overflowY: 'auto' }}>
							{messageHistory.map((message) => {
								const messageDate = new Date(message.timestamp)
								const formattedHours = String(messageDate.getHours()).padStart(2, '0')
    							const formattedMinutes = String(messageDate.getMinutes()).padStart(2, '0')
								return (
									<div key={message.id} className='d-flex flex-column'>
										{ !message.hasOwnProperty("type") ?
											<div className={`message-width message-container text-white bg-custom-grey mb-1 mt-2 py-2 px-3 ${message.senderNumber === userData.phoneNumber ? 'align-self-end' : 'align-self-start'}`}>
												<p className='mb-0' style={{ color: message.senderColor }}>{message.senderNumber}</p>
												<p className='mb-0'>{message.messageBody}</p>
												<p className='mb-0 text-secondary text-end'>{formattedHours}:{formattedMinutes}</p>
											</div>
											:
											<p className='text-center text-secondary mb-0'>{message.phoneNumber} has {message.type} the chat</p>
										}
									</div>
								)
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
					{ emptyInputError && <p className='text-danger mb-0'>Room name can't be empty</p> }
					{ inputValueError && <p className='text-danger mb-0'>Room already exists</p> }
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
					{ emptyInputError && <p className='text-danger mb-0'>Room name can't be empty</p> }
					{ inputValueError && <p className='text-danger mb-0'>Room does not exist</p> }
					{ roomAlreadyJoinedError && <p className='text-danger mb-0'>Room already joined</p> }
				</Modal.Body>

				<Modal.Footer> 
					<MdOutlineDone className='settings-icon w-15' onClick={ () => JoinOrCreateRoom() }/> 
				</Modal.Footer>
			
			</Modal>

			<Modal 
				show={ addContactModal }
				onHide={ () => setAddContactModal(false) }
				backdrop="static"
				keyboard={false}
				centered>

				<Modal.Header closeButton> 
					<Modal.Title>Add contact</Modal.Title> 
				</Modal.Header>

				<Modal.Body>
				<Form.Control className='shadow-none' type="text" placeholder="Enter contact phone number" onChange={ (event) => setContactPhoneNumber(event.target.value) } />
					{ emptyInputError && <p className='text-danger mb-0'>Phone number can't be empty</p> }	
					{ inputValueError && <p className='text-danger mb-0'>User does not exist</p> }
					{ sameUserError && <p className='text-danger mb-0'>You can't add yourself as a contact</p> }
					{ contactAlreadyAdded && <p className='text-danger mb-0'>Contact already added</p> }
				</Modal.Body>

				<Modal.Footer> 
					<MdOutlineDone className='settings-icon w-15' onClick={ () => addContact() }/> 
				</Modal.Footer>
			
			</Modal>
			
		</div>

	)
}

export default Main