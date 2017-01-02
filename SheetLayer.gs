function SheetLayer() {
  
  var sl = this;
  var userSelectedRange = getSelectedUserRangeWithoutLabels();
  var ut = new Utilities();
  var sheetNames = {HISTORY: "history",PAST_PEOPLE:"Past_Persons"};
 
  sl.outputResultsTable = function(optimalLunchGroupTbl){
    var userSheet = userSelectedRange.getSheet();
    userSheet.clear();
    var tblHeight = optimalLunchGroupTbl.length;
    var tblWidth = optimalLunchGroupTbl[0].length;
    var outputRange = userSheet.getRange(1,1,tblHeight,tblWidth);
    outputRange.setValues(optimalLunchGroupTbl);
    var topRow = outputRange.offset(0,0,1);
    topRow.setBackground("#acffa8");
  };
  
  //stay
  sl.checkForDuplicatesInSelectionAndAssignPrimesToPeople = function(){
    var tracker = new CurrentPeopleAndPlacesTracker();
    var lastRowIndex = (userSelectedRange.getLastRow()) >>> 0;
    for(var i = 1;i<lastRowIndex;i++){
      tracker.scanSinglePersonCell(userSelectedRange.getCell(i,1));
      tracker.scanSinglePlaceCell(userSelectedRange.getCell(i,2));
    }
    if(tracker.cellsWithDuplicateData.length > 0){
      sl.markCellsInErrorAndTellUser(tracker.cellsWithDuplicateData);
      handleErrors("There was a duplicate restaurant",errorCodes.USER_ERROR);
      return null;
    }
    return tracker;
  };
  
  function CurrentPeopleAndPlacesTracker(){

    var self = this;
    var pt = new PersonTools();
    var lp = new LunchPlaceTools();
    self.people = new pt.PeopleHashCollection();
    self.restaurantHashMap = new lp.LunchPlaceHashCollection();
    self.cellsWithDuplicateData = [];
    self.scanSinglePersonCell = function(cell){
      var name = cell.getValue();
      if(!ut.makeStrKeySafe(name)){return;}
      if(!self.people.add(name)){
        self.cellsWithDuplicateData.push(cell);
      }
    };
    self.scanSinglePlaceCell = function(cell){
      var placeName = cell.getValue();
      if(!ut.makeStrKeySafe(placeName)){return;}
      if(!self.restaurantHashMap.add(placeName)){
        self.cellsWithDuplicateData.push(cell);
      }
    };
  }
  
    //stay
  sl.markCellsInErrorAndTellUser = function(badCells){
    for(var i = 0;i<badCells.length;i++){
      badCells[i].setBorder(true,true,true,true,null,null,"red",SpreadsheetApp.BorderStyle.SOLID);
    }
    ui.alert("Duplicates have been found in your entries and marked. Please differentiate them somehow.");
  };
  
  //stay
  function getSelectedUserRangeWithoutLabels(){
    var activeSheet = SpreadsheetApp.getActiveSheet();
    var lastRowIndex = activeSheet.getLastRow();
    var inputRange = activeSheet.getRange(2, 1,lastRowIndex,2);
    return inputRange;
  }
  
  //stay
  sl.getDBSheetByNameOrCreateNew = function(sheetName){
    var activeSS = SpreadsheetApp.getActiveSpreadsheet();
    var historySheet = activeSS.getSheetByName(sheetName);
    if(!historySheet){
      historySheet = activeSS.insertSheet(sheetName);
      historySheet.hideSheet();
    }
    return historySheet;
  };
   
  sl.resetHistory = function(){
    var historySheet = sl.getDBSheetByNameOrCreateNew(sheetNames.HISTORY);
    historySheet.clear();
    historySheet.hideSheet();
  };
  
  sl.setupHomePage = function(){
    var homeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    homeSheet.clear();
    var personLabelCell = homeSheet.getRange(1,1);
    var placeLabelCell = homeSheet.getRange(1,2);
    personLabelCell.setValue("Person");
    personLabelCell.setBackground("#acffa8");
    placeLabelCell.setValue("Restaurant");
    placeLabelCell.setBackground("#acffa8");
  };
  
  function padHistoryOutputTable(table){
    table.unshift(ut.buildArray(table[0].length,""));
    table.push(ut.buildArray(table[0].length,""));
  }
  
  sl.addNewEntryToHistory = function(optimalLunchGroupTbl){
    padHistoryOutputTable(optimalLunchGroupTbl);
    var historySheet = sl.getDBSheetByNameOrCreateNew(sheetNames.HISTORY);
    var firstRowInEntry = historySheet.getLastRow()>0?historySheet.getLastRow():1;
    var tblWidth = optimalLunchGroupTbl[0].length;
    var tblHeight = optimalLunchGroupTbl.length;
    var entryRange = historySheet.getRange(firstRowInEntry,1,tblHeight,tblWidth);
    var prevA1Range = entryRange.getCell(1,1).getValue();
    var entryNumber = entryRange.getCell(1,2).getValue()*1;
    var nextA1Range = entryRange.getA1Notation();
    optimalLunchGroupTbl[0][0] = prevA1Range;
    optimalLunchGroupTbl[0][1] = entryNumber;
    var lastRowIndex = optimalLunchGroupTbl.length -1;
    optimalLunchGroupTbl[lastRowIndex][0] = nextA1Range;
    optimalLunchGroupTbl[lastRowIndex][1] = entryNumber +1;
    entryRange.setValues(optimalLunchGroupTbl);
  };
  
  sl.HistoryCluster = function(historyBlock){
    var self = this;
    self.restaurantCount = historyBlock[0].length
    var lastRowIndex = historyBlock.length -1;
    self.recencyScore = historyBlock[lastRowIndex][1];
    self.nextA1Range = historyBlock[0][0];
    self.PlaceIterator = function(){
      var selfPlaceIter = this;
      var colNum = 0;
      selfPlaceIter.hasNext = function(){
        return colNum < historyBlock[0].length;
      };
      selfPlaceIter.next = function(){
        if(!selfPlaceIter.hasNext()){
          return null;
        }
        var col = new Column(historyBlock,colNum);
        colNum++;
        return col;
      };
    };
    function Column(table,column){
      var selfColumn = this;
      var row = 2;
      selfColumn.placeName = table[1][column];
      selfColumn.hasNext = function(){
        return row < (historyBlock.length -1); //-1 is for the coordinate row
      };
      selfColumn.next = function(){
        if(!selfColumn.hasNext()){
          return null;
        }
        var cellValue = table[row][column];
        row++;
        return cellValue;
      };
    }
  };
  
  sl.HistoryScanner = function(){
    var self = this;
    var historySheet = sl.getDBSheetByNameOrCreateNew(sheetNames.HISTORY);
    var lastRow = historySheet.getLastRow();
    var currentA1Range = lastRow > 0?historySheet.getRange(lastRow,1).getValue():"";
    self.hasNext = function(){
      return (currentA1Range)?true:false;
    };
    self.scanNext = function(){
      if(!currentA1Range){return null;}
      var historyCluster = new sl.HistoryCluster(historySheet.getRange(currentA1Range).getValues());
      currentA1Range = historyCluster.nextA1Range;
      return historyCluster;
    };
  };
  
  
}
