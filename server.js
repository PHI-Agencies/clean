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

// --- 1. Connexion à MongoDB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connecté"))
    .catch(err => console.error("❌ Erreur MongoDB:", err));

// --- 2. Modèle de données ---
const DevisSchema = new mongoose.Schema({
    client: String,
    details: String,
    date: { type: Date, default: Date.now }
});
const Devis = mongoose.model('Devis', DevisSchema);

// --- 3. Route API Chat ---
app.post('/api/chat', async (req, res) => {
    try {
        const { history } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: "Clé API Gemini manquante" });
        }

        // --- Transformer l'historique en prompt ---
        const prompt = history
            .map(h => h.parts.map(p => p.text).join(" "))
            .join("\n");

        // --- URL du modèle stable ---
        const url = `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText?key=${API_KEY}`;

        const response = await axios.post(url, {
            prompt: prompt,
            temperature: 0.7,
            max_output_tokens: 500
        });

        if (!response.data.candidates || response.data.candidates.length === 0) {
            return res.status(500).json({ error: "Réponse vide de l'IA" });
        }

        const aiText = response.data.candidates[0].content;

        // --- Sauvegarde si le texte contient la commande finale ---
        if (aiText.includes("[FINAL]")) {
            const cleanText = aiText.replace("[FINAL]", "").trim();
            await new Devis({
                client: "Client FasoPropre", // tu peux extraire le nom avec l'IA plus tard
                details: cleanText
            }).save();
        }

        res.json({ text: aiText });

    } catch (error) {
        console.error("Erreur Gemini:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Erreur lors de l'appel à Gemini" });
    }
});

// --- 4. Démarrage du serveur ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur actif sur le port ${PORT}`));
