const express = require('express');
const cors = require('cors'); // Import the cors package
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const app = express();
const port = 3000;
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
@@ -27,17 +35,49 @@ app.post('/submit', (req, res) => {
    chat_id: chatId,
    text: message,
  })
    .then(response => {
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
      res.status(200).json({ success: true, message: 'Data sent to Telegram' });
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
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Server running on port ${port}`);
});
