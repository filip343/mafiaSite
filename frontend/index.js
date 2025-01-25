import { loadCreateForm } from "./indexFunctions/createFormHandlers.js"
import { loadJoinForm } from "./indexFunctions/joinFormHandler.js";
import { getSessionTokenFromCookies } from "./tokenHandler.js";

const buttonFormTypeJoin = document.querySelector("div#pickType #join")
const buttonFormTypeCreate = document.querySelector("div#pickType #create")

var sessionToken = getSessionTokenFromCookies()

const socket = io("ws://localhost:8080",{
    query:{
        token:sessionToken
    }
})

const main = ()=>{
    loadJoinForm(socket, onJoin)
    buttonFormTypeCreate.addEventListener("click",()=>loadCreateForm(socket,onJoin))
    buttonFormTypeJoin.addEventListener("click",()=>loadJoinForm(socket,onJoin))
}

const onJoin = (roomName,username)=>{
    sessionStorage.setItem("roomName",roomName)
    sessionStorage.setItem("username",username)

    window.location="/frontend/waitroom.html"
}
main()