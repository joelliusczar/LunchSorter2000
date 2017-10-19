var ls2kNS = ls2kNS||{};

ls2kNS.RankedLunchGroupTools = function() {
  "use strict";
  var notPrinted = true;
  function RankedLunchGroup(place,combos,idealGroupSize){
    var genders = {};
    this.keys = [];
    this.itemCount = 0;
    this.associatedPlace = place;
    this.getIterator = ls2kNS.Utilities.iteratorBuilder(this);
    function makeCombo(person1,person2){
      
      return person1.primeId * person2.primeId;
    }
    function getPersonByIndex(index){
      return this[this.keys[index]];
    }
    function getGenderWeight(sGender){
      //return (genders[sGender]*(genders[sGender] +1)); //n*(n+1) This was causing groups to be skeward 
      return genders[sGender] +1;
    }
    this.addPerson = function(person){
      this.keys.push(person.keyId);
      this.itemCount++;
      if(person.sGender in genders){
        genders[person.sGender] = getGenderWeight(person.sGender);
      }
      else{
        genders[person.sGender] = 1;
      }
      this[person.keyId] = person;
    };
    this.getPenaltyForPerson = function(person){
      var penalty = 0;
      var iter = this.getIterator();
      while(iter.hasNext()){
        var nextPerson = iter.next();
        var combo = makeCombo(nextPerson,person)
        if(combo in combos){
          var pairRecency = combos[combo];
          pairRecency *= combos.repeatCounter[combo];
          penalty+=(pairRecency*idealGroupSize);
        }
      }
      if(person.sGender in genders){
        penalty += genders[person.sGender];
      }
      return penalty;
    };
  }
  
  function LuchPlaceOptimalityScore(key,penalty){
    this.placeKey = key;
    this.penalty = penalty;
  }
  
  function RankedLunchGroupHashCollection(comboLookup,currentPlaces,idealGroupSize){
    this.loadPlaces = function(placesHashCollection){
      var iter = placesHashCollection.getIterator();
      while(iter.hasNext()){
        this.addNewLunchGroup(iter.next());
      }
    }
    this.addNewLunchGroup = function(place){
      if(!(place.keyId in this)){
        this[place.keyId] = new RankedLunchGroup(place,comboLookup,idealGroupSize);
        this.itemCount++;
        this.keys.push(place.keyId);
        return true;
      }
      return false;
    }    
    this.addPersonToGroup = function(kPlace,person){
      if(kPlace in this){
        this[kPlace].addPerson(person);
        this.maxGroupSize = Math.max(this.maxGroupSize,this[kPlace].itemCount);
        return true;
      }
      else{
        throw "error when adding a person to restaurant history";
      }
    };
    this.getGroupByPlaceKey = function(kPlaceName){
      if(kPlaceName in this){return this[kPlaceName];}
      else{return null;}
    };
    this.itemCount = 0;
    this.maxGroupSize = 0;
    this.keys = [];
    this.getIterator = ls2kNS.Utilities.iteratorBuilder(this);
    if(currentPlaces){
      this.loadPlaces(currentPlaces);
    }    
  }
  
  function PlaceRanker(people,lunchGroupsCollection,idealGroupSize){   
    function getRestaurantInitialPenalty(place,person){
      var initialPenalty = place.isPersonInRestaurantSet(person.keyId)?people.itemCount:0;
      var recency = person.getRecencyScoreForRestaurant(place.keyId);
      initialPenalty *= (recency*idealGroupSize);
      return initialPenalty;
    }
    this.rankPersonForPlace = function(person,place){     
      var basePenalty = getRestaurantInitialPenalty(place,person);
      var group = lunchGroupsCollection.getGroupByPlaceKey(place.keyId);
      var penalty =  group.getPenaltyForPerson(person) + basePenalty;
      penalty += group.itemCount;
      penalty += (group.itemCount>=idealGroupSize?lunchGroupsCollection.itemCount*idealGroupSize:0);
      if(!this.optimalPlaceForPerson||penalty<this.optimalPlaceForPerson.penalty){
        this.optimalPlaceForPerson = new LuchPlaceOptimalityScore(place.keyId,penalty);
      }
    };
    this.optimalPlaceForPerson = null;
  }
  
  function buildOptimalLunchGroups(people,currentPlaces,comboLookup){
    var peopleIter = people.getIterator();
    var idealGroupSize = (people.itemCount/currentPlaces.itemCount)>>>0;
    var lunchGroupsCollection = new RankedLunchGroupHashCollection(comboLookup,currentPlaces,idealGroupSize);
    while(peopleIter.hasNext()){
      var person = peopleIter.next();
      var placeIter = currentPlaces.getIterator();
      var ranker = new PlaceRanker(people,lunchGroupsCollection,idealGroupSize);
      while(placeIter.hasNext()){
        var place = placeIter.next();
        ranker.rankPersonForPlace(person,place);
      }
      if(lunchGroupsCollection.itemCount < 1){
        return null;
      }
      lunchGroupsCollection.addPersonToGroup(ranker.optimalPlaceForPerson.placeKey,person);
    }
    return lunchGroupsCollection;
  }
  
  function tranformOptimalLunchGroupToTable(optimalLunchGroups){
    var groupIter = optimalLunchGroups.getIterator();
    var tbl = [];
    //build the column for the first restaurant
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
    else{//no people or restaurants
      return null;
    } 
    
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
  }
  
  return {tranformOptimalLunchGroupToTable:tranformOptimalLunchGroupToTable,
          buildOptimalLunchGroups:buildOptimalLunchGroups
  };

}
