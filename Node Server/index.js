const io = require("socket.io")(8000, {
    cors: {
        origin: "https://deba-004.github.io",
        methods: ["GET", "POST"]
    }
});

const users={};

io.on("connection", socket => {
    socket.on("new-user-joined", name => {
        users[socket.id]=name;
        socket.broadcast.emit("user-joined", name);
    });

    socket.on("send", message => {
        socket.broadcast.emit("receive", {message: message, name: users[socket.id]});
    });

    socket.on("disconnect", () => {
        const name=users[socket.id];
        socket.broadcast.emit("user-left", name);
        delete users[socket.id];
    });

    socket.on("video-invite", () => {
        socket.broadcast.emit("video-invite-received", {inviterId: socket.id});
    });

    socket.on("accept-invite", (inviterId) => {
        io.to(inviterId).emit("invite-accepted");
    });

    socket.on("join-room", (room) => {
        const clients=io.sockets.adapter.rooms.get(room);
        const numClients=clients ? clients.size : 0;
        if(numClients>=2) {
            socket.emit("room-full");
        }

        socket.join(room);
        if(numClients===1) {
            socket.to(room).emit("ready");
        }
    });

    socket.on("offer", ({offer, room}) => {
        socket.to(room).emit("offer", offer);
    });

    socket.on("answer", ({answer, room}) => {
        socket.to(room).emit("answer", answer);
    });

    socket.on("ice-candidate", ({candidate, room}) => {
        socket.to(room).emit("ice-candidate", candidate);
    });
});