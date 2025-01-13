const buttonJoin = document.getElementById("join")
const codeInput =document.getElementById("code")
const nameInput = document.getElementById("username")
var joined = false
function getSessionTokenFromCookies() {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        if (cookie.startsWith("session_token=")) {
            const token = cookie.split("=")[1]
            if(token!=="")
            return token;
            else
            return null
        }
    }
    return null;
}
const sessionToken = getSessionTokenFromCookies()
console.log(`session token: ${sessionToken}`)

const socket = io("ws://localhost:8080",{
    query:{
        token:sessionToken
    }
    }
)

socket.once("tokenValidation",(data)=>{
    console.log(data.token_status)
})
const onJoin = ()=>{
    //window.location="/frontend/waitroom.html"
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
            onJoin()
            joined=true
        }
        console.log(obj.message);
    
    })
})