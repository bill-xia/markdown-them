'use strict';

module.exports = function footnote_tail(state) {
  var i, l, j, t, lastParagraph, list, token, tokens, current, currentLabel,
      insideRef = false,
      refTokens = {};

  if (!state.env.footnotes) { return; }

  state.tokens = state.tokens.filter(function (tok) {
    if (tok.type === 'footnote_reference_open') {
      insideRef = true;
      current = [];
      currentLabel = tok.meta.label;
      return false;
    }
    if (tok.type === 'footnote_reference_close') {
      insideRef = false;
      // prepend ':' to avoid conflict with Object.prototype members
      refTokens[':' + currentLabel] = current;
      return false;
    }
    if (insideRef) { current.push(tok); }
    return !insideRef;
  });

  if (!state.env.footnotes.list) { return; }
  list = state.env.footnotes.list;

  token = new state.Token('footnote_block_open', '', 1);
  state.tokens.push(token);

  for (i = 0, l = list.length; i < l; i++) {
    token      = new state.Token('footnote_open', '', 1);
    token.meta = { id: i, label: list[i].label };
    state.tokens.push(token);

    if (list[i].tokens) {
      tokens = [];

      token          = new state.Token('paragraph_open', 'p', 1);
      token.block    = true;
      tokens.push(token);

      token          = new state.Token('inline', '', 0);
      token.children = list[i].tokens;
      token.content  = list[i].content;
      tokens.push(token);

      token          = new state.Token('paragraph_close', 'p', -1);
      token.block    = true;
      tokens.push(token);

    } else if (list[i].label) {
      tokens = refTokens[':' + list[i].label];
    }

    state.tokens = state.tokens.concat(tokens);
    if (state.tokens[state.tokens.length - 1].type === 'paragraph_close') {
      lastParagraph = state.tokens.pop();
    } else {
      lastParagraph = null;
    }

    t = list[i].count > 0 ? list[i].count : 1;
    for (j = 0; j < t; j++) {
      token      = new state.Token('footnote_anchor', '', 0);
      token.meta = { id: i, subId: j, label: list[i].label };
      state.tokens.push(token);
    }

    if (lastParagraph) {
      state.tokens.push(lastParagraph);
    }

    token = new state.Token('footnote_close', '', -1);
    state.tokens.push(token);
  }

  token = new state.Token('footnote_block_close', '', -1);
  state.tokens.push(token);
}