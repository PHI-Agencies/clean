const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB FasoPropre Connecté"))
.catch(err => console.error("❌ Erreur MongoDB:", err));

// Modèle de données pour stocker les prospects
const Devis = mongoose.model('Devis', new mongoose.Schema({
    details: String,
    date: { type: Date, default: Date.now }
}));

// Endpoint pour discuter avec Gemini
app.post('/api/chat', async (req, res) => {
    try {
        const { history } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        // Envoi de la requête à Gemini
        const response = await axios.post(url, { contents: history });
        const aiText = response.data.candidates[0].content.parts[0].text;

        // Si l'IA détecte que toutes les infos sont là, elle doit inclure [GENERER_WHATSAPP]
        if (aiText.includes("[GENERER_WHATSAPP]")) {
            await new Devis({ details: aiText }).save(); // Sauvegarde dans MongoDB
        }

        res.json({ text: aiText });
    } catch (error) {
        console.error("Erreur API Gemini:", error);
        res.status(500).json({ error: "L'IA est indisponible" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur sur port ${PORT}`));