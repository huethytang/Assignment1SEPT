const { admin } = require('./admin')

//validate users
exports.authorization= (req,res,next) =>{
    var token
    if(req.headers.authorization){
      token = req.headers.authorization
    } else {
      console.error('Not authorized')
      return res.status(401).json({unauthorized:" Access denied!"})
    }
    admin.auth().verifyIdToken(token).then(tokenCode=>{
      req.user = tokenCode
      return admin.firestore().collection('accounts').where('userId', '==', req.user.uid).limit(1).get().then(data =>{
        req.user.phone = data.docs[0].data().phone
        return next()
      })
      .catch(error=>{
        console.error(error)
        return res.status(401).json({unauthorized:" access denied!"})
      })
  })}