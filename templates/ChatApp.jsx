import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    // Add message sending logic here
    setLoading(false);
  };

  return (
    <div className="p-4">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Chat messages will go here */}
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-2 border rounded-lg"
                placeholder="Type your message..."
              />
              <Button
                onClick={sendMessage}
                disabled={loading}
                className="h-20 w-20 rounded-full flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Send className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatApp;