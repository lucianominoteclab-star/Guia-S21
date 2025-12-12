let chunks = [];
let index = null;
let chat = null;

async function loadChunks() {
  const res = await fetch("data/info_chunks.json");
  chunks = await res.json();

  index = lunr(function () {
    this.ref("id");
    this.field("title", { boost: 10 });
    this.field("text");

    chunks.forEach(c => this.add(c));
  });
}

function addMsg(sender, text) {
  const div = document.createElement("div");
  div.className = "msg " + (sender === "Usuario" ? "user" : "bot");
  div.innerHTML = "<strong>" + sender + ":</strong> " + text;
  document.getElementById("chat").appendChild(div);
  document.getElementById("chat").scrollTop = 999999;
}

async function send() {
  const q = document.getElementById("question").value.trim();
  if (!q) return;

  addMsg("Usuario", q);

  const results = index.search(q + "*");
  const top = results.slice(0, 5)
    .map(r => chunks.find(c => c.id === r.ref).text)
    .join("\n\n");

  if (!chat) {
    addMsg("Chat", "Inicializando motor… Aguarda unos segundos.");
    chat = await webllm.createChatCompletion({
      model: "Phi-3.5-mini-instruct-q4f32_1-MLC"
    });
  }

  const prompt =
    "Usá SOLO esta información:\n\n" +
    top +
    "\n\nPregunta: " + q;

  const ans = await chat.chat({
    messages: [{ role: "user", content: prompt }]
  });

  addMsg("Chat", ans.message.content);
  document.getElementById("question").value = "";
}

document.getElementById("sendBtn").addEventListener("click", send);

document.getElementById("question").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    send();
  }
});

loadChunks();
