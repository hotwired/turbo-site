// basecamp/beanstalk@cc6284b
(function() {
  window.Beanstalk = {
    enablePageviewTracking: true,
    enablePresenceTracking: false,
    enableRUMTiming: true,
    generatePageviewIds: true,
    debug: false,
    presenceGranularity: 60,
    dev: location.host.match(/.*?\.dev/),
    uuid: null,
    _local_uuid: null,
    local_uuid: function() {
      var domain, domain_components;
      if (Beanstalk._local_uuid != null) {
        return Beanstalk._local_uuid;
      } else {
        Beanstalk._local_uuid = getCookie('_beanstalk_uuid') || getCookie('_beanstalk_uuid_ss');
        if (Beanstalk._local_uuid == null) {
          Beanstalk._local_uuid = (Beanstalk.S4() + Beanstalk.S4() + "-" + Beanstalk.S4() + "-4" + Beanstalk.S4().substr(0, 3) + "-" + Beanstalk.S4() + "-" + Beanstalk.S4() + Beanstalk.S4() + Beanstalk.S4()).toLowerCase();
        }
        domain_components = window.location.hostname.split(".");
        domain = "." + window.location.hostname;
        if (domain_components.length > 2) {
          domain = "." + (domain_components.slice(1, domain_components.length).join("."));
        }
        setCookie('_beanstalk_uuid', Beanstalk._local_uuid, 90, "None");
        setCookie('_beanstalk_uuid_ss', Beanstalk._local_uuid, 90);
        return Beanstalk._local_uuid;
      }
    },
    site_id: null,
    requests: [],
    resource_timing: [],
    pageview_timing: {},
    pageview: {},
    beaconURL: function() {
      var host, url;
      host = Beanstalk.dev ? "dash.test" : "beanstalk.37signals.com";
      return url = window.location.protocol + "//" + host + "/basecamp.gif?";
    },
    S4: function() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
  };

}).call(this);
(function() {
  Beanstalk.beacon = {
    params: [],
    enabled: true,
    autosend: true,
    sendBeaconEnabled: true,
    log: function(params) {
      var key, results, value;
      results = [];
      for (key in params) {
        value = params[key];
        results.push(Beanstalk.beacon.params.push([key, value]));
      }
      return results;
    },
    send: function() {
      var data, image, k, key, params, ref, request, url, v, value;
      if (Beanstalk.debug) {
        console.log(JSON.stringify(Beanstalk.beacon.params));
      }
      if (!Beanstalk.beacon.enabled) {
        return;
      }
      params = {};
      ref = Beanstalk.beacon.params;
      for (key in ref) {
        value = ref[key];
        if (typeof value !== "function") {
          if (typeof params[value[0]] === "undefined") {
            params[value[0]] = value[1];
          } else if (Object.prototype.toString.call(params[value[0]]) === "[object Array]") {
            params[value[0]].push(value[1]);
          } else {
            params[value[0]] = [params[value[0]], value[1]];
          }
        }
      }
      if (Object.keys(params).length) {
        if (Beanstalk.site_id) {
          params["site_id"] = Beanstalk.site_id;
        }
        if (Beanstalk.uuid) {
          params["uuid"] = Beanstalk.uuid;
        }
        params["local_uuid"] = Beanstalk.local_uuid();
        if (navigator.sendBeacon !== void 0 && Beanstalk.beacon.sendBeaconEnabled) {
          data = new FormData();
          for (k in params) {
            v = params[k];
            data.append(k, v);
          }
          Beanstalk.beacon.sendBeaconEnabled = navigator.sendBeacon(Beanstalk.beaconURL(), data);
        } else if (JSON.stringify(params).length < 4096) {
          url = Beanstalk.beaconURL();
          for (k in params) {
            v = params[k];
            url += "&" + k + "=" + (encodeURIComponent(v));
          }
          image = new Image;
          image.src = url;
          image.onerror = function() {
            if (Beanstalk.dev) {
              Beanstalk.beacon.enabled = false;
              return console.warn("disabling instrumentation beacon");
            }
          };
        } else {
          for (k in params) {
            v = params[k];
            if (Object.prototype.toString.call(v) === "[object Array]") {
              params[k] = v.join(",");
            }
          }
          request = new XMLHttpRequest();
          request.open('POST', Beanstalk.beaconURL(), true);
          request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
          request.send(params);
          request.onerror = function() {
            if (Beanstalk.dev) {
              Beanstalk.beacon.enabled = false;
              return console.warn("disabling instrumentation beacon");
            }
          };
        }
      }
      return Beanstalk.beacon.params = [];
    }
  };

}).call(this);
(function() {
  Beanstalk.logCohort = function(test, variation) {
    Beanstalk.beacon.log({
      'cohort[][experiment]': test,
      'cohort[][group]': variation
    });
    return Beanstalk.beacon.send();
  };

}).call(this);
(function() {
  var eventable;

  eventable = true;

  document.addEventListener('page:restore turbolinks:snapshot-load', function(e) {
    return eventable = false;
  });

  document.addEventListener('ready page:load turbolinks:load', function(e) {
    return eventable = true;
  });

  Beanstalk.logEvent = function(name, value) {
    if (eventable) {
      Beanstalk.beacon.log({
        "event[][name]": name,
        "event[][value]": value
      });
      if (Beanstalk.beacon.params.length) {
        return setTimeout(Beanstalk.beacon.send, 1000);
      } else {
        return Beanstalk.beacon.send;
      }
    }
  };

}).call(this);
(function() {
  var isColdBoot, logPageviewWhenVisible;

  Beanstalk.logPageview = function(options) {
    var defaults;
    if (Beanstalk.enablePageviewTracking) {
      if (options == null) {
        options = {};
      }
      if (Beanstalk.generatePageviewIds) {
        Beanstalk.lastPageviewId = (Beanstalk.S4() + Beanstalk.S4() + "-" + Beanstalk.S4() + "-4" + Beanstalk.S4().substr(0, 3) + "-" + Beanstalk.S4() + "-" + Beanstalk.S4() + Beanstalk.S4() + Beanstalk.S4()).toLowerCase();
        options["pageview[pageview_id]"] = Beanstalk.lastPageviewId;
      }
      defaults = {
        'pageview[host]': document.location.host,
        'pageview[path]': document.location.pathname,
        'pageview[query]': document.location.search,
        'pageview[referrer]': document.referrer,
        'browser[width]': window.innerWidth || 0,
        'browser[height]': window.innerHeight || 0,
        'browser[pixelRatio]': window.devicePixelRatio || 0,
        'browser[screenWidth]': screen.width,
        'browser[screenHeight]': screen.height,
        'tz': -(new Date().getTimezoneOffset() / 60)
      };
      options = extend({}, defaults, options);
      Beanstalk.beacon.log(options);
      Beanstalk.pageview = options;
      if (Beanstalk.beacon.autosend) {
        return setTimeout(Beanstalk.beacon.send, 500);
      } else {
        return setTimeout(Beanstalk.beacon.send, 5000);
      }
    }
  };

  logPageviewWhenVisible = function(type) {
    var pageviewLogged;
    pageviewLogged = false;
    if (document.visibilityState === "visible") {
      Beanstalk.logPageview({
        "pageview[type]": type
      });
      return pageviewLogged = true;
    } else {
      return document.addEventListener("visibilitychange", function() {
        if (document.visibilityState === "visible" && !pageviewLogged) {
          Beanstalk.logPageview({
            "pageview[type]": type
          });
          return pageviewLogged = true;
        }
      });
    }
  };

  isColdBoot = true;

  document.addEventListener('DOMContentLoaded', function(e) {
    isColdBoot = false;
    return logPageviewWhenVisible("Full page load");
  });

  document.addEventListener('page:load', function(e) {
    if (!isColdBoot) {
      return logPageviewWhenVisible("Turbolinks page load");
    }
  });

  document.addEventListener('turbolinks:load', function(e) {
    if (!isColdBoot && (e.data.timing.visitStart != null)) {
      if (e.data.timing.requestStart != null) {
        return logPageviewWhenVisible("Turbolinks page load");
      } else {
        return logPageviewWhenVisible("Turbolinks cache restore");
      }
    }
  });

}).call(this);
(function() {
  if (Beanstalk.enablePresenceTracking) {
    setInterval(function() {
      Beanstalk.beacon.log({
        "presence": true
      });
      return Beanstalk.beacon.send();
    }, Beanstalk.presenceGranularity * 1000);
  }

}).call(this);
(function() {
  Beanstalk.logSignup = function(product, account_id) {
    Beanstalk.beacon.log({
      "signup[product]": product,
      "signup[account_id]": account_id
    });
    return Beanstalk.beacon.send();
  };

}).call(this);
(function() {
  var Timing, changeStarted, clearResourceTimings, getEntries, getEntriesByName, getEntriesByType, hasTimingApi, isColdBoot, logPageviewTiming, logResourceTimings, oldOpen, onAjaxLoad, onAjaxProgress, skipPerformanceTracking, turboTimes;

  if (typeof Timing === "undefined") {
    Timing = {
      times: {}
    };
  }

  Beanstalk.Timing = {
    times: Timing.times,
    mark: function(e, t) {
      if (!t) {
        t = new Date().getTime();
      }
      return Beanstalk.Timing.times[e] = t;
    },
    init: function(times) {
      if (times !== void 0) {
        return Beanstalk.Timing.times = times;
      }
    }
  };

  getEntries = function() {
    if (window.performance === void 0 || window.performance.getEntries === void 0) {
      return [];
    } else {
      return window.performance.getEntries();
    }
  };

  getEntriesByName = function(name) {
    if (window.performance === void 0 || window.performance.getEntriesByName === void 0) {
      return [];
    } else {
      return window.performance.getEntriesByName(name);
    }
  };

  getEntriesByType = function(type) {
    if (window.performance === void 0 || window.performance.getEntriesByType === void 0) {
      return [];
    } else {
      return window.performance.getEntriesByType(type);
    }
  };

  clearResourceTimings = function() {
    Beanstalk.requests = [];
    if (window.performance === void 0) {

    } else if (window.performance.clearResourceTimings !== void 0) {
      return performance.clearResourceTimings();
    } else if (window.performance.webkitClearResourceTimings !== void 0) {
      return performance.webkitClearResourceTimings();
    }
  };

  hasTimingApi = function() {
    return window.performance !== void 0;
  };

  skipPerformanceTracking = function(url) {
    return url.match(/page_updates/) || url.match(/calendar_updates/) || url.match(/projects\.js/) || url.match(/stars$/) || url.match(/beacon\.gif/) || url.match(/progress\.js/) || url.match(/stage\.txt/);
  };

  onAjaxLoad = function(event) {
    var e, url;
    try {
      url = this.responseURL;
      if (typeof url !== "undefined" && url.match(document.location.hostname)) {
        return Beanstalk.requests.push({
          status: this.status,
          type: 'ajax',
          x_request_id: this.getResponseHeader("X-Request-Id"),
          x_runtime: this.getResponseHeader("X-Runtime") * 1000,
          content_length: this.getResponseHeader("Content-Length") || this.responseText.length,
          url: url || this.getResponseHeader("X-Request-Path")
        });
      }
    } catch (error) {
      e = error;
      if (Beanstalk.debug) {
        return console.log(e);
      }
    }
  };

  onAjaxProgress = function(event) {
    var e, url;
    try {
      url = this.responseURL;
      if (typeof url !== "undefined" && url.match(document.location.hostname)) {
        if (changeStarted && url.split("?")[0] === document.location.origin + document.location.pathname && typeof turboTimes["firstByte"] === "undefined") {
          return turboTimes["firstByte"] = new Date();
        }
      }
    } catch (error) {
      e = error;
      if (Beanstalk.debug) {
        return console.log(e);
      }
    }
  };

  oldOpen = XMLHttpRequest.prototype.open;

  window.XMLHttpRequest.prototype.open = function() {
    this.addEventListener("load", onAjaxLoad);
    this.addEventListener("progress", onAjaxProgress);
    return oldOpen.apply(this, arguments);
  };

  logPageviewTiming = function(timing) {
    var e, j, key, len, r, ref, request, times, value;
    if (!Beanstalk.enableRUMTiming) {
      return;
    }
    try {
      times = {};
      request = null;
      ref = Beanstalk.requests;
      for (j = 0, len = ref.length; j < len; j++) {
        r = ref[j];
        if (r.url !== void 0 && r.url !== void 0 && r.url.split("?")[0] === document.location.origin + document.location.pathname) {
          request = r;
          break;
        }
      }
      if (request) {
        Beanstalk.beacon.log({
          "xrequestid": request.x_request_id
        });
        times["x-runtime"] = request.x_runtime;
        times["x_request_id"] = request.x_request_id;
      }
      for (key in timing) {
        value = timing[key];
        if (typeof value === "string" || typeof value === "number") {
          times[key] = value;
        }
      }
      Beanstalk.pageview_timing = times;
      if (request) {
        Beanstalk.pageview_timing["x_request_id"] = request.x_request_id;
      }
      Beanstalk.beacon.log({
        "navigationTiming": JSON.stringify(times)
      });
      return setTimeout(Beanstalk.beacon.send, 500);
    } catch (error) {
      e = error;
      if (Beanstalk.debug) {
        return console.log(e);
      }
    }
  };

  logResourceTimings = function() {
    var e, i, j, key, len, r, realresources, ref, ref1, request, resources, times, value;
    if (!Beanstalk.enableRUMTiming) {
      return;
    }
    try {
      resources = getEntriesByType("resource");
      if (resources.length > 0) {
        realresources = [];
        for (i in resources) {
          if (!skipPerformanceTracking(resources[i].name)) {
            times = {};
            request = null;
            ref = Beanstalk.requests;
            for (j = 0, len = ref.length; j < len; j++) {
              r = ref[j];
              if (r.url === resources[i].name) {
                request = r;
                break;
              }
            }
            if (request) {
              times["x_request_id"] = request.x_request_id;
              times["status"] = request.status;
              times["x_runtime"] = Math.round(request.x_runtime);
              times["content_length"] = request.content_length;
            }
            ref1 = resources[i];
            for (key in ref1) {
              value = ref1[key];
              if (typeof value === "string" || typeof value === "number") {
                times[key] = value;
              }
            }
            realresources.push(times);
          }
        }
        Beanstalk.resource_timing = realresources;
        Beanstalk.beacon.log({
          "resourceTiming": JSON.stringify(realresources)
        });
        return setTimeout(Beanstalk.beacon.send, 100);
      }
    } catch (error) {
      e = error;
      if (Beanstalk.debug) {
        return console.log(e);
      }
    }
  };

  document.addEventListener('DOMContentLoaded', function(e) {
    Beanstalk.Timing.mark("domloaded");
    return Beanstalk.requests.push({
      url: document.location.origin + document.location.pathname,
      x_runtime: getCookie("X-Runtime") * 1000,
      x_request_id: getCookie("X-Request-Id")
    });
  });

  isColdBoot = true;

  window.onload = function() {
    var j, len, ref, t, times, v;
    isColdBoot = false;
    if (hasTimingApi()) {
      setTimeout(function() {
        return logPageviewTiming(performance.timing);
      }, 100);
    } else {
      Beanstalk.Timing.mark("done");
      times = {
        time_to_first_byte: Beanstalk.requests[0].x_runtime,
        frontend_time: new Date() - Beanstalk.Timing.times["firstbyte"]
      };
      ref = Beanstalk.Timing.times;
      for (v = j = 0, len = ref.length; j < len; v = ++j) {
        t = ref[v];
        times[t] = v;
      }
      logPageviewTiming(times);
    }
    return setTimeout(logResourceTimings, 200);
  };

  changeStarted = false;

  turboTimes = {};

  document.addEventListener('page:load turbolinks:load', function(e) {
    var j, k, len, r, ref, request, times, v;
    try {
      if (!isColdBoot) {
        times = {};
        if (e.data.timing != null) {
          if (e.data.timing.requestStart != null) {
            times = {
              time_to_first_byte: e.data.timing.requestEnd - e.data.timing.visitStart,
              frontend_time: e.data.timing.visitEnd - e.data.timing.requestEnd
            };
          } else {
            times = {
              time_to_first_byte: 0,
              frontend_time: e.data.timing.visitEnd - e.data.timing.visitStart
            };
          }
        } else {
          if (typeof turboTimes["firstByte"] === "undefined") {
            turboTimes["firstByte"] = new Date();
          }
          times = {
            time_to_first_byte: turboTimes["firstByte"] - turboTimes["changeStart"],
            frontend_time: new Date() - turboTimes["firstByte"]
          };
        }
        request = null;
        ref = getEntriesByType("resource");
        for (j = 0, len = ref.length; j < len; j++) {
          r = ref[j];
          if (r.name.split("?")[0] === document.location.origin + document.location.pathname) {
            request = r;
            break;
          }
        }
        if (request) {
          for (k in request) {
            v = request[k];
            if (typeof v === "number" && k !== "duration" && v >= request.startTime) {
              times[k] = v - request.startTime;
            }
          }
          times["duration"] = request.duration;
          times["x_request_id"] = request.x_request_id;
          times["x-runtime"] = request.x_runtime;
        }
        Beanstalk.pageview_timing = times;
        setTimeout(function() {
          return logPageviewTiming(times);
        }, 100);
        setTimeout(logResourceTimings, 300);
        changeStarted = false;
        return turboTimes = {};
      }
    } catch (error) {
      e = error;
      if (Beanstalk.debug) {
        return console.log(e);
      }
    }
  });

  document.addEventListener('page:receive', function(e) {
    return turboTimes["firstByte"] = new Date();
  });

  document.addEventListener('page:fetch page:beforechange workspace:visit page:before-change page:before-unload', function(e) {
    if (e.type === "page:before-change" || e.type === "page:beforechange" || !changeStarted) {
      clearResourceTimings();
      turboTimes["changeStart"] = new Date();
      return changeStarted = true;
    }
  });

}).call(this);
(function() {
  Beanstalk.logLazyLoadReport = function(report) {
    var params;
    if (report.entries.length) {
      params = {
        'pageview_id': Beanstalk.lastPageviewId,
        'browser[width]': window.innerWidth || 0,
        'browser[height]': window.innerHeight || 0,
        'browser[pixelRatio]': window.devicePixelRatio || 0,
        'browser[screenWidth]': screen.width,
        'browser[screenHeight]': screen.height
      };
      report = extend({}, params, {
        lazy_load_report: report
      });
      return Beanstalk.beacon.log(report);
    }
  };

}).call(this);
// bake a cookie (name, value, number of days until expiration, value for SameSite attribute)
function setCookie(cname, cvalue, exdays, sameSite) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    var sameSiteAttr = sameSite ? ";SameSite=" + sameSite : ""
    document.cookie = cname + "=" + cvalue + ";" + expires + ";Secure;path=/" + sameSiteAttr;
}

// pick a cookie, get a cookie
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
};
var extend = function(out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    if (!arguments[i])
      continue;

    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key))
        out[key] = arguments[i][key];
    }
  }

  return out;
};
