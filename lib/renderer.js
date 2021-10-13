/**
 * class Renderer
 *
 * Generates HTML from parsed token stream. Each instance has independent
 * copy of rules. Those can be rewritten with ease. Also, you can add new
 * rules if you create plugin and adds new token types.
 **/
 'use strict';


var assign          = require('./common/utils').assign;
var unescapeAll     = require('./common/utils').unescapeAll;
var escapeHtml      = require('./common/utils').escapeHtml;
var katex           = require('katex');
var hljs            = require('highlight.js');

////////////////////////////////////////////////////////////////////////////////

var default_rules = {};

default_rules.heading_open = function (tokens, idx , options, env, slf) {
  if (!env) env = {};
  if (!env.headings) env.headings = {};
  var h_id = tokens[idx].content;
  if (env.headings[h_id] == undefined) {
    env.headings[h_id] = 1;
  } else {
    h_id += ('-' + String(env.headings[tokens[idx].content]));
    console.log(env);
    env.headings[tokens[idx].content] ++;
    console.log(env);
  }
  return `<${tokens[idx].tag} id="${h_id}">`;
}

default_rules.code_inline = function (tokens, idx, options, env, slf) {
  var token = tokens[idx];

  return  '<code' + slf.renderAttrs(token) + '>' +
          escapeHtml(tokens[idx].content) +
          '</code>';
};


default_rules.code_block = function (tokens, idx, options, env, slf) {
  var token = tokens[idx];

  return  '<pre' + slf.renderAttrs(token) + '><code>' +
          hljs.highlightAuto(tokens[idx].content).value +
          '</code></pre>\n';
};


default_rules.math_block = function (tokens, idx, options, env, slf) {
  env.katex_macros = env.katex_macros || {};
  var token = tokens[idx];
  var html = '';
  if (options.mathRender == 'save') {
    token.content = escapeHtml(token.content);
    if (options.mathInline == 'brace') {
      html = `\\[${token.content}\\]`
    } else {
      html = `$$${token.content}$$`
    }
  }
  else
    html = katex.renderToString(token.content, {
      throwOnError: true,
      displayMode: true,
      macros: env.katex_macros,
      globalGroup: true
    });
  return '<div class="markdown-them-math-block">' + html + '</div>';
};

default_rules.math_inline = function (tokens, idx, options, env) {
  env.katex_macros = env.katex_macros || {};
  var token = tokens[idx];
  var html = ''
  if (options.mathRender == 'save') {
    token.content = escapeHtml(token.content);
    if (options.mathInline == 'brace') {
      html = `\\(${token.content}\\)`
    } else {
      html = `$${token.content}$`
    }
  }
  else
    html = katex.renderToString(token.content, {
      throwOnError: true,
      displayMode: false,
      macros: env.katex_macros,
      globalGroup: true
    });
  return '<span class="markdown-them-math-inline">' + html + '</span>';
}

default_rules.math_block_nobr = function (tokens, idx, options, env) {
  env.katex_macros = env.katex_macros || {};
  var token = tokens[idx];
  var html = ''
  if (options.mathRender == 'save') {
    token.content = escapeHtml(token.content);
    if (options.mathInline == 'brace') {
      html = `\\[${token.content}\\]`
    } else {
      html = `$$${token.content}$$`
    }
  }
  else
    html = katex.renderToString(token.content, {
      throwOnError: true,
      displayMode: true,
      macros: env.katex_macros,
      globalGroup: true
    });
  return '<div class="markdown-them-math-block">' + html + '</div>';
}

default_rules.fence = function (tokens, idx, options, env, slf) {
  var token = tokens[idx],
      info = token.info ? unescapeAll(token.info).trim() : '',
      langName = '',
      langAttrs = '',
      highlighted, i, arr, tmpAttrs, tmpToken;

  if (info) {
    arr = info.split(/(\s+)/g);
    langName = arr[0];
    langAttrs = arr.slice(2).join('');
  }

  /*if (options.highlight) {
    highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content);
  } else {
    highlighted = escapeHtml(token.content);
  }*/

  highlighted = '<pre><code>' + (hljs.getLanguage(langName) ? hljs.highlight(token.content, {language: langName}).value : hljs.highlightAuto(token.content).value) + '</code></pre>';

  return highlighted + '\n';

  /*
  // If language exists, inject class gently, without modifying original token.
  // May be, one day we will add .deepClone() for token and simplify this part, but
  // now we prefer to keep things local.
  if (info) {
    i        = token.attrIndex('class');
    tmpAttrs = token.attrs ? token.attrs.slice() : [];

    if (i < 0) {
      tmpAttrs.push([ 'class', options.langPrefix + langName ]);
    } else {
      tmpAttrs[i] = tmpAttrs[i].slice();
      tmpAttrs[i][1] += ' ' + options.langPrefix + langName;
    }

    // Fake token just to render attributes
    tmpToken = {
      attrs: tmpAttrs
    };

    return  '<pre><code' + slf.renderAttrs(tmpToken) + '>'
          + highlighted
          + '</code></pre>\n';
  }


  return  '<pre><code' + slf.renderAttrs(token) + '>'
        + highlighted
        + '</code></pre>\n';*/
};


