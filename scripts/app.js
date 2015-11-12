var FB_API = (function () {
	var PageAccessToken = undefined;

	function getLoginStatus(callback) {
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
	}

	function login(searchText, callback) {
		FB.login(function (response) {
			if (response.status === 'connected') {
				search(searchText, callback);
			}
		});
	}

	function search(searchText, callback) {
		FB.api(
		    '/search',
		    'GET',
		    { "q": searchText, "type": "page" },
		    function(response) {
		    	if (response.error) {
		    		console.error("ERROR : ", response.error.message);
		    		login(searchText, callback);
		    	} else {
		    		callback(response.data);
		    	}
		    }
		);
	}

	function getDetails(id, callback) {
		FB.api(
			'/' + id,
			'GET',
			{ "fields": "about" },
			function (response) {
				if (response.error) {
					console.error("ERROR : ", response.error.message);
				} else {
					callback(response);
				}
			}
		);
	}
	
	return {
		search: search,
		getDetails: getDetails
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
		return false;
	};

    var updateList = function (data) {
		var list = document.getElementById('resultList');	
		list.innerHTML = '';

		// NOTE : Sort in descending order
		data.sort(function (a, b) {
			return (b.name < a.name) ? -1 : (b.name > a.name) ? 1 : 0 ;
		});

		for (var i=0;i < data.length; i++) {
	  		var item = DOMUtil.createElement('li', data[i].id);
	  		var span_text = DOMUtil.createElement('span');
	  		DOMUtil.setInnerHTML(span_text, data[i].name);
	  		DOMUtil.setAttributes(span_text, [{
	  			name: "class",
	  			value: "page"
	  		}]);

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

	var showDetail = function (parent) {
		FB_API.getDetails(parent.id, function (data) {
			var detail = DOMUtil.createElement('div');
			DOMUtil.setInnerHTML(detail, data.about || "About Not Mentioned");
			DOMUtil.setAttributes(detail, [{
	  			name: "class",
	  			value: "detail"
	  		}]);
			parent.appendChild(detail);
		});
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
		showDetail: showDetail,
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
		var el, id;

		if (e.target.className == "star" || e.target.className == "unstar") {
			el = e.target;
			id = e.target.parentElement.id;
		} else {
			el = e.target.parentElement.id == "resultList" ? e.target : e.target.parentElement;
			id = el.id;
		}
				
		console.log("Clicked Element : ", id);

		if (el.className == "star" || el.className == "unstar") {
			// NOTE : Clicked on Star
			if (PagesApp.starItem(id)) {
				el.className = "star";
			} else {
				el.className = "unstar";
			}
		} else {
			// NOTE : Clicked on List Item
			if (el.shown) {
				el.shown = false;
				el.children[2].style.display = "none";
			} else {
				el.shown = true;
				if (el.children.length < 3) {
					PagesApp.showDetail(el);
				} else {
					el.children[2].style.display = "block";
				}
			}
		}
	};

	return {
		onEnter: onEnter,
		onClick: onClick
	};
})(PagesApp);
