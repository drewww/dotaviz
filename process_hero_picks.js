var fs = require('fs')
    _ = require('underscore')._;

var data = [];
var lines = [];
var entries = [];

var yearweeks = {};

fs.readFile('hero_picks.csv', function(err, data) {
  
  
  // first parse things into sensible objects.
  lines = data.toString("ascii").split("\n");
  
  
  _.each(lines, function(line) {
    var pieces = line.split(",");
    
    var entry = {"heroId":pieces[0], "heroName":pieces[1], "picks":pieces[2],
      "yearweek":pieces[3]};
      
    entries.push(entry);
    
    // this will collide a bunch, but then the number of keys will tell us
    // how many unique yearweeks there are
    yearweeks[entry.yearweek] = true;
  });
  
  
  var numYearweeks = Object.keys(yearweeks).length;
  
  console.log("yearweeks: " + numYearweeks);
  
});
