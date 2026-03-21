const pool = require("../db/db")

//get route
exports.getHotels = async (req,res)=>{
  try{
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5
    const search = req.query.search || ""
    const offset = (page - 1) * limit
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
    res.json({
      data: result.rows,
      totalPages: totalPages
    })
  }
  catch(err){
    console.error(err)
    res.status(500).send("server error")
  }
}

//post route
exports.createHotel = async (req,res)=>{
  try{
    const {name,location} = req.body
    const result = await pool.query(
      "insert into hotel(name,location) values($1,$2) returning *",
      [name,location]
    )
    res.json(result.rows[0])
  }
  catch(err){
    console.error(err)
    res.status(500).send("server error")
  }
}

//update
exports.updateHotel = async (req,res)=>{
  try{
    const {id} = req.params
    const {name,location} = req.body
    const result = await pool.query(
      "update hotel set name=$1,location=$2 where id=$3 returning *",
      [name,location,id]
    )
    res.json(result.rows[0])
  }
  catch(err){
    console.error(err)
    res.status(500).send("server error")
  }
}

//delete
exports.deleteHotel = async (req,res)=>{
  try{
    const {id} = req.params
    const result = await pool.query(
      "delete from hotel where id=$1 returning *",
      [id]
    )
    res.json(result.rows[0])
  }
  catch(err){
    console.error(err)
    res.status(500).send("server error")
  }
}