import React, { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import Button from 'react-bootstrap/Button'
import 'react-phone-input-2/lib/style.css'
import './PhoneSignIn.css'
import { auth } from '../Firebase.config'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { InputOTP } from 'antd-input-otp';

function PhoneSignIn() {
    const [phone, setPhone] = useState("")
    const [user, setUser] = useState(null)
    const [otp, setOtp] = useState("")

    // send otp code
    const sendOtp = async() => {
        try {
            const recaptcha = new RecaptchaVerifier(auth, "recaptcha", {})
            const confirmation = await signInWithPhoneNumber(auth, phone, recaptcha)
            console.log(confirmation)
            setUser(confirmation)
        } catch(err) {
            console.error(err)
        }
    }

    // verifu entered code
    const verifyOtp = async() => {
        try {
            if (otp.length !== 6) return
            console.log(otp)
            console.log(otp.join(''))
            const data = await user.confirm(otp.join(''))
            console.log(data)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className='d-flex flex-column align-items-center justify-content-center h-100'>
            <PhoneInput
            className="w-auto mb-2"
            country={"rs"}
            value={phone}
            onChange={(phone) => setPhone("+" + phone)}
            />
            <Button className='w-300' onClick={sendOtp}>Send OTP</Button>
            <div id="recaptcha" className='my-2'></div>
            <InputOTP value={otp} onChange={setOtp} autoSubmit={verifyOtp} />
            <Button className='w-300 mt-3' onClick={verifyOtp}>Verify OTP</Button>
        </div>
    )
}

export default PhoneSignIn