import { getSessionTokenFromCookies, saveSessionTokenToCookies } from "../tokenHandler.js"

var buttonJoin = document.querySelector("div#form #join")
var codeInput =document.getElementById("code")
var nameInput = document.getElementById("username")

const buttonFormTypeJoin = document.querySelector("div#pickType #join")
const buttonFormTypeCreate = document.querySelector("div#pickType #create")
const form = document.querySelector("#form")

export const loadJoinForm = (socket,onJoin)=>{
    buttonFormTypeJoin.classList.add("picked")
    buttonFormTypeCreate.classList.remove("picked")
    form.innerHTML = `
            <h1>MAFIA GAME</h1>
            <label>code</label>
            <input type="text" id="code"/>
            <label>username</label>
            <input type="text" id="username"/>
            <button id="join">JOIN</button>
    ` 
    buttonJoin = document.querySelector("div#form #join")
    codeInput =document.getElementById("code")
    nameInput = document.getElementById("username")
    addListenersToJoinForm(socket,onJoin)
}
export const addListenersToJoinForm = (socket,onJoin)=>{
    buttonJoin.addEventListener("click",()=>handleButtonJoinClick(socket,onJoin))
}

export const handleButtonJoinClick = (socket,onJoin)=>{
    const roomName = codeInput.value.trim()
    const username = nameInput.value.trim()
    if(!roomName){
        alert("You must fill a code input")
        return
    }
    if(!username){
        alert("You must fill a username input")
        return
    }
    const sessionToken = getSessionTokenFromCookies()

    socket.emit('joinRoom',roomName,username,sessionToken)

    socket.once("roomJoinResponse",(data)=>{
        const obj = data
        const join_status = obj.join_status
        const token = obj.token
        saveSessionTokenToCookies(token)
        
        if(join_status===200){
            onJoin(roomName,username)
        }else{
            alert(obj.message)
        }
    
    })
}