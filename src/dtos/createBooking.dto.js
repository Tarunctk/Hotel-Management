const { body } = require("express-validator")

const createBookingDto = [
  body("guest_name").notEmpty().withMessage("Guest name required"),
  body("room_type_id").isInt().withMessage("Room type id must be integer"),
  body("check_in_date").notEmpty().withMessage("Check in date required"),
  body("check_out_date").notEmpty().withMessage("Check out date required")
]

module.exports = createBookingDto