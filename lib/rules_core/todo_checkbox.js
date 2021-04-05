// Process checkbox in GFM todo list
// A GFM todo-list:
// - [x] finished
// - [ ] hanging

'use strict';

const Token = require("../token");

module.exports = function todo_checkbox(state, silent) {
    var len = state.tokens.length, i = 2;
    while (i < len) {
        if ((state.tokens[i].type !== 'inline') || 
            (state.tokens[i - 1].type !== 'paragraph_open') ||
            (state.tokens[i - 2].type !== 'list_item_open') ||
            (state.tokens[i].content.slice(0, 4) !== '[x] ' && state.tokens[i].content.slice(0, 4) !== '[X] ' && state.tokens[i].content.slice(0, 4) !== '[ ] '))
            {
            i++;
            continue;
        }
        // is todo list item
        var checked = state.tokens[i].content.slice(0, 4) !== '[ ] ';
        var token = new Token('todo_checkbox', 'input', 0);
        token.checked = checked;
        if (state.tokens[i].content.length === 4) {
            state.tokens[i].children = [token];
        } else {
            state.tokens[i].children.unshift(token);
            state.tokens[i].children[1].content = state.tokens[i].children[1].content.slice(4);
        }
        i++;
    }
}