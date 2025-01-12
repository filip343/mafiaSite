function getSessionTokenFromCookies() {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        if (cookie.startsWith("session_token=")) {
            return cookie.split("=")[1];
        }
    }
    return null;
}
const sessionToken = getSessionTokenFromCookies() 

if(!sessionToken){
    window.location = "/frontend/index.html"
    
}
const socket = io("ws://localhost:8080",{
    query:{
        token:sessionToken
    }
})
socket.on("newUser",(data)=>{
    console.log(data);
    
})
