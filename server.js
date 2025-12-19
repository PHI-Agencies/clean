import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";

const app = express();
app.use(cors());
app.use(express.json());

// --- __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- MongoDB Native ---
const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db(); // DB par défaut de l’URI
    console.log("✅ Connecté à MongoDB (native)");
  } catch (err) {
    console.error("❌ Erreur MongoDB:", err);
  }
}
connectDB();

// --- API Enregistrement Client ---
app.post("/api/register", async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false });
    }

    await db.collection("clients").insertOne({
      name,
      phone,
      createdAt: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// --- API Chat Gemini ---
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.json({ reply: "Message vide." });
    }

    const prompt = `
Tu es ZakaSania, un assistant IA pour une entreprise de services à domicile.
Tu réponds simplement, clairement et poliment.
Tu parles toujours en français.
Réponses courtes.

Question :
${userMessage}
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Désolé, je ne peux pas répondre pour le moment.";

    res.json({ reply });

  } catch (error) {
    console.error("Erreur Gemini:", error);
    res.status(500).json({ reply: "Erreur serveur." });
  }
});

// --- Frontend ---
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// --- Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ ZakaSania actif sur le port ${PORT}`);
});
