const { admin } = require('./admin')
//Firebase configuration
const config = {
  apiKey: "AIzaSyBDD68Bo2aPMnn79mnFsguYCmbou6jUDVA",
  authDomain: "online-clinic-booking-system.firebaseapp.com",
  databaseURL: "https://online-clinic-booking-system.firebaseio.com",
  projectId: "online-clinic-booking-system",
  storageBucket: "online-clinic-booking-system.appspot.com",
  messagingSenderId: "819997834038",
  appId: "1:819997834038:web:fd22ddb666d7639ac51197",
  measurementId: "G-9112XH00EP"
}
const firebase = require('firebase')
firebase.initializeApp(config)

const { legitEmail,legitName,legitPassword,emptyField} = require('./legit')

//show all the registered accounts

//sign up function
exports.accountRegister = (req, res) =>{
    const mistakes ={}
    const newAccount ={
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      confirmedPW: req.body.confirmedPW
    }
    //validate input
    if (legitName(newAccount.name)===false){
      mistakes.name = 'Name can not be empty nor exceed 25 characters!'
    } else if (legitPassword(newAccount.password)===false){
      mistakes.password = 'Password can not be empyty nor exceed 14 characters!'
    } else if (legitEmail(newAccount.email)===false){
      mistakes.email = 'Invalid email address!'
    } else if (newAccount.password != newAccount.confirmedPW){
      mistakes.password = 'Confirmed password does not match'
    } else if (emptyField(newAccount.phone)){
        mistakes.phone = 'invalid phone number'
    }
    
    if (Object.keys(mistakes).length > 0){
      return res.status(401).json(mistakes)
    }
    //phone must be unique
    var accountToken
    let userId
    admin.firestore().doc(`/accounts/${newAccount.phone}`).get().then(doc=>{
      if (doc.exists){
        res.status(402).json( {phone:`${doc.data().phone} has already been used.`})
      }
      else {
        return firebase.auth().createUserWithEmailAndPassword(newAccount.email, newAccount.password).
        then(data=>{
          userId = data.user.uid
          return data.user.getIdToken()
        }).then(tokenCode =>{
          accountToken = tokenCode
          const accountInfo ={
            name: newAccount.name,
            email: newAccount.email,
            phone: newAccount.phone,
            password: newAccount.password,
            timeCreated: new Date().toISOString(),
            userId
          }
          return admin.firestore().doc(`/accounts/${newAccount.phone}`).set(accountInfo).then(()=>{
            return res.status(201).json({accountToken})})
        })
      }
    })
    //catching reusing email error
    .catch((errors)=>{
      console.error(errors)
      if (errors.code === "auth/email-already-in-use"){
        return res.status(400).json({email:`${newAccount.email} has already been used!`})
     } else {
       return res.status(500).json({errors: errors.code})}
    })
  }


  //sign in function
exports.login = (req,res)=>{
    const account ={
      email: req.body.email,
      password: req.body.password
    }
    const mistakes ={}
  
    if (legitPassword(account.password)===false){
      mistakes.password = 'Password can not be empyty nor exceed 14 characters!'
    } else if (legitEmail(account.email)===false){
      mistakes.email = 'Invalid email address!'
    }
    
    if (Object.keys(mistakes).length >0){
      return res.status(401).json(mistakes)
    }
    firebase.auth().signInWithEmailAndPassword(account.email, account.password).then(doc =>{
      return doc.user.getIdToken()
    }).then(tokenCode =>{
      return res.json(tokenCode)
    })
    .catch(errors =>{
      console.error(errors)
      if (errors.code === "auth/wrong-password"){
        return res.status(400).json({error: `Password and email doesn not match!`})
      } else {return res.status(501).json(errors.code)}
    })
  }

  
  //show user personal info
  exports.getAccountInfo = (req,res )=>{
      accountInfo ={}
      admin.firestore().doc(`/accounts/${req.user.phone}`).get().then(doc=>{
        if(doc!=null){
          accountInfo = doc.data()
          delete accountInfo.userId
          delete accountInfo.timeCreated
          delete accountInfo.confirmedPW
        } else{
          return res.status(404).json({error:"404 not found"})}
        return res.json({accountInfo})
    })
    .catch(error=>{
      console.error(error)
      res.status(500).json({errors : error.code})
    })
  }


  //update account personal info (can not change phone,name or email)
  exports.updateAccountInfo =(req,res) =>{
    const newAccountInfo = {
      "password": req.body.password,
      "confirmedPW": req.body.confirmedPW,
      "gender": req.body.gender,
      "age": req.body.age
    }
    const mistakes ={}
    if (legitPassword(newAccountInfo.password)===false){
      mistakes.password = 'Password can not be empyty nor exceed 14 characters!' 
    } else if (newAccountInfo.password != newAccountInfo.confirmedPW){
      mistakes.password = 'Confirmed password does not match'
    } 
    
    if (Object.keys(mistakes).length > 0){
      return res.status(401).json(mistakes)
    }
    admin.firestore().doc(`/accounts/${req.user.phone}`).update(newAccountInfo).then(()=>{
      res.json({notification: "Updated succesfully!"})
    })
    .catch(error=>{
      console.error(error)
      return res.status(500).json(error.code)
    })
  }


  exports.getAllAccounts = (req, res)=>{
    admin.firestore().collection('accounts').orderBy('name','asc').get().then(data=>{
      let account =[]
      data.forEach(doc =>{
        account.push({
          ...doc.data()})
        })
        return res.json(account)
      })
      .catch(error => console.error(error))
}

exports.deleteAccount=(req,res)=>{
  admin.firestore().doc(`/accounts/${req.user.phone}`).get().then(doc=>{
    if (doc.data().email=req.user.email){
      return admin.firestore().doc(`/accounts/${req.user.phone}`).delete().then(()=>
      res.status(200).json({message: "Account deleted successfully"}))
    }
  })
}
