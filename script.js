const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Ton prompt amélioré intégré comme instruction système
let conversationHistory = [
    { 
        role: "user", 
        parts: [{ text: `Tu es CleanConnect, un assistant amical. 
        MISSION : Collecter pas à pas : 1. Type de service, 2. Nom/Prénom, 3. WhatsApp client, 4. Ville/Quartier, 5. Détails techniques, 6. Fréquence.
        RÈGLES : 
        - Une seule question à la fois.
        - Sois chaleureux (emojis 😊).
        - Termine TOUJOURS par le code exact [GENERER_WHATSAPP] suivi du résumé complet une fois le point 6 validé.` }] 
    },
    {
        role: "model",
        parts: [{ text: "Bonjour et bienvenue sur CleanConnect ! 😊 Je suis ravi de vous aider. Pour commencer, quel type de service vous intéresse ? (maison, bureau, fin de chantier...)" }]
    }
];

// Affichage du message de bienvenue initial
window.onload = () => {
    addMessage("ai", "👋 Bonjour et bienvenue sur CleanConnect ! Je suis votre assistant pour trouver le service de nettoyage parfait. 😊 Pour commencer, quel type de service vous intéresse ?");
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
            typeEffect(cleanText + "\n\n✅ Devis prêt ! Ouverture de WhatsApp...");
            
            setTimeout(() => {
                // Redirection vers TON numéro 60692928
                const link = `https://wa.me/22660692928?text=${encodeURIComponent("Nouveau Devis CleanConnect :\n" + cleanText)}`;
                window.open(link, '_blank');
            }, 3000);
        } else {
            typeEffect(aiResponse);
            conversationHistory.push({ role: "model", parts: [{ text: aiResponse }] });
        }
    } catch (err) {
        typeEffect("Oups ! Une petite déconnexion. 😊");
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