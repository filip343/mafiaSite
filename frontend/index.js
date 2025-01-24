const MIN_NUM_OF_PLAYERS = 5
const MIN_NUM_OF_MAFIA = 1
const MAX_NUM_OF_PLAYERS = 40
const MAX_NUM_OF_MAFIA = 8
var buttonJoin = document.querySelector("div#form #join")
var buttonCreate = document.querySelector("div#form #create")
var codeInput =document.getElementById("code")
var nameInput = document.getElementById("username")
var numMafInput = document.querySelector("input#numOfMaf")
var numPlayInput = document.querySelector("input#numOfPlay")
var numMafLabel = document.querySelector("label#numOfMaf")
var numPlayLabel = document.querySelector("label#numOfPlay")
const form = document.querySelector("#form")
const buttonFormTypeJoin = document.querySelector("div#pickType #join")
const buttonFormTypeCreate = document.querySelector("div#pickType #create")

const getSessionTokenFromCookies = ()=> {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        if (cookie.startsWith("session_token=")) {
            const token = cookie.split("=")[1]
            if(token!=="")
            return token;
            else
            return ""
        }
    }
    return ""
}
var sessionToken = getSessionTokenFromCookies()
const socket = io("ws://localhost:8080",{
    query:{
        token:sessionToken
    }
    }
)

const main = ()=>{
    addListenersToJoinForm()
    buttonFormTypeCreate.addEventListener("click",loadCreateForm)
    buttonFormTypeJoin.addEventListener("click",loadJoinForm)
}

const loadCreateForm = ()=>{
    buttonFormTypeCreate.classList.add("picked")
    buttonFormTypeJoin.classList.remove("picked")
    buttonJoin.removeEventListener("click",handleButtonJoinClick)
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
    addListenersToCreateForm()
}
const loadJoinForm = ()=>{
    buttonFormTypeJoin.classList.add("picked")
    buttonFormTypeCreate.classList.remove("picked")
    buttonCreate.removeEventListener("click",handleButtonCreateClick)
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
    addListenersToJoinForm()
}
const addListenersToCreateForm = ()=>{
    buttonCreate.addEventListener("click",handleButtonCreateClick)

    numMafInput.addEventListener("change",(e)=>{
        numMafLabel.innerHTML = MIN_NUM_OF_MAFIA+Math.max(0,Math.round(e.target.value*(MAX_NUM_OF_MAFIA-MIN_NUM_OF_MAFIA)/100))
    })
    numPlayInput.addEventListener("change",(e)=>{
        numPlayLabel.innerHTML = MIN_NUM_OF_PLAYERS+Math.max(0,Math.round(e.target.value*(MAX_NUM_OF_PLAYERS-MIN_NUM_OF_PLAYERS)/100))
    })
}
const addListenersToJoinForm = ()=>{
    buttonJoin.addEventListener("click",handleButtonJoinClick)
}

const handleButtonJoinClick = ()=>{
    var roomName = codeInput.value
    var username = nameInput.value
    if(!roomName){
        alert("You must fill a code input")
        return
    }
    if(!username){
        alert("You must fill a username input")
        return
    }

    socket.emit('joinRoom',roomName,username,sessionToken)

    socket.once("roomJoinResponse",(data)=>{
        const obj = data
        const join_status = obj.join_status
        const token = obj.token
        document.cookie = `session_token=${token};` 
        
        if(join_status===200){
            onJoin(roomName,username)
        }
        console.log(obj.message);
    
    })
}
const handleButtonCreateClick = ()=>{
    var roomName = codeInput.value
    var username = nameInput.value
    var maxNumPlay = MIN_NUM_OF_PLAYERS+Math.max(0,Math.round(numMafInput.value*(MAX_NUM_OF_MAFIA-MIN_NUM_OF_MAFIA)/100))
    var numOfMaf = MIN_NUM_OF_MAFIA+Math.max(0,Math.round(numPlayInput.value*(MAX_NUM_OF_PLAYERS-MIN_NUM_OF_PLAYERS)/100))
    if(!roomName || !username || !maxNumPlay || !numOfMaf){
        alert("You must fill a code input")
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

    socket.emit('createRoom',roomName,username,sessionToken)

    socket.once("roomCreateResponse",(data)=>{ 
        const obj = data
        const join_status = obj.create_status
        const token = obj.token
        document.cookie = `session_token=${token};` 
        
        if(join_status===200){
            onJoin(roomName,username)
        }
        console.log(obj.message);
    
    })
}
const onJoin = (roomName,username)=>{
    sessionStorage.setItem("roomName",roomName)
    sessionStorage.setItem("username",username)

    sessionToken = getSessionTokenFromCookies()
    window.location="/frontend/waitroom.html"
}
main()