default_rules.image = function (tokens, idx, options, env, slf) {
  var token = tokens[idx];

  // "alt" attr MUST be set, even if empty. Because it's mandatory and
  // should be placed on proper position for tests.
  //
  // Replace content with actual value

  token.attrs[token.attrIndex('alt')][1] =
    slf.renderInlineAsText(token.children, options, env);

  return slf.renderToken(tokens, idx, options);
};


default_rules.hardbreak = function (tokens, idx, options /*, env */) {
  return options.xhtmlOut ? '<br />\n' : '<br>\n';
};
default_rules.softbreak = function (tokens, idx, options /*, env */) {
  return options.breaks ? (options.xhtmlOut ? '<br />\n' : '<br>\n') : '\n';
};


default_rules.text = function (tokens, idx /*, options, env */) {
  return escapeHtml(tokens[idx].content);
};
 
 
default_rules.html_block = function (tokens, idx /*, options, env */) {
  return tokens[idx].content;
};
default_rules.html_inline = function (tokens, idx /*, options, env */) {
  return tokens[idx].content;
};
default_rules.todo_checkbox = function (tokens, idx /*, options, env */) {
  return '<input type="checkbox" style="color: blue;" disabled' + (tokens[idx].checked ? ' checked' : '') + '/>'
};
default_rules.mermaid = function (tokens, idx /*, options, env */) {
  return '<div class="mermaid">' + tokens[idx].content + '</div>';
}
default_rules.flow = function (tokens, idx /*, options, env */) {
  return '<div class="flowchartjs">' + tokens[idx].content + '</div>\n';
}
default_rules.sequence = function (tokens, idx /*, options, enc */) {
  return '<div class="sequence-diagram">' + tokens[idx].content + '</div>\n';
}
default_rules.footnote_anchor_name = function (tokens, idx, options, env/*, slf*/) {
  var n = Number(tokens[idx].meta.id + 1).toString();
  var prefix = '';

  if (typeof env.docId === 'string') {
    prefix = '-' + env.docId + '-';
  }

  return prefix + n;
}

default_rules.footnote_caption = function (tokens, idx/*, options, env, slf*/) {
  var n = Number(tokens[idx].meta.id + 1).toString();

  if (tokens[idx].meta.subId > 0) {
    n += ':' + tokens[idx].meta.subId;
  }

  return '[' + n + ']';
}

default_rules.footnote_ref = function (tokens, idx, options, env, slf) {
  var id      = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
  var caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
  var refid   = id;

  if (tokens[idx].meta.subId > 0) {
    refid += ':' + tokens[idx].meta.subId;
  }

  return '<sup class="footnote-ref"><a href="#fn' + id + '" id="fnref' + refid + '">' + caption + '</a></sup>';
}

default_rules.footnote_block_open = function (tokens, idx, options) {
  return (options.xhtmlOut ? '<hr class="footnotes-sep" />\n' : '<hr class="footnotes-sep">\n') +
         '<section class="footnotes">\n' +
         '<ol class="footnotes-list">\n';
}

default_rules.footnote_block_close = function() {
  return '</ol>\n</section>\n';
}

default_rules.footnote_open = function (tokens, idx, options, env, slf) {
  var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

  if (tokens[idx].meta.subId > 0) {
    id += ':' + tokens[idx].meta.subId;
  }

  return '<li id="fn' + id + '" class="footnote-item">';
}

default_rules.footnote_close = function () {
  return '</li>\n';
}

