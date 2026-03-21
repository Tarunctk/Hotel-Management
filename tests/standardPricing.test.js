const standardPricing = require("../src/pricing/standardPricing")

describe("Standard Pricing Strategy", () => {

  it("calculate price for 1 night", () => {
    const pricing = new standardPricing()
    const result = pricing.calculatePrice(1000,"2026-12-20","2026-12-21")
    expect(result).toBe(1000)
  })

  it("calculate price for 3 nights", () => {
    const pricing = new standardPricing()
    const result = pricing.calculatePrice(1000,"2026-12-20","2026-12-23")
    expect(result).toBe(3000)
  })

  it("calculate price for 5 nights", () => {
    const pricing = new standardPricing()
    const result = pricing.calculatePrice(500,"2026-12-20","2026-12-25")
    expect(result).toBe(2500)
  })

})