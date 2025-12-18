const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Initialisation de l'historique avec le rôle système pour "canaliser" l'IA
let conversationHistory = [
    { 
        role: "user", 
        parts: [{ text: "Tu es CleanConnect, l'assistant amical de FasoPropre. Ton but est de répondre aux questions et d'aider pour un devis de nettoyage. Sois chaleureux 😊." }] 
    },
    {
        role: "model",
        parts: [{ text: "Bonjour ! Je suis CleanConnect. Comment puis-je vous aider aujourd'hui ? 😊" }]
    }
];

// Afficher le message d'accueil au chargement
window.onload = () => {
    addMessage("ai", "Bonjour ! Je suis CleanConnect. Comment puis-je vous aider aujourd'hui ? 😊");
};

async function handleChat() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Afficher et sauvegarder le message utilisateur
    addMessage("user", text);
    userInput.value = "";
    conversationHistory.push({ role: "user", parts: [{ text: text }] });

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: conversationHistory })
        });

        const data = await response.json();
        
        if (data.text) {
            // 2. Afficher et sauvegarder la réponse de l'IA
            addMessage("ai", data.text);
            conversationHistory.push({ role: "model", parts: [{ text: data.text }] });
        } else {
            addMessage("ai", "Désolé, je n'ai pas pu générer de réponse. 😊");
        }
    } catch (e) {
        console.error("Erreur Fetch:", e);
        addMessage("ai", "Erreur de connexion au serveur. Vérifiez votre connexion. 😊");
    }
}

function addMessage(type, text) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerText = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendBtn.onclick = handleChat;
userInput.onkeypress = (e) => { if(e.key === 'Enter') handleChat(); };