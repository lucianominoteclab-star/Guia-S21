let knowledgeBase = "";
let chat = null;

// Load knowledge base
fetch("data/info.txt")
  .then(res => res.text())
  .then(text => { knowledgeBase = text; });

// Init WebLLM
(async () => {
  chat = await webllm.createChatCompletion({
    model: "Phi-3.5-mini-instruct-q4f32_1-MLC",
  });
})();

function addMessage(sender, text) {
  const c = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = "msg " + (sender === "Usuario" ? "user" : "bot");
  div.innerHTML = "<strong>" + sender + ":</strong> " + text;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

async function send() {
  const q = document.getElementById("question").value;
  if (!q || !chat) return;

  addMessage("Usuario", q);

  const chunks = knowledgeBase.split(/\n\n|\r\n\r\n/);
  const relevantChunks = chunks.filter(c => c.toLowerCase().includes(q.toLowerCase())).slice(0, 10);
  const relevant = relevantChunks.join("\n");

  const prompt = "Sos un asistente experto de la Universidad Siglo 21.\n" +
    "Respondé SOLO usando la siguiente información:\n\n" +
    relevant + "\n\n" +
    "Pregunta: " + q + "\n\n" +
    "Si no está la información, respondé: 'No tengo esa información en la base cargada.'";

  const result = await chat.chat({
    messages: [{ role: "user", content: prompt }],
  });

  addMessage("Chat", result.message.content);
  document.getElementById("question").value = "";
}
