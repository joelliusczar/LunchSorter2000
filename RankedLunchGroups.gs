function RankedLunchGroupTools() {
  var lg = this;
  var ut = new Utilities();
  var notPrinted = true;
  
  lg.RankedLunchGroup = function(place,combos,idealGroupSize){
    var self = this;
    self.keys = [];
    self.itemCount = 0;
    self.associatedPlace = place;
    self.getIterator = ut.iteratorBuilder(self);
    function _makeCombo(person1,person2){
      
      return person1.primeId * person2.primeId;
    }
    function _getPersonByIndex(index){
      return self[self.keys[index]];
    };
    self.addPerson = function(person){
      self.keys.push(person.keyId);
      self.itemCount++;
      self[person.keyId] = person;
    };
    self.getPenaltyForPerson = function(person){
      var penalty = 0;
      var iter = self.getIterator();
      while(iter.hasNext()){
        var nextPerson = iter.next();
        if(_makeCombo(nextPerson,person) in combos){
          var pairRecency = combos[_makeCombo(nextPerson,person)];
          penalty+=(pairRecency*idealGroupSize);
        }
      }
      return penalty;
    };
  }
  
  function LuchPlaceOptimalityScore(key,penalty){
    this.placeKey = key;
    this.penalty = penalty;
  }
  
  lg.RankedLunchGroupHashCollection = function(comboLookup,currentPlaces,idealGroupSize){
    var self = this;
    self.itemCount = 0;
    self.maxGroupSize = 0;
    self.keys = [];
    self.addNewLunchGroup = _addNewLunchGroup;
    self.loadPlaces = _loadPlaces;
    self.getIterator = ut.iteratorBuilder(self);
    if(currentPlaces){
      _loadPlaces(currentPlaces);
    }
    function _loadPlaces(placesHashCollection){
      var iter = placesHashCollection.getIterator();
      while(iter.hasNext()){
        _addNewLunchGroup(iter.next());
      }
    }
    function _addNewLunchGroup(place){
      if(!(place.keyId in self)){
        self[place.keyId] = new lg.RankedLunchGroup(place,comboLookup,idealGroupSize);
        self.itemCount++;
        self.keys.push(place.keyId);
        return true;
      }
      return false;
    }    
    self.addPersonToGroup = function(kPlace,person){
      if(kPlace in self){
        self[kPlace].addPerson(person);
        self.maxGroupSize = Math.max(self.maxGroupSize,self[kPlace].itemCount);
        return true;
      }
      else{
        return handleErrors("error when adding a person to restaurant history",1);
      }
    };
    self.getGroupByPlaceKey = function(kPlaceName){
      if(kPlaceName in self){return self[kPlaceName];}
      else{return null;}
    };    
  }
  
  lg.PlaceRanker = function(people,lunchGroupsCollection,idealGroupSize){
    var self = this;
    self.optimalPlaceForPerson = null;
    function _getRestaurantInitialPenalty(place,person){
      var historyDepth = lunchGroupsCollection.itemCount;

      var initialPenalty = place.isPersonInRestaurantSet(person.keyId)?people.itemCount:0;
      var recency = person.getRecencyScoreForRestaurant(place.keyId);
      initialPenalty *= (recency*idealGroupSize);
      return initialPenalty;
    }
    self.rankPersonForPlace = function(person,place){
      
      var basePenalty = _getRestaurantInitialPenalty(place,person);
      var group = lunchGroupsCollection.getGroupByPlaceKey(place.keyId);
      var penalty = basePenalty + group.getPenaltyForPerson(person);
      penalty += group.itemCount;
      //delete? var idealGroupSize = (people.itemCount/lunchGroupsCollection.itemCount)>>>0;
      //delete? penalty += (group.itemCount >idealGroupSize?);
      Logger.log(person.fullName +"'s penalty at " + place.placeName + " is " + penalty);
      if(!self.optimalPlaceForPerson||penalty<self.optimalPlaceForPerson.penalty){
        self.optimalPlaceForPerson = new LuchPlaceOptimalityScore(place.keyId,penalty);
      }
    };
  };
  
  lg.buildOptimalLunchGroups = function(people,currentPlaces,comboLookup){
    var peopleIter = people.getIterator();
    var idealGroupSize = (people.itemCount/currentPlaces.itemCount)>>>0;
    var lunchGroupsCollection = new lg.RankedLunchGroupHashCollection(comboLookup,currentPlaces,idealGroupSize);
    while(peopleIter.hasNext()){
      var person = peopleIter.next();
      var placeIter = currentPlaces.getIterator();
      var ranker = new lg.PlaceRanker(people,lunchGroupsCollection,idealGroupSize);
      while(placeIter.hasNext()){
        var place = placeIter.next();
        ranker.rankPersonForPlace(person,place);
      }
      if(lunchGroupsCollection.itemCount < 1){
        handleErrors("No restaurants in the mix",errorCodes.USER_ERROR);
        return null;
      }
      lunchGroupsCollection.addPersonToGroup(ranker.optimalPlaceForPerson.placeKey,person);
    }
    return lunchGroupsCollection;
  };
  
  lg.tranformOptimalLunchGroupToTable = function(optimalLunchGroups){
    var groupIter = optimalLunchGroups.getIterator();
    var tbl = [];
    if(groupIter.hasNext()){
      var group = groupIter.next();
      tbl.push([group.associatedPlace.placeName]);
      var personIter = group.getIterator();
      var rowIndex = 1;
      while(rowIndex <= optimalLunchGroups.maxGroupSize){
        rowIndex++;
        if(personIter.hasNext()){
          var person = personIter.next();
          tbl.push([person.fullName]);
        }
        else{
          tbl.push([""]);
        }
      }
    }
    else{return null;}
    
    while(groupIter.hasNext()){
      
      group = groupIter.next();
      tbl[0].push(group.associatedPlace.placeName);
      personIter = group.getIterator();
      rowIndex = 1;
      while(rowIndex <= optimalLunchGroups.maxGroupSize){
        if(personIter.hasNext()){
          var person = personIter.next();
          tbl[rowIndex].push(person.fullName);
        }
        else{
          tbl[rowIndex].push("");
        }
        rowIndex++;
      }
    }
    return tbl;
  };
  
  

}
