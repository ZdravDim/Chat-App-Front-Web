import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

import PhoneInput from 'react-phone-input-2'
import { sha256 } from 'js-sha256'
import './LogIn.css'
import axios from 'axios'

function LogIn({onNavigation}) {

    const navigate = useNavigate()
    const [phoneNumber, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [invalidCredentials, setInvalidCredentials] = useState(false)

    const logInSubmit = async(event) => {

        event.preventDefault()

        const form = event.currentTarget;

        const phoneInputElement = form.querySelector('input.custom-input');
        phoneInputElement.setCustomValidity('')

        if (form.checkValidity() === false || phoneInputElement.value.length < 6) {
            event.stopPropagation()
            if (phoneInputElement.value.length < 5) phoneInputElement.setCustomValidity("Invalid phone input")
            form.classList.add('was-validated')
            return
        }

        phoneInputElement.setCustomValidity('')

        var body = {
            phoneNumber: phoneNumber,
            password: sha256(password)
        };

        try {

            const response = await axios.post('https://chatappbackendrs.azurewebsites.net/api/login', body, { withCredentials: true })

            if (response.status === 200) {

                console.log("Login successful.")
                onNavigation()
                navigate("/")
                return
            }
            
            console.log("Login failed: Invalid credentials.")
            setInvalidCredentials(true)
        }
        catch(error) {
            console.log("Error logging in:" +  error.message)
            setInvalidCredentials(true)
        }
        
    }

    return (
        <div className='d-flex flex-column align-items-center justify-content-center h-100 custom-gradient'>
            <div className='d-flex flex-column align-items-center justify-content-center rounded-4 h-580 w-580 bg-white'>
                <h1 style={{ fontSize: 40 }} className='mb-5 fw-bold text-dark'>LogIn to Chat App</h1>
                <Form onSubmit={logInSubmit} noValidate>

                    <Form.Label>Phone number</Form.Label>
                    <PhoneInput
                    className="w-auto mb-1"
                    country={"rs"}
                    value={phoneNumber}
                    onChange={(phone) => setPhone("+" + phone)}
                    inputClass="custom-input"
                    buttonClass="custom-input"
                    />

                    <Form.Group className='w-300'>
                        <Form.Label>Password</Form.Label>
                        <Form.Control className='shadow-none rounded-0' size="sm" type="password" onChange={(event) => setPassword(event.target.value)} required />
                    </Form.Group>

                    { invalidCredentials && <p className='text-center text-danger mt-2 mb-0'>Invalid credentials</p> }

                    <Button type="submit" className='w-300 mt-3 rounded-0 btn-success'>Login</Button>
                    <p className='text-center my-2'>Don't have an account? <Link to="/sign-up" className="text-success">Sign up</Link> </p>
                
                </Form>
            </div>
        </div>
    )
}

export default LogIn