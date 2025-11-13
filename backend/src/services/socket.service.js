import { Server } from "socket.io";

let io;
const socketMap = new Map();

export const initializeSocket = (serverIo) => {
  io = serverIo;

  io.on("connection", (socket) => {
    
    socket.on("register-camera", (waterId) => {
      if (waterId) {
        socketMap.set(waterId, socket.id);
        socket.join(waterId);
      }
    });

    socket.on("disconnect", () => {
      for (let [key, value] of socketMap.entries()) {
        if (value === socket.id) {
          socketMap.delete(key);
          break;
        }
      }
    });
  });
};

export const getIo = () => io;
export const getSocketMap = () => socketMap;