default_rules.footnote_anchor = function (tokens, idx, options, env, slf) {
  var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

  if (tokens[idx].meta.subId > 0) {
    id += ':' + tokens[idx].meta.subId;
  }

  /* ↩ with escape code to prevent display as Apple Emoji on iOS */
  return ' <a href="#fnref' + id + '" class="footnote-backref">\u21a9\uFE0E</a>';
}
 
 /**
  * new Renderer()
  *
  * Creates new [[Renderer]] instance and fill [[Renderer#rules]] with defaults.
  **/
 function Renderer() {
 
   /**
    * Renderer#rules -> Object
    *
    * Contains render rules for tokens. Can be updated and extended.
    *
    * ##### Example
    *
    * ```javascript
    * var md = require('markdown-it')();
    *
    * md.renderer.rules.strong_open  = function () { return '<b>'; };
    * md.renderer.rules.strong_close = function () { return '</b>'; };
    *
    * var result = md.renderInline(...);
    * ```
    *
    * Each rule is called as independent static function with fixed signature:
    *
    * ```javascript
    * function my_token_render(tokens, idx, options, env, renderer) {
    *   // ...
    *   return renderedHTML;
    * }
    * ```
    *
    * See [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js)
    * for more details and examples.
    **/
   this.rules = assign({}, default_rules);
 }
 
 
 /**
  * Renderer.renderAttrs(token) -> String
  *
  * Render token attributes to string.
  **/
 Renderer.prototype.renderAttrs = function renderAttrs(token) {
   var i, l, result;
 
   if (!token.attrs) { return ''; }
 
   result = '';
 
   for (i = 0, l = token.attrs.length; i < l; i++) {
     result += ' ' + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"';
   }
 
   return result;
 };
 
 
 /**
  * Renderer.renderToken(tokens, idx, options) -> String
  * - tokens (Array): list of tokens
  * - idx (Numbed): token index to render
  * - options (Object): params of parser instance
  *
  * Default token renderer. Can be overriden by custom function
  * in [[Renderer#rules]].
  **/
 Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
   var nextToken,
       result = '',
       needLf = false,
       token = tokens[idx];
 
   // Tight list paragraphs
   if (token.hidden) {
     return '';
   }
 
   // Insert a newline between hidden paragraph and subsequent opening
   // block-level tag.
   //
   // For example, here we should insert a newline before blockquote:
   //  - a
   //    >
   //
   if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
     result += '\n';
   }
 
   // Add token name, e.g. `<img`
   result += (token.nesting === -1 ? '</' : '<') + token.tag;
 
   // Encode attributes, e.g. `<img src="foo"`
   result += this.renderAttrs(token);
 
   // Add a slash for self-closing tags, e.g. `<img src="foo" /`
   if (token.nesting === 0 && options.xhtmlOut) {
     result += ' /';
   }
 
   // Check if we need to add a newline after this tag
   if (token.block) {
     needLf = true;
 
     if (token.nesting === 1) {
       if (idx + 1 < tokens.length) {
         nextToken = tokens[idx + 1];
 
         if (nextToken.type === 'inline' || nextToken.hidden) {
           // Block-level tag containing an inline tag.
           //
           needLf = false;
 
         } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
           // Opening tag + closing tag of the same type. E.g. `<li></li>`.
           //
           needLf = false;
         }
       }
     }
   }
 
   result += needLf ? '>\n' : '>';
 
   return result;
 };
 
 
 /**
  * Renderer.renderInline(tokens, options, env) -> String
  * - tokens (Array): list on block tokens to renter
  * - options (Object): params of parser instance
  * - env (Object): additional data from parsed input (references, for example)
  *
  * The same as [[Renderer.render]], but for single token of `inline` type.
  **/
 Renderer.prototype.renderInline = function (tokens, options, env) {
   var type,
       result = '',
       rules = this.rules;
 
   for (var i = 0, len = tokens.length; i < len; i++) {
     type = tokens[i].type;
 
     if (typeof rules[type] !== 'undefined') {
       result += rules[type](tokens, i, options, env, this);
     } else {
       result += this.renderToken(tokens, i, options);
     }
   }
 
   return result;
 };
 
 
 /** internal
  * Renderer.renderInlineAsText(tokens, options, env) -> String
  * - tokens (Array): list on block tokens to renter
  * - options (Object): params of parser instance
  * - env (Object): additional data from parsed input (references, for example)
  *
  * Special kludge for image `alt` attributes to conform CommonMark spec.
  * Don't try to use it! Spec requires to show `alt` content with stripped markup,
  * instead of simple escaping.
  **/
 Renderer.prototype.renderInlineAsText = function (tokens, options, env) {
   var result = '';
 
   for (var i = 0, len = tokens.length; i < len; i++) {
     if (tokens[i].type === 'text') {
       result += tokens[i].content;
     } else if (tokens[i].type === 'image') {
       result += this.renderInlineAsText(tokens[i].children, options, env);
     }
   }
 
   return result;
 };
 
 
 /**
  * Renderer.render(tokens, options, env) -> String
  * - tokens (Array): list on block tokens to renter
  * - options (Object): params of parser instance
  * - env (Object): additional data from parsed input (references, for example)
  *
  * Takes token stream and generates HTML. Probably, you will never need to call
  * this method directly.
  **/
 Renderer.prototype.render = function (tokens, options, env) {
   var i, len, type,
       result = '',
       rules = this.rules;
 
   for (i = 0, len = tokens.length; i < len; i++) {
     type = tokens[i].type;
 
     if (type === 'inline') {
       result += this.renderInline(tokens[i].children, options, env);
     } else if (typeof rules[type] !== 'undefined') {
       result += rules[tokens[i].type](tokens, i, options, env, this);
     } else {
       result += this.renderToken(tokens, i, options, env);
     }
   }
 
   return result;
 };
 
 module.exports = Renderer;
 