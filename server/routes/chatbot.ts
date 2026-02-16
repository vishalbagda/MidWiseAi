import { RequestHandler } from "express";
import { aiService } from "../services/aiService";

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: string;
  type?: 'text' | 'quick_reply' | 'suggestion';
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  context: string;
  createdAt: string;
  lastActivity: string;
}

// In-memory storage for demo (use database in production)
const chatSessions = new Map<string, ChatSession>();

export const startChatSession: RequestHandler = async (req, res) => {
  try {
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const initialMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      message: "Hello! I'm MedWise AI, your healthcare assistant. I can help you understand prescriptions, manage medicines responsibly, and answer general health questions. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    const session: ChatSession = {
      id: sessionId,
      messages: [initialMessage],
      context: '',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    chatSessions.set(sessionId, session);

    const quickReplies = [
      "Help with prescription",
      "Medicine disposal guidance",
      "OTC recommendations",
      "General health question"
    ];

    res.json({
      success: true,
      data: {
        sessionId,
        initialMessage,
        quickReplies,
        features: [
          "Prescription analysis",
          "Medicine management",
          "OTC suggestions",
          "Health education"
        ]
      }
    });

  } catch (error) {
    console.error('Start chat session error:', error);
    res.status(500).json({
      error: 'Session creation failed',
      message: 'Failed to start chat session'
    });
  }
};

export const sendMessage: RequestHandler = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Session ID and message are required'
      });
    }

    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Chat session does not exist or has expired'
      });
    }

    // Add user message to session
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      message,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    session.messages.push(userMessage);

    // Get AI response
    const botResponse = await aiService.chatbotResponse(message, session.context);

    const botMessage: ChatMessage = {
      id: `msg_${Date.now()}_bot`,
      message: botResponse,
      sender: 'bot',
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    session.messages.push(botMessage);
    session.lastActivity = new Date().toISOString();
    session.context += `\nUser: ${message}\nBot: ${botResponse}`;

    // Generate contextual suggestions
    const suggestions = generateSuggestions(message, session.context);

    res.json({
      success: true,
      data: {
        userMessage,
        botMessage,
        suggestions,
        sessionInfo: {
          id: sessionId,
          messageCount: session.messages.length,
          lastActivity: session.lastActivity
        }
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Message failed',
      message: error instanceof Error ? error.message : 'Failed to process message'
    });
  }
};

export const getChatHistory: RequestHandler = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Chat session does not exist'
      });
    }

    res.json({
      success: true,
      data: {
        sessionId,
        messages: session.messages,
        messageCount: session.messages.length,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
      }
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      error: 'History retrieval failed',
      message: 'Failed to retrieve chat history'
    });
  }
};

export const endChatSession: RequestHandler = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Chat session does not exist'
      });
    }

    // Clean up session
    chatSessions.delete(sessionId);

    res.json({
      success: true,
      data: {
        message: "Chat session ended successfully",
        sessionId,
        duration: Date.now() - new Date(session.createdAt).getTime(),
        messageCount: session.messages.length
      }
    });

  } catch (error) {
    console.error('End chat session error:', error);
    res.status(500).json({
      error: 'Session termination failed',
      message: 'Failed to end chat session'
    });
  }
};

export const getQuickReplies: RequestHandler = async (req, res) => {
  try {
    const quickReplies = [
      {
        text: "How do I read my prescription?",
        category: "prescription"
      },
      {
        text: "Is this medicine expired?",
        category: "expiry"
      },
      {
        text: "Where can I donate unused medicines?",
        category: "donation"
      },
      {
        text: "What should I take for a headache?",
        category: "otc"
      },
      {
        text: "How do I dispose of old medicines?",
        category: "disposal"
      },
      {
        text: "Can I take these medicines together?",
        category: "interactions"
      }
    ];

    res.json({
      success: true,
      data: {
        quickReplies,
        categories: ["prescription", "expiry", "donation", "otc", "disposal", "interactions"],
        total: quickReplies.length
      }
    });

  } catch (error) {
    console.error('Get quick replies error:', error);
    res.status(500).json({
      error: 'Failed to fetch quick replies',
      message: 'Could not retrieve quick reply options'
    });
  }
};

function generateSuggestions(userMessage: string, context: string): string[] {
  const message = userMessage.toLowerCase();
  
  if (message.includes('prescription') || message.includes('medicine')) {
    return [
      "Upload prescription for analysis",
      "Scan medicine strip",
      "Check medicine interactions"
    ];
  }
  
  if (message.includes('pain') || message.includes('headache') || message.includes('fever')) {
    return [
      "Get OTC recommendations",
      "Learn about pain relievers",
      "When to see a doctor"
    ];
  }
  
  if (message.includes('expired') || message.includes('dispose') || message.includes('old')) {
    return [
      "Find disposal locations",
      "Donation guidelines",
      "Safe disposal methods"
    ];
  }
  
  return [
    "Ask another question",
    "Upload prescription",
    "Scan medicine strip",
    "Get OTC suggestions"
  ];
}

// Cleanup old sessions periodically (every hour)
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  for (const [sessionId, session] of chatSessions.entries()) {
    if (new Date(session.lastActivity).getTime() < oneHourAgo) {
      chatSessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000);
