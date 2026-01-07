import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AuthModal from './ui/AuthModal';
import { isAuthenticated as checkAuth, setAuthenticated } from '../../store/authStore';

export default function ProtectedRoute() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const authenticated = checkAuth();
        setIsAuthenticated(authenticated);
        setShowModal(!authenticated);
    }, []);

    const handleAuthSuccess = () => {
        setAuthenticated(true);
        setIsAuthenticated(true);
        setShowModal(false);
    };

    if (!isAuthenticated) {
        return <AuthModal isOpen={showModal} onSuccess={handleAuthSuccess} />;
    }

    return <Outlet />;
}
