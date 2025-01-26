const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
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

  const telegramBotToken = '7785340752:AAGIkocqu83ACZM3VY_8l_eaZUCIijskpr0';
  const chatId = '1347634066';

  // Send message to Telegram bot
  axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    chat_id: chatId,
    text: message,
  })
    .then(() => {
      // Create the .ics file content
      const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Rendez vous avec Ariela 😊
DTSTART:${date.replace(/-/g, '')}T170000Z
DTEND:${date.replace(/-/g, '')}T180000Z
DESCRIPTION:${message.replace(/\n/g, '\\n')}
END:VEVENT
END:VCALENDAR
              `.trim();

      const icsFilePath = path.join(__dirname, 'event.ics');

      // Write the .ics file
      fs.writeFileSync(icsFilePath, icsContent);
      console.log('ICS file created:', icsFilePath);

      // Prepare FormData to send the file
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('document', fs.createReadStream(icsFilePath));

      // Send the file to Telegram
      return axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendDocument`, formData, {
        headers: formData.getHeaders(), // שימוש נכון בפונקציה
      });
    })
    .then(() => {
      // Send a JSON response
      res.status(200).json({ success: true, message: 'Data sent to Telegram with .ics file' });
    })
    .catch(error => {
      console.error('Error:', error);
      // Send a JSON response for errors
      res.status(500).json({ success: false, message: 'Error sending data to Telegram' });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
