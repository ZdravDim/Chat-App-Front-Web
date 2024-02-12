import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

    const logInSubmit = (event) => {
        event.preventDefault()

        var body = {
            phoneNumber: phoneNumber,
            password: sha256(password)
        };

        axios.post('http://localhost:3001/login', body, { withCredentials: true })
        .then((response) => {
            if (response.status === 200) {
                console.log("Login successful.")
                onNavigation()
                navigate("/");
            } else {
                console.log("Login failed: Invalid credentials.");
                setInvalidCredentials(true)
            }
        })
        .catch((error) => {
            console.log(error);
        });
    }

    return (
        <div className='d-flex flex-column align-items-center justify-content-center h-100'>
            <Form onSubmit={logInSubmit}>
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

                { invalidCredentials &&
                    <p className='text-center text-danger my-1'>Invalid credentials</p>
                }

                <Button type="submit" className='w-300 mt-3 rounded-0 btn-success'>Login</Button>
            </Form>
        </div>
    )
}

export default LogIn