var FB_API = (function () {
	//var PageAccessToken = undefined;

	/*function getLoginStatus(callback) {
		FB.getLoginStatus.bind(this);

		FB.getLoginStatus(function(response) {
		  if (response.status === 'connected') {
		    this.PageAccessToken = response.authResponse.accessToken;
		    callback(this.PageAccessToken);
		    console.log("Access Token: ", accessToken);
		  } else {
		  	console.log("Not Connected; redirect to Login !");
		  }
		});
	}*/
/*
	function login(callback) {
		FB.login(getLoginStatus);
	}*/

	function search(searchText, callback) {
		FB.api(
		    '/search',
		    'GET',
		    { "q": searchText, "type": "page" },
		    function(response) {
		    	if (response.error) {
		    		console.error("ERROR : ", response.error.message);
		    	} else {
		    		callback(response.data);
		    	}
		    }
		);
	}
	
	return {
		search: search
	};
})();

// NOTE: DOM Util
var DOMUtil = (function () {
	var createElement = function (elementName, id) {
		var el = document.createElement(elementName);
		if (el && id) {
			el.setAttribute("id", id);
		}
		return el;
	};

	var setInnerHTML = function (el, innerHTML) {
		if (el) {
			el.innerHTML = innerHTML;
		}
	};

	var setAttributes = function (el, attributes) {
		if (el && attributes.length) {
			attributes.forEach(function (attribute, i) {
				el.setAttribute(attribute.name, attribute.value);
			});
		}
	};

	var attachEventHandlers = function (el, eventHandlers) {
		if (el && eventHandlers.length) {
			eventHandlers.forEach(function (event, i) {
				el[event.name] = event.handler;
			});
		}
	};

	var getInputElementValue = function (elementId) {
		var el = document.getElementById(elementId);
		return el ? el.value : undefined;
	};

	return {
		createElement: createElement,
		setInnerHTML: setInnerHTML,
		attachEventHandlers: attachEventHandlers,
		setAttributes: setAttributes,
		getInputElementValue: getInputElementValue
	};
})();

var PagesApp = (function (FB_API, DOMUtil) {
	var FAVOURITES = [];

	var getSearchText = function () {
		return DOMUtil.getInputElementValue('searchText');
	};

	var search = function () {
		FB_API.search(getSearchText(), updateList);
	};

	  /*<img src="http://lorempixum.com/100/100/nature/1">
      <h3>Headline</h3>
      <p>Lorem ipsum dolor sit amet...</p>*/

    var createOnClickHandler = function (i) {
    	return function (e) {
    		console.log("Clicked Element : ", e.target.id);
    	};
    };

    var updateList = function (data) {
		var list = document.getElementById('resultList');	
		list.innerHTML = '';

		for (var i=0;i < data.length; i++) {
	  		var item = DOMUtil.createElement('li', data[i].id);
	  		var span_text = DOMUtil.createElement('span');
	  		DOMUtil.setInnerHTML(span_text, data[i].name);
	  		
	  		var span_star = DOMUtil.createElement('span');
	  		DOMUtil.setInnerHTML(span_star, "☆");
	  		DOMUtil.setAttributes(span_star, [{
	  			name: "class",
	  			value: "unstar"
	  		}]);
	  		item.appendChild(span_text);
	  		item.appendChild(span_star);
	  		list.appendChild(item);
	  	}
	};

	var starItem = function (id) {
		if (this.FAVOURITES.indexOf(id) == -1) {
			this.FAVOURITES.push(id);
			return true;	
		} else {
			this.FAVOURITES.pop(id);
			return false;
		}		
	};

	starItem.bind(this);

	return {
		search: search,
		starItem: starItem,
		FAVOURITES: FAVOURITES
	};
})(FB_API, DOMUtil);

// NOTE : Events Util
var EventsUtil = (function (PagesApp) {
	var onEnter = function (e) {
		if (e.keyCode == 13) {
			PagesApp.search();
			return false;
		}
	};

	var onClick = function (e) {
		var id = e.target.parentElement.id;
		console.log("Clicked Element : ", id);
		if (e.target.className != "") {
			// NOTE : Clicked on Star
			if (PagesApp.starItem(id)) {
				e.target.className = "star";
			} else {
				e.target.className = "unstar";
			}
		} else {
			// NOTE : Clicked on List Item

		}
	};

	return {
		onEnter: onEnter,
		onClick: onClick
	};
})(PagesApp);
