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

  // getting calendar events + data
  let cals = CalendarApp.getAllCalendars();
  let types = [];
  let users = [];
  let nested = [];

  for (i in cals){
    let events = cals[i].getEvents(new Date(start), new Date(end));
    for (j in events){
      let title = events[j].getTitle();
      let creator = String(events[j].getCreators());
      let should_i_email = true;
      // Logger.log(title);

      // checking if title is a match with any format; if so, adds its data to the data arrays
      for (k in formats){
        formats[k].lastIndex = 0;
        match = formats[k].test(title);
        // Logger.log(match);
        if (match){
          should_i_email = false;
          let event_type = title.match(formats[k])[1];
          let duration = (events[j].getEndTime()-events[j].getStartTime())/3600000;
          
          if (!types.includes(event_type)){
            types.push(event_type);
            nested.push([]);
          }

          if (!users.includes(creator)){
            users.push(creator);
          }

          if(nested[types.indexOf(event_type)][users.indexOf(creator)]==null){
            nested[types.indexOf(event_type)][users.indexOf(creator)] = (duration);
          } else{
            nested[types.indexOf(event_type)][users.indexOf(creator)] += (duration);
          }
        }
        if (should_i_email == false){break};
      }
  
      // Logger.log(`Format loop completed for ${events[j].getTitle()}. Should I email? ${should_i_email}`);

      // sending email if title does not match any formats
      if (should_i_email == true) {
        // this would email 'creator', but i don't want to accidentally email anyone right now
        GmailApp.sendEmail('gili4prez@gmail.com', "(BOT) Calendar Naming Issue", `Hello!\n\nYour event: "${title}" on ${events[j].getStartTime().toDateString()} was titled incorrectly. Please refer to the spreadsheet at https://docs.google.com/spreadsheets/d/18za7Rgyy9j5dho4KFa7zv6vnxJh4T9wa7sSVL8RMJb0/edit?usp=sharing to review naming conventions.\n\nThank you!\nFrom Calbot`);
      }
    }
  }

  // adding data to data sheet
  sheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1PGYLqkRZyxtXB3rmpxTpTuCZz74BV4VQKf71fW0rWVI/edit?usp=sharing');
  SpreadsheetApp.setActiveSpreadsheet(sheet);
  SpreadsheetApp.setActiveSheet(sheet.getSheets()[0]);
  
  let lower_corner = `${String.fromCharCode(99 + users.length).toUpperCase()}${3+types.length}`;

  // clear sheet
  range = SpreadsheetApp.getActiveSheet().getRange(`B2:ZZ`);
  range.clear();
  
  // set new range and enter data
  range = SpreadsheetApp.getActiveSheet().getRange(`B2:${lower_corner}`);
  SpreadsheetApp.setActiveRange(range);
  
  // setting event and user names
  for (i in types){
    range.getCell(parseInt(i)+2, 1).setValue(types[i]);
    range.getCell(parseInt(i)+2, 1).setBackground('#fce1bb');
  }

  for (i in users){
    range.getCell(1, parseInt(i)+2).setValue(users[i]);
    range.getCell(1, parseInt(i)+2).setBackground('#bbfcc0');
  }

  // entering time in hours
  for (i in types){
    for (j in users){
      range.getCell(parseInt(i)+2, parseInt(j)+2).setValue(nested[i][j]);
      range.getCell(parseInt(i)+2, parseInt(j)+2).setBackground('#fdffdb');
    }
  }

  // entering summation formulas at end caps
  for (i in users){
    range.getCell(types.length+2, parseInt(i)+2).setBackground(`#c2f7ff`);
    range.getCell(types.length+2, parseInt(i)+2).setValue(`=sum(${String.fromCharCode(99 + parseInt(i))}3:
    ${String.fromCharCode(99 + parseInt(i)).toUpperCase()}${types.length+2})`);
  }

  for (i in types){
    range.getCell(parseInt(i)+2, users.length+2).setBackground(`#f4d9fc`);
    range.getCell(parseInt(i)+2, users.length+2).setValue(`=sum(c${parseInt(i)+3}:
    ${String.fromCharCode(98 + users.length).toUpperCase()}${parseInt(i)+3})`);
  }
}

function doGet(e){
  Logger.log(e);
  let html = HtmlService.createTemplateFromFile('Page');

  let cals = CalendarApp.getAllCalendars();
  names = []
  ids = []
  for (i in cals){
    names.push(cals[i].getName());
    ids.push(cals[i].getId());
  }
  html.names = names;
  html.ids = ids;

  return html.evaluate().setTitle("Calendar Sweep");
}




