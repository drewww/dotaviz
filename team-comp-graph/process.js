var fs = require('fs')
    _ = require('underscore')._;
    


// select herodisp.hero_num, hero_name, count(*) as picks, sum(gpm)/count(*) as gpm, sum(kills)/count(*) as kills, sum(deaths)/count(*) as deaths, sum(assists)/count(*) as assists, (sum(kills)+sum(assists))/sum(deaths) as kda, (sum(kills)/sum(deaths)) as kd

var heroes = {}
fs.readFile('hero_nodes.csv', function(err, data) {
  lines = data.toString("ascii").split("\n");
  console.log("lines: " + lines.length);
  _.each(lines, function(line) {
    var pieces = line.split(",");

    var entry = {heroId: parseInt(pieces[0]), heroName: pieces[1], picks: parseInt(pieces[2]), gpm: parseFloat(pieces[3]), kills: parseFloat(pieces[4]), deaths: parseFloat(pieces[5]), assists: parseFloat(pieces[6]), kda: parseFloat(pieces[7]), kd:parseFloat(pieces[8])};
    heroes[entry.heroId] = entry;
  });
  
  
  // now load in the games data.
  var matches = {}
  fs.readFile('all_picks.csv', function(err, data) {
    lines = data.toString("ascii").split("\n");
    
    var pick;
    _.each(lines, function(line) {
      var pieces = line.split(",");
      
      pick = {matchId: parseInt(pieces[0]), index:parseInt(pieces[1]), heroId:parseInt(pieces[2]), winner:pieces[3]=="1"};
      
      if(!(pick.matchId in matches)) {
        matches[pick.matchId] = [];
      }
      matches[pick.matchId][pick.index] = pick;
    });
    
    console.log(JSON.stringify(matches["117686346"]));
  });

  
  // now we get to the fun part. how much graph functionality do we need here?
  // to start with, we want to link heroIds to lists of other heroIds they
  // have been picked with. data structure for that will be a dict:
  // key is heroId
  // contains a dict that has {sameTeam:{heroId->number of coOccurences}}
  // we'll add in other stuff later (like wins/losses, and enemies)
  
  
  // _.each(matches, function(picks) {
  //   
  //   _.each(picks, function(pick) {
  //     
  //   });
  //   
  //   
  // });
});
