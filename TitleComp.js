function titleComp(start = new Date(), end = new Date((new Date()).getTime()+7*24*60*60*1000)) {

  // opening regex sheet
  let sheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/18za7Rgyy9j5dho4KFa7zv6vnxJh4T9wa7sSVL8RMJb0/edit?usp=sharing');
  SpreadsheetApp.setActiveSpreadsheet(sheet);
  SpreadsheetApp.setActiveSheet(sheet.getSheets()[0]);
  
  let range = SpreadsheetApp.getActiveSheet().getRange('A2:B');
  SpreadsheetApp.setActiveRange(range);

  // pulling formats into an array
  let formats = [];
  for (i = 1; i<1000000; i++){
    let cell = range.getCell(i, 1);
    let flag = range.getCell(i, 2);
    if (cell.isBlank()){
      break;
    } else{
      formats.push(new RegExp(cell.getValue(), flag.getValue()));
    }
  }

  // getting calendar events
  let cals = CalendarApp.getAllCalendars();

  for (i in cals){
    let events = cals[i].getEvents(new Date(start), new Date(end));
    for (j in events){
      let title = events[j].getTitle();
      let creator = String(events[j].getCreators());
      let should_i_email = true;
      // Logger.log(title);

      // checking if title is a match with any format
      for (k in formats){
        formats[k].lastIndex = 0;
        match = formats[k].test(title);
        // Logger.log(match);
        if (match){
          should_i_email = false;
        }
      }
      // Logger.log(`Format loop completed for ${events[j].getTitle()}. Should I email? ${should_i_email}`);

      // sending email if title does not match any formats
      if (should_i_email == true) {
        // this would email 'creator', but i don't want to accidentally email anyone right now
        GmailApp.sendEmail('gili4prez@gmail.com', "(BOT) Calendar Naming Issue", `Hello!\n\nYour event: "${title}" at ${events[j].getStartTime()} was titled incorrectly. Please refer to the spreadsheet at https://docs.google.com/spreadsheets/d/18za7Rgyy9j5dho4KFa7zv6vnxJh4T9wa7sSVL8RMJb0/edit?usp=sharing to review naming conventions.\n\nThank you!\nFrom Calbot`);
      }
    }
  }
}