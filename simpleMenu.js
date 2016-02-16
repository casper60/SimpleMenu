function SimpleMenu(elementId, options) {
	
	'use strict';
	
	if (!elementId)
		throw 'Error: Missing first parameter elementId!';
	
	var exampleData = [
		{ title: 'Frontpage', href: '#/frontpage' },
		{ title: 'Photo albums', children: [
			{ title: '1950-1990', href: '#/photos/1950-1990/' },
			{ title: '1991-2000', href: '#/photos/1991-2000/' },
			{ title: '2001-2014', children: [
				{ title: 'Summer', href: '#/photos/2001-2014/summer/' },
				{ title: 'Winther', href: '#/photos/2001-2014/winther/' }
			] }
		] },
		{ title: 'About', href: '#/about' },
		{ title: 'Contact', href: '#/contact' }
	];
	
	if (!options)
		options = {}; 
	
	var wrapper;
	
	var menu = {
		getNode: function(node) {
			var link = node.href ? ' href="' + node.href + '"' : '',
				str = '<li><a' + link + '>' + node.title + '</a>';
			if (node.children)
				str += '<div class="menu-indicator"></div>';
			str += node.children ? '<ul>' : '</li>';
			return str;
		},
		getTree: function(nodes) {
			var tree = '';
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				tree += menu.getNode(node);
				
				// Call this function recursively to render any child nodes
				if (node.children && node.children.length > 0) {
					tree += menu.getTree(node.children) + '</ul></li>';
				}
			}
			return tree;
		},
		fadeMenu: function(e) {
			var isActive = e.type === 'mouseover';
			e.currentTarget.classList.toggle('fade-in', isActive);
		},
		build: function(data) {
			wrapper.innerHTML = '<ul class="js-menu">' + 
				menu.getTree(data) + 
			'</ul>';
			
			// Attach CSS transitions if supported
			if (wrapper.style.transition !== undefined) {
				wrapper.querySelector('.js-menu').classList.add('css-anim');
				
				var listItems = wrapper.querySelectorAll('li');
				for (var i = 0; i < listItems.length; i++) {
					var listItem = listItems[i];
					listItem.addEventListener('mouseover', menu.fadeMenu);
					listItem.addEventListener('mouseout', menu.fadeMenu);
				}
			}
		}
	};
	
	
	(function constructor() {
		wrapper = document.getElementById(elementId);
		
		if (options.jsonUrl) {
			try {
				var req = new XMLHttpRequest();
				
				req.onload = function(ev) {
					try {
						menu.build(JSON.parse(this.responseText));
					} catch(error) {
						menu.build(options.data || exampleData);
						console.log('Error: JSON response could not be parsed! (using example data)');
					}
				};
				
				req.onerror = function(err) {
					throw 'Error: could not get JSON data! ' + err;
				};
				
				req.open('POST', options.jsonUrl, true);
				req.setRequestHeader('Cache-Control', 'no-cache');
				req.setRequestHeader('Content-Type', 'application/json');
				
				req.send();
			} catch(err) {
				throw 'Error fetching json data! ' + err;
			}
		} else {
			menu.build(options.data || exampleData);
			console.info('Error: no jsonUrl in options! (using example data)');
		}
	}());
	
}