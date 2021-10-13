// Process inline-written formulas. This includes 2 conditions:
// 1. $ formula $, it's rendered in inline style
// 2. $$ formula $$, rendered in block style
//
// In the future, it's behaviour will depend on the configs:
//    - Block_nobr (default): rendered in block style
//    - Inline: rendered in inline style

'use strict';

var isWhiteSpace   = require('../common/utils').isWhiteSpace;

module.exports = function math_inline(state, silent) {
    var i, scanned, token,
    start = state.pos,
    marker = state.src.charCodeAt(start),
    max = state.posMax,
    inline = true;

    if (silent) { return false; }

    if (state.md.options.mathInline === 'brace' && start + 3 <= state.src.length && state.src.slice(start, start + 3) === '\\\\(' && (start === 0 || state.src[start - 1] !== '\\')) {
        // is \(\)

        i = start = start + 3;

        var ok = false;

        while (!ok && i < max) {
            if (state.src[i - 1] !== '\\' && i + 3 <= state.src.length && state.src.slice(i, i + 3) === '\\\\)') {
                token = state.push('math_inline', 'span', 0);
                token.content = state.src.slice(start, i);
                state.pos = i + 3;
                ok = true;
            }
            i++;
        }

        return ok;
    }

    if (marker !== 0x24 /* $ */ || (start - 1 >= 0 && state.src.charCodeAt(start - 1) === 0x5C)) { return false; }

    // inline / block
    if (start + 1 <= state.src.length && state.src.charCodeAt(start + 1) === 0x24) {
        start++;
        inline = false;
    }

    i = start + 1;
    
    while (i < state.src.length && isWhiteSpace(state.src.charCodeAt(i))) {
        i++;
    }

    if (i >= state.src.length) return;

    var ok = false, first_non_space = i;

    while (!ok && i < max) {
        if (state.src.charCodeAt(i) === 0x24 /* $ */ && (i == 0 || state.src.charCodeAt(i - 1) !== 0x5C) /* \ */ && isGoodFormula(state.src.slice(first_non_space, i))) {
            if (inline) {
                token = state.push('math_inline', 'span', 0);
                token.content = state.src.slice(start + 1, i);
                state.pos = i + 1;
                ok = true;
            } else if (i + 1 < max && state.src.charCodeAt(i + 1) === 0x24 /* $ */) {
                token = state.push('math_block_nobr', 'div', 0);
                token.content = state.src.slice(start + 1, i);
                state.pos = i + 2;
                ok = true;
            }
        }
        i++;
    }

    return ok;
}

function isGoodFormula(formula) {
    for (var i = 0; i < formula.length; i++) {
        if (formula.charCodeAt(i) !== 0x26 /* $ */ && !isWhiteSpace(formula.charCodeAt(i))) {
            return true;
        }
    }
    return false;
}