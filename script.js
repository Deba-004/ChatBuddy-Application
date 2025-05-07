const socket=io("https://chatbuddy-application.onrender.com");

const form=document.getElementById("sendBox");
const messageContainer=document.querySelector(".container");
const input=document.getElementById("input");
const button=document.getElementById("send-button");
const videochatbtn=document.getElementById("video-chat-button");

var audio=new Audio("Media/message_sound.mp3")

const append=(message,position) => {
    const messageElement=document.createElement("div");
    messageElement.innerText=message;
    messageElement.classList.add("message");
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
    if(position==="left") {
        audio.play();
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const message=input.value;
    append(`You: ${message}`, "right");
    socket.emit("send", message);
    input.value="";
});

let name="";
while(!name) {
    name=prompt("Enter your name to join");
}
socket.emit("new-user-joined", name);

socket.on("user-joined", name => {
    append(`${name} joined the chat`, "right");
});

socket.on("receive", data => {
    append(`${data.name}: ${data.message}`, "left");
});

socket.on("user-left", name => {
    append(`${name} left the chat`, "right");
});

socket.on("connect_error", (err) => {
    console.error("Connection Error:", err.message);
});

const lightBtn = document.getElementById("light-btn");
const darkBtn = document.getElementById("dark-btn");

lightBtn.style.display = "none";

darkBtn.addEventListener("click", () => {
    document.body.classList.add("light");
    darkBtn.style.display = "none";
    lightBtn.style.display = "inline";
});

lightBtn.addEventListener("click", () => {
    document.body.classList.remove("light");
    lightBtn.style.display = "none";
    darkBtn.style.display = "inline";
});

videochatbtn.addEventListener("click", () => {
    socket.emit("video-invite");
    alert("Request sent! Waiting for someone to join..");
});

socket.on("video-invite-received", ({inviterId}) => {
    const accept=confirm("Someone invited for video chat. Do you want to join?");
    if(accept) {
        socket.emit("accept-invite", inviterId);
        window.open('video.html?room' + inviterId, "_blank");
    }
});

socket.on("invite-accepted", () => {
    window.open('video.html?room' + inviterId, "_blank");
});