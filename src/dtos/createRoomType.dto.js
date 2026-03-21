const { body } = require("express-validator")

const createRoomTypeDto = [

  body("name")
    .isString()
    .withMessage("Room type name must be a string")
    .notEmpty()
    .withMessage("Room type name is required"),

  body("basePrice")
    .isNumeric()
    .withMessage("Base price must be a number"),

  body("maxOccupancy")
    .isInt()
    .withMessage("Max occupancy must be an integer"),

    body("pricingStrategy")
    .isArray({ min: 1 })
    .withMessage("At least one pricing strategy is required")

]

module.exports = createRoomTypeDto