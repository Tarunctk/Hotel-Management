// const pool = require("../db/db")

// // GET ROOM TYPES
// exports.getRoomTypes = async (req,res)=>{
//   try{

//     const page = parseInt(req.query.page) || 1
//     const limit = parseInt(req.query.limit) || 5
//     const search = req.query.search || ""

//     const offset = (page - 1) * limit

//     const result = await pool.query(
//   `select 
//     id,
//     name,
//     price as "basePrice",
//     max_occupancy as "maxOccupancy",
//     pricing_strategy as "pricingStrategy"
//    from room_type
//    where name ILIKE $1
//    ORDER BY id ASC 
//    limit $2 offset $3`,
//   [`%${search}%`, limit, offset]
// )

//     const countResult = await pool.query(
//       "select count(*) from room_type where name ILIKE $1",
//       [`%${search}%`]
//     )

//     const totalRoomTypes = parseInt(countResult.rows[0].count)

//     const totalPages = Math.ceil(totalRoomTypes / limit)

//     res.json({
//       data: result.rows,
//       totalPages
//     })

//   }
//   catch(err){
//     console.error(err)
//     res.status(500).send("server error")
//   }
// }


// // CREATE ROOM TYPE
// exports.createRoomType = async (req,res)=>{
//   try{

//     const {name,basePrice,maxOccupancy,pricingStrategy} = req.body

//     const result = await pool.query(
//       `insert into room_type
//       (name,price,max_occupancy,pricing_strategy)
//       values($1,$2,$3,$4)
//       returning *`,
//       [name,basePrice,maxOccupancy,pricingStrategy]
//     )

//     res.json(result.rows[0])

//   }
//   catch(err){
//     console.error(err)
//     res.status(500).send("server error")
//   }
// }


// // UPDATE ROOM TYPE
// exports.updateRoomType = async (req,res)=>{
//   try{

//     const {id} = req.params
//     const {name,basePrice,maxOccupancy,pricingStrategy} = req.body

//     const result = await pool.query(
//       `update room_type
//        set name=$1,
//            price=$2,
//            max_occupancy=$3,
//            pricing_strategy=$4
//        where id=$5
//        returning *`,
//       [name,basePrice,maxOccupancy,pricingStrategy,id]
//     )

//     res.json(result.rows[0])

//   }
//   catch(err){
//     console.error(err)
//     res.status(500).send("server error")
//   }
// }


// // DELETE ROOM TYPE
// exports.deleteRoomType = async (req,res)=>{
//   try{

//     const {id} = req.params

//     const result = await pool.query(
//       "delete from room_type where id=$1 returning *",
//       [id]
//     )

//     res.json(result.rows[0])

//   }
//   catch(err){
//     console.error(err)
//     res.status(500).send("server error")
//   }
// }

const pool = require("../db/db")
const redis = require("../db/redisClient")

// GET ROOM TYPES
exports.getRoomTypes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5
    const search = req.query.search || ""

    const offset = (page - 1) * limit

    const cacheKey = `roomtypes:${page}:${limit}:${search}`

    // 🔹 Check Redis
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Serving from Redis")
      return res.json(JSON.parse(cachedData))
    }

    // 🔹 DB Query
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

    const responseData = {
      data: result.rows,
      totalPages
    }

    // 🔹 Store in Redis (with TTL)
    await redis.set(cacheKey, JSON.stringify(responseData), {
      EX: 60
    })

    console.log("Stored in Redis")

    res.json(responseData)

  } catch (err) {
    console.error(err)
    res.status(500).send("server error")
  }
}


// CREATE ROOM TYPE
exports.createRoomType = async (req, res) => {
  try {
    const { name, basePrice, maxOccupancy, pricingStrategy } = req.body

    const result = await pool.query(
      `insert into room_type
      (name,price,max_occupancy,pricing_strategy)
      values($1,$2,$3,$4)
      returning *`,
      [name, basePrice, maxOccupancy, pricingStrategy]
    )

    // 🔥 Clear cache
    const keys = await redis.keys("roomtypes:*")
    if (keys.length > 0) {
      await redis.del(keys)
    }

    console.log("Cache cleared")

    res.json(result.rows[0])

  } catch (err) {
    console.error(err)
    res.status(500).send("server error")
  }
}


// UPDATE ROOM TYPE
exports.updateRoomType = async (req, res) => {
  try {
    const { id } = req.params
    const { name, basePrice, maxOccupancy, pricingStrategy } = req.body

    const result = await pool.query(
      `update room_type
       set name=$1,
           price=$2,
           max_occupancy=$3,
           pricing_strategy=$4
       where id=$5
       returning *`,
      [name, basePrice, maxOccupancy, pricingStrategy, id]
    )

    // 🔥 Clear cache
    const keys = await redis.keys("roomtypes:*")
    if (keys.length > 0) {
      await redis.del(keys)
    }

    console.log("Cache cleared")

    res.json(result.rows[0])

  } catch (err) {
    console.error(err)
    res.status(500).send("server error")
  }
}


// DELETE ROOM TYPE
exports.deleteRoomType = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      "delete from room_type where id=$1 returning *",
      [id]
    )

    // 🔥 Clear cache
    const keys = await redis.keys("roomtypes:*")
    if (keys.length > 0) {
      await redis.del(keys)
    }

    console.log("Cache cleared")

    res.json(result.rows[0])

  } catch (err) {
    console.error(err)
    res.status(500).send("server error")
  }
}