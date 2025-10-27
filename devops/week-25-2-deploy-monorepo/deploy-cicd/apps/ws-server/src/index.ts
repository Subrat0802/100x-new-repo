import {WebSocketServer} from "ws";
import { prismaClient } from "@repo/db/client";

const server = new WebSocketServer({port: 8080});

server.on("connection", async (socket) => {
    const res = await prismaClient.user.create({
        data:{
            username: Math.random().toString(),
            password: Math.random().toString()
        }
    })

    console.log(res);

    socket.send("Hi there you are connected to the server");
})