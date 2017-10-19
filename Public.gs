var ls2kNS = ls2kNS||{};

function doGet() {
  return ls2kNS.Utilities.wrapCall(function(){
    return HtmlService.createTemplateFromFile("front").evaluate();
  }).callWrapped();
}

function handleMigrations(){
  return ls2kNS.Utilities.wrapCall(function(){
    ls2kNS.MigrationHandler.checkForAndHandleMigrations();
    return {returnCode:0};
  }).callWrapped();
}

function processInputs(inputs){
  return ls2kNS.Utilities.wrapCall(function(inputs){
    const ls2k = new ls2kNS.LunchSortController();
    return ls2k.processInputs(inputs);
  }).callWrapped(inputs);
}

function saveCellValue(userInput,index,sectionNum){
  return ls2kNS.Utilities.wrapCall(function(userInput,index,sectionNum){
    const ls2k = new ls2kNS.LunchSortController();
    ls2k.saveUserInput(userInput,index,sectionNum);
    return {"returnCode":0};
  }).callWrapped(userInput,index,sectionNum);
}

function updateValueInResults(inputValue,row,col,lkRange){
  return ls2kNS.Utilities.wrapCall(function(inputValue,row,col,lkRange){
    const ls2k = new ls2kNS.LunchSortController();
    ls2k.updateValueInResult(inputValue,row,col,lkRange);
    return {"returnCode":0};
  }).callWrapped(inputValue,row,col,lkRange);
}

function getPreviousInputs(){
  return ls2kNS.Utilities.wrapCall(function(){
    const ls2k = new ls2kNS.LunchSortController();
    return ls2k.getPreviousInputData();
  }).callWrapped();
}

function getAllHistoryReferences(){
  return ls2kNS.Utilities.wrapCall(function(){
    const ls2k = new ls2kNS.LunchSortController();
    return ls2k.getAllHistoryReferences();
  }).callWrapped();
}

function getState(){
  return ls2kNS.Utilities.wrapCall(function(){
    var ls2k = new ls2kNS.LunchSortController();
    return ls2k.getState();
  }).callWrapped();
}

function commitStagingToHistory(clearInputs){
  return ls2kNS.Utilities.wrapCall(function(clearInputs){
    const ls2k = new ls2kNS.LunchSortController();
    return ls2k.commitStagingToHistory(clearInputs);
  }).callWrapped(clearInputs);
}

function resetAll(){
  return ls2kNS.Utilities.wrapCall(function(){
    const ls2k = new ls2kNS.LunchSortController();
    ls2k.clearAll();
    return {"returnCode":0};
  }).callWrapped();
}

function getHistoryEntryData(lkRange){
  return ls2kNS.Utilities.wrapCall(function(lkRange){
    if(!lkRange) throw new Error("lkRange is null or empty");
    const ls2k = new ls2kNS.LunchSortController();
    return ls2k.getHistoryEntryData(lkRange);
  }).callWrapped(lkRange);
}

function deleteHistoryEntry(lkRange,histIdx){
  Logger.log("Anything?");
  return ls2kNS.Utilities.wrapCall(function(lkRange,histIdx){
    const ls2k = new ls2kNS.LunchSortController();
    ls2k.deleteHistoryEntry(lkRange,histIdx);
    return {"returnCode":0};
  }).callWrapped(lkRange,histIdx);
}

function expandColCount(refIndex,steps){
  return ls2kNS.Utilities.wrapCall(function(refIndex,steps){
    const ls2k = new ls2kNS.LunchSortController();
    return ls2k.expandColCount(refIndex,steps);
  }).callWrapped(refIndex,steps);
}

function expandRowCount(refIndex,steps){
  return ls2kNS.Utilities.wrapCall(function(refIndex,steps){
    const ls2k = new ls2kNS.LunchSortController(); 
    return ls2k.expandRowCount(refIndex,steps);
  }).callWrapped(refIndex,steps);
}

function commitCustomToHistory(){
  return ls2kNS.Utilities.wrapCall(function(){
    const ls2k = new ls2kNS.LunchSortController(); 
    return ls2k.commitCustomToHistory();
  }).callWrapped();
}

function clearCustom(){
  return ls2kNS.Utilities.wrapCall(function(){
    const ls2k = new ls2kNS.LunchSortController(); 
    return ls2k.clearCustom();
  }).callWrapped();
}

function clearInputs(){
  return ls2kNS.Utilities.wrapCall(function(){
    const ls2k = new ls2kNS.LunchSortController(); 
    return ls2k.clearInputs();
  }).callWrapped();
}

function clearStaging(){
  return ls2kNS.Utilities.wrapCall(function(){
    const ls2k = new ls2kNS.LunchSortController(); 
    return ls2k.clearStaging();
  }).callWrapped();
}

function getAllNames(section){
  return ls2kNS.Utilities.wrapCall(function(section){
    const ls2k = new ls2kNS.LunchSortController(); 
    return ls2k.getAllNames(section);
  }).callWrapped(section);
}

function insertNameLookup(name,section){
  return ls2kNS.Utilities.wrapCall(function(name,section){
    const ls2k = new ls2kNS.LunchSortController(); 
    ls2k.insertNameLookup(name,section);
    return {"returnCode":0};
  }).callWrapped(name,section);
}

function deleteNameLookup(name,section){
  return ls2kNS.Utilities.wrapCall(function(name,section){
    const ls2k = new ls2kNS.LunchSortController(); 
    ls2k.deleteNameLookup(name,section);
    return {"name":name,"section":section,"returnCode":0};
  }).callWrapped(name,section);
}

function addDataDirect(data){
  return ls2kNS.Utilities.wrapCall(function(data){
    const ls2k = new ls2kNS.LunchSortController(); 
    ls2k.addDataDirect(data);
    return {"returnCode":0};
  }).callWrapped(data);
}

function addNamesDirect(names,section){
  return ls2kNS.Utilities.wrapCall(function(names,section){
    const ls2k = new ls2kNS.LunchSortController(); 
    ls2k.addNamesDirect(names,section);
    return {"returnCode":0};
  }).callWrapped(names,section);
}


function logFrontEndErrors(errorInfo){
  ls2kNS.Utilities.logErrors(errorInfo);
  return {"returnCode":0};
}


