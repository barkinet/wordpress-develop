/* global wp */
jQuery( function( $ ) {

	var api = wp.customize;
	module( 'Customize Nav Menus', {
		setup: function() {
			// Init the menus?
			//wp.customize.HeaderTool.currentHeader = new wp.customize.HeaderTool.ImageModel();
			//console.log( api.Menus.availableMenuItems );
		},
		teardown: function() {
			// Maybe restore things?
		}

	});

	//$.extend( api.Menus.data, window._wpCustomizeMenusSettings );

	/**
	 * Generate 20 ids and verify they are all unique.
	 */
	test( 'generatePlaceholderAutoIncrementId generates unique IDs', function() {
		var testIterations = 20,
			ids = [ api.Menus.generatePlaceholderAutoIncrementId() ];

		while( testIterations-- > 0 ) {

			var placeholderID = api.Menus.generatePlaceholderAutoIncrementId();

			ok( -1 === ids.indexOf( placeholderID ) );
			ids.push( placeholderID );
		}

	} );

	test( 'it should parse _wpCustomizeMenusSettings.defaults into itself', function() {
		deepEqual( _wpCustomizeNavMenusSettings, api.Menus.data );
	});


});
/* global wp */
jQuery( function( ) {

	var api = wp.customize,
        settings = window._wpCustomizeNavMenusSettings,
        navMenu = window.wpNavMenu;
        
	module( 'Customize Nav Menus', {
		setup: function() {
            window._wpCustomizeNavMenusSettings = settings; 
            window.wpNavMenu = navMenu;
		},
		teardown: function() {
			// restore defaults
            window._wpCustomizeNavMenusSettings = settings; 
            window.wpNavMenu = navMenu;
		}

	});


	/**
	 * Generate 20 ids and verify they are all unique.
	 */
	test( 'generatePlaceholderAutoIncrementId generates unique IDs', function() {
		var testIterations = 20,
			ids = [ api.Menus.generatePlaceholderAutoIncrementId() ];

		while( testIterations-- > 0 ) {
			var placeholderID = api.Menus.generatePlaceholderAutoIncrementId();

			ok( -1 === ids.indexOf( placeholderID ) );
			ids.push( placeholderID );
		}

	} );

	test( 'it should parse _wpCustomizeMenusSettings.defaults into itself', function() {
		deepEqual( window._wpCustomizeNavMenusSettings, api.Menus.data );
	});


});
