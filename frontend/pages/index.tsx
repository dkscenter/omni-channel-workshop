import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your Nest.js server URL

export default function ChatBox() {
    const [userId, setUserId] = useState('Me');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const [messages, setMessages] = useState<{ sender: string; content: string }[]>([]);

    useEffect(() => {
        // Listen for message status updates
        socket.on('messageStatus', (data) => {
            setStatus(data.status);
        });

        // Listen for messages sent from the Omni-Channel Service
        socket.on('receivedMessage', (data) => {
            setMessages(prevMessages => [...prevMessages, { sender: data.userId, content: data.message }]);
        });

        return () => {
            socket.off('messageStatus');
            socket.off('receivedMessage');
        };
    }, []);

    const sendMessage = () => {
        if (userId && message) {
            socket.emit('sendMessage', { userId, message });
            setMessages(prevMessages => [...prevMessages, { sender: userId, content: message }]);
            setMessage('');
        } else {
            alert('Please enter both User ID and Message.');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-3xl font-bold mb-6">Two-Way Chat</h1>

            <div className="w-full max-w-md flex flex-col bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Chat Display */}
                <div className="flex-grow p-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`my-2 p-3 rounded-lg ${msg.sender === userId ? 'bg-blue-100 self-end' : 'bg-gray-200 self-start'}`}
                            style={{ maxWidth: '70%' }}
                        >
                            <p className="text-xs font-semibold text-gray-600">{msg.sender === userId ? 'You' : msg.sender}</p>
                            <p className="text-sm">{msg.content}</p>
                        </div>
                    ))}
                </div>

                {/* User ID Input */}
                {/* <div className="flex items-center px-4 py-2 border-t border-gray-300">
                    <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Your User ID"
                        className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                    />
                </div> */}

                {/* Message Input */}
                <div className="flex items-center px-4 py-2 border-t border-gray-300">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message"
                        className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                        onKeyPress={handleKeyPress} // Add this line for Enter key support
                    />
                    <button
                        onClick={sendMessage}
                        className="p-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition duration-200"
                    >
                        Send
                    </button>
                </div>

                {/* Status */}
                <div className="p-2 text-center text-sm text-gray-500">Status: {status}</div>
            </div>
        </div>
    );
}
