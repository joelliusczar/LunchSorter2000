var ls2kNS = ls2kNS||{};

ls2kNS.Utilities = {
  isPrime: function(num){
    if(num < 0){throw "Positive numbers only";}
    if(num === 2 || num === 3){return true;}
    if(num % 2 === 0){return false;}
    var limit = num *num;
    for(var i = 3;(i*i) < limit;i+= 2){
      if(num % i === 0){return false;}
    }
    return true;
  },
  PrimeNumbersGenerator: function(startValue){
    return new (function(startValue){
      var i = (startValue||1);
      this.getNextPrime = function(){
        while(true){
          if(i < 2){
            i = 2;
            return i;
          }
          if(i %2 === 0){i++;}
          else{i += 2;}
          if(ls2kNS.Utilities.isPrime(i)){
            return i;
          }
          continue;
        }
      };
    })(startValue)
  },
  trimFrontNumbers: function(str){
    str = str?str:"";
    return str.replace(/^[0-9\.]+/,"");
  },
  makeStrKeySafe: function(str){
    var frontnumbersTrimed = ls2kNS.Utilities.trimFrontNumbers(str);
    var regexedStr = frontnumbersTrimed.replace(/[^A-Za-z0-9]/gi,'');
    return regexedStr.toLowerCase();
  },
  iteratorBuilder: function(owner){
    return function(){
      return ls2kNS.Utilities.Iterator(owner);
    };
  },
  Iterator: function(owner){
    return new (function(owner){  
      this.hasNext = function(){
        return keyIndex < owner.keys.length;
      };
      this.next = function(){
        if(!this.hasNext()){
          throw "No more elements in this sequential container";
        }
        var returnKey = owner.keys[keyIndex];
        keyIndex++;
        
        return owner[returnKey];
      };
      this.reset = function(){
        keyIndex = 0;
      }
      var keyIndex = 0;
    })(owner);
  },
  Sequential: function(){
    return new (function(){
      var keyIndex = 0;
      this.itemCount = 0;
      this.keys = [];
      this.push = function(item){
        this.keys.push(item);
        this.itemCount++;
      };
      this.hasNext = function(){
        return keyIndex < this.keys.length;
      };
      this.next = function(){
        if(!this.hasNext()){
          throw "No more elements in this sequential container";
        }
        var returnKey = this.keys[keyIndex];
        keyIndex++; 
        return returnKey;
      };
      this.reset = function(){
        keyIndex = 0;
      };
    })();
  },
  buildArray: function(size,defaultValue){
    var a = [];
    for(var i = 0;i<size;i++){
      a.push(defaultValue);
    }
    return a;
  },
  randomizeArray: function(scrambled,strength){
    if(!strength){
      strength = 1;;
    }
    for(var i = 0;i<strength;i++){
      for(var j = 0;j<scrambled.length;j++){
        var randIndex = ((Math.random()*(scrambled.length -1))>>>0);
        ls2kNS.Utilities.swapInArray(scrambled,j,randIndex);
      }
    }
  },
  swapInArray: function(swapArray,index1,index2){
    var tmp = swapArray[index1];
    swapArray[index1] = swapArray[index2];
    swapArray[index2] = tmp;
  },
  getSpreadsheetBackend: function(){
    const settings = PropertiesService.getUserProperties();
    return ls2kNS.Utilities.getSpreadsheet(ls2kNS.configKeys.SHEET_ID,ls2kNS.configKeys.SHEET_NAME,settings);
  },
  getSpreadsheet: function(sheetIdKey,sheetNameKey,propertyDict){
    var userLock = LockService.getUserLock();
    userLock.waitLock(10000);
    var sheetId = propertyDict.getProperty(sheetIdKey);
    if(!sheetId){
      var backendSpreadsheet = ls2kNS.Utilities.createSpreadsheet(sheetIdKey,sheetNameKey,propertyDict);
    }
    else{
      try{
        var backendSpreadsheet = SpreadsheetApp.openById(sheetId);
      }
      catch(err){
        propertyDict.deleteProperty(sheetIdKey);
        ls2kNS.Utilities.createSpreadsheet(sheetIdKey,sheetNameKey,propertyDict);
        Logger.log("About to throw");
        userLock.releaseLock();
        throw new ls2kNS.Utilities.BadSpreadsheetError("Spreadsheet was deleted somehow.");
      }
    }
    userLock.releaseLock();
    return backendSpreadsheet;
  },
  createSpreadsheet: function(sheetIdKey,sheetNameKey,propertyDict){
    var backendSpreadsheet = SpreadsheetApp.create(sheetNameKey);
    var sheetId = backendSpreadsheet.getId();
    propertyDict.setProperty(sheetIdKey, sheetId);
    return backendSpreadsheet
  },
  getIncrementedA1Range: function(a1Range,topSteps,buttomSteps,frontSteps,backSteps){
    const rangeInfo = ls2kNS.Utilities.getA1RangeInfo(a1Range);
    var firstCol = frontSteps?ls2kNS.Utilities.convertToCol(ls2kNS.Utilities.convertToNum(rangeInfo.firstCol) + frontSteps):rangeInfo.firstCol;
    var lastCol = backSteps?ls2kNS.Utilities.convertToCol(ls2kNS.Utilities.convertToNum(rangeInfo.lastCol) + backSteps):rangeInfo.lastCol;
    var firstRow = topSteps?topSteps + rangeInfo.firstRow:rangeInfo.firstRow;
    var lastRow = buttomSteps?buttomSteps + rangeInfo.lastRow: rangeInfo.lastRow;
    
    return firstCol+firstRow+":"+lastCol+lastRow; 
  },
  getA1RangeInfo: function(a1Range){
    const rgx = /([A-Za-z]+)(\d+):([A-Za-z]+)(\d+)/;
    var matches = a1Range.match(rgx);
    if(matches){
      return {"firstCol":matches[1],"firstRow":matches[2]*1,"lastCol":matches[3],"lastRow":matches[4]*1};
    }
    else{
      return null;
    }
  },
  convertToCol: function(num) {
    if (num < 1) throw new Error("num is less than 1: " + num);
    const keyCodeLB = 65;
    const base = 26;
    output = [];
    while (num) {
      var m = ((num-1) % base);
      num -= m;
      num = (num / base) >>> 0;
      output.push(String.fromCharCode(keyCodeLB + m));
    }
    return output.reverse().join("");
  },
  convertToNum: function(A1){
    var sum = 0;
    const base = 26;
    const keyCodeLB = 65;
    for(var i = 0;i<A1.length;i++){
      var pow = A1.length - i - 1;
  	  var charValue = Math.pow(base,pow)*(A1.charCodeAt(i)-keyCodeLB +1); 
      sum += charValue;
    }
    return sum;
  },
  logErrors: function(errorInfo){
    Logger.log(errorInfo);
    ls2kNS.Utilities.logToErrorSheet(errorInfo);
  },
  emailError: function(errorInfo){
    //I don't want to invoke the permissions for this right now 
    //if(MailApp.getRemainingDailyQuota() > 0){
    //  MailApp.sendEmail("", "Hello, Exception!", errorInfo);
    //}
  },
  logToErrorSheet: function(errorInfo){
    const settings = PropertiesService.getScriptProperties();
    var scriptLock = LockService.getScriptLock();
    scriptLock.waitLock(10000);
    errorSpreadsheet = ls2kNS.Utilities.getSpreadsheet(ls2kNS.configKeys.ERROR_SHEET_ID,ls2kNS.configKeys.ERROR_SHEET,settings);
    scriptLock.releaseLock();
    const errorSheet = errorSpreadsheet.getSheets()[0];
    var lastRow = errorSheet.getLastRow() > 0?errorSheet.getLastRow()+1: 1;
    var logRange = errorSheet.getRange(lastRow, 1,1,2);
    logRange.getCell(1,1).setValue(errorInfo);
    logRange.getCell(1,2).setValue(ls2kNS.Utilities.convertToDateString(Date.now()));
    
  },
  nonShittyLogger: function(message){
    const settings = PropertiesService.getScriptProperties();
    var scriptLock = LockService.getScriptLock();
    scriptLock.waitLock(10000);
    errorSpreadsheet = ls2kNS.Utilities.getSpreadsheet("fuckingLogging","stupidLogging",settings);
    scriptLock.releaseLock();
    const errorSheet = errorSpreadsheet.getSheets()[0];
    var lastRow = errorSheet.getLastRow() > 0?errorSheet.getLastRow()+1: 1;
    var logRange = errorSheet.getRange(lastRow, 1,1,2);
    logRange.getCell(1,1).setValue(message);
    logRange.getCell(1,2).setValue(ls2kNS.Utilities.convertToDateString(Date.now()));
  },
  BadSpreadsheetError: function(message){
    this.name = "BadSpreadsheet";
    this.message = message;
    this.stack = (new Error()).stack;
  },
  convertToDateString: function(msSince1970UTC){
    const d = new Date();
    d.setTime(msSince1970UTC);
    const dateOptions = {hour:"2-digit",minute:"2-digit",timeZoneName:"short"};
    return d.toLocaleDateString("en-US",dateOptions);
  },
  wrapCall: function(wrapped){
    return {"callWrapped": function(){
      try{
        return wrapped.apply(this,arguments);
      }
      catch(e){
        if(e instanceof ls2kNS.Utilities.BadSpreadsheetError){
          return {"returnCode":7};
        }
        var argsStr = "";
        for(var i = 0;arguments&&i<arguments.length;i++){
          argsStr += ","+arguments[i];
        }
        var errorInfo = "arguments: "+ argsStr +"\n" + e + "\n" + e.stack;
        ls2kNS.Utilities.logErrors(errorInfo);
        throw new Error(errorInfo);
      }
    }};
  }
};
