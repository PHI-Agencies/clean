import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const app = express();

app.use(cors());
app.use(express.json());

// --- Fix __dirname en ES module ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- MongoDB Atlas ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connecté à MongoDB Atlas"))
  .catch(err => console.error("❌ Erreur MongoDB :", err));

const ClientSchema = new mongoose.Schema({
  name: String,
  phone: String,
  date: { type: Date, default: Date.now }
});

const Client = mongoose.model("Client", ClientSchema);

// --- API Enregistrement Client ---
app.post("/api/register", async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false });
    }

    const newClient = new Client({ name, phone });
    await newClient.save();

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
Tu es ZakaSania, un assistant IA pour des services à domicile.
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
    console.log("Gemini:", JSON.stringify(data));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ ZakaSania actif sur le port ${PORT}`);
});
