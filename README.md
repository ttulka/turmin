# Turmin

**Turmin** is neither a Turing machine nor a Minsky machine. It is a language for programming Turing machines with a minimalistic yet convenient instruction set. The explicit state machine used traditionally in description numbers of Turing machines is conveniently replaced by conditional jumps borrowed from Minsky machines.

## Memory model

Like Turing machines, a Turmin program operates on an unbounded tape of cells, each holding a symbol from the program alphabet. The used charset depends on the implementation, but each interpreter must support at least ASCII starting from #20 (SPACE). 

The character #20 is also the initial value of each cell, so an empty cell has the value #20. This is just a convenient shortcut, avoiding the introduction of any special characters (such as `ε`) or additional instructions like *clear* and *jump if empty*. An implementation can simply interpret an empty cell, either undefined or having an empty value, as a space.

## Instructions

| Instruction | Name  | Meaning |
| ----------- | ----- | ------- |
| `s`*S*      | SET   | Set symbol *S* to the current cell |
| `r`         | RIGHT | Move to the cell on the right |
| `l`         | LEFT  | Move to the cell left |
| `j`*SN*     | JUMP  | If the current cell is *S*, jump to the *N*-th instruction |

Instructions in a Turmin program are indexed from zero. Jumping to a nonexistent index will cause the program to halt.

Whitespaces between instructions are permitted.

An interpreter may also allow code comments. A code comment starts with `/` and ends with `\` or a newline. Code comments can contain any arbitrary text; they are fully ignored by interpretation.

An interpreter may additionally support the instruction `d` (DEBUG) to output useful debugging information.

## Examples

### Empty program

The simplest program is an empty one:

```turmin

```

It does nothing.

### Infinite loop

The simplest infinite loop can be created by repeatedly jumping to the same instruction:

```turmin
j 0
```

### Addition

Turmin does not natively support numbers, so a concept must be developed. The simplest approach is to use unary numbers, represented by tally marks (`|` or any arbitrary symbol) separated by spaces, where the number of tally marks corresponds to the value.

For example, the following tape content represents the numbers 2 and 3:

```
|| |||
```

Adding unary numbers is straightforward—both expressions simply need to be concatenated:

```turmin
j 3 r j|0   / move to the next number
s|          / replace a space with a tally mark
r j|4       / to the end of the second number
l s         / erase the last tally mark
```

The result for the input 2 and 3 is as follows (5):

```
|||||
```

### Palindromes

Turmin is a symbolic machine, making it well-suited for string manipulation.

To check if an input is a palindrome, the first character is “eaten” and compared to the last one. If a discrepancy is found, the tape is erased. If all characters are eaten without finding a difference, the program prints `1`:

```turmin
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
```

Comments `//n` label the instruction index, aiding in navigating jumps.

### Fibonacci sequence

The idea is to use unary numbers and move them as the sequence prescribes, adding them accordingly.

The initial input consists of three arguments: the two starting elements of the sequence and the number of desired iterations.

For example, 3 iterations can be performed starting with 1 and 2:

```
 | || |||
```

First, the program decrements the iteration counter. If the counter reaches zero, the program halts:

```
 | || ||
```

Next, the second number is moved as the new first element by marking it digit by digit:

```
 | | |+ ||
|| | ++ ||
```

The marks are then removed, and the two numbers are added together:

```
|| | +| ||
|| | || ||
|| ||| ||
```

Then, the next iteration begins.

```turmin
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

/ add the 2nd and 3rd numbers
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
```

### Hello, World!

This legendary program is straightforward to implement in Turmin:

```turmin
sHrserslrslrsors,rs rsWrsorsrrslrsdrs!
```

## Computational class

It should be evident that Turmin is a Turing-complete language, as it has read-write access to unbounded memory and supports conditional jumps. We can easily show that Turmin can simulate both Turing and Minsky machines.

### Turing machine

A Turing machine performs computations based on state transitions. In Turmin, states can be simulated as snippets of code that the program jumps to based on a transition.

Consider the following Turing machine with two states, S1 and S2, which rewrites `A`s to `X`s until it encounters a `B`:

```
  ┌─A/X/R──(S1)──B/B/L──>(S2)
  └─────────^   
```

Translating this Turing machine into Turmin is a mechanical process:

```turmin
/ S1
jB3 sX r jA0
/ S2
l
```

### Minsky machine

We can simulate the registers of a Minsky machine using unary numbers separated by spaces or any other symbol.

Incrementing a register involves adding a tally mark and shifting to the right, while decrementing involves removing a tally mark and shifting to the left.

Conditional jumps are natively supported in Turmin, and checking for zero is as simple as verifying whether any tally mark exists between separators.

## JavaScript interpreter

```sh
npm i turmin
```

```js
const turmin = require('turmin')

const result = turmin(
    'j 3rj|0s|rj|4ls ', 
    '|| |||'
)
result // "|||||"
```

## License

[MIT](LICENSE)
