// based on Zen Liu code
// https://addons.mozilla.org/pl/firefox/addon/google-dictionary-and-google-t/
var lingpl = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("lingpl-strings");
    var appcontent = document.getElementById("appcontent");   // browser
    lingpl.options.read();
    if (appcontent)
    {
      appcontent.addEventListener("load", this.contentLoadHandler, true);
    }

    lingpl.log("lingpl initialization complete");
  },

  contentLoadHandler : function(evt)
  {
    lingpl.log("this.contentLoadHandler starts");

    var doc = evt.originalTarget;
    if (doc instanceof HTMLDocument)
    {
      // register mouse handlers
      // we register them with content documents only because we
      // do not want the events fired when user click on menues, etc.
      doc.addEventListener("click", lingpl.clickHandler, true);
      doc.addEventListener("mousemove", lingpl.mousemoveHandler, true);
    }

    lingpl.log("this.contentLoadHandler ends");
  },

  clickHandler : function(evt)
  {
    lingpl.log("lingpl.clickHandler starts");

    if (2 == evt.detail)
    {
      lingpl.log("enableDoubleClick: " + lingpl.options.enableDoubleClick);
      if (lingpl.options.enableDoubleClick)
      {
        lingpl.select.lookup(evt);
      }
    }
    else if (1 == evt.detail)
    {
      if (lingpl.options.enableSelect)
      {
        lingpl.select.lookup(evt);
      }
    }

    lingpl.log("lingpl.clickHandler ends");
  },

  mousemoveHandler : function(evt)
  {
    if (lingpl.options.enableCtrlHover)
    {
      if (evt.ctrlKey && !evt.shiftKey && !evt.altKey && !evt.metaKey)
      {
        // Ctrl + hover
        lingpl.utils.hover.capture(evt);
      }
    }
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
      lingpl.log("lingpl.dicInline.translate starts");

      lingpl.dicInline.word = null;

      if (word && word.length > 0)
      {
        word = word.replace(/^\s+|\s+$/g, "");  // trim spaces.

        lingpl.dicInline.word = word;

        callback(mouseX, mouseY);   // ...popup.show()

        lingpl.dicInline.lookupDict();

      }

      lingpl.log("lingpl.dicInline.translate ends");
    },

    lookupDict: function()
    {
      var req = XMLHttpRequest();
      var params = "sType=2&word=" + lingpl.dicInline.word;
      req.open("POST", lingpl.options.queryUrl, true);
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      req.setRequestHeader("Content-length", params.length);
      req.setRequestHeader("Connection", "close");
      req.onreadystatechange = function () {
        if (req.readyState == 4)
        {
          if(req.status == 200)
            lingpl.dicInline.processDictResponse(req.responseText);
          else
            lingpl.popup.write(lingpl.strings.getString("service_error"));
        }
      };
      req.send(params);
    },

    processDictResponse: function(respText) {
      lingpl.log("Response: " + respText);
      lingpl.popup.write(respText);
    }

  },

  popup : {
    show: function(mouseX, mouseY)
    {
      lingpl.popup.write(lingpl.strings.getString("translating"));
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

    getContent: function() {
      return document.getElementById("lingPlPopupContent");
    },

    write : function(text)
    {
      lingpl.log("lingpl.popup.write starts");
      var doc = lingpl.utils.HTMLParser(text);
      var definitions = doc.getElementsByClassName("dictdef");
      var html = doc;
      if (definitions.length > 0) {
        definitions = Array.slice(definitions, 0, lingpl.options.responseSectionsNum);
        html = definitions
      }
      lingpl.utils.replaceHTML(lingpl.popup.getContent(), html);

      lingpl.log("lingpl.popup.write ends");
    },

    popup : null,

  },  // lingpl.popup

  log: function(text) {
    lingpl.utils.log(text);
  }

};

window.addEventListener("load", function() { lingpl.onLoad(); }, false);
