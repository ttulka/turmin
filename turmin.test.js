const turmin = require('./turmin')

test('error: invalid syntax', () => {
  expect(() => turmin('x')).toThrow('Syntax error: invalid code')
  expect(() => turmin('s')).toThrow('Syntax error: invalid code')
  expect(() => turmin('ds')).toThrow('Syntax error: invalid code')
  expect(() => turmin('ls')).toThrow('Syntax error: invalid code')
  expect(() => turmin('rs')).toThrow('Syntax error: invalid code')
  expect(() => turmin('rs')).toThrow('Syntax error: invalid code')
  expect(() => turmin('j')).toThrow('Syntax error: invalid code')
  expect(() => turmin('js')).toThrow('Syntax error: invalid code')
  expect(() => turmin('jx01')).toThrow('Syntax error: invalid code')
  expect(() => turmin('jxs')).toThrow('Syntax error: invalid code')
  expect(() => turmin('jxl')).toThrow('Syntax error: invalid code')
  expect(() => turmin('jxr')).toThrow('Syntax error: invalid code')
})

test('comments', () => {
  expect(turmin('/')).toEqual('')
  expect(turmin('/\\')).toEqual('')
  expect(turmin('/ sx')).toEqual('')
  expect(turmin('/ sx \\')).toEqual('')
  expect(turmin('sx / sy \\')).toEqual('x')
  expect(turmin('sx / sy \\ r sz')).toEqual('xz')
})

test('set/right/left', () => {
  expect(turmin('ss')).toEqual('s')
  expect(turmin('ssss')).toEqual('s')
  expect(turmin('sxss')).toEqual('s')
  expect(turmin('sssx')).toEqual('x')
  expect(turmin('ssrsx')).toEqual('sx')
  expect(turmin('s ', '123')).toEqual('23')
  expect(turmin('s rs ', '123')).toEqual('3')
  expect(turmin('ssrsxlsy')).toEqual('yx')
  expect(turmin('   ss r  sx   l    sy  ')).toEqual('yx')
  expect(turmin(`
       ss r  sx   l 

       sy  
  `)).toEqual('yx')
})

test('jump', () => {
  expect(turmin('j 2 sy')).toEqual('')
  expect(turmin('sx jx3 sy')).toEqual('x')
  expect(turmin('sx jy3 sy')).toEqual('y')
  expect(turmin('jx2 sx', 'y')).toEqual('x')
  expect(turmin('jx2 sx', 'x')).toEqual('x')
  expect(turmin('jy4 sy r jx0', 'xxx')).toEqual('yyy')
})

test('debug', () => {
  let mem = [], head = [], step = []
  const onDebug = (m, h, s) => {
    mem.push(m)
    head.push(h)
    step.push(s)
  }
  turmin('sA r sB d l sX d', null, null, onDebug)
  expect(mem).toStrictEqual([['A', 'B'], ['X', 'B']])
  expect(head).toStrictEqual([1, 0])
  expect(step).toStrictEqual([4, 7])
})

test('output tape', () => {
  expect(turmin('sxrsy')).toEqual('xy')
  expect(turmin('sxrrsy')).toEqual('x y')
  expect(turmin('sxrrrsy')).toEqual('x  y')
  expect(turmin('sxlsy')).toEqual('yx')
  expect(turmin('sxllsy')).toEqual('y x')
  expect(turmin('sxlllsy')).toEqual('y  x')
})

test('empty program', () => {
  expect(turmin('')).toEqual('')
})

test('infinite loop', () => {
    expect(() => turmin('j 0 ', null, 100)).toThrow('Maximal steps exceeded')
    expect(() => turmin('sxjx0 ', null, 100)).toThrow('Maximal steps exceeded')
    expect(() => turmin('sxjx1 ', null, 100)).toThrow('Maximal steps exceeded')
})

test('addition', () => {
  const add = `
    j 3 r j|0   / move to the next number
    s|          / replace a space with a tally mark
    r j|4       / to the end of the second number
    l s         / erase the last tally mark
  `
  expect(turmin(add, '| |')).toEqual('||')
  expect(turmin(add, '|| |')).toEqual('|||')
  expect(turmin(add, '|| |||')).toEqual('|||||')
  expect(turmin(add, '||| |||||')).toEqual('||||||||')
})

