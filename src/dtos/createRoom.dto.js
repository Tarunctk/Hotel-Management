const { body } = require("express-validator")

const createRoomDto = [

  body("roomNumber")
    .isInt()
    .withMessage("Room number must be an integer"),

  body("floor")
    .isInt()
    .withMessage("Floor must be an integer"),

  body("hotelId")
    .isInt()
    .withMessage("Hotel ID must be an integer"),

  body("roomTypeId")
    .isInt()
    .withMessage("Room type ID must be an integer")

]

module.exports = createRoomDto