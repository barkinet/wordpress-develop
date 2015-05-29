(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/edit-attachment-metadata.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.controller.EditAttachmentMetadata
 *
 * A state for editing an attachment's metadata.
 *
 * @class
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 */
var l10n = wp.media.view.l10n,
	EditAttachmentMetadata;

EditAttachmentMetadata = wp.media.controller.State.extend({
	defaults: {
		id:      'edit-attachment',
		// Title string passed to the frame's title region view.
		title:   l10n.attachmentDetails,
		// Region mode defaults.
		content: 'edit-metadata',
		menu:    false,
		toolbar: false,
		router:  false
	}
});

module.exports = EditAttachmentMetadata;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/grid.manifest.js":[function(require,module,exports){
/*globals wp */

var media = wp.media;

media.controller.EditAttachmentMetadata = require( './controllers/edit-attachment-metadata.js' );
media.view.MediaFrame.Manage = require( './views/frame/manage.js' );
media.view.Attachment.Details.TwoColumn = require( './views/attachment/details-two-column.js' );
media.view.MediaFrame.Manage.Router = require( './routers/manage.js' );
media.view.EditImage.Details = require( './views/edit-image-details.js' );
media.view.MediaFrame.EditAttachments = require( './views/frame/edit-attachments.js' );
media.view.SelectModeToggleButton = require( './views/button/select-mode-toggle.js' );
media.view.DeleteSelectedButton = require( './views/button/delete-selected.js' );
media.view.DeleteSelectedPermanentlyButton = require( './views/button/delete-selected-permanently.js' );

},{"./controllers/edit-attachment-metadata.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/edit-attachment-metadata.js","./routers/manage.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/routers/manage.js","./views/attachment/details-two-column.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment/details-two-column.js","./views/button/delete-selected-permanently.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/button/delete-selected-permanently.js","./views/button/delete-selected.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/button/delete-selected.js","./views/button/select-mode-toggle.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/button/select-mode-toggle.js","./views/edit-image-details.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/edit-image-details.js","./views/frame/edit-attachments.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/edit-attachments.js","./views/frame/manage.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/manage.js"}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/routers/manage.js":[function(require,module,exports){
/*globals wp, Backbone */

/**
 * wp.media.view.MediaFrame.Manage.Router
 *
 * A router for handling the browser history and application state.
 *
 * @class
 * @augments Backbone.Router
 */
var Router = Backbone.Router.extend({
	initialize: function ( options ) {
		this.controller = options.controller;
		this.library = options.library;
		this.on( 'route', this.checkRoute );
	},

	routes: {
		'upload.php?item=:slug':    'showItem',
		'upload.php?search=:query': 'search',
		'upload.php':				'defaultRoute'
	},

	checkRoute: function ( event ) {
		if ( 'defaultRoute' !== event ) {
			this.modal = true;
		}
	},

	defaultRoute: function () {
		if ( this.modal ) {
			wp.media.frame.close();
			this.modal = false;
		}
	},

	// Map routes against the page URL
	baseUrl: function( url ) {
		return 'upload.php' + url;
	},

	// Respond to the search route by filling the search field and trigggering the input event
	search: function( query ) {
		jQuery( '#media-search-input' ).val( query ).trigger( 'input' );
	},

	// Show the modal with a specific item
	showItem: function( query ) {
		var frame = this.controller,
			item;
	
		// Trigger the media frame to open the correct item
		item = this.library.findWhere( { id: parseInt( query, 10 ) } );
		if ( item ) {
			frame.trigger( 'edit:attachment', item );
		} else {
			item = wp.media.attachment( query );
			frame.listenTo( item, 'change', function( model ) {
				frame.stopListening( item );
				frame.trigger( 'edit:attachment', model );
			} );
			item.fetch();
		}
	}
});

module.exports = Router;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment/details-two-column.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.Attachment.Details.TwoColumn
 *
 * A similar view to media.view.Attachment.Details
 * for use in the Edit Attachment modal.
 *
 * @class
 * @augments wp.media.view.Attachment.Details
 * @augments wp.media.view.Attachment
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Details = wp.media.view.Attachment.Details,
	TwoColumn;

TwoColumn = Details.extend({
	template: wp.template( 'attachment-details-two-column' ),

	editAttachment: function( event ) {
		event.preventDefault();
		this.controller.content.mode( 'edit-image' );
	},

	/**
	 * Noop this from parent class, doesn't apply here.
	 */
	toggleSelectionHandler: function() {},

	render: function() {
		Details.prototype.render.apply( this, arguments );

		wp.media.mixin.removeAllPlayers();
		this.$( 'audio, video' ).each( function (i, elem) {
			var el = wp.media.view.MediaDetails.prepareSrc( elem );
			new window.MediaElementPlayer( el, wp.media.mixin.mejsSettings );
		} );
	}
});

module.exports = TwoColumn;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/button/delete-selected-permanently.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.DeleteSelectedPermanentlyButton
 *
 * When MEDIA_TRASH is true, a button that handles bulk Delete Permanently logic
 *
 * @class
 * @augments wp.media.view.DeleteSelectedButton
 * @augments wp.media.view.Button
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Button = wp.media.view.Button,
	DeleteSelected = wp.media.view.DeleteSelectedButton,
	DeleteSelectedPermanently;

DeleteSelectedPermanently = DeleteSelected.extend({
	initialize: function() {
		DeleteSelected.prototype.initialize.apply( this, arguments );
		this.listenTo( this.controller, 'select:activate', this.selectActivate );
		this.listenTo( this.controller, 'select:deactivate', this.selectDeactivate );
	},

	filterChange: function( model ) {
		this.canShow = ( 'trash' === model.get( 'status' ) );
	},

	selectActivate: function() {
		this.toggleDisabled();
		this.$el.toggleClass( 'hidden', ! this.canShow );
	},

	selectDeactivate: function() {
		this.toggleDisabled();
		this.$el.addClass( 'hidden' );
	},

	render: function() {
		Button.prototype.render.apply( this, arguments );
		this.selectActivate();
		return this;
	}
});

module.exports = DeleteSelectedPermanently;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/button/delete-selected.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.DeleteSelectedButton
 *
 * A button that handles bulk Delete/Trash logic
 *
 * @class
 * @augments wp.media.view.Button
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Button = wp.media.view.Button,
	l10n = wp.media.view.l10n,
	DeleteSelected;

DeleteSelected = Button.extend({
	initialize: function() {
		Button.prototype.initialize.apply( this, arguments );
		if ( this.options.filters ) {
			this.listenTo( this.options.filters.model, 'change', this.filterChange );
		}
		this.listenTo( this.controller, 'selection:toggle', this.toggleDisabled );
	},

	filterChange: function( model ) {
		if ( 'trash' === model.get( 'status' ) ) {
			this.model.set( 'text', l10n.untrashSelected );
		} else if ( wp.media.view.settings.mediaTrash ) {
			this.model.set( 'text', l10n.trashSelected );
		} else {
			this.model.set( 'text', l10n.deleteSelected );
		}
	},

	toggleDisabled: function() {
		this.model.set( 'disabled', ! this.controller.state().get( 'selection' ).length );
	},

	render: function() {
		Button.prototype.render.apply( this, arguments );
		if ( this.controller.isModeActive( 'select' ) ) {
			this.$el.addClass( 'delete-selected-button' );
		} else {
			this.$el.addClass( 'delete-selected-button hidden' );
		}
		this.toggleDisabled();
		return this;
	}
});

module.exports = DeleteSelected;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/button/select-mode-toggle.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.SelectModeToggleButton
 *
 * @class
 * @augments wp.media.view.Button
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Button = wp.media.view.Button,
	l10n = wp.media.view.l10n,
	SelectModeToggle;

SelectModeToggle = Button.extend({
	initialize: function() {
		Button.prototype.initialize.apply( this, arguments );
		this.listenTo( this.controller, 'select:activate select:deactivate', this.toggleBulkEditHandler );
		this.listenTo( this.controller, 'selection:action:done', this.back );
	},

	back: function () {
		this.controller.deactivateMode( 'select' ).activateMode( 'edit' );
	},

	click: function() {
		Button.prototype.click.apply( this, arguments );
		if ( this.controller.isModeActive( 'select' ) ) {
			this.back();
		} else {
			this.controller.deactivateMode( 'edit' ).activateMode( 'select' );
		}
	},

	render: function() {
		Button.prototype.render.apply( this, arguments );
		this.$el.addClass( 'select-mode-toggle-button' );
		return this;
	},

	toggleBulkEditHandler: function() {
		var toolbar = this.controller.content.get().toolbar, children;

		children = toolbar.$( '.media-toolbar-secondary > *, .media-toolbar-primary > *' );

		// TODO: the Frame should be doing all of this.
		if ( this.controller.isModeActive( 'select' ) ) {
			this.model.set( 'text', l10n.cancelSelection );
			children.not( '.spinner, .media-button' ).hide();
			this.$el.show();
			toolbar.$( '.delete-selected-button' ).removeClass( 'hidden' );
		} else {
			this.model.set( 'text', l10n.bulkSelect );
			this.controller.content.get().$el.removeClass( 'fixed' );
			toolbar.$el.css( 'width', '' );
			toolbar.$( '.delete-selected-button' ).addClass( 'hidden' );
			children.not( '.media-button' ).show();
			this.controller.state().get( 'selection' ).reset();
		}
	}
});

module.exports = SelectModeToggle;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/edit-image-details.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.view.EditImage.Details
 *
 * @class
 * @augments wp.media.view.EditImage
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	EditImage = wp.media.view.EditImage,
	Details;

Details = EditImage.extend({
	initialize: function( options ) {
		this.editor = window.imageEdit;
		this.frame = options.frame;
		this.controller = options.controller;
		View.prototype.initialize.apply( this, arguments );
	},

	back: function() {
		this.frame.content.mode( 'edit-metadata' );
	},

	save: function() {
		this.model.fetch().done( _.bind( function() {
			this.frame.content.mode( 'edit-metadata' );
		}, this ) );
	}
});

module.exports = Details;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/edit-attachments.js":[function(require,module,exports){
/*globals wp, _, jQuery */

/**
 * wp.media.view.MediaFrame.EditAttachments
 *
 * A frame for editing the details of a specific media item.
 *
 * Opens in a modal by default.
 *
 * Requires an attachment model to be passed in the options hash under `model`.
 *
 * @class
 * @augments wp.media.view.Frame
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 * @mixes wp.media.controller.StateMachine
 */
var Frame = wp.media.view.Frame,
	MediaFrame = wp.media.view.MediaFrame,

	$ = jQuery,
	EditAttachments;

