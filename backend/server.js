import { Server } from "socket.io";
import { getUserByToken,addUser,logUsers,removeSocketIdByToken,addSocketIdByToken} from "./token_handler.js";
const io = new Server(8080, {
    cors: {
        origin: 'http://127.0.0.1:5500',
        methods: ['GET', 'POST'],
    },
});
console.log("Websocket running on port 8080")

const validateRoomJoin = (roomName,token,username,socketId)=>{
    const responseObj={status:0,message:"succesfull"}
    if(!roomData[roomName]){
        responseObj.status=1
        responseObj.message = "room with given name not found"
        return responseObj
    }
    console.log(token);
    console.log(token===undefined);
    
    
    if(!token == undefined){
        
        const user = getUserByToken(token)
        if(!user){
            responseObj.status = 2
            responseObj.message = "user with given token not found"
            return responseObj
        }else if(user.socketId!==socketId){
            responseObj.status=4
            responseObj.message = "user with given token already in game"
            return responseObj
        }
    }else{
        roomData[roomName].users.forEach(user=>{
            const foundUser = getUserByToken(user.token)
            if(foundUser.username===username){
                responseObj.status=3
                responseObj.message = "user with that username already in game"
                return responseObj
            }
        })
    }

    return responseObj

}
const onRoomJoin = (socket,roomName,username)=>{
    const token = addUser(username,roomName,socket.id)
            
    roomData[roomName].users.push({id:socket.id,token:token})
    socket.to(roomName).emit('newUser',roomData[roomName])
    socket.emit("roomJoinResponse",{join_status:200,message:"succesfully joined a room",token:token})
    return token

}
const roomData = {
    "num":{admin:{},users:[]}
}

io.on('connection', (socket)=>{
    var token = socket.handshake.query.token  
    if(token!==null){
        console.log(token);
        const user = getUserByToken(token)
        if(user){
            socket.emit("tokenValidation",{token_status:"valid"})
            addSocketIdByToken(token,socket.id)
            logUsers()
        }else{
            socket.emit("tokenValidation",{token_status:"invalid"})
        }
    }
    
    
    console.log(`Client connected: ${socket.id}`)

    socket.on("joinRoom",(roomName,username,sessionToken)=>{
        console.log(sessionToken);
        logUsers()
        const validation = validateRoomJoin(roomName,sessionToken,username)
        console.log(validation);
        
        if(validation.status===0){
            socket.join(roomName)
            token = onRoomJoin(socket,roomName,username)
        }else{
            socket.emit("roomJoinResponse",{join_status:validation.status,message:validation.message,token:token})
        }
    })

    socket.on('disconnect',()=>{
        removeSocketIdByToken(token)
    })
})
