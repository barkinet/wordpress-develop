/**
 * Customizer enhancements for a better user experience.
 *
 * Contains handlers to make Customizer preview reload changes asynchronously.
 */

( function( $ ) {
	// Site title and description.
	wp.customize( 'blogname', function( setting ) {
		setting.bind( function( to ) {
			$( setting.selector ).text( to );
		} );
	} );
	wp.customize( 'blogdescription', function( setting ) {
		setting.bind( function( to ) {
			$( setting.selector ).text( to );
		} );
	} );
} )( jQuery );
