const express = require('express')
const application = express()
const functions = require('firebase-functions')

//get all the necessary functions
const { accountRegister, login,updateAccountInfo, getAllAccounts,getAccountInfo, deleteAccount} = require('./main/account')
const { getAllBookings, createBooking, getBookingHistory, getBookingDetail, deleteBooking } = require('./service/booking')
const { getAllDoctors, addADoctor} = require('./object/doctor')
const { authorization} = require('./main/authorization')


application.get('/Doctors', getAllDoctors)
application.post('/Doctor', authorization, addADoctor)


application.get('/Booking-history', authorization, getBookingHistory)
application.get('/Booking/:bId',authorization, getBookingDetail)
application.get('/All-bookings', authorization, getAllBookings)
application.post('/Booking', authorization, createBooking)
application.delete('/Booking/:bId', authorization, deleteBooking)


application.get('/All-accounts', authorization, getAllAccounts)
application.get('/account-info', authorization, getAccountInfo)
application.post('/register', accountRegister)
application.post('/login', login)
application.post('/account', authorization, updateAccountInfo)
application.delete('/account',authorization, deleteAccount)


//deployment to the default region US
exports.AyPiAI = functions.https.onRequest(application)