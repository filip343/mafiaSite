import { Server } from "socket.io";
import { getUserByToken,removeSocketIdByToken,addSocketIdByToken, removeUserByToken, getUserByRoom, logUsers} from "./userHandler.js";
import {roomJoin} from "./roomJoin.controller.js";
import { roomCreate } from "./roomCreate.controller.js";
const io = new Server(8080, {
    cors: {
        origin: 'http://127.0.0.1:5500',
        methods: ['GET', 'POST'],
    },
});
console.log("Websocket running on port 8080")
const roomData = {}

io.on('connection', (socket)=>{
    var sessionToken = socket.handshake.auth.token
    if(sessionToken){
        const user = getUserByToken(sessionToken)
        if(user){   
            if(user.socketId){
                socket.emit("reusedToken")
                sessionToken = ""
                socket.disconnect(true)
            }else{
                addSocketIdByToken(sessionToken,socket.id)
            }
        }
    } 
    console.log(`Client connected: ${socket.id}`)
    socket.on("joinRoom",(roomName,username,token)=>sessionToken = roomJoin(roomName,username,token,socket,roomData))
    socket.on("createRoom",(roomCreateObj,token)=>sessionToken = roomCreate(roomCreateObj,token,socket,roomData))
    socket.on('disconnect',()=>{
        removeSocketIdByToken(sessionToken)
    })
    socket.on("start", (token)=>{
        
    })
})
