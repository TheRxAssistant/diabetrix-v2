import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';

interface AuthModalProps {
    isOpen: boolean;
    onSuccess: () => void;
}

export default function AuthModal({ isOpen, onSuccess }: AuthModalProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API call delay
        setTimeout(() => {
            if (username === 'admin' && password === 'password') {
                setIsLoading(false);
                onSuccess();
            } else {
                setIsLoading(false);
                setError('Invalid username or password');
            }
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white bg-opacity-20 backdrop-blur-md">
            <Card className="w-full max-w-md mx-4">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0078D4] focus:border-transparent"
                                placeholder="Enter username"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0078D4] focus:border-transparent"
                                placeholder="Enter password"
                                required
                            />
                        </div>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                        <Button type="primary" htmlType="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
