function form(){ 
  //Call the HTML file and set the width and height
  var html = HtmlService.createHtmlOutputFromFile("ui")
    .setWidth(450)
    .setHeight(250);
  
  //Display the dialog
  var dialog = ui.showModalDialog(html, "Please fill in Name");

};
