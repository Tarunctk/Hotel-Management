const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const createBookingDto = require("../dtos/createBooking.dto");

router.get("/", bookingController.getBookings);
router.post("/", createBookingDto, bookingController.createBooking);
router.patch("/:id/confirm", bookingController.confirmBooking);
router.patch("/:id/checkin", bookingController.checkInBooking);
router.patch("/:id/checkout", bookingController.checkOutBooking);
router.patch("/:id/complete", bookingController.completeBooking);

module.exports = router;