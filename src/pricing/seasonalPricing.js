class SeasonalPricing {
  calculatePrice(basePrice, date) {
    const month = date.getMonth() + 1;

    if (month === 12 || month === 1) {
      return basePrice * 2;
    }

    if (month >= 6 && month <= 8) {
      return basePrice * 1.3;
    }

    return basePrice;
  }
}

module.exports = SeasonalPricing;