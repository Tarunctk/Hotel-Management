const pool = require("../db/db")
const PricingStrategyFactory = require("../pricing/pricingStrategy")

exports.calculatePrice = async (req, res) => {
  try {
    const { roomTypeId, checkInDate, checkOutDate } = req.body

    const result = await pool.query(
      "select price, pricing_strategy from room_type where id=$1",
      [roomTypeId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Room type not found" })
    }

    const basePrice = parseFloat(result.rows[0].price)

    //optional now, not used for filtering
    const strategies = result.rows[0].pricing_strategy

    const precedence = {
      STANDARD: 1,
      WEEKEND: 2,
      SEASONAL: 3
    }

    let totalPrice = 0

    let currentDate = new Date(checkInDate)
    const endDate = new Date(checkOutDate)

    while (currentDate < endDate) {

      let applicableStrategies = []

      //Always include 
      applicableStrategies.push("STANDARD")

      const day = currentDate.getDay()
      const month = currentDate.getMonth() + 1

      //weekend
      if (day === 6 || day === 7) {
        applicableStrategies.push("WEEKEND")
      }

      //seasonal
      if (
        (month === 12 || month === 1) ||
        (month >= 6 && month <= 8)
      ) {
        applicableStrategies.push("SEASONAL")
      }

      // choose highest precedence
      let selectedStrategy = "STANDARD"

      applicableStrategies.forEach((s) => {
        if (precedence[s] > precedence[selectedStrategy]) {
          selectedStrategy = s
        }
      })

      const strategyObj = PricingStrategyFactory.getStrategy(selectedStrategy)

      let dayPrice

      if (selectedStrategy === "SEASONAL") {
        dayPrice = strategyObj.calculatePrice(basePrice, currentDate)
      } else {
        dayPrice = strategyObj.calculatePrice(basePrice)
      }

      totalPrice += dayPrice

      currentDate.setDate(currentDate.getDate() + 1)
    }

    res.json({
      roomTypeId,
      totalPrice
    })

  } catch (err) {
    console.error(err)
    res.status(500).send("server error")
  }
}