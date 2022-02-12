const usernameFormEl = document.querySelector("#username");
const usernameInputEl = document.querySelector("#username input");
const usernameSubmitBtn = document.querySelector("#username button");
const connectionCountEl = document.getElementById("connection-count");
const chatInfoEl = document.getElementById("chat-info");
const messagesUlEl = document.getElementById("messages");
const messageFormEl = document.querySelector("#message");
const messageInputEl = document.querySelector("#message input");

const typingTimeout = 5000;
const socket = io();

let isTyping = false;
let timeout = undefined;
let existingConnections;
const setConnections = (connections) => {
  existingConnections = { ...connections };
  console.log(existingConnections);
};
const setConnectionCount = (count) => {
  connectionCountEl.innerText = count;
  document.title = ` socket.io ~ ${count} active users `;
};

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
    username: usernameInputEl.value,
  });
};

// OUTGOING messages
const handleMessageSend = (e) => {
  e.preventDefault();
  const message = messageInputEl.value;
  if (!message) return;

  socket.emit("sent message", {
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
  messagesUlEl.appendChild(liEl);
};

// INCOMING set username
const onSetUsername = ({ connections }) => {
  setConnections(connections);
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

const onClientConnect = ({ connections }) => {
  setConnections(connections);
  setConnectionCount(connections.length);
  console.log(existingConnections);
};
const onClientDisconnect = ({ connections }) => {
  setConnections(connections);
  setConnectionCount(connections.length);
};

// INCOMING messages
const onIncomingMessage = ({ message, username }) => {
  const liEl = document.createElement("li");
  liEl.textContent = `${username}: ${message}`;
  messagesUlEl.appendChild(liEl);
  window.scrollTo(0, document.body.scrollHeight);
};

// handle username input
const handleUsernameKeydown = ({ target: { value } }) => {
  const disableSetUsernameBtn = () =>
    usernameSubmitBtn.setAttribute("disabled", true);
  const enableSetUsernameBtn = () =>
    usernameSubmitBtn.removeAttribute("disabled");

  const existingUsernames = Object.values(existingConnections).filter(
    ({ username }) => username === value
  );

  // if username is null || too short || not unique
  if (!value || value.length < 3 || existingUsernames.length) {
    disableSetUsernameBtn();
  } else {
    enableSetUsernameBtn();
  }
};

// handle set username
const handleSetUsername = (e) => {
  e.preventDefault();
  socket.emit("set username", {
    id: socket.id,
    username: usernameInputEl.value,
  });

  // show messenger
  document.querySelector("main").classList.remove("hide");
  // remove set username button
  usernameFormEl.removeChild(usernameSubmitBtn);
  // focuse text input
  messageInputEl.focus();
};

socket.on("connect", onConnect);
socket.on("set username", onSetUsername);
socket.on("connected", onClientConnect);
socket.on("disconnected", onClientDisconnect);
socket.on("sent message", onIncomingMessage);
socket.on("typing", onClientTyping);
socket.on("typing cancelled", onClientTypingCancelled);

usernameFormEl.addEventListener("submit", handleSetUsername);
usernameInputEl.addEventListener("input", handleUsernameKeydown);

messageInputEl.addEventListener("keydown", handleMessageKeydown);
messageFormEl.addEventListener("submit", handleMessageSend);

usernameInputEl.focus();
