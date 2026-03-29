const pool = require("../db/db");
const PricingStrategyFactory = require("../pricing/pricingStrategy");
const sendEmail = require("./email");
const wait = (ms) => new Promise(res => setTimeout(res, ms));

async function sendEmailWithRetry(email, code, type) {
  let delay = 2000; // 2 sec

  for (let i = 0; i < 3; i++) {
    try {
      await sendEmail(email, code, type);
      return true; // success → exit
    } catch (err) {
      console.log(`Attempt ${i + 1} failed`);

      if (i === 2) {
        console.log("All attempts failed ❌");
        return false;
      }

      console.log(`Retrying in ${delay / 1000} seconds...`);
      await wait(delay);

      delay *= 2; // 2 → 4 → 8
    }
  }
}


const generateBookingCode = (id) => {
  const year = new Date().getFullYear();
  return `BK-${year}-${String(id).padStart(5, '0')}`;
};

class BookingUtils {

  //intializing booking
  static async initializeBooking(guestName, roomTypeValue, checkInDate, checkOutDate,email) {

    function parseDate(dateStr) {
      if (dateStr.includes("-")) return new Date(dateStr);

      if (dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/");
        return new Date(`${year}-${month}-${day}`);
      }

      throw new Error("Invalid date format");
    }

    const checkIn = parseDate(checkInDate);
    const checkOut = parseDate(checkOutDate);

    if (checkIn >= checkOut) {
      throw new Error("Invalid date range");
    }

    //with room type id and name
    let roomTypeId;

    if (isNaN(roomTypeValue)) {
      const typeResult = await pool.query(
        "SELECT id FROM room_type WHERE name = $1",
        [roomTypeValue]
      );

      if (typeResult.rows.length === 0) {
        throw new Error("Invalid room type");
      }

      roomTypeId = typeResult.rows[0].id;

    } else {
      roomTypeId = roomTypeValue;
    }

    //fixed and find available rooms without double booking options
    const roomResult = await pool.query(
      `
        SELECT r.*
        FROM room r
        WHERE r.room_type_id = $1
        AND r.id NOT IN (
        SELECT b.room_id
        FROM booking b
        WHERE b.status IN ('INITIALIZED','CONFIRMED','CHECKED_IN','CHECKED_OUT')
        AND NOT (
         b.check_out_date <= $2
         OR b.check_in_date >= $3
         )
         )
       LIMIT 1
      `,
      [roomTypeId, checkIn, checkOut]
    );

    if (roomResult.rows.length === 0) {
      throw new Error("No rooms available for selected dates");
    }

    const roomId = roomResult.rows[0].id;

    //get the price from room type table
    const roomTypeResult = await pool.query(
      "SELECT price FROM room_type WHERE id=$1",
      [roomTypeId]
    );

    const basePrice = parseFloat(roomTypeResult.rows[0].price);

    //calculate the price for each day
    let currentDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    let totalCost = 0;

    while (currentDate < endDate) {

      const day = currentDate.getDay();
      const month = currentDate.getMonth() + 1;

      let strategy = "STANDARD";

      if (day === 5 || day === 6) strategy = "WEEKEND";

      if (month === 12 || month === 1 || (month >= 6 && month <= 8)) {
        strategy = "SEASONAL";
      }

      const strategyObj = PricingStrategyFactory.getStrategy(strategy);
      totalCost += strategyObj.calculatePrice(basePrice,currentDate);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    //After calculating the price we are going to insert booking(create a booking)
      let bookingCode = "TEMP-" + Date.now();

      const result = await pool.query(
        `INSERT INTO booking 
         (guest_name, room_type_id, room_id, check_in_date, check_out_date, total_cost, status, booking_code,email)
         VALUES ($1,$2,$3,$4,$5,$6,'INITIALIZED',$7,$8)
         RETURNING *`,
         [guestName, roomTypeId, roomId, checkIn, checkOut, totalCost, bookingCode,email]
        );

      const bookingId = Number(result.rows[0].id);
      bookingCode = generateBookingCode(bookingId);
      const updateResult=await pool.query(
        "UPDATE booking SET booking_code = $1 WHERE id = $2 returning *",
        [bookingCode, bookingId]
        );
      const finalResult = await pool.query(
        "SELECT * FROM booking WHERE id = $1",
        [bookingId]
        );

     const bookingData=finalResult.rows[0];
     return bookingData;
  }


  //confirm booking
  static async confirmBooking(id) {

    const result = await pool.query(
      "SELECT * FROM booking WHERE id=$1",
      [id]
    );

    const booking = result.rows[0];

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "INITIALIZED") {
      throw new Error("Booking must be INITIALIZED to confirm");
    }

    const update = await pool.query(
      "UPDATE booking SET status='CONFIRMED' WHERE id=$1 RETURNING *",
      [id]
    );

    const bookingData = update.rows[0];
    let emailStatus = null;
    if (bookingData.email) {
        const isEmailSent= await sendEmailWithRetry(
        bookingData.email,
        bookingData.booking_code,
        "CONFIRM"
      );
      emailStatus = isEmailSent ? "SUCCESS" : "FAILED";
     }
      return {
        booking:bookingData,
        emailStatus
      }
  }


  //checkin
  static async checkInBooking(id) {

    const result = await pool.query(
      "SELECT * FROM booking WHERE id=$1",
      [id]
    );

    const booking = result.rows[0];

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "CONFIRMED") {
      throw new Error("Booking must be CONFIRMED to check in");
    }

    const update = await pool.query(
      "UPDATE booking SET status='CHECKED_IN' WHERE id=$1 RETURNING *",
      [id]
    );

    return update.rows[0];
  }


  //checkout
  static async checkOutBooking(id) {

    const result = await pool.query(
      "SELECT * FROM booking WHERE id=$1",
      [id]
    );

    const booking = result.rows[0];

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "CHECKED_IN") {
      throw new Error("Booking must be CHECKED_IN to check out");
    }

    const update = await pool.query(
      "UPDATE booking SET status='CHECKED_OUT' WHERE id=$1 RETURNING *",
      [id]
    );

    return update.rows[0];
  }


  //complete the booking
  static async completeBooking(id) {

    const result = await pool.query(
      "SELECT * FROM booking WHERE id=$1",
      [id]
    );

    const booking = result.rows[0];

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "CHECKED_OUT") {
      throw new Error("Booking must be CHECKED_OUT to complete");
    }

    const update = await pool.query(
        "UPDATE booking SET status='COMPLETED' WHERE id=$1 RETURNING *",
        [id]
       );
    const bookingData = update.rows[0];

// send thank you email
       let emailStatus = null;
      if (bookingData.email) {
          const isEmailSent=  await sendEmailWithRetry(
               bookingData.email,
               bookingData.booking_code,
              "COMPLETE"
        );
        emailStatus=isEmailSent ? "SUCCESS" : "FAILED";
     }
    return {
    booking:bookingData,
    emailStatus
    }
  }
}
module.exports = BookingUtils;