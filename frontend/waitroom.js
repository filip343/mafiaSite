const numPlayersLabel = document.getElementById("numPlayers")
function getSessionTokenFromCookies() {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        if (cookie.startsWith("session_token=")) {
            return cookie.split("=")[1];
        }
    }
    return null;
}
function updateUsers(users){
    numPlayersLabel.innerText = users.length
}
const sessionToken = getSessionTokenFromCookies() 

console.log("session Token:",sessionToken)
if(!sessionToken){
    window.location = "/frontend/index.html"
    
}
const socket = io("ws://localhost:8080",{
    query:{
        token:sessionToken
    }
})
const roomName = sessionStorage.getItem("roomName")
const username = sessionStorage.getItem("username")

socket.emit('joinRoom',roomName,username,sessionToken)
socket.once("roomJoinResponse",(data)=>{
    const token = data.token
    const users = data.users
    document.cookie = `session_token=${token};` 
    updateUsers(users)
    
})
socket.on("updateUsers",(data)=>{
    updateUsers(data)
})
socket.on("roomDelete",()=>{
    alert("Your room got deleted, sorry :( ")
    window.location = "index.html"
})
