import { getUserByToken,addUser} from "./userHandler.js";
import { Socket } from "socket.io";
import consts from "./consts.js";
/**
 * @typedef {Object} ValidationResult
 * @property {number} status - The status of the validation.
 * @property {string} message - The message returned by the validation.
 */
/**
 * @typedef {Object} RoomCreateObj
 * @property {string} username
 * @property {string} roomName
 * @property {number} maxNumPlay
 * @property {number} numOfMaf
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
 * @param {RoomCreateObj} roomCreateObj  
 * @param {string} sessionToken
 * @param {Socket} socket
 * @param {RoomData} roomData
 * @returns {string}
 */
const MIN_NUM_OF_PLAYERS = consts.MIN_NUM_OF_PLAYERS
const MIN_NUM_OF_MAFIA = consts.MIN_NUM_OF_MAFIA
const MAX_NUM_OF_PLAYERS = consts.MAX_NUM_OF_PLAYERS 
const MAX_NUM_OF_MAFIA = consts.MAX_NUM_OF_MAFIA

export const roomCreate= (roomCreateObj,sessionToken,socket,roomData)=>{
    var roomName = roomCreateObj.roomName
    const validation = validateRoomCreate(roomCreateObj,sessionToken,socket.id,roomData)
    var val_stat = validation.status
    var token
    if(val_stat===200){
        socket.join(roomName)
        token = onRoomCreate(socket,roomCreateObj,roomData)
    }
    var response ={
        create_status:val_stat,
        message:validation.message,
        token:token
    } 
    console.log("new token",token)
    socket.emit("roomCreateResponse",response)
    return token
}

/**
 * @param {RoomCreateObj} roomCreateObj
 * @param {string} sessionToken
 * @param {string} socketId
 * @param {RoomData} roomData
 * @return {ValidationResult}
 */
const validateRoomCreate = (roomCreateObj,sessionToken,socketId,roomData)=>{
    const {username,maxNumPlay,numOfMaf,roomName} = roomCreateObj
    const responseObj={status:200,message:"succesfull"}
    if(Object.keys(roomData).includes(roomName)){
        responseObj.status = 400
        responseObj.message = "Room with that name already exists"
        return responseObj
    }
    if(sessionToken){
        const user = getUserByToken(sessionToken)
        if(!user){
            responseObj.status = 200
            responseObj.message = "user with given sessionToken not found proceed to add sessionToken"
        }else if(user.roomName || user.socketId!==socketId){
            responseObj.status = 400
            responseObj.message = "User with given sessionToken is already playing in different room"
            return responseObj
        }
    }
    if(maxNumPlay>MAX_NUM_OF_PLAYERS || maxNumPlay<MIN_NUM_OF_PLAYERS){
        responseObj.status = 400
        responseObj.message = "Parameter Max Number of players is wrong"
        return responseObj
    }
    if(numOfMaf>MAX_NUM_OF_MAFIA || numOfMaf<MIN_NUM_OF_MAFIA){
        responseObj.status = 400
        responseObj.message = "Parameter number of mafias is wrong"
        return responseObj
    }

    return responseObj

}

/**
 * @param {Socket} socket
 * @param {RoomCreateObj} roomCreateObj
 * @param {RoomData} roomData
 * @return {string}
 */
const onRoomCreate = (socket,roomCreateObj,roomData)=>{
    const {username,maxNumPlay,numOfMaf,roomName} = roomCreateObj
    const token = addUser(username,roomName,socket.id)
    roomData[roomName] = {
        adminToken:token,
        users:[token],
        maxNumPlay:maxNumPlay,
        numOfMaf:numOfMaf,
        started:false
    }
    return token
}