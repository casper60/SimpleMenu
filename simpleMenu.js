(function() {
	
	'use strict';
	
	/*
	 * 	JS-Menu - Apache License Version 2.0
	 *  ------------------------------------------------
	 *  -> by Casper Knudsen <casper@frontender.eu>
	 *  
	 * 
	 * 	Local data example:
	 * 
	 * 	{
	 * 	  	data: [
	 *			{
	 * 				title: 'Frontpage',
	 * 				href: '#/frontpage',
	 * 				classNames: ['is-private']
	 * 			},
	 * 			{
	 * 				title: 'Photo albums',
	 * 				children: [
	 * 					{
	 *	 					title: '1950-1990',
	 *						href: '#/photos/1950-1990/'
	 * 					}
	 * 				]
	 *			}
	 *		],
	 *		selected: '#/frontpage',
	 *		selectOnClick: true,
	 *		animate: true
	 * 	}
	 * 
	 * 
	 * 	Remote data example:	
	 * 
	 * 	{
	 * 		jsonUrl: '/api/data.php',
	 * 		selected: '#/frontpage',
	 * 		selectOnClick: true,
	 * 		animated: true
	 * 	}
	 * 
	*/
	
	window.SimpleMenu = function(elementId, options) {
		if (!elementId || typeof elementId !== 'string')
			throw 'Error: first parameter should be the element id! <string>';
			
		if (!options || typeof options !== 'object')
			throw 'Error: Second parameter should be your options! <object>';
		
		var menu = {
			elm: document.getElementById(elementId),
			
			hasSelection: function(children) {
				var hasSelection = false;
				for (var i = 0; i < children.length; i++) {
					var child = children[i],
						childHasSelection = child.children && this.hasSelection(child.children); 
					if (child.href === options.selected || childHasSelection)
						hasSelection = true;
				}
				return hasSelection;
			},
			
			addSelectedCss: function(node) {
				var hasSelection = node.children && this.hasSelection(node.children);
				if (node.href === options.selected || hasSelection) {
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
					var node = this.addSelectedCss(nodes[i]);
					html += this.getListItem(node);
					
					// Call this function recursively to render any child nodes
					if (node.children && node.children.length > 0) {
						html += this.getListItems(node.children) + '</ul></li>';
					}
				}
				return html;
			},
			
			build: function() {
				var html = this.getListItems(options.data || []); 
				this.elm.innerHTML = '<ul class="js-menu">' + html + '</ul>';
				
				if (options.animate === true)
					this.addAnimation();
					
				if (options.selectOnClick)
					this.setSelectionOnClick();
			},
			
			setSelectionOnClick: function () {
				var listItems = this.elm.querySelectorAll('li');
				for (var i = 0; i < listItems.length; i++) {
					var listItem = listItems[i];
					
					// Only attach click event when link has no children
					if (!listItem.querySelector('ul')) {
						listItem.querySelector('a').addEventListener('click', function(e) {
							e.stopImmediatePropagation();
							options.selected = e.target.getAttribute('href'); 
							menu.setSelected();
						});
					}
				}
			},
			
			addAnimation: function() {
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
			
			mapSelected: function(node) {
				if (!node.classNames || typeof node.classNames !== 'object')
					return node;
					
				var index = node.classNames.indexOf('is-selected');
				if (index !== -1)
					node.classNames.splice(index, 1);
				if (node.children)
					node.children = node.children.map(menu.mapSelected);
				return node;
			},
			
			setSelected: function() {
				options.data = options.data.map(this.mapSelected);
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
			
			select: function(selectedStr) {
				if (!selectedStr || typeof selectedStr !== 'string')
					throw 'Error: you are missing the selection! <string>';
				options.selected = selectedStr;
				menu.setSelected();
			},
			
			animate: function(animateBool) {
				if (typeof animateBool !== 'boolean')
					throw 'Error: you are missing the enable animation state! <boolean>';
				options.animate = animateBool;
				menu.build();
			}
		};
	}
	
}());