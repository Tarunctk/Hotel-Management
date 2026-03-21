const StrategyEnum = require("../utils/strategyEnum")
const StandardPricing = require('./standardPricing')
const SeasonalPricing = require('./seasonalPricing')
const WeekendPricing = require('./weekendPricing')

class PricingStrategyFactory {

  static getStrategy(strategy){

    if(!strategy){
      return new StandardPricing()
    }
    strategy = strategy?.toUpperCase()

    if(strategy === StrategyEnum.STANDARD){
      return new StandardPricing()
    }

    if(strategy === StrategyEnum.WEEKEND){
      return new WeekendPricing()
    }

    if(strategy === StrategyEnum.SEASONAL){
      return new SeasonalPricing()
    }

    return new StandardPricing()
  }
}

module.exports = PricingStrategyFactory