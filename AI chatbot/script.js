// Theme toggle functionality
const themeToggleBtn = document.getElementById("theme-toggle-btn");
themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    themeToggleBtn.textContent = document.body.classList.contains("light-theme") ? "dark_mode" : "light_mode";
});

// Delete chat functionality
const chatDeleteBtn = document.getElementById("chat-delete-btn");
chatDeleteBtn.addEventListener("click", () => {
    chatContainer.innerHTML = "";
});


const container = document.querySelector(".container");
const chatContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const fileInput = document.getElementById("file-input");


// API integration
const API_KEY = "AIzaSyCLe2BgccNJO2CKlNwhRrJcdeUkVwFF2_4";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let userMessage = "";
const chatHistory = [];
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const scrollToBottom = () => container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

const typingEffect = (text, textElement, botMsgDIV) => {
    textElement.textContent = "";
    const words = text.split(" ");
    let i = 0;

    const timer = setInterval(() => {
        if (i < words.length) {
            textElement.textContent += (i === 0 ? "" : " ") + words[i++];
            botMsgDIV.classList.remove("loading");
        } else {
            clearInterval(timer);
            scrollToBottom();
        }
    }, 40);
}
const generateResponse = async (botMsgDIV) => {
    const textElement = botMsgDIV.querySelector(".message-text");

    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);
        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
        typingEffect(responseText, textElement, botMsgDIV);
    } catch (error) {
        console.log(error);
    }
}
const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if (!userMessage) return;

    promptInput.value = "";

    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDIV = createMsgElement(userMsgHTML, "user-message");

    userMsgDIV.querySelector(".message-text").textContent = userMessage;
    chatContainer.append(userMsgDIV);
    scrollToBottom();

    setTimeout(() => {
        const botMsgHTML = ` <img src="gemini-chatbot-logo.svg" alt="" class="avatar"><p class="message-text">Just a sec..</p>`;
        const botMsgDIV = createMsgElement(botMsgHTML, "bot-message", "loading");
        chatContainer.append(botMsgDIV);
        scrollToBottom();
        generateResponse(botMsgDIV);
    }, 600);
}


// Allow both pressing Enter and clicking the send button
promptForm.addEventListener("submit", handleFormSubmit);
document.getElementById("send-prompt-btn").addEventListener("click", handleFormSubmit);
promptForm.querySelector("#add-file-btn").addEventListener("click", () => fileInput.click());

