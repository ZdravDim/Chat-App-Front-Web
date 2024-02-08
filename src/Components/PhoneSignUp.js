import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { InputOTP } from 'antd-input-otp'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

import { auth, RecaptchaVerifier, signInWithPhoneNumber, db, addDoc, collection } from '../Firebase.config'

import { sha256 } from 'js-sha256';

import './PhoneSignUp.css'


function PhoneSignIn() {

    const navigate = useNavigate();

    const [phone, setPhone] = useState("")
    const [user, setUser] = useState(null)
    const [otp, setOtp] = useState("")
    const [displayLevel, setDisplayLevel] = useState(0);
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [password, setPassword] = useState("");

    // send otp code
    const sendOtp = async() => {
        try {
            const recaptcha = new RecaptchaVerifier(auth, "recaptcha", {})
            const confirmation = await signInWithPhoneNumber(auth, phone, recaptcha)
            setDisplayLevel(1);
            console.log(confirmation)
            setUser(confirmation)
        } catch(err) {
            console.error(err)
        }
        
    }
    
    // verify entered code
    const verifyOtp = async() => {
        try {
            if (otp.length !== 6) return
            for (let i = 0; i < 6; ++i) if (!/^\d+$/.test(otp[i])) return
            console.log(otp.join(''))
            const data = await user.confirm(otp.join(''))
            setDisplayLevel(2);
            console.log(data)
        } catch (err) {
            console.error(err)
        }
    }

    // stores user data in firestore
    const signUpFunction = async() => {

        const hashedPassword = sha256.create().update(password).hex();
        
        const userData = {
            phoneNumber: phone,
            name: name,
            surname: surname,
            password: hashedPassword 
        };

        await addDoc(collection(db, 'users'), userData);
        
        setDisplayLevel(3);
    }

    return (
        <div className='d-flex flex-column align-items-center justify-content-center h-100'>
            { displayLevel === 0 &&
                <>
                    <PhoneInput
                    className="w-auto mb-2"
                    country={"rs"}
                    value={phone}
                    onChange={(phone) => setPhone("+" + phone)}
                    />
                    <Button className='w-300' onClick={sendOtp}>Send OTP</Button>
                    <div id="recaptcha" className='my-2'></div>
                </>
            }
            { displayLevel === 1 &&
                <>
                    <InputOTP value={otp} onChange={setOtp} />
                    <Button className='w-300 mt-3' onClick={verifyOtp}>Verify OTP</Button>
                </>
            }
            { displayLevel === 2 &&
                <>
                    <Form.Group className="w-300 mb-2">
                        <Form.Label>Name</Form.Label>
                        <Form.Control size="sm" type="text" placeholder="Name" onChange={(event) => setName(event.target.value)} />
                    </Form.Group>
                    
                    <Form.Group className="w-300 mb-2">
                        <Form.Label>Surname</Form.Label>
                        <Form.Control size="sm" type="text" placeholder="Surname" onChange={(event) => setSurname(event.target.value) } />
                    </Form.Group>

                    <Form.Group className='w-300'>
                        <Form.Label>Password</Form.Label>
                        <Form.Control size="sm" type="password" onChange={(event) => setPassword(event.target.value)} />
                    </Form.Group>

                    <Button className='w-300 mt-3' onClick={signUpFunction}>Sign Up</Button>
                </>
            }
            { displayLevel === 3 &&
                <>
                    <Form.Label>Registration successful</Form.Label>
                    <Button className='w-300 mt-3' onClick={navigate("/login")}>Go to login page</Button>
                </>
            }
        </div>
    )
}

export default PhoneSignIn