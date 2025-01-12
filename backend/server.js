const {Server} = require("socket.io")
const io = new Server(8080, {
    cors: {
        origin: 'http://127.0.0.1:5500',
        methods: ['GET', 'POST'],
    },
});
console.log("Websocket running on port 8080")
const generateSessionToken = () => {
    return Math.random().toString(36).substr(2); // Random token
};
const roomData = {
    "num":{admin:{},users:[]}
}
const users = []
io.on('connection', (socket)=>{
    const token = socket.handshake.query.token
    if(token){
        var connected = false
        users.forEach(user=>{
            if(user[0]===token){
                socket.join(user[1])
                connected=true
                return
            }
        })
        if(!connected){
            socket.emit("tokenValidation",{token_status:"invalid"})
        }else{
            socket.emit("tokenValidation",{token_status:"valid"})
        }
    }
    //Object.keys(roomData).forEach(roomName=>{
    //    roomData[roomName].users.forEach(user=>{
    //        if(user.token===token){
    //            socket.join(roomName)
    //        }
    //    })
    //})
    
    console.log(`Client connected: ${socket.id}`)

    socket.on("joinRoom",(roomName,username,sessionToken)=>{
        if(sessionToken){
            var connected = false
            console.log(users);
            
            users.forEach(user=>{
                if(user[0]===token){
                    socket.join(user[1])
                    connected=true
                    return
                }
            })
            if(connected){
                return
            }
        }
        if(!roomData[roomName]){
            socket.emit("roomJoinResponse",{join_status:404,message:"Room not found"})
        }
        else{
            socket.join(roomName)
            const token = generateSessionToken()
            console.log(token);
            users.push([token,roomName])
            
            roomData[roomName].users.push({id:socket.id,token:token,name:username})
            console.log(`User ${socket.id} joined room ${roomName}`)
            socket.to(roomName).emit('newUser',roomData[roomName])
            socket.emit("roomJoinResponse",{join_status:200,message:"succesfully joined a room",token:token})
        }
    })

    socket.on('disconnect',()=>{

    })
})
