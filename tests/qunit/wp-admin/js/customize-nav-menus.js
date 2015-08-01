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

	// @todo Add tests for api.Menus.AvailableMenuItemsPanelView (and api.Menus.AvailableItemCollection, api.Menus.AvailableItemCollection, api.Menus.AvailableItemModel)

	// @todo Add tests for api.Menus.MenusPanel
	// @todo Add tests for api.Menus.MenuSection
	// @todo Add tests for api.Menus.NewMenuSection
	// @todo Add tests for api.Menus.MenuLocationControl
	// @todo Add tests for api.Menus.MenuItemControl
	// @todo Add tests for api.Menus.MenuNameControl
	// @todo Add tests for api.Menus.MenuAutoAddControl
	// @todo Add tests for api.Menus.MenuControl
	// @todo Add tests for api.Menus.NewMenuControl
	// @todo Add tests for api.Menus.applySavedData
	// @todo Add tests for api.Menus.focusMenuItemControl

	test( 'api.Menus.getMenuControl() should return the expected control', function() {
		var control = api.Menus.getMenuControl( primaryMenuId );
		ok( !! control, 'control is returned' );
		ok( control.extended( api.Menus.MenuControl ), 'control is a MenuControl' );
	} );

	test( 'api.Menus.getMenuItemControl() should return the expected control', function() {
		var control = api.Menus.getMenuItemControl( 2000 );
		ok( !! control, 'control is returned' );
		ok( control.extended( api.Menus.MenuItemControl ), 'control is a MenuItemControl' );
	} );

} );
