import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import EventList from '../pages/EventList';
import EventDetails from '../pages/EventDetails';
import CreateEvent from '../pages/CreateEvent';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ShareEvent from '../pages/ShareEvent';
import JoinEvent from '../pages/JoinEvent';
import PrivateRoute from '../components/PrivateRoute';
import SharedEventView from '../pages/SharedEventView';

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/events/share/:shareCode" element={<JoinEvent />} />
    {/* Protected Routes */}
    <Route path="/events" element={
      <PrivateRoute>
        <EventList />
      </PrivateRoute>
    } />
    <Route path="/events/:id" element={
      <PrivateRoute>
        <EventDetails />
      </PrivateRoute>
    } />
    <Route path="/events/:id/share" element={
      <PrivateRoute>
        <ShareEvent />
      </PrivateRoute>
    } />
    <Route path="/create-event" element={
      <PrivateRoute>
        <CreateEvent />
      </PrivateRoute>
    } />
    <Route path="/view/:shareCode" element={<SharedEventView />} />
  </Routes>
);

export default AppRouter; 