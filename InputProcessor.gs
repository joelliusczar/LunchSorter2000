var ls2kNS = ls2kNS||{};

ls2kNS.InputProcessor = function(){
  "use strict";
  function CurrentPeopleAndPlacesTracker(){
    var lp = ls2kNS.LunchPlaceTools();
    var pt = ls2kNS.PersonTools();
    this.people = new pt.PeopleHashCollection();
    this.restaurantHashMap = new lp.LunchPlaceHashCollection();
    this.cellsWithDuplicateData = [];
    this.hasDuplicates = false;
    this.scanSinglePersonCell = function(person){
      if(!person){
        return;
      }
      if(!ls2kNS.Utilities.makeStrKeySafe(person.name)){return;}
      if(!this.people.add(person.name,person.gender)){
        this.cellsWithDuplicateData.push(person.elementId);
        this.hasDuplicates = true;
      }
    };
    this.scanSinglePlaceCell = function(place){
      if(!place){
        return;
      }
      if(!ls2kNS.Utilities.makeStrKeySafe(place.name)){return;}
      if(!this.restaurantHashMap.add(place.name)){
        this.cellsWithDuplicateData.push(place.elementId);
        this.hasDuplicates = true;
      }
    };
  }
  
  function checkForDuplicatesInSelectionAndAssignPrimesToPeople(inputCollection){
    var tracker = new CurrentPeopleAndPlacesTracker();
    while(inputCollection.hasNextPerson()||inputCollection.hasNextPlace()){
      tracker.scanSinglePersonCell(inputCollection.nextPerson());
      tracker.scanSinglePlaceCell(inputCollection.nextPlace());
    }
    return tracker;
  }
  
  function InputCollection(inputs){
    var persons = inputs.persons;
    var places = inputs.places;
    this.personIndex = 0;
    this.placeIndex = 0;
    this.hasNextPerson = function(){
      return this.personIndex < persons.length;
    }
    this.hasNextPlace = function(){
      return this.placeIndex < places.length;
    }
    this.nextPerson = function(){
      return this.hasNextPerson()?persons[this.personIndex++]:null;
    }
    this.nextPlace = function(){
      return this.hasNextPlace()?places[this.placeIndex++]:null;
    }
  }
  
  return {checkForDuplicatesInSelectionAndAssignPrimesToPeople:checkForDuplicatesInSelectionAndAssignPrimesToPeople,
          InputCollection:InputCollection};
};



