import { Server } from "socket.io";
import { getUserByToken,removeSocketIdByToken,addSocketIdByToken, removeUserByToken, getUserByRoom, logUsers} from "./userHandler.js";
import {roomJoin} from "./roomJoin.controller.js";
import { roomCreate } from "./roomCreate.controller.js";
import { startRoom } from "./roomStart.controller.js";
const io = new Server(8080, {
    cors: {
        //origin: 'http://127.0.0.1:5500',
        origin:"*",
        methods: ['GET', 'POST'],
    },
});
console.log("Websocket running on port 8080")
const roomData = {}

io.on('connection', (socket)=>{
    var perserveConnection = false
    var sessionToken = socket.handshake.query.token
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
    socket.on("start", (token)=>startRoom(token,roomData,socket,io))
    socket.on("perserveConnection",()=>perserveConnection=true)
    socket.on('disconnect',()=>{
        const user = getUserByToken(sessionToken)
        if(!user){
            return
        }
        const room = roomData[user.roomName]
        removeSocketIdByToken(sessionToken)
        
        if(!room){
            return
        }
        if(room.started === false){
            if(roomData[user.roomName].adminToken === sessionToken){
                if(perserveConnection) return
                perserveConnection = false
                delete roomData[user.roomName]
                removeUserByToken(sessionToken)
                socket.to(user.roomName).emit("roomDelete")
            }else{
                room.users = room.users.filter(tok=> tok!==sessionToken)
                removeUserByToken(sessionToken)
                socket.to(user.roomName).emit("updateUsers",getUserByRoom(user.roomName))
            }
        }
    })
})
