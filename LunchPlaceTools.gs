var ls2kNS = ls2kNS||{};

ls2kNS.LunchPlaceTools = function(){
  "use strict";
  function LunchPlaceHashCollection(){
    this.itemCount = 0;
    this.keys = [];
    this.add = function(place){
      var kPlace = ls2kNS.Utilities.makeStrKeySafe(place);
      if(!(kPlace in this)){
        this[kPlace] = new IndividualRestaurantPersonSet(kPlace,place);
        this.keys.push(kPlace);
        this.itemCount++;
        return true;
      }
      return false;
    };
    this.addPersonToRestaurantSet = function(kPlaceName,person){
      if(kPlaceName in this){
        return this[kPlaceName].addPerson(person);
      }
      else{
        throw "error when adding a person to restaurant history";
      }
    };
    this.getIterator = ls2kNS.Utilities.iteratorBuilder(this);
    }
  
  IndividualRestaurantPersonSet = function(kPlace,placeName){
    this.keyId = kPlace;
    this.placeName = placeName;
    this.addPerson = function(person){
      this[person.keyId] = person;
      return true;
    };
    this.isPersonInRestaurantSet = function(kPerson){
      return (kPerson in this);
    };
  }
  
  return {
    LunchPlaceHashCollection: LunchPlaceHashCollection,
    IndividualRestaurantPersonSet: IndividualRestaurantPersonSet
  };
}




