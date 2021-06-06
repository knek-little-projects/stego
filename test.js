function throwToHTML(e) {
  document.body.style.background = 'red'
  document.body.style.color = 'white'
  document.body.innerText = e
  throw e
}

try {

(() => {
  // test fillRandom

  const A_LEN = 7
  const MAX_RANDOM_BYTES = 3

  const a = new Uint8Array(A_LEN)

  let GEN = 0
  function gen(a) {
    for (let i = 0; i < a.byteLength; i++) {
      a[i] = GEN++
    }
  }

  fillRandom(a, MAX_RANDOM_BYTES, gen)
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== i) {
      throwToHTML(new Error(`fillRandom test failed. Expected: 0123456. Got ${a}`))
    }
  }

  console.debug(`fillRandom test passed!`)
})();

(() => {
  // test fillRandom simple call
  
  const a = getRandomValues(5)

  if (a.byteLength !== 5) {
    throw Error()
  }
  
  if (a.toString() === "0,0,0,0,0") {
    throwToHTML(new Error("fillRandom simple call test failed"))
  }

  console.debug("fillRandom simple call test passed!")
})();

} catch (e) {
  throwToHTML(e)
}