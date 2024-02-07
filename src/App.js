import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PhoneSignIn from "./Components/PhoneSignIn";
import Main from "./Components/Main.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/sign-in" element={<PhoneSignIn />} />
        <Route path="*" element={<Main />} />
      </Routes>
    </Router>
  )
}

export default App;
