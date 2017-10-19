var ls2kNS = ls2kNS||{};

ls2kNS.HistoryTools = function(backendSheet) {
  "use strict";
  if(!backendSheet){
    throw "Invalid argument at SheetLayer construction";
  }
  
  var sl = new ls2kNS.SheetLayer(backendSheet);
  
  function PersonComboLookup(peopleCount,restaurantCount){
    var currentPeople = [];
    this.repeatCounter = {};
    this.addPair = function(prime1,prime2,recency){
      var product = prime1 * prime2;
      if(product in this){
        this.repeatCounter[product]++;
        this[product]+=recency;
      }
      else{
        this[product] = recency;
        this.repeatCounter[product] = 1;
      }
    };
    this.addPersonToCombos = function(person,recency){
      for(var i = 0;i<currentPeople.length;i++){
        this.addPair(person.primeId,currentPeople[i].primeId,recency);
      }
      currentPeople.push(person);
    };
    this.clearCurrentPeopleSet = function () {
      currentPeople = [];
    };
  }
  
  function buildPersonLookup(currentPlaces,people){
    var comboLookup = new PersonComboLookup(people.itemCount,currentPlaces.itemCount);
    var recencyFloor = 0;
    loopThroughHistory();
    return comboLookup;
    function addPersonFromHistoryToLookup(kPlace,person,recency){
      if(kPlace in currentPlaces){
        currentPlaces.addPersonToRestaurantSet(kPlace,person);
      }
      comboLookup.addPersonToCombos(person,recency);
    }
    function addPeopleFromHistoryToLookup(hPlace,recency){
      var kPlaceName = ls2kNS.Utilities.makeStrKeySafe(hPlace.placeName);
      recency -= recencyFloor;
      
      while(hPlace.hasNext()){
        var kPersonName = ls2kNS.Utilities.makeStrKeySafe(hPlace.next());
        if(kPersonName&&kPersonName in people){var person = people[kPersonName];}
        else{continue;}
        addPersonFromHistoryToLookup(kPlaceName,person,recency);
        person.addRestaurantRecencyScore(kPlaceName,recency);
      }
      comboLookup.clearCurrentPeopleSet();
      return true;
    }
    function processHistoryCluster(historyCluster){
      var placeIter = new historyCluster.PlaceIterator();
      while(placeIter.hasNext()){
        var hPlace = placeIter.next();
        addPeopleFromHistoryToLookup(hPlace,historyCluster.recencyScore);
      }
    }
    function loopThroughHistory(){
      var historyScanner = new sl.HistoryScanner();
      var historyCluster = historyScanner.scanNext();
      if(historyCluster){
        recencyFloor = historyCluster.recencyScore > currentPlaces.itemCount?
          historyCluster.recencyScore - currentPlaces.itemCount:-(currentPlaces.itemCount -historyCluster.recencyScore);
        processHistoryCluster(historyCluster);
      }
      for(var i = 1;i < currentPlaces.itemCount&&historyScanner.hasNext();i++){
        historyCluster = historyScanner.scanNext();
        processHistoryCluster(historyCluster);
      }
    }
  }
  
  return {PersonComboLookup:PersonComboLookup,
          buildPersonLookup:buildPersonLookup};
  
}
