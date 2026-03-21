const pool = require("../db/db")

// GET ROOM TYPES
exports.getRoomTypes = async (req,res)=>{
  try{

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5
    const search = req.query.search || ""

    const offset = (page - 1) * limit

    const result = await pool.query(
  `select 
    id,
    name,
    price as "basePrice",
    max_occupancy as "maxOccupancy",
    pricing_strategy as "pricingStrategy"
   from room_type
   where name ILIKE $1
   ORDER BY id ASC 
   limit $2 offset $3`,
  [`%${search}%`, limit, offset]
)

    const countResult = await pool.query(
      "select count(*) from room_type where name ILIKE $1",
      [`%${search}%`]
    )

    const totalRoomTypes = parseInt(countResult.rows[0].count)

    const totalPages = Math.ceil(totalRoomTypes / limit)

    res.json({
      data: result.rows,
      totalPages
    })

  }
  catch(err){
    console.error(err)
    res.status(500).send("server error")
  }
}


// CREATE ROOM TYPE
exports.createRoomType = async (req,res)=>{
  try{

    const {name,basePrice,maxOccupancy,pricingStrategy} = req.body

    const result = await pool.query(
      `insert into room_type
      (name,price,max_occupancy,pricing_strategy)
      values($1,$2,$3,$4)
      returning *`,
      [name,basePrice,maxOccupancy,pricingStrategy]
    )

    res.json(result.rows[0])

  }
  catch(err){
    console.error(err)
    res.status(500).send("server error")
  }
}


// UPDATE ROOM TYPE
exports.updateRoomType = async (req,res)=>{
  try{

    const {id} = req.params
    const {name,basePrice,maxOccupancy,pricingStrategy} = req.body

    const result = await pool.query(
      `update room_type
       set name=$1,
           price=$2,
           max_occupancy=$3,
           pricing_strategy=$4
       where id=$5
       returning *`,
      [name,basePrice,maxOccupancy,pricingStrategy,id]
    )

    res.json(result.rows[0])

  }
  catch(err){
    console.error(err)
    res.status(500).send("server error")
  }
}


// DELETE ROOM TYPE
exports.deleteRoomType = async (req,res)=>{
  try{

    const {id} = req.params

    const result = await pool.query(
      "delete from room_type where id=$1 returning *",
      [id]
    )

    res.json(result.rows[0])

  }
  catch(err){
    console.error(err)
    res.status(500).send("server error")
  }
}