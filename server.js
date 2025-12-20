import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import fetch from "node-fetch"; // Assurez-vous d'avoir "node-fetch" dans votre package.json
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- MongoDB Native avec Gestion TLS ---
const client = new MongoClient(process.env.MONGODB_URI, {
  tls: true,
  tlsAllowInvalidCertificates: false, // vérifie que le certificat est valide
});

let db;

async function getDB() {
  if (!db) {
    try {
      await client.connect();
      db = client.db("fasopropre_ai"); // Nom de la base
      console.log("✅ Connecté à MongoDB Atlas");
    } catch (err) {
      console.error("❌ Erreur de connexion MongoDB:", err.message);
      return null;
    }
  }
  return db;
}

// Initialisation au démarrage
getDB();

// --- API Enregistrement Client ---
app.post("/api/register", async (req, res) => {
  try {
    const database = await getDB();
    if (!database) return res.status(500).json({ success: false, error: "Base de données non disponible" });

    const { name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ success: false, message: "Nom et téléphone requis" });

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    await database.collection("clients").insertOne({
      name: cleanName,
      phone: cleanPhone,
      createdAt: new Date()
    });

    console.log(`👤 Client enregistré : ${cleanName}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur d'enregistrement:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- API Chat Gemini ---
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) return res.json({ reply: "Message vide." });

    const prompt = `
Tu es ZakaSania, un assistant IA pour une entreprise de services à domicile au Burkina Faso.
Tu réponds simplement, clairement et poliment. Tu es expert en nettoyage.
Tu parles toujours en français. Réponses courtes et efficaces.

Question :
${userMessage}
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je ne peux pas répondre pour le moment.";

    res.json({ reply });
  } catch (error) {
    console.error("Erreur Gemini:", error);
    res.status(500).json({ reply: "Erreur lors de la communication avec l'IA." });
  }
});

// --- Frontend ---
app.use(express.static(__dirname));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/assistant.html", (req, res) => res.sendFile(path.join(__dirname, "assistant.html")));
app.get("/avis.html", (req, res) => res.sendFile(path.join(__dirname, "avis.html")));
// Route de connexion (vérification du numéro)
app.post("/api/login", async (req, res) => {
  try {
    const database = await getDB();
    const { phone } = req.body;
    
    // On cherche le client dans la collection
    const client = await database.collection("clients").findOne({ phone: phone.trim() });

    if (client) {
      console.log(`✅ Connexion réussie pour : ${client.name}`);
      res.json({ success: true, name: client.name });
    } else {
      res.status(404).json({ success: false, message: "Client non trouvé" });
    }
  } catch (err) {
    res.status(500).json({ success: false });
  }
});
// --- API AVIS CLIENTS ---

// 1. Enregistrer un avis
app.post("/api/reviews", async (req, res) => {
  try {
    const database = await getDB();
    const { name, phone, rating, comment } = req.body;
    
    await database.collection("reviews").insertOne({
      name,
      phone,
      rating,
      comment,
      createdAt: new Date()
    });
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// 2. Récupérer tous les avis
app.get("/api/reviews", async (req, res) => {
  try {
    const database = await getDB();
    // On récupère les 20 derniers avis, du plus récent au plus ancien
    const reviews = await database.collection("reviews")
      .find()
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors du chargement des avis" });
  }
});

// --- Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ ZakaSania actif sur le port ${PORT}`));
