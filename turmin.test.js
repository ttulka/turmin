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
    j 3 r j|0
    s|
    r j|4
    l s
  `
  expect(turmin(add, '| |')).toEqual('||')
  expect(turmin(add, '|| |')).toEqual('|||')
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
    r j 999 l   / jump to end if no iterations left
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
    ls.         //22

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
    r j.43 l    / all digits marked
    rj|40       //40
    j.22        / repeat

    / remove marks
    s|rj.43     //43

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
