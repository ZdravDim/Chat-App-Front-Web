import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import axios from 'axios'

import PhoneSignIn from "./Components/PhoneSignUp";
import Main from "./Components/Main.js";
import LogIn from './Components/LogIn.js';

function App() {

  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  const onNavigation = useCallback(() => {

    axios.get('http://localhost:3001/status', { withCredentials: true })
		.then(function (response) {
			if (response.status === 200) {
        if (response.data.status === "logged-in") setLoggedIn(true);
        else setLoggedIn(false);
      }
      else setLoggedIn(false);
		})
		.catch(function (error) {
			setLoggedIn(false);
		});

    setLoading(false);
  }, []);

  useEffect(() => {
    onNavigation()
  }, [onNavigation]);

  if (loading) {
    // Show loading indicator while checking authentication status
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {loggedIn ?
          <>
            <Route path='/' element={<Main onNavigation={onNavigation}/>} />
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
