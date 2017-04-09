//app.js
var jsyaml = require('js-yaml');
var fs = require('fs');
try {
  var doc = jsyaml.load(fs.readFileSync('./config/default.yaml','utf-8'));
  console.log(doc.config.clientport);
} catch (e) {
  console.log(e);
}