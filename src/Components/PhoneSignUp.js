import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { InputOTP } from 'antd-input-otp'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../Firebase.config'

import { sha256 } from 'js-sha256'

import './PhoneSignUp.css'
import axios from 'axios'


function PhoneSignIn() {

    const navigate = useNavigate()

    const [phoneNumber, setPhone] = useState("")
    const [user, setUser] = useState(null)
    const [otp, setOtp] = useState("")
    const [displayLevel, setDisplayLevel] = useState(0)
    const [name, setName] = useState("")
    const [surname, setSurname] = useState("")
    const [password1, setPassword1] = useState("")
    const [password2, setPassword2] = useState("")
    const [passwordsDifferent, setPasswordsDifferent] = useState(false)
    const [invalidPhone, setInvalidPhone] = useState(false)
    const [phoneTaken, setPhoneTaken] = useState(false)
    const [isActive, setIsActive] = useState(false)

    const phoneNumberTaken = async() => {

        try {

            const data = { phoneNumber: phoneNumber }
            
            const response = await axios.post('http://localhost:3001/api/phone-available', data, { withCredentials: true })

            if (response.status === 200) return false

            return true
        }
        catch (error) {
            console.log(error.message)
            return true
        }
    }

    // send otp code
    const sendOtp = async() => {

        if (await phoneNumberTaken()) {
            setPhoneTaken(true)
            return
        }

        setPhoneTaken(false)

        setIsActive(true)
        let recaptcha = new RecaptchaVerifier(auth, "recaptcha", {})

        signInWithPhoneNumber(auth, phoneNumber, recaptcha)
        .then((confirmationResult) => {

            setDisplayLevel(1)
            console.log(confirmationResult)
            setUser(confirmationResult)
        })
        .catch((error) => {
            console.log(error.message)
            setInvalidPhone(true)
        })
        
    }
    
    // verify entered code
    const verifyOtp = async() => {
        try {
            if (otp.length !== 6) return
            for (let i = 0; i < 6; ++i) if (!/^\d+$/.test(otp[i])) return
            console.log(otp.join(''))
            const data = await user.confirm(otp.join(''))
            setDisplayLevel(2)
            console.log(data)
        } catch (error) {
            console.log(error.message)
        }
    }

    // stores user data in firestore
    const signUpFunction = async(event) => {

        event.preventDefault()

        const form = event.currentTarget

        if (form.checkValidity() === false || password1 !== password2) {
            event.stopPropagation()
            if (password1 !== password2) {
                form.password2.setCustomValidity('Passwords must match')
                setPasswordsDifferent(true)
            }
            else {
                form.password2.setCustomValidity('')
                setPasswordsDifferent(false)
            }
            form.classList.add('was-validated')
            return
        }

        const hashedPassword = sha256.create().update(password1).hex()

        const userData = {
            phoneNumber: phoneNumber,
            name: name,
            surname: surname,
            password: hashedPassword 
        }

        try {
            const response = await axios.post('http://localhost:3001/api/sign-up', userData, { withCredentials: true })
            if (response.status === 200) setDisplayLevel(3)
        }
        catch(error) {
            console.log(error.message)
        }
        
    }

    return (
        <div className='d-flex flex-column align-items-center justify-content-center h-100 custom-gradient'>
            <div className='d-flex flex-column align-items-center justify-content-center rounded-4 h-580 w-580 bg-white'>
                { displayLevel === 0 &&
                    <>
                        <h1 style={{ fontSize: 40 }} className='mb-5 fw-bold text-dark'>Create your Account</h1>
                        <PhoneInput
                        className="w-auto mb-1"
                        country={"rs"}
                        value={phoneNumber}
                        onChange={(phone) => setPhone("+" + phone)}
                        inputClass="custom-input"
                        buttonClass="custom-input"
                        />
                        { phoneTaken && <p className='text-danger my-1'>Phone number already registered</p> }
                        { invalidPhone && <p className='text-danger my-1'>Invalid phone number</p> }
                        <div className={isActive ? 'my-1' : ''} id="recaptcha" ></div>
                        <Button className='w-300 mt-1 rounded-0 btn-success' onClick={sendOtp}>Send OTP</Button>
                        <p className="mt-1">Already have an account? <Link to="/login" className="text-success">Log in here</Link></p>
                        
                    </>
                }
                { displayLevel === 1 &&
                    <>
                        <h1 className='mb-3 fw-bold text-dark'>OTP Code Verification</h1>
                        <p className='mb-0'>A verification code has been sent to your phone</p>
                        <p>{phoneNumber}</p>
                        <InputOTP value={otp} onChange={setOtp} inputClassName="custom-input" />
                        <Button className='w-345 mt-3 rounded-0 btn-success' onClick={verifyOtp}>Verify OTP</Button>
                    </>
                }
                { displayLevel === 2 &&
                    <>
                        <h1 className='mb-4 fw-bold text-dark'>Sign Up</h1>
                        <Form onSubmit={signUpFunction} noValidate>
                            <Form.Group className="w-300 mb-1">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control className='shadow-none rounded-0' size="sm" type="text" placeholder="Your First Name" onChange={(event) => setName(event.target.value)} required />
                            </Form.Group>
                            
                            <Form.Group className="w-300 mb-1">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control className='shadow-none rounded-0' size="sm" type="text" placeholder="Your Last Name" onChange={(event) => setSurname(event.target.value)} required />
                            </Form.Group>

                            <Form.Group className='w-300 mb-1'>
                                <Form.Label>Password</Form.Label>
                                <Form.Control className='shadow-none rounded-0' size="sm" type="password" placeholder='Password' onChange={(event) => setPassword1(event.target.value)} required />
                            </Form.Group>

                            <Form.Group className='w-300'>
                                <Form.Label>Confirm password</Form.Label>
                                <Form.Control name='password2' className='shadow-none rounded-0' size="sm" type="password" placeholder='Re-type Password' onChange={(event) => setPassword2(event.target.value)} required />
                            </Form.Group>

                            { passwordsDifferent && <p className='text-danger my-0'>Passwords not matching</p> }

                            <Button type="submit" className='w-300 mt-4 rounded-0 btn-success'>Sign Up</Button>
                        </Form>
                    </>
                }
                { displayLevel === 3 &&
                    <>
                        <h4>Registration successful</h4>
                        <Button className='w-300 mt-3 rounded-0 btn-success' onClick={() => navigate("/login")}>Go to login page</Button>
                    </>
                }
            </div>
        </div>
    )
}

export default PhoneSignIn