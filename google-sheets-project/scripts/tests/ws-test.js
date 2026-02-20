const io = require("socket.io-client");

const socket = io("http://localhost:3001");

socket.on("connect", () => console.log("connected", socket.id));
socket.on("welcome", (m) => console.log("welcome:", m));
socket.on("data_update", (d) => console.log("data_update:", d));
socket.on("ai_result", (d) => console.log("ai_result:", d));
socket.on("disconnect", () => console.log("disconnected"));

setInterval(() => socket.emit("ping_client", { t: Date.now() }), 5000);
