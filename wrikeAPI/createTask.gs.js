/*
    @folderId : the parent folder of the task
    @assignee : wrike contact ids
*/
function createTask(folderId,assignee,subject,content,dateStart=new Date(), duration=1,shareIds="") {
  var dateStartFmt = Utilities.formatDate(dateStart,"GMT+7","YYYY-MM-dd");

  var dateEnd = new Date();
//  duration -= 1; //in wrike , duration 1 day, end date is same as start date
  dateEnd.setDate(dateStart.getDate()+duration);

  //check if nextDay is saturday or monday.
  var dNextDay = dateEnd.getDay(); //0=sunday,6= saturday   
  var additionalDay = 0;
  
  if(dNextDay == 0){ 
    //fall on sunday, add 1 more days to monday
    var additionalDay = 1;  
  }else
    //fall on saturday, add 2 more days to monday
    if(dNextDay == 6){
      var additionalDay = 2;   
  }  
  dateEnd.setDate(dateEnd.getDate() + additionalDay); 

  var dateEndFmt = Utilities.formatDate(dateEnd,"GMT+7","YYYY-MM-dd");

  //replace new line with <BR>
  //https://developers.wrike.com/special-syntax/
  Logger.log('content :'+content);
  content = content.replace(/\n/g, "<br>");

  var access_token = wrikeSettings.wrike.ninja_token;
  var URL = wrikeSettings.wrike.folders_api_url+"/"+folderId+"/tasks";

  var dates = '{"start":"'+dateStartFmt+'","due":"'+dateEndFmt+'","type":"Planned"}';

  var data = {
    "title": subject,
    "description": content,
    "responsibles": assignee,
    "dates": dates
  };

  //share the task to others
  if(shareIds){
    data.shareds = shareIds;
  }

  var authHeader = "bearer "+access_token;
  
  var headers = {
    "Authorization": authHeader,
    "Accept": "application/json"
  };
  
  var options = {
    'headers': headers,
    'method' : 'POST',
    'muteHttpExceptions': true,
    'contentType': "application/json",
    'payload': JSON.stringify(data)
  };

  Logger.log("url : "+URL);
  var response = UrlFetchApp.fetch(URL, options);
  
  var responseCode = response.getResponseCode();
  //Logger.log(responseXml);
  Logger.log('response code '+responseCode);

  if (responseCode === 200) {
    //return the id
    var data = JSON.parse(response.getContentText());
    var dataRecord = data.data;
    Logger.log('wrikeapp id '+dataRecord[0].id);
      return dataRecord[0].id;
  }   else if (responseCode === 401) {
    
    PropertiesService.getScriptProperties().setProperty('isConnected', 'false')
    
    throw new Error('Error Connection');
  
  } 
}

