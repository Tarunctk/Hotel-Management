// const BookingUtils = require("../utils/bookingUtils");
// const pool = require("../db/db");


// //Create Booking Initialization
// exports.createBooking = async (req,res)=>{
//   try{
//     const userId = req.user.id;
//     const userResult=await pool.query(
//       "select * from users where id=$1",
//       [userId]
//     );
//     const user=userResult.rows[0]
    
//     const {guestName, roomTypeId, checkInDate, checkOutDate,email} = req.body;
//     const booking = await BookingUtils.initializeBooking(
//       guestName,
//       roomTypeId,
//       checkInDate,
//       checkOutDate,
//       email
//     );
//     res.json(booking);
//   }catch(err){
//     console.error(err);
//     res.status(500).json({error:err.message});
//   }
// };

// //Confirm Booking
// exports.confirmBooking = async (req,res)=>{
//   try{
//     const {id} = req.params;
//     const booking = await BookingUtils.confirmBooking(id);
//     res.json(booking);
//   }
//   catch(err){
//     console.error(err);
//     res.status(500).json({error:err.message});
//   }
// };


// // Check In
// exports.checkInBooking = async (req,res)=>{
//   try{
//     const {id} = req.params;
//     const booking = await BookingUtils.checkInBooking(id);
//     res.json(booking);
//   }
//   catch(err){
//     console.error(err);
//     res.status(500).json({error:err.message});
//   }
// };


// //Check Out
// exports.checkOutBooking = async (req,res)=>{
//   try{
//     const {id} = req.params;
//     const booking = await BookingUtils.checkOutBooking(id);
//     res.json(booking);
//   }
//   catch(err){
//     console.error(err);
//     res.status(500).json({error:err.message});
//   }
// };


// //Complete Booking
// exports.completeBooking = async (req,res)=>{
//   try{
//     const {id} = req.params;
//     const booking = await BookingUtils.completeBooking(id);
//     res.json(booking);
//   }
//   catch(err){
//     console.error(err);
//     res.status(500).json({error:err.message});
//   }
// };


// //List Bookings
// exports.getBookings = async (req, res) => {
//   try {

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 5;
//     const search = req.query.search || "";

//     const offset = (page - 1) * limit;

//     const searchQuery = `%${search}%`;

//     const result = await pool.query(
//       `SELECT b.*, r.name AS room_type_name
//        FROM booking b
//        LEFT JOIN room_type r ON b.room_type_id = r.id
//        WHERE
//        b.guest_name ILIKE $1
//        OR r.name ILIKE $1
//        OR b.status ILIKE $1
//        OR CAST(b.id AS TEXT) ILIKE $1
//        ORDER BY b.id
//        LIMIT $2 OFFSET $3`,
//       [searchQuery, limit, offset]
//     );

//     const count = await pool.query(
//       `SELECT COUNT(*)
//        FROM booking b
//        LEFT JOIN room_type r ON b.room_type_id = r.id
//        WHERE
//        b.guest_name ILIKE $1
//        OR r.name ILIKE $1
//        OR b.status ILIKE $1
//        OR CAST(b.id AS TEXT) ILIKE $1`,
//       [searchQuery]
//     );

//     const totalPages = Math.ceil(count.rows[0].count / limit);

//     res.json({
//       data: result.rows,
//       totalPages
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

const BookingUtils = require("../utils/bookingUtils");
const pool = require("../db/db");
const redis = require("../db/redisClient");


// Create Booking Initialization
exports.createBooking = async (req,res)=>{
  try{
    //const userId = req.user.id;
      const userId = req.userId

    const userResult = await pool.query(
      "select * from users where id=$1",
      [userId]
    );

    const user = userResult.rows[0];

    const {guestName, roomTypeId, checkInDate, checkOutDate, email} = req.body;

    const booking = await BookingUtils.initializeBooking(
           guestName,
           roomTypeId,
           checkInDate,
           checkOutDate,
           email
       );

    // ✅ Save user_id to booking
    await pool.query(
       "UPDATE booking SET user_id = $1 WHERE id = $2",
       [userId, booking.id]
     );


    // 🔥 Clear cache
    // NEW CODE ✅ (clears BOTH admin and user cache)
    const bookingKeys = await redis.keys("bookings:*")
    const myBookingKeys = await redis.keys(`mybookings:${userId}:*`)

    const allKeys = [...bookingKeys, ...myBookingKeys]
    if (allKeys.length > 0) {
         await redis.del(allKeys)
     }

    console.log("Cache cleared")

    res.json(booking);

  }catch(err){
    console.error(err);
    res.status(500).json({error:err.message});
  }
};


//creating a guest booking

