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
    
    if(heroName=="undefined") return;
    
    console.log(heroName);
    // lengths = [[[], []], [[], []], [[], []]];
    lengths = [];
    var bucketWidth = 2.5;
    var numBuckets = 100/bucketWidth;
    for(var i=0; i<numBuckets; i++) {
      lengths.push([[],[]]);
    }
    
    var winLengths = [];
    var lossLengths = [];
    
    _.each(matches, function(match) {
      var index;
      
      index = Math.floor(match.matchLength / bucketWidth);
      
      var won = 0;
      if(match.winner) won = 1;
      
      lengths[index][won].push(match.matchLength);
      
      if(won) winLengths.push(match.matchLength);
      else lossLengths.push(match.matchLength);
      
    });
    
    // now count match lengths in each bin
    var binTotals = [];
    var totalMatches = 0;
    _.each(lengths, function(bin) {
      binTotals.push([bin[0].length, bin[1].length]);
      totalMatches += bin[0].length + bin[1].length;
    });
    
    // now summarize into numbers.
    console.log(heroName);
    _.each(binTotals, function(bin) {
      renderRow(bin);
    });
    
    // var winRates = [(lengths[0][1].length / (lengths[0][1].length + lengths[0][0].length)), (lengths[1][1].length / (lengths[1][1].length + lengths[1][0].length)), (lengths[2][1].length / (lengths[2][1].length + lengths[2][0].length))];
    
    var out = {heroName:heroName, numMatches:binTotals, totalMatches:totalMatches, winMatchTimes:winLengths, lossMatchTimes:lossLengths};
    
    heroesOut[heroName] = out;
  });
  
  
  // do some filtering. exclude any hero that doesn't have enough data.
  // we'll do the same threshold as the other visualization: > 40 total games,
  // plus requiring more than 4 games in category?
  console.log("EXCLUDING");
  heroesOut = _.filter(heroesOut, function(hero) {
    var result = true;
    
    if(hero.totalMatches < 40) result = false;
    
    if(hero.numMatches[0] < 4 || hero.numMatches[1] < 4 || hero.numMatches[2] < 4) {
      result = false;
    }
    
    if(!result) {
      console.log("\t" + hero.heroName + " " + JSON.stringify(hero.numMatches));
    }
    
    return result;
  });
  
  var heroesList = _.toArray(heroesOut);
  
  heroesList = _.sortBy(heroesList, "heroName");
  
  fs.writeFileSync('hero_performance.js', "var heroes = " + JSON.stringify(heroesList));
  
  var stream = fs.createWriteStream('distributions.csv', {flags:'w'});
  
  _.each(heroesList, function(hero) {
    stream.write(hero.heroName.replace(/ /g, "_") + "_win, " + hero.winMatchTimes.join(",") + "\n");
    stream.write(hero.heroName.replace(/ /g, "_") + "_loss, " + hero.lossMatchTimes.join(",") + "\n");
  });
  
  stream.end();
});

function renderRow(bin) {
  var wins = bin[1];
  var losses = bin[0];
  
  var string = "";
  
  for(var i=0; i<(30-losses); i++) {
    string += " ";
  }
  
  for(var i=0; i<(losses); i++) {
    string += "-";
  }
  
  string += "|";
  
  for(var i=0; i<(wins); i++) {
    string += "+";
  }
  
  console.log(string);
}

