import React, { createContext, useContext, useState, useCallback } from 'react'

const ChatContext = createContext()

export function ChatProvider({ children }) {
    const [messages, setMessages] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [contextData, setContextData] = useState(null) // 분석된 계약 데이터
    const [isLoading, setIsLoading] = useState(false)

    const addMessage = useCallback((message) => {
        setMessages(prev => [...prev, message])
    }, [])

    const toggleChat = useCallback(() => {
        setIsOpen(prev => !prev)
    }, [])

    const openChat = useCallback(() => {
        setIsOpen(true)
    }, [])

    const closeChat = useCallback(() => {
        setIsOpen(false)
    }, [])

    const clearMessages = useCallback(() => {
        setMessages([])
    }, [])

    const updateContextData = useCallback((data) => {
        setContextData(data)
    }, [])

    const value = {
        messages,
        setMessages, // 직접 제어 필요 시
        addMessage,
        isOpen,
        toggleChat,
        openChat,
        closeChat,
        contextData,
        updateContextData,
        isLoading,
        setIsLoading,
        clearMessages
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat() {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider')
    }
    return context
}
