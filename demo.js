var md = require('./lib')();
var fs = require('fs');
var files = fs.readdirSync('mddocs', 'utf8');
for (var i in files) {
    var filename = 'mddocs/' + files[i];
    if (filename.slice(-3) !== '.md' &&
      filename.slice(-4) !== '.mkd' &&
      filename.slice(-5) !== '.mkdn' &&
      filename.slice(-7) !== '.mkdown' &&
      filename.slice(-9) !== '.markdown') continue;
    splitLis = filename.split(/[./]/);
    purename = splitLis[splitLis.length - 2];
    var content = fs.readFileSync(filename).toString();
    html = 
`<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.13.0/dist/katex.min.css" integrity="sha384-t5CR+zwDAROtph0PXGte6ia8heboACF9R5l/DiY+WZ3P2lxNgvJkQk5n7GPvLMYw" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js/styles/xcode.min.css">
  </head>
  <body>
    ${md.render(content)}
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/raphael@2.3.0/raphael.min.js"></script>
    <script src="./flowchart.js"></script>
    <script>$('.flowchartjs').flowChart();</script>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script src="./webfont.js"></script>
    <script src="./snap.svg-min.js"></script>
    <script src="./underscore-min.js"></script>
    <script src="./sequence-diagram-min.js"></script>
    <script>
      var options = {theme: 'hand'};
      $(".sequence-diagram").sequenceDiagram(options);
    </script>
  </body>
</html>`;
  console.log(`File '${filename.slice(7)}' rendered.`);
  fs.writeFileSync('htmldocs/' + purename + '.html', html, {encoding: 'utf8'});
}