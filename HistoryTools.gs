function HistoryTools() {
  
  var ht = this;
  var sl = new SheetLayer();
  var ut = new Utilities();
  
  ht.PersonComboLookup = function(peopleCount,restaurantCount){
    var self = this;
    var currentPeople = [];
    self.addPair = function(prime1,prime2,recency){
      var product = prime1 * prime2;
      if(product in self){self[product]+=recency;}
      else{self[prime1 * prime2] = recency;}
      
    };
    self.addPersonToCombos = function(person,recency){
      for(var i = 0;i<currentPeople.length;i++){
        self.addPair(person.primeId,currentPeople[i].primeId,recency);
      }
      currentPeople.push(person);
    };
    self.clearCurrentPeopleSet = function () {
        currentPeople = [];
      };
  };
  
  ht.buildPersonLookup = function(currentPlaces,people){
    var comboLookup = new ht.PersonComboLookup(people.itemCount,currentPlaces.itemCount);
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
      var kPlaceName = ut.makeStrKeySafe(hPlace.placeName);
      recency -= recencyFloor;
      while(hPlace.hasNext()){
        var kPersonName = ut.makeStrKeySafe(hPlace.next());
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
        recencyFloor = historyCluster.recencyScore > currentPlaces.itemCount?historyCluster.recencyScore - currentPlaces.itemCount:0;
        processHistoryCluster(historyCluster);
      }
      for(var i = 1;i < currentPlaces.itemCount&&historyScanner.hasNext();i++){
        historyCluster = historyScanner.scanNext();
        processHistoryCluster(historyCluster);
      }
    }
  };
  
}
