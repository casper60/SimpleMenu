(function() {
	
	'use strict';
	
	window.SimpleMenu = function(elementId, options) {
		if (!elementId || typeof elementId !== 'string')
			throw 'Error: first parameter should be the element id! <string>';
			
		if (!options || typeof options !== 'object')
			throw 'Error: Second parameter should be your options! <object>';
		
		// TODO: support setting selections down the tree
		// We should select any parent that has a selected child
		
		var menu = {
			elm: document.getElementById(elementId),
			
			addClassNames: function(node) {
				if (node.href === options.selected) {
					if (!node.classNames)
						node.classNames = [];	
					if (node.classNames.indexOf('is-selected') === -1)					
						node.classNames.push('is-selected');
				}
				return node;
			},
			
			getListItem: function(node) {
				var link = node.href ? ' href="' + node.href + '"' : '',
					classNames = node.classNames ? ' class="' + node.classNames.join(' ') + '"' : '',
					html = '<li' + classNames + '><a' + link + '>' + node.title + '</a>';
				if (node.children) {
					html += '<div class="menu-indicator"></div>';
				}
				html += node.children ? '<ul>' : '</li>';
				return html;
			},
			
			getListItems: function(nodes) {
				var html = '';
				for (var i = 0; i < nodes.length; i++) {
					var node = this.addClassNames(nodes[i]);
					html += this.getListItem(node);
					
					// Call this function recursively to render any child nodes
					if (node.children && node.children.length > 0) {
						html += this.getListItems(node.children) + '</ul></li>';
					}
				}
				return '<ul class="js-menu">' + html + '</ul>';
			},
			
			build: function() {
				this.elm.innerHTML = this.getListItems(options.data || []);
				if (options.animation === true)
					this.addAnimation();
			},
			
			addAnimation: function() {
				// Add CSS transitions when supported
				if (this.elm.style.transition === undefined)
					return;
					
				var listItems = this.elm.querySelectorAll('li');
				
				function toggleFade(e) {
					var isActive = e.type === 'mouseover';
					e.currentTarget.classList.toggle('fade-in', isActive);
				}
				
				for (var i = 0; i < listItems.length; i++) {
					var listItem = listItems[i];
					listItem.addEventListener('mouseover', toggleFade);
					listItem.addEventListener('mouseout', toggleFade);
				}
				
				this.elm.querySelector('.js-menu').classList.add('css-anim');
			},
			
			getJson: function() {
				try {
					var req = new XMLHttpRequest();
					req.onload = function(ev) {
						if (req.status === 200) {
							try {
								options.data = JSON.parse(this.responseText); 
								menu.build();
							} catch(error) {
								throw 'Error: JSON response could not be parsed!';
							}
						} else {
							throw 'Error: JSON request responded with status code: ' + req.status;
						}
					};
					req.onerror = function(err) {
						throw 'Error: JSON request failed! ' + err;
					};
					req.open('POST', options.jsonUrl, true);
					req.setRequestHeader('Cache-Control', 'no-cache');
					req.setRequestHeader('Content-Type', 'application/json');
					req.send();
				} catch(err) {
					throw 'Error fetching json data! ' + err;
				}
			},
			
			setSelected: function() {
				options.data = options.data.map(function(node) {
					if (node.classNames && typeof node.classNames === 'object') {
						var index = node.classNames.indexOf('is-selected');
						if (index !== -1) node.classNames.splice(index, 1);
					}
					return node;
				});
				this.build();
			}
		};
		
		(function constructor() {
			if (options.jsonUrl) {
				menu.getJson();
			} else {
				menu.build();
			}
		}());
		
		return {
			update: function(dataArr) {
				if (!dataArr || typeof dataArr !== 'object')
					throw 'Error: you are missing the array of data to update to! <array>';
				options.data = dataArr;
				menu.build();
			},
			
			updateJson: function(urlStr) {
				if (!options.jsonUrl && !urlStr)
					throw 'Error: you are missing a url to the json data! <string>';
				options.jsonUrl = urlStr ? urlStr : options.jsonUrl;	
				menu.getJson();
			},
			
			setSelected: function(selectedStr) {
				if (!selectedStr || typeof selectedStr !== 'string')
					throw 'Error: you are missing the selection! <string>';
				options.selected = selectedStr;
				menu.setSelected();
			},
			
			toggleAnimation: function(enableBool) {
				if (typeof enableBool !== 'boolean')
					throw 'Error: you are missing the enable animation state! <boolean>';
				options.animation = enableBool;
				menu.build();
			}
		};
	}
	
}());