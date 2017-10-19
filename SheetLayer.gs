var ls2kNS = ls2kNS||{};

ls2kNS.sheetNames = {"INPUT":"input","STAGING":"Staging","HISTORY": "history",
                    "PREV_PEOPLE":"previous People","PREV_PLACES":"previous Places","HISTORY_REF":"history_ref",
                     "DEFAULT":"default","CUSTOM":"custom"};

ls2kNS.SheetLayer = function(backendSpreadsheet){
  "use strict";
  if(!backendSpreadsheet){
    throw "Invalid argument at SheetLayer construction";
  }
  
  const sheetNames = ls2kNS.sheetNames;
  
  
  function getSelectedUserRangeWithoutLabels(){
    const activeSheet = backendSpreadsheet.getSheets()[0];
    activeSheet.activate();
    var lastRowIndex = activeSheet.getLastRow();
    var inputRange = activeSheet.getRange(1, 1,lastRowIndex,2);
    return inputRange;
  }
  
  function outputResultsToStagingTable(optimalLunchGroupTbl){
    const stagingSheet = getDBSheetByNameOrCreateNew(sheetNames.STAGING);
    stagingSheet.clear();
    var tblHeight = optimalLunchGroupTbl.length;
    var tblWidth = optimalLunchGroupTbl[0].length;
    var outputRange = stagingSheet.getRange(1,1,tblHeight,tblWidth);
    outputRange.setValues(optimalLunchGroupTbl);
    var topRow = outputRange.offset(0,0,1);
  }
  
  function getDBSheetByNameOrCreateNew(sheetName){
    var userLock = LockService.getUserLock();
    userLock.tryLock(10000);
    var activeSS = backendSpreadsheet;
    var backendSheet = activeSS.getSheetByName(sheetName);

    if(!backendSheet){
      SpreadsheetApp.flush(); //this seems to correct a bug where google scripts thinks that a sheet still exists
      backendSheet = activeSS.insertSheet(sheetName);
    }
    userLock.releaseLock();
    return backendSheet;  
  }
  
  function padHistoryOutputTable(table){
    table.unshift(ls2kNS.Utilities.buildArray(table[0].length,""));
    table.push(ls2kNS.Utilities.buildArray(table[0].length,""));
  }
  
  function clearStagingSheet(){
    const stagingSheet = getDBSheetByNameOrCreateNew(sheetNames.STAGING);
    stagingSheet.clear();
  }
  
  function clearCustomStagingSheet(){
    const customSheet = getDBSheetByNameOrCreateNew(sheetNames.CUSTOM);
    customSheet.clear();
  }
  
  function clearInputSheet(){
    var inputSheet = getDBSheetByNameOrCreateNew(sheetNames.INPUT);
    inputSheet.clear();
  }
  
  function clearHistorySheet(){
    var historySheet = getDBSheetByNameOrCreateNew(sheetNames.HISTORY);
    historySheet.clear();
  }
  
  function addNewEntryToHistory(optimalLunchGroupTbl){
    if(!optimalLunchGroupTbl){
      throw "addNewEntryToHistory was passed noting"
    }
    const historySheet = getDBSheetByNameOrCreateNew(sheetNames.HISTORY);
    var firstRowInEntry = historySheet.getLastRow()>0?historySheet.getLastRow()+1:1;
    var tblWidth = optimalLunchGroupTbl[0].length;
    var tblHeight = optimalLunchGroupTbl.length;
    var entryRange = historySheet.getRange(firstRowInEntry,1,tblHeight,tblWidth);
    var nextA1Range = entryRange.getA1Notation();
    var currentDate = Date.now();
    addA1RangeToLookupColumn(nextA1Range,currentDate);
    entryRange.setValues(optimalLunchGroupTbl);
    return {"a1Range":nextA1Range,"currentDate":currentDate};
  }
  
  function addA1RangeToLookupColumn(A1Range,currentDate){
    const historyRefSheet = getDBSheetByNameOrCreateNew(sheetNames.HISTORY_REF);
    const cells = historyRefSheet.getRange(historyRefSheet.getLastRow()+1,1,1,2);
    cells.getCell(1,1).setValue(A1Range);
    cells.getCell(1,2).setValue(currentDate);
  }
  
  function addInputToInputSheet(userInput,index,sectionNum){
    index *= 1;
    sectionNum *= 1;
    const inputSheet = getDBSheetByNameOrCreateNew(sheetNames.INPUT);
    if(sectionNum === 2){//if was a gender input
      userInput = userInput==="m"||userInput==="f"?userInput:"0";
    }
    const inputRange = inputSheet.getRange(index,sectionNum,1,1);
    inputRange.getCell(1,1).setValue(userInput);
  }
  
  function updateOutputValue(userValue,row,col,lkRange){
    row *= 1;
    col *= 1;
    if(!lkRange||lkRange == "0"){
      const stagingSheet = getDBSheetByNameOrCreateNew(sheetNames.STAGING);
      stagingSheet.getRange(row,col,1,1).setValue(userValue);
    }
    else if(lkRange == "1"){
      const customSheet = getDBSheetByNameOrCreateNew(sheetNames.CUSTOM);
      customSheet.getRange(row,col,1,1).setValue(userValue);
    }
    else{
      const historySheet = getDBSheetByNameOrCreateNew(sheetNames.HISTORY);
      var range = historySheet.getRange(lkRange);
      if(col > range.getNumColumns()){
        var offsetRange = range.offset(0,0,range.getNumRows(),col);
        offsetRange.getCell(row,col).setValue(userValue);
      }
      else{
        range.getCell(row,col).setValue(userValue);
      }
    }
  }
  
  function doesStagingHaveData(){
    const stagingSheet = getDBSheetByNameOrCreateNew(sheetNames.STAGING);
    return stagingSheet.getLastRow() > 0;
  }
  
  function getStagingData(){
    const stagingSheet = getDBSheetByNameOrCreateNew(sheetNames.STAGING);
    if(!stagingSheet.getLastRow()||!stagingSheet.getLastColumn()){
      return null;
    }
    return stagingSheet.getSheetValues(1,1,stagingSheet.getLastRow(),stagingSheet.getLastColumn());
  }
  
  function getCustomStagingData(){
    const customSheet = getDBSheetByNameOrCreateNew(sheetNames.CUSTOM);
    if(!customSheet.getLastRow()||!customSheet.getLastColumn()){
      return [[""],[""]];
    }
    return customSheet.getSheetValues(1,1,customSheet.getLastRow(),customSheet.getLastColumn());
  }
  
  function getHistoryData(a1Range){
    const historySheet = getDBSheetByNameOrCreateNew(sheetNames.HISTORY);
    return historySheet.getRange(a1Range).getValues();
  }
  
  function getAllNames(section){
    const sheet = section === "person"?getDBSheetByNameOrCreateNew(sheetNames.PREV_PEOPLE):section === "place"?getDBSheetByNameOrCreateNew(sheetNames.PREV_PLACES):null;
    if(sheet){
      var lastRow = sheet.getLastRow() > 0?sheet.getLastRow():1;
      return sheet.getSheetValues(1,1,lastRow,1).map(function(row){
        return row[0];
      });
    }
  }
  
  function insertNameLookup(name,section){
    const sheet = section === "person"?getDBSheetByNameOrCreateNew(sheetNames.PREV_PEOPLE):section === "place"?getDBSheetByNameOrCreateNew(sheetNames.PREV_PLACES):null;
    if(sheet){
      var lastRow = sheet.getLastRow() > 0?sheet.getLastRow()+1:1;
      sheet.getRange(lastRow,1,1,1).setValue(name);
    }
  }
  
  function deleteNameLookup(name,section){
    const sheet = section === "person"?getDBSheetByNameOrCreateNew(sheetNames.PREV_PEOPLE):section === "place"?getDBSheetByNameOrCreateNew(sheetNames.PREV_PLACES):null;
    if(sheet){
      var kName = ls2kNS.Utilities.makeStrKeySafe(name);
      var foundIndex = linearSearchName(kName,sheet);
      ls2kNS.Utilities.nonShittyLogger(foundIndex);
      if(foundIndex > -1){
        sheet.deleteRow(foundIndex);
      }
    }
  }
  
  function linearSearchName(kName,sheet){
    var lastRow = sheet.getLastRow() > 0?sheet.getLastRow():1;
    var names = sheet.getSheetValues(1,1,lastRow,1);
    for(var i=0;names.length;i++){
      if(kName === ls2kNS.Utilities.makeStrKeySafe(names[i][0])){
        return i+1;
      }
    }
    return -1;
  }
  
  function deleteHistoryEntry(lkRange,histIdx){
    histIdx *= 1;
    var userLock = LockService.getUserLock()
    var success = userLock.tryLock(2500);
    if(success){
      var rangeInfo = ls2kNS.Utilities.getA1RangeInfo(lkRange);
      deleteHistoryRef(rangeInfo,histIdx);
      var changeLength = rangeInfo.lastRow - rangeInfo.firstRow +1;
      const historySheet = getDBSheetByNameOrCreateNew(sheetNames.HISTORY);
      historySheet.deleteRows(rangeInfo.firstRow,changeLength);
    }
    else{
      Logger.log("busy");
      //Right now I'm not going to do anything here, since I'm already blocking quick calls on the front end.
      return;
    }
  }
                                                        
  function deleteHistoryRef(rangeInfo,histIdx){
    histIdx *= 1;
    const historyRefSheet = getDBSheetByNameOrCreateNew(sheetNames.HISTORY_REF);
    var changeLength = rangeInfo.lastRow - rangeInfo.firstRow +1;
    var rowCount = historyRefSheet.getLastRow();
    for(var i = histIdx+1;i<=rowCount;i++){ //another +1 since we don't need to update the one, we're deleting
      var cell = historyRefSheet.getRange(1,1,rowCount,1).getCell(i,1);
      cell.setValue(ls2kNS.Utilities.getIncrementedA1Range(cell.getValue(),-changeLength,-changeLength));
    }
    historyRefSheet.deleteRow(histIdx);
  }

  function expandColCount(refIndex,steps){
    refIndex *= 1;
    steps *= 1;
    const historyRefSheet = getDBSheetByNameOrCreateNew(sheetNames.HISTORY_REF);
    var cell = historyRefSheet.getRange(refIndex,1,1,1).getCell(1,1)
    var a1Range = cell.getValue();
    var incrementedLkRange = ls2kNS.Utilities.getIncrementedA1Range(a1Range,0,0,0,steps);
    cell.setValue(incrementedLkRange);
    return incrementedLkRange;
  }

  function expandRowCount(refIndex,steps){
    refIndex *= 1;
    steps *= 1;
    const historyRefSheet = getDBSheetByNameOrCreateNew(sheetNames.HISTORY_REF);
    var rowCount = historyRefSheet.getLastRow();
    var cell = historyRefSheet.getRange(refIndex,1,1,1).getCell(1,1);
    var a1Range = cell.getValue();
    const historySheet = getDBSheetByNameOrCreateNew(sheetNames.HISTORY);
    historySheet.insertRowsAfter(historyRefSheet.getRange(a1Range).getLastRow(),steps);
    cell.setValue(ls2kNS.Utilities.getIncrementedA1Range(cell.getValue(),0,steps));
    for(var i = refIndex+1;i<=rowCount;i++){
      cell = historyRefSheet.getRange(1,1,rowCount,1).getCell(i,1);
      a1Range = cell.getValue();
      var shiftedRange = ls2kNS.Utilities.getIncrementedA1Range(a1Range,steps,steps);
      cell.setValue(shiftedRange);
    }
    return steps;
  }  
  
  function getStoredInputs(){
    const columnCount = 3; //person name, person gender, and restaurant
    const inputSheet = getDBSheetByNameOrCreateNew(sheetNames.INPUT);
    if(!inputSheet.getLastRow()){
      return [[]];
    }
    return inputSheet.getSheetValues(1,1,inputSheet.getLastRow(),columnCount);
  }
  
  function getAllHistoryReferences(){
    const columnCount = 2; //history entry reference, and stored date
    const historyRefSheet = getDBSheetByNameOrCreateNew(sheetNames.HISTORY_REF);
    if(!historyRefSheet.getLastRow()) return [];
    return historyRefSheet.getSheetValues(1,1,historyRefSheet.getLastRow(),columnCount);
  }
  
  function HistoryCluster(historyBlock,recencyScore){
    recencyScore *= 1;
    this.restaurantCount = historyBlock[0].length
    var lastRowIndex = historyBlock.length;
    this.recencyScore = recencyScore;
    this.PlaceIterator = function(){
      var colNum = 0;
      this.hasNext = function(){
        return colNum < historyBlock[0].length;
      };
      this.next = function(){
        if(!this.hasNext()){
          return null;
        }
        var col = new Column(historyBlock,colNum);
        colNum++;
        return col;
      };
    };
    function Column(table,column){
      column *= 1; 
      var row = 1;
      this.placeName = table[0][column];
      this.hasNext = function(){
        return row < (historyBlock.length);
      };
      this.next = function(){
        if(!this.hasNext()){
          return null;
        }
        var cellValue = table[row][column];
        row++;
        return cellValue;
      };
    }
  }
  
  function HistoryScanner(){
    this.historySheet = getDBSheetByNameOrCreateNew(sheetNames.HISTORY);
    this.historyRefSheet = getDBSheetByNameOrCreateNew(sheetNames.HISTORY_REF);
    this.lastRow = this.historyRefSheet.getLastRow();
    this.currentA1Range = this.lastRow>0?this.historyRefSheet.getRange(this.lastRow,1,1,1).getValue():"";
  }
  
  HistoryScanner.prototype.hasNext = function(){
    return (this.currentA1Range)?true:false;
  };
  
  HistoryScanner.prototype.scanNext = function(){
    if(!this.currentA1Range) return null;
    const historyCluster = new HistoryCluster(this.historySheet.getRange(this.currentA1Range).getValues(),this.lastRow);
    this.currentA1Range = this.lastRow>1?this.historyRefSheet.getRange(--this.lastRow,1,1,1).getValue():"";
    return historyCluster;
  };
  
  function clearAll(){
    var allSheets = backendSpreadsheet.getSheets();
    var defaultSheet = getDBSheetByNameOrCreateNew(sheetNames.DEFAULT);
    allSheets.forEach(function(s,i){
      if(s.getName()!==sheetNames.DEFAULT){
        backendSpreadsheet.deleteSheet(s);
      }
    });
  }
  
  return {
    outputResultsToStagingTable:outputResultsToStagingTable,
    HistoryScanner:HistoryScanner,
    clearStagingSheet:clearStagingSheet,
    clearCustomStagingSheet:clearCustomStagingSheet,
    addNewEntryToHistory:addNewEntryToHistory,
    clearInputSheet:clearInputSheet,
    addInputToInputSheet:addInputToInputSheet,
    updateOutputValue: updateOutputValue,
    getStagingData:getStagingData,
    getStoredInputs:getStoredInputs,
    clearHistorySheet:clearHistorySheet,
    getAllHistoryReferences: getAllHistoryReferences,
    getHistoryData:getHistoryData,
    deleteHistoryEntry:deleteHistoryEntry,
    getDBSheetByNameOrCreateNew:getDBSheetByNameOrCreateNew,
    clearAll:clearAll,
    doesStagingHaveData: doesStagingHaveData,
    expandColCount: expandColCount,
    expandRowCount:expandRowCount,
    getCustomStagingData: getCustomStagingData,
    getAllNames: getAllNames,
    insertNameLookup: insertNameLookup,
    deleteNameLookup:deleteNameLookup
  };
  
};
