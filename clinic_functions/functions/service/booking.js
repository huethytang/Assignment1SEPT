const { admin } = require('../main/admin.js')
const { legitEmail,legitName,emptyField } = require('../main/legit')


//create a new online booking form
exports.createBooking = (req, res) =>{
  const newBookingForm ={
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    time: req.body.time,
    paymentMethod: req.body.paymentMethod,
    service: req.body.service
  }

  const mistakes ={}
  if (legitName(newBookingForm.name)===false){
    mistakes.name = 'Name can not be empty nor exceed 25 characters!'
  }  else if (legitEmail(newBookingForm.email)===false){
    mistakes.email = 'Invalid email address!'
  } else if (emptyField(newBookingForm.phone)){
      mistakes.phone = 'This field must not be empty'
  } else if (emptyField(newBookingForm.service)){
    mistakes.service = 'This field must not be empty'
  } else if (emptyField(newBookingForm.paymentMethod)){
    mistakes.paymentMethod = 'This field must not be empty'
  } 
  if (Object.keys(mistakes).length > 0){
    return res.status(400).json(mistakes)
  }
    return admin.firestore().collection('Bookings').add(newBookingForm).then((doc)=>{
      const final = newBookingForm
      final.bookingId = doc.id
      res.status(201).json({ notification : `A ${newBookingForm.service} meeting (id: ${final.bookingId}) at ${newBookingForm.time} on ${newBookingForm.date} has been scheduled!`})
  })
    .catch((error)=>{
      console.error(error)
      res.status(500).json({ error: 'Server ever!'})
    })
  }

//get all the recorded bookings data
exports.getAllBookings = (req, res) => {
    admin.firestore().collection('Bookings').get().then(data =>{
      let bookings =[]
      data.forEach(doc =>{
        bookings.push({
          bId:doc.id,
          ...doc.data()
        })
      })
      return res.json(bookings)
    })
    .catch(error => console.error(error))
}


exports.getBookingDetail=(req,res)=>{
  let bookingDetail ={}
  admin.firestore().doc(`/Bookings/${req.params.bId}`).get().then(doc=>{
    if (doc===null){
      return res.status(404).json({error: "404 not found!"})
    }
    bookingDetail =doc.data()
    return res.json({bookingDetail})
  })
  .catch(error=>{
    console.error(error)
    res.status(500).json(error.code)
  })
  }


exports.getBookingHistory =(req,res)=>{
  const bookingHisotry = []
  return admin.firestore().collection('Bookings').where("phone","==",req.user.phone).get().then(doc=>{
    if(doc ===null){
      return res.status(404).json({error:"404 not found!"})
    } else{
      doc.forEach(data=>{
        bookingHisotry.push({
          bId:doc.id,
          ...data.data()
        })
      })
    }
    if (bookingHisotry.length===0){
      return res.status(404).json({empty: "No booking has been scheduled!"})
    }
    return res.json({bookingHisotry})
  })
  .catch(error=>{
    console.error(error)
    res.status(500).json({"error":error.code})
  })
}

exports.deleteBooking =(req,res)=>{
  admin.firestore().doc(`/Bookings/${req.params.bId}`).get().then(doc=>{
  if(doc === null){
    return res.status(404).json({error:"404 not found!"})
  } else if(doc.data().email!=req.user.email){
    return res.status(400).json({unauthorized:" You are not allowed to delete this document!"})
  } else {
    return admin.firestore().doc(`/Bookings/${req.params.bId}`).delete().then(()=>{
      res.status(200).json({message:`Booking deleted successfully!`})
    })
  }}
  )}