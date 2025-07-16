import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Login from './pages/login';
import Signup from './pages/Signup';
import ChooseShape from './pages/ChooseShape'; 
import OccasionRecommendation from './pages/OccasionRecommendation';
import WeatherRecommendation from './pages/WeatherRecommendation';
import SkinToneDetection from './pages/SkinToneDetection';
import PrivateRoute from './PrivateRoute.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Welcome page as the entry point */}
        <Route path="/" element={<Welcome />} />
        
        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes - require authentication */}
        <Route path="/home" element={
          <PrivateRoute>
            <Navbar />
            <Home />
          </PrivateRoute>
        } />
        <Route path="/shape" element={
          <PrivateRoute>
            <Navbar />
            <ChooseShape />
          </PrivateRoute>
        } />
        <Route path="/occasion" element={
          <PrivateRoute>
            <Navbar />
            <OccasionRecommendation />
          </PrivateRoute>
        } />
        <Route path="/weather" element={
          <PrivateRoute>
            <Navbar />
            <WeatherRecommendation />
          </PrivateRoute>
        } />
        <Route path="/skintone" element={
          <PrivateRoute>
            <Navbar />
            <SkinToneDetection />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
