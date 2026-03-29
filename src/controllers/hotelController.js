// const pool = require("../db/db")
// const redis = require("../db/redisClient");

// //get route
// exports.getHotels = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1
//     const limit = parseInt(req.query.limit) || 5
//     const search = req.query.search || ""
//     const offset = (page - 1) * limit

//     const cacheKey = `hotels:${page}:${limit}:${search}`

//     // 🔍 Check Redis first
//     const cachedData = await redis.get(cacheKey)

//     if (cachedData) {
//       console.log("Serving from Redis")
//       return res.json(JSON.parse(cachedData))
//     }

//     // 🗄️ Fetch from DB
//     const result = await pool.query(
//       "select * from hotel where name ILIKE $1 or location ILIKE $1 order by createdat asc limit $2 offset $3",
//       [`%${search}%`, limit, offset]
//     )

//     const countResult = await pool.query(
//       "select count(*) from hotel where name ILIKE $1 or location ILIKE $1",
//       [`%${search}%`]
//     )

//     const totalHotels = parseInt(countResult.rows[0].count)
//     const totalPages = Math.ceil(totalHotels / limit)

//     const responseData = {
//       data: result.rows,
//       totalPages: totalPages
//     }

//     // 💾 Store in Redis (with expiry)
//     await redis.set(cacheKey, JSON.stringify(responseData), {
//       EX: 60 // cache for 60 seconds
//     })

//     console.log("Stored in Redis")

//     // 📤 Send response
//     res.json(responseData)

//   } catch (err) {
//     console.error(err)
//     res.status(500).send("server error")
//   }
// }

// //post route
// exports.createHotel = async (req,res)=>{
//   try{
//     const {name,location} = req.body
//     const result = await pool.query(
//       "insert into hotel(name,location) values($1,$2) returning *",
//       [name,location]
//     )
//     res.json(result.rows[0])
//   }
//   catch(err){
//     console.error(err)
//     res.status(500).send("server error")
//   }
// }

// //update
// exports.updateHotel = async (req,res)=>{
//   try{
//     const {id} = req.params
//     const {name,location} = req.body
//     const result = await pool.query(
//       "update hotel set name=$1,location=$2 where id=$3 returning *",
//       [name,location,id]
//     )
//     res.json(result.rows[0])
//   }
//   catch(err){
//     console.error(err)
//     res.status(500).send("server error")
//   }
// }

// //delete
// exports.deleteHotel = async (req,res)=>{
//   try{
//     const {id} = req.params
//     const result = await pool.query(
//       "delete from hotel where id=$1 returning *",
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

// GET route
exports.getHotels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5
    const search = req.query.search || ""
    const offset = (page - 1) * limit

    const cacheKey = `hotels:${page}:${limit}:${search}`

    // 🔹 Check Redis first
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      console.log("Serving from Redis")
      return res.json(JSON.parse(cachedData))
    }

    // 🔹 Fetch from DB
    const result = await pool.query(
      "select * from hotel where name ILIKE $1 or location ILIKE $1 order by createdat asc limit $2 offset $3",
      [`%${search}%`, limit, offset]
    )

    const countResult = await pool.query(
      "select count(*) from hotel where name ILIKE $1 or location ILIKE $1",
      [`%${search}%`]
    )

    const totalHotels = parseInt(countResult.rows[0].count)
    const totalPages = Math.ceil(totalHotels / limit)

    const responseData = {
      data: result.rows,
      totalPages: totalPages
    }

    // 🔹 Store in Redis
    await redis.set(cacheKey, JSON.stringify(responseData),{
      EX: 60
    })
    console.log("Stored in Redis")
    res.json(responseData)

  } catch (err) {
    console.error(err)
    res.status(500).send("server error")
  }
}


// POST route
exports.createHotel = async (req, res) => {
  try {
    const { name, location } = req.body

    const result = await pool.query(
      "insert into hotel(name,location) values($1,$2) returning *",
      [name, location]
    )

    // 🔥 Clear cache after data change
    const keys = await redis.keys("hotels:*")

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


// UPDATE route
exports.updateHotel = async (req, res) => {
  try {
    const { id } = req.params
    const { name, location } = req.body

    const result = await pool.query(
      "update hotel set name=$1,location=$2 where id=$3 returning *",
      [name, location, id]
    )

    // 🔥 Clear cache
     const keys = await redis.keys("hotels:*")

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


// DELETE route
exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      "delete from hotel where id=$1 returning *",
      [id]
    )

    // 🔥 Clear cache
    const keys = await redis.keys("hotels:*")
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