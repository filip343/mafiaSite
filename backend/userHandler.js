/**
 * @typedef {Object} UserDetails
 * @property {string} username
 * @property {string} roomName
 * @property {string} socketId 
 */
/**
 * @typedef {Object.<string,UserDetails>} UserDictionary
 */
/**
 * @type UserDictionary
 */
import {v4 as uuidv4} from "uuid"
var users = {}

export const logUsers = ()=>{
    console.log(users)
}
const generateSessionToken = () => {
    return uuidv4()
}
/**
 * @param {string} token
 * @return {UserDetails}
 */
export const getUserByToken = (token)=>{
    if(Object.keys(users).includes(token)){
        return users[token]
    }
    return undefined
}
/**
 * @param {string} roomName
 * @return {UserDetails}
 */
export const getUserByRoom = (roomName)=>{
    const response = []
    Object.keys(users).forEach(token=>{
        const user = getUserByToken(token)
        if(user.roomName===roomName){
            response.push(user.username)
        }
    })
    
    return response
}
/**
 * @param {string} username
 * @param {string} roomName
 * @param {string} socketId
 * @return {string}
 */
export const addUser=(username,roomName,socketId)=>{
    var token = generateSessionToken()
    users[token] = {username:username,roomName:roomName,socketId:socketId}
    return token
}
/**
 * @param {string} sessionToken
 * @return {void}
 */
export const removeUserByToken = (token)=>{
    if(Object.keys(users).includes(token)){
        delete users[token]
    }
}
/**
 * @param {string} token
 * @return {void}
 */
export const removeSocketIdByToken =(token)=>{
    if(Object.keys(users).includes(token)){
        users[token].socketId = null
    }
}
/**
 * @param {string} token
 * @param {string} socketId
 * @return {void}
 */
export const addSocketIdByToken = (token,socketId)=>{
    if(Object.keys(users).includes(token)){
        users[token].socketId = socketId
    }
}
