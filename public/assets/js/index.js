const connectionCountEl = document.getElementById("connection-count");
const usernameFormEl = document.getElementById("username-form");
const chatInfoEl = document.getElementById("chat-info");
const usernameEl = document.getElementById("username");
const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("input");
const formEl = document.getElementById("form");

const typingTimeout = 5000;
const socket = io();

let isTyping = false;
let timeout = undefined;

// OUTGOING connection
const onConnect = () => {
  // connectionCountEl.innerText = "online";
  // connectionCountEl.style.color = "green";
};

// OUTGOING typing events
const handleMessageKeydown = ({ key }) => {
  if (key === "Enter") return;
  if (isTyping) typingMessage();
  else startedTypingMessage();
};
const typingMessage = () => {
  clearTimeout(timeout);
  timeout = setTimeout(stoppedTypingMessage, typingTimeout);
};
const stoppedTypingMessage = () => {
  isTyping = false;
  socket.emit("client typing cancelled", {
    username: usernameEl.value,
  });
};

// OUTGOING messages
const onFormSubmit = (e) => {
  e.preventDefault();
  const message = inputEl.value;
  if (!message) return;

  socket.emit("client sent message", {
    message,
    username: usernameEl.value,
  });
  submitOutgoingMessage(message);
  inputEl.value = "";
};
const submitOutgoingMessage = (message) => {
  const liEl = document.createElement("li");
  liEl.style.textAlign = "right";
  liEl.textContent = `${message}`;
  messagesEl.appendChild(liEl);
};

// INCOMING typing events
const startedTypingMessage = () => {
  isTyping = true;
  socket.emit("client typing", {
    username: usernameEl.value,
  });
  timeout = setTimeout(stoppedTypingMessage, typingTimeout);
};
const onClientTyping = ({ username }) => {
  const pEl = document.createElement("p");
  pEl.setAttribute("id", `client-${username}`);
  pEl.innerText = `(${username} is typing)`;
  chatInfoEl.appendChild(pEl);
};
const onClientTypingCancelled = ({ username }) => {
  const pEl = document.querySelector(`#client-${username}`);
  chatInfoEl.removeChild(pEl);
};

// INCOMING connect & disconnect events
const setConnectionCount = (count) => (connectionCountEl.innerText = count);

const onClientConnect = ({ connectionCount }) => {
  setConnectionCount(connectionCount);
};
const onClientDisconnect = ({ connectionCount }) => {
  setConnectionCount(connectionCount);
};

// INCOMING messages
const onIncomingMessage = ({ message, username }) => {
  const liEl = document.createElement("li");
  liEl.textContent = `${username}: ${message}`;
  messagesEl.appendChild(liEl);
  window.scrollTo(0, document.body.scrollHeight);
};

socket.on("connect", onConnect);
socket.on("client connected", onClientConnect);
socket.on("client disconnected", onClientDisconnect);
socket.on("client sent message", onIncomingMessage);
socket.on("client typing", onClientTyping);
socket.on("client typing cancelled", onClientTypingCancelled);

usernameFormEl.addEventListener("keydown", (e) => e.preventDefault());
usernameFormEl.addEventListener("submit", (e) => e.preventDefault());
inputEl.addEventListener("keydown", handleMessageKeydown);
formEl.addEventListener("submit", onFormSubmit);
