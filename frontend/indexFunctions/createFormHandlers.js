import consts from "./consts.js"
import { getSessionTokenFromCookies, saveSessionTokenToCookies } from "../tokenHandler.js"
const MIN_NUM_OF_PLAYERS = consts.MAX_NUM_OF_PLAYERS
const MIN_NUM_OF_MAFIA = consts.MIN_NUM_OF_MAFIA
const MAX_NUM_OF_PLAYERS = consts.MAX_NUM_OF_PLAYERS 
const MAX_NUM_OF_MAFIA = consts.MAX_NUM_OF_MAFIA
var buttonCreate = document.querySelector("div#form #create")
var codeInput =document.getElementById("code")
var nameInput = document.getElementById("username")
var numMafInput = document.querySelector("input#numOfMaf")
var numPlayInput = document.querySelector("input#numOfPlay")
var numMafLabel = document.querySelector("label#numOfMaf")
var numPlayLabel = document.querySelector("label#numOfPlay")
const buttonFormTypeJoin = document.querySelector("div#pickType #join")
const buttonFormTypeCreate = document.querySelector("div#pickType #create")
const form = document.querySelector("#form")

export const loadCreateForm = (socket,onJoin)=>{
    buttonFormTypeCreate.classList.add("picked")
    buttonFormTypeJoin.classList.remove("picked")
    form.innerHTML = `
            <h1>MAFIA GAME</h1>
            <label>code</label>
            <input type="text" id="code"/>
            <label>username</label>
            <input type="text" id="username"/>
            <label>Maximum number of players</label>
            <label id="numOfPlay">5</label>
            <input type="range" id="numOfPlay" value="1"/> 
            <label>Number of mafias</label>
            <label id="numOfMaf">1</label>
            <input type="range" id="numOfMaf" value="1"/> 
            <button id="create">CREATE</button>
    ` 
    buttonCreate = document.querySelector("div#form #create")
    codeInput =document.getElementById("code")
    nameInput = document.getElementById("username")
    numMafInput = document.querySelector("input#numOfMaf")
    numPlayInput = document.querySelector("input#numOfPlay")
    numMafLabel = document.querySelector("label#numOfMaf")
    numPlayLabel = document.querySelector("label#numOfPlay")    
    addListenersToCreateForm(socket,onJoin)
}

export const addListenersToCreateForm = (socket,onJoin)=>{
    buttonCreate.addEventListener("click",()=>handleButtonCreateClick(socket,onJoin))

    numMafInput.addEventListener("change",(e)=>{
        numMafLabel.innerHTML = MIN_NUM_OF_MAFIA+Math.max(0,Math.round(e.target.value*(MAX_NUM_OF_MAFIA-MIN_NUM_OF_MAFIA)/100))
    })
    numPlayInput.addEventListener("change",(e)=>{
        numPlayLabel.innerHTML = MIN_NUM_OF_PLAYERS+Math.max(0,Math.round(e.target.value*(MAX_NUM_OF_PLAYERS-MIN_NUM_OF_PLAYERS)/100))
    })
}

export const handleButtonCreateClick = (socket,onJoin)=>{
    var roomName = codeInput.value
    var username = nameInput.value
    var maxNumPlay = MIN_NUM_OF_PLAYERS+Math.max(0,Math.round(numMafInput.value*(MAX_NUM_OF_MAFIA-MIN_NUM_OF_MAFIA)/100))
    var numOfMaf = MIN_NUM_OF_MAFIA+Math.max(0,Math.round(numPlayInput.value*(MAX_NUM_OF_PLAYERS-MIN_NUM_OF_PLAYERS)/100))
    if(!roomName || !username || !maxNumPlay || !numOfMaf){
        alert("You must fill all inputs")
        return
    }
    if(maxNumPlay>MAX_NUM_OF_PLAYERS || numOfMaf > MAX_NUM_OF_MAFIA){
        alert("Too big of a value in the number of mafias or max number of players")
    }
    const createRoomObj = {
        roomName:roomName,
        username:username,
        maxNumPlay:maxNumPlay,
        numOfMaf:numOfMaf
    }

    var sessionToken = getSessionTokenFromCookies()
    socket.emit('createRoom',roomName,username,sessionToken)

    socket.once("roomCreateResponse",(data)=>{ 
        const obj = data
        const join_status = obj.create_status
        const token = obj.token
        saveSessionTokenToCookies(token)
        
        if(join_status===200){
            onJoin(roomName,username)
        }
        console.log(obj.message);
    
    })
}