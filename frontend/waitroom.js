import { saveSessionTokenToCookies,getSessionTokenFromCookies } from "./tokenHandler.js";

var numPlayersLabel = document.querySelector("label#numPlayers")
const body = document.querySelector("body")


var startButton = document.querySelector("button#start")
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
    socket = io(`ws://localhost:8080?token=${token}`)
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
    if(data.join_status!==200){
        alert(data.message)
        window.location = "/frontend/index.html"
    }
    
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
        socket.once("roomStartResponse",(response)=>{
            if(response.join_status!==200){
                alert(response.message)
            }
        })
    })
})
socket.on("updateUsers",(data)=>{
    console.log(data)
    updateUsers(data)
})
socket.on("gameStarted",(data)=>{
    console.log(data)
})
socket.on("roomDelete",()=>{
    alert("Your room got deleted, sorry :( ")
    window.location = "/frontend/index.html"
})
