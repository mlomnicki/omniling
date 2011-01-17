lingpl["options"] = {
  read : function()
  {
    lingpl.utils.log("lingpl.options.read starts");

    var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    lingpl.options.user = prefs.getBranch("extensions.lingpl.");

    lingpl.options.setPreference("debug", "bool");
    lingpl.options.setPreference("enableSelect", "bool");
    lingpl.options.setPreference("enableDoubleClick", "bool");
    lingpl.options.setPreference("enableCtrlHover", "bool");
    lingpl.options.setPreference("queryUrl", "string");
    lingpl.options.setPreference("responseSectionsNum", "int");

    lingpl.utils.log("lingpl.options.read ends");
  },

  setPreference: function(key, type) {
    var value = null;
    switch(type) {
    case 'bool': value = lingpl.options.user.getBoolPref(key); break;
    case 'int': value = lingpl.options.user.getIntPref(key); break;
    default: value = lingpl.options.user.getCharPref(key);
    }
    lingpl.utils.log("Preference: " + key + " = " + value);
    // if preference has a value assigned
    if(value != null) {
      lingpl.options[key] = value
    }
  },

  notifyBrowser: function()
  {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator);
    var enumerator = wm.getEnumerator("navigator:browser");
    while(enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      if (win && win.lingpl)
        win.lingpl.options.read();
    }
  },

  debug: false,
  userOptions: null,
  // default values
  enableSelect: false,
  enableDoubleClick : true,
  enableCtrlHover: true,
  queryUrl: "http://www.ling.pl/php/lingfeed-30.php",
  responseSectionsNum: 1
}
