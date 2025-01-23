import { Server } from "socket.io";
import { getUserByToken,removeSocketIdByToken,addSocketIdByToken, removeUserByToken, getUserByRoom} from "./userHandler.js";
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
    var sessionToken = socket.handshake.query.token
    if(sessionToken){
        const user = getUserByToken(sessionToken)
        if(user){
            addSocketIdByToken(sessionToken,socket.id)
        }
    } 
    console.log(`Client connected: ${socket.id}`)
    socket.on("joinRoom",(roomName,username,sessionToken)=>sessionToken = roomJoin(roomName,username,sessionToken,socket,roomData))
    socket.on("createRoom",(roomName,username,sessionToken)=>sessionToken = roomCreate(roomName,username,sessionToken,socket,roomData))
    socket.on('disconnect',()=>{
        var user = getUserByToken(sessionToken)
        if(!user){
            removeSocketIdByToken(sessionToken)
            return
        }
        var roomName = user.roomName
        removeUserByToken(sessionToken)
        if(!Object.keys(roomData).includes(roomName)){
            return
        }
        if(!roomData[user.roomName].started){
            if(roomData[roomName].adminToken===sessionToken){
                delete roomData[roomName]
                socket.to(roomName).emit("roomDelete")
            }else{
                roomData[roomName].users = roomData[roomName].users.filter(tok=>tok!==sessionToken)
                socket.to(roomName).emit("updateUsers",getUserByRoom(roomName))
            }
        }else{
        }
    })
})
