/* global _wpCustomizeLoaderSettings, confirm */
window.wp = window.wp || {};

(function( exports, $ ){
	var api = wp.customize,
		Loader;

	$.extend( $.support, {
		history: !! ( window.history && history.pushState ),
		hashchange: ('onhashchange' in window) && (document.documentMode === undefined || document.documentMode > 7)
	});

	/**
	 * Allows the Customizer to be overlayed on any page.
	 *
	 * By default, any element in the body with the load-customize class will open
	 * the Customizer overlay with the URL specified.
	 *
	 *     e.g. <a class="load-customize" href="http://siteurl.com/2014/01/02/post">Open customizer</a>
	 *
	 * @augments wp.customize.Events
	 */
	Loader = $.extend( {}, api.Events, {
		/**
		 * Setup the Loader; triggered on document#ready.
		 */
		initialize: function() {
			this.body = $( document.body );

			// Ensure the loader is supported.
			// Check for settings, postMessage support, and whether we require CORS support.
			if ( ! Loader.settings || ! $.support.postMessage || ( ! $.support.cors && Loader.settings.isCrossDomain ) ) {
				return;
			}

			this.window  = $( window );
			this.element = $( '<div id="customize-container" />' ).appendTo( this.body );

			// Bind events for opening and closing the overlay.
			this.bind( 'open', this.overlay.show );
			this.bind( 'close', this.overlay.hide );

			// Any element in the body with the `load-customize` class opens
			// the Customizer.
			$('#wpbody').on( 'click', '.load-customize', function( event ) {
				event.preventDefault();

				// Store a reference to the link that opened the customizer.
				Loader.link = $(this);
				// Load the theme.
				Loader.open( Loader.link.attr('href') );
			});

			// Add navigation listeners.
			if ( $.support.history ) {
				this.window.on( 'popstate', Loader.popstate );
			}

			if ( $.support.hashchange ) {
				this.window.on( 'hashchange', Loader.hashchange );
				this.window.triggerHandler( 'hashchange' );
			}
		},

		popstate: function( e ) {
			var state = e.originalEvent.state;
			if ( state && state.customize ) {
				Loader.open( state.customize );
			} else if ( Loader.active && ( ! state || ! state.customizePreviewUrl ) ) {
				Loader.close();
			}
		},

		hashchange: function() {
			var hash = window.location.toString().split('#')[1];

			if ( hash && 0 === hash.indexOf( 'wp_customize=on' ) ) {
				Loader.open( Loader.settings.url.customize + '?' + hash );
			}

			if ( ! hash && ! $.support.history ){
				Loader.close();
			}
		},

		beforeunload: function () {
			if ( ! Loader.saved() ) {
				return Loader.settings.l10n.saveAlert;
			}
		},

		/**
		 * Open the customizer overlay for a specific URL.
		 *
		 * @param  string src URL to load in the Customizer.
		 */
		open: function( src ) {
			var hash, messenger;

			if ( this.active ) {
				return;
			}

			// Load the full page on mobile devices.
			if ( Loader.settings.browser.mobile ) {
				return window.location = src;
			}

			this.active = true;
			this.body.addClass('customize-loading');

			// Dirty state of customizer in iframe
			this.saved = new api.Value( true );

			this.iframe = $( '<iframe />', { src: src }).appendTo( this.element );
			this.iframe.one( 'load', this.loaded );

			// Create a postMessage connection with the iframe.
			this.messenger = messenger = new api.Messenger({
				url: src,
				channel: 'loader',
				targetWindow: this.iframe[0].contentWindow
			});

			// Wait for the connection from the iframe before sending any postMessage events.
			messenger.bind( 'ready', function() {
				Loader.messenger.send( 'back' );
			} );

			this.messenger.bind( 'close', function() {
				var goBackToThemesPage;
				if ( $.support.history ) {
					goBackToThemesPage = function ( e ) {
						var state;
						state = e.originalEvent.state;
						if ( state && ( state.customize || state.customizePreviewUrl ) ) {
							history.back();
						} else {
							$( window ).off( 'popstate', goBackToThemesPage );
						}
					};
					$( window ).on( 'popstate', goBackToThemesPage );
					history.back();
				} else if ( $.support.hashchange ) {
					window.location.hash = '';
				} else {
					Loader.close();
				}
			} );

			// Prompt AYS dialog when navigating away
			$( window ).on( 'beforeunload', this.beforeunload );

			this.messenger.bind( 'activated', function( location ) {
				if ( location ) {
					window.location = location;
				}
			});

			this.messenger.bind( 'saved', function () {
				Loader.saved( true );
			} );
			this.messenger.bind( 'change', function () {
				Loader.saved( false );
			} );

			this.pushState( src );

			this.trigger( 'open' );
		},

		pushState: function ( src ) {
			var hash;

			if ( $.support.history ) {
				// Ensure we don't call pushState if the user hit the forward button.
				if ( window.location.href !== src ) {
					history.pushState( { customize: src }, '', src );
				}

				// Allow customizer to control history of parent
				messenger.bind( 'pushstate', function( args ) {
					history.pushState.apply( history, args );
				} );

				// Forward popstate events to customizer
				$( window ).on( 'popstate', function ( e ) {
					messenger.send( 'popstate', [ e.originalEvent.state, window.location ] );
				} );

			} else if ( $.support.hashchange && hash ) {
				hash = src.split( '?' )[1];
				window.location.hash = 'wp_customize=on&' + hash;
			}
		},

		/**
		 * Callback after the customizer has been opened.
		 */
		opened: function() {
			Loader.body.addClass( 'customize-active full-overlay-active' );
		},

		/**
		 * Close the Customizer overlay and return focus to the link that opened it.
		 */
		close: function() {
			if ( ! this.active ) {
				return;
			}

			// Display AYS dialog if customizer is dirty
			if ( ! this.saved() && ! confirm( Loader.settings.l10n.saveAlert ) ) {
				// Go forward since Customizer is exited by history.back()
				history.forward();
				return;
			}

			this.active = false;

			this.trigger( 'close' );

			// Return focus to link that was originally clicked.
			if ( this.link ) {
				this.link.focus();
			}
		},

		/**
		 * Callback after the customizer has been closed.
		 */
		closed: function() {
			Loader.iframe.remove();
			Loader.messenger.destroy();
			Loader.iframe    = null;
			Loader.messenger = null;
			Loader.saved     = null;
			Loader.body.removeClass( 'customize-active full-overlay-active' ).removeClass( 'customize-loading' );
			$( window ).off( 'beforeunload', Loader.beforeunload );
		},

		/**
		 * Callback for the `load` event on the Customizer iframe.
		 */
		loaded: function() {
			Loader.body.removeClass('customize-loading');
		},

		/**
		 * Overlay hide/show utility methods.
		 */
		overlay: {
			show: function() {
				this.element.fadeIn( 200, Loader.opened );
			},

			hide: function() {
				this.element.fadeOut( 200, Loader.closed );
			}
		}
	});

	// Bootstrap the Loader on document#ready.
	$( function() {
		Loader.settings = _wpCustomizeLoaderSettings;
		Loader.initialize();
	});

	// Expose the API publicly on window.wp.customize.Loader
	api.Loader = Loader;
})( wp, jQuery );
