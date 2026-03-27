require("dotenv").config({ path: "../.env" });
const express = require('express')
const pool = require("./db/db")
const cors = require('cors')
const cookieParser = require("cookie-parser");
const hotelRoutes=require('./routes/hotelRoute')
const roomRoutes=require('./routes/roomRoute')
const roomTypeRoutes=require('./routes/roomTypeRoute')
const pricingRoute = require('./routes/pricingRoute')
const bookingRoutes = require('./routes/bookingRoute')
const authRoutes = require("./routes/authRoutes");


const validationMiddleware = require('./middlewares/validationMiddleware')
const app = express()
app.use(express.json())
app.use(cors({
  origin:"https://hotel-management-three-hazel.vercel.app",
  credentials: true
}));
app.use(validationMiddleware)
app.use(cookieParser())


app.use("/",hotelRoutes)
app.use("/",roomRoutes)
app.use("/",roomTypeRoutes)
app.use("/", pricingRoute)
app.use("/booking", bookingRoutes);
app.use("/auth", authRoutes);

const port = 3000
app.listen(port, ()=>{
  console.log(`app running at ${port}`)
})
