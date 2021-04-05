# markdown-them <!-- omit in toc -->

> Useful markdown parser done right. Based on markdown-it. More useful features included than markdown-it, such as LaTeX formulas, GFM todo list, diagrams, etc. Aims to support every feature that Typora supports.

__Table of content__

- [Install](#install)
- [Usage examples](#usage-examples)
  - [Simple](#simple)
  - [Useful Features](#useful-features)
- [Todo](#todo)
- [Authors](#authors)
- [References / Thanks](#references--thanks)

## Install

**node.js**:

```bash
npm install markdown-them --save
```

## Usage examples

See also:

- __[API documentation](https://markdown-it.github.io/markdown-it/)__ - for more
  info and examples.
- [Development info](https://github.com/markdown-it/markdown-it/tree/master/docs) -
  for plugins writers.

### demo.js

The file `demo.js` is included in the markdown-them package. Let's suppose you ran `npm install markdown-them` in directory `~/newfolder`. Now you got an `node_modules` folder. To use the demo, copy the `~/newfolder/node_modules/markdown-them/mddocs/` folder, `~/newfolder/node_modules/markdown-them/htmldocs/` folder and `~/newfolder/node_modules/markdown-them/demo.js` to the `~/newfolder` directory. Then put some of your markdown file into the `mddocs/` directory, and run `node demo.js` in your terminal. It should generate same name `.html` files in `htmldocs/` directory.

If anything goes wrong, such as error in running demo.js, sth not rendered or sth rendered unexpected, please submit an issue.

### Simple

```js
// node.js, "classic" way:
var MarkdownIt = require('markdown-them'),
    md = new MarkdownIt();
var result = md.render('# markdown-them rulezz!');

// node.js, the same, but with sugar:
var md = require('markdown-them')();
var result = md.render('# markdown-them rulezz!');
```

Single line rendering, without paragraph wrap:

```js
var md = require('markdown-them')();
var result = md.renderInline('__markdown-them__ rulezz!');
```

### Useful features

If you don't use some of these features, just do nothing with them. In very scarce conditions, you may trigger some syntaxs below, please submit an issue. Every feature below will become configurable in future versions.

#### Highlight

Opened by default, using `highlight.js`, but you still have to include a style sheet to see the result. Add

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js/styles/xcode.min.css">
```

inside the `<head>` tag of the html doc. Change `xcode` to any theme you like, [here](https://github.com/highlightjs/highlight.js/tree/main/src/styles)'s the list.

#### LaTeX formula

LaTeX formula rendering:

```js
var md = require('markdown-them')();
var result = md.render(`An inline formula $E=mc^2$ by Albert Einstein, and a display formula $$E=mc^2$$ again. Let\'s display

$$
E=mc^2
$$

one more time because it's so great!`);
```

This project handles math formulas by KaTeX while rendering (not in browser!), but you still need to include css from KaTeX to make them look right. Add

```css
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.13.0/dist/katex.min.css" integrity="sha384-t5CR+zwDAROtph0PXGte6ia8heboACF9R5l/DiY+WZ3P2lxNgvJkQk5n7GPvLMYw" crossorigin="anonymous">
```

in your html `<head></head>` tag. Default supports `$formula$` and `\\(formula\\)`for inline formulas, `$$formula$$` and `$$\nformula\n$$` for display formulas. Macros share in the whole markdown file, while not share between seperate files.

If any of your mathjax formula is available before but fails here, please submit an issue to let me know. That may take some time of yours, so if you do so, big thank for your contribution to the project!

#### Diagrams

This project supports diagrams written in mermaid, flowchartjs and sequence. Just the same as Typora.

##### Mermaid

Mermaid diagram rendering:

```js
var md = require('markdown-them')();
var result = md.render(
`
\`\`\` mermaid
graph TD
    A[Client] --> B[Load Balancer]
\`\`\`
`);
```

This only keeps the code inside the fence unmodified and assign a `mermaid` class to the outside `<div>` tag, so you need to include `mermaid.js` in your html file to generate the chart. Add

```html
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
```

at the end of the `<body>` tag. This will automaticly render the diagrams. You can change the cdn, or download the js file on your server and link to it.

##### Flowchart.js

```js
var md = require('markdown-them')();
var result = md.render(
`
\`\`\`flow
st=>start: Start:>http://www.google.com[blank]
e=>end:>http://www.google.com
op1=>operation: My Operation
sub1=>subroutine: My Subroutine
cond=>condition: Yes
or No?:>http://www.google.com
io=>inputoutput: catch something...
para=>parallel: parallel tasks

st->op1->cond
cond(yes)->io->e
cond(no)->para
para(path1, bottom)->sub1(right)->op1
para(path2, top)->op1
\`\`\`
`);
```

This only keeps the code inside the fence unmodified and assign a `flowchartjs` class to the outside `<div>` tag, so you need to include `flowchart.js` in your html file, which depends on `jquery.js` and `raphael.js` as a support. Sums up, add

```html
<script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/raphael@2.3.0/raphael.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/flowchart/1.15.0/flowchart.min.js"></script>
<script>$('.flowchartjs').flowChart();</script>
```

at the end of the `<body>` tag. This will automaticly render the `flowchart.js` diagrams. You can change the cdn, or download the js file on your server and link to it. This cdn is somehow slow at my place, so I downloaded the js file for my using.

##### Sequence

Sequence diagram rendering:

```js
var md = require('markdown-them')();
var result = md.render(
`
\`\`\`sequence
Andrew->China: Says Hello
Note right of China: China thinks\nabout it
China-->Andrew: How are you?
Andrew->>China: I am good thanks!
\`\`\`
`);
```

This only keeps the code inside the fence unmodified and assign a `sequence-diagram` class to the outside `<div>` tag, so you need to include `sequence-diagram-min.js` and every file it depends on in your html file. It is to add

```html
<script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
<script src="./webfont.js"></script>
<script src="./snap.svg-min.js"></script>
<script src="./underscore-min.js"></script>
<script src="./sequence-diagram-min.js"></script>
<script>
  var options = {theme: 'hand'};
  $(".sequence-diagram").sequenceDiagram(options);
</script>
```

at the end of the `body` tag. I downloaded all these files on the [official website](https://bramp.github.io/js-sequence-diagrams/) for my using. If you have included `jquery.js` in the doc before, you don't need to do it again. (Be ready, this `js` could run somehow slow)

#### GFM todo list

GFM todo list rendering:

```js
var md = require('markdown-them')();
var result = md.render(
`todo-list:
   - [x] LaTeX formula
   - [X] mermaid diagram
   - [x] GFM todo list
   - [ ] highlight`
);
```

### Other usage

See the page for [markdown-it](https://github.com/markdown-it/markdown-it).

## Todo

- TOC
- blockcode linenumber

## Authors

- Alex Kocharin [github/rlidwka](https://github.com/rlidwka)
- Vitaly Puzrin [github/puzrin](https://github.com/puzrin)

_markdown-it_ is the result of the decision of the authors who contributed to
99% of the _Remarkable_ code to move to a project with the same authorship but
new leadership (Vitaly and Alex). It's not a fork.

- Ze Xia [github/bill-xia](https://github.com/bill-xia)

I merged some plugins into this great project.

## References / Thanks

Big thanks to [John MacFarlane](https://github.com/jgm) for his work on the
CommonMark spec and reference implementations. His work saved us a lot of time
during this project's development.

Big thanks to markdown-it markdown parser, it's a great project. And also thanks to every plugin writer for markdown-it, all of you gave me some ideas on how to implement some features.