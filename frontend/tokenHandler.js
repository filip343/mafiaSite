export const getSessionTokenFromCookies = ()=> {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        if (cookie.startsWith("session_token=")) {
            const token = cookie.split("=")[1]
            if(token!=="")
            return token;
            else
            return ""
        }
    }
    return ""
}
export const saveSessionTokenToCookies = (token)=>{
    document.cookie = `session_token=${token};` 
}