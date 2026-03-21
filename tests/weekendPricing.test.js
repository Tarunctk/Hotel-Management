const weekendPricing = require("../src/pricing/weekendPricing")

describe("Weekend Pricing Strategy", () => {

  it("weekday price should remain same", () => {
    const pricing = new weekendPricing()
    const result = pricing.calculatePrice(1000,"2026-12-21","2026-12-22")
    expect(result).toBe(1000)
  })

  it("friday price should increase", () => {
    const pricing = new weekendPricing()
    const result = pricing.calculatePrice(1000,"2026-12-25","2026-12-26")
    expect(result).toBe(1500)
  })

  it("saturday price should increase", () => {
    const pricing = new weekendPricing()
    const result = pricing.calculatePrice(1000,"2026-12-26","2026-12-27")
    expect(result).toBe(1500)
  })

})