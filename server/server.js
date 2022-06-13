const io = require("socket.io")(7000, {
    cors: {
        origin: ["http://localhost:8080"],
    },
});

const users = {};

io.on("connection", (socket) => {
    socket.join("global");
    socket.on("user-joined", (name) => {
        // we are assigning a new key, not replacing
        users[socket.id] = name;
        // console.log(users);
        socket.broadcast.emit("user-joined", name);
    });

    socket.on("send", (message, rooms) => {
        // See list of rooms particular user joined
        // console.log(socket.rooms);
        socket
            .to(rooms[rooms.length - 1])
            .emit("receive", { message: message, name: users[socket.id] });
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit("leave", users[socket.id]);
        delete users[socket.id];
    });

    socket.on("join-room", (rooms, cb) => {
        socket.leave(rooms[rooms.length - 2]);
        socket.join(rooms[rooms.length - 1]);
        socket
            .to(rooms[rooms.length - 1])
            .emit("user-joined-room", users[socket.id]);
        cb(rooms[rooms.length - 1]);
    });
});