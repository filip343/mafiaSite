import { loadCreateForm } from "./indexFunctions/createFormHandlers.js"
import { loadJoinForm } from "./indexFunctions/joinFormHandler.js";
import { getSessionTokenFromCookies, saveSessionTokenToCookies } from "./tokenHandler.js";

const buttonFormTypeJoin = document.querySelector("div#pickType #join")
const buttonFormTypeCreate = document.querySelector("div#pickType #create")

const sessionToken = getSessionTokenFromCookies()
var socket;
const establishConnection = (token)=>{
    socket = io("ws://localhost:8080",{
        auth:{
            token:token
        }
    })
}
establishConnection(sessionToken)
const main = ()=>{
    loadJoinForm(socket, onJoin)
    buttonFormTypeCreate.addEventListener("click",()=>loadCreateForm(socket,onJoin))
    buttonFormTypeJoin.addEventListener("click",()=>loadJoinForm(socket,onJoin))
}
socket.on("reusedToken",()=>{
    saveSessionTokenToCookies("")
    establishConnection("")
})

const onJoin = (roomName,username)=>{
    sessionStorage.setItem("roomName",roomName)
    sessionStorage.setItem("username",username)
    window.location="/frontend/waitroom.html"
}
main()