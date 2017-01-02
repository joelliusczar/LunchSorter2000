function LunchPlaceTools() {
  var lp = this;
  var ut = new Utilities();
  
  lp.LunchPlaceHashCollection = function(){
    var self = this;
    self.itemCount = 0;
    self.keys = [];
    self.add = function(place){
      var kPlace = ut.makeStrKeySafe(place);
      if(!(kPlace in self)){
        self[kPlace] = new lp.IndividualRestaurantPersonSet(kPlace,place);
        self.keys.push(kPlace);
        self.itemCount++;
        return true;
      }
      return false;
    };
    self.addPersonToRestaurantSet = function(kPlaceName,person){
      if(kPlaceName in self){
        return self[kPlaceName].addPerson(person);
      }
      else{
        return handleErrors("error when adding a person to restaurant history",1);
      }
    };
    self.getIterator = ut.iteratorBuilder(self);
  }
  
  lp.IndividualRestaurantPersonSet = function(kPlace,placeName){
    var self = this;
    self.keyId = kPlace;
    self.placeName = placeName;
    self.addPerson = function(person){
      self[person.keyId] = person;
      return true;
    };
    self.isPersonInRestaurantSet = function(kPerson){
      return (kPerson in self);
    };
  }
  
}


