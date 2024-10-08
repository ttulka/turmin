const EPS = ' ' // empty value

const interpret = (program, memory, maxSteps, onDebug) => {    
    // initialize
    const p = parse(program)
    const m = Array.isArray(memory) ? memory : (typeof memory === 'string' ? memory.split('') : [])
                .map(s => (s === null || s === undefined || s === EPS) ? null : s + '')
                
    const ms = maxSteps > 0 ? maxSteps : 0
    const debug = typeof onDebug === 'function'

    let pc = 0   // program counter
    let h  = 0   // tape head

    // execute
    let sc = 0   // step counter
    while (pc < p.length && (!ms || sc <= ms)) {
        sc++
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
                sc--    // debug is not a computation instruction, thus it doesn't count to the step counter
                if (debug) onDebug([...m], h, sc)
                pc++
                break
        }
    }

    if (maxSteps && sc > maxSteps && !debug) throw new Error('Maximal steps exceeded')

    return output(m)

    function output(m) {
        let out = ''
        for (let i = 0; i < m.length; i++) out += !m[i] ? EPS : m[i]
        return out.trim()
    }
}

// parse the program to AST
function parse(program) {
    const regex = 's[ -~]|r|l|j[ -~]([1-9][0-9]*|0[1-9][0-9]*|0)|d|:0[1-9][0-9]*'

    const source = program
        .replaceAll(/\/.*(\\)/g, '')    // remove comments
        .replaceAll(/\/.*($|\n)/g, '')
        .replaceAll(/\n/g,' ')          // remove whitespaces 
        .replaceAll(new RegExp('(' + regex + ')\\s+', 'g'), '$1')
        .trimStart()

    if (!new RegExp('^(' + regex + ')*$').test(source))
        throw new Error('Syntax error: invalid code')

    const labels = []
    let pc = 0
    const instructions = (source.match(new RegExp(regex, 'g')) || []).filter((instr, index) => {
        if (instr.startsWith(':')) {
            labels[instr.substring(1)] = pc
            return false
        }
        pc++
        return true
    })

    return instructions.map(instr => {            
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
            let addr = instr.substring(2)
            if (addr.length > 1 && addr.startsWith('0')) {  // it's a label
                if (labels[addr] >= 0) addr = labels[addr]
                else throw new Error('Syntax error: invalid label')
            }
            return new Instr('JUMP', instr[1], addr-0)
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