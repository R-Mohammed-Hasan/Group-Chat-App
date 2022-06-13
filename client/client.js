import { io } from "socket.io-client";

const socket = io("http://localhost:7000");
let rooms = ["global"];
var audio = new Audio("./Notification.mp3");
const container = document.getElementById("messages");
const input = document.getElementById("input");
document.getElementById("form").addEventListener("submit", onsubmitHandler);

function onsubmitHandler(e) {
    e.preventDefault();
    const message = input.value;
    const room = document.getElementById("room").value;
    if (room) {
        rooms.push(room);
        append(`<strong>You</strong> joined ${rooms[rooms.length - 1]}`, "right");
        socket.emit("join-room", rooms, (room) => {
            if (room) {
                document.getElementsByClassName(
                    "room"
                )[0].innerText = `You have joined Room: ${room}`;
            }
        });
    }
    if (message) {
        append(`<strong>You</strong> : ${message}`, "right");
    }
    socket.emit("send", message, rooms);
    input.value = "";
    document.getElementById("room").value = "";
    input.focus();
}

const append = (message, position) => {
    const messageEl = document.createElement("li");
    messageEl.innerHTML = message;
    messageEl.classList.add(position);
    container.appendChild(messageEl);
    if (position == "left") {
        audio.play();
    }
    let scrollHeight = document.getElementById("messages").scrollHeight;
    document.getElementById("messages").scrollTop = scrollHeight + 100;
};

socket.on("user-joined", (name) => {
    append(`<strong>${name}</strong> joined the chat`, "right");
});

socket.on("receive", (data) => {
    if (data.message)
        append(`<strong>${data.name} </strong> : ${data.message}`, "left");
});
socket.on("user-joined-room", (user) => {
    append(`<strong>${user}</strong> joined this room`, "left");
});

socket.on("leave", (name) => {
    append(`<strong>${name} </strong> left the chat`, "left");
});

const userName = prompt("Enter your name : ");
socket.emit("user-joined", userName);
input.focus();