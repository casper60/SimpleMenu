function SimpleMenu(elementId, options) {
	
	'use strict';
	
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
		{ title: 'About', href: '#/about.php' },
		{ title: 'Contact', href: '#/contact' }
	];
	
	var wrapper;
	
	var menu = {
		getNode: function(node) {
			var str = '<li>';
			str += '<a href="' + (node.href || '#') + '">' + node.title + '</a>';
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
		build: function(data) {
			wrapper.innerHTML = '<ul class="js-menu">' + 
				menu.getTree(data) + 
			'</ul>';
			
			// Attach CSS transitions if supported
			if (wrapper.style.transition !== undefined) {
				
			}
		}
	};
	
	
	(function constructor() {
		wrapper = document.getElementById(elementId);
		
		// TODO: support fetching json data from url
		try {
			menu.build(exampleData);
		} catch(err) {
			throw 'Error fetching json data! ' + err;
		}
		
	}());
	
}