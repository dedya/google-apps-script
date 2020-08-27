/*
This script is to fetch Xero API from google apps script

Add OAuth2 library 
  - Resources - Libraries
  - ID : 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF
  
You can get CLIENT_ID and CLIENT_SECRET by create apps in https://developer.xero.com/  
  App Name : <whatever>
  Company or application URL : <whatever>
  OAuth 2.0 redirect URI : https://script.google.com/macros/d/{SCRIPT_ID}/usercallback
*/

var CLIENT_ID = 'xxx';
var CLIENT_SECRET = 'xxxxx';
var IT_EMAIL = "xxx@xxxx.com";

/* Get Xero Accounts */
function getXeroAccounts() {
  var service = getService();
  
  //if service already has access, then it will continue to fetch the API
  if (service.hasAccess()) {
    // Retrieve the tenantId from storage.
    var tenantId = service.getStorage().getValue('tenantId');
    // Make a request to retrieve user information.
    //var url = 'https://api.xero.com/api.xro/2.0/Organisations';
    var url = 'https://api.xero.com/api.xro/2.0/Accounts';
  
    var response = UrlFetchApp.fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + service.getAccessToken(),
        'Xero-tenant-id': tenantId
      },
    });
    
     var responseXml = response.getContentText();
  
    var responseCode = response.getResponseCode();
    //var responseText = response.getContentText();
    Logger.log(responseXml);
    if (responseCode === 200) {
       var dataAll = JSON.parse(response.getContentText());    
       writeCoa(dataAll);
     
     } else if (responseCode === 401) {
    
       PropertiesService.getScriptProperties().setProperty('isConnected', 'false')
       
       //send notification if error connection
       MailApp.sendEmail(IT_EMAIL, 'Xero:getXeroAccounts error', 'The Auth token has expired, run Xero > Settings (connect) ');

       throw new Error('The Auth token has expired, run Xero > Settings (connect)');
     }  
  } else {
    //it will return the authorization url
    //View - Logs , then copy paste the URL in the browser and allow access
    var authorizationUrl = service.getAuthorizationUrl();
    Logger.log('Open the following URL and re-run the script: %s',
        authorizationUrl);
        
    //send notification
    MailApp.sendEmail(IT_EMAIL, 'Xero:getXeroAccounts run', 'Open the following URL and re-run the script:  '+authorizationUrl);
  }
}

/**
 * Reset the authorization state, so that it can be re-tested.
 */
function reset() {
  getService().reset();
}

/**
 * Configures the service.
 */
function getService() {
  return OAuth2.createService('Xero')
    // Set the endpoint URLs.
    .setAuthorizationBaseUrl(
        'https://login.xero.com/identity/connect/authorize')
    .setTokenUrl('https://identity.xero.com/connect/token')

    // Set the client ID and secret.
    .setClientId(CLIENT_ID)
    .setClientSecret(CLIENT_SECRET)

    // Set the name of the callback function that should be invoked to
    // complete the OAuth flow.
    .setCallbackFunction('authCallback')

    // Set the property store where authorized tokens should be persisted.
    .setPropertyStore(PropertiesService.getScriptProperties())

    // Set the scopes to request from the user. The scope "offline_access" is
    // required to refresh the token. The full list of scopes is available here:
    // https://developer.xero.com/documentation/oauth2/scopes
    .setScope('accounting.settings offline_access');
};

/**
 * Handles the OAuth callback.
 */
function authCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    // Retrieve the connected tenants.
    var response = UrlFetchApp.fetch('https://api.xero.com/connections', {
      headers: {
        Authorization: 'Bearer ' + service.getAccessToken()
      },
    });
    var connections = JSON.parse(response.getContentText());
    // Store the first tenant ID in the service's storage. If you want to
    // support multiple tenants, store the full list and then let the user
    // select which one to operate against.
    service.getStorage().setValue('tenantId', connections[0].tenantId);
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied.');
  }
}

/**
 * Logs the redirect URI to register.
 * usually 'https://script.google.com/macros/d/{SCRIPT_ID}/usercallback'
 */
function logRedirectUri() {
  var service = getService();
  Logger.log(service.getRedirectUri());
}
