import { getUserByToken,addUser,logUsers, getUserByRoom} from "./userHandler.js";
import { Socket } from "socket.io";
/**
 * @typedef {Object} ValidationResult
 * @property {number} status - The status of the validation.
 * @property {string} message - The message returned by the validation.
 */
/**
 * @typedef {Object} RoomProps
 * @property {string} adminToken
 * @property {string[]} users
 * @property {number} maxNumPlay
 * @property {number} numOfMaf
 * @property {boolean} started
 */

/**
 * @typedef {Object.<string,RoomProps>} RoomData
 */

/** 
 * @param {string} roomName  
 * @param {string} username
 * @param {string} sessionToken
 * @param {Socket} socket
 * @param {RoomData} roomData
 * @returns {string}
 */
export const roomJoin = (roomName,username,sessionToken,socket,roomData)=>{
    const validation = validateRoomJoin(roomName,sessionToken,username,socket.id,roomData)
    var val_stat = validation.status
    var token
    if(val_stat===200){
        socket.join(roomName)
        token = onRoomJoin(socket,roomName,username,sessionToken,roomData)
    }
    var response ={
        join_status:val_stat,
        message:validation.message,
        token:token,
        users:getUserByRoom(roomName)
    } 
    socket.emit("roomJoinResponse",response)

    return token
}

/**
 * @param {string} roomName
 * @param {string} sessionToken
 * @param {string} username
 * @param {string} socketId
 * @param {RoomData} roomData
 * @return {ValidationResult}
 */
const validateRoomJoin = (roomName,sessionToken,username,socketId,roomData)=>{
    const responseObj={status:200,message:"succesfull"}
    if(!roomData[roomName]){
        responseObj.status=404
        responseObj.message = "room with given name not found"
        return responseObj
    }
    if(sessionToken){
        
        const user = getUserByToken(sessionToken)
        if(!user){
            responseObj.status = 200
            responseObj.message = "user with given sessionToken not found proceed to add sessionToken"
        }else if(user.socketId!==socketId){
            if(user.roomName!==roomName){
                responseObj.status = 400
                responseObj.message = "User with given sessionToken is already playing in different room"
                return responseObj
            }
            responseObj.status=400
            responseObj.message = "user with given sessionToken already in game"
            return responseObj
        }else if(user.roomName!==roomName){
            responseObj.status = 400
            responseObj.message = "User with given sessionToken is already playing in different room"
            return responseObj
        }
        roomData[roomName].users.forEach(user=>{
            const foundUser = getUserByToken(user)

            if(foundUser && foundUser.username===username && user!==sessionToken){
                responseObj.status=400
                responseObj.message = "user with that username already in game"
                return responseObj
            }
        })
    }else{
        roomData[roomName].users.forEach(user=>{
            const foundUser = getUserByToken(user)

            if(foundUser && foundUser.username===username){
                responseObj.status=400
                responseObj.message = "user with that username already in game"
                return responseObj
            }
        })   
    }
    const playerCount = roomData[roomName].users.length 
    
    if(playerCount>=roomData[roomName].maxNumPlay){
        responseObj.status = 400
        responseObj.message = "The room is full"
    }
    
    return responseObj

}

/**
 * @param {Socket} socket
 * @param {string} roomName
 * @param {string} username
 * @param {string} sessionToken
 * @param {RoomData} roomData
 * @return {string}
 */
const onRoomJoin = (socket,roomName,username,sessionToken,roomData)=>{
    var token
    const user = getUserByToken(sessionToken)
    if(user){
        token = sessionToken
        const adminToken = roomData[roomName].adminToken
        const adminUser = getUserByToken(adminToken)
        if(adminUser === user){
            socket.emit("adminPriv")
        }
    }else{
        token = addUser(username,roomName,socket.id)
        roomData[roomName].users.push(token)
        const roomUsers = getUserByRoom(roomName)
        socket.to(roomName).emit('updateUsers',roomUsers)
    }
    return token

}