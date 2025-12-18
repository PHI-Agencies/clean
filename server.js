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
.then(() => console.log("✅ MongoDB Connecté"))
.catch(err => console.error("❌ Erreur MongoDB:", err));

// Modèle de données
const Devis = mongoose.model('Devis', new mongoose.Schema({
    details: String,
    date: { type: Date, default: Date.now }
}));

// Route API Chat
app.post('/api/chat', async (req, res) => {
    try {
        const { history } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;
        
        // URL Corrigée (v1beta est nécessaire pour les messages system)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await axios.post(url, { 
            contents: history 
        });

        if (!response.data.candidates) {
            return res.status(500).json({ error: "Réponse vide de l'IA" });
        }

        const aiText = response.data.candidates[0].content.parts[0].text;

        // Sauvegarde si le processus est fini
        if (aiText.includes("[GENERER_WHATSAPP]")) {
            await new Devis({ details: aiText.replace("[GENERER_WHATSAPP]", "") }).save();
        }

        res.json({ text: aiText });
    } catch (error) {
        console.error("Erreur détaillée:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Erreur lors de l'appel à Gemini" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur actif sur le port ${PORT}`));