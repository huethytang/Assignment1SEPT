const { admin }= require('../main/admin')

//show all the doctors in the hospital
exports.getAllDoctors =(req, res) => {
    admin.firestore().collection('Doctors').orderBy('name','asc').get().then(data =>{
      let doctors =[]
      data.forEach(doc =>{
        doctors.push({
          dID:doc.id,
          ...doc.data()})
      })
      return res.json(doctors)
    })
    .catch(error => console.error(error))
}
//add a new doctor to the team
exports.addADoctor = (req, res) =>{
    admin.firestore().collection('Doctors').add({
      name: req.body.name,
      expertise: req.body.expertise,
      background: req.body.background
    })
    .then(
      res.json( `Doctor ${req.body.name} has joined the team!`)
    )
      .catch((error)=>{
        console.error(error)
        res.status(500).json( 'Server ever!')   
      })
  
}