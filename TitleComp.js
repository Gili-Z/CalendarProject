function titleComp() {
  let cals = CalendarApp.getAllCalendars();
  let formats = [/[1-9]\w+/] ///\b[A-Z][a-z]+\b/

  for (i in cals){
    let events = cals[i].getEvents(new Date(), new Date((new Date()).getTime()+7*24*60*60*1000));
    for (j in events){
      let title = events[j].getTitle();
      let creator = String(events[j].getCreators());
      let should_i_email = true;

      for (k in formats){
        Logger.log(title);
        Logger.log(formats[k].test(title));
        if (formats[k].test(title) == true){
          should_i_email = false;
        }
      }
      Logger.log(`Format loop completed for ${events[j]}. Should I email? ${should_i_email}`);

      if (should_i_email == true) {
        // this would email 'creator', but i don't want to accidentally email anyone right now
        GmailApp.sendEmail('gili4prez@gmail.com', "(BOT) Calendar Naming Issue", `Hello!\n\nYour event: "${title}" at ${events[j].getStartTime()} was titled incorrectly. Please refer to the spreadsheet at this <link> to review naming conventions.\n\nThank you!\nFrom Calbot`); // set up spreadsheet with reg expressions, example names in column next over for reference and naming updates
      }
    }
  }
}