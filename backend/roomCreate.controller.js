import { getUserByToken,addUser} from "./userHandler.js";
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
export const roomCreate= (roomName,username,sessionToken,socket,roomData)=>{
    const validation = validateRoomCreate(roomName,sessionToken,socket.id,roomData)
    var val_stat = validation.status
    var token
    if(val_stat===200){
        socket.join(roomName)
        token = onRoomCreate(socket,roomName,username,roomData)
    }
    var response ={
        create_status:val_stat,
        message:validation.message,
        token:token
    } 
    socket.emit("roomCreateResponse",response)
    
    return token
}

/**
 * @param {string} roomName
 * @param {string} sessionToken
 * @param {string} socketId
 * @param {RoomData} roomData
 * @return {ValidationResult}
 */
const validateRoomCreate = (roomName,sessionToken,socketId,roomData)=>{
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
            return responseObj
        }else if(user.roomName || user.socketId!==socketId){
            responseObj.status = 400
            responseObj.message = "User with given sessionToken is already playing in different room"
            return responseObj
        }
    }
    return responseObj

}

/**
 * @param {Socket} socket
 * @param {string} roomName
 * @param {string} username
 * @param {RoomData} roomData
 * @return {string}
 */
const onRoomCreate = (socket,roomName,username,roomData)=>{
    var token
    token = addUser(username,roomName,socket.id)
    roomData[roomName] = {adminToken:"",users:[],started:false}
    roomData[roomName].adminToken = token
    roomData[roomName].users = [token]
    return token
}