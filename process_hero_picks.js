var fs = require('fs')
    _ = require('underscore')._;

var data = [];
var lines = [];
var entries = [];

var yearweeks = {};

var heroes = {};
var yearWeekMetadata = [];

var totalPicksInYearWeek = 0;

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
      "yearweek":pieces[3], "gpm":parseInt(pieces[4]), "role":pieces[5], "kills":parseInt(pieces[6]), "deaths":parseInt(pieces[7]), "assists":parseInt(pieces[8]), "month":parseInt(pieces[9]), "year":parseInt(pieces[10]), "monthname":pieces[11]};
    
    entries.push(entry);
    
    // this will collide a bunch, but then the number of keys will tell us
    // how many unique yearweeks there are
    yearweeks[entry.yearweek] = true;
  });
  
  console.log("yearweeks: " + Object.keys(yearweeks).length);
  console.log("yearweeks: " + JSON.stringify(Object.keys(yearweeks)));
  var numYearweeks = Object.keys(yearweeks).length-4;
  
  var curYearweek = null;
  var yearweekIndex = 0;
  var prevYearWeek = null;
  _.each(entries, function(entry) {
    console.log(JSON.stringify(entry));
    
    // okay, now we go through each entry. check and see if that hero name
    // is a key in heroes yet. if it is, add it to values. if not, create
    // a new hero.
    if(parseInt(entry.yearweek) < 201238 || parseInt(entry.yearweek) > 201305) {
      return;
    }
    
    if(_.isNull(curYearweek)) {
      curYearweek = entry.yearweek;
      console.log("setting initial yearweek: " + curYearweek);
    } else {
      if(curYearweek!=entry.yearweek) {
        var label;
        
        // console.log("prevYearweek: " + prevYearWeek)
        
        if(_.isNull(curYearweek)) {
          console.log("prev is null, using double entry");
          label = entry.monthname + "\n" + entry.year;
        } else {
          if(parseInt(curYearweek.substring(0, 4)) != entry.year) {
            console.log("year changed, using double")
            label = entry.monthname + "\n" + entry.year;
          } else if(parseInt(curYearweek.substring(4, 2)) != entry.month) {
            console.log("month changed, using month");
            label = entry.monthname;
          } else {
            label = "";
          }
        }
        console.log("LABEL: " + label);
        // save some data in the yearWeeks accumulator
        yearWeekMetadata.push({"totalPicks":totalPicksInYearWeek, "yearWeek":curYearweek, "year":entry.year, "month":entry.month, "label":label});
        
        totalPicksInYearWeek = 0;
        yearweekIndex++;
        curYearweek = entry.yearweek;
        
        console.log("new yearweek: " + entry.yearweek);
      }
    }
    
    
    totalPicksInYearWeek += parseInt(entry.picks);
    
    if(entry.heroName in heroes) {
      // update
      var heroObj = heroes[entry.heroName];
      
      heroObj.values[yearweekIndex].y = parseInt(entry.picks);
      heroes[entry.heroName].totalPicks = heroes[entry.heroName].totalPicks
      + parseInt(entry.picks);
      
      heroes[entry.heroName].gpm = heroes[entry.heroName].gpm + entry.gpm;
      heroes[entry.heroName].kills = heroes[entry.heroName].kills + entry.kills;
      heroes[entry.heroName].deaths = heroes[entry.heroName].deaths + entry.deaths;
      heroes[entry.heroName].assists = heroes[entry.heroName].assists + entry.assists;
      
      // console.log(JSON.stringify(heroObj));
      if(parseInt(entry.picks) > heroObj.maxPicks) {
        heroObj.maxPicks = parseInt(entry.picks);
        heroObj.peakWeek = yearweekIndex;
      }
      
    } else {
      var heroObj = {"heroName":entry.heroName, "heroId":entry.heroId, "values":zeros(numYearweeks), "totalPicks":parseInt(entry.picks), "gpm":0, "kills":0, "deaths":0, "assists":0, "maxPicks":parseInt(entry.picks), "peakWeek":yearweekIndex};
      
      heroObj.values[yearweekIndex].y = parseInt(entry.picks);
      
      heroes[entry.heroName] = heroObj;
    }
  });
  
  yearWeekMetadata.push({"totalPicks":totalPicksInYearWeek, "yearWeek":curYearweek});
  
  
  var heroesArray = [];
  
  var otherHero = {names:[], values:zeros(numYearweeks), heroesPicked:{}, isOtherHero:true, "peakWeek":0, "heroName":"Other Heroes"};
  
  
  _.each(heroes, function(value, key) {
    if(value.totalPicks > 40) {
      
      value.gpm = value.gpm / value.totalPicks;
      value.kills = value.kills / value.totalPicks;
      value.deaths = value.deaths / value.totalPicks;
      value.assists = value.assists / value.totalPicks;
      
      heroesArray.push(value);
    } else {
      otherHero.names.push(value.heroName + " ("+value.totalPicks+")");
      
      var i=0;
      _.each(value.values, function(picks) {
        otherHero.values[i].y += picks.y;
        i++;
      });
    }
  });
  
  otherHero.names = _.sortBy(otherHero.names, function(item) {
    var parenLoc = item.indexOf("(");
    var substring = item.substring(parenLoc+1, item.length-1);
    return parseInt(substring)*-1;
  });
  
  console.log(JSON.stringify(otherHero));
  
  heroesArray = _.sortBy(heroesArray, "gpm");
  
  otherHero.heroName = "Other Heroes ("+otherHero.names.length+")";
  
  
  heroesArray.unshift(otherHero);
  
  
  fs.writeFileSync('hero_picks.js', "var heroes = " + JSON.stringify(heroesArray) + "; var others = " + JSON.stringify(otherHero));
  
  fs.writeFileSync('yearweeks.js', "var yearweeks = " + JSON.stringify(yearWeekMetadata));
  
});




