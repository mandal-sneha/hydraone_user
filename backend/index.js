import express from "express";
import fileUpload from 'express-fileupload';
import dotenv from "dotenv";
import cors from "cors";
import { ConnectDB } from "./src/lib/db.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./src/services/socket.service.js";
import { initializeScheduler } from "./src/services/scheduler.service.js";

import userRoutes from "./src/routes/user.route.js";
import tenantRoutes from "./src/routes/tenant.route.js";
import propertyRoutes from "./src/routes/property.route.js";
import invitationRoutes from "./src/routes/invitation.route.js";
import waterregistrationRoutes from "./src/routes/waterregistration.route.js";
import cameraRoutes from "./src/routes/camera.route.js";

dotenv.config();

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

initializeSocket(io);

app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true, 
}));

app.use(express.json());
app.use(fileUpload());  

app.use("/user", userRoutes);
app.use("/tenant", tenantRoutes);
app.use("/property", propertyRoutes);
app.use("/invitation", invitationRoutes);
app.use("/waterregistration", waterregistrationRoutes);
app.use("/camera", cameraRoutes);

const PORT = process.env.PORT;

httpServer.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
    ConnectDB();
    initializeScheduler();
});