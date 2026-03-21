const seasonalPricing = require("../src/pricing/seasonalPricing")

describe("Seasonal Pricing Strategy", () => {
  it("december should double price", () => {
    const pricing = new seasonalPricing()
    const result = pricing.calculatePrice(1000,"2026-12-20","2026-12-22")
    expect(result).toBe(4000)
  })

  it("june should apply 1.3 multiplier", () => {
    const pricing = new seasonalPricing()
    const result = pricing.calculatePrice(1000,"2026-06-10","2026-06-12")
    expect(result).toBe(2600)
  })

  it("normal month should have normal price", () => {
    const pricing = new seasonalPricing()
    const result = pricing.calculatePrice(1000,"2026-03-10","2026-03-12")
    expect(result).toBe(2000)
  })

})