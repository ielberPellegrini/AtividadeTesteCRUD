import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import PointRegistration from './components/PointRegistration';
import PointHistory from './components/PointHistory';
import Login from './components/Login';
import ManagePoints from './components/ManagePoints';

function App() {
    return (
        <Router>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/baterponto" element={<PointRegistration />} />
            <Route path="/historico" element={<PointHistory />} />
            <Route path="/gerenciar" element={<Login />} />
            <Route path="/gerenciando" element={<ManagePoints />} />
        </Routes>
        </Router>
    );
}

    export default App;
