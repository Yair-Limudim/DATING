const express = require('express');
const cors = require('cors'); // Import the cors package
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to handle data submission
app.post('/submit', (req, res) => {
  const { date, food, dessert, activity } = req.body;
  const formattedFood = food.map(item => `• ${item}`).join('\n');
  const formattedDessert = dessert.map(item => `• ${item}`).join('\n');
  const formattedActivity = activity.map(item => `• ${item}`).join('\n');

  const message = `📅 Date: ${date}\n\n🍔 Food:\n${formattedFood}\n\n🍰 Dessert:\n${formattedDessert}\n\n🎉 Activity:\n${formattedActivity}`;

  const telegramBotToken = '7759584960:AAGGJs85FrqyMwpp-6pkOkF7DUlXH7a87X8';
  const chatId = '6069572476';

  // Send message to Telegram bot
  axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    chat_id: chatId,
    text: message,
  })
    .then(response => {
      // Send a JSON response
      res.status(200).json({ success: true, message: 'Data sent to Telegram' });
    })
    .catch(error => {
      // Send a JSON response for errors
      res.status(500).json({ success: false, message: 'Error sending data to Telegram' });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