exports.createGuestBooking = async (req, res) => {
  try {

    const { guestName, roomTypeId, checkInDate, checkOutDate, email } = req.body;

    const booking = await BookingUtils.initializeBooking(
      guestName,
      roomTypeId,
      checkInDate,
      checkOutDate,
      email
    );

    // ❗ NO user_id update (guest has no account)

    // 🔥 Clear only general cache (not mybookings)
    const bookingKeys = await redis.keys("bookings:*");

    if (bookingKeys.length > 0) {
      await redis.del(bookingKeys);
    }

    console.log("Guest booking cache cleared");

    res.json(booking);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


//get the guest booking details


exports.getGuestBookings = async (req, res) => {
  try {

    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const result = await pool.query(
      `SELECT b.*, r.name AS room_type_name
       FROM booking b
       LEFT JOIN room_type r ON b.room_type_id = r.id
       WHERE b.email = $1
       ORDER BY b.id DESC`,
      [email]
    );

    res.json({
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// Confirm Booking
exports.confirmBooking = async (req,res)=>{
  try{
    const {id} = req.params;

    const booking = await BookingUtils.confirmBooking(id);

    // 🔥 Clear cache
    // ✅ NEW — clears both admin and user cache
     const keys = await redis.keys("bookings:*")
     const myKeys = await redis.keys("mybookings:*")
     const allKeys = [...keys, ...myKeys]
     if (allKeys.length > 0) {
        await redis.del(allKeys)
      }

    console.log("Cache cleared")

    res.json(booking);

  }catch(err){
    console.error(err);
    res.status(500).json({error:err.message});
  }
};


// Check In
exports.checkInBooking = async (req,res)=>{
  try{
    const {id} = req.params;

    const booking = await BookingUtils.checkInBooking(id);

    // 🔥 Clear cache
      // ✅ NEW — clears both admin and user cache
    const keys = await redis.keys("bookings:*")
    const myKeys = await redis.keys("mybookings:*")
    const allKeys = [...keys, ...myKeys]
     if (allKeys.length > 0) {
       await redis.del(allKeys)
      }

    console.log("Cache cleared")

    res.json(booking);

  }catch(err){
    console.error(err);
    res.status(500).json({error:err.message});
  }
};


// Check Out
exports.checkOutBooking = async (req,res)=>{
  try{
    const {id} = req.params;

    const booking = await BookingUtils.checkOutBooking(id);

     // ✅ NEW — clears both admin and user cache
     const keys = await redis.keys("bookings:*")
     const myKeys = await redis.keys("mybookings:*")
     const allKeys = [...keys, ...myKeys]
     if (allKeys.length > 0) {
      await redis.del(allKeys)
     }

    console.log("Cache cleared")

    res.json(booking);

  }catch(err){
    console.error(err);
    res.status(500).json({error:err.message});
  }
};


// Complete Booking
exports.completeBooking = async (req,res)=>{
  try{
    const {id} = req.params;

    const booking = await BookingUtils.completeBooking(id);

    // 🔥 Clear cache
    // ✅ NEW — clears both admin and user cache
    const keys = await redis.keys("bookings:*")
    const myKeys = await redis.keys("mybookings:*")
    const allKeys = [...keys, ...myKeys]
      if (allKeys.length > 0) {
         await redis.del(allKeys)
        }

    console.log("Cache cleared")

    res.json(booking);

  }catch(err){
    console.error(err);
    res.status(500).json({error:err.message});
  }
};


// List Bookings (GET)
exports.getBookings = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";

    const offset = (page - 1) * limit;

    const cacheKey = `bookings:${page}:${limit}:${search}`

    // 🔹 Check Redis
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Serving from Redis")
      return res.json(JSON.parse(cachedData))
    }

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

    const responseData = {
      data: result.rows,
      totalPages
    };

    // 🔹 Store in Redis
    await redis.set(cacheKey, JSON.stringify(responseData), {
      EX: 60
    });

    console.log("Stored in Redis")

    res.json(responseData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// Get My Bookings (logged-in user only)
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id; // comes from cookie via authMiddleware

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const cacheKey = `mybookings:${userId}:${page}:${limit}`;

    // 🔹 Check Redis
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("Serving my bookings from Redis");
      return res.json(JSON.parse(cachedData));
    }

    const result = await pool.query(
      `SELECT b.*, r.name AS room_type_name
       FROM booking b
       LEFT JOIN room_type r ON b.room_type_id = r.id
       WHERE b.user_id = $1
       ORDER BY b.id DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const count = await pool.query(
      `SELECT COUNT(*) FROM booking WHERE user_id = $1`,
      [userId]
    );

    const totalPages = Math.ceil(count.rows[0].count / limit);

    const responseData = {
      data: result.rows,
      totalPages
    };

    // 🔹 Store in Redis
    await redis.set(cacheKey, JSON.stringify(responseData), { EX: 60 });

    console.log("Stored my bookings in Redis");

    res.json(responseData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
