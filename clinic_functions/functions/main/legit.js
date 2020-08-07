//validate input fields
exports.legitEmail=(email)=>{
    const regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if(email.match(regExp)){return true} 
    else {return false}
  }
  
exports.legitName = (name) =>{
    if (name.length>0 && name.trim().length <25){
      return true
    } else {return false}
}
  
exports.legitPassword =(password)=>{
    if (password.length >0 && password.length<15){
      return true
    } else {return false}
}
exports.emptyField = (field)=>{
     if(field.trim() === ""){
         return true
     } else {return false}
 } 
