const {add,subtract}=require('./math')

test('add  1+2 equal to 3',()=>{
    expect(add(1,2)).toBe(3)
})

test('subtract 5 - 2 equal to 3',()=>{
    expect(subtract(5,2)).toBe(3)
})