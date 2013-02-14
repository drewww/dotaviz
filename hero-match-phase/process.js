var fs = require('fs')
    _ = require('underscore')._;

var entries = [];

fs.readFile('hero_performance.csv', function(err, data) {
  lines = data.toString("ascii").split("\n");
  console.log("lines: " + lines.length);
  _.each(lines, function(line) {
    var pieces = line.split(",")
    
    var entry = {matchId: pieces[0], index: pieces[1], gpm: parseInt(pieces[2]), heroName: pieces[3], matchLength: parseInt(pieces[4]), winner: pieces[5]=="1"};
    
    entries.push(entry);
  });

  console.log(JSON.stringify(entries));
});

