


function onOpen(){
  initializeAndGetState();
  var ui = SpreadsheetApp.getUi();
  var sidebarDesign = HtmlService.createHtmlOutputFromFile('sidebar');
  ui.showSidebar(sidebarDesign);
}

function initializeAndGetState(){
  var settings = PropertiesService.getScriptProperties();
  var state = settings.getProperty("state");
  if(!state){
    var sl = new SheetLayer();
    sl.resetHistory();
    sl.setupHomePage();
    settings.setProperty("state","CLEAN");
    return "CLEAN";
  }
  else{
    return state
  }
}

function setState(state){
  var settings = PropertiesService.getScriptProperties();
  settings.setProperty("state",state);
}

function lunchSort_click(){
  setState("DIRTY");
  var ui = SpreadsheetApp.getUi();
  var sorter = new LunchSortController();
  var success = sorter.sort();
  if(!success){throw "something fucked up";}
}

function setup_click(){
  setState("CLEAN");
  var sl = new SheetLayer();
  sl.setupHomePage();
}

function clearHistory_click(){
  setState("CLEAN");
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert("Are you sure that you want to clear Lunch Sort history?", ui.ButtonSet.YES_NO);
  if(response.getSelectedButton() === ui.Button.NO){return;}
  var sl = new SheetLayer();
  sl.resetHistory();
  sl.setupHomePage();
}


