import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { cn } from '../../utils/cn';
import { Send, Bot, Sparkles, Copy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Alert } from '../../components/ui/Alert';
import { useReducedMotion } from '../../utils/animations';

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

export default function AIAssistantPage() {
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
    if (messages.length === 0) {
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
  }, []);

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
      const response = await api.post('/assistant/chat/', {
        message: currentInput,
        context: { userProfile: user },
        history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response || response.data.message || "I apologize, but I couldn't generate a response. Please try again.",
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

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-soft">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="section-eyebrow">AI Companion</p>
            <h1 className="text-2xl font-bold text-slateink-900 dark:text-white">AI Health Assistant</h1>
            <p className="text-slate-500 mt-1">Your educational health companion</p>
          </div>
        </div>
        <Alert variant="info" className="text-sm">
          I provide educational health information only. I cannot diagnose, prescribe, or replace professional medical advice.
        </Alert>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="h-[60vh] flex flex-col"
      >
        <Card className="flex-1 flex flex-col h-full !p-0">
          <CardHeader className="border-b border-slate-200 dark:border-slateink-800 pb-3 bg-slate-50/60 dark:bg-slateink-950/40 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                Conversation
              </CardTitle>
              <Badge variant="outline" dot dotColor="bg-green-500">Ready</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
                {showSuggestions && messages.length <= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 px-2">Suggested questions:</p>
                    <div className="flex flex-wrap gap-2 px-2">
                      {SUGGESTED_PROMPTS.map((prompt, index) => (
                        <motion.button
                          key={prompt}
                          onClick={() => handleSuggestionClick(prompt)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="px-3.5 py-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slateink-900 rounded-xl hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-950/40 dark:hover:text-primary-300 transition-colors text-left border border-slate-200 dark:border-slateink-800"
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
                    className={cn('flex gap-3 px-4', message.role === 'user' && 'flex-row-reverse')}
                  >
                    <Avatar
                      name={message.role === 'user' ? user?.username || 'You' : 'AI'}
                      size="sm"
                    >
                      {message.role === 'assistant' && <Sparkles className="w-4 h-4 text-primary-500" />}
                    </Avatar>
                    <div className={cn('max-w-[85%]', message.role === 'user' ? 'text-right' : 'text-left')}>
                      <div
                        className={cn(
                          'inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed text-left',
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-sm shadow-soft'
                            : 'bg-slate-100 dark:bg-slateink-900 text-slateink-900 dark:text-white rounded-tl-sm border border-slate-200 dark:border-slateink-800'
                        )}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.role === 'assistant' && !message.isError && (
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            aria-label="Copy message"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                        )}
                      </div>
                      <time className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">
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
                    className="flex gap-3 px-4"
                  >
                    <Avatar name="AI" size="sm"><Sparkles className="w-4 h-4 text-primary-500" /></Avatar>
                    <div className="bg-slate-100 dark:bg-slateink-900 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-200 dark:border-slateink-800">
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

              {error && (
                <Alert variant="error" title="Connection Issue" dismissible onDismiss={() => setError(null)} className="m-4">
                  {error}
                </Alert>
              )}

              <div className="p-4 border-t border-slate-200 dark:border-slateink-800 bg-slate-50/60 dark:bg-slateink-950/40">
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
                    className="h-[44px]"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2.5 text-center">
                  AI responses are for educational purposes only. Not medical advice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card !p-6"
      >
        <CardHeader className="!p-0">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="!p-0">
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <Button variant="outline" onClick={() => handleSuggestionClick('Explain my latest prediction')} className="text-left justify-start">
              Latest Prediction
            </Button>
            <Button variant="outline" onClick={() => handleSuggestionClick('What does my report contain?')} className="text-left justify-start">
              Report Summary
            </Button>
            <Button variant="outline" onClick={() => handleSuggestionClick('Explain my health score')} className="text-left justify-start">
              Health Score
            </Button>
            <Button variant="outline" onClick={() => handleSuggestionClick('What should I discuss with my doctor?')} className="text-left justify-start">
              Doctor Discussion
            </Button>
          </div>
        </CardContent>
      </motion.div>
    </div>
  );
}