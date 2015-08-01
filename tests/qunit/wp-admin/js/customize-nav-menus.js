/* global wp */
jQuery( function( $ ) {

	var api = wp.customize,
		primaryMenuId = 3,
		socialMenuId = 2;

	module( 'Customize Nav Menus' );

	/**
	 * Generate 20 ids and verify they are all unique.
	 */
	test( 'generatePlaceholderAutoIncrementId generates unique IDs', function() {
		var testIterations = 20,
			ids = [ api.Menus.generatePlaceholderAutoIncrementId() ];

		while ( testIterations ) {
			var placeholderID = api.Menus.generatePlaceholderAutoIncrementId();

			ok( -1 === ids.indexOf( placeholderID ) );
			ids.push( placeholderID );
			testIterations -= 1;
		}

	} );

	test( 'it should parse _wpCustomizeMenusSettings.defaults into itself', function() {
		deepEqual( window._wpCustomizeNavMenusSettings, api.Menus.data );
	} );

	test( 'empty menus should have no Menu Item Controls', function() {
		ok( 0 === wp.customize.Menus.getMenuControl( socialMenuId ).getMenuItemControls().length, 'empty menus' );
	} );

	test( 'populated menus should have no Menu Item Controls', function() {
		ok( 0 !== wp.customize.Menus.getMenuControl( primaryMenuId ).getMenuItemControls().length, 'non-empty menus' );
	} );

} );