EditAttachments = MediaFrame.extend({

	className: 'edit-attachment-frame',
	template:  wp.template( 'edit-attachment-frame' ),
	regions:   [ 'title', 'content' ],

	events: {
		'click .left':  'previousMediaItem',
		'click .right': 'nextMediaItem'
	},

	initialize: function() {
		Frame.prototype.initialize.apply( this, arguments );

		_.defaults( this.options, {
			modal: true,
			state: 'edit-attachment'
		});

		this.controller = this.options.controller;
		this.gridRouter = this.controller.gridRouter;
		this.library = this.options.library;

		if ( this.options.model ) {
			this.model = this.options.model;
		}

		this.bindHandlers();
		this.createStates();
		this.createModal();

		this.title.mode( 'default' );
		this.toggleNav();
	},

	bindHandlers: function() {
		// Bind default title creation.
		this.on( 'title:create:default', this.createTitle, this );

		// Close the modal if the attachment is deleted.
		this.listenTo( this.model, 'change:status destroy', this.close, this );

		this.on( 'content:create:edit-metadata', this.editMetadataMode, this );
		this.on( 'content:create:edit-image', this.editImageMode, this );
		this.on( 'content:render:edit-image', this.editImageModeRender, this );
		this.on( 'close', this.detach );
	},

	createModal: function() {
		// Initialize modal container view.
		if ( this.options.modal ) {
			this.modal = new wp.media.view.Modal({
				controller: this,
				title:      this.options.title
			});

			this.modal.on( 'open', _.bind( function () {
				$( 'body' ).on( 'keydown.media-modal', _.bind( this.keyEvent, this ) );
			}, this ) );

			// Completely destroy the modal DOM element when closing it.
			this.modal.on( 'close', _.bind( function() {
				this.modal.remove();
				$( 'body' ).off( 'keydown.media-modal' ); /* remove the keydown event */
				// Restore the original focus item if possible
				$( 'li.attachment[data-id="' + this.model.get( 'id' ) +'"]' ).focus();
				this.resetRoute();
			}, this ) );

			// Set this frame as the modal's content.
			this.modal.content( this );
			this.modal.open();
		}
	},

	/**
	 * Add the default states to the frame.
	 */
	createStates: function() {
		this.states.add([
			new wp.media.controller.EditAttachmentMetadata( { model: this.model } )
		]);
	},

	/**
	 * Content region rendering callback for the `edit-metadata` mode.
	 *
	 * @param {Object} contentRegion Basic object with a `view` property, which
	 *                               should be set with the proper region view.
	 */
	editMetadataMode: function( contentRegion ) {
		contentRegion.view = new wp.media.view.Attachment.Details.TwoColumn({
			controller: this,
			model:      this.model
		});

		/**
		 * Attach a subview to display fields added via the
		 * `attachment_fields_to_edit` filter.
		 */
		contentRegion.view.views.set( '.attachment-compat', new wp.media.view.AttachmentCompat({
			controller: this,
			model:      this.model
		}) );

		// Update browser url when navigating media details
		if ( this.model ) {
			this.gridRouter.navigate( this.gridRouter.baseUrl( '?item=' + this.model.id ) );
		}
	},

	/**
	 * Render the EditImage view into the frame's content region.
	 *
	 * @param {Object} contentRegion Basic object with a `view` property, which
	 *                               should be set with the proper region view.
	 */
	editImageMode: function( contentRegion ) {
		var editImageController = new wp.media.controller.EditImage( {
			model: this.model,
			frame: this
		} );
		// Noop some methods.
		editImageController._toolbar = function() {};
		editImageController._router = function() {};
		editImageController._menu = function() {};

		contentRegion.view = new wp.media.view.EditImage.Details( {
			model: this.model,
			frame: this,
			controller: editImageController
		} );
	},

	editImageModeRender: function( view ) {
		view.on( 'ready', view.loadEditor );
	},

	toggleNav: function() {
		this.$('.left').toggleClass( 'disabled', ! this.hasPrevious() );
		this.$('.right').toggleClass( 'disabled', ! this.hasNext() );
	},

	/**
	 * Rerender the view.
	 */
	rerender: function() {
		// Only rerender the `content` region.
		if ( this.content.mode() !== 'edit-metadata' ) {
			this.content.mode( 'edit-metadata' );
		} else {
			this.content.render();
		}

		this.toggleNav();
	},

	/**
	 * Click handler to switch to the previous media item.
	 */
	previousMediaItem: function() {
		if ( ! this.hasPrevious() ) {
			this.$( '.left' ).blur();
			return;
		}
		this.model = this.library.at( this.getCurrentIndex() - 1 );
		this.rerender();
		this.$( '.left' ).focus();
	},

	/**
	 * Click handler to switch to the next media item.
	 */
	nextMediaItem: function() {
		if ( ! this.hasNext() ) {
			this.$( '.right' ).blur();
			return;
		}
		this.model = this.library.at( this.getCurrentIndex() + 1 );
		this.rerender();
		this.$( '.right' ).focus();
	},

	getCurrentIndex: function() {
		return this.library.indexOf( this.model );
	},

	hasNext: function() {
		return ( this.getCurrentIndex() + 1 ) < this.library.length;
	},

	hasPrevious: function() {
		return ( this.getCurrentIndex() - 1 ) > -1;
	},
	/**
	 * Respond to the keyboard events: right arrow, left arrow, except when
	 * focus is in a textarea or input field.
	 */
	keyEvent: function( event ) {
		if ( ( 'INPUT' === event.target.nodeName || 'TEXTAREA' === event.target.nodeName ) && ! ( event.target.readOnly || event.target.disabled ) ) {
			return;
		}

		// The right arrow key
		if ( 39 === event.keyCode ) {
			this.nextMediaItem();
		}
		// The left arrow key
		if ( 37 === event.keyCode ) {
			this.previousMediaItem();
		}
	},

	resetRoute: function() {
		this.gridRouter.navigate( this.gridRouter.baseUrl( '' ) );
	}
});

module.exports = EditAttachments;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/manage.js":[function(require,module,exports){
/*globals wp, _, Backbone */

/**
 * wp.media.view.MediaFrame.Manage
 *
 * A generic management frame workflow.
 *
 * Used in the media grid view.
 *
 * @class
 * @augments wp.media.view.MediaFrame
 * @augments wp.media.view.Frame
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 * @mixes wp.media.controller.StateMachine
 */
var MediaFrame = wp.media.view.MediaFrame,
	Library = wp.media.controller.Library,

	$ = Backbone.$,
	Manage;

Manage = MediaFrame.extend({
	/**
	 * @global wp.Uploader
	 */
	initialize: function() {
		_.defaults( this.options, {
			title:     '',
			modal:     false,
			selection: [],
			library:   {}, // Options hash for the query to the media library.
			multiple:  'add',
			state:     'library',
			uploader:  true,
			mode:      [ 'grid', 'edit' ]
		});

		this.$body = $( document.body );
		this.$window = $( window );
		this.$adminBar = $( '#wpadminbar' );
		this.$window.on( 'scroll resize', _.debounce( _.bind( this.fixPosition, this ), 15 ) );
		$( document ).on( 'click', '.add-new-h2', _.bind( this.addNewClickHandler, this ) );

		// Ensure core and media grid view UI is enabled.
		this.$el.addClass('wp-core-ui');

		// Force the uploader off if the upload limit has been exceeded or
		// if the browser isn't supported.
		if ( wp.Uploader.limitExceeded || ! wp.Uploader.browser.supported ) {
			this.options.uploader = false;
		}

		// Initialize a window-wide uploader.
		if ( this.options.uploader ) {
			this.uploader = new wp.media.view.UploaderWindow({
				controller: this,
				uploader: {
					dropzone:  document.body,
					container: document.body
				}
			}).render();
			this.uploader.ready();
			this.$body.append( this.uploader.el );

			this.options.uploader = false;
		}

		// Call 'initialize' directly on the parent class.
		MediaFrame.prototype.initialize.apply( this, arguments );

		// Append the frame view directly the supplied container.
		this.$el.appendTo( this.options.container );

		this.setLibrary( this.options );
		this.setRouter();
		this.createStates();
		this.bindRegionModeHandlers();
		this.render();
		this.bindSearchHandler();
	},

	setLibrary: function ( options ) {
		this.library = wp.media.query( options.library );
	},

	setRouter: function () {
		this.gridRouter = new wp.media.view.MediaFrame.Manage.Router({
			controller: this,
			library: this.library
		});
	},

	bindSearchHandler: function() {
		var search = this.$( '#media-search-input' ),
			currentSearch = this.options.container.data( 'search' ),
			searchView = this.browserView.toolbar.get( 'search' ).$el,
			listMode = this.$( '.view-list' ),

			input  = _.debounce( function (e) {
				var val = $( e.currentTarget ).val(),
					url = '';

				if ( val ) {
					url += '?search=' + val;
				}
				this.gridRouter.navigate( this.gridRouter.baseUrl( url ) );
			}, 1000 );

		// Update the URL when entering search string (at most once per second)
		search.on( 'input', _.bind( input, this ) );
		if ( currentSearch ) {
			searchView.val( currentSearch ).trigger( 'input' );
		}

		this.gridRouter.on( 'route:search', function () {
			var href = window.location.href;
			if ( href.indexOf( 'mode=' ) > -1 ) {
				href = href.replace( /mode=[^&]+/g, 'mode=list' );
			} else {
				href += href.indexOf( '?' ) > -1 ? '&mode=list' : '?mode=list';
			}
			href = href.replace( 'search=', 's=' );
			listMode.prop( 'href', href );
		} );
	},

	/**
	 * Create the default states for the frame.
	 */
	createStates: function() {
		var options = this.options;

		if ( this.options.states ) {
			return;
		}

		// Add the default states.
		this.states.add([
			new Library({
				library:            this.library,
				multiple:           options.multiple,
				title:              options.title,
				content:            'browse',
				toolbar:            'select',
				contentUserSetting: false,
				filterable:         'all',
				autoSelect:         false
			})
		]);
	},

	/**
	 * Bind region mode activation events to proper handlers.
	 */
	bindRegionModeHandlers: function() {
		this.on( 'content:create:browse', this.browseContent, this );

		// Handle a frame-level event for editing an attachment.
		this.on( 'edit:attachment', this.openEditAttachmentModal, this );

		this.on( 'select:activate', this.bindKeydown, this );
		this.on( 'select:deactivate', this.unbindKeydown, this );
	},

	handleKeydown: function( e ) {
		if ( 27 === e.which ) {
			e.preventDefault();
			this.deactivateMode( 'select' ).activateMode( 'edit' );
		}
	},

	bindKeydown: function() {
		this.$body.on( 'keydown.select', _.bind( this.handleKeydown, this ) );
	},

	unbindKeydown: function() {
		this.$body.off( 'keydown.select' );
	},

	fixPosition: function() {
		var $browser, $toolbar;
		if ( ! this.isModeActive( 'select' ) ) {
			return;
		}

		$browser = this.$('.attachments-browser');
		$toolbar = $browser.find('.media-toolbar');

		// Offset doesn't appear to take top margin into account, hence +16
		if ( ( $browser.offset().top + 16 ) < this.$window.scrollTop() + this.$adminBar.height() ) {
			$browser.addClass( 'fixed' );
			$toolbar.css('width', $browser.width() + 'px');
		} else {
			$browser.removeClass( 'fixed' );
			$toolbar.css('width', '');
		}
	},

	/**
	 * Click handler for the `Add New` button.
	 */
	addNewClickHandler: function( event ) {
		event.preventDefault();
		this.trigger( 'toggle:upload:attachment' );
	},

	/**
	 * Open the Edit Attachment modal.
	 */
	openEditAttachmentModal: function( model ) {
		// Create a new EditAttachment frame, passing along the library and the attachment model.
		wp.media( {
			frame:       'edit-attachments',
			controller:  this,
			library:     this.state().get('library'),
			model:       model
		} );
	},

	/**
	 * Create an attachments browser view within the content region.
	 *
	 * @param {Object} contentRegion Basic object with a `view` property, which
	 *                               should be set with the proper region view.
	 * @this wp.media.controller.Region
	 */
	browseContent: function( contentRegion ) {
		var state = this.state();

		// Browse our library of attachments.
		this.browserView = contentRegion.view = new wp.media.view.AttachmentsBrowser({
			controller: this,
			collection: state.get('library'),
			selection:  state.get('selection'),
			model:      state,
			sortable:   state.get('sortable'),
			search:     state.get('searchable'),
			filters:    state.get('filterable'),
			date:       state.get('date'),
			display:    state.get('displaySettings'),
			dragInfo:   state.get('dragInfo'),
			sidebar:    'errors',

			suggestedWidth:  state.get('suggestedWidth'),
			suggestedHeight: state.get('suggestedHeight'),

			AttachmentView: state.get('AttachmentView'),

			scrollElement: document
		});
		this.browserView.on( 'ready', _.bind( this.bindDeferred, this ) );

		this.errors = wp.Uploader.errors;
		this.errors.on( 'add remove reset', this.sidebarVisibility, this );
	},

	sidebarVisibility: function() {
		this.browserView.$( '.media-sidebar' ).toggle( !! this.errors.length );
	},

	bindDeferred: function() {
		if ( ! this.browserView.dfd ) {
			return;
		}
		this.browserView.dfd.done( _.bind( this.startHistory, this ) );
	},

	startHistory: function() {
		// Verify pushState support and activate
		if ( window.history && window.history.pushState ) {
			Backbone.history.start( {
				root: window._wpMediaGridSettings.adminUrl,
				pushState: true
			} );
		}
	}
});

