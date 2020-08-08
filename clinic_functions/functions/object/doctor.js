const { admin }= require('../main/admin')

//show all the doctors in the hospital
exports.getAllDoctors =(req, res) => {
    admin.firestore().collection('Doctors').orderBy('name','asc').get().then(data =>{
      let doctors =[]
      data.forEach(doc =>{
        doctors.push({
          dId:doc.id,
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
      res.json( `Doctor ${req.body.name} (id: ${doc.id}) has joined the team!`)
    )
      .catch((error)=>{
        console.error(error)
        res.status(500).json( 'Server ever!')   
      })
  
}

//Remove doctor from the team
exports.deleteDoctor =(req,res)=>{
  admin.firestore().doc(`/Doctors/${req.params.dId}`).get().then(doc=>{
    if(!doc.exists){
      return res.json(404).json({missing: "Doctor not found!"})
    }
    return admin.firestore().doc(`/Doctors/${req.params.dId}`).delete().then(()=>{
      return res.json({message: "Doctor deleted successfully"})
    })
    .catch(error=>{
      console.error(error)
      return res.status(500).json({error: error.code})
    })
  })
  
}