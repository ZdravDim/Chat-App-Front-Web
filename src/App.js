import React, { useState, useEffect, useCallback } from 'react'
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom'

import axios from 'axios'

import socket_connect, { socket_disconnect } from './Socket.js'

import PhoneSignIn from "./Components/PhoneSignUp"
import Main from "./Components/Main.js"
import LogIn from './Components/LogIn.js'

function App() {

  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  const onNavigation = useCallback(async() => {

    try {
      const response = await axios.post('http://localhost:3001/api/auth', null, { withCredentials: true })

      if (response.status === 200) setLoggedIn(true)
    
      else setLoggedIn(false)

    }
    catch (error) { setLoggedIn(false) }
    finally { setLoading(false) }

  }, [])

  useEffect(() => {
    onNavigation()
  }, [onNavigation])

  useEffect(() => {
    if (loggedIn) socket_connect()
    else socket_disconnect() 
  }, [loggedIn])

  if (loading) {
    // Show loading indicator while checking authentication status
    return <div>Loading...</div>
  }

  return (
    <Router>
      <Routes>
        {loggedIn ?
          <>
            <Route path='/' element={<Main onNavigation={onNavigation} loggedIn={loggedIn}/>} />
            <Route path='*' element={<Navigate to="/" />} />
          </>
         :
          <>
            <Route path="/sign-up" element={<PhoneSignIn />} />
            <Route path="/login" element={<LogIn onNavigation={onNavigation} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        }
      </Routes>
    </Router>
  )
}

export default App