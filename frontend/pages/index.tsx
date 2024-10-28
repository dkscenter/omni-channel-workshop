import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your Nest.js server URL

export default function Home() {
    const [userId, setUserId] = useState(''); // State for User ID
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        socket.on('messageStatus', (data) => {
            setStatus(data.status);
        });

        return () => {
            socket.off('messageStatus');
        };
    }, []);

    const sendMessage = () => {
        if (userId && message) {
            socket.emit('sendMessage', { userId, message });
            setMessage(''); // Clear the message input field after sending
        } else {
            alert('Please enter both User ID and Message.'); // Alert if either field is empty
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Real-Time Messaging</h1>
            <div className="w-full max-w-md">
                <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter your User ID"
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message"
                    className="mt-3 w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={sendMessage}
                    className="mt-3 w-full p-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-200"
                >
                    Send Message
                </button>
                <p className="mt-4 text-lg">Status: <span className="font-semibold">{status}</span></p>
            </div>
        </div>
    );
}
