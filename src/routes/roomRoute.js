const express=require('express')
const router=express.Router()
const roomController = require('../controllers/roomController')
const createRoomDto = require("../dtos/createRoom.dto")


router.get('/room',roomController.getRooms)
router.post('/room',createRoomDto,roomController.createRoom)
router.put('/room/:id',createRoomDto,roomController.updateRoom)
router.delete('/room/:id',roomController.deleteRoom)

module.exports=router