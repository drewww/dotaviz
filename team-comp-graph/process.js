var fs = require('fs')
    _ = require('underscore')._;
    


// select herodisp.hero_num, hero_name, count(*) as picks, sum(gpm)/count(*) as gpm, sum(kills)/count(*) as kills, sum(deaths)/count(*) as deaths, sum(assists)/count(*) as assists, (sum(kills)+sum(assists))/sum(deaths) as kda, (sum(kills)/sum(deaths)) as kd

var heroes = {}
fs.readFile('hero_nodes.csv', function(err, data) {
  lines = data.toString("ascii").split("\n");
  console.log("lines: " + lines.length);
  _.each(lines, function(line) {
    var pieces = line.split(",");

    var entry = {heroId: parseInt(pieces[0]), heroName: pieces[1], picks: parseInt(pieces[2]), gpm: parseFloat(pieces[3]), kills: parseFloat(pieces[4]), deaths: parseFloat(pieces[5]), assists: parseFloat(pieces[6]), kda: parseFloat(pieces[7]), kd:parseFloat(pieces[8]), pickedWith:{}, pickedAgainst:{}, wonWith: {}};
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
    
    // now we get to the fun part. how much graph functionality do we need here?
    // to start with, we want to link heroIds to lists of other heroIds they
    // have been picked with. data structure for that will be a dict:
    // key is heroId
    // contains a dict that has {sameTeam:{heroId->number of coOccurences}}
    // we'll add in other stuff later (like wins/losses, and enemies)
    _.each(matches, function(picks) {
      console.log("--------------------");
      
      console.log("picks: " + _.pluck(picks, "heroId"));
      
      _.each(picks, function(pick) {
        var heroToUpdate = heroes[pick.heroId];
        
        var teamIds = [];
        var startIndex;
        var stopIndex;
        if(pick.index < 5) {
          startIndex = 0;
          stopIndex = 5;
        } else {
          startIndex = 5;
          stopIndex = 10;
        }
        
        for(var i=startIndex; i<stopIndex; i++) {
          if(i==pick.index) continue;        
          teamIds.push(picks[i].heroId);
        }
        
        console.log("updating hero ("+pick.index+"): " + heroToUpdate.heroId + " with teammates: " + JSON.stringify(teamIds));
        
        _.each(teamIds, function(heroId) {
          if(!(heroId in heroToUpdate.pickedWith)) {
            heroToUpdate.pickedWith[heroId] = 0;
          } 
          
          heroToUpdate.pickedWith[heroId] = heroToUpdate.pickedWith[heroId]+1;
        });
        
        heroes[heroToUpdate.heroId] = heroToUpdate;
      });
    });

    console.log("==========================");
    console.log("=         SUMMARY        =");
    console.log("==========================");

    _.each(heroes, function(hero) {
      console.log("=======================");
      console.log("HERO: " + hero.heroName);
      console.log("-------  WITH  --------")
      
      var pickedWith = hero.pickedWith;
      
      // ugh, so pickedWith is an object, so it's not sortable. so convert.
      var picksList = _.map(pickedWith, function(picks, id) {
        return {heroId:id, picks:picks};
      });
      
      picksList = _.sortBy(picksList, "picks");
      
      for(var i=picksList.length-1; i>=0; i--) {
        var item = picksList[i];
        console.log(item.picks + "  " + heroes[item.heroId].heroName);
      }
      
    });
  });
});
