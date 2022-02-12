const usernameFormEl = document.querySelector("#username");
const usernameInputEl = document.querySelector("#username input");
const connectionCountEl = document.getElementById("connection-count");
const chatInfoEl = document.getElementById("chat-info");
const messagesUlEl = document.getElementById("messages");
const messageFormEl = document.querySelector("#message");
const messageInputEl = document.querySelector("#message input");

const typingTimeout = 5000;
const socket = io();

let isTyping = false;
let timeout = undefined;
let liveConnections;

// OUTGOING connection
const onConnect = () => {
  // connectionCountEl.innerText = "online";
  // connectionCountEl.style.color = "green";
};

// OUTGOING set username
const onSetUsername = () => {};

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
    username: usernameInputEl.value,
  });
};

// OUTGOING messages
const handleMessageSend = (e) => {
  e.preventDefault();
  const message = messageInputEl.value;
  if (!message) return;

  socket.emit("client sent message", {
    message,
    username: usernameInputEl.value,
  });
  submitOutgoingMessage(message);
  messageInputEl.value = "";
};
const submitOutgoingMessage = (message) => {
  const liEl = document.createElement("li");
  liEl.style.textAlign = "right";
  liEl.textContent = `${message}`;
  messagesEl.appUlendChild(liEl);
};

// INCOMING typing events
const startedTypingMessage = () => {
  isTyping = true;
  socket.emit("client typing", {
    username: usernameInputEl.value,
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

const onClientConnect = ({ connections }) => {
  liveConnections = { ...connections };
  setConnectionCount(connections.length);
  console.log(liveConnections);
};
const onClientDisconnect = ({ connections }) => {
  setConnectionCount(connections.length);
};

// INCOMING messages
const onIncomingMessage = ({ message, username }) => {
  const liEl = document.createElement("li");
  liEl.textContent = `${username}: ${message}`;
  messagesEl.appUlendChild(liEl);
  window.scrollTo(0, document.body.scrollHeight);
};

// handle username
const handleUsernameKeydown = ({ key }) => {
  const username = usernameInputEl.value;
  // if username is null, disable submit
  // else if username is not unique, disable submit
  // else enable button
  console.log(socket);
};
const handleSetUsername = (e) => {
  e.preventDefault();
};

socket.on("connect", onConnect);
socket.on("set username", onSetUsername);
socket.on("connected", onClientConnect);
socket.on("disconnected", onClientDisconnect);
socket.on("sent message", onIncomingMessage);
socket.on("typing", onClientTyping);
socket.on("typing cancelled", onClientTypingCancelled);

usernameFormEl.addEventListener("submit", handleSetUsername);
usernameInputEl.addEventListener("keydown", handleUsernameKeydown);

messageInputEl.addEventListener("keydown", handleMessageKeydown);
messageFormEl.addEventListener("submit", handleMessageSend);