module.exports = Manage;

},{}]},{},["/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/grid.manifest.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvZWRpdC1hdHRhY2htZW50LW1ldGFkYXRhLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL2dyaWQubWFuaWZlc3QuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvcm91dGVycy9tYW5hZ2UuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudC9kZXRhaWxzLXR3by1jb2x1bW4uanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYnV0dG9uL2RlbGV0ZS1zZWxlY3RlZC1wZXJtYW5lbnRseS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9idXR0b24vZGVsZXRlLXNlbGVjdGVkLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL2J1dHRvbi9zZWxlY3QtbW9kZS10b2dnbGUuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvZWRpdC1pbWFnZS1kZXRhaWxzLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL2ZyYW1lL2VkaXQtYXR0YWNobWVudHMuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvZnJhbWUvbWFuYWdlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFscyB3cCAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLmNvbnRyb2xsZXIuRWRpdEF0dGFjaG1lbnRNZXRhZGF0YVxuICpcbiAqIEEgc3RhdGUgZm9yIGVkaXRpbmcgYW4gYXR0YWNobWVudCdzIG1ldGFkYXRhLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5Nb2RlbFxuICovXG52YXIgbDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0RWRpdEF0dGFjaG1lbnRNZXRhZGF0YTtcblxuRWRpdEF0dGFjaG1lbnRNZXRhZGF0YSA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGUuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6IHtcblx0XHRpZDogICAgICAnZWRpdC1hdHRhY2htZW50Jyxcblx0XHQvLyBUaXRsZSBzdHJpbmcgcGFzc2VkIHRvIHRoZSBmcmFtZSdzIHRpdGxlIHJlZ2lvbiB2aWV3LlxuXHRcdHRpdGxlOiAgIGwxMG4uYXR0YWNobWVudERldGFpbHMsXG5cdFx0Ly8gUmVnaW9uIG1vZGUgZGVmYXVsdHMuXG5cdFx0Y29udGVudDogJ2VkaXQtbWV0YWRhdGEnLFxuXHRcdG1lbnU6ICAgIGZhbHNlLFxuXHRcdHRvb2xiYXI6IGZhbHNlLFxuXHRcdHJvdXRlcjogIGZhbHNlXG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRBdHRhY2htZW50TWV0YWRhdGE7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxudmFyIG1lZGlhID0gd3AubWVkaWE7XG5cbm1lZGlhLmNvbnRyb2xsZXIuRWRpdEF0dGFjaG1lbnRNZXRhZGF0YSA9IHJlcXVpcmUoICcuL2NvbnRyb2xsZXJzL2VkaXQtYXR0YWNobWVudC1tZXRhZGF0YS5qcycgKTtcbm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5NYW5hZ2UgPSByZXF1aXJlKCAnLi92aWV3cy9mcmFtZS9tYW5hZ2UuanMnICk7XG5tZWRpYS52aWV3LkF0dGFjaG1lbnQuRGV0YWlscy5Ud29Db2x1bW4gPSByZXF1aXJlKCAnLi92aWV3cy9hdHRhY2htZW50L2RldGFpbHMtdHdvLWNvbHVtbi5qcycgKTtcbm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5NYW5hZ2UuUm91dGVyID0gcmVxdWlyZSggJy4vcm91dGVycy9tYW5hZ2UuanMnICk7XG5tZWRpYS52aWV3LkVkaXRJbWFnZS5EZXRhaWxzID0gcmVxdWlyZSggJy4vdmlld3MvZWRpdC1pbWFnZS1kZXRhaWxzLmpzJyApO1xubWVkaWEudmlldy5NZWRpYUZyYW1lLkVkaXRBdHRhY2htZW50cyA9IHJlcXVpcmUoICcuL3ZpZXdzL2ZyYW1lL2VkaXQtYXR0YWNobWVudHMuanMnICk7XG5tZWRpYS52aWV3LlNlbGVjdE1vZGVUb2dnbGVCdXR0b24gPSByZXF1aXJlKCAnLi92aWV3cy9idXR0b24vc2VsZWN0LW1vZGUtdG9nZ2xlLmpzJyApO1xubWVkaWEudmlldy5EZWxldGVTZWxlY3RlZEJ1dHRvbiA9IHJlcXVpcmUoICcuL3ZpZXdzL2J1dHRvbi9kZWxldGUtc2VsZWN0ZWQuanMnICk7XG5tZWRpYS52aWV3LkRlbGV0ZVNlbGVjdGVkUGVybWFuZW50bHlCdXR0b24gPSByZXF1aXJlKCAnLi92aWV3cy9idXR0b24vZGVsZXRlLXNlbGVjdGVkLXBlcm1hbmVudGx5LmpzJyApO1xuIiwiLypnbG9iYWxzIHdwLCBCYWNrYm9uZSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5NYW5hZ2UuUm91dGVyXG4gKlxuICogQSByb3V0ZXIgZm9yIGhhbmRsaW5nIHRoZSBicm93c2VyIGhpc3RvcnkgYW5kIGFwcGxpY2F0aW9uIHN0YXRlLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIEJhY2tib25lLlJvdXRlclxuICovXG52YXIgUm91dGVyID0gQmFja2JvbmUuUm91dGVyLmV4dGVuZCh7XG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uICggb3B0aW9ucyApIHtcblx0XHR0aGlzLmNvbnRyb2xsZXIgPSBvcHRpb25zLmNvbnRyb2xsZXI7XG5cdFx0dGhpcy5saWJyYXJ5ID0gb3B0aW9ucy5saWJyYXJ5O1xuXHRcdHRoaXMub24oICdyb3V0ZScsIHRoaXMuY2hlY2tSb3V0ZSApO1xuXHR9LFxuXG5cdHJvdXRlczoge1xuXHRcdCd1cGxvYWQucGhwP2l0ZW09OnNsdWcnOiAgICAnc2hvd0l0ZW0nLFxuXHRcdCd1cGxvYWQucGhwP3NlYXJjaD06cXVlcnknOiAnc2VhcmNoJyxcblx0XHQndXBsb2FkLnBocCc6XHRcdFx0XHQnZGVmYXVsdFJvdXRlJ1xuXHR9LFxuXG5cdGNoZWNrUm91dGU6IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0aWYgKCAnZGVmYXVsdFJvdXRlJyAhPT0gZXZlbnQgKSB7XG5cdFx0XHR0aGlzLm1vZGFsID0gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cblx0ZGVmYXVsdFJvdXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKCB0aGlzLm1vZGFsICkge1xuXHRcdFx0d3AubWVkaWEuZnJhbWUuY2xvc2UoKTtcblx0XHRcdHRoaXMubW9kYWwgPSBmYWxzZTtcblx0XHR9XG5cdH0sXG5cblx0Ly8gTWFwIHJvdXRlcyBhZ2FpbnN0IHRoZSBwYWdlIFVSTFxuXHRiYXNlVXJsOiBmdW5jdGlvbiggdXJsICkge1xuXHRcdHJldHVybiAndXBsb2FkLnBocCcgKyB1cmw7XG5cdH0sXG5cblx0Ly8gUmVzcG9uZCB0byB0aGUgc2VhcmNoIHJvdXRlIGJ5IGZpbGxpbmcgdGhlIHNlYXJjaCBmaWVsZCBhbmQgdHJpZ2dnZXJpbmcgdGhlIGlucHV0IGV2ZW50XG5cdHNlYXJjaDogZnVuY3Rpb24oIHF1ZXJ5ICkge1xuXHRcdGpRdWVyeSggJyNtZWRpYS1zZWFyY2gtaW5wdXQnICkudmFsKCBxdWVyeSApLnRyaWdnZXIoICdpbnB1dCcgKTtcblx0fSxcblxuXHQvLyBTaG93IHRoZSBtb2RhbCB3aXRoIGEgc3BlY2lmaWMgaXRlbVxuXHRzaG93SXRlbTogZnVuY3Rpb24oIHF1ZXJ5ICkge1xuXHRcdHZhciBmcmFtZSA9IHRoaXMuY29udHJvbGxlcixcblx0XHRcdGl0ZW07XG5cdFxuXHRcdC8vIFRyaWdnZXIgdGhlIG1lZGlhIGZyYW1lIHRvIG9wZW4gdGhlIGNvcnJlY3QgaXRlbVxuXHRcdGl0ZW0gPSB0aGlzLmxpYnJhcnkuZmluZFdoZXJlKCB7IGlkOiBwYXJzZUludCggcXVlcnksIDEwICkgfSApO1xuXHRcdGlmICggaXRlbSApIHtcblx0XHRcdGZyYW1lLnRyaWdnZXIoICdlZGl0OmF0dGFjaG1lbnQnLCBpdGVtICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGl0ZW0gPSB3cC5tZWRpYS5hdHRhY2htZW50KCBxdWVyeSApO1xuXHRcdFx0ZnJhbWUubGlzdGVuVG8oIGl0ZW0sICdjaGFuZ2UnLCBmdW5jdGlvbiggbW9kZWwgKSB7XG5cdFx0XHRcdGZyYW1lLnN0b3BMaXN0ZW5pbmcoIGl0ZW0gKTtcblx0XHRcdFx0ZnJhbWUudHJpZ2dlciggJ2VkaXQ6YXR0YWNobWVudCcsIG1vZGVsICk7XG5cdFx0XHR9ICk7XG5cdFx0XHRpdGVtLmZldGNoKCk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb3V0ZXI7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnQuRGV0YWlscy5Ud29Db2x1bW5cbiAqXG4gKiBBIHNpbWlsYXIgdmlldyB0byBtZWRpYS52aWV3LkF0dGFjaG1lbnQuRGV0YWlsc1xuICogZm9yIHVzZSBpbiB0aGUgRWRpdCBBdHRhY2htZW50IG1vZGFsLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudC5EZXRhaWxzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5BdHRhY2htZW50XG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBEZXRhaWxzID0gd3AubWVkaWEudmlldy5BdHRhY2htZW50LkRldGFpbHMsXG5cdFR3b0NvbHVtbjtcblxuVHdvQ29sdW1uID0gRGV0YWlscy5leHRlbmQoe1xuXHR0ZW1wbGF0ZTogd3AudGVtcGxhdGUoICdhdHRhY2htZW50LWRldGFpbHMtdHdvLWNvbHVtbicgKSxcblxuXHRlZGl0QXR0YWNobWVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dGhpcy5jb250cm9sbGVyLmNvbnRlbnQubW9kZSggJ2VkaXQtaW1hZ2UnICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE5vb3AgdGhpcyBmcm9tIHBhcmVudCBjbGFzcywgZG9lc24ndCBhcHBseSBoZXJlLlxuXHQgKi9cblx0dG9nZ2xlU2VsZWN0aW9uSGFuZGxlcjogZnVuY3Rpb24oKSB7fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdERldGFpbHMucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHR3cC5tZWRpYS5taXhpbi5yZW1vdmVBbGxQbGF5ZXJzKCk7XG5cdFx0dGhpcy4kKCAnYXVkaW8sIHZpZGVvJyApLmVhY2goIGZ1bmN0aW9uIChpLCBlbGVtKSB7XG5cdFx0XHR2YXIgZWwgPSB3cC5tZWRpYS52aWV3Lk1lZGlhRGV0YWlscy5wcmVwYXJlU3JjKCBlbGVtICk7XG5cdFx0XHRuZXcgd2luZG93Lk1lZGlhRWxlbWVudFBsYXllciggZWwsIHdwLm1lZGlhLm1peGluLm1lanNTZXR0aW5ncyApO1xuXHRcdH0gKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHdvQ29sdW1uO1xuIiwiLypnbG9iYWxzIHdwICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5EZWxldGVTZWxlY3RlZFBlcm1hbmVudGx5QnV0dG9uXG4gKlxuICogV2hlbiBNRURJQV9UUkFTSCBpcyB0cnVlLCBhIGJ1dHRvbiB0aGF0IGhhbmRsZXMgYnVsayBEZWxldGUgUGVybWFuZW50bHkgbG9naWNcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkRlbGV0ZVNlbGVjdGVkQnV0dG9uXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5CdXR0b25cbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIEJ1dHRvbiA9IHdwLm1lZGlhLnZpZXcuQnV0dG9uLFxuXHREZWxldGVTZWxlY3RlZCA9IHdwLm1lZGlhLnZpZXcuRGVsZXRlU2VsZWN0ZWRCdXR0b24sXG5cdERlbGV0ZVNlbGVjdGVkUGVybWFuZW50bHk7XG5cbkRlbGV0ZVNlbGVjdGVkUGVybWFuZW50bHkgPSBEZWxldGVTZWxlY3RlZC5leHRlbmQoe1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHREZWxldGVTZWxlY3RlZC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5jb250cm9sbGVyLCAnc2VsZWN0OmFjdGl2YXRlJywgdGhpcy5zZWxlY3RBY3RpdmF0ZSApO1xuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMuY29udHJvbGxlciwgJ3NlbGVjdDpkZWFjdGl2YXRlJywgdGhpcy5zZWxlY3REZWFjdGl2YXRlICk7XG5cdH0sXG5cblx0ZmlsdGVyQ2hhbmdlOiBmdW5jdGlvbiggbW9kZWwgKSB7XG5cdFx0dGhpcy5jYW5TaG93ID0gKCAndHJhc2gnID09PSBtb2RlbC5nZXQoICdzdGF0dXMnICkgKTtcblx0fSxcblxuXHRzZWxlY3RBY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy50b2dnbGVEaXNhYmxlZCgpO1xuXHRcdHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCAnaGlkZGVuJywgISB0aGlzLmNhblNob3cgKTtcblx0fSxcblxuXHRzZWxlY3REZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnRvZ2dsZURpc2FibGVkKCk7XG5cdFx0dGhpcy4kZWwuYWRkQ2xhc3MoICdoaWRkZW4nICk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRCdXR0b24ucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0dGhpcy5zZWxlY3RBY3RpdmF0ZSgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBEZWxldGVTZWxlY3RlZFBlcm1hbmVudGx5O1xuIiwiLypnbG9iYWxzIHdwICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5EZWxldGVTZWxlY3RlZEJ1dHRvblxuICpcbiAqIEEgYnV0dG9uIHRoYXQgaGFuZGxlcyBidWxrIERlbGV0ZS9UcmFzaCBsb2dpY1xuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuQnV0dG9uXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBCdXR0b24gPSB3cC5tZWRpYS52aWV3LkJ1dHRvbixcblx0bDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0RGVsZXRlU2VsZWN0ZWQ7XG5cbkRlbGV0ZVNlbGVjdGVkID0gQnV0dG9uLmV4dGVuZCh7XG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdEJ1dHRvbi5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuZmlsdGVycyApIHtcblx0XHRcdHRoaXMubGlzdGVuVG8oIHRoaXMub3B0aW9ucy5maWx0ZXJzLm1vZGVsLCAnY2hhbmdlJywgdGhpcy5maWx0ZXJDaGFuZ2UgKTtcblx0XHR9XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5jb250cm9sbGVyLCAnc2VsZWN0aW9uOnRvZ2dsZScsIHRoaXMudG9nZ2xlRGlzYWJsZWQgKTtcblx0fSxcblxuXHRmaWx0ZXJDaGFuZ2U6IGZ1bmN0aW9uKCBtb2RlbCApIHtcblx0XHRpZiAoICd0cmFzaCcgPT09IG1vZGVsLmdldCggJ3N0YXR1cycgKSApIHtcblx0XHRcdHRoaXMubW9kZWwuc2V0KCAndGV4dCcsIGwxMG4udW50cmFzaFNlbGVjdGVkICk7XG5cdFx0fSBlbHNlIGlmICggd3AubWVkaWEudmlldy5zZXR0aW5ncy5tZWRpYVRyYXNoICkge1xuXHRcdFx0dGhpcy5tb2RlbC5zZXQoICd0ZXh0JywgbDEwbi50cmFzaFNlbGVjdGVkICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubW9kZWwuc2V0KCAndGV4dCcsIGwxMG4uZGVsZXRlU2VsZWN0ZWQgKTtcblx0XHR9XG5cdH0sXG5cblx0dG9nZ2xlRGlzYWJsZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubW9kZWwuc2V0KCAnZGlzYWJsZWQnLCAhIHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLmdldCggJ3NlbGVjdGlvbicgKS5sZW5ndGggKTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdEJ1dHRvbi5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHRpZiAoIHRoaXMuY29udHJvbGxlci5pc01vZGVBY3RpdmUoICdzZWxlY3QnICkgKSB7XG5cdFx0XHR0aGlzLiRlbC5hZGRDbGFzcyggJ2RlbGV0ZS1zZWxlY3RlZC1idXR0b24nICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuJGVsLmFkZENsYXNzKCAnZGVsZXRlLXNlbGVjdGVkLWJ1dHRvbiBoaWRkZW4nICk7XG5cdFx0fVxuXHRcdHRoaXMudG9nZ2xlRGlzYWJsZWQoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGVsZXRlU2VsZWN0ZWQ7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlNlbGVjdE1vZGVUb2dnbGVCdXR0b25cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkJ1dHRvblxuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgQnV0dG9uID0gd3AubWVkaWEudmlldy5CdXR0b24sXG5cdGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdFNlbGVjdE1vZGVUb2dnbGU7XG5cblNlbGVjdE1vZGVUb2dnbGUgPSBCdXR0b24uZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0QnV0dG9uLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLmNvbnRyb2xsZXIsICdzZWxlY3Q6YWN0aXZhdGUgc2VsZWN0OmRlYWN0aXZhdGUnLCB0aGlzLnRvZ2dsZUJ1bGtFZGl0SGFuZGxlciApO1xuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMuY29udHJvbGxlciwgJ3NlbGVjdGlvbjphY3Rpb246ZG9uZScsIHRoaXMuYmFjayApO1xuXHR9LFxuXG5cdGJhY2s6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmNvbnRyb2xsZXIuZGVhY3RpdmF0ZU1vZGUoICdzZWxlY3QnICkuYWN0aXZhdGVNb2RlKCAnZWRpdCcgKTtcblx0fSxcblxuXHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0QnV0dG9uLnByb3RvdHlwZS5jbGljay5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0aWYgKCB0aGlzLmNvbnRyb2xsZXIuaXNNb2RlQWN0aXZlKCAnc2VsZWN0JyApICkge1xuXHRcdFx0dGhpcy5iYWNrKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuY29udHJvbGxlci5kZWFjdGl2YXRlTW9kZSggJ2VkaXQnICkuYWN0aXZhdGVNb2RlKCAnc2VsZWN0JyApO1xuXHRcdH1cblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdEJ1dHRvbi5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHR0aGlzLiRlbC5hZGRDbGFzcyggJ3NlbGVjdC1tb2RlLXRvZ2dsZS1idXR0b24nICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0dG9nZ2xlQnVsa0VkaXRIYW5kbGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdG9vbGJhciA9IHRoaXMuY29udHJvbGxlci5jb250ZW50LmdldCgpLnRvb2xiYXIsIGNoaWxkcmVuO1xuXG5cdFx0Y2hpbGRyZW4gPSB0b29sYmFyLiQoICcubWVkaWEtdG9vbGJhci1zZWNvbmRhcnkgPiAqLCAubWVkaWEtdG9vbGJhci1wcmltYXJ5ID4gKicgKTtcblxuXHRcdC8vIFRPRE86IHRoZSBGcmFtZSBzaG91bGQgYmUgZG9pbmcgYWxsIG9mIHRoaXMuXG5cdFx0aWYgKCB0aGlzLmNvbnRyb2xsZXIuaXNNb2RlQWN0aXZlKCAnc2VsZWN0JyApICkge1xuXHRcdFx0dGhpcy5tb2RlbC5zZXQoICd0ZXh0JywgbDEwbi5jYW5jZWxTZWxlY3Rpb24gKTtcblx0XHRcdGNoaWxkcmVuLm5vdCggJy5zcGlubmVyLCAubWVkaWEtYnV0dG9uJyApLmhpZGUoKTtcblx0XHRcdHRoaXMuJGVsLnNob3coKTtcblx0XHRcdHRvb2xiYXIuJCggJy5kZWxldGUtc2VsZWN0ZWQtYnV0dG9uJyApLnJlbW92ZUNsYXNzKCAnaGlkZGVuJyApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm1vZGVsLnNldCggJ3RleHQnLCBsMTBuLmJ1bGtTZWxlY3QgKTtcblx0XHRcdHRoaXMuY29udHJvbGxlci5jb250ZW50LmdldCgpLiRlbC5yZW1vdmVDbGFzcyggJ2ZpeGVkJyApO1xuXHRcdFx0dG9vbGJhci4kZWwuY3NzKCAnd2lkdGgnLCAnJyApO1xuXHRcdFx0dG9vbGJhci4kKCAnLmRlbGV0ZS1zZWxlY3RlZC1idXR0b24nICkuYWRkQ2xhc3MoICdoaWRkZW4nICk7XG5cdFx0XHRjaGlsZHJlbi5ub3QoICcubWVkaWEtYnV0dG9uJyApLnNob3coKTtcblx0XHRcdHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLmdldCggJ3NlbGVjdGlvbicgKS5yZXNldCgpO1xuXHRcdH1cblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0TW9kZVRvZ2dsZTtcbiIsIi8qZ2xvYmFscyB3cCwgXyAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuRWRpdEltYWdlLkRldGFpbHNcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkVkaXRJbWFnZVxuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgVmlldyA9IHdwLm1lZGlhLlZpZXcsXG5cdEVkaXRJbWFnZSA9IHdwLm1lZGlhLnZpZXcuRWRpdEltYWdlLFxuXHREZXRhaWxzO1xuXG5EZXRhaWxzID0gRWRpdEltYWdlLmV4dGVuZCh7XG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdHRoaXMuZWRpdG9yID0gd2luZG93LmltYWdlRWRpdDtcblx0XHR0aGlzLmZyYW1lID0gb3B0aW9ucy5mcmFtZTtcblx0XHR0aGlzLmNvbnRyb2xsZXIgPSBvcHRpb25zLmNvbnRyb2xsZXI7XG5cdFx0Vmlldy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cblx0YmFjazogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mcmFtZS5jb250ZW50Lm1vZGUoICdlZGl0LW1ldGFkYXRhJyApO1xuXHR9LFxuXG5cdHNhdmU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubW9kZWwuZmV0Y2goKS5kb25lKCBfLmJpbmQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5mcmFtZS5jb250ZW50Lm1vZGUoICdlZGl0LW1ldGFkYXRhJyApO1xuXHRcdH0sIHRoaXMgKSApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBEZXRhaWxzO1xuIiwiLypnbG9iYWxzIHdwLCBfLCBqUXVlcnkgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWUuRWRpdEF0dGFjaG1lbnRzXG4gKlxuICogQSBmcmFtZSBmb3IgZWRpdGluZyB0aGUgZGV0YWlscyBvZiBhIHNwZWNpZmljIG1lZGlhIGl0ZW0uXG4gKlxuICogT3BlbnMgaW4gYSBtb2RhbCBieSBkZWZhdWx0LlxuICpcbiAqIFJlcXVpcmVzIGFuIGF0dGFjaG1lbnQgbW9kZWwgdG8gYmUgcGFzc2VkIGluIHRoZSBvcHRpb25zIGhhc2ggdW5kZXIgYG1vZGVsYC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkZyYW1lXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKiBAbWl4ZXMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZU1hY2hpbmVcbiAqL1xudmFyIEZyYW1lID0gd3AubWVkaWEudmlldy5GcmFtZSxcblx0TWVkaWFGcmFtZSA9IHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZSxcblxuXHQkID0galF1ZXJ5LFxuXHRFZGl0QXR0YWNobWVudHM7XG5cbkVkaXRBdHRhY2htZW50cyA9IE1lZGlhRnJhbWUuZXh0ZW5kKHtcblxuXHRjbGFzc05hbWU6ICdlZGl0LWF0dGFjaG1lbnQtZnJhbWUnLFxuXHR0ZW1wbGF0ZTogIHdwLnRlbXBsYXRlKCAnZWRpdC1hdHRhY2htZW50LWZyYW1lJyApLFxuXHRyZWdpb25zOiAgIFsgJ3RpdGxlJywgJ2NvbnRlbnQnIF0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIC5sZWZ0JzogICdwcmV2aW91c01lZGlhSXRlbScsXG5cdFx0J2NsaWNrIC5yaWdodCc6ICduZXh0TWVkaWFJdGVtJ1xuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdEZyYW1lLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdF8uZGVmYXVsdHMoIHRoaXMub3B0aW9ucywge1xuXHRcdFx0bW9kYWw6IHRydWUsXG5cdFx0XHRzdGF0ZTogJ2VkaXQtYXR0YWNobWVudCdcblx0XHR9KTtcblxuXHRcdHRoaXMuY29udHJvbGxlciA9IHRoaXMub3B0aW9ucy5jb250cm9sbGVyO1xuXHRcdHRoaXMuZ3JpZFJvdXRlciA9IHRoaXMuY29udHJvbGxlci5ncmlkUm91dGVyO1xuXHRcdHRoaXMubGlicmFyeSA9IHRoaXMub3B0aW9ucy5saWJyYXJ5O1xuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMubW9kZWwgKSB7XG5cdFx0XHR0aGlzLm1vZGVsID0gdGhpcy5vcHRpb25zLm1vZGVsO1xuXHRcdH1cblxuXHRcdHRoaXMuYmluZEhhbmRsZXJzKCk7XG5cdFx0dGhpcy5jcmVhdGVTdGF0ZXMoKTtcblx0XHR0aGlzLmNyZWF0ZU1vZGFsKCk7XG5cblx0XHR0aGlzLnRpdGxlLm1vZGUoICdkZWZhdWx0JyApO1xuXHRcdHRoaXMudG9nZ2xlTmF2KCk7XG5cdH0sXG5cblx0YmluZEhhbmRsZXJzOiBmdW5jdGlvbigpIHtcblx0XHQvLyBCaW5kIGRlZmF1bHQgdGl0bGUgY3JlYXRpb24uXG5cdFx0dGhpcy5vbiggJ3RpdGxlOmNyZWF0ZTpkZWZhdWx0JywgdGhpcy5jcmVhdGVUaXRsZSwgdGhpcyApO1xuXG5cdFx0Ly8gQ2xvc2UgdGhlIG1vZGFsIGlmIHRoZSBhdHRhY2htZW50IGlzIGRlbGV0ZWQuXG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZTpzdGF0dXMgZGVzdHJveScsIHRoaXMuY2xvc2UsIHRoaXMgKTtcblxuXHRcdHRoaXMub24oICdjb250ZW50OmNyZWF0ZTplZGl0LW1ldGFkYXRhJywgdGhpcy5lZGl0TWV0YWRhdGFNb2RlLCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ2NvbnRlbnQ6Y3JlYXRlOmVkaXQtaW1hZ2UnLCB0aGlzLmVkaXRJbWFnZU1vZGUsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnY29udGVudDpyZW5kZXI6ZWRpdC1pbWFnZScsIHRoaXMuZWRpdEltYWdlTW9kZVJlbmRlciwgdGhpcyApO1xuXHRcdHRoaXMub24oICdjbG9zZScsIHRoaXMuZGV0YWNoICk7XG5cdH0sXG5cblx0Y3JlYXRlTW9kYWw6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIEluaXRpYWxpemUgbW9kYWwgY29udGFpbmVyIHZpZXcuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMubW9kYWwgKSB7XG5cdFx0XHR0aGlzLm1vZGFsID0gbmV3IHdwLm1lZGlhLnZpZXcuTW9kYWwoe1xuXHRcdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0XHR0aXRsZTogICAgICB0aGlzLm9wdGlvbnMudGl0bGVcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLm1vZGFsLm9uKCAnb3BlbicsIF8uYmluZCggZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQkKCAnYm9keScgKS5vbiggJ2tleWRvd24ubWVkaWEtbW9kYWwnLCBfLmJpbmQoIHRoaXMua2V5RXZlbnQsIHRoaXMgKSApO1xuXHRcdFx0fSwgdGhpcyApICk7XG5cblx0XHRcdC8vIENvbXBsZXRlbHkgZGVzdHJveSB0aGUgbW9kYWwgRE9NIGVsZW1lbnQgd2hlbiBjbG9zaW5nIGl0LlxuXHRcdFx0dGhpcy5tb2RhbC5vbiggJ2Nsb3NlJywgXy5iaW5kKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhpcy5tb2RhbC5yZW1vdmUoKTtcblx0XHRcdFx0JCggJ2JvZHknICkub2ZmKCAna2V5ZG93bi5tZWRpYS1tb2RhbCcgKTsgLyogcmVtb3ZlIHRoZSBrZXlkb3duIGV2ZW50ICovXG5cdFx0XHRcdC8vIFJlc3RvcmUgdGhlIG9yaWdpbmFsIGZvY3VzIGl0ZW0gaWYgcG9zc2libGVcblx0XHRcdFx0JCggJ2xpLmF0dGFjaG1lbnRbZGF0YS1pZD1cIicgKyB0aGlzLm1vZGVsLmdldCggJ2lkJyApICsnXCJdJyApLmZvY3VzKCk7XG5cdFx0XHRcdHRoaXMucmVzZXRSb3V0ZSgpO1xuXHRcdFx0fSwgdGhpcyApICk7XG5cblx0XHRcdC8vIFNldCB0aGlzIGZyYW1lIGFzIHRoZSBtb2RhbCdzIGNvbnRlbnQuXG5cdFx0XHR0aGlzLm1vZGFsLmNvbnRlbnQoIHRoaXMgKTtcblx0XHRcdHRoaXMubW9kYWwub3BlbigpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogQWRkIHRoZSBkZWZhdWx0IHN0YXRlcyB0byB0aGUgZnJhbWUuXG5cdCAqL1xuXHRjcmVhdGVTdGF0ZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc3RhdGVzLmFkZChbXG5cdFx0XHRuZXcgd3AubWVkaWEuY29udHJvbGxlci5FZGl0QXR0YWNobWVudE1ldGFkYXRhKCB7IG1vZGVsOiB0aGlzLm1vZGVsIH0gKVxuXHRcdF0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDb250ZW50IHJlZ2lvbiByZW5kZXJpbmcgY2FsbGJhY2sgZm9yIHRoZSBgZWRpdC1tZXRhZGF0YWAgbW9kZS5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IGNvbnRlbnRSZWdpb24gQmFzaWMgb2JqZWN0IHdpdGggYSBgdmlld2AgcHJvcGVydHksIHdoaWNoXG5cdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZCBiZSBzZXQgd2l0aCB0aGUgcHJvcGVyIHJlZ2lvbiB2aWV3LlxuXHQgKi9cblx0ZWRpdE1ldGFkYXRhTW9kZTogZnVuY3Rpb24oIGNvbnRlbnRSZWdpb24gKSB7XG5cdFx0Y29udGVudFJlZ2lvbi52aWV3ID0gbmV3IHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudC5EZXRhaWxzLlR3b0NvbHVtbih7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0bW9kZWw6ICAgICAgdGhpcy5tb2RlbFxuXHRcdH0pO1xuXG5cdFx0LyoqXG5cdFx0ICogQXR0YWNoIGEgc3VidmlldyB0byBkaXNwbGF5IGZpZWxkcyBhZGRlZCB2aWEgdGhlXG5cdFx0ICogYGF0dGFjaG1lbnRfZmllbGRzX3RvX2VkaXRgIGZpbHRlci5cblx0XHQgKi9cblx0XHRjb250ZW50UmVnaW9uLnZpZXcudmlld3Muc2V0KCAnLmF0dGFjaG1lbnQtY29tcGF0JywgbmV3IHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudENvbXBhdCh7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0bW9kZWw6ICAgICAgdGhpcy5tb2RlbFxuXHRcdH0pICk7XG5cblx0XHQvLyBVcGRhdGUgYnJvd3NlciB1cmwgd2hlbiBuYXZpZ2F0aW5nIG1lZGlhIGRldGFpbHNcblx0XHRpZiAoIHRoaXMubW9kZWwgKSB7XG5cdFx0XHR0aGlzLmdyaWRSb3V0ZXIubmF2aWdhdGUoIHRoaXMuZ3JpZFJvdXRlci5iYXNlVXJsKCAnP2l0ZW09JyArIHRoaXMubW9kZWwuaWQgKSApO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogUmVuZGVyIHRoZSBFZGl0SW1hZ2UgdmlldyBpbnRvIHRoZSBmcmFtZSdzIGNvbnRlbnQgcmVnaW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gY29udGVudFJlZ2lvbiBCYXNpYyBvYmplY3Qgd2l0aCBhIGB2aWV3YCBwcm9wZXJ0eSwgd2hpY2hcblx0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkIGJlIHNldCB3aXRoIHRoZSBwcm9wZXIgcmVnaW9uIHZpZXcuXG5cdCAqL1xuXHRlZGl0SW1hZ2VNb2RlOiBmdW5jdGlvbiggY29udGVudFJlZ2lvbiApIHtcblx0XHR2YXIgZWRpdEltYWdlQ29udHJvbGxlciA9IG5ldyB3cC5tZWRpYS5jb250cm9sbGVyLkVkaXRJbWFnZSgge1xuXHRcdFx0bW9kZWw6IHRoaXMubW9kZWwsXG5cdFx0XHRmcmFtZTogdGhpc1xuXHRcdH0gKTtcblx0XHQvLyBOb29wIHNvbWUgbWV0aG9kcy5cblx0XHRlZGl0SW1hZ2VDb250cm9sbGVyLl90b29sYmFyID0gZnVuY3Rpb24oKSB7fTtcblx0XHRlZGl0SW1hZ2VDb250cm9sbGVyLl9yb3V0ZXIgPSBmdW5jdGlvbigpIHt9O1xuXHRcdGVkaXRJbWFnZUNvbnRyb2xsZXIuX21lbnUgPSBmdW5jdGlvbigpIHt9O1xuXG5cdFx0Y29udGVudFJlZ2lvbi52aWV3ID0gbmV3IHdwLm1lZGlhLnZpZXcuRWRpdEltYWdlLkRldGFpbHMoIHtcblx0XHRcdG1vZGVsOiB0aGlzLm1vZGVsLFxuXHRcdFx0ZnJhbWU6IHRoaXMsXG5cdFx0XHRjb250cm9sbGVyOiBlZGl0SW1hZ2VDb250cm9sbGVyXG5cdFx0fSApO1xuXHR9LFxuXG5cdGVkaXRJbWFnZU1vZGVSZW5kZXI6IGZ1bmN0aW9uKCB2aWV3ICkge1xuXHRcdHZpZXcub24oICdyZWFkeScsIHZpZXcubG9hZEVkaXRvciApO1xuXHR9LFxuXG5cdHRvZ2dsZU5hdjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kKCcubGVmdCcpLnRvZ2dsZUNsYXNzKCAnZGlzYWJsZWQnLCAhIHRoaXMuaGFzUHJldmlvdXMoKSApO1xuXHRcdHRoaXMuJCgnLnJpZ2h0JykudG9nZ2xlQ2xhc3MoICdkaXNhYmxlZCcsICEgdGhpcy5oYXNOZXh0KCkgKTtcblx0fSxcblxuXHQvKipcblx0ICogUmVyZW5kZXIgdGhlIHZpZXcuXG5cdCAqL1xuXHRyZXJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gT25seSByZXJlbmRlciB0aGUgYGNvbnRlbnRgIHJlZ2lvbi5cblx0XHRpZiAoIHRoaXMuY29udGVudC5tb2RlKCkgIT09ICdlZGl0LW1ldGFkYXRhJyApIHtcblx0XHRcdHRoaXMuY29udGVudC5tb2RlKCAnZWRpdC1tZXRhZGF0YScgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5jb250ZW50LnJlbmRlcigpO1xuXHRcdH1cblxuXHRcdHRoaXMudG9nZ2xlTmF2KCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENsaWNrIGhhbmRsZXIgdG8gc3dpdGNoIHRvIHRoZSBwcmV2aW91cyBtZWRpYSBpdGVtLlxuXHQgKi9cblx0cHJldmlvdXNNZWRpYUl0ZW06IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggISB0aGlzLmhhc1ByZXZpb3VzKCkgKSB7XG5cdFx0XHR0aGlzLiQoICcubGVmdCcgKS5ibHVyKCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRoaXMubW9kZWwgPSB0aGlzLmxpYnJhcnkuYXQoIHRoaXMuZ2V0Q3VycmVudEluZGV4KCkgLSAxICk7XG5cdFx0dGhpcy5yZXJlbmRlcigpO1xuXHRcdHRoaXMuJCggJy5sZWZ0JyApLmZvY3VzKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENsaWNrIGhhbmRsZXIgdG8gc3dpdGNoIHRvIHRoZSBuZXh0IG1lZGlhIGl0ZW0uXG5cdCAqL1xuXHRuZXh0TWVkaWFJdGVtOiBmdW5jdGlvbigpIHtcblx0XHRpZiAoICEgdGhpcy5oYXNOZXh0KCkgKSB7XG5cdFx0XHR0aGlzLiQoICcucmlnaHQnICkuYmx1cigpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0aGlzLm1vZGVsID0gdGhpcy5saWJyYXJ5LmF0KCB0aGlzLmdldEN1cnJlbnRJbmRleCgpICsgMSApO1xuXHRcdHRoaXMucmVyZW5kZXIoKTtcblx0XHR0aGlzLiQoICcucmlnaHQnICkuZm9jdXMoKTtcblx0fSxcblxuXHRnZXRDdXJyZW50SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmxpYnJhcnkuaW5kZXhPZiggdGhpcy5tb2RlbCApO1xuXHR9LFxuXG5cdGhhc05leHQ6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAoIHRoaXMuZ2V0Q3VycmVudEluZGV4KCkgKyAxICkgPCB0aGlzLmxpYnJhcnkubGVuZ3RoO1xuXHR9LFxuXG5cdGhhc1ByZXZpb3VzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gKCB0aGlzLmdldEN1cnJlbnRJbmRleCgpIC0gMSApID4gLTE7XG5cdH0sXG5cdC8qKlxuXHQgKiBSZXNwb25kIHRvIHRoZSBrZXlib2FyZCBldmVudHM6IHJpZ2h0IGFycm93LCBsZWZ0IGFycm93LCBleGNlcHQgd2hlblxuXHQgKiBmb2N1cyBpcyBpbiBhIHRleHRhcmVhIG9yIGlucHV0IGZpZWxkLlxuXHQgKi9cblx0a2V5RXZlbnQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRpZiAoICggJ0lOUFVUJyA9PT0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lIHx8ICdURVhUQVJFQScgPT09IGV2ZW50LnRhcmdldC5ub2RlTmFtZSApICYmICEgKCBldmVudC50YXJnZXQucmVhZE9ubHkgfHwgZXZlbnQudGFyZ2V0LmRpc2FibGVkICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gVGhlIHJpZ2h0IGFycm93IGtleVxuXHRcdGlmICggMzkgPT09IGV2ZW50LmtleUNvZGUgKSB7XG5cdFx0XHR0aGlzLm5leHRNZWRpYUl0ZW0oKTtcblx0XHR9XG5cdFx0Ly8gVGhlIGxlZnQgYXJyb3cga2V5XG5cdFx0aWYgKCAzNyA9PT0gZXZlbnQua2V5Q29kZSApIHtcblx0XHRcdHRoaXMucHJldmlvdXNNZWRpYUl0ZW0oKTtcblx0XHR9XG5cdH0sXG5cblx0cmVzZXRSb3V0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5ncmlkUm91dGVyLm5hdmlnYXRlKCB0aGlzLmdyaWRSb3V0ZXIuYmFzZVVybCggJycgKSApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0QXR0YWNobWVudHM7XG4iLCIvKmdsb2JhbHMgd3AsIF8sIEJhY2tib25lICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5NZWRpYUZyYW1lLk1hbmFnZVxuICpcbiAqIEEgZ2VuZXJpYyBtYW5hZ2VtZW50IGZyYW1lIHdvcmtmbG93LlxuICpcbiAqIFVzZWQgaW4gdGhlIG1lZGlhIGdyaWQgdmlldy5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWVcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkZyYW1lXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKiBAbWl4ZXMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZU1hY2hpbmVcbiAqL1xudmFyIE1lZGlhRnJhbWUgPSB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWUsXG5cdExpYnJhcnkgPSB3cC5tZWRpYS5jb250cm9sbGVyLkxpYnJhcnksXG5cblx0JCA9IEJhY2tib25lLiQsXG5cdE1hbmFnZTtcblxuTWFuYWdlID0gTWVkaWFGcmFtZS5leHRlbmQoe1xuXHQvKipcblx0ICogQGdsb2JhbCB3cC5VcGxvYWRlclxuXHQgKi9cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0Xy5kZWZhdWx0cyggdGhpcy5vcHRpb25zLCB7XG5cdFx0XHR0aXRsZTogICAgICcnLFxuXHRcdFx0bW9kYWw6ICAgICBmYWxzZSxcblx0XHRcdHNlbGVjdGlvbjogW10sXG5cdFx0XHRsaWJyYXJ5OiAgIHt9LCAvLyBPcHRpb25zIGhhc2ggZm9yIHRoZSBxdWVyeSB0byB0aGUgbWVkaWEgbGlicmFyeS5cblx0XHRcdG11bHRpcGxlOiAgJ2FkZCcsXG5cdFx0XHRzdGF0ZTogICAgICdsaWJyYXJ5Jyxcblx0XHRcdHVwbG9hZGVyOiAgdHJ1ZSxcblx0XHRcdG1vZGU6ICAgICAgWyAnZ3JpZCcsICdlZGl0JyBdXG5cdFx0fSk7XG5cblx0XHR0aGlzLiRib2R5ID0gJCggZG9jdW1lbnQuYm9keSApO1xuXHRcdHRoaXMuJHdpbmRvdyA9ICQoIHdpbmRvdyApO1xuXHRcdHRoaXMuJGFkbWluQmFyID0gJCggJyN3cGFkbWluYmFyJyApO1xuXHRcdHRoaXMuJHdpbmRvdy5vbiggJ3Njcm9sbCByZXNpemUnLCBfLmRlYm91bmNlKCBfLmJpbmQoIHRoaXMuZml4UG9zaXRpb24sIHRoaXMgKSwgMTUgKSApO1xuXHRcdCQoIGRvY3VtZW50ICkub24oICdjbGljaycsICcuYWRkLW5ldy1oMicsIF8uYmluZCggdGhpcy5hZGROZXdDbGlja0hhbmRsZXIsIHRoaXMgKSApO1xuXG5cdFx0Ly8gRW5zdXJlIGNvcmUgYW5kIG1lZGlhIGdyaWQgdmlldyBVSSBpcyBlbmFibGVkLlxuXHRcdHRoaXMuJGVsLmFkZENsYXNzKCd3cC1jb3JlLXVpJyk7XG5cblx0XHQvLyBGb3JjZSB0aGUgdXBsb2FkZXIgb2ZmIGlmIHRoZSB1cGxvYWQgbGltaXQgaGFzIGJlZW4gZXhjZWVkZWQgb3Jcblx0XHQvLyBpZiB0aGUgYnJvd3NlciBpc24ndCBzdXBwb3J0ZWQuXG5cdFx0aWYgKCB3cC5VcGxvYWRlci5saW1pdEV4Y2VlZGVkIHx8ICEgd3AuVXBsb2FkZXIuYnJvd3Nlci5zdXBwb3J0ZWQgKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMudXBsb2FkZXIgPSBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBJbml0aWFsaXplIGEgd2luZG93LXdpZGUgdXBsb2FkZXIuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMudXBsb2FkZXIgKSB7XG5cdFx0XHR0aGlzLnVwbG9hZGVyID0gbmV3IHdwLm1lZGlhLnZpZXcuVXBsb2FkZXJXaW5kb3coe1xuXHRcdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0XHR1cGxvYWRlcjoge1xuXHRcdFx0XHRcdGRyb3B6b25lOiAgZG9jdW1lbnQuYm9keSxcblx0XHRcdFx0XHRjb250YWluZXI6IGRvY3VtZW50LmJvZHlcblx0XHRcdFx0fVxuXHRcdFx0fSkucmVuZGVyKCk7XG5cdFx0XHR0aGlzLnVwbG9hZGVyLnJlYWR5KCk7XG5cdFx0XHR0aGlzLiRib2R5LmFwcGVuZCggdGhpcy51cGxvYWRlci5lbCApO1xuXG5cdFx0XHR0aGlzLm9wdGlvbnMudXBsb2FkZXIgPSBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBDYWxsICdpbml0aWFsaXplJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzLlxuXHRcdE1lZGlhRnJhbWUucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0Ly8gQXBwZW5kIHRoZSBmcmFtZSB2aWV3IGRpcmVjdGx5IHRoZSBzdXBwbGllZCBjb250YWluZXIuXG5cdFx0dGhpcy4kZWwuYXBwZW5kVG8oIHRoaXMub3B0aW9ucy5jb250YWluZXIgKTtcblxuXHRcdHRoaXMuc2V0TGlicmFyeSggdGhpcy5vcHRpb25zICk7XG5cdFx0dGhpcy5zZXRSb3V0ZXIoKTtcblx0XHR0aGlzLmNyZWF0ZVN0YXRlcygpO1xuXHRcdHRoaXMuYmluZFJlZ2lvbk1vZGVIYW5kbGVycygpO1xuXHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0dGhpcy5iaW5kU2VhcmNoSGFuZGxlcigpO1xuXHR9LFxuXG5cdHNldExpYnJhcnk6IGZ1bmN0aW9uICggb3B0aW9ucyApIHtcblx0XHR0aGlzLmxpYnJhcnkgPSB3cC5tZWRpYS5xdWVyeSggb3B0aW9ucy5saWJyYXJ5ICk7XG5cdH0sXG5cblx0c2V0Um91dGVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5ncmlkUm91dGVyID0gbmV3IHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5NYW5hZ2UuUm91dGVyKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRsaWJyYXJ5OiB0aGlzLmxpYnJhcnlcblx0XHR9KTtcblx0fSxcblxuXHRiaW5kU2VhcmNoSGFuZGxlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlYXJjaCA9IHRoaXMuJCggJyNtZWRpYS1zZWFyY2gtaW5wdXQnICksXG5cdFx0XHRjdXJyZW50U2VhcmNoID0gdGhpcy5vcHRpb25zLmNvbnRhaW5lci5kYXRhKCAnc2VhcmNoJyApLFxuXHRcdFx0c2VhcmNoVmlldyA9IHRoaXMuYnJvd3NlclZpZXcudG9vbGJhci5nZXQoICdzZWFyY2gnICkuJGVsLFxuXHRcdFx0bGlzdE1vZGUgPSB0aGlzLiQoICcudmlldy1saXN0JyApLFxuXG5cdFx0XHRpbnB1dCAgPSBfLmRlYm91bmNlKCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHR2YXIgdmFsID0gJCggZS5jdXJyZW50VGFyZ2V0ICkudmFsKCksXG5cdFx0XHRcdFx0dXJsID0gJyc7XG5cblx0XHRcdFx0aWYgKCB2YWwgKSB7XG5cdFx0XHRcdFx0dXJsICs9ICc/c2VhcmNoPScgKyB2YWw7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5ncmlkUm91dGVyLm5hdmlnYXRlKCB0aGlzLmdyaWRSb3V0ZXIuYmFzZVVybCggdXJsICkgKTtcblx0XHRcdH0sIDEwMDAgKTtcblxuXHRcdC8vIFVwZGF0ZSB0aGUgVVJMIHdoZW4gZW50ZXJpbmcgc2VhcmNoIHN0cmluZyAoYXQgbW9zdCBvbmNlIHBlciBzZWNvbmQpXG5cdFx0c2VhcmNoLm9uKCAnaW5wdXQnLCBfLmJpbmQoIGlucHV0LCB0aGlzICkgKTtcblx0XHRpZiAoIGN1cnJlbnRTZWFyY2ggKSB7XG5cdFx0XHRzZWFyY2hWaWV3LnZhbCggY3VycmVudFNlYXJjaCApLnRyaWdnZXIoICdpbnB1dCcgKTtcblx0XHR9XG5cblx0XHR0aGlzLmdyaWRSb3V0ZXIub24oICdyb3V0ZTpzZWFyY2gnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuXHRcdFx0aWYgKCBocmVmLmluZGV4T2YoICdtb2RlPScgKSA+IC0xICkge1xuXHRcdFx0XHRocmVmID0gaHJlZi5yZXBsYWNlKCAvbW9kZT1bXiZdKy9nLCAnbW9kZT1saXN0JyApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aHJlZiArPSBocmVmLmluZGV4T2YoICc/JyApID4gLTEgPyAnJm1vZGU9bGlzdCcgOiAnP21vZGU9bGlzdCc7XG5cdFx0XHR9XG5cdFx0XHRocmVmID0gaHJlZi5yZXBsYWNlKCAnc2VhcmNoPScsICdzPScgKTtcblx0XHRcdGxpc3RNb2RlLnByb3AoICdocmVmJywgaHJlZiApO1xuXHRcdH0gKTtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIHRoZSBkZWZhdWx0IHN0YXRlcyBmb3IgdGhlIGZyYW1lLlxuXHQgKi9cblx0Y3JlYXRlU3RhdGVzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuXHRcdGlmICggdGhpcy5vcHRpb25zLnN0YXRlcyApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBBZGQgdGhlIGRlZmF1bHQgc3RhdGVzLlxuXHRcdHRoaXMuc3RhdGVzLmFkZChbXG5cdFx0XHRuZXcgTGlicmFyeSh7XG5cdFx0XHRcdGxpYnJhcnk6ICAgICAgICAgICAgdGhpcy5saWJyYXJ5LFxuXHRcdFx0XHRtdWx0aXBsZTogICAgICAgICAgIG9wdGlvbnMubXVsdGlwbGUsXG5cdFx0XHRcdHRpdGxlOiAgICAgICAgICAgICAgb3B0aW9ucy50aXRsZSxcblx0XHRcdFx0Y29udGVudDogICAgICAgICAgICAnYnJvd3NlJyxcblx0XHRcdFx0dG9vbGJhcjogICAgICAgICAgICAnc2VsZWN0Jyxcblx0XHRcdFx0Y29udGVudFVzZXJTZXR0aW5nOiBmYWxzZSxcblx0XHRcdFx0ZmlsdGVyYWJsZTogICAgICAgICAnYWxsJyxcblx0XHRcdFx0YXV0b1NlbGVjdDogICAgICAgICBmYWxzZVxuXHRcdFx0fSlcblx0XHRdKTtcblx0fSxcblxuXHQvKipcblx0ICogQmluZCByZWdpb24gbW9kZSBhY3RpdmF0aW9uIGV2ZW50cyB0byBwcm9wZXIgaGFuZGxlcnMuXG5cdCAqL1xuXHRiaW5kUmVnaW9uTW9kZUhhbmRsZXJzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm9uKCAnY29udGVudDpjcmVhdGU6YnJvd3NlJywgdGhpcy5icm93c2VDb250ZW50LCB0aGlzICk7XG5cblx0XHQvLyBIYW5kbGUgYSBmcmFtZS1sZXZlbCBldmVudCBmb3IgZWRpdGluZyBhbiBhdHRhY2htZW50LlxuXHRcdHRoaXMub24oICdlZGl0OmF0dGFjaG1lbnQnLCB0aGlzLm9wZW5FZGl0QXR0YWNobWVudE1vZGFsLCB0aGlzICk7XG5cblx0XHR0aGlzLm9uKCAnc2VsZWN0OmFjdGl2YXRlJywgdGhpcy5iaW5kS2V5ZG93biwgdGhpcyApO1xuXHRcdHRoaXMub24oICdzZWxlY3Q6ZGVhY3RpdmF0ZScsIHRoaXMudW5iaW5kS2V5ZG93biwgdGhpcyApO1xuXHR9LFxuXG5cdGhhbmRsZUtleWRvd246IGZ1bmN0aW9uKCBlICkge1xuXHRcdGlmICggMjcgPT09IGUud2hpY2ggKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR0aGlzLmRlYWN0aXZhdGVNb2RlKCAnc2VsZWN0JyApLmFjdGl2YXRlTW9kZSggJ2VkaXQnICk7XG5cdFx0fVxuXHR9LFxuXG5cdGJpbmRLZXlkb3duOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiRib2R5Lm9uKCAna2V5ZG93bi5zZWxlY3QnLCBfLmJpbmQoIHRoaXMuaGFuZGxlS2V5ZG93biwgdGhpcyApICk7XG5cdH0sXG5cblx0dW5iaW5kS2V5ZG93bjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kYm9keS5vZmYoICdrZXlkb3duLnNlbGVjdCcgKTtcblx0fSxcblxuXHRmaXhQb3NpdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRicm93c2VyLCAkdG9vbGJhcjtcblx0XHRpZiAoICEgdGhpcy5pc01vZGVBY3RpdmUoICdzZWxlY3QnICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JGJyb3dzZXIgPSB0aGlzLiQoJy5hdHRhY2htZW50cy1icm93c2VyJyk7XG5cdFx0JHRvb2xiYXIgPSAkYnJvd3Nlci5maW5kKCcubWVkaWEtdG9vbGJhcicpO1xuXG5cdFx0Ly8gT2Zmc2V0IGRvZXNuJ3QgYXBwZWFyIHRvIHRha2UgdG9wIG1hcmdpbiBpbnRvIGFjY291bnQsIGhlbmNlICsxNlxuXHRcdGlmICggKCAkYnJvd3Nlci5vZmZzZXQoKS50b3AgKyAxNiApIDwgdGhpcy4kd2luZG93LnNjcm9sbFRvcCgpICsgdGhpcy4kYWRtaW5CYXIuaGVpZ2h0KCkgKSB7XG5cdFx0XHQkYnJvd3Nlci5hZGRDbGFzcyggJ2ZpeGVkJyApO1xuXHRcdFx0JHRvb2xiYXIuY3NzKCd3aWR0aCcsICRicm93c2VyLndpZHRoKCkgKyAncHgnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JGJyb3dzZXIucmVtb3ZlQ2xhc3MoICdmaXhlZCcgKTtcblx0XHRcdCR0b29sYmFyLmNzcygnd2lkdGgnLCAnJyk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBDbGljayBoYW5kbGVyIGZvciB0aGUgYEFkZCBOZXdgIGJ1dHRvbi5cblx0ICovXG5cdGFkZE5ld0NsaWNrSGFuZGxlcjogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dGhpcy50cmlnZ2VyKCAndG9nZ2xlOnVwbG9hZDphdHRhY2htZW50JyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBPcGVuIHRoZSBFZGl0IEF0dGFjaG1lbnQgbW9kYWwuXG5cdCAqL1xuXHRvcGVuRWRpdEF0dGFjaG1lbnRNb2RhbDogZnVuY3Rpb24oIG1vZGVsICkge1xuXHRcdC8vIENyZWF0ZSBhIG5ldyBFZGl0QXR0YWNobWVudCBmcmFtZSwgcGFzc2luZyBhbG9uZyB0aGUgbGlicmFyeSBhbmQgdGhlIGF0dGFjaG1lbnQgbW9kZWwuXG5cdFx0d3AubWVkaWEoIHtcblx0XHRcdGZyYW1lOiAgICAgICAnZWRpdC1hdHRhY2htZW50cycsXG5cdFx0XHRjb250cm9sbGVyOiAgdGhpcyxcblx0XHRcdGxpYnJhcnk6ICAgICB0aGlzLnN0YXRlKCkuZ2V0KCdsaWJyYXJ5JyksXG5cdFx0XHRtb2RlbDogICAgICAgbW9kZWxcblx0XHR9ICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhbiBhdHRhY2htZW50cyBicm93c2VyIHZpZXcgd2l0aGluIHRoZSBjb250ZW50IHJlZ2lvbi5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IGNvbnRlbnRSZWdpb24gQmFzaWMgb2JqZWN0IHdpdGggYSBgdmlld2AgcHJvcGVydHksIHdoaWNoXG5cdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZCBiZSBzZXQgd2l0aCB0aGUgcHJvcGVyIHJlZ2lvbiB2aWV3LlxuXHQgKiBAdGhpcyB3cC5tZWRpYS5jb250cm9sbGVyLlJlZ2lvblxuXHQgKi9cblx0YnJvd3NlQ29udGVudDogZnVuY3Rpb24oIGNvbnRlbnRSZWdpb24gKSB7XG5cdFx0dmFyIHN0YXRlID0gdGhpcy5zdGF0ZSgpO1xuXG5cdFx0Ly8gQnJvd3NlIG91ciBsaWJyYXJ5IG9mIGF0dGFjaG1lbnRzLlxuXHRcdHRoaXMuYnJvd3NlclZpZXcgPSBjb250ZW50UmVnaW9uLnZpZXcgPSBuZXcgd3AubWVkaWEudmlldy5BdHRhY2htZW50c0Jyb3dzZXIoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcyxcblx0XHRcdGNvbGxlY3Rpb246IHN0YXRlLmdldCgnbGlicmFyeScpLFxuXHRcdFx0c2VsZWN0aW9uOiAgc3RhdGUuZ2V0KCdzZWxlY3Rpb24nKSxcblx0XHRcdG1vZGVsOiAgICAgIHN0YXRlLFxuXHRcdFx0c29ydGFibGU6ICAgc3RhdGUuZ2V0KCdzb3J0YWJsZScpLFxuXHRcdFx0c2VhcmNoOiAgICAgc3RhdGUuZ2V0KCdzZWFyY2hhYmxlJyksXG5cdFx0XHRmaWx0ZXJzOiAgICBzdGF0ZS5nZXQoJ2ZpbHRlcmFibGUnKSxcblx0XHRcdGRhdGU6ICAgICAgIHN0YXRlLmdldCgnZGF0ZScpLFxuXHRcdFx0ZGlzcGxheTogICAgc3RhdGUuZ2V0KCdkaXNwbGF5U2V0dGluZ3MnKSxcblx0XHRcdGRyYWdJbmZvOiAgIHN0YXRlLmdldCgnZHJhZ0luZm8nKSxcblx0XHRcdHNpZGViYXI6ICAgICdlcnJvcnMnLFxuXG5cdFx0XHRzdWdnZXN0ZWRXaWR0aDogIHN0YXRlLmdldCgnc3VnZ2VzdGVkV2lkdGgnKSxcblx0XHRcdHN1Z2dlc3RlZEhlaWdodDogc3RhdGUuZ2V0KCdzdWdnZXN0ZWRIZWlnaHQnKSxcblxuXHRcdFx0QXR0YWNobWVudFZpZXc6IHN0YXRlLmdldCgnQXR0YWNobWVudFZpZXcnKSxcblxuXHRcdFx0c2Nyb2xsRWxlbWVudDogZG9jdW1lbnRcblx0XHR9KTtcblx0XHR0aGlzLmJyb3dzZXJWaWV3Lm9uKCAncmVhZHknLCBfLmJpbmQoIHRoaXMuYmluZERlZmVycmVkLCB0aGlzICkgKTtcblxuXHRcdHRoaXMuZXJyb3JzID0gd3AuVXBsb2FkZXIuZXJyb3JzO1xuXHRcdHRoaXMuZXJyb3JzLm9uKCAnYWRkIHJlbW92ZSByZXNldCcsIHRoaXMuc2lkZWJhclZpc2liaWxpdHksIHRoaXMgKTtcblx0fSxcblxuXHRzaWRlYmFyVmlzaWJpbGl0eTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5icm93c2VyVmlldy4kKCAnLm1lZGlhLXNpZGViYXInICkudG9nZ2xlKCAhISB0aGlzLmVycm9ycy5sZW5ndGggKTtcblx0fSxcblxuXHRiaW5kRGVmZXJyZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggISB0aGlzLmJyb3dzZXJWaWV3LmRmZCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhpcy5icm93c2VyVmlldy5kZmQuZG9uZSggXy5iaW5kKCB0aGlzLnN0YXJ0SGlzdG9yeSwgdGhpcyApICk7XG5cdH0sXG5cblx0c3RhcnRIaXN0b3J5OiBmdW5jdGlvbigpIHtcblx0XHQvLyBWZXJpZnkgcHVzaFN0YXRlIHN1cHBvcnQgYW5kIGFjdGl2YXRlXG5cdFx0aWYgKCB3aW5kb3cuaGlzdG9yeSAmJiB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUgKSB7XG5cdFx0XHRCYWNrYm9uZS5oaXN0b3J5LnN0YXJ0KCB7XG5cdFx0XHRcdHJvb3Q6IHdpbmRvdy5fd3BNZWRpYUdyaWRTZXR0aW5ncy5hZG1pblVybCxcblx0XHRcdFx0cHVzaFN0YXRlOiB0cnVlXG5cdFx0XHR9ICk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYW5hZ2U7XG4iXX0=
