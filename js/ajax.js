(function () { //function ajax for requests
  //static constant for identify state of request
  ajax.FAIL = 0;
  ajax.SUCCESS = 1;



  //static function for request
  ajax.get = function (url, headers) {
    if (!url) {
      alert("URL not defined");
      return new RequestDescriptor(ajax.FAIL);
    }
    var rd = new RequestDescriptor;
    var xhr = new XMLHttpRequest;
    xhr.open("GET", url);
    if (headers) {
      setHeaders(xhr, headers);
    }
    xhr.onload = function () {
      activateRequestDescriptor(xhr, rd);
    }
    xhr.send();
    return rd;
  }

  ajax.head = function (url, headers) {
    if (!url) {
      alert("URL not defined");
      return new RequestDescriptor(ajax.FAIL);
    }
    var rd = new RequestDescriptor;
    var xhr = new XMLHttpRequest;
    xhr.open("HEAD", url);
    if (headers) {
      setHeaders(xhr, headers);
    }
    xhr.onload = function () {
      activateRequestDescriptor(xhr, rd);
    }
    xhr.send();
    return rd;
  }

  ajax.post = function (url, data, headers) {
    if (!url) {
      alert("URL not defined");
      return new RequestDescriptor(ajax.FAIL);
    }
    //data in format key=value&key1=value1
    var rd = new RequestDescriptor;
    var xhr = new XMLHttpRequest;
    xhr.open("POST", url);
    if (headers) {
      setHeaders(xhr, headers);
    }
    xhr.onload = function () {
      activateRequestDescriptor(xhr, rd);
    }
    if (data) {
      xhr.send(data);
    } else {
      xhr.send();
    }
    return rd;
  }

  ajax.put = function (url, headers) {
    if (!url) {
      alert("URL not defined");
      return new RequestDescriptor(ajax.FAIL);
    }
    var rd = new RequestDescriptor;
    var xhr = new XMLHttpRequest;
    xhr.open("PUT", url);
    if (headers) {
      setHeaders(xhr, headers);
    }
    xhr.onload = function () {
      activateRequestDescriptor(xhr, rd);
    }
    xhr.send();
    return rd;
  }

  ajax.resource = function (url) {
    if (!url) {
      alert("URL not defined");
      return new RequestDescriptor(ajax.FAIL);
    }

    var rd = ajax.get(url, []).done();
    return rd;
  }

  //For POST, PATCH, PUT, and DELETE requests, parameters not 
  //included in the URL should be encoded as JSON with a Content-Type of 'application/json':
  function save() {
    var user = this._result[0];
    console.log("save", this, typeof this._result);
    var url = "https://api.github.com/user/" + user.id;
    var rd = new RequestDescriptor;
    var xhr = new XMLHttpRequest;
    xhr.open("PATCH", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
      activateRequestDescriptor(xhr, rd);
    }
    xhr.send({
      "name": "" + user.name
    });
    return rd;
  }

  function activateRequestDescriptor(xhr, rd) {
    //if RequestDescriptor has handler
    if (rd._onrequestdone) {
      //if request finish successed
      if (xhr.status == 200) {
        rd.setState(ajax.SUCCESS);
        rd.setResult(JSON.parse(xhr.responseText));
      } else {
        rd.setState(ajax.FAIL);
      }
      rd._onrequestdone();
    } else {
      //Timeout for adding _onrequestdone method
      setTimeout(function () {
        if (xhr.status == 200) {
          rd.setState(ajax.SUCCESS);
          rd.setResult(JSON.parse(xhr.responseText));
        } else {
          rd.setState(ajax.FAIL);
        }
        rd._onrequestdone();
      }, 1000);
    }
  }

  function setHeaders(xhr, headers) {
    if (headers) {
      for (var i = 0; i < headers.length; i++) {
        xhr.setRequestHeader(headers[i].name, headers[i].value);
      }
    }
  }

  function ajax(attr) {
    if (!("url" in attr)) {
      alert("URL not defined");
      return new RequestDescriptor(ajax.FAIL);
    }

    var method;
    if (attr.method) {
      method = attr.method.toUpperCase();
    } else {
      method = "GET";
    }
    var url = attr.url;
    var headers = attr.headers;
    var data = attr.data;

    switch (method) {
      case "GET":
        return ajax.get(url, headers);
      case "HEAD":
        return ajax.head(url, headers);
      case "POST":
        return ajax.post(url, data, headers);
      case "PUT":
        return ajax.put(url, headers);
      default:
        alert("Not correct method");
        return new RequestDescriptor(ajax.FAIL);
    }
  }

  //custom promise
  function RequestDescriptor(state) {
    if (arguments.length > 0) {
      this._state = state;
    } else {
      this._state = null;
    }

    this._onrequestdone = null;
    this._result = null;
  }

  RequestDescriptor.prototype.done = function (cb) {
    var rd = new RequestDescriptor;
    this._onrequestdone = function () {
      if (this._state) {
        if (cb) {
          cb(this);
        }
        rd._state = ajax.SUCCESS;
        rd.setResult(this._result);
        if (rd._onrequestdone) {
          rd._onrequestdone();
        }
      } else {
        alert("AJAX request was failed");
        rd._state = ajax.FAIL;
      }
    }

    if (this._result !== null) {
      this._onrequestdone();
    }
    //return new RD for chaining
    return rd;
  }

  RequestDescriptor.prototype.setState = function (state) {
    this._state = state;
  }

  RequestDescriptor.prototype.setResult = function (result) {
    if(result.forEach) { //if array
      this._result = result;
    } else {
      this._result = [result];
    }
    
  }

  RequestDescriptor.prototype.list = function () {
    waitingForResponse(this);
    return this;
  }

  RequestDescriptor.prototype.toString = function () {
    return JSON.stringify(this._result, null, 4);
  }

  RequestDescriptor.prototype.get = function (id) {
    if (id < 1 || isNaN(+id)) {
      throw new Error("not correct id");
    }

    waitingForResponse(this);
    //find id in this._result
    var user = this._result.find(function (user) {
      return user.id == id;
    })
    //if was not found make request
    if (!user) {
      return ajax.get("https://api.github.com/user/" + id);
    }
    var rd = new RequestDescriptor;
    rd.setResult([user]);
    rd._state = ajax.SUCCESS;
    rd._onrequestdone = this._onrequestdone;
    return rd;
  }

  RequestDescriptor.prototype.save = save;

  function waitingForResponse(context) {
    //waiting for ajax response
    if (context._result === null) {
      var timer = setInterval(function () {
        if (context._result !== null) {
          context._onrequestdone();
          clearInterval(timer);
        }
      }, 50)
    }
  }

  window.ajax = ajax;
})();