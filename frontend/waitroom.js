import { saveSessionTokenToCookies } from "./tokenHandler.js";

var numPlayersLabel = document.querySelector("label#numPlayers")
const body = document.querySelector("body")


var startButton = document.querySelector("button#start")
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
    numPlayersLabel = document.querySelector("label#numPlayers")
    numPlayersLabel.innerHTML = users.length

}
const sessionToken = getSessionTokenFromCookies() 

if(!sessionToken){
    window.location = "/frontend/index.html"
}

var socket;
const establishConnection = (token)=>{
    socket = io("ws://localhost:8080",{
        auth:{
            token:token
        }
    })
}
establishConnection(sessionToken)
const roomName = sessionStorage.getItem("roomName")
const username = sessionStorage.getItem("username")

socket.on("reusedToken",()=>{
    saveSessionTokenToCookies("")
    establishConnection("")
})

socket.emit('joinRoom',roomName,username,sessionToken)
socket.once("roomJoinResponse",(data)=>{
    const token = data.token
    const users = data.users
    saveSessionTokenToCookies(token)
    console.log(data)
    updateUsers(users)
    
})
socket.on("adminPriv",()=>{
    body.innerHTML += `
    <button id="start">START</button>
    `
    startButton = document.querySelector("button#start")
    startButton.addEventListener('click',()=>{
        const sessionToken = getSessionTokenFromCookies() 
        socket.emit("start",sessionToken)
    })
})
socket.on("updateUsers",(data)=>{
    updateUsers(data)
})
socket.on("roomDelete",()=>{
    alert("Your room got deleted, sorry :( ")
    window.location = "index.html"
})
