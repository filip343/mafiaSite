const {Server} = require("socket.io")
const io = new Server(8080, {
    cors: {
        origin: 'http://127.0.0.1:5500',
        methods: ['GET', 'POST'],
    },
});
console.log("Websocket running on port 8080")

const roomData = {
    "num":{admin:{},users:[]}
}

io.on('connection', (socket)=>{
    console.log(`Client connected: ${socket.id}`)

    socket.on("joinRoom",(roomName,username)=>{
        console.log(username);
        
        if(!roomData[roomName]){
            socket.emit("roomJoinResponse",{join_status:404,message:"Room not found"})
        }
        else{
            socket.join(roomName)
            roomData[roomName].users.push({id:socket.id,name:username})
            console.log(`User ${socket.id} joined room ${roomName}`)
            socket.to(roomName).emit('message',`User ${socket.id} has joined the room.`)
            socket.emit("roomJoinResponse",{join_status:200,message:"succesfully joined a room"})
        }
    })
})
