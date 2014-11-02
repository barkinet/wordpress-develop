/**
 * Twenty Fourteen Customizer enhancements for a better user experience.
 *
 * Contains handlers to make Customizer preview reload changes asynchronously.
 */
( function( $, api ) {
	// Site title and description.
	api( 'blogname', function( value ) {
		value.bind( function( to ) {
			$( value.selector ).text( to );
		} );
	} );
	api( 'blogdescription', function( value ) {
		value.bind( function( to ) {
			$( value.selector ).text( to );
		} );
	} );
	// Header text color.
	api( 'header_textcolor', 'blogname', 'blogdescription', function( value ) {

		value.bind( function( to ) {
			var titleDescriptionSelector = api( 'blogname' ).selector + ', ' + api( 'blogdescription' ).selector;

			if ( 'blank' === to ) {
				$( titleDescriptionSelector ).css( {
					'clip': 'rect(1px, 1px, 1px, 1px)',
					'position': 'absolute'
				} );
			} else {
				$( titleDescriptionSelector ).css( {
					'clip': 'auto',
					'position': 'static'
				} );

				$( api( 'blogname' ).selector ).css( {
					'color': to
				} );
			}
		} );
	} );
} )( jQuery, wp.customize );
