const express=require('express')
const router=express.Router()
const createhotelDto = require("../dtos/createHotel.dto")

const hotelController=require('../controllers/hotelController')

router.get('/hotel',hotelController.getHotels)
router.post('/hotel',createhotelDto,hotelController.createHotel)
router.put('/hotel/:id',createhotelDto,hotelController.updateHotel)
router.delete('/hotel/:id',hotelController.deleteHotel)

module.exports=router
