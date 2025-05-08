const socket=io("https://chatbuddy-application.onrender.com");

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

const localVideo=document.getElementById("localVideo");
const remoteVideo=document.getElementById("remoteVideo");

const urlParams=new URLSearchParams(window.location.search);
const room=urlParams.get("room");

const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

let localStream;
let peerConnection;
async function startCall() {
    localStream=await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    localVideo.srcObject=localStream;

    peerConnection=new RTCPeerConnection(config);

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack=(event) => {
        remoteVideo.srcObject=event.streams[0];
    };

    peerConnection.onicecandidate=(event) => {
        if(event.candidate) {
            socket.emit("icecandidate", {candidate: event.candidate, room});
        }
    };

    socket.emit("join-room", room);
}

socket.on("offer", async(offer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer=await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer", {answer, room});
});

socket.on("answer", async(answer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on("ice-candidate", async(candidate) => {
    if(peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
});

socket.on("ready", async () => {
    const offer=await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", {offer, room});
});

startCall();