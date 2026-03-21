const express = require('express')
const router = express.Router()

const roomTypeController = require('../controllers/roomTypeController')
const createRoomTypeDto = require("../dtos/createRoomType.dto")

router.get('/room-type', roomTypeController.getRoomTypes)
router.post('/room-type',createRoomTypeDto,roomTypeController.createRoomType)
router.put('/room-type/:id', createRoomTypeDto,roomTypeController.updateRoomType)
router.delete('/room-type/:id',roomTypeController.deleteRoomType)

module.exports = router