// --- INITIALISATION DES ÉLÉMENTS ---
const menuToggle = document.querySelector('#mobile-menu');
const navList = document.querySelector('.nav-list');
const body = document.querySelector('body');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// --- 1. GESTION DU MENU MOBILE ---
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('is-active');
    navList.classList.toggle('active');
    body.classList.toggle('no-scroll');
});

document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('is-active');
        navList.classList.remove('active');
        body.classList.remove('no-scroll');
    });
});

// --- 2. CONFIGURATION DE L'IA (HISTORIQUE ET RÈGLES) ---
let conversationHistory = [
    { 
        role: "user", 
        parts: [{ text: "Tu es l'assistant intelligent de FasoPropre. Sois chaleureux et utilise l'emoji 😊. Ton but est de collecter : 1. Nom, 2. Ville/Quartier, 3. Type de nettoyage (Lessive 100f, Vaisselle 25f/plat, Toilettes 750f/m2, Cuisine 5000f, Rangement maison sur devis). Pose une seule question à la fois. Quand tu as tout, termine impérativement ton message par le mot [FINAL] suivi du récapitulatif complet." }] 
    }
];

// Message de bienvenue automatique au chargement
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        typeEffect("Bonjour ! 😊 Je suis votre assistant FasoPropre. Pour préparer votre devis, quel est votre nom ?");
    }, 1000);
});

// --- 3. LOGIQUE DE CHAT FLUIDE (STYLE CHATGPT) ---
async function handleChat() {
    const message = userInput.value.trim();
    if (!message) return;

    // Affichage immédiat du message utilisateur
    addMessage("user", message);
    userInput.value = "";

    // Remplace par ta clé API Gemini
    const API_KEY = "TON_API_KEY_ICI"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    conversationHistory.push({ role: "user", parts: [{ text: message }] });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: conversationHistory })
        });
        
        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        // Détection de la fin de conversation
        if (aiResponse.includes("[FINAL]")) {
            const cleanText = aiResponse.replace("[FINAL]", "");
            typeEffect(cleanText + "\n\n✅ Résumé prêt ! Redirection WhatsApp en cours...");
            
            setTimeout(() => {
                const phone = "22660692928";
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(cleanText)}`, '_blank');
            }, 3500);
        } else {
            typeEffect(aiResponse);
            conversationHistory.push({ role: "model", parts: [{ text: aiResponse }] });
        }
    } catch (error) {
        typeEffect("Oups ! J'ai un petit souci de connexion. 😊 Pouvez-vous cliquer sur le bouton WhatsApp en bas ?");
        console.error("Erreur API:", error);
    }
}

// --- 4. FONCTIONS UTILITAIRES D'AFFICHAGE ---

// Ajoute un message simple
function addMessage(type, text) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerText = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// À mettre à la fin de vos fonctions d'ajout de message
chatBody.scrollTo({
    top: chatBody.scrollHeight,
    behavior: 'smooth'
});

// Effet d'écriture fluide (Typewriter)
function typeEffect(text) {
    const div = document.createElement('div');
    div.className = "message ai";
    chatMessages.appendChild(div);
    
    let i = 0;
    const speed = 25; // millisecondes par caractère
    
    function type() {
        if (i < text.length) {
            div.innerText += text.charAt(i);
            i++;
            setTimeout(type, speed);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    type();
}

// --- 5. ÉVÉNEMENTS CLAVIER ET BOUTON ---
sendBtn.addEventListener('click', handleChat);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleChat();
    }
});

// --- 6. ANIMATIONS AU SCROLL POUR LE DESIGN ---
window.addEventListener('scroll', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;
        if (cardTop < window.innerHeight - 100) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }
    });
});