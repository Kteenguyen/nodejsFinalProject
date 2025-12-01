import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatWindow = ({ user }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Xin chào! PhoneWorld có thể giúp gì cho bạn?", sender: "admin", time: "10:00" },
    ]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msg = {
            id: Date.now(),
            text: newMessage,
            sender: "user",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, msg]);
        setNewMessage("");

        // Giả lập Shop trả lời sau 1s
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Cảm ơn bạn đã nhắn tin. Nhân viên sẽ phản hồi sớm nhất ạ!",
                sender: "admin",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[600px] md:h-[700px] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            {/* Header Chat */}
            <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                            PW
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">Hỗ trợ khách hàng</h3>
                        <p className="text-xs text-green-600 font-medium">Thường trả lời trong 5 phút</p>
                    </div>
                </div>
                <div className="flex gap-2 text-gray-400">
                    <button className="p-2 hover:bg-gray-100 rounded-full"><Phone size={20} /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-full"><MoreVertical size={20} /></button>
                </div>
            </div>

            {/* Nội dung tin nhắn */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5]">
                <div className="text-center text-xs text-gray-400 my-4">Hôm nay</div>
                
                {messages.map((msg) => {
                    const isUser = msg.sender === "user";
                    return (
                        <motion.div 
                            key={msg.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm relative group
                                ${isUser 
                                    ? "bg-indigo-600 text-white rounded-tr-none" 
                                    : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                                }
                            `}>
                                <p>{msg.text}</p>
                                <span className={`text-[10px] block text-right mt-1 opacity-70 ${isUser ? 'text-indigo-100' : 'text-gray-400'}`}>
                                    {msg.time}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-3 border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button type="button" className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-full transition">
                        <Paperclip size={20} />
                    </button>
                    <div className="flex-1 relative">
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="w-full bg-gray-100 text-gray-800 text-sm rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                        />
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500">
                            <Smile size={20} />
                        </button>
                    </div>
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-indigo-200"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;