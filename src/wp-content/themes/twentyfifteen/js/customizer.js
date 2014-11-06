/**
 * Customizer enhancements for a better user experience.
 *
 * Contains handlers to make Customizer preview reload changes asynchronously.
 */

( function( $ ) {
	var $style = $( '#twentyfifteen-color-scheme-css' ).next( 'style' );

	if ( ! $style.length ) {
		$style = $( 'head' ).append( '<style type="text/css" id="twentyfifteen-color-scheme-css" />' )
		                    .find( '#twentyfifteen-color-scheme-css' );
	}

	// Site title and description.
	wp.customize( 'blogname', function( value ) {
		value.bind( function( to ) {
			$( '.site-title a' ).text( to );
		} );
	} );

	wp.customize( 'blogdescription', function( value ) {
		value.bind( function( to ) {
			$( '.site-description' ).text( to );
		} );
	} );

	wp.customize( 'color_scheme_css', function( value ) {
		value.bind( function( to ) {
			$style.html( to );
		} );
	} );
} )( jQuery );