const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Configuration Gemini
const genAI = new GoogleGenerativeAI("VOTRE_CLE_API_GEMINI");
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "Tu es un assistant de commande. Demande le Nom, le Produit et la Ville. Une fois fini, envoie un récapitulatif."
});

// Historique en mémoire (pour cet exemple simple)
let chatSession = model.startChat({ history: [] });

app.post('/chat', async (req, res) => {
    try {
        const userMsg = req.body.message;
        const result = await chatSession.sendMessage(userMsg);
        const responseText = result.response.text();
        
        res.json({ reply: responseText });
    } catch (error) {
        res.status(500).json({ reply: "Erreur de connexion à l'IA." });
    }
});

app.listen(3000, () => console.log("Serveur lancé sur http://localhost:3000"));