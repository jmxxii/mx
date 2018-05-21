var bobHeight = 72;
var bobAge = 26;

var bartAge = 26;
var bartHeight = 72;

var billHeight = 72;
var billAge = 26;

var bobTotal = bobHeight + bobAge * 5;
var billTotal = billHeight + billAge * 5;
var bartTotal = bartHeight + bartAge * 5;


console.log(bartTotal, `Bart's total`)
console.log(billTotal, `Bill's total`)
console.log(bobTotal, `Bob's total`)

if (bobTotal > billTotal && bobTotal > bartTotal){
  console.log(`Bob Wins!`)
} else if (bobTotal < billTotal && bartTotal < billTotal){
  console.log(`Bill Wins!`)
} else if (bartTotal > billTotal && bartTotal > bobTotal){
  console.log(`Bart Wins!`)
} else {
  console.log(`Tied Game!`)
}