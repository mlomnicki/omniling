var lingpl = {
  self: this,
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("lingpl-strings");
    var appcontent = document.getElementById("appcontent");   // browser
    if (appcontent)
    {
      appcontent.addEventListener("load", this.contentLoadHandler, true);
    }

    log("lingpl initialization complete");
  },

  contentLoadHandler : function(evt)
  {
    log("this.contentLoadHandler starts");

    var doc = evt.originalTarget;
    if (doc instanceof HTMLDocument)
    {
      // register mouse handlers
      // we register them with content documents only because we
      // do not want the events fired when user click on menues, etc.
      doc.addEventListener("dblclick", lingpl.clickHandler, true);
      doc.addEventListener("mousemove", lingpl.mousemoveHandler, true);
    }

    log("this.contentLoadHandler ends");
  },

  clickHandler : function(evt)
  {
    log("lingpl.clickHandler starts");

    if (2 == evt.detail)
    {
      if (lingpl.prefs.enableDoubleClick)
      {
        lingpl.select.lookup(evt);
      }
    }
    else if (1 == evt.detail)
    {
      if (lingpl.prefs.enableSelect)
      {
        lingpl.select.lookup(evt);
      }
    }

    log("lingpl.clickHandler ends");
  },

  mousemoveHandler : function(evt)
  {
    //log("lingpl.mousemoveHandler starts");

    if (lingpl.prefs.enableCtrlHover)
    {
      if (evt.ctrlKey && !evt.shiftKey && !evt.altKey && !evt.metaKey)
      {
        // Ctrl + hover
        utils.hover.capture(evt);
      }
    }

    //log("lingpl.mousemoveHandler ends");
  },

  prefs : {
    read : function()
    {
      log("lingpl.prefs.read starts");

      var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
      var myprefs = prefs.getBranch("extensions.lingpl.");

      lingpl.prefs.setPreference("enableSelect", "bool");
      lingpl.prefs.setPreference("enableDoubleClick", "bool");
      lingpl.prefs.setPreference("enableCtrlHover", "bool");
      lingpl.prefs.setPreference("queryUrl", "string");
      lingpl.prefs.setPreference("responseSectionsNum", "int");

      log("lingpl.prefs.read ends");
    },

    setPreference: function(key, type) {
      var value = null;
      switch(type) {
      case 'bool': value = getBoolPref(key);
      case 'int': value = getIntPref(key);
      default: value = getStringPref(key);
      }
      log("Preference: " + key + " = " + value);
      // if preference has a value assigned
      if(value != null) {
        lingpl.prefs[key] = value
      }
    },

    // default values
    enableSelect: false,
    enableDoubleClick : true,
    enableCtrlHover: true,
    queryUrl: "http://www.ling.pl/php/lingfeed-30.php",
    responseSectionsNum: 1
  },

  select : {
    lookup : function(evt)
    {
      var myWin = evt.originalTarget.ownerDocument.defaultView;

      lingpl.select.lookupInWin(myWin, evt.screenX, evt.screenY);
    },

    lookupSelected : function()
    {
      var myWin = window.content;

      if (myWin) {
        lingpl.select.lookupInWin(myWin, myWin.screenX, myWin.screenY);
      }
    },

    lookupInWin : function(myWin, popupX, popupY)
    {
      var selected = myWin.getSelection();

      if (selected)
      {
        var word = selected.toString();

        if (word && word.length > 0)
        {
          lingpl.dicInline.translate(word, lingpl.popup.show, popupX, popupY);
        }
      }
    },

    mouseX : 0,
    mouseY : 0,

  },   // lingpl.select

  dicInline : {
    translate: function(word, callback, mouseX, mouseY)
    {
      log("lingpl.dicInline.translate starts");

      lingpl.dicInline.word = null;

      if (word && word.length > 0)
      {
        word = word.replace(/^\s+|\s+$/g, "");  // trim spaces.

        lingpl.dicInline.word = word;

        callback(mouseX, mouseY);   // ...popup.show()

        lingpl.dicInline.lookupDict();

      }

      log("lingpl.dicInline.translate ends");
    },

    lookupDict: function()
    {
      var req = XMLHttpRequest();
      var params = "sType=2&word=" + lingpl.dicInline.word;
      req.open("POST", lingpl.prefs.queryUrl, true);
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      req.setRequestHeader("Content-length", params.length);
      req.setRequestHeader("Connection", "close");
      req.onreadystatechange = function () {
        if (req.readyState == 4)
        {
          lingpl.dicInline.processDictResponse(req.responseText);
        }
      };
      req.send(params);
    },

    processDictResponse: function(respText) {
      log("Response: " + respText);
      lingpl.popup.write(respText);
    }

  },

  popup : {
    show: function(mouseX, mouseY)
    {
      lingpl.popup.write("Translating...");
      lingpl.popup.open(mouseX, mouseY + 18);
    },

    open: function(mouseX, mouseY) {
      var popup = lingpl.popup.get();
      popup.openPopupAtScreen(mouseX, mouseY, false);
    },

    close: function() {
      var popup = lingpl.popup.get();
      popup.hidePopup(); 
    },

    get: function() {
      return document.getElementById("lingplpopup");
    },

    HTMLParser: function(aHTMLString) {
      var html = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null);
      var body = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
      html.documentElement.appendChild(body);

      body.appendChild(Components.classes["@mozilla.org/feed-unescapehtml;1"]
        .getService(Components.interfaces.nsIScriptableUnescapeHTML)
        .parseFragment(aHTMLString, false, null, body));

      return body;
    },

    write : function(text)
    {
      log("lingpl.popup.write starts");
      var doc = lingpl.popup.HTMLParser(text);
      var definitions = doc.getElementsByClassName("dictdef");
      if (definitions) {
        definitions = Array.slice(definitions, 0, lingpl.prefs.responseSectionsNum);
      }
      var html = definitions || doc;
      lingpl.popup.replace(html);

      log("lingpl.popup.write ends");
    },

    // can't use innerHTML property so here is workaround
    replace: function(html) {
      var container = document.getElementById("lingPlPopupContent");
      var nodes = container.childNodes;
      for(var i = 0; i < nodes.length; i++) {
        container.removeChild(nodes[i]);
      }
      // when array we have to append nodes manually
      if(html instanceof Array) {
        for(var i = 0; i < html.length; i++)
          container.appendChild(html[i]);
      }
      else {
        container.appendChild(html);  
      }
    },

    popup : null,

  },  // lingpl.popup

  container: null

};

window.addEventListener("load", function() { lingpl.onLoad(); }, false);
