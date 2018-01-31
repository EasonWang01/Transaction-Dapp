const SHA3 = require('keccakjs')


function getContract_Address(address, num) {
  let index;
  if(num === 0) {
    index = 80;
  } else if (num < 10) {
    index = `0${num}`;
  }
   
  let h = new SHA3(256).update(Buffer.from("d6" + "94" + address + index, 'hex')).digest('hex'); // 02  06 07 08
  let contractAddress = h.slice(-40) // 取後面四十個字
  console.log('-------------------------------------')
  console.log('Contract Address: ')
  console.log(`0x${contractAddress}`)
}

getContract_Address("d7c86c344ecbd9f166b053a32cd6cd34dda1b8af", 0)
getContract_Address("d7c86c344ecbd9f166b053a32cd6cd34dda1b8af", 1)
getContract_Address("d7c86c344ecbd9f166b053a32cd6cd34dda1b8af", 2)
