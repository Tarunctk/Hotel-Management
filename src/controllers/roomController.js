const pool = require("../db/db")

// GET ROOMS
exports.getRooms = async (req,res)=>{
  try{
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5
    const search = req.query.search || ""
    const offset = (page - 1) * limit

    const result = await pool.query(
      `SELECT id, roomnumber AS "roomNumber", floor, hotel_id AS "hotelId", room_type_id AS "roomTypeId"
       FROM room
       WHERE roomnumber::text ILIKE $1
       ORDER BY id ASC
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    )

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM room WHERE roomnumber::text ILIKE $1`,
      [`%${search}%`]
    )

    const totalRooms = parseInt(countResult.rows[0].count)
    const totalPages = Math.ceil(totalRooms / limit)

    res.json({
      data: result.rows,
      totalPages
    })

  } catch(err){
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
}


// CREATE ROOM
exports.createRoom = async (req,res)=>{
  try{
    const {roomNumber,floor,hotelId,roomTypeId} = req.body

    // ✅ INPUT VALIDATION
    if(!roomNumber || !floor || !hotelId || !roomTypeId){
      return res.status(400).json({ error: "All fields are required" })
    }

    const result = await pool.query(
      `INSERT INTO room(roomnumber,floor,hotel_id,room_type_id)
       VALUES($1,$2,$3,$4)
       RETURNING *`,
      [roomNumber,floor,hotelId,roomTypeId]
    )

    res.status(201).json(result.rows[0])

  } catch(err){
    console.error(err)

    // 🔥 HANDLE DUPLICATE ERROR
    if(err.code === '23505'){
      return res.status(400).json({
        error: "Room already exists for this hotel"
      })
    }

    res.status(500).json({ error: "Server error" })
  }
}


// UPDATE ROOM
exports.updateRoom = async (req,res)=>{
  try{
    const {id} = req.params
    const {roomNumber,floor,hotelId,roomTypeId} = req.body

    if(!roomNumber || !floor || !hotelId || !roomTypeId){
      return res.status(400).json({ error: "All fields are required" })
    }

    const result = await pool.query(
      `UPDATE room
       SET roomnumber=$1, floor=$2, hotel_id=$3, room_type_id=$4
       WHERE id=$5
       RETURNING *`,
      [roomNumber,floor,hotelId,roomTypeId,id]
    )

    if(result.rows.length === 0){
      return res.status(404).json({ error: "Room not found" })
    }

    res.json(result.rows[0])

  } catch(err){
    console.error(err)

    if(err.code === '23505'){
      return res.status(400).json({
        error: "Room already exists for this hotel"
      })
    }

    res.status(500).json({ error: "Server error" })
  }
}


// DELETE ROOM
exports.deleteRoom = async (req,res)=>{
  try{
    const {id} = req.params

    const result = await pool.query(
      `DELETE FROM room WHERE id=$1 RETURNING *`,
      [id]
    )

    if(result.rows.length === 0){
      return res.status(404).json({ error: "Room not found" })
    }

    res.json(result.rows[0])

  } catch(err){
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
}