// based on Zen Liu code
// https://addons.mozilla.org/pl/firefox/addon/google-dictionary-and-google-t/
lingpl["utils"] = {
  HTMLParser: function(aHTMLString) {
    var html = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null);
    var body = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
    html.documentElement.appendChild(body);

    body.appendChild(Components.classes["@mozilla.org/feed-unescapehtml;1"]
      .getService(Components.interfaces.nsIScriptableUnescapeHTML)
      .parseFragment(aHTMLString, false, null, body));

    return body;
  },

  // can't use innerHTML property so here is workaround
  replaceHTML: function(container, html) {
    var nodes = container.childNodes;
    for(var i = 0; i < nodes.length; i++) {
      container.removeChild(nodes[i]);
    }
    // when array we have to append nodes manually
    if(html instanceof Array) {
      for(var i = 0; i < html.length; i++) {
        container.appendChild(html[i]);
      }
    }
    else {
      container.appendChild(html);  
    }
  },

  hover : {
    capture : function(evt)
    {
      lingpl.utils.hover.word = null;

      if (!evt.rangeParent || !evt.rangeParent.nodeType ||
        (evt.rangeParent.nodeType != Node.TEXT_NODE))
      {
        return;
      }

      var myWin = evt.originalTarget.ownerDocument.defaultView;

      lingpl.utils.hover.mouseX = evt.screenX;
      lingpl.utils.hover.mouseY = evt.screenY;

      if (lingpl.utils.hover.mousemoveTimeoutId)
        window.clearTimeout(lingpl.utils.hover.mousemoveTimeoutId);

      lingpl.utils.hover.mousemoveTimeoutId = window.setTimeout(
        lingpl.utils.hover.getPointedWord,
        500, 
        evt.rangeParent, 
        evt.rangeOffset,
        lingpl.utils.hover.mouseX,
        lingpl.utils.hover.mouseY,
        evt.ctrlKey);

      lingpl.utils.log("lingpl.utils.hover.capture ends");
    },

    getPointedWord : function(parnt, offset, x, y, isWithCtrl)
    {
      lingpl.utils.log("lingpl.utils.hover.getPointedWord starts: offset:" + offset
        + ", x:" + x + ", y:" + y);

      lingpl.utils.hover.word = null;

      if (lingpl.utils.hover.mouseX != x || lingpl.utils.hover.mouseY != y)
      {
        lingpl.utils.log("lingpl.utils.hover.getPointedWord Mouse moved away");
        return;
      }

      var text = parnt.textContent;

      if (text && text.length > 0)
      {
        lingpl.utils.hover.word = lingpl.utils.hover.getWord(text, offset);

        if (isWithCtrl)
          lingpl.dicInline.translate(lingpl.utils.hover.word, lingpl.popup.show, lingpl.utils.hover.mouseX, lingpl.utils.hover.mouseY);
      }

      lingpl.utils.log("lingpl.utils.hover.getPointedWord ends");
    },

    getWord: function(text, offset)
    {
      lingpl.utils.log("lingpl.utils.hover.getWord starts: text:" + text + ", offset:" + offset);

      var ch = text.charAt(offset);

      lingpl.utils.log("lingpl.utils.hover.getWord charAt(offset):" + ch);

      if (!ch || ch.length == 0 || lingpl.utils.hover.isSymbol(ch))
      {
        lingpl.utils.log("lingpl.utils.hover.getWord: no word");
        return null;
      }

      var len = text.length;
      var s = offset;
      var e = offset + 1;

      while (s > 0)
      {
        s--;

        ch = text.charAt(s);

        if (lingpl.utils.hover.isSymbol(ch))
        {
          // separator
          s++;
          break;
        }
      }

      while (e < len)
      {
        ch = text.charAt(e);

        if (lingpl.utils.hover.isSymbol(ch))
        {
          // separator
          break;
        }

        e++;
      }

      var word = text.substring(s, e);

      lingpl.utils.log("lingpl.utils.hover.getWord returns: " + word);

      return word;
    },

    isSymbol: function(ch)
    {
      if (ch < 'A' ||
        (ch > 'Z' && ch <'a') ||
        (ch > 'z' && ch <= '\x7f') ||
        (ch >= '\u0080' && ch <= '\u00BF') ||
        (ch >= '\u3000' && ch <= '\u303F') ||
        (ch >= '\uFF01' && ch <= '\uFF20') ||
        (ch >= '\uFF3B' && ch <= '\uFF40') ||
        (ch >= '\uFF5B' && ch <= '\uFF5E'))
      {
        return true;
      }
      else
        return false;
    }

  },

  mouseX: 0,
  mouseY: 0,

  tab: {
    open: function(url) {
      var win = Components.classes['@mozilla.org/appshell/window-mediator;1']
      .getService(Components.interfaces.nsIWindowMediator)
      .getMostRecentWindow('navigator:browser');
      win.openUILinkIn(url, 'tab');
    }
  },

  log: function(msg) {
    if(lingpl.options.debug)
      Application.console.log(msg);
  }
}
