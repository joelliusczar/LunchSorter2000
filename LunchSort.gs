var isDebugMode = true;
var errorCodes = {CORRUPT_DATA:1,USER_ERROR:2 };

function LunchSortController(){
  var global = this;
  var sl = new SheetLayer();
  var pt = new PersonTools();
  var lp = new LunchPlaceTools();
  var ht = new HistoryTools();
  var lg = new RankedLunchGroupTools();
  global.people = null;
  global.currentPlaces = null;
  global.personComboHistoryLookup = null;
  
  
  global.sort = function() {
    var isValidState = setupTransformedDataFromSheets();
    if(!isValidState){return false; }
    putOutputTable();
    return true;
  };
  
  function isHistoryScanState(){
    return global.people&&global.currentPlaces;
  }
  
  function isSortingState(){
    return isHistoryScanState()&&global.personComboHistoryLookup;
  }
  
  
  //stay
  function setupTransformedDataFromSheets(){
    var filledPeopleAndPlacesTracker = sl.checkForDuplicatesInSelectionAndAssignPrimesToPeople();
    if(!filledPeopleAndPlacesTracker){return false;}
    global.people = filledPeopleAndPlacesTracker.people;
    global.currentPlaces = filledPeopleAndPlacesTracker.restaurantHashMap;
    global.personComboHistoryLookup = ht.buildPersonLookup(filledPeopleAndPlacesTracker.restaurantHashMap,filledPeopleAndPlacesTracker.people);
    return true;
  }
  
  function putOutputTable(){
    var optimalLunchGroups = lg.buildOptimalLunchGroups(global.people,global.currentPlaces,global.personComboHistoryLookup);
    var tbl = lg.tranformOptimalLunchGroupToTable(optimalLunchGroups);
    sl.outputResultsTable(tbl);
    sl.addNewEntryToHistory(tbl);    
  }

}

function handleErrors(customMessage,errorCode){
  var ui = SpreadsheetApp.getUi();
  throw customMessage;
  if(errorCode === 1){
    ui.alert("There was a data corruption issue. Call Joel and tell him to fix his shitty code.");
  }
  else if(errorCode === 2){
    
  }
  if(isDebugMode){
    throw customMessage;
  }
  Logger.log(customMessage);
  return false;
}
