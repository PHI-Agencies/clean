import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose"; // 1. Ajout de Mongoose

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Connexion MongoDB Atlas ---
const MONGO_URI = process.env.MONGODB_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connecté à MongoDB Atlas"))
    .catch(err => console.error("❌ Erreur MongoDB:", err));

const Client = mongoose.model('Client', {
    name: String,
    phone: String,
    date: { type: Date, default: Date.now }
});

// --- API Enregistrement Client ---
app.post("/api/register", async (req, res) => {
    try {
        const { name, phone } = req.body;
        const newClient = new Client({ name, phone });
        await newClient.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Clé Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- API Chat Gemini (Ton code existant) ---
app.post("/api/chat", async (req, res) => {
    // ... Garde ton code Gemini tel quel ...
});

// --- Servir le frontend ---
app.use(express.static(__dirname));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html")); // On sert index.html par défaut
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur ZakaSania actif sur le port ${PORT}`);
});