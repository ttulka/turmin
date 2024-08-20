# Turmin

**Turmin** is neither a Turing machine nor a Minsky machine. It is a language to program Turing machines with a minimalistic yet convenient instruction set. The explicit state machine used traditionally in description numbers of Turing machines is conveniently replaced by conditional jumps borrowed from Minsky machines.

Like Turing machines, a Turmin program operates on an unbounded tape of cells, each holding a symbol from the program alphabet. The used charset depends on the implementation, but each interpreter must support at least ASCII starting from #20 (SPACE). The character #20 is also the initial value of each cell, so an empty cell has the value #20. This is just a convenient shortcut, avoiding the introduction of any special characters (such as `ε`) or additional instructions like *clear* and *jump if empty*. An implementation can simply interpret an empty cell, either undefined or having an empty value, as a space.

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

## JavaScript interpreter

```sh
npm i turmin
```

```js
const turmin = require('turmin')

const result = turmin(
    'TBD', 
    [42, 13]
)
result[0]  // 55
```

## License

[MIT](LICENSE)