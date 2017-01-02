function PersonTools() {
  var pt = this;
  var ut = new Utilities();
  
  function Person(kName,prime,fullName){
    this.keyId = kName;
    this.primeId = prime;
    this.fullName = fullName;
    this.addRestaurantRecencyScore = function(kPlace,recencyScore){
      this[kPlace] = recencyScore;
    };
    this.getRecencyScoreForRestaurant = function(kPlace){
      if(kPlace in this){return this[kPlace];}
      else{return 0;}
    };
  }
  
  function PersonDuplicationCheck(){
    var nameDuplFilter = {};
    var primeDuplFilter = {};
    this.areValuesEmptyOrDuplicated = function(kName,prime){
      if(!kName||!prime){return true;}
      if(kName in nameDuplFilter || prime in primeDuplFilter){return true;}
      else{
        nameDuplFilter[kName] = 1;
        primeDuplFilter[prime] = 1;
      }
      
    }
  }
  
  pt.PeopleHashCollection = function(){
    var self = this;
    var duplicationChecker = new PersonDuplicationCheck();
    var primeGenerator = new ut.PrimeNumbersGenerator();
    self.itemCount = 0;
    self.maxPrimeId = 0;
    self.keys = [];
    self.add = function(fullName){
      var kName = ut.makeStrKeySafe(fullName);
      if(!kName){
        return "";
      }
      var prime = primeGenerator.getNextPrime();
      if(duplicationChecker.areValuesEmptyOrDuplicated(kName,prime)){
        handleErrors("data corruption in scanPastPersons"+kName + " " + prime,1);
        return null;
      }
      self[kName] = new Person(kName,prime,fullName);
      self.keys.push(kName);
      self.maxPrimeId = Math.max(self.maxPrimeId,prime);
      self.itemCount++;
      return kName;
    };
    self.getIterator = ut.iteratorBuilder(self);
  }
  
  
  
}
