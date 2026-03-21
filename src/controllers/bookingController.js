const BookingUtils = require("../utils/bookingUtils");
const pool = require("../db/db");


//Create Booking Initialization
exports.createBooking = async (req,res)=>{
  try{
    const {guestName, roomTypeId, checkInDate, checkOutDate} = req.body;
    const booking = await BookingUtils.initializeBooking(
      guestName,
      roomTypeId,
      checkInDate,
      checkOutDate
    );
    res.json(booking);
  }catch(err){
    console.error(err);
    res.status(500).json({error:err.message});
  }
};

//Confirm Booking
exports.confirmBooking = async (req,res)=>{
  try{
    const {id} = req.params;
    const booking = await BookingUtils.confirmBooking(id);
    res.json(booking);
  }
  catch(err){
    console.error(err);
    res.status(500).json({error:err.message});
  }
};


// Check In
exports.checkInBooking = async (req,res)=>{
  try{
    const {id} = req.params;
    const booking = await BookingUtils.checkInBooking(id);
    res.json(booking);
  }
  catch(err){
    console.error(err);
    res.status(500).json({error:err.message});
  }
};


//Check Out
exports.checkOutBooking = async (req,res)=>{
  try{
    const {id} = req.params;
    const booking = await BookingUtils.checkOutBooking(id);
    res.json(booking);
  }
  catch(err){
    console.error(err);
    res.status(500).json({error:err.message});
  }
};


//Complete Booking
exports.completeBooking = async (req,res)=>{
  try{
    const {id} = req.params;
    const booking = await BookingUtils.completeBooking(id);
    res.json(booking);
  }
  catch(err){
    console.error(err);
    res.status(500).json({error:err.message});
  }
};


//List Bookings
exports.getBookings = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";

    const offset = (page - 1) * limit;

    const searchQuery = `%${search}%`;

    const result = await pool.query(
      `SELECT b.*, r.name AS room_type_name
       FROM booking b
       LEFT JOIN room_type r ON b.room_type_id = r.id
       WHERE
       b.guest_name ILIKE $1
       OR r.name ILIKE $1
       OR b.status ILIKE $1
       OR CAST(b.id AS TEXT) ILIKE $1
       ORDER BY b.id
       LIMIT $2 OFFSET $3`,
      [searchQuery, limit, offset]
    );

    const count = await pool.query(
      `SELECT COUNT(*)
       FROM booking b
       LEFT JOIN room_type r ON b.room_type_id = r.id
       WHERE
       b.guest_name ILIKE $1
       OR r.name ILIKE $1
       OR b.status ILIKE $1
       OR CAST(b.id AS TEXT) ILIKE $1`,
      [searchQuery]
    );

    const totalPages = Math.ceil(count.rows[0].count / limit);

    res.json({
      data: result.rows,
      totalPages
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};