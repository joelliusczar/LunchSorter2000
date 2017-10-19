var ls2kNS = ls2kNS||{};

ls2kNS.MigrationHandler = {
  latestMigrationNumber: 1,
  checkForAndHandleMigrations: function(){
    const settings = PropertiesService.getUserProperties();
    var migrationNumber = settings.getProperty(ls2kNS.configKeys.MIGRATION_NUMBER);
    var sheetId = settings.getProperty(ls2kNS.configKeys.SHEET_ID);
    if(!migrationNumber){
      if(!sheetId){
        //this is a fresh user. Don't need to do anything except store the migration number.
        settings.setProperty(ls2kNS.configKeys.MIGRATION_NUMBER, ls2kNS.MigrationHandler.latestMigrationNumber);
        return;
      }
      else{
        migrationNumber = 1;
        settings.setProperty(ls2kNS.configKeys.MIGRATION_NUMBER, migrationNumber);
        const backendSpreadsheet = SpreadsheetApp.openById(sheetId);
        const sl = new ls2kNS.SheetLayer(backendSpreadsheet);
        const oldHistorySheet = sl.getDBSheetByNameOrCreateNew(ls2kNS.sheetNames.HISTORY);
        oldHistorySheet.setName("tmp");
        const replaceHistorySheet = sl.getDBSheetByNameOrCreateNew(ls2kNS.sheetNames.HISTORY);
        const values = oldHistorySheet.getSheetValues(1,1,oldHistorySheet.getLastRow(),1);
        const historyRefSheet = sl.getDBSheetByNameOrCreateNew(ls2kNS.sheetNames.HISTORY_REF);
        const transferData = ls2kNS.MigrationHandler.transferDatesFromPhasedOutHistoryColumn(values,oldHistorySheet,replaceHistorySheet);
        const columns = historyRefSheet.getRange(1,1,transferData.length,2);
        columns.setValues(transferData);
        backendSpreadsheet.deleteSheet(oldHistorySheet);
      }
    }
  },
  transferDatesFromPhasedOutHistoryColumn: function(A1Ranges,oldHistorySheet,replaceHistorySheet){
    var result = [];
    for(var i = 1;i<A1Ranges.length;i++){
      if(!A1Ranges[i].length||!A1Ranges[i][0]){
        continue;
      }
      var entryRange = oldHistorySheet.getRange(A1Ranges[i][0]);
      var storedDate = entryRange.getCell(entryRange.getNumRows(), 3).getValue();
      var values = entryRange.getValues();
      values.shift();
      values.pop();
      var copyToRange = replaceHistorySheet.getRange(replaceHistorySheet.getLastRow()+1, 1, values.length, entryRange.getNumColumns());
      copyToRange.setValues(values);
      var fixRange = copyToRange.getA1Notation();
      result.push([fixRange,storedDate]);
    }
    return result;
  }
};
