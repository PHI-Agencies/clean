const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Instructions de base pour l'IA (System Prompt)
let conversationHistory = [
    { 
        role: "user", 
        parts: [{ text: "Tu es l'agent commercial de FasoPropre. Ton unique mission est de collecter : 1. Nom, 2. Lieu, 3. Type de nettoyage. Sois bref et poli. Pose une question après l'autre. Une fois que tu as tout, affiche un résumé clair et termine obligatoirement par le code : [GENERER_WHATSAPP]. N'invente pas de prix sauf si demandé (Lessive 100f, Cuisine 5000f, Toilettes 750f/m2)." }] 
    }
];

// Message d'accueil
window.onload = () => {
    setTimeout(() => typeEffect("Bonjour ! 😊 Bienvenue chez FasoPropre. Quel est votre nom pour débuter votre devis ?"), 500);
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
        
        if (data.text.includes("[GENERER_WHATSAPP]")) {
            const cleanText = data.text.replace("[GENERER_WHATSAPP]", "").trim();
            typeEffect(cleanText + "\n\n✅ Devis prêt ! Ouverture de WhatsApp...");
            
            setTimeout(() => {
                const whatsappUrl = `https://wa.me/22660692928?text=${encodeURIComponent("Nouveau Devis FasoPropre :\n" + cleanText)}`;
                window.open(whatsappUrl, '_blank');
            }, 3000);
        } else {
            typeEffect(data.text);
            conversationHistory.push({ role: "model", parts: [{ text: data.text }] });
        }
    } catch (err) {
        addMessage("ai", "Désolé, je rencontre un problème technique. 😊");
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
            setTimeout(type, 20);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    type();
}

sendBtn.onclick = handleChat;
userInput.onkeypress = (e) => { if(e.key === 'Enter') handleChat(); };