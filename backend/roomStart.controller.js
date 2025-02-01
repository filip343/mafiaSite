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
 * @typedef {Object} ValidationResponse
 * @property {number} status
 * @property {string} message
 */
import { getUserByToken } from "./userHandler.js"
import consts from "../consts.js"
import startGame from "./game.handler.js"

const {
    MIN_NUM_OF_MAFIA,
    MIN_NUM_OF_PLAYERS,
    MAX_NUM_OF_MAFIA,
    MAX_NUM_OF_PLAYERS} = consts

/**
 * @param {string} token
 * @param {RoomData} roomData
 * @param {Socket} socket
 * @returns {void}
 */
export const startRoom = (token,roomData,socket,io)=>{
    const {validation,room,user} = validateRoomStart(token,roomData,socket)
    const val_stat = validation.status
    if(val_stat===200){
        const roomName = user.roomName
        room.started = true
        startGame(room,roomName,io)
    }
    var response ={
        start_status:val_stat,
        message:validation.message
        
    } 
    socket.emit("roomStartResponse",response)
    return token
}
/**
 * @param {string} token
 * @param {RoomData} roomData
 * @param {Socket} socket
 * @returns {Object} 
 */
const validateRoomStart = (token,roomData,socket)=>{
    const response = {status:200,message:"succesful"}
    const user = getUserByToken(token)
    if(!user){
        response.status = 400
        response.message = "bad token, user does not exist"
        return {validation:response}
    }
    if(user.socketId !== socket.id){
        response.status=400
        response.message="Request sent from a wrong connection"
        return {validation:response}
    }
    const roomName = user.roomName
    const room = roomData[roomName]
    if(!room){
        response.status=404
        response.message="User's room not found"
        return {validation:response}
    }
    if(room.adminToken !== token){
        response.status = 400
        response.message = "User is not an admin"
        return {validation:response}
    }
    if(room.started){
        response.status = 400
        response.message = "Don't know how you got to that but don't try to destroy the site, btw the room already started a game "
        return {validation:response}
    }
    const numPlayers = room.users.length
    //if we add keeping tokens alive after player leaving we should filter the room users
    
    if(numPlayers< MIN_NUM_OF_PLAYERS ||numPlayers*2 <=room.numOfMaf){
        response.status = 400
        response.message = "Too few players to start a game"
        return {validation:response}
    } 
    if(numPlayers>room.maxNumPlay){
        response.status = 400
        response.message = "Too many players in the room (shouldn't happen)"
        return {validation:response}
    }
    
    return {validation:response,room:room,user:user}
}