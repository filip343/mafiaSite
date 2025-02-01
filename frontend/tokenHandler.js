//for development saving a token in session storage
export const getSessionTokenFromCookies = ()=> {
    const token = sessionStorage.getItem("sessionToken")
    return token?token:""
    //const cookies = document.cookie.split("; ");
    //for (let cookie of cookies) {
    //    if (cookie.startsWith("session_token=")) {
    //        const token = cookie.split("=")[1]
    //        if(token!=="")
    //        return token;
    //        else
    //        return ""
    //    }
    //}
    //return ""
}
export const saveSessionTokenToCookies = (token)=>{
    sessionStorage.setItem("sessionToken",token)
    //document.cookie = `session_token=${token};` 
}