// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// =====================
// 1. MongoDB
// =====================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch(err => console.error("❌ MongoDB erreur :", err));

// =====================
// 2. Modèle
// =====================
const Devis = mongoose.model('Devis', new mongoose.Schema({
  details: String,
  date: { type: Date, default: Date.now }
}));

// =====================
// 3. Route IA (CORRIGÉE)
// =====================
app.post('/api/chat', async (req, res) => {
  try {
    const { history } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "Clé Gemini absente" });
    }

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await axios.post(url, {
      contents: history
    }, {
      timeout: 15000 // ⏱ évite le blocage Render
    });

    const aiText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      return res.status(500).json({ error: "Réponse IA vide" });
    }

    if (aiText.includes("[GENERER_WHATSAPP]")) {
      await new Devis({ details: aiText }).save();
    }

    res.json({ text: aiText });

  } catch (err) {
    console.error("❌ Gemini erreur :", err.response?.data || err.message);
    res.status(500).json({ error: "Erreur IA Gemini" });
  }
});

// =====================
// 4. Serveur
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Serveur actif sur le port ${PORT}`)
);
