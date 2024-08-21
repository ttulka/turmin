const EPS = ' ' // empty value

const interpret = (program, memory, maxSteps, onDebug) => {    
    // initialize
    const p = parse(program)
    const m = Array.isArray(memory) ? memory : (typeof memory === 'string' ? memory.split('') : [])
                .map(s => (s === null || s === undefined || s === EPS) ? null : s + '')
    const ms = maxSteps > 0 ? maxSteps : 10000 // TODO

    let pc = 0   // program counter
    let h  = 0   // tape head

    // execute
    let sc = 0   // step counter
    while (pc < p.length && (!ms || ++sc <= ms)) {
        const i = p[pc]

        switch (i.id) {
            case 'SET':
                m[h] = i.attr1 === EPS ? null : i.attr1
                pc++                
                break
            case 'RIGHT':
                h++
                pc++
                break
            case 'LEFT':
                if (h === 0) m.unshift(null)
                else h--
                pc++
                break
            case 'JUMP':
                if (m[h] === i.attr1 || (i.attr1 === EPS && (m[h] === null || m[h] === undefined))) pc = i.attr2
                else pc++
                break
            case 'DEBUG':
                if (typeof onDebug === 'function') onDebug([...m], h, sc)
                pc++
                break
        }
    }

    if (maxSteps && sc > maxSteps) throw new Error('Maximal steps exceeded')

    return tape(m)

    function tape(m) {
        return m.map(c => c === null ? EPS : c).join('').trim()
    }
}

// parse the program to AST
function parse(program) {
    const regex = 's[ -~]|r|l|j[ -~]([1-9][0-9]*|0)|d'

    program = program
        .replaceAll(/\/.*(\\|$|\n)/g, '')    // remove comments
        .replaceAll(/\n/g,' ')               // remove whitespaces 
        .replaceAll(new RegExp('(' + regex + ')\\s+', 'g'), '$1')
        .trimStart()

    if (!new RegExp('^(' + regex + ')*$').test(program))
        throw new Error('Syntax error: invalid code')

    return (program.match(new RegExp(regex, 'g')) || [])
        .map(instr => {
            if (instr.startsWith('s') && instr.length === 2) {
                return new Instr('SET', instr[1])
            }
            if (instr === 'r') {
                return new Instr('RIGHT')
            }
            if (instr === 'l') {
                return new Instr('LEFT')
            }
            if (instr.startsWith('j') && instr.length >= 3) {
                return new Instr('JUMP', instr[1], instr.substring(2)-0)
            }
            if (instr === 'd') {
                return new Instr('DEBUG')
            }
            throw new Error('Syntax error: invalid instruction')
        })
}

class Instr {
    constructor(id, attr1, attr2) {
        this.id = id
        this.attr1 = attr1
        this.attr2 = attr2
    }
}

module.exports = interpret