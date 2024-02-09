import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PhoneSignIn from "./Components/PhoneSignUp";
import Main from "./Components/Main.js";
import PrivateRoutes from './PrivateRoutes';
import { getAuth } from "firebase/auth";

function App() {
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    // Show loading indicator while checking authentication status
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route element={<PrivateRoutes auth={user}/>}>
          <Route path='/' element={<Main />} />
        </Route>
        
        <Route path="/sign-up" element={<PhoneSignIn />} />
         
        <Route element={<PrivateRoutes auth={user}/>}>
          <Route path='*' element={<Navigate to="/" />} />
        </Route>

        <Route path="*" element={<Navigate to="/sign-up" />} />
      </Routes>
    </Router>
  )
}

export default App;
