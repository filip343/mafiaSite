/**
 * @typedef {Object} RoomProps
 * @property {string} adminToken
 * @property {string[]} users
 * @property {number} maxNumPlay
 * @property {number} numOfMaf
 * @property {boolean} started
 */

import { getUserByToken } from "./userHandler.js"

/**
 * @param {RoomProps} room
 * @param {string} roomName
 */
export default (room,roomName,io)=>{
    const users = room.users
    const numOfUsers = users.length
    const mafias = []
    for(let i = 0; i<room.numOfMaf;i++){
        var user
        do{
            user = users[Math.floor(Math.random()*0.9999*numOfUsers)]
        }while(mafias.includes(user))

        mafias.push(user)
    }
    const gameUsers = {}
    users.forEach(user =>{
        var role
        if(mafias.includes(user)){
            role = "mafia"
        }else{
            role="citizen"
        }
        gameUsers[user] = {}
        gameUsers[user].role = role 
        gameUsers[user].alive = true
    })
    users.forEach(user=>{
        const usr = getUserByToken(user)
        io.to(usr.socketId).emit("gameStarted",gameUsers[user])

    }) 
}