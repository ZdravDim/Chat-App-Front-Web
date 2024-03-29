import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

import { Wheel } from '@uiw/react-color'

import axios from 'axios'

import './Main.css'
import { RiLogoutBoxLine } from "react-icons/ri"
import { IoSettingsOutline, IoSend, IoPersonRemove, IoCreateOutline } from "react-icons/io5"
import { BiExpandHorizontal } from "react-icons/bi"
import { MdDeleteOutline, MdOutlineDone } from "react-icons/md"
import { IoMdContact } from "react-icons/io"
import { FaCheckCircle  } from "react-icons/fa"
import { AiOutlineUsergroupDelete, AiOutlineUsergroupAdd } from "react-icons/ai"

import { sha256 } from 'js-sha256'

import { sendMessage, joinRoom, leaveRoom, setMessageListener, removeMessageListener, setRoomListener, removeRoomListener } from "../Socket.js"

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
	const [illegalRoomName, setIllegalRoomName] = useState(false)
	
	const inputFieldRef = useRef(null)
	const messageBodyRef = useRef(null)
	const createRoomInputRef = useRef(null)
	const joinRoomInputRef = useRef(null)
	const addContactInputRef = useRef(null)

	const [maxHeight, setMaxHeight] = useState(window.innerHeight)
	const [maxWidth, setMaxWidth] = useState(window.innerWidth)

	const [message, setMessage] = useState("")
	const [messageHistory, setMessageHistory] = useState([])

	const [oldPassword, setOldPassword] = useState("")
	const [newPassword1, setNewPassword1] = useState("")
	const [newPassword2, setNewPassword2] = useState("")
	const [passwordsDifferent, setPasswordsDifferent] = useState(false)
	const [successResetPassword, setSuccessResetPassword] = useState(false)

	const [colorPickerValue, setColorPickerValue] = useState("#bcd4cb")
	const [colorApplied, setColorApplied] = useState(false)

	const [deleteAccountMenu, setDeleteAccountMenu] = useState(false)

	const handleMessage = useCallback((message) => {

        setMessageHistory(prevMessages => [...prevMessages, message])

        // update room with latest message
        const tempRooms = [...rooms]
		tempRooms.forEach((room) => {
			if (room.roomName === message.roomName) room.latestTimestamp = message.timestamp
		})
        setRooms(tempRooms)
    }, [rooms])

	const moveScrollBarDown = () => {
		if (messageBodyRef.current) {
			const { scrollHeight, clientHeight } = messageBodyRef.current
			messageBodyRef.current.scrollTop = scrollHeight - clientHeight
		}
	}

	const fetchUserRoomsFromSocket = useCallback(async (phoneNumber, roomName) => {

        if (userData && phoneNumber === userData.phoneNumber) {

			let tempData = { ...userData }
			tempData.incomingRequests = [...tempData.incomingRequests, roomName]
			setUserData(tempData)

            try {
                const response = await axios.post('https://chatappbackendrs.azurewebsites.net/api/user-rooms', null, { withCredentials: true })
                if (response.status === 200) setRooms(response.data.rooms)
            } catch (error) {
                console.log(error.message)
            }
        }
    }, [userData])

	useEffect(() => {
		moveScrollBarDown()
	}, [currentRoom, messageHistory])

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

		const updateWindowSizes = () => {
			setMaxHeight(window.innerHeight)
			setMaxWidth(window.innerWidth)
		}

        updateWindowSizes()
        window.addEventListener('resize', updateWindowSizes)

		// setMessageListener(handleMessage)

		return () => {
			// removeMessageListener(handleMessage)
			window.removeEventListener('resize', updateWindowSizes)
		}

	}, [])

	useEffect(() => {

		setTimeout(() => {
			if (createRoomInputRef.current) createRoomInputRef.current.focus()
			if (joinRoomInputRef.current) joinRoomInputRef.current.focus()
			if (addContactInputRef.current) addContactInputRef.current.focus()
		}, 200)

	}, [addContactModal, joinRoomModal, createRoomModal])

	useEffect(() => {

		if (inputFieldRef.current) {
			setTimeout(() => {
            inputFieldRef.current.value = ''
            inputFieldRef.current.focus()
        	}, 500)
		}

	}, [currentRoom])

	useEffect(() => {
		
		setRoomListener(fetchUserRoomsFromSocket)
		setMessageListener(handleMessage)

		return () => {
			removeRoomListener(fetchUserRoomsFromSocket)
			removeMessageListener(handleMessage)
		}

	}, [fetchUserRoomsFromSocket, handleMessage])

	const sendMessageToRoom = (event) => {

		event.preventDefault()

		if (!message.length) return

		// send to socket
		sendMessage(currentRoom, message, userData.phoneNumber, userData.userColor)

		moveRoomToFirstPosition(message.timestamp)
		
		// Clear the message input field after sending
		setMessage("")
		inputFieldRef.current.value = ""
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
			let response = await axios.post('https://chatappbackendrs.azurewebsites.net/api/user-exists', postData, { withCredentials: true })

			if (response.status === 200) {
				if (response.data.userExists) {
					
					let postData = { 
						phoneNumber1: userData.phoneNumber,
						phoneNumber2: contactPhoneNumber
					}
					
					response = await axios.post('https://chatappbackendrs.azurewebsites.net/api/private-room-exists', postData, { withCredentials: true })

					if (response.status === 200) {
						if (!response.data.roomExists) {

							const roomName = userData.phoneNumber + contactPhoneNumber

							joinOrCreatePrivateRoom(roomName, true)

							return joinOrCreatePrivateRoomHelper(roomName, response)
						}

						else if (response.data.roomExists && !response.data.user1.joined) {

							joinOrCreatePrivateRoom(response.data.roomName, false)

							return joinOrCreatePrivateRoomHelper(response.data.roomName, response)
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

	const joinOrCreatePrivateRoom = async(roomName, createRoom = false) => {

		try {
			const room_messages = await joinRoom(currentRoom, roomName, userData.phoneNumber, createRoom)
			setMessageHistory(room_messages.sort(sortMessagesByTimestamp))
		}
		catch(error) {
			console.log("Error joining private room: " + error.message)
		}
	}

	const joinOrCreatePrivateRoomHelper = (roomName, response) => {

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

	const JoinOrCreateRoom = async(createRoom = false) => {

		if (RoomModalName.length) {
			
			if (RoomModalName.includes('+')) {
				setRoomAlredyJoinedError(false)
				setEmptyInputError(false)
				setInputValueError(false)
				setIllegalRoomName(true)
				return
			}

			const postData = {
				roomName: RoomModalName,
				phoneNumber: userData.phoneNumber
			}

			try {
				let response = await axios.post('https://chatappbackendrs.azurewebsites.net/api/room-exists', postData, { withCredentials: true })

				if (response.data.roomExists) {

					if (createRoom) {
						setRoomAlredyJoinedError(false)
						setEmptyInputError(false)
						setIllegalRoomName(false)
						setInputValueError(true)
						return
					}

					if (response.data.userIsJoined) {
						setEmptyInputError(false)
						setInputValueError(false)
						setIllegalRoomName(false)
						setRoomAlredyJoinedError(true)
						return
					}

					const room_messages = await joinRoom(currentRoom, RoomModalName, userData.phoneNumber, false)
					setMessageHistory(room_messages.sort(sortMessagesByTimestamp))
				}
				else {

					if (!createRoom) {
						setIllegalRoomName(false)
						setEmptyInputError(false)
						setRoomAlredyJoinedError(false)
						setInputValueError(true)
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
			setIllegalRoomName(false)
			setInputValueError(false)
			setRoomAlredyJoinedError(false)
			setEmptyInputError(true)
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
	
	const acceptRequest = async() => {
		
		try {

			const postData = {
				phoneNumber: userData.phoneNumber,
				roomName: currentRoom
			}

			const response = await axios.post('https://chatappbackendrs.azurewebsites.net/api/accept-request', postData, { withCredentials: true })

			if (response.status === 200) {
				let updatedUserData = { ...userData }
				updatedUserData.incomingRequests = updatedUserData.incomingRequests.filter(element => element !== currentRoom)
				setUserData(updatedUserData)
			}

		}
		catch(error) { console.log("Error accepting request: " + error.message) }

	}

	const openRoom = async(newRoom) => {
		try {
			const room_messages = await joinRoom(currentRoom, newRoom.roomName, userData.phoneNumber, false)
			setMessageHistory(room_messages.sort(sortMessagesByTimestamp))
			setCurrentRoom(newRoom.roomName)
			if (newRoom.isPrivateRoom) setContactData(getContactData(userData.phoneNumber, newRoom))
			if (maxWidth <= 700) setShowRooms(false)
			// if (inputFieldRef.current) {
			// 	inputFieldRef.current.value = ''
			// 	inputFieldRef.current.focus()
			// }
		}
		catch(error) { console.log("Error opening room: " + error.message) }
	}

	const deleteAccount = async() => { 
		
		try {

			await axios.post('https://chatappbackendrs.azurewebsites.net/api/auth', null, { withCredentials: true })
			
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

	const submitResetPassword = async(event) => {
		
		event.preventDefault()
		
        const form = event.currentTarget

        if (form.checkValidity() === false || newPassword1 !== newPassword2) {
            event.stopPropagation()
            if (newPassword1 !== newPassword2) {
                form.newPassword2.setCustomValidity('Passwords must match')
                setPasswordsDifferent(true)
            }
            else {
                form.newPassword2.setCustomValidity('')
                setPasswordsDifferent(false)
            }
            form.classList.add('was-validated')
            return
        }

        const oldHashedPassword = sha256.create().update(oldPassword).hex()
        const newHashedPassword = sha256.create().update(newPassword1).hex()

		try {

			const postUserData = {
				phoneNumber: userData.phoneNumber,
				oldPassword: oldHashedPassword,
				newPassword: newHashedPassword
			}

			const response = await axios.post('https://chatappbackendrs.azurewebsites.net/api/reset-password', postUserData, { withCredentials: true })
			
			if (response.status === 200) {
				if (response.data.success) {
					setSuccessResetPassword(true)
					return
				} 
				
				setInputValueError(true) 

			}
		} 
		catch(error) {
			console.log("Error changing password: " + error.message)
		}
	}

	const changeUserColor = async() => {
		try {
			const postData = {
				phoneNumber: userData.phoneNumber,
				userColor: colorPickerValue
			}
			const response = await axios.post('https://chatappbackendrs.azurewebsites.net/api/change-color', postData, { withCredentials: true })
			if (response.status === 200) {
				const tempData = { ...userData }
				tempData.userColor = colorPickerValue
				setUserData(tempData)
				setColorApplied(true)
			}
		}
		catch(error) {
			console.log("Error changing color: " + error.message)
		}
	} 

	return (
		<div className='d-flex flex-row h-100 bg-dark'>
			<div style={{ minWidth: 40 }} className={(showRooms ? "" : "bg-custom-grey ") + `icons-div d-flex flex-column align-items-center w-8 text-center`}>
				<IoMdContact className='icon'
				onClick={() => {
					setContactPhoneNumber('')
					setInputValueError(false)
					setEmptyInputError(false)
					setContactAlreadyAdded(false)
					setSameUserError(false)
					setAddContactModal(true)
				}}/>
				<AiOutlineUsergroupAdd className='icon'
				onClick={ () => {
					setRoomModalName('')
					setEmptyInputError(false)
					setInputValueError(false)
					setRoomAlredyJoinedError(false)
					setJoinRoomModal(true)
				}}/>
				<IoCreateOutline className='icon'
				onClick={() => {
					if (joinRoomInputRef.current) joinRoomInputRef.current.focus()
					setRoomModalName('')
					setEmptyInputError(false)
					setInputValueError(false)
					setCreateRoomModal(true)
				}}/>
				<BiExpandHorizontal className='icon' onClick={() => setShowRooms(!showRooms)}/>
				<div className='flex-grow-1'></div>
				<RiLogoutBoxLine className='icon' onClick={logOut} />
				<IoSettingsOutline className='icon mb-3'
				onClick= { () => {
					setSuccessResetPassword(false)
					setNewPassword1("")
					setNewPassword2("")
					setPasswordsDifferent(false)
					setInputValueError(false)
					setDeleteAccountMenu(false)
					setSettingsModal(true)
				}}/>
			</div>

			{ showRooms &&
				<div style={{ minWidth: 280 }} className='show-rooms h-100 w-20 text-white text-break text-center bg-custom-grey'>
					<p style={{ fontSize: 30 }} className='mt-3 mb-4'>Rooms</p>
					<div style={{ maxHeight: maxHeight - 150, overflowY: 'auto' }} className='hideScrollbar'>
						{rooms.sort(sortRoomsByLatestMessage).map((room) => {

							let contact = {}

							const latestMessageDate = room.latestTimestamp ? new Date(room.latestTimestamp) : new Date(Date.now())
							const formattedHours = String(latestMessageDate.getHours()).padStart(2, '0')
							const formattedMinutes = String(latestMessageDate.getMinutes()).padStart(2, '0')

							if (room.isPrivateRoom) contact = getContactData(userData.phoneNumber, room)

							return <div style={{ fontSize: 22 }} key={room.roomName} tabIndex={-1} onClick={() => openRoom(room)} className='bg-success rounded-1 my-2 mx-3 cursor-pointer p-3'>
								{!room.isPrivateRoom ? 
									<div>
										<p className='mb-0'>{room.roomName}</p>
										<p style={{ fontSize: 14 }} className='mb-0 text-end'>{formattedHours}:{formattedMinutes}</p>
									</div>
									:
									<div className='position-relative'>
										{ userData.incomingRequests.includes(room.roomName) && <div style={{ width: 10, height: 10 }} className='position-absolute rounded-circle bg-white bottom-0'>&nbsp;</div> }
										<p className='mb-0'>{contact.name} {contact.surname}</p>
										<p className='mb-0' style={{ fontSize: 17 }}>{contact.phoneNumber}</p>
										<p style={{ fontSize: 14 }} className='mb-0 text-end'>{formattedHours}:{formattedMinutes}</p>
									</div>
								}
							</div>
						})}
					</div>
				</div>
			}

			{ currentRoom && !(showRooms && maxWidth <= 700 ) &&
				<div style={{ minWidth: 0 }} className="d-flex flex-column h-100 flex-grow text-white">
					<div className="p-3 flex-grow mb-20">
						<div className='position-relative text-center' style={{height: 60}}>
						{ userData.incomingRequests.includes(currentRoom) &&
							((maxWidth <= 900) ?
							<FaCheckCircle style={{ width: 30, height: 30 }} className='position-absolute start-0 btn btn-success rounded-circle mt-1 p-1' onClick={() => acceptRequest()} />
							:
							<Button className='position-absolute start-0 btn btn-success rounded-0 mt-1' onClick={() => acceptRequest()}>Accept Request</Button>)
						}
							<p style={{ fontSize: 28 }} className='room-name text-center d-inline-block'>{
								(currentRoom[0] === '+') ? (contactData.name + " " + contactData.surname) : currentRoom
							}</p>
							<Button className='d-after-900 position-absolute end-0 btn btn-danger rounded-0 mt-1' onClick={() => leaveCurrentRoom()}>{currentRoom[0] === '+' ? "Remove Contact" : "Leave"}</Button>
							<div className='d-before-900 position-absolute end-0'>
								{currentRoom[0] === '+' ?
									<IoPersonRemove onClick={() => leaveCurrentRoom()} style={{ width: 30, height: 30 }} className='btn btn-danger rounded-circle p-1 mt-1' />
								:
									<AiOutlineUsergroupDelete onClick={() => leaveCurrentRoom()} style={{ width: 30, height: 30 }} className='btn btn-danger rounded-circle p-1 mt-1' />
								}
							</div>
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
											<p className='text-center text-secondary mt-2 mb-2'>{message.phoneNumber} has {message.type} the chat</p>
										}
									</div>
								)
							})}
						</div>
					</div>
				
					<Form onSubmit={sendMessageToRoom} className='d-flex w-100 p-3'>
						<Form.Control
						ref={inputFieldRef}
						type="text"
						placeholder="Enter a message..."
						className="shadow-none rounded-0"
						onChange={(event) => { setMessage(event.target.value); moveScrollBarDown() }}
						onFocus={ () => moveScrollBarDown() }
						disabled={userData.incomingRequests.includes(currentRoom)}
						/>  
						<Button type="submit" className="btn-success rounded-0"><IoSend className='text-white m-1'/></Button>
					</Form>
				</div>
			}

			<Modal 
				show={ settingsModal }
				onHide={ () => setSettingsModal(false) }
				backdrop="static"
				centered
				>

				<Modal.Header closeButton> 
					<Modal.Title>Settings</Modal.Title> 
				</Modal.Header>

				<Modal.Body className>
					<Tabs defaultActiveKey="account" id="uncontrolled-tab-example" className="mb-3">
						<Tab eventKey="account" title="Account">
							<div className='d-flex flex-row w-100 bg-grey'>
								<p className='w-85 ps-3 mb-0 mt-1'>Delete your account</p>
								<MdDeleteOutline className='apply-icon apply-icon-hover' onClick={() => setDeleteAccountMenu(true)}/>
							</div>
							{ deleteAccountMenu && 
								<div style={{ maxWidth: 300, backgroundColor: "#f5f5f5" }} className='d-flex flex-column mx-auto mt-3 mb-2 pt-2 pb-3 rounded-2'>
									<p style={{ fontSize: 20 }} className='text-center fw-bold'>Are you sure?</p>
									<div className='d-flex justify-content-center'>
										<Button className='btn btn-danger me-2' style={{ width: 100 }} onClick={deleteAccount}>Yes</Button>
										<Button className='btn btn-success ms-2' style={{ width: 100 }} onClick={() => setSettingsModal(false)}>No</Button>
									</div>
								</div>
							}
						</Tab>
						<Tab eventKey="security" title="Security">
							<div className='d-flex flex-column w-100 bg-grey mx-auto' style={{ maxWidth: 300 }}>
								{ successResetPassword ? 
									<h4>Password Reset Success</h4>
									: 
									<>
										<h4 className='mb-4 mt-3 text-center'>Reset your password</h4>
										<Form className='d-flex flex-column' onSubmit={ submitResetPassword } noValidate>
											<Form.Group>
												<Form.Label>Old password</Form.Label>
												<Form.Control className='shadow-none rounded-0' size="sm" type="password" onChange={(event) => setOldPassword(event.target.value)} required />
											</Form.Group>
											<Form.Group>
												<Form.Label>New password</Form.Label>
												<Form.Control className='shadow-none rounded-0' size="sm" type="password" onChange={(event) => setNewPassword1(event.target.value)} required />
											</Form.Group>
											<Form.Group>
												<Form.Label>Re-enter new password</Form.Label>
												<Form.Control name="newPassword2" className='shadow-none rounded-0' size="sm" type="password" onChange={(event) => setNewPassword2(event.target.value)} required />
											</Form.Group>
											
											{ passwordsDifferent && <p className='text-danger my-0'>Passwords not matching</p> }
											{ inputValueError && <p className='text-danger mb-0'>Wrong old password</p> }
											<Button type="submit" className='mt-4 mb-2 rounded-0 btn-success mx-auto'>Reset password</Button>
										</Form>
									</>
								}
							</div>
						</Tab>
						<Tab eventKey="appearance" title="Appearance">
							<>
								<div className='d-flex align-items-center justify-content-center'>
									<Wheel
										color={colorPickerValue}
										onChange={(color) => { setColorApplied(false); setColorPickerValue(color.hex) }}
									/>
								</div>
								<div className='d-flex flex-column align-items-center justify-content-center'>
									<div className={`message-container bg-custom-grey mb-1 mt-2 py-2 px-3 mx-4`}>
										<p className='mb-0' style={{ color: colorPickerValue }}>{userData ? userData.phoneNumber : "+38164123456"}</p>
										<p className='mb-0 text-white'>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
										<p className='mb-0 text-secondary text-end'>12:34</p>
									</div>
									<div className='d-flex align-items-center justify-content-center my-2 position-relative'>
										<Button className='px-4 rounded-0 btn-success' onClick={changeUserColor}>Apply</Button>
										{ colorApplied && <FaCheckCircle className='apply-icon position-absolute start-100 ms-2'/> }
									</div>
								</div>
							</>
						</Tab>
					</Tabs>
        		</Modal.Body> 
				
				<Modal.Footer>
					<Button className='btn-success' onClick={() => setSettingsModal(false)}>Close</Button>
				</Modal.Footer>
				
			</Modal>

			<Modal 
				show={ createRoomModal }
				onHide={ () => setCreateRoomModal(false) }
				backdrop="static"
				centered>

				<Modal.Header closeButton> 
					<Modal.Title>Create new Room</Modal.Title> 
				</Modal.Header>

				<Modal.Body>
					<Form.Control
					ref={createRoomInputRef}
					className='shadow-none'
					type="text"
					placeholder="Room name"
					onChange={ (event) => setRoomModalName(event.target.value) }
					onKeyDown={(event) => { if (event.key === 'Enter') JoinOrCreateRoom(true) }}
					/>
					{ emptyInputError && <p className='text-danger mb-0'>Room name can't be empty</p> }
					{ inputValueError && <p className='text-danger mb-0'>Room already exists</p> }
					{ illegalRoomName && <p className='text-danger mb-0'>Room has illegal character (+)</p> }
				</Modal.Body>

				<Modal.Footer> 
					<MdOutlineDone className='apply-icon apply-icon-hover' onClick={ () => JoinOrCreateRoom(true) }/> 
				</Modal.Footer>
			
			</Modal>

			<Modal 
				show={ joinRoomModal }
				onHide={ () => setJoinRoomModal(false) }
				backdrop="static"
				centered
				>

				<Modal.Header closeButton> 
					<Modal.Title>Join new Room</Modal.Title> 
				</Modal.Header>

				<Modal.Body>
					<Form.Control
					ref={joinRoomInputRef}
					className='shadow-none'
					type="text"
					placeholder="Room name"
					onChange={ (event) => setRoomModalName(event.target.value) }
					onKeyDown={(event) => { if (event.key === 'Enter') JoinOrCreateRoom() }}
					/>
					{ emptyInputError && <p className='text-danger mb-0'>Room name can't be empty</p> }
					{ inputValueError && <p className='text-danger mb-0'>Room does not exist</p> }
					{ roomAlreadyJoinedError && <p className='text-danger mb-0'>Room already joined</p> }
				</Modal.Body>

				<Modal.Footer> 
					<MdOutlineDone className='apply-icon apply-icon-hover' onClick={ () => JoinOrCreateRoom() }/> 
				</Modal.Footer>
			
			</Modal>

			<Modal 
				show={ addContactModal }
				onHide={ () => setAddContactModal(false) }
				backdrop="static"
				centered>

				<Modal.Header closeButton> 
					<Modal.Title>Add Contact</Modal.Title> 
				</Modal.Header>

				<Modal.Body>
					<Form.Control
					ref={addContactInputRef}
					className='shadow-none'
					type="text"
					placeholder="Enter contact phone number (ex. +38164123456)"
					onChange={ (event) => setContactPhoneNumber(event.target.value) }
					onKeyDown={(event) => { if (event.key === 'Enter') addContact() }}
					/>
					{ emptyInputError && <p className='text-danger mb-0'>Phone number can't be empty</p> }	
					{ inputValueError && <p className='text-danger mb-0'>User does not exist</p> }
					{ sameUserError && <p className='text-danger mb-0'>You can't add yourself as a contact</p> }
					{ contactAlreadyAdded && <p className='text-danger mb-0'>Contact already added</p> }
				</Modal.Body>

				<Modal.Footer> 
					<MdOutlineDone className='apply-icon apply-icon-hover' onClick={ () => addContact() }/> 
				</Modal.Footer>
			
			</Modal>
			
		</div>

	)
}

export default Main