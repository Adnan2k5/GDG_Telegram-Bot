// Import required modules
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Replace with your bot token from BotFather
const BOT_TOKEN = '7203011185:AAGWX_p8CmRcuRFPe2kkysrrkQ_W4ZuJYRk'; // <-- Replace this with your bot token
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// List of allowed users (add the user IDs here)
const ALLOWED_USERS = ['Adnan2k5']; // <-- Replace with actual Telegram user IDs

// Webhook endpoint to receive updates
app.post('/api/webhook', async (req, res) => {
    const { message } = req.body;

    if (!message || !message.text) {
        return res.status(200).send('No message');
    }

    const chatId = message.chat.id;
    const text = message.text;
    const senderId = message.from.id;
    const messageId = message.message_id;

    // Check if the message contains a link
    if (text.includes('https://') || text.includes('http://')) {
        // Check if the user is allowed to send links
        if (!ALLOWED_USERS.includes(senderId)) {
            // Delete the message if the user is not allowed to send links
            await deleteMessage(chatId, messageId);
            // Notify the group that the link was removed
            await sendMessage(chatId, 'Unwanted link detected and removed!');
        }
    }

    res.status(200).send('Message processed');
});

// Function to send messages
async function sendMessage(chatId, text) {
    const url = `${TELEGRAM_API}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
        }),
    });
}

// Function to delete messages
async function deleteMessage(chatId, messageId) {
    const url = `${TELEGRAM_API}/deleteMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
        }),
    });
}

// Endpoint to set the webhook (use this for initial setup)
app.get('/setWebhook', async (req, res) => {
    const webhookUrl = `https://${req.headers.host}/api/webhook`; // URL for webhook
    const url = `${TELEGRAM_API}/setWebhook?url=${webhookUrl}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.ok) {
        res.status(200).send('Webhook set successfully');
    } else {
        res.status(500).send('Error setting webhook');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
