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
    })
});