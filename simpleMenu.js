function SimpleMenu(options) {
	
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
	
	
	
	(function constructor() {
		
	}());
	
}