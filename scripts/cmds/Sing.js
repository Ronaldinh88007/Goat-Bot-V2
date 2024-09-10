const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing the incoming request body
app.use(bodyParser.json());

// Facebook verification route
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = 'your_verify_token_here';
    
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Handle messages
app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            const webhookEvent = entry.messaging[0];
            const senderId = webhookEvent.sender.id;

            if (webhookEvent.message && webhookEvent.message.text) {
                const receivedMessage = webhookEvent.message.text.toLowerCase();

                if (receivedMessage.startsWith('/sing')) {
                    const songRequest = receivedMessage.replace('/sing', '').trim();
                    let responseText = `🎶 La la la... 🎶`;

                    if (songRequest) {
                        responseText = `🎶 Singing: "${songRequest}" 🎶\nLa la la...`;
                    }

                    sendTextMessage(senderId, responseText);
                }
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Function to send a text message
function sendTextMessage(senderId, messageText) {
    const PAGE_ACCESS_TOKEN = 'your_page_access_token_here';

    const messageData = {
        recipient: {
            id: senderId,
        },
        message: {
            text: messageText,
        },
    };

    axios.post(`https://graph.facebook.com/v11.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, messageData)
        .then(response => {
            console.log('Message sent:', response.data);
        })
        .catch(error => {
            console.error('Unable to send message:', error.response.data);
        });
}

app.listen(PORT, () => {
    console.log(`Messenger bot is running on port ${PORT}`);
});
                  
