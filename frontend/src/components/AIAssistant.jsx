import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Send, X, Loader2, Bot, User, MessageCircle, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { Alert } from './ui/Alert';
import { useReducedMotion } from '../utils/animations';

const SUGGESTED_PROMPTS = [
  'Explain my latest prediction',
  'What does my report contain?',
  'What health metrics should I track?',
  'Explain my health score',
  'What information should I discuss with my doctor?',
  'How can I improve my health score?',
  'What are common symptoms I should watch for?',
  'How does the AI prediction work?',
];

const SYSTEM_PROMPT = `You are MediVerse AI Assistant, a helpful health education companion. 
IMPORTANT GUIDELINES:
- You are NOT a doctor and cannot diagnose, prescribe, or provide medical advice
- Always frame information as general educational content
- Encourage users to consult qualified healthcare professionals
- Be empathetic but clear about limitations
- Use the user's health data (predictions, reports, profile) to provide personalized educational insights
- Never claim medical authority or emergency medical capability`;

export default function AIAssistant({ isOpen, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [messages, reducedMotion]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hello! I'm your MediVerse AI Assistant. I can help you understand your health data, explain predictions, interpret reports, and provide general wellness education.

**I can help with:**
• Explaining your disease predictions and confidence scores
• Interpreting medical report results
• Understanding your health score factors
• General wellness education and tips
• What to discuss with your doctor

**Important:** I'm an AI assistant for educational purposes only. I cannot diagnose conditions, prescribe medications, or replace professional medical advice. Always consult a qualified healthcare provider for medical concerns.

How can I help you today?`,
          timestamp: new Date().toISOString(),
        },
      ]);
      setShowSuggestions(true);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setLoading(true);
    setShowSuggestions(false);
    setError(null);

    try {
      const context = {
        userProfile: user,
        recentPredictions: [], // Could fetch from API
        recentReports: [], // Could fetch from API
      };

      const response = await api.post('/assistant/chat/', {
        message: currentInput,
        context,
        history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response || response.data.message || 'I apologize, but I couldn\'t generate a response. Please try again.',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI Assistant error:', err);
      setError('Unable to connect to AI assistant. Please try again later.');
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment, or you can still ask me general questions about MediVerse AI features!",
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (prompt) => {
    setInput(prompt);
    handleSend();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  const panelContent = (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-20 right-4 w-full max-w-md sm:max-w-lg lg:max-w-xl h-[60vh] max-h-[70vh] bg-white dark:bg-slateink-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slateink-700 flex flex-col z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="AI Health Assistant"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slateink-700 bg-gray-50 dark:bg-slateink-950/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">MediVerse AI Assistant</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Educational Health Companion</p>
          </div>
        </div>
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-slateink-800 transition-colors"
          aria-label="Close assistant"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Error Banner */}
      {error && (
        <Alert variant="error" title="Connection Issue" dismissible onDismiss={() => setError(null)} className="m-3">
          {error}
        </Alert>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
        {showSuggestions && messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.slice(0, 6).map((prompt, index) => (
                <motion.button
                  key={prompt}
                  onClick={() => handleSuggestionClick(prompt)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slateink-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slateink-700 transition-colors text-left"
                >
                  {prompt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}
          >
            <Avatar
              name={message.role === 'user' ? user?.username : 'AI'}
              size="sm"
              src={message.role === 'assistant' ? undefined : undefined}
            >
              {message.role === 'assistant' && <Sparkles className="w-4 h-4 text-primary-500" />}
            </Avatar>
            <div className={cn('max-w-[80%]', message.role === 'user' ? 'text-right' : 'text-left')}>
              <div className={cn(
                'inline-block px-4 py-2 rounded-2xl text-sm leading-relaxed',
                message.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm'
                  : 'bg-gray-100 dark:bg-slateink-800 text-gray-900 dark:text-slate-100 rounded-tl-sm'
              )}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.role === 'assistant' && !message.isError && (
                  <motion.button
                    onClick={() => copyToClipboard(message.content)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute -top-6 -right-2 p-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Copy message"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </div>
              <time className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </time>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div
            key="typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <Avatar name="AI" size="sm"><Sparkles className="w-4 h-4 text-primary-500" /></Avatar>
            <div className="bg-gray-100 dark:bg-slateink-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                    className="w-2 h-2 bg-primary-500 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-slateink-700 bg-gray-50 dark:bg-slateink-950/60">
        <div className="flex items-end gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your health data..."
            disabled={loading}
            rows={1}
            maxRows={4}
            className="flex-1 min-h-[44px]"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            loading={loading}
            variant="primary"
            size="icon"
            className="h-10"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
          AI responses are for educational purposes only. Not medical advice.
        </p>
      </div>
    </motion.div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(panelContent, document.body);
}