const { body } = require("express-validator")

const createHotelDto = [

  body("name")
    .isString()
    .withMessage("Name must be a string")
    .notEmpty()
    .withMessage("Hotel name is required"),

  body("location")
    .isString()
    .withMessage("Location must be a string")
    .notEmpty()
    .withMessage("Location is required")

]

module.exports = createHotelDto