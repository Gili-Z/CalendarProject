//figure out how to deploy, possibly optimize first (right now we go from calendars to ids to calendars, steps could be eliminated)
//ENTER DATES AS 'MM/DD/YY' OR 'Month Day, Year' (can pass a full date, but longer to type)
function sweep(begin = new Date(), end = new Date(begin.getTime()+7*24*60*60*1000), address = Session.getActiveUser().getEmail()){
  begin = new Date(begin);
  end = new Date(end);
  // makes a named list of calendars that the user owns/is subscribed to
  function listIds(){
    let all_calendars = CalendarApp.getAllCalendars();
    let id_list = [];
    for (cal = 1; cal < all_calendars.length; cal++) {  
      id_list.push(all_calendars[cal].getId());
    }
    return id_list
  }
  // lists events on a certain calendar that will happen in a given time frame (default is now, one week from now)
  function listEvents(calendar_id, begin = new Date(), end = new Date(begin.getTime()+7*24*60*60*1000)){
    let calendar = CalendarApp.getCalendarById(calendar_id);
    let events = calendar.getEvents(begin, end);
    return events;
  }

  //compile event titles in the next week:
  const id_list = listIds()
  let all_titles = []

  //loop over all calendars by id
  for (i in id_list){
    let spec_titles = [];
    //loop over all events in a calendar and append their titles one by one to spec_titles
    for (j in events = listEvents(id_list[i], begin, end)){
      title = events[j].getTitle();
      spec_titles.push(title);
    }
    all_titles.push(spec_titles);
  }
  //formatting
  let body = '';
  for (i in id_list){
    let title_string = '';
    for (j in all_titles[i]){
      title_string += (all_titles[i][j] + '\n');
    }
    //console.log(`${CalendarApp.getCalendarById(id_list[i]).getName()}\n--------\n${title_string}`);
    if (title_string !== ''){
      body += `${CalendarApp.getCalendarById(id_list[i]).getName()}:\n--------\n${title_string}\n`;
    }
  }
  //reporting with an email to the active user
  GmailApp.sendEmail(address, 'Your Calendar Events (BOT)', `Hey there! Here are your events between ${begin.toLocaleString('default', { month: 'long' })} ${begin.getDate()}, ${begin.getFullYear()} and ${end.toLocaleString('default', { month: 'long' })} ${end.getDate()}, ${end.getFullYear()}:\n\n${body}`);
}

// sweep('5/30/21', '6/15/21');

