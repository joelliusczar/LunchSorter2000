var ls2kNS = ls2kNS||{}; 

ls2kNS.PersonTools = function(){
  "use strict";
  function Person(kName,prime,fullName,gender){
    this.keyId = kName;
    this.primeId = prime;
    this.fullName = fullName;
    this.sGender = gender==="m"||gender==="f"?gender:"0";
  }
  
  Person.prototype.addRestaurantRecencyScore = function(kPlace,recencyScore){
    this[kPlace] = recencyScore;
  };
  
  Person.prototype.getRecencyScoreForRestaurant = function(kPlace){
    if(kPlace in this){return this[kPlace];}
    else{return 0;}
  };
  
  function PersonDuplicationCheck(){
    this.nameDuplFilter = {};
    this.primeDuplFilter = {};
  }
  PersonDuplicationCheck.prototype.areValuesEmptyOrDuplicated = function(kName,prime){
    if(!kName||!prime){return true;}
    if(kName in this.nameDuplFilter || prime in this.primeDuplFilter){return true;}
    else{
      this.nameDuplFilter[kName] = 1;
      this.primeDuplFilter[prime] = 1;
    }
  };
  
  function PeopleHashCollection(){
    var duplicationChecker = new PersonDuplicationCheck();
    var primeGenerator = ls2kNS.Utilities.PrimeNumbersGenerator();
    this.itemCount = 0;
    this.maxPrimeId = 0;
    this.keys = new PersonClassifyingSequential();
    this.add = function(fullName,gender){
      var kName = ls2kNS.Utilities.makeStrKeySafe(fullName);
      if(!kName){
        return "";
      }
      var prime = primeGenerator.getNextPrime();
      if(duplicationChecker.areValuesEmptyOrDuplicated(kName,prime)){
        return null;
      }
      const p = new Person(kName,prime,fullName,gender);
      this[kName] = p;
      this.keys.addPersonKeyAndClassification(kName,p.sGender);
      this.maxPrimeId = Math.max(this.maxPrimeId,prime);
      this.itemCount++;
      return kName;
    };
    this.getIterator = function(){
      return new (function(owner){
        var classificationIter = new PersonClassifyingIterator(owner.keys);
        this.next = function(){
          return owner[classificationIter.nextKey()];
        };
        this.hasNext = function(){
          return classificationIter.hasNextKey();
        };
        this.reset = function(){
          classificationIter.reset();
        }
      })(this);
    }
  }
  
  function PersonClassifyingSequential(){
    this.itemCount = 0;
    this.classificationKeys = [];
    this.addPersonKeyAndClassification = addPersonKeyAndClassification;
    function addPersonKeyAndClassification(kName,classification){
      if(classification in this){
        this[classification].push(kName);
      }
      else{
        this[classification] = ls2kNS.Utilities.Sequential();
        this[classification].push(kName);
        this.classificationKeys.push(classification);
      }
      this.itemCount++;
    }
    this.forEachClassification = function(forAction){
      this.classificationKeys.forEach(function(item,i){
        forAction(item,i,this);
      }.bind(this));
    };
  }
  
  function PersonClassifyingIterator(owner){
    var keyIndex = 0;
    this.hasNextKey = function(){
      for(var i = 0;i<owner.classificationKeys.length;i++){
        if(owner[owner.classificationKeys[i]].hasNext()){
          return true
        }
      }
      return false;
    }
    this.nextKey = function(){
      for(var i = 0;i<owner.classificationKeys.length;i++){
        if(owner[owner.classificationKeys[keyIndex]].hasNext()){
          var kPerson = owner[owner.classificationKeys[keyIndex]].next();
          keyIndex = (keyIndex + 1)%owner.classificationKeys.length;
          return kPerson;          
        }
        keyIndex = (keyIndex + 1)%owner.classificationKeys.length;
      }
      throw "No more items in this container";
    }
    this.reset= function(){
      keyIndex = 0;
      for(var i = 0;i<owner.classificationKeys.length;i++){
        owner[owner.classificationKeys[i]].reset();
      }
    }
  }
  
  
  return {PeopleHashCollection: PeopleHashCollection};
  
};
