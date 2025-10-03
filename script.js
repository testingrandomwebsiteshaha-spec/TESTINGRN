const API_KEY = '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'; // Replace with your OpenAI API key
const API_URL = 'https://api.openai.com/v1/chat/completions';

const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');

let conversationHistory = []; // To maintain context across messages

// Send message function
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Disable input and button
    userInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';

    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';

    try {
        // Prepare messages for API (include history for context)
        const messages = [
            ...conversationHistory,
            { role: 'user', content: message }
        ];

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 500, // Limit response length for simplicity
                temperature: 0.7 // Creativity level
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const botReply = data.choices[0].message.content;

        // Add bot response to chat
        addMessage(botReply, 'bot');

        // Update conversation history
        conversationHistory = messages.slice(-10); // Keep last 10 exchanges for context (to avoid token limits)
        conversationHistory.push({ role: 'assistant', content: botReply });

    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, I encountered an error. Please try again. (Check your API key and internet connection.)', 'bot');
    } finally {
        // Re-enable input
        userInput.disabled = false;
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
        userInput.focus();
    }
}

// Add message to chat UI
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Focus input on load
userInput.focus();
