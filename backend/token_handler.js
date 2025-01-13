const users = {}

export const logUsers = ()=>{
    console.log(users)
}
const generateSessionToken = () => {
    return Math.random().toString(36).substr(2); // Random token
}
export const getUserByToken = (token)=>{
    const user = users[token]
    return user
}
export const addUser=(username,roomName,socketId)=>{
    var token = generateSessionToken()
    users[token] = {username:username,roomName:roomName,socketId:socketId}
    return token
}
export const removeSocketIdByToken =(token)=>{
    if(users[token]){
        users[token].socketId = null
    }
}
export const addSocketIdByToken = (token,socketId)=>{
    users[token].socketId = socketId
}
