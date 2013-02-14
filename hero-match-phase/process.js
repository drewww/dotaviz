var fs = require('fs')
    _ = require('underscore')._;

var entries = [];

var heroes = {};

// ugh this is in the std lib somewhere but fuck if I know what it is and I
// don't want to pay for plane wifi, so lets do this!
function mean(list) {
  var total = 0;
  
  _.each(list, function(item) {
    total += item;
  })

  return total / list.length;
}

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
  
  var heroesOut = {};
  _.each(Object.keys(heroes), function(heroName) {
    var matches = heroes[heroName];
    
    lengths = [[[], []], [[], []], [[], []]];
    
    _.each(matches, function(match) {
      var index;
      if(match.matchLength < 25) {
        index = 0;
      } else if(match.matchLength < 40) {
        index = 1;
      } else {
        index = 2;
      }
      
      var won = 0;
      if(match.winner) won = 1;
      
      lengths[index][won].push(match.matchLength);
    });
    
    // now summarize into numbers.
    console.log(heroName);
    console.log("short: " + lengths[0][1].length + "/" + (lengths[0][1].length + lengths[0][0].length) + " = " + (lengths[0][1].length / (lengths[0][1].length + lengths[0][0].length)));
    console.log("med: " + lengths[1][1].length + "/" + (lengths[1][1].length + lengths[1][0].length) + " = " + (lengths[1][1].length / (lengths[1][1].length + lengths[1][0].length)));
    console.log("long: " + lengths[2][1].length + "/" + (lengths[2][1].length + lengths[2][0].length) + " = " + (lengths[2][1].length / (lengths[2][1].length + lengths[2][0].length)));
    console.log("---");
    
    var winRates = [(lengths[0][1].length / (lengths[0][1].length + lengths[0][0].length)), (lengths[1][1].length / (lengths[1][1].length + lengths[1][0].length)), (lengths[2][1].length / (lengths[2][1].length + lengths[2][0].length))];
    
    var out = {heroName:heroName, winRates: winRates, numMatches: [(lengths[0][1].length + lengths[0][0].length), (lengths[1][1].length + lengths[1][0].length), (lengths[2][1].length + lengths[2][0].length)]};
    
    out.totalMatches = out.numMatches[0] + out.numMatches[1] + out.numMatches[2];
    
    heroesOut[heroName] = out;
  });
  
  fs.writeFileSync('hero_performance.js', "var heroes = " + JSON.stringify(heroesOut));
});

