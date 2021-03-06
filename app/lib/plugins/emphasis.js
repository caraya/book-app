/*
  Emphasis
  by Michael Donohoe (@donohoe)
  https://github.com/NYTimes/Emphasis
  http://open.blogs.nytimes.com/2011/01/10/emphasis-update-and-source/
*/
! function () {
  var t = {
    init: function () {
      this.config(), this.pl = !1, this.p = !1, this.h = !1, this.s = !1, this.vu = !1, this.kh = "|", this.addCSS(), this.readHash(), document.addEventListener("keydown", this.keydown)
    },
    config: function () {
      this.paraSelctors = document.querySelectorAll(".wrap p"), this.classReady = "emReady", this.classActive = "emActive", this.classHighlight = "emHighlight", this.classInfo = "emInfo", this.classAnchor = "emAnchor", this.classActiveAnchor = "emActiveAnchor"
    },
    addCSS: function () {
      var t = document.createElement("style");
      t.setAttribute("type", "text/css");
      var e = "p." + this.classActive + " span { background-color:#f2f4f5; } p span." + this.classHighlight + " { background-color:#fff0b3; } span." + this.classInfo + " { position:absolute; margin:-1px 0px 0px -8px; padding:0; font-size:10px; background-color: transparent !important} span." + this.classInfo + " a { text-decoration: none; } a." + this.classActiveAnchor + " { color: #000; font-size: 11px; }";
      try {
        t.innerHTML = e
      } catch (s) {
        t.styleSheet.cssText = e
      }
      document.getElementsByTagName("head")[0].appendChild(t)
    },
    readHash: function () {
      var t, e, s, a, i, n, r, l, h, c, o, p, g, f = decodeURI(location.hash),
        u = !1,
        d = [],
        A = {};
      if (f.indexOf("[") < 0 && f.indexOf("]") < 0) {
        if (e = /[ph][0-9]+|s[0-9,]+|[0-9]/g, f)
          for (; null !== (t = e.exec(f));)
            if (s = t[0].substring(0, 1), a = t[0].substring(1), "p" === s) u = parseInt(a, 10);
            else if ("h" === s) d.push(parseInt(a, 10));
        else {
          for (t = a.split(","), i = 0; i < t.length; i++) t[i] = parseInt(t[i], 10);
          A[d[d.length - 1]] = t
        }
      } else if (n = f.match(/p\[([^[\]]*)\]/), r = f.match(/h\[([^[\]]*)\]/), u = n && n.length > 0 ? n[1] : !1, h = r && r.length > 0 ? r[1] : !1)
        for (h = h.match(/[a-zA-Z]+(,[0-9]+)*/g), i = 0; i < h.length; i++)
          if (t = h[i].split(","), c = t[0], o = this.findKey(c).index, o !== l) {
            if (d.push(parseInt(o, 10) + 1), p = t, p.shift(), p.length > 0)
              for (g = 1; g < p.length; g++) p[g] = parseInt(p[g], 10);
            A[d[d.length - 1]] = p
          }
      this.p = u, this.h = d, this.s = A, this.goAnchor(u), this.goHighlight(d, A)
    },
    keydown: function (e) {
      var s = t,
        a = e.keyCode;
      s.kh = s.kh + a + "|", s.kh.indexOf("|16|16|") > -1 && (s.vu = s.vu ? !1 : !0, s.paragraphInfo(s.vu)), setTimeout(function () {
        s.kh = "|"
      }, 500)
    },
    paragraphList: function () {
      if (this.pl && this.pl.list.length > 0) return this.pl;
      var t, e, s, a = this,
        i = [],
        n = [],
        r = 0,
        l = this.paraSelctors.length;
      for (t = 0; l > t; t++) e = this.paraSelctors[t], (e.innerText || e.textContent || "").length > 0 && (s = a.createKey(e), i.push(e), n.push(s), e.setAttribute("data-key", s), e.setAttribute("data-num", r), e.addEventListener("click", function (t) {
        a.paragraphClick(t)
      }), r++);
      return this.pl = {
        list: i,
        keys: n
      }, this.pl
    },
    paragraphClick: function (e) {
      if (this.vu) {
        var s, a, i, n, r, l = t,
          h = !1,
          c = "P" === e.currentTarget.nodeName ? e.currentTarget : !1,
          o = "SPAN" === e.target.nodeName ? e.target : !1,
          p = "A" === e.target.nodeName ? e.target : !1;
        if (p && (l.hasClass(p, l.classActiveAnchor) || (l.updateAnchor(p), h = !0, e.preventDefault())), !c && !o) return void c.className.replace(l.classActive, "");
        if (l.hasClass(c, l.classReady)) l.hasClass(c, l.classActive) || !o || l.hasClass(o, l.classHighlight) ? (l.hasClass(c, l.classActive) || (l.removeAllWithClass(l.classActive), l.addClass(c, l.classActive)), o && (l.toggleClass(o, l.classHighlight), h = !0)) : (l.removeAllWithClass(l.classActive), l.addClass(c, l.classActive));
        else {
          for (s = this.getSentences(c), a = s.length, i = 0; a > i; i++) s[i] = "<span data-num='" + (i + 1) + "'>" + this.rtrim(s[i]) + "</span>";
          n = s.join(". ").replace(/__DOT__/g, ".").replace(/<\/span>\./g, ".</span>"), r = n.substring(n.length - 8).charCodeAt(0), -1 === "|8221|63|46|41|39|37|34|33|".indexOf(r) && (n += "."), c.innerHTML = n, c.setAttribute("data-sentences", a), this.removeAllWithClass(l.classActive), this.addClass(c, l.classActive), this.addClass(c, l.classReady), h = !0
        }
        h && this.updateURLHash()
      }
    },
    paragraphInfo: function (t) {
      var e, s, a, i, n, r, l, h;
      if (t) {
        if (e = document.querySelectorAll("span." + this.classInfo), 0 === e.length)
          for (s = this.paragraphList(), a = s.list.length, i = 0; a > i; i++) n = s.list[i] || !1, n && (r = s.keys[i], l = r === this.p ? " " + this.classActiveAnchor : "", n.innerHTML = "<span class='" + this.classInfo + "'><a class='" + this.classAnchor + l + "' href='#p[" + r + "]' data-key='" + r + "' title='Link to " + this.ordinal(i + 1) + " paragraph'>&para;</a></span>" + n.innerHTML)
      } else {
        for (h = document.querySelectorAll("span." + this.classInfo), a = h.length, i = 0; a > i; i++) this.removeFromDOM(h[i]);
        this.removeAllWithClass(this.classActive)
      }
    },
    updateAnchor: function (t) {
      this.p = t.getAttribute("data-key"), this.removeAllWithClass(this.classActiveAnchor), this.addClass(t, this.classActiveAnchor)
    },
    updateURLHash: function () {
      var t, e, s, a, i, n, r, l, h = "h[",
        c = document.querySelectorAll("p.emReady"),
        o = c.length;
      for (t = 0; o > t; t++)
        if (e = c[t].getAttribute("data-key"), this.hasClass(c[t], this.classHighlight)) h += "," + e;
        else if (s = c[t].querySelectorAll("span." + this.classHighlight), a = s.length, i = c[t].getAttribute("data-sentences"), a > 0 && (h += "," + e), i !== a)
        for (l = 0; a > l; l++) h += "," + s[l].getAttribute("data-num");
      n = this.p ? "p[" + this.p + "]," : "", r = (n + (h.replace("h[,", "h[") + "]")).replace(",h[]", "").replace("h[]", ""), location.hash = r
    },
    createKey: function (t) {
      var e, s, a, i, n, r, l = "",
        h = 6,
        c = (t.innerText || t.textContent || "").replace(/[^a-z\. ]+/gi, "");
      if (c && c.length > 1 && (e = this.getSentences(c), e.length > 0))
        for (s = this.cleanArray(e[0].replace(/[\s\s]+/gi, " ").split(" ")).slice(0, h / 2), a = this.cleanArray(e[e.length - 1].replace(/[\s\s]+/gi, " ").split(" ")).slice(0, h / 2), i = s.concat(a), n = i.length > h ? h : i.length, r = 0; n > r; r++) l += i[r].substring(0, 1);
      return l
    },
    findKey: function (t) {
      var e, s, a, i = this.paragraphList(),
        n = i.keys.length,
        r = !1,
        l = !1;
      for (e = 0; n > e; e++) {
        if (t === i.keys[e]) return {
          index: e,
          elm: i.list[e]
        };
        r || (s = this.lev(t.slice(0, 3), i.keys[e].slice(0, 3)), a = this.lev(t.slice(-3), i.keys[e].slice(-3)), 3 > s + a && (r = e, l = i.list[e]))
      }
      return {
        index: r,
        elm: l
      }
    },
    goAnchor: function (t) {
      if (t) {
        var e = isNaN(t) ? this.findKey(t).elm : this.paragraphList().list[t - 1] || !1;
        e && setTimeout(function () {
          window.scrollTo(0, e.offsetTop)
        }, 499)
      }
    },
    goHighlight: function (t, e) {
      if (t) {
        var s, a, i, n, r, l, h, c, o, p = t.length;
        for (s = 0; p > s; s++)
          if (a = this.paragraphList().list[t[s] - 1] || !1) {
            for (i = e[t[s].toString()] || !1, n = !i || 0 === i.length, r = this.getSentences(a), l = r.length, h = 0; l > h; h++) c = n ? h : i[h] - 1, r[h] = "<span data-num='" + (h + 1) + "'>" + r[h] + "</span>";
            for (h = 0; l > h; h++) c = n ? h : i[h] - 1, o = r[c] || !1, o && (r[c] = r[c].replace("<span", "<span class='" + this.classHighlight + "'"));
            a.setAttribute("data-sentences", l), a.innerHTML = r.join(". ").replace(/__DOT__/g, ".").replace(/<\/span>\./g, ".</span>"), this.addClass(a, "emReady")
          }
      }
    },
    getSentences: function (t) {
      var e, s, a = "string" == typeof t ? t : t.innerHTML,
        i = "Mr,Ms,Mrs,Miss,Msr,Dr,Gov,Pres,Sen,Prof,Gen,Rep,St,Messrs,Col,Sr,Jf,Ph,Sgt,Mgr,Fr,Rev,No,Jr,Snr",
        n = "A,B,C,D,E,F,G,H,I,J,K,L,M,m,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,etc,oz,cf,viz,sc,ca,Ave,St",
        r = "Calif,Mass,Penn,AK,AL,AR,AS,AZ,CA,CO,CT,DC,DE,FL,FM,GA,GU,HI,IA,ID,IL,IN,KS,KY,LA,MA,MD,ME,MH,MI,MN,MO,MP,MS,MT,NC,ND,NE,NH,NJ,NM,NV,NY,OH,OK,OR,PA,PR,PW,RI,SC,SD,TN,TX,UT,VA,VI,VT,WA,WI,WV,WY,AE,AA,AP,NYC,GB,IRL,IE,UK,GB,FR",
        l = "0,1,2,3,4,5,6,7,8,9",
        h = "aero,asia,biz,cat,com,coop,edu,gov,info,int,jobs,mil,mobi,museum,name,net,org,pro,tel,travel,xxx",
        c = "www",
        o = "__DOT__",
        p = (n + "," + r + "," + l + "," + c).split(","),
        g = p.length;
      for (e = 0; g > e; e++) a = a.replace(new RegExp(" " + p[e] + "\\.", "g"), " " + p[e] + o);
      for (p = (i + "," + l).split(","), g = p.length, e = 0; g > e; e++) a = a.replace(new RegExp(p[e] + "\\.", "g"), p[e] + o);
      for (p = h.split(","), g = p.length, e = 0; g > e; e++) a = a.replace(new RegExp("\\." + p[e], "g"), o + p[e]);
      return s = this.cleanArray(a.split(". "))
    },
    ordinal: function (t) {
      var e = ["th", "st", "nd", "rd"],
        s = t % 100;
      return t + (e[(s - 20) % 10] || e[s] || e[0])
    },
    lev: function (t, e) {
      var s, a, i, n, r = t.length,
        l = e.length,
        h = [];
      for (h[0] = [], l > r && (s = t, t = e, e = s, a = r, r = l, l = a), s = 0; l + 1 > s; s++) h[0][s] = s;
      for (i = 1; r + 1 > i; i++)
        for (h[i] = [], h[i][0] = i, n = 1; l + 1 > n; n++) h[i][n] = this.smallest(h[i - 1][n] + 1, h[i][n - 1] + 1, h[i - 1][n - 1] + (t.charAt(i - 1) === e.charAt(n - 1) ? 0 : 1));
      return h[r][l]
    },
    smallest: function (t, e, s) {
      return e > t && s > t ? t : t > e && s > e ? e : s
    },
    rtrim: function (t) {
      return t.replace(/\s+$/, "")
    },
    cleanArray: function (t) {
      var e, s = [];
      for (e = 0; e < t.length; e++) t[e] && t[e].replace(/ /g, "").length > 0 && s.push(t[e]);
      return s
    },
    removeClass: function (t, e) {
      t.className = t.className.replace(e, "")
    },
    removeAllWithClass: function (t) {
      for (var e = document.querySelectorAll("." + t), s = e.length, a = 0; s > a; a++) this.removeClass(e[a], t)
    },
    addClass: function (t, e) {
      this.hasClass(t, e) || (t.className = t.className + " " + e)
    },
    hasClass: function (t, e) {
      return -1 === t.className.indexOf(e) ? !1 : !0
    },
    removeFromDOM: function (t) {
      t.parentNode.removeChild(t)
    },
    toggleClass: function (t, e) {
      this.hasClass(t, e) ? this.removeClass(t, e) : this.addClass(t, e)
    }
  };
  document.addEventListener("DOMContentLoaded", function () {
    t.init()
  }, !0)
}();
