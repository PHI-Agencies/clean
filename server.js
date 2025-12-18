const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('.')); // Sert tes fichiers index.html, style.css, etc.

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connecté à MongoDB FasoPropre"))
    .catch(err => console.error("Erreur MongoDB:", err));

// Modèle de données pour les devis
const DevisSchema = new mongoose.Schema({
    client: String,
    details: String,
    date: { type: Date, default: Date.now }
});
const Devis = mongoose.model('Devis', DevisSchema);

// Route pour parler à l'IA (Proxy sécurisé)
app.post('/api/chat', async (req, res) => {
    try {
        const { history } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await axios.post(url, { contents: history });
        const aiText = response.data.candidates[0].content.parts[0].text;

        // Si l'IA a fini le résumé, on enregistre en base de données
        if (aiText.includes("[FINAL]")) {
            const newDevis = new Devis({
                client: "Client FasoPropre", // On pourrait extraire le nom avec l'IA plus tard
                details: aiText.replace("[FINAL]", "")
            });
            await newDevis.save();
        }

        res.json({ text: aiText });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));