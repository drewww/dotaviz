var fs = require('fs')
    _ = require('underscore')._;

var data = [];
var lines = [];
var entries = [];

var yearweeks = {};

var heroes = {};

function zeros(l) {
  var array = [];
  
  for(var i=0; i<l; i++) {
    array.push({x:i, y:0});
  }
  
  return array;
}

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
  
  console.log("yearweeks: " + Object.keys(yearweeks).length);
  var numYearweeks = Object.keys(yearweeks).length;
  
  var curYearweek = null;
  var yearweekIndex = 0;
  _.each(entries, function(entry) {
    // okay, now we go through each entry. check and see if that hero name
    // is a key in heroes yet. if it is, add it to values. if not, create
    // a new hero.
    
    if(_.isNull(curYearweek)) {
      curYearweek = entry.yearweek;
    } else {
      if(curYearweek!=entry.yearweek) {
        yearweekIndex++;
        curYearweek = entry.yearweek;
        console.log("new yearweek: " + entry.yearweek);
      }
    }
    
    if(entry.heroName in heroes) {
      // update
      var heroObj = heroes[entry.heroName];
      
      heroObj.values[yearweekIndex].y = parseInt(entry.picks);
    } else {
      var heroObj = {"heroName":entry.heroName, "heroId":entry.heroId, "values":zeros(numYearweeks)};
      
      heroObj.values[yearweekIndex].y = parseInt(entry.picks);
      
      heroes[entry.heroName] = heroObj;
    }
    
  });
  
  var heroesArray = [];
  
  _.each(heroes, function(value, key) {
    heroesArray.push(value);
  });
  
  fs.writeFileSync('hero_picks.js', "var heroes = " + JSON.stringify(heroesArray));
  
});




