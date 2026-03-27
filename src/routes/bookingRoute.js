const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const authMiddleware=require("../middlewares/authMiddleware")
const createBookingDto = require("../dtos/createBooking.dto");

router.get("/", bookingController.getBookings);
router.post("/", authMiddleware,createBookingDto, bookingController.createBooking);
router.patch("/:id/confirm", bookingController.confirmBooking);
router.patch("/:id/checkin", bookingController.checkInBooking);
router.patch("/:id/checkout", bookingController.checkOutBooking);
router.patch("/:id/complete", bookingController.completeBooking);

module.exports = router;