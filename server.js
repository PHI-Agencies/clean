const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
  try {
    const { history } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // URL v1beta pour Gemini 1.5 Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await axios.post(url, {
      contents: history
    });

    const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      return res.status(500).json({ error: "L'IA n'a pas renvoyé de texte." });
    }

    res.json({ text: aiText });

  } catch (err) {
    console.error("❌ Erreur Gemini :", err.response?.data || err.message);
    res.status(500).json({ error: "Erreur de communication avec l'IA" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur actif sur le port ${PORT}`));