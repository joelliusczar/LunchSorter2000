function Utilities(){
  var ut = this;
  
  function isPrime(num){
    if(num < 0){throw "Positive numbers only";}
    if(num === 2 || num === 3){return true;}
    if(num % 2 === 0){return false;}
    var limit = num *num;
    for(var i = 3;(i*i) < limit;i+= 2){
      if(num % i === 0){return false;}
    }
    return true;
  }
  
  ut.PrimeNumbersGenerator = function(startValue){
    
    var i = (startValue||1);
    
    this.getNextPrime = function(){
      
      while(true){
        if(i < 2){
          i = 2;
          return i;
        }
        if(i %2 === 0){i++;}
        else{i += 2;}
        if(isPrime(i)){
          return i;
        }
        continue;
      }
    };
  };
  
  function trimFrontNumbers(str){
    str = str?str:"";
    return str.replace(/^[0-9\.]+/,"");
  }
  
  ut.makeStrKeySafe = function(str){
    var frontnumbersTrimed = trimFrontNumbers(str);
    var regexedStr = frontnumbersTrimed.replace(/[^A-Za-z0-9]/gi,'');
    return regexedStr.toLowerCase();
  };
  
  ut.iteratorBuilder = function(owner){
    return function(){
      return new (function(){
        var iterSelf = this;
        var keyIndex = 0;
        iterSelf.next = function(){
          var returnKey = owner.keys[keyIndex];
          keyIndex++;
          return owner[returnKey];
        };
        iterSelf.hasNext = function(){
          return keyIndex < owner.keys.length;
        };
        iterSelf.reset = function(){
          keyIndex = 0;
        }
      })();
    };
  };
  
  ut.buildArray = function(size,defaultValue){
    var a = [];
    for(var i = 0;i<size;i++){
      a.push(defaultValue);
    }
    return a;
  };
  

}

