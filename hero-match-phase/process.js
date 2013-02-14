var fs = require('fs')
    _ = require('underscore')._;

var entries = [];

var heroes = {};

fs.readFile('hero_performance.csv', function(err, data) {
  lines = data.toString("ascii").split("\n");
  console.log("lines: " + lines.length);
  _.each(lines, function(line) {
    var pieces = line.split(",")
    
    var entry = {matchId: pieces[0], index: pieces[1], gpm: parseInt(pieces[2]), heroName: pieces[3], matchLength: parseInt(pieces[4]), winner: pieces[5]=="1"};
    
    entries.push(entry);
    
    if(entry.heroName in heroes) {
      heroes[entry.heroName].push(entry);
    } else {
      heroes[entry.heroName] = [entry];
    }
  });
  
  // two ways to go from here:
  //  - test my intuition about wins and losses being separate sets
  //  - split games into bins based on duration, and look at relative
  //    win rates.
  
  // ultimately I'm thinking this is probably a fools errand, because
  // the correlation between heroes, match length, and win/loss is
  // not going to be statistically significant. but I can't run that
  // analysis here, so lets just take the second path and see how it looks. 
  
  // for each hero (iterate through keys on heroes), bin matches based
  // on length (just do two bins to start, > and < 25 mins) and calc
  // win rate in each category.
  
  var heroMetadata = {};
  _.each(Object.keys(heroes), function(heroName) {
    var matches = heroes[heroName];
    
    heroMetadata.heroName = heroName;
    heroMetadata.matchLengths = [[[], []], [[], []]];
    
    _.each(matches, function(match) {
      var index;
      if(match.matchLength > 30) {
        index = 0;
      } else {
        index = 1;
      }
      
      var won = 0;
      if(match.winner) won = 1;
      
      heroMetadata.matchLengths[index][won].push(match.matchLength);
    });
    
    console.log(JSON.stringify(heroMetadata));
  });
  
});

