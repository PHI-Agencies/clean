const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Historique avec instructions strictes pour canaliser vers WhatsApp
let conversationHistory = [
    { 
        role: "user", 
        parts: [{ text: "Tu es l'assistant de FasoPropre. Ta mission : obtenir Nom, Ville, et Service souhaité. Règle : une seule question courte à la fois. N'invente rien. Dès que tu as les 3 infos, fais un résumé et termine par le code exact : [GENERER_WHATSAPP]. Sois poli 😊." }] 
    },
    {
        role: "model",
        parts: [{ text: "Entendu. Je vais aider le client à établir son devis étape par étape." }]
    }
];

window.onload = () => {
    setTimeout(() => typeEffect("Bonjour ! 😊 Je suis l'assistant de FasoPropre. Quel est votre nom pour commencer ?"), 500);
};

async function handleChat() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage("user", message);
    userInput.value = "";
    conversationHistory.push({ role: "user", parts: [{ text: message }] });

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: conversationHistory })
        });
        
        const data = await res.json();
        const aiResponse = data.text;

        if (aiResponse.includes("[GENERER_WHATSAPP]")) {
            const cleanText = aiResponse.replace("[GENERER_WHATSAPP]", "").trim();
            typeEffect(cleanText + "\n\n✅ Vos infos sont prêtes ! Je vous dirige vers WhatsApp...");
            
            setTimeout(() => {
                const link = `https://wa.me/22660692928?text=${encodeURIComponent("Nouveau devis :\n" + cleanText)}`;
                window.open(link, '_blank');
            }, 3000);
        } else {
            typeEffect(aiResponse);
            conversationHistory.push({ role: "model", parts: [{ text: aiResponse }] });
        }
    } catch (err) {
        typeEffect("Désolé, j'ai un souci de connexion. 😊");
    }
}

function addMessage(type, text) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerText = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function typeEffect(text) {
    const div = document.createElement('div');
    div.className = "message ai";
    chatMessages.appendChild(div);
    let i = 0;
    function type() {
        if (i < text.length) {
            div.innerText += text.charAt(i); i++;
            setTimeout(type, 15);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    type();
}

sendBtn.onclick = handleChat;
userInput.onkeypress = (e) => { if(e.key === 'Enter') handleChat(); };