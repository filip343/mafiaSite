const buttonJoin = document.getElementById("join")
const buttonCreate = document.getElementById("create")
const codeInput =document.getElementById("code")
const nameInput = document.getElementById("username")

function getSessionTokenFromCookies() {
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
console.log(`session token: ${sessionToken}`)

const socket = io("ws://localhost:8080",{
    query:{
        token:sessionToken
    }
    }
)

const onJoin = (roomName,username)=>{
    sessionStorage.setItem("roomName",roomName)
    sessionStorage.setItem("username",username)

    sessionToken = getSessionTokenFromCookies()
    window.location="/frontend/waitroom.html"
}

buttonJoin.addEventListener("click",()=>{
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
})

buttonCreate.addEventListener("click",()=>{
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
})