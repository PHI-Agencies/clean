const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let conversationHistory = [];

async function handleChat() {
    const text = userInput.value.trim();
    if (!text) return;

    // Afficher le message de l'utilisateur
    addMessage("user", text);
    userInput.value = "";

    // Ajouter à l'historique
    conversationHistory.push({ role: "user", parts: [{ text: text }] });

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: conversationHistory })
        });

        const data = await response.json();
        
        if (data.text) {
            addMessage("ai", data.text);
            conversationHistory.push({ role: "model", parts: [{ text: data.text }] });
        } else {
            addMessage("ai", "Désolé, je n'ai pas pu générer de réponse. 😊");
        }
    } catch (e) {
        addMessage("ai", "Erreur de connexion au serveur. 😊");
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