test('palindrome', () => { // prints 1 if a palindrome is on tape
  const pal = `
    j 27
    l jx1 jy1         / to begininng
    r jx7 jy17        / check the rightmost symbol
    
    / check x
    s
    r jx8jy8          //8
    l jy29 s l jx0jy0 //11

    / check y
    s
    r jx18jy18        //18
    l jx29 s l jx0jy0 //21

    / accept (print 1)
    s1 j130           //27

    / erase tape
    s l jx29jy29      //29
  `
  expect(turmin(pal, 'x')).toEqual('1')
  expect(turmin(pal, 'y')).toEqual('1')
  expect(turmin(pal, 'xx')).toEqual('1')
  expect(turmin(pal, 'yy')).toEqual('1')
  expect(turmin(pal, 'xyx')).toEqual('1')
  expect(turmin(pal, 'yxy')).toEqual('1')
  expect(turmin(pal, 'xyxyx')).toEqual('1')
  expect(turmin(pal, 'xyxxyx')).toEqual('1')
  expect(turmin(pal, 'yyxyy')).toEqual('1')
  expect(turmin(pal, 'xxxyyxyyxxx')).toEqual('1')
  expect(turmin(pal, 'xy')).toEqual('')
  expect(turmin(pal, 'yx')).toEqual('')
  expect(turmin(pal, 'yxyx')).toEqual('')
  expect(turmin(pal, 'yxyxyx')).toEqual('')
  expect(turmin(pal, 'xyxyxy')).toEqual('')
  expect(turmin(pal, 'xxxy')).toEqual('')
})

test('fibonacci sequence', () => {  // on tape: unary count of iterations
  const fib = `
    / decrement iteration
    rj|0        //0
    rj|2        //2
    r j 999 l   / halt if no iterations left
    rj|7        //7
    l s         //9

    / back to the left tape begin
    lj|11       //11
    lj|13       //13
    lj|15       //15
    r

    / to the second number
    / mark last digit
    rj|18       //18
    rj|20       //20
    ls+         //22

    / back to the left tape begin
    / add a new digit to the begin
    lj|24       //24
    lj|26       //26
    lj 32       //28
    lj|30       //30
    s|          //32

    / to the third number
    rj|33       //33
    rj|35       //35
    r j+43 l    / all digits marked
    rj|40       //40
    j+22        / repeat

    / remove marks
    s|rj+43     //43

    / join the second and third numbers (add)
    sx l s 
    lj|49       //49
    s|
    
    / shift the iterations number
    rj|52       //52
    rs|
    rj|56       //56
    ls

    / to the left tape begin
    lj|60       //60
    lj|62       //62
    lj|64       //64

    / new iteration
    r j|0
  `
  expect(turmin(fib, '| | |')).toEqual('| ||') // 1 2
  expect(turmin(fib, '| | ||')).toEqual('|| |||') // 1 2
  expect(turmin(fib, '| | |||')).toEqual('||| |||||') // 3 5
  expect(turmin(fib, '| || |||')).toEqual('||||| ||||||||') // 5 8
  expect(turmin(fib, '|| ||| |')).toEqual('||| |||||') // 3 5
  expect(turmin(fib, '|| ||| ||')).toEqual('||||| ||||||||') // 5 8
  expect(turmin(fib, '|| ||| |||')).toEqual('|||||||| |||||||||||||') // 8 13
  expect(turmin(fib, '|| ||| ||||')).toEqual('||||||||||||| |||||||||||||||||||||') // 13 21
})

test('Hello World', () => {
  expect(turmin('sHrserslrslrsors,rs rsWrsorsrrslrsdrs!')).toEqual('Hello, World!')
})

// ┌─A/X/R──[S1]──B/B/L──>[S2]
// └─────────^   
test('Turing machine', () => {
  expect(turmin(`
    / S1
    jB3 sX r jA0
    / S2
    l
  `, 'AAAB')).toEqual('XXXB')
})

// productions: (011, 10, 101)
test('cyclic tag system', () => {
  const cts = `    
    / 011
    j 51         / halt on empty
    j014         / next production
    rj02j12      / move rightmost 
    s0rs1rs1     / append 011
    lj010j110r   / move leftmost
    s r d        / delete + debug

    / 10
    j 51         / halt on empty
    j029         / next production
    rj019j119    / move rightmost 
    s1rs0        / append 10
    lj025j125r   / move leftmost    
    s r d        / delete + debug

    / 101
    j 51         / halt on empty
    j046         / next production
    rj034j134    / move rightmost 
    s1rs0rs1     / append 101
    lj042j142r   / move leftmost
    s r d        / delete + debug

    j00j10       / repeat
  `
  const mem = []
  turmin(cts, '1', 1000, m => mem.push(m.join('').trim()))
  expect(mem.slice(0, 6)).toStrictEqual(['011', '11', '1101', '101011', '0101110', '101110'])
})
