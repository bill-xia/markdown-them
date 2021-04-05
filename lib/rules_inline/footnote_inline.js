'use strict';

module.exports = function footnote_inline(state, silent) {
  var labelStart,
      labelEnd,
      footnoteId,
      token,
      tokens,
      max = state.posMax,
      start = state.pos;

  if (start + 2 >= max) { return false; }
  if (state.src.charCodeAt(start) !== 0x5E/* ^ */) { return false; }
  if (state.src.charCodeAt(start + 1) !== 0x5B/* [ */) { return false; }

  labelStart = start + 2;
  labelEnd = state.md.parseLinkLabel(state, start + 1);

  // parser failed to find ']', so it's not a valid note
  if (labelEnd < 0) { return false; }

  // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //
  if (!silent) {
    if (!state.env.footnotes) { state.env.footnotes = {}; }
    if (!state.env.footnotes.list) { state.env.footnotes.list = []; }
    footnoteId = state.env.footnotes.list.length;

    state.md.inline.parse(
      state.src.slice(labelStart, labelEnd),
      state.md,
      state.env,
      tokens = []
    );

    token      = state.push('footnote_ref', '', 0);
    token.meta = { id: footnoteId };

    state.env.footnotes.list[footnoteId] = {
      content: state.src.slice(labelStart, labelEnd),
      tokens: tokens
    };
  }

  state.pos = labelEnd + 1;
  state.posMax = max;
  return true;
}