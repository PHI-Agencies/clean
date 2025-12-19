import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Variables pour le path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clé Gemini depuis Render (via Dashboard)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY non définie !");
}

// --- API Chat ---
app.post("/api/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) return res.status(400).json({ reply: "Message vide." });

        const prompt = `
Tu es ZakaSania, un assistant IA pour une entreprise de services à domicile.
Tu réponds simplement, clairement et poliment aux questions des utilisateurs.
Tu parles toujours en français.
Ne fais pas de réponses trop longues.

Question utilisateur :
${userMessage}
        `;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            }
        );

        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je ne peux pas répondre pour le moment.";

        res.json({ reply });

    } catch (err) {
        console.error(err);
        res.status(500).json({ reply: "Erreur serveur." });
    }
});

// --- Servir le frontend ---
app.use(express.static(__dirname));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "IA.html"));
});

// --- Port dynamique Render ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur ZakaSania actif sur le port ${PORT}`);
});
