var ls2kNS = ls2kNS||{};

ls2kNS.configKeys = {"SHEET_ID":"sheetId"
                    ,"SHEET_NAME":"waLS"
                    ,"STATE":"state"
                    ,"MIGRATION_NUMBER":"migrationNumber"
                    ,"ERROR_SHEET":"errorsLS"
                     ,"ERROR_SHEET_ID":"errorSheetId"};

ls2kNS.LunchSortController = function(){
  
  ls2kNS.MigrationHandler.checkForAndHandleMigrations();
  
  var isDebugMode = false;
  const errorCodes = {"CORRUPT_DATA":1,"USER_ERROR":2 };
  const returnCodes = {"NO_ERRORS":0
                      ,"DUPLICATES":1
                      ,"EMPTY_INPUT":2
                      ,"PRESORT_COMPLETE":3
                      ,"ERROR":4
                      ,"EMPTY_RETURN":5
                      ,"EMPTY_HIST_BUT_STAGING":6
                       ,"MISSING_DB_SHEET":7};
  const configKeys = ls2kNS.configKeys;
  const stateOptions = {"READY":"ready","STAGING":"staging"};

  var people = null;
  var currentPlaces = null;
  var personComboHistoryLookup = null;
  
  function preSort(inputs){
    const ht = new ls2kNS.HistoryTools(ls2kNS.Utilities.getSpreadsheetBackend());
    const ip = new ls2kNS.InputProcessor();
    const inputCollection = new ip.InputCollection(inputs);
    if(!inputCollection.hasNextPerson()&&!inputCollection.hasNextPlace()){
      return {"returnCode":returnCodes.EMPTY_INPUT};
    }
    const filledPeopleAndPlacesTracker = ip.checkForDuplicatesInSelectionAndAssignPrimesToPeople(inputCollection);
    if(filledPeopleAndPlacesTracker.hasDuplicates){
      return {"returnCode":returnCodes.DUPLICATES,"idsForDuplicates":filledPeopleAndPlacesTracker.cellsWithDuplicateData};
    }
    people = filledPeopleAndPlacesTracker.people;
    currentPlaces = filledPeopleAndPlacesTracker.restaurantHashMap;
    personComboHistoryLookup = ht.buildPersonLookup(filledPeopleAndPlacesTracker.restaurantHashMap,filledPeopleAndPlacesTracker.people);
    filledPeopleAndPlacesTracker.people.keys.forEachClassification(function(item,i,people){
      ls2kNS.Utilities.randomizeArray(people[item].keys);
    });
    return {"returnCode":returnCodes.PRESORT_COMPLETE};
  }
  
  function finishSort(){
    var lg = new ls2kNS.RankedLunchGroupTools();
    var optimalLunchGroups = lg.buildOptimalLunchGroups(people,currentPlaces,personComboHistoryLookup);
    if(!optimalLunchGroups){
      return {"returnCode":returnCodes.EMPTY_RETURN};
    }
    var tbl = lg.tranformOptimalLunchGroupToTable(optimalLunchGroups);
    if(!tbl){
      return {"returnCode":returnCodes.ERROR};
    }
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    sl.outputResultsToStagingTable(tbl);
    return {"returnCode":returnCodes.NO_ERRORS};
  }
  
  function processInputs(inputs){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    sl.clearStagingSheet();
    var preSortResult = preSort(inputs);
    if(preSortResult.returnCode !== returnCodes.PRESORT_COMPLETE){
      return preSortResult;
    }
    var result = finishSort();
    setState(stateOptions.STAGING);
    return result;
  }
  
  function sortAgain(inputs){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    sl.clearStagingSheet();
    return processInputs(inputs);
  }
  
  //deprecated
  function revertSort(){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    sl.clearStagingSheet();
    setState(stateOptions.READY);
  }
  
  function commitStagingToHistory(clearInputs){
    const backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    const sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    const entryRefs = sl.addNewEntryToHistory(sl.getStagingData());
    sl.clearStagingSheet();
    if(clearInputs){
      sl.clearInputSheet();
    }
    setState(stateOptions.READY);
    entryRefs.returnCode = returnCodes.NO_ERRORS;
    return entryRefs;
  }
  
  function commitCustomToHistory(){
    const backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    const sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    const entryRefs = sl.addNewEntryToHistory(sl.getCustomStagingData());
    entryRefs.returnCode = returnCodes.NO_ERRORS;
    return entryRefs;
  }
  
  function saveUserInput(userInput,index,sectionNum){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    sl.addInputToInputSheet(userInput,index,sectionNum);
  }
  
  function updateValueInResult(inputValue,row,col,lkRange){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    sl.updateOutputValue(inputValue,row,col,lkRange);
    return {"returnCode":returnCodes.NO_ERRORS};
  }
  
  function getPreviousInputData(){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    return {"fromInputSheet":sl.getStoredInputs(),"returnCode":returnCodes.NO_ERRORS};
  }
   
  function getState(){
    var settings = PropertiesService.getUserProperties();
    var state = settings.getProperty(configKeys.STATE);
    if(!state){
      state = stateOptions.READY;
      settings.setProperty(configKeys.STATE, state);
    }
    return {"state":state,"returnCode":returnCodes.NO_ERRORS};
  }
  
  function setState(state){
    var settings = PropertiesService.getUserProperties();
    settings.setProperty(configKeys.STATE, state);
  }
  
  function clearAll(){
    var settings = PropertiesService.getUserProperties();
    settings.deleteProperty(configKeys.STATE);
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    sl.clearAll();
    return {"returnCode":returnCodes.NO_ERRORS};
  }
  
  function clearStaging(){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    sl.clearStagingSheet();
    setState(stateOptions.READY);
    return {"returnCode":returnCodes.NO_ERRORS};
  }
  
  function clearCustom(){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    sl.clearCustomStagingSheet();
    return {"returnCode":returnCodes.NO_ERRORS};
  }
  
  function clearInputs(){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    sl.clearInputSheet();
    return {"returnCode":returnCodes.NO_ERRORS};
  }
  
  function getAllHistoryReferences(){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    const historyRefs = sl.getAllHistoryReferences();
    if(historyRefs.length < 1){
      if(sl.doesStagingHaveData()) return {"returnCode": returnCodes.EMPTY_HIST_BUT_STAGING};
      return {"returnCode":returnCodes.EMPTY_RETURN};
    }
    return {"returnCode":returnCodes.NO_ERRORS,"historyRefs":historyRefs};
  }
  
  function getHistoryEntryData(lkRange){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    if(lkRange == "0"){
      var tbl = sl.getStagingData();
      var returnCode = tbl?returnCodes.NO_ERRORS:returnCodes.EMPTY_RETURN;
    }
    else if(lkRange == "1"){
      var tbl = sl.getCustomStagingData();
      var returnCode = returnCodes.NO_ERRORS;
    }
    else{
      var tbl = sl.getHistoryData(lkRange);
      var returnCode = returnCodes.NO_ERRORS;
    }
    return {"returnCode":returnCode,"results":tbl,"lkRange":lkRange};
  }
  
  function deleteHistoryEntry(lkRange,histIdx){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    sl.deleteHistoryEntry(lkRange,histIdx);
    return {"returnCode":returnCodes.NO_ERRORS};
  }
  
  function expandColCount(refIndex,steps){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    return {"incrementedLkRange": sl.expandColCount(refIndex,steps),"returnCode":returnCodes.NO_ERRORS};
  }
  
  function expandRowCount(refIndex,steps){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    return {"steps":sl.expandRowCount(refIndex,steps),"returnCode":returnCodes.NO_ERRORS};
  }
  
  function getAllNames(section){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    return {"names":sl.getAllNames(section),"returnCode":returnCodes.NO_ERRORS};
  }
  
  function insertNameLookup(name,section){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    sl.insertNameLookup(name,section);
    return {"returnCode":returnCodes.NO_ERRORS};
  }
  
  function deleteNameLookup(name,section){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    sl.deleteNameLookup(name,section);
    return {"returnCode":returnCodes.NO_ERRORS};
  }
  
  function addDataDirect(data){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    sl.addNewEntryToHistory(data);
    return {"returnCode":returnCodes.NO_ERRORS};
  }
  
  function addNamesDirect(names,section){
    var backendSpreadsheet = ls2kNS.Utilities.getSpreadsheetBackend();
    var sl = new ls2kNS.SheetLayer(backendSpreadsheet);
    for(var i = 0;i<names.length;i++){
      sl.insertNameLookup(names[i],section);
    }
    return {"returnCode":returnCodes.NO_ERRORS};
  }
  
  return {processInputs:processInputs,
          saveUserInput:saveUserInput,
          updateValueInResult:updateValueInResult,
          getState:getState,
          revertSort:revertSort,
          commitStagingToHistory:commitStagingToHistory,
          clearAll:clearAll,
          getAllHistoryReferences:getAllHistoryReferences,
          getPreviousInputData:getPreviousInputData,
          getHistoryEntryData:getHistoryEntryData,
          deleteHistoryEntry:deleteHistoryEntry,
          sortAgain:sortAgain,
          expandColCount: expandColCount,
          expandRowCount:expandRowCount,
          commitCustomToHistory: commitCustomToHistory,
          clearStaging: clearStaging,
          clearCustom: clearCustom,
          getAllNames:getAllNames,
          insertNameLookup: insertNameLookup,
          deleteNameLookup:deleteNameLookup,
          clearInputs:clearInputs,
          addDataDirect:addDataDirect,
          addNamesDirect:addNamesDirect
         };
}
