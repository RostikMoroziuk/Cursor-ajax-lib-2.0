(function () {
  function init() {
    //change request method
    $("#method").change(methodChange);
    $("#add-header").click(addHeader);
    $("#add-data").click(addBody);
    $("#send").click(makeRequest);

    getUsers();
  }

  function getUsers() {
    ajax({
      method: "GET",
      url: "https://api.github.com/users"
    }).done(function (result) {
      //formating JSON
      setTextarea(result);
    })
  }

  function methodChange() {
    switch ($(this).find("option:selected").attr("id")) {
      case "method-get":
        $(".new-request #add-data").addClass("disabled");
        break;
      case "method-head":
        $(".new-request #add-data").addClass("disabled");
        break;
      case "method-post":
        $(".new-request #add-data").removeClass("disabled");
        break;
      case "method-put":
        $(".new-request #add-data").addClass("disabled");
        break;
    }
  }

  function addHeader() {
    /*<div class="request-header">
        <button class="btn remove" type="button"><span class="glyphicon glyphicon-minus"></span></button>
        <input type="text" class="form-control header-name" placeholder="header">
        <input type="text" class="form-control header-value" placeholder="value">
      </div>*/
    var div = makeElement({
      name: "div",
      class: "request-header"
    });

    var button = makeElement({
      name: "button",
      class: "btn remove",
      type: "button",
      event: {
        name: "click",
        handler: removeHeader
      }
    });

    var span = makeElement({
      name: "span",
      class: "glyphicon glyphicon-minus",
    });
    button.append(span);

    var headerName = makeElement({
      name: "input",
      class: "form-control header-name",
      type: "text",
      placeholder: "header",
      required: "required"
    });
    var headerValue = makeElement({
      name: "input",
      class: "form-control header-value",
      type: "text",
      placeholder: "value",
      required: "required"
    });

    div.append(button, headerName, headerValue);

    $(".request-headers").append(div);
  }

  function removeHeader() {
    $(this).closest(".request-header").remove();
  }

  function addBody() {
    /*<div class="data">
        <button class="btn remove" type="button"><span class="glyphicon glyphicon-minus"></span></button>
        <input type="text" class="form-control key" placeholder="key">
        <input type="text" class="form-control value" placeholder="value">
      </div>*/
    if ($(this).find(".disabled").length > 0) {
      return;
    }
    var div = makeElement({
      name: "div",
      class: "data"
    });

    var button = makeElement({
      name: "button",
      class: "btn remove",
      type: "button",
      event: {
        name: "click",
        handler: removeData
      }
    });

    var span = makeElement({
      name: "span",
      class: "glyphicon glyphicon-minus",
    });
    button.append(span);

    var keyName = makeElement({
      name: "input",
      class: "form-control key",
      type: "text",
      placeholder: "key",
      required: "required"
    });
    var keyValue = makeElement({
      name: "input",
      class: "form-control value",
      type: "text",
      placeholder: "value",
      required: "required"
    });

    div.append(button, keyName, keyValue);

    $(".request-data").append(div);
  }

  function removeData() {
    $(this).closest(".data").remove();
  }

  //Element maker
  function makeElement(el) {
    if (!el.name) {
      return $("<div></div>");
    }

    var newElement = $("<" + el.name + "/>");
    for (var key in el) {
      if (key === "class") {
        newElement.addClass(el[key]);
      } else if (key === "event") {
        newElement.on(el[key].name, el[key].handler);
      } else {
        newElement.attr(key, el[key]);
      }
    }
    return newElement;
  }

  //AJAX request
  function makeRequest(e) {
    e.preventDefault();

    // clearTextarea();

    var method = $("#method option:selected").text();
    var url = "https://api.github.com/" + $("#url").val();
    var headers = parseHeaders();
    var data = parseData();

    switch (method) {
      case "GET":
        ajax.get(url, headers).done(function (result) {
          setTextarea(result);
        })
        break;
      case "HEAD":
        ajax.head(url, headers).done(function (result) {
          setTextarea(result);
        })
        break;
      case "PUT":
        // parameters not included in the URL should be encoded as JSON with a Content-Type of 'application/json':
        ajax.put(url, headers).done(function (result) {
          setTextarea(result);
        })
        break;
      case "POST":
        // parameters not included in the URL should be encoded as JSON with a Content-Type of 'application/json':
        headers.push({
          name: "Content-Type",
          value: "application/json"
        })
        ajax.post(url, data, headers).done(function (result) {
          setTextarea(result);
        })
        break;
      default:
        alert("Not correct method selected");
    }
  }

  function clearTextarea() {
    $("#response").text("");
  }

  function setTextarea(text) {
    $("#response").text(text);
  }

  //Parse headers from headers-field
  function parseHeaders() {
    var headersFields = $(".request-header");
    var headers = [];
    if (headersFields.length > 0) {
      headers = headersFields.toArray().map(function (field) {
        var headerName = $(field).find(".header-name").val();
        var headerValue = $(field).find(".header-value").val();
        return {
          name: headerName,
          value: headerValue
        };
      });
    }

    return headers;
  }

  //Parse data from data-field. Data send as JSON
  function parseData() {
    var dataFields = $(".data");
    var data = null;
    if (dataFields.length > 0) {
      data = dataFields.toArray().map(function (field) {
        var keyName = $(field).find(".key").val();
        var keyValue = $(field).find(".value").val();
        //return query string
        return {
          keyName: keyValue
        };
      });
      //return query string
      return JSON.stringify(data);
    }
    return data;
  }

  init();
})();