(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/collection-add.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.controller.CollectionAdd
 *
 * A state for adding attachments to a collection (e.g. video playlist).
 *
 * @class
 * @augments wp.media.controller.Library
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                     [attributes]                         The attributes hash passed to the state.
 * @param {string}                     [attributes.id=library]      Unique identifier.
 * @param {string}                     attributes.title                    Title for the state. Displays in the frame's title region.
 * @param {boolean}                    [attributes.multiple=add]            Whether multi-select is enabled. @todo 'add' doesn't seem do anything special, and gets used as a boolean.
 * @param {wp.media.model.Attachments} [attributes.library]                 The attachments collection to browse.
 *                                                                          If one is not supplied, a collection of attachments of the specified type will be created.
 * @param {boolean|string}             [attributes.filterable=uploaded]     Whether the library is filterable, and if so what filters should be shown.
 *                                                                          Accepts 'all', 'uploaded', or 'unattached'.
 * @param {string}                     [attributes.menu=gallery]            Initial mode for the menu region.
 * @param {string}                     [attributes.content=upload]          Initial mode for the content region.
 *                                                                          Overridden by persistent user setting if 'contentUserSetting' is true.
 * @param {string}                     [attributes.router=browse]           Initial mode for the router region.
 * @param {string}                     [attributes.toolbar=gallery-add]     Initial mode for the toolbar region.
 * @param {boolean}                    [attributes.searchable=true]         Whether the library is searchable.
 * @param {boolean}                    [attributes.sortable=true]           Whether the Attachments should be sortable. Depends on the orderby property being set to menuOrder on the attachments collection.
 * @param {boolean}                    [attributes.autoSelect=true]         Whether an uploaded attachment should be automatically added to the selection.
 * @param {boolean}                    [attributes.contentUserSetting=true] Whether the content region's mode should be set and persisted per user.
 * @param {int}                        [attributes.priority=100]            The priority for the state link in the media menu.
 * @param {boolean}                    [attributes.syncSelection=false]     Whether the Attachments selection should be persisted from the last state.
 *                                                                          Defaults to false because for this state, because the library of the Edit Gallery state is the selection.
 * @param {string}                     attributes.type                   The collection's media type. (e.g. 'video').
 * @param {string}                     attributes.collectionType         The collection type. (e.g. 'playlist').
 */
var Selection = wp.media.model.Selection,
	Library = wp.media.controller.Library,
	CollectionAdd;

CollectionAdd = Library.extend({
	defaults: _.defaults( {
		// Selection defaults. @see media.model.Selection
		multiple:      'add',
		// Attachments browser defaults. @see media.view.AttachmentsBrowser
		filterable:    'uploaded',

		priority:      100,
		syncSelection: false
	}, Library.prototype.defaults ),

	/**
	 * @since 3.9.0
	 */
	initialize: function() {
		var collectionType = this.get('collectionType');

		if ( 'video' === this.get( 'type' ) ) {
			collectionType = 'video-' + collectionType;
		}

		this.set( 'id', collectionType + '-library' );
		this.set( 'toolbar', collectionType + '-add' );
		this.set( 'menu', collectionType );

		// If we haven't been provided a `library`, create a `Selection`.
		if ( ! this.get('library') ) {
			this.set( 'library', wp.media.query({ type: this.get('type') }) );
		}
		Library.prototype.initialize.apply( this, arguments );
	},

	/**
	 * @since 3.9.0
	 */
	activate: function() {
		var library = this.get('library'),
			editLibrary = this.get('editLibrary'),
			edit = this.frame.state( this.get('collectionType') + '-edit' ).get('library');

		if ( editLibrary && editLibrary !== edit ) {
			library.unobserve( editLibrary );
		}

		// Accepts attachments that exist in the original library and
		// that do not exist in gallery's library.
		library.validator = function( attachment ) {
			return !! this.mirroring.get( attachment.cid ) && ! edit.get( attachment.cid ) && Selection.prototype.validator.apply( this, arguments );
		};

		// Reset the library to ensure that all attachments are re-added
		// to the collection. Do so silently, as calling `observe` will
		// trigger the `reset` event.
		library.reset( library.mirroring.models, { silent: true });
		library.observe( edit );
		this.set('editLibrary', edit);

		Library.prototype.activate.apply( this, arguments );
	}
});

module.exports = CollectionAdd;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/collection-edit.js":[function(require,module,exports){
/*globals wp, Backbone */

/**
 * wp.media.controller.CollectionEdit
 *
 * A state for editing a collection, which is used by audio and video playlists,
 * and can be used for other collections.
 *
 * @class
 * @augments wp.media.controller.Library
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                     [attributes]                      The attributes hash passed to the state.
 * @param {string}                     attributes.title                  Title for the state. Displays in the media menu and the frame's title region.
 * @param {wp.media.model.Attachments} [attributes.library]              The attachments collection to edit.
 *                                                                       If one is not supplied, an empty media.model.Selection collection is created.
 * @param {boolean}                    [attributes.multiple=false]       Whether multi-select is enabled.
 * @param {string}                     [attributes.content=browse]       Initial mode for the content region.
 * @param {string}                     attributes.menu                   Initial mode for the menu region. @todo this needs a better explanation.
 * @param {boolean}                    [attributes.searchable=false]     Whether the library is searchable.
 * @param {boolean}                    [attributes.sortable=true]        Whether the Attachments should be sortable. Depends on the orderby property being set to menuOrder on the attachments collection.
 * @param {boolean}                    [attributes.date=true]            Whether to show the date filter in the browser's toolbar.
 * @param {boolean}                    [attributes.describe=true]        Whether to offer UI to describe the attachments - e.g. captioning images in a gallery.
 * @param {boolean}                    [attributes.dragInfo=true]        Whether to show instructional text about the attachments being sortable.
 * @param {boolean}                    [attributes.dragInfoText]         Instructional text about the attachments being sortable.
 * @param {int}                        [attributes.idealColumnWidth=170] The ideal column width in pixels for attachments.
 * @param {boolean}                    [attributes.editing=false]        Whether the gallery is being created, or editing an existing instance.
 * @param {int}                        [attributes.priority=60]          The priority for the state link in the media menu.
 * @param {boolean}                    [attributes.syncSelection=false]  Whether the Attachments selection should be persisted from the last state.
 *                                                                       Defaults to false for this state, because the library passed in  *is* the selection.
 * @param {view}                       [attributes.SettingsView]         The view to edit the collection instance settings (e.g. Playlist settings with "Show tracklist" checkbox).
 * @param {view}                       [attributes.AttachmentView]       The single `Attachment` view to be used in the `Attachments`.
 *                                                                       If none supplied, defaults to wp.media.view.Attachment.EditLibrary.
 * @param {string}                     attributes.type                   The collection's media type. (e.g. 'video').
 * @param {string}                     attributes.collectionType         The collection type. (e.g. 'playlist').
 */
var Library = wp.media.controller.Library,
	l10n = wp.media.view.l10n,
	$ = jQuery,
	CollectionEdit;

CollectionEdit = Library.extend({
	defaults: {
		multiple:         false,
		sortable:         true,
		date:             false,
		searchable:       false,
		content:          'browse',
		describe:         true,
		dragInfo:         true,
		idealColumnWidth: 170,
		editing:          false,
		priority:         60,
		SettingsView:     false,
		syncSelection:    false
	},

	/**
	 * @since 3.9.0
	 */
	initialize: function() {
		var collectionType = this.get('collectionType');

		if ( 'video' === this.get( 'type' ) ) {
			collectionType = 'video-' + collectionType;
		}

		this.set( 'id', collectionType + '-edit' );
		this.set( 'toolbar', collectionType + '-edit' );

		// If we haven't been provided a `library`, create a `Selection`.
		if ( ! this.get('library') ) {
			this.set( 'library', new wp.media.model.Selection() );
		}
		// The single `Attachment` view to be used in the `Attachments` view.
		if ( ! this.get('AttachmentView') ) {
			this.set( 'AttachmentView', wp.media.view.Attachment.EditLibrary );
		}
		Library.prototype.initialize.apply( this, arguments );
	},

	/**
	 * @since 3.9.0
	 */
	activate: function() {
		var library = this.get('library');

		// Limit the library to images only.
		library.props.set( 'type', this.get( 'type' ) );

		// Watch for uploaded attachments.
		this.get('library').observe( wp.Uploader.queue );

		this.frame.on( 'content:render:browse', this.renderSettings, this );

		Library.prototype.activate.apply( this, arguments );
	},

	/**
	 * @since 3.9.0
	 */
	deactivate: function() {
		// Stop watching for uploaded attachments.
		this.get('library').unobserve( wp.Uploader.queue );

		this.frame.off( 'content:render:browse', this.renderSettings, this );

		Library.prototype.deactivate.apply( this, arguments );
	},

	/**
	 * Render the collection embed settings view in the browser sidebar.
	 *
	 * @todo This is against the pattern elsewhere in media. Typically the frame
	 *       is responsible for adding region mode callbacks. Explain.
	 *
	 * @since 3.9.0
	 *
	 * @param {wp.media.view.attachmentsBrowser} The attachments browser view.
	 */
	renderSettings: function( attachmentsBrowserView ) {
		var library = this.get('library'),
			collectionType = this.get('collectionType'),
			dragInfoText = this.get('dragInfoText'),
			SettingsView = this.get('SettingsView'),
			obj = {};

		if ( ! library || ! attachmentsBrowserView ) {
			return;
		}

		library[ collectionType ] = library[ collectionType ] || new Backbone.Model();

		obj[ collectionType ] = new SettingsView({
			controller: this,
			model:      library[ collectionType ],
			priority:   40
		});

		attachmentsBrowserView.sidebar.set( obj );

		if ( dragInfoText ) {
			attachmentsBrowserView.toolbar.set( 'dragInfo', new wp.media.View({
				el: $( '<div class="instructions">' + dragInfoText + '</div>' )[0],
				priority: -40
			}) );
		}

		// Add the 'Reverse order' button to the toolbar.
		attachmentsBrowserView.toolbar.set( 'reverse', {
			text:     l10n.reverseOrder,
			priority: 80,

			click: function() {
				library.reset( library.toArray().reverse() );
			}
		});
	}
});

module.exports = CollectionEdit;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/cropper.js":[function(require,module,exports){
/*globals wp, _, Backbone */

/**
 * wp.media.controller.Cropper
 *
 * A state for cropping an image.
 *
 * @class
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 */
var l10n = wp.media.view.l10n,
	Cropper;

Cropper = wp.media.controller.State.extend({
	defaults: {
		id:          'cropper',
		title:       l10n.cropImage,
		// Region mode defaults.
		toolbar:     'crop',
		content:     'crop',
		router:      false,

		canSkipCrop: false
	},

	activate: function() {
		this.frame.on( 'content:create:crop', this.createCropContent, this );
		this.frame.on( 'close', this.removeCropper, this );
		this.set('selection', new Backbone.Collection(this.frame._selection.single));
	},

	deactivate: function() {
		this.frame.toolbar.mode('browse');
	},

	createCropContent: function() {
		this.cropperView = new wp.media.view.Cropper({
			controller: this,
			attachment: this.get('selection').first()
		});
		this.cropperView.on('image-loaded', this.createCropToolbar, this);
		this.frame.content.set(this.cropperView);

	},
	removeCropper: function() {
		this.imgSelect.cancelSelection();
		this.imgSelect.setOptions({remove: true});
		this.imgSelect.update();
		this.cropperView.remove();
	},
	createCropToolbar: function() {
		var canSkipCrop, toolbarOptions;

		canSkipCrop = this.get('canSkipCrop') || false;

		toolbarOptions = {
			controller: this.frame,
			items: {
				insert: {
					style:    'primary',
					text:     l10n.cropImage,
					priority: 80,
					requires: { library: false, selection: false },

					click: function() {
						var controller = this.controller,
							selection;

						selection = controller.state().get('selection').first();
						selection.set({cropDetails: controller.state().imgSelect.getSelection()});

						this.$el.text(l10n.cropping);
						this.$el.attr('disabled', true);

						controller.state().doCrop( selection ).done( function( croppedImage ) {
							controller.trigger('cropped', croppedImage );
							controller.close();
						}).fail( function() {
							controller.trigger('content:error:crop');
						});
					}
				}
			}
		};

		if ( canSkipCrop ) {
			_.extend( toolbarOptions.items, {
				skip: {
					style:      'secondary',
					text:       l10n.skipCropping,
					priority:   70,
					requires:   { library: false, selection: false },
					click:      function() {
						var selection = this.controller.state().get('selection').first();
						this.controller.state().cropperView.remove();
						this.controller.trigger('skippedcrop', selection);
						this.controller.close();
					}
				}
			});
		}

		this.frame.toolbar.set( new wp.media.view.Toolbar(toolbarOptions) );
	},

	doCrop: function( attachment ) {
		return wp.ajax.post( 'custom-header-crop', {
			nonce: attachment.get('nonces').edit,
			id: attachment.get('id'),
			cropDetails: attachment.get('cropDetails')
		} );
	}
});

module.exports = Cropper;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/edit-image.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.controller.EditImage
 *
 * A state for editing (cropping, etc.) an image.
 *
 * @class
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                    attributes                      The attributes hash passed to the state.
 * @param {wp.media.model.Attachment} attributes.model                The attachment.
 * @param {string}                    [attributes.id=edit-image]      Unique identifier.
 * @param {string}                    [attributes.title=Edit Image]   Title for the state. Displays in the media menu and the frame's title region.
 * @param {string}                    [attributes.content=edit-image] Initial mode for the content region.
 * @param {string}                    [attributes.toolbar=edit-image] Initial mode for the toolbar region.
 * @param {string}                    [attributes.menu=false]         Initial mode for the menu region.
 * @param {string}                    [attributes.url]                Unused. @todo Consider removal.
 */
var l10n = wp.media.view.l10n,
	EditImage;

EditImage = wp.media.controller.State.extend({
	defaults: {
		id:      'edit-image',
		title:   l10n.editImage,
		menu:    false,
		toolbar: 'edit-image',
		content: 'edit-image',
		url:     ''
	},

	/**
	 * @since 3.9.0
	 */
	activate: function() {
		this.listenTo( this.frame, 'toolbar:render:edit-image', this.toolbar );
	},

	/**
	 * @since 3.9.0
	 */
	deactivate: function() {
		this.stopListening( this.frame );
	},

	/**
	 * @since 3.9.0
	 */
	toolbar: function() {
		var frame = this.frame,
			lastState = frame.lastState(),
			previous = lastState && lastState.id;

		frame.toolbar.set( new wp.media.view.Toolbar({
			controller: frame,
			items: {
				back: {
					style: 'primary',
					text:     l10n.back,
					priority: 20,
					click:    function() {
						if ( previous ) {
							frame.setState( previous );
						} else {
							frame.close();
						}
					}
				}
			}
		}) );
	}
});

module.exports = EditImage;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/embed.js":[function(require,module,exports){
/*globals wp, _, Backbone */

/**
 * wp.media.controller.Embed
 *
 * A state for embedding media from a URL.
 *
 * @class
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object} attributes                         The attributes hash passed to the state.
 * @param {string} [attributes.id=embed]              Unique identifier.
 * @param {string} [attributes.title=Insert From URL] Title for the state. Displays in the media menu and the frame's title region.
 * @param {string} [attributes.content=embed]         Initial mode for the content region.
 * @param {string} [attributes.menu=default]          Initial mode for the menu region.
 * @param {string} [attributes.toolbar=main-embed]    Initial mode for the toolbar region.
 * @param {string} [attributes.menu=false]            Initial mode for the menu region.
 * @param {int}    [attributes.priority=120]          The priority for the state link in the media menu.
 * @param {string} [attributes.type=link]             The type of embed. Currently only link is supported.
 * @param {string} [attributes.url]                   The embed URL.
 * @param {object} [attributes.metadata={}]           Properties of the embed, which will override attributes.url if set.
 */
var l10n = wp.media.view.l10n,
	$ = Backbone.$,
	Embed;

Embed = wp.media.controller.State.extend({
	defaults: {
		id:       'embed',
		title:    l10n.insertFromUrlTitle,
		content:  'embed',
		menu:     'default',
		toolbar:  'main-embed',
		priority: 120,
		type:     'link',
		url:      '',
		metadata: {}
	},

	// The amount of time used when debouncing the scan.
	sensitivity: 400,

	initialize: function(options) {
		this.metadata = options.metadata;
		this.debouncedScan = _.debounce( _.bind( this.scan, this ), this.sensitivity );
		this.props = new Backbone.Model( this.metadata || { url: '' });
		this.props.on( 'change:url', this.debouncedScan, this );
		this.props.on( 'change:url', this.refresh, this );
		this.on( 'scan', this.scanImage, this );
	},

	/**
	 * Trigger a scan of the embedded URL's content for metadata required to embed.
	 *
	 * @fires wp.media.controller.Embed#scan
	 */
	scan: function() {
		var scanners,
			embed = this,
			attributes = {
				type: 'link',
				scanners: []
			};

		// Scan is triggered with the list of `attributes` to set on the
		// state, useful for the 'type' attribute and 'scanners' attribute,
		// an array of promise objects for asynchronous scan operations.
		if ( this.props.get('url') ) {
			this.trigger( 'scan', attributes );
		}

		if ( attributes.scanners.length ) {
			scanners = attributes.scanners = $.when.apply( $, attributes.scanners );
			scanners.always( function() {
				if ( embed.get('scanners') === scanners ) {
					embed.set( 'loading', false );
				}
			});
		} else {
			attributes.scanners = null;
		}

		attributes.loading = !! attributes.scanners;
		this.set( attributes );
	},
	/**
	 * Try scanning the embed as an image to discover its dimensions.
	 *
	 * @param {Object} attributes
	 */
	scanImage: function( attributes ) {
		var frame = this.frame,
			state = this,
			url = this.props.get('url'),
			image = new Image(),
			deferred = $.Deferred();

		attributes.scanners.push( deferred.promise() );

		// Try to load the image and find its width/height.
		image.onload = function() {
			deferred.resolve();

			if ( state !== frame.state() || url !== state.props.get('url') ) {
				return;
			}

			state.set({
				type: 'image'
			});

			state.props.set({
				width:  image.width,
				height: image.height
			});
		};

		image.onerror = deferred.reject;
		image.src = url;
	},

	refresh: function() {
		this.frame.toolbar.get().refresh();
	},

	reset: function() {
		this.props.clear().set({ url: '' });

		if ( this.active ) {
			this.refresh();
		}
	}
});

module.exports = Embed;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/featured-image.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.controller.FeaturedImage
 *
 * A state for selecting a featured image for a post.
 *
 * @class
 * @augments wp.media.controller.Library
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                     [attributes]                          The attributes hash passed to the state.
 * @param {string}                     [attributes.id=featured-image]        Unique identifier.
 * @param {string}                     [attributes.title=Set Featured Image] Title for the state. Displays in the media menu and the frame's title region.
 * @param {wp.media.model.Attachments} [attributes.library]                  The attachments collection to browse.
 *                                                                           If one is not supplied, a collection of all images will be created.
 * @param {boolean}                    [attributes.multiple=false]           Whether multi-select is enabled.
 * @param {string}                     [attributes.content=upload]           Initial mode for the content region.
 *                                                                           Overridden by persistent user setting if 'contentUserSetting' is true.
 * @param {string}                     [attributes.menu=default]             Initial mode for the menu region.
 * @param {string}                     [attributes.router=browse]            Initial mode for the router region.
 * @param {string}                     [attributes.toolbar=featured-image]   Initial mode for the toolbar region.
 * @param {int}                        [attributes.priority=60]              The priority for the state link in the media menu.
 * @param {boolean}                    [attributes.searchable=true]          Whether the library is searchable.
 * @param {boolean|string}             [attributes.filterable=false]         Whether the library is filterable, and if so what filters should be shown.
 *                                                                           Accepts 'all', 'uploaded', or 'unattached'.
 * @param {boolean}                    [attributes.sortable=true]            Whether the Attachments should be sortable. Depends on the orderby property being set to menuOrder on the attachments collection.
 * @param {boolean}                    [attributes.autoSelect=true]          Whether an uploaded attachment should be automatically added to the selection.
 * @param {boolean}                    [attributes.describe=false]           Whether to offer UI to describe attachments - e.g. captioning images in a gallery.
 * @param {boolean}                    [attributes.contentUserSetting=true]  Whether the content region's mode should be set and persisted per user.
 * @param {boolean}                    [attributes.syncSelection=true]       Whether the Attachments selection should be persisted from the last state.
 */
var Attachment = wp.media.model.Attachment,
	Library = wp.media.controller.Library,
	l10n = wp.media.view.l10n,
	FeaturedImage;

FeaturedImage = Library.extend({
	defaults: _.defaults({
		id:            'featured-image',
		title:         l10n.setFeaturedImageTitle,
		multiple:      false,
		filterable:    'uploaded',
		toolbar:       'featured-image',
		priority:      60,
		syncSelection: true
	}, Library.prototype.defaults ),

	/**
	 * @since 3.5.0
	 */
	initialize: function() {
		var library, comparator;

		// If we haven't been provided a `library`, create a `Selection`.
		if ( ! this.get('library') ) {
			this.set( 'library', wp.media.query({ type: 'image' }) );
		}

		Library.prototype.initialize.apply( this, arguments );

		library    = this.get('library');
		comparator = library.comparator;

		// Overload the library's comparator to push items that are not in
		// the mirrored query to the front of the aggregate collection.
		library.comparator = function( a, b ) {
			var aInQuery = !! this.mirroring.get( a.cid ),
				bInQuery = !! this.mirroring.get( b.cid );

			if ( ! aInQuery && bInQuery ) {
				return -1;
			} else if ( aInQuery && ! bInQuery ) {
				return 1;
			} else {
				return comparator.apply( this, arguments );
			}
		};

		// Add all items in the selection to the library, so any featured
		// images that are not initially loaded still appear.
		library.observe( this.get('selection') );
	},

	/**
	 * @since 3.5.0
	 */
	activate: function() {
		this.updateSelection();
		this.frame.on( 'open', this.updateSelection, this );

		Library.prototype.activate.apply( this, arguments );
	},

	/**
	 * @since 3.5.0
	 */
	deactivate: function() {
		this.frame.off( 'open', this.updateSelection, this );

		Library.prototype.deactivate.apply( this, arguments );
	},

	/**
	 * @since 3.5.0
	 */
	updateSelection: function() {
		var selection = this.get('selection'),
			id = wp.media.view.settings.post.featuredImageId,
			attachment;

		if ( '' !== id && -1 !== id ) {
			attachment = Attachment.get( id );
			attachment.fetch();
		}

		selection.reset( attachment ? [ attachment ] : [] );
	}
});

module.exports = FeaturedImage;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/gallery-add.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.controller.GalleryAdd
 *
 * A state for selecting more images to add to a gallery.
 *
 * @class
 * @augments wp.media.controller.Library
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                     [attributes]                         The attributes hash passed to the state.
 * @param {string}                     [attributes.id=gallery-library]      Unique identifier.
 * @param {string}                     [attributes.title=Add to Gallery]    Title for the state. Displays in the frame's title region.
 * @param {boolean}                    [attributes.multiple=add]            Whether multi-select is enabled. @todo 'add' doesn't seem do anything special, and gets used as a boolean.
 * @param {wp.media.model.Attachments} [attributes.library]                 The attachments collection to browse.
 *                                                                          If one is not supplied, a collection of all images will be created.
 * @param {boolean|string}             [attributes.filterable=uploaded]     Whether the library is filterable, and if so what filters should be shown.
 *                                                                          Accepts 'all', 'uploaded', or 'unattached'.
 * @param {string}                     [attributes.menu=gallery]            Initial mode for the menu region.
 * @param {string}                     [attributes.content=upload]          Initial mode for the content region.
 *                                                                          Overridden by persistent user setting if 'contentUserSetting' is true.
 * @param {string}                     [attributes.router=browse]           Initial mode for the router region.
 * @param {string}                     [attributes.toolbar=gallery-add]     Initial mode for the toolbar region.
 * @param {boolean}                    [attributes.searchable=true]         Whether the library is searchable.
 * @param {boolean}                    [attributes.sortable=true]           Whether the Attachments should be sortable. Depends on the orderby property being set to menuOrder on the attachments collection.
 * @param {boolean}                    [attributes.autoSelect=true]         Whether an uploaded attachment should be automatically added to the selection.
 * @param {boolean}                    [attributes.contentUserSetting=true] Whether the content region's mode should be set and persisted per user.
 * @param {int}                        [attributes.priority=100]            The priority for the state link in the media menu.
 * @param {boolean}                    [attributes.syncSelection=false]     Whether the Attachments selection should be persisted from the last state.
 *                                                                          Defaults to false because for this state, because the library of the Edit Gallery state is the selection.
 */
var Selection = wp.media.model.Selection,
	Library = wp.media.controller.Library,
	l10n = wp.media.view.l10n,
	GalleryAdd;

GalleryAdd = Library.extend({
	defaults: _.defaults({
		id:            'gallery-library',
		title:         l10n.addToGalleryTitle,
		multiple:      'add',
		filterable:    'uploaded',
		menu:          'gallery',
		toolbar:       'gallery-add',
		priority:      100,
		syncSelection: false
	}, Library.prototype.defaults ),

	/**
	 * @since 3.5.0
	 */
	initialize: function() {
		// If a library wasn't supplied, create a library of images.
		if ( ! this.get('library') ) {
			this.set( 'library', wp.media.query({ type: 'image' }) );
		}

		Library.prototype.initialize.apply( this, arguments );
	},

	/**
	 * @since 3.5.0
	 */
	activate: function() {
		var library = this.get('library'),
			edit    = this.frame.state('gallery-edit').get('library');

		if ( this.editLibrary && this.editLibrary !== edit ) {
			library.unobserve( this.editLibrary );
		}

		// Accepts attachments that exist in the original library and
		// that do not exist in gallery's library.
		library.validator = function( attachment ) {
			return !! this.mirroring.get( attachment.cid ) && ! edit.get( attachment.cid ) && Selection.prototype.validator.apply( this, arguments );
		};

		// Reset the library to ensure that all attachments are re-added
		// to the collection. Do so silently, as calling `observe` will
		// trigger the `reset` event.
		library.reset( library.mirroring.models, { silent: true });
		library.observe( edit );
		this.editLibrary = edit;

		Library.prototype.activate.apply( this, arguments );
	}
});

module.exports = GalleryAdd;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/gallery-edit.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.controller.GalleryEdit
 *
 * A state for editing a gallery's images and settings.
 *
 * @class
 * @augments wp.media.controller.Library
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                     [attributes]                       The attributes hash passed to the state.
 * @param {string}                     [attributes.id=gallery-edit]       Unique identifier.
 * @param {string}                     [attributes.title=Edit Gallery]    Title for the state. Displays in the frame's title region.
 * @param {wp.media.model.Attachments} [attributes.library]               The collection of attachments in the gallery.
 *                                                                        If one is not supplied, an empty media.model.Selection collection is created.
 * @param {boolean}                    [attributes.multiple=false]        Whether multi-select is enabled.
 * @param {boolean}                    [attributes.searchable=false]      Whether the library is searchable.
 * @param {boolean}                    [attributes.sortable=true]         Whether the Attachments should be sortable. Depends on the orderby property being set to menuOrder on the attachments collection.
 * @param {boolean}                    [attributes.date=true]             Whether to show the date filter in the browser's toolbar.
 * @param {string|false}               [attributes.content=browse]        Initial mode for the content region.
 * @param {string|false}               [attributes.toolbar=image-details] Initial mode for the toolbar region.
 * @param {boolean}                    [attributes.describe=true]         Whether to offer UI to describe attachments - e.g. captioning images in a gallery.
 * @param {boolean}                    [attributes.displaySettings=true]  Whether to show the attachment display settings interface.
 * @param {boolean}                    [attributes.dragInfo=true]         Whether to show instructional text about the attachments being sortable.
 * @param {int}                        [attributes.idealColumnWidth=170]  The ideal column width in pixels for attachments.
 * @param {boolean}                    [attributes.editing=false]         Whether the gallery is being created, or editing an existing instance.
 * @param {int}                        [attributes.priority=60]           The priority for the state link in the media menu.
 * @param {boolean}                    [attributes.syncSelection=false]   Whether the Attachments selection should be persisted from the last state.
 *                                                                        Defaults to false for this state, because the library passed in  *is* the selection.
 * @param {view}                       [attributes.AttachmentView]        The single `Attachment` view to be used in the `Attachments`.
 *                                                                        If none supplied, defaults to wp.media.view.Attachment.EditLibrary.
 */
var Library = wp.media.controller.Library,
	l10n = wp.media.view.l10n,
	GalleryEdit;

GalleryEdit = Library.extend({
	defaults: {
		id:               'gallery-edit',
		title:            l10n.editGalleryTitle,
		multiple:         false,
		searchable:       false,
		sortable:         true,
		date:             false,
		display:          false,
		content:          'browse',
		toolbar:          'gallery-edit',
		describe:         true,
		displaySettings:  true,
		dragInfo:         true,
		idealColumnWidth: 170,
		editing:          false,
		priority:         60,
		syncSelection:    false
	},

	/**
	 * @since 3.5.0
	 */
	initialize: function() {
		// If we haven't been provided a `library`, create a `Selection`.
		if ( ! this.get('library') ) {
			this.set( 'library', new wp.media.model.Selection() );
		}

		// The single `Attachment` view to be used in the `Attachments` view.
		if ( ! this.get('AttachmentView') ) {
			this.set( 'AttachmentView', wp.media.view.Attachment.EditLibrary );
		}

		Library.prototype.initialize.apply( this, arguments );
	},

	/**
	 * @since 3.5.0
	 */
	activate: function() {
		var library = this.get('library');

		// Limit the library to images only.
		library.props.set( 'type', 'image' );

		// Watch for uploaded attachments.
		this.get('library').observe( wp.Uploader.queue );

		this.frame.on( 'content:render:browse', this.gallerySettings, this );

		Library.prototype.activate.apply( this, arguments );
	},

	/**
	 * @since 3.5.0
	 */
	deactivate: function() {
		// Stop watching for uploaded attachments.
		this.get('library').unobserve( wp.Uploader.queue );

		this.frame.off( 'content:render:browse', this.gallerySettings, this );

		Library.prototype.deactivate.apply( this, arguments );
	},

	/**
	 * @since 3.5.0
	 *
	 * @param browser
	 */
	gallerySettings: function( browser ) {
		if ( ! this.get('displaySettings') ) {
			return;
		}

		var library = this.get('library');

		if ( ! library || ! browser ) {
			return;
		}

		library.gallery = library.gallery || new Backbone.Model();

		browser.sidebar.set({
			gallery: new wp.media.view.Settings.Gallery({
				controller: this,
				model:      library.gallery,
				priority:   40
			})
		});

		browser.toolbar.set( 'reverse', {
			text:     l10n.reverseOrder,
			priority: 80,

			click: function() {
				library.reset( library.toArray().reverse() );
			}
		});
	}
});

module.exports = GalleryEdit;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/image-details.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.controller.ImageDetails
 *
 * A state for editing the attachment display settings of an image that's been
 * inserted into the editor.
 *
 * @class
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                    [attributes]                       The attributes hash passed to the state.
 * @param {string}                    [attributes.id=image-details]      Unique identifier.
 * @param {string}                    [attributes.title=Image Details]   Title for the state. Displays in the frame's title region.
 * @param {wp.media.model.Attachment} attributes.image                   The image's model.
 * @param {string|false}              [attributes.content=image-details] Initial mode for the content region.
 * @param {string|false}              [attributes.menu=false]            Initial mode for the menu region.
 * @param {string|false}              [attributes.router=false]          Initial mode for the router region.
 * @param {string|false}              [attributes.toolbar=image-details] Initial mode for the toolbar region.
 * @param {boolean}                   [attributes.editing=false]         Unused.
 * @param {int}                       [attributes.priority=60]           Unused.
 *
 * @todo This state inherits some defaults from media.controller.Library.prototype.defaults,
 *       however this may not do anything.
 */
var State = wp.media.controller.State,
	Library = wp.media.controller.Library,
	l10n = wp.media.view.l10n,
	ImageDetails;

ImageDetails = State.extend({
	defaults: _.defaults({
		id:       'image-details',
		title:    l10n.imageDetailsTitle,
		content:  'image-details',
		menu:     false,
		router:   false,
		toolbar:  'image-details',
		editing:  false,
		priority: 60
	}, Library.prototype.defaults ),

	/**
	 * @since 3.9.0
	 *
	 * @param options Attributes
	 */
	initialize: function( options ) {
		this.image = options.image;
		State.prototype.initialize.apply( this, arguments );
	},

	/**
	 * @since 3.9.0
	 */
	activate: function() {
		this.frame.modal.$el.addClass('image-details');
	}
});

module.exports = ImageDetails;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/library.js":[function(require,module,exports){
/*globals wp, _, Backbone */

/**
 * wp.media.controller.Library
 *
 * A state for choosing an attachment or group of attachments from the media library.
 *
 * @class
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 * @mixes media.selectionSync
 *
 * @param {object}                          [attributes]                         The attributes hash passed to the state.
 * @param {string}                          [attributes.id=library]              Unique identifier.
 * @param {string}                          [attributes.title=Media library]     Title for the state. Displays in the media menu and the frame's title region.
 * @param {wp.media.model.Attachments}      [attributes.library]                 The attachments collection to browse.
 *                                                                               If one is not supplied, a collection of all attachments will be created.
 * @param {wp.media.model.Selection|object} [attributes.selection]               A collection to contain attachment selections within the state.
 *                                                                               If the 'selection' attribute is a plain JS object,
 *                                                                               a Selection will be created using its values as the selection instance's `props` model.
 *                                                                               Otherwise, it will copy the library's `props` model.
 * @param {boolean}                         [attributes.multiple=false]          Whether multi-select is enabled.
 * @param {string}                          [attributes.content=upload]          Initial mode for the content region.
 *                                                                               Overridden by persistent user setting if 'contentUserSetting' is true.
 * @param {string}                          [attributes.menu=default]            Initial mode for the menu region.
 * @param {string}                          [attributes.router=browse]           Initial mode for the router region.
 * @param {string}                          [attributes.toolbar=select]          Initial mode for the toolbar region.
 * @param {boolean}                         [attributes.searchable=true]         Whether the library is searchable.
 * @param {boolean|string}                  [attributes.filterable=false]        Whether the library is filterable, and if so what filters should be shown.
 *                                                                               Accepts 'all', 'uploaded', or 'unattached'.
 * @param {boolean}                         [attributes.sortable=true]           Whether the Attachments should be sortable. Depends on the orderby property being set to menuOrder on the attachments collection.
 * @param {boolean}                         [attributes.autoSelect=true]         Whether an uploaded attachment should be automatically added to the selection.
 * @param {boolean}                         [attributes.describe=false]          Whether to offer UI to describe attachments - e.g. captioning images in a gallery.
 * @param {boolean}                         [attributes.contentUserSetting=true] Whether the content region's mode should be set and persisted per user.
 * @param {boolean}                         [attributes.syncSelection=true]      Whether the Attachments selection should be persisted from the last state.
 */
var l10n = wp.media.view.l10n,
	getUserSetting = window.getUserSetting,
	setUserSetting = window.setUserSetting,
	Library;

Library = wp.media.controller.State.extend({
	defaults: {
		id:                 'library',
		title:              l10n.mediaLibraryTitle,
		multiple:           false,
		content:            'upload',
		menu:               'default',
		router:             'browse',
		toolbar:            'select',
		searchable:         true,
		filterable:         false,
		sortable:           true,
		autoSelect:         true,
		describe:           false,
		contentUserSetting: true,
		syncSelection:      true
	},

	/**
	 * If a library isn't provided, query all media items.
	 * If a selection instance isn't provided, create one.
	 *
	 * @since 3.5.0
	 */
	initialize: function() {
		var selection = this.get('selection'),
			props;

		if ( ! this.get('library') ) {
			this.set( 'library', wp.media.query() );
		}

		if ( ! ( selection instanceof wp.media.model.Selection ) ) {
			props = selection;

			if ( ! props ) {
				props = this.get('library').props.toJSON();
				props = _.omit( props, 'orderby', 'query' );
			}

			this.set( 'selection', new wp.media.model.Selection( null, {
				multiple: this.get('multiple'),
				props: props
			}) );
		}

		this.resetDisplays();
	},

	/**
	 * @since 3.5.0
	 */
	activate: function() {
		this.syncSelection();

		wp.Uploader.queue.on( 'add', this.uploading, this );

		this.get('selection').on( 'add remove reset', this.refreshContent, this );

		if ( this.get( 'router' ) && this.get('contentUserSetting') ) {
			this.frame.on( 'content:activate', this.saveContentMode, this );
			this.set( 'content', getUserSetting( 'libraryContent', this.get('content') ) );
		}
	},

	/**
	 * @since 3.5.0
	 */
	deactivate: function() {
		this.recordSelection();

		this.frame.off( 'content:activate', this.saveContentMode, this );

		// Unbind all event handlers that use this state as the context
		// from the selection.
		this.get('selection').off( null, null, this );

		wp.Uploader.queue.off( null, null, this );
	},

	/**
	 * Reset the library to its initial state.
	 *
	 * @since 3.5.0
	 */
	reset: function() {
		this.get('selection').reset();
		this.resetDisplays();
		this.refreshContent();
	},

	/**
	 * Reset the attachment display settings defaults to the site options.
	 *
	 * If site options don't define them, fall back to a persistent user setting.
	 *
	 * @since 3.5.0
	 */
	resetDisplays: function() {
		var defaultProps = wp.media.view.settings.defaultProps;
		this._displays = [];
		this._defaultDisplaySettings = {
			align: defaultProps.align || getUserSetting( 'align', 'none' ),
			size:  defaultProps.size  || getUserSetting( 'imgsize', 'medium' ),
			link:  defaultProps.link  || getUserSetting( 'urlbutton', 'file' )
		};
	},

	/**
	 * Create a model to represent display settings (alignment, etc.) for an attachment.
	 *
	 * @since 3.5.0
	 *
	 * @param {wp.media.model.Attachment} attachment
	 * @returns {Backbone.Model}
	 */
	display: function( attachment ) {
		var displays = this._displays;

		if ( ! displays[ attachment.cid ] ) {
			displays[ attachment.cid ] = new Backbone.Model( this.defaultDisplaySettings( attachment ) );
		}
		return displays[ attachment.cid ];
	},

	/**
	 * Given an attachment, create attachment display settings properties.
	 *
	 * @since 3.6.0
	 *
	 * @param {wp.media.model.Attachment} attachment
	 * @returns {Object}
	 */
	defaultDisplaySettings: function( attachment ) {
		var settings = this._defaultDisplaySettings;
		if ( settings.canEmbed = this.canEmbed( attachment ) ) {
			settings.link = 'embed';
		}
		return settings;
	},

	/**
	 * Whether an attachment can be embedded (audio or video).
	 *
	 * @since 3.6.0
	 *
	 * @param {wp.media.model.Attachment} attachment
	 * @returns {Boolean}
	 */
	canEmbed: function( attachment ) {
		// If uploading, we know the filename but not the mime type.
		if ( ! attachment.get('uploading') ) {
			var type = attachment.get('type');
			if ( type !== 'audio' && type !== 'video' ) {
				return false;
			}
		}

		return _.contains( wp.media.view.settings.embedExts, attachment.get('filename').split('.').pop() );
	},


	/**
	 * If the state is active, no items are selected, and the current
	 * content mode is not an option in the state's router (provided
	 * the state has a router), reset the content mode to the default.
	 *
	 * @since 3.5.0
	 */
	refreshContent: function() {
		var selection = this.get('selection'),
			frame = this.frame,
			router = frame.router.get(),
			mode = frame.content.mode();

		if ( this.active && ! selection.length && router && ! router.get( mode ) ) {
			this.frame.content.render( this.get('content') );
		}
	},

	/**
	 * Callback handler when an attachment is uploaded.
	 *
	 * Switch to the Media Library if uploaded from the 'Upload Files' tab.
	 *
	 * Adds any uploading attachments to the selection.
	 *
	 * If the state only supports one attachment to be selected and multiple
	 * attachments are uploaded, the last attachment in the upload queue will
	 * be selected.
	 *
	 * @since 3.5.0
	 *
	 * @param {wp.media.model.Attachment} attachment
	 */
	uploading: function( attachment ) {
		var content = this.frame.content;

		if ( 'upload' === content.mode() ) {
			this.frame.content.mode('browse');
		}

		if ( this.get( 'autoSelect' ) ) {
			this.get('selection').add( attachment );
			this.frame.trigger( 'library:selection:add' );
		}
	},

	/**
	 * Persist the mode of the content region as a user setting.
	 *
	 * @since 3.5.0
	 */
	saveContentMode: function() {
		if ( 'browse' !== this.get('router') ) {
			return;
		}

		var mode = this.frame.content.mode(),
			view = this.frame.router.get();

		if ( view && view.get( mode ) ) {
			setUserSetting( 'libraryContent', mode );
		}
	}
});

// Make selectionSync available on any Media Library state.
_.extend( Library.prototype, wp.media.selectionSync );

module.exports = Library;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/media-library.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.controller.MediaLibrary
 *
 * @class
 * @augments wp.media.controller.Library
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 */
var Library = wp.media.controller.Library,
	MediaLibrary;

MediaLibrary = Library.extend({
	defaults: _.defaults({
		// Attachments browser defaults. @see media.view.AttachmentsBrowser
		filterable:      'uploaded',

		displaySettings: false,
		priority:        80,
		syncSelection:   false
	}, Library.prototype.defaults ),

	/**
	 * @since 3.9.0
	 *
	 * @param options
	 */
	initialize: function( options ) {
		this.media = options.media;
		this.type = options.type;
		this.set( 'library', wp.media.query({ type: this.type }) );

		Library.prototype.initialize.apply( this, arguments );
	},

	/**
	 * @since 3.9.0
	 */
	activate: function() {
		// @todo this should use this.frame.
		if ( wp.media.frame.lastMime ) {
			this.set( 'library', wp.media.query({ type: wp.media.frame.lastMime }) );
			delete wp.media.frame.lastMime;
		}
		Library.prototype.activate.apply( this, arguments );
	}
});

module.exports = MediaLibrary;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/region.js":[function(require,module,exports){
/*globals Backbone, _ */

/**
 * wp.media.controller.Region
 *
 * A region is a persistent application layout area.
 *
 * A region assumes one mode at any time, and can be switched to another.
 *
 * When mode changes, events are triggered on the region's parent view.
 * The parent view will listen to specific events and fill the region with an
 * appropriate view depending on mode. For example, a frame listens for the
 * 'browse' mode t be activated on the 'content' view and then fills the region
 * with an AttachmentsBrowser view.
 *
 * @class
 *
 * @param {object}        options          Options hash for the region.
 * @param {string}        options.id       Unique identifier for the region.
 * @param {Backbone.View} options.view     A parent view the region exists within.
 * @param {string}        options.selector jQuery selector for the region within the parent view.
 */
var Region = function( options ) {
	_.extend( this, _.pick( options || {}, 'id', 'view', 'selector' ) );
};

// Use Backbone's self-propagating `extend` inheritance method.
Region.extend = Backbone.Model.extend;

_.extend( Region.prototype, {
	/**
	 * Activate a mode.
	 *
	 * @since 3.5.0
	 *
	 * @param {string} mode
	 *
	 * @fires this.view#{this.id}:activate:{this._mode}
	 * @fires this.view#{this.id}:activate
	 * @fires this.view#{this.id}:deactivate:{this._mode}
	 * @fires this.view#{this.id}:deactivate
	 *
	 * @returns {wp.media.controller.Region} Returns itself to allow chaining.
	 */
	mode: function( mode ) {
		if ( ! mode ) {
			return this._mode;
		}
		// Bail if we're trying to change to the current mode.
		if ( mode === this._mode ) {
			return this;
		}

		/**
		 * Region mode deactivation event.
		 *
		 * @event this.view#{this.id}:deactivate:{this._mode}
		 * @event this.view#{this.id}:deactivate
		 */
		this.trigger('deactivate');

		this._mode = mode;
		this.render( mode );

		/**
		 * Region mode activation event.
		 *
		 * @event this.view#{this.id}:activate:{this._mode}
		 * @event this.view#{this.id}:activate
		 */
		this.trigger('activate');
		return this;
	},
	/**
	 * Render a mode.
	 *
	 * @since 3.5.0
	 *
	 * @param {string} mode
	 *
	 * @fires this.view#{this.id}:create:{this._mode}
	 * @fires this.view#{this.id}:create
	 * @fires this.view#{this.id}:render:{this._mode}
	 * @fires this.view#{this.id}:render
	 *
	 * @returns {wp.media.controller.Region} Returns itself to allow chaining
	 */
	render: function( mode ) {
		// If the mode isn't active, activate it.
		if ( mode && mode !== this._mode ) {
			return this.mode( mode );
		}

		var set = { view: null },
			view;

		/**
		 * Create region view event.
		 *
		 * Region view creation takes place in an event callback on the frame.
		 *
		 * @event this.view#{this.id}:create:{this._mode}
		 * @event this.view#{this.id}:create
		 */
		this.trigger( 'create', set );
		view = set.view;

		/**
		 * Render region view event.
		 *
		 * Region view creation takes place in an event callback on the frame.
		 *
		 * @event this.view#{this.id}:create:{this._mode}
		 * @event this.view#{this.id}:create
		 */
		this.trigger( 'render', view );
		if ( view ) {
			this.set( view );
		}
		return this;
	},

	/**
	 * Get the region's view.
	 *
	 * @since 3.5.0
	 *
	 * @returns {wp.media.View}
	 */
	get: function() {
		return this.view.views.first( this.selector );
	},

	/**
	 * Set the region's view as a subview of the frame.
	 *
	 * @since 3.5.0
	 *
	 * @param {Array|Object} views
	 * @param {Object} [options={}]
	 * @returns {wp.Backbone.Subviews} Subviews is returned to allow chaining
	 */
	set: function( views, options ) {
		if ( options ) {
			options.add = false;
		}
		return this.view.views.set( this.selector, views, options );
	},

	/**
	 * Trigger regional view events on the frame.
	 *
	 * @since 3.5.0
	 *
	 * @param {string} event
	 * @returns {undefined|wp.media.controller.Region} Returns itself to allow chaining.
	 */
	trigger: function( event ) {
		var base, args;

		if ( ! this._mode ) {
			return;
		}

		args = _.toArray( arguments );
		base = this.id + ':' + event;

		// Trigger `{this.id}:{event}:{this._mode}` event on the frame.
		args[0] = base + ':' + this._mode;
		this.view.trigger.apply( this.view, args );

		// Trigger `{this.id}:{event}` event on the frame.
		args[0] = base;
		this.view.trigger.apply( this.view, args );
		return this;
	}
});

module.exports = Region;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/replace-image.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.controller.ReplaceImage
 *
 * A state for replacing an image.
 *
 * @class
 * @augments wp.media.controller.Library
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                     [attributes]                         The attributes hash passed to the state.
 * @param {string}                     [attributes.id=replace-image]        Unique identifier.
 * @param {string}                     [attributes.title=Replace Image]     Title for the state. Displays in the media menu and the frame's title region.
 * @param {wp.media.model.Attachments} [attributes.library]                 The attachments collection to browse.
 *                                                                          If one is not supplied, a collection of all images will be created.
 * @param {boolean}                    [attributes.multiple=false]          Whether multi-select is enabled.
 * @param {string}                     [attributes.content=upload]          Initial mode for the content region.
 *                                                                          Overridden by persistent user setting if 'contentUserSetting' is true.
 * @param {string}                     [attributes.menu=default]            Initial mode for the menu region.
 * @param {string}                     [attributes.router=browse]           Initial mode for the router region.
 * @param {string}                     [attributes.toolbar=replace]         Initial mode for the toolbar region.
 * @param {int}                        [attributes.priority=60]             The priority for the state link in the media menu.
 * @param {boolean}                    [attributes.searchable=true]         Whether the library is searchable.
 * @param {boolean|string}             [attributes.filterable=uploaded]     Whether the library is filterable, and if so what filters should be shown.
 *                                                                          Accepts 'all', 'uploaded', or 'unattached'.
 * @param {boolean}                    [attributes.sortable=true]           Whether the Attachments should be sortable. Depends on the orderby property being set to menuOrder on the attachments collection.
 * @param {boolean}                    [attributes.autoSelect=true]         Whether an uploaded attachment should be automatically added to the selection.
 * @param {boolean}                    [attributes.describe=false]          Whether to offer UI to describe attachments - e.g. captioning images in a gallery.
 * @param {boolean}                    [attributes.contentUserSetting=true] Whether the content region's mode should be set and persisted per user.
 * @param {boolean}                    [attributes.syncSelection=true]      Whether the Attachments selection should be persisted from the last state.
 */
var Library = wp.media.controller.Library,
	l10n = wp.media.view.l10n,
	ReplaceImage;

ReplaceImage = Library.extend({
	defaults: _.defaults({
		id:            'replace-image',
		title:         l10n.replaceImageTitle,
		multiple:      false,
		filterable:    'uploaded',
		toolbar:       'replace',
		menu:          false,
		priority:      60,
		syncSelection: true
	}, Library.prototype.defaults ),

	/**
	 * @since 3.9.0
	 *
	 * @param options
	 */
	initialize: function( options ) {
		var library, comparator;

		this.image = options.image;
		// If we haven't been provided a `library`, create a `Selection`.
		if ( ! this.get('library') ) {
			this.set( 'library', wp.media.query({ type: 'image' }) );
		}

		Library.prototype.initialize.apply( this, arguments );

		library    = this.get('library');
		comparator = library.comparator;

		// Overload the library's comparator to push items that are not in
		// the mirrored query to the front of the aggregate collection.
		library.comparator = function( a, b ) {
			var aInQuery = !! this.mirroring.get( a.cid ),
				bInQuery = !! this.mirroring.get( b.cid );

			if ( ! aInQuery && bInQuery ) {
				return -1;
			} else if ( aInQuery && ! bInQuery ) {
				return 1;
			} else {
				return comparator.apply( this, arguments );
			}
		};

		// Add all items in the selection to the library, so any featured
		// images that are not initially loaded still appear.
		library.observe( this.get('selection') );
	},

	/**
	 * @since 3.9.0
	 */
	activate: function() {
		this.updateSelection();
		Library.prototype.activate.apply( this, arguments );
	},

	/**
	 * @since 3.9.0
	 */
	updateSelection: function() {
		var selection = this.get('selection'),
			attachment = this.image.attachment;

		selection.reset( attachment ? [ attachment ] : [] );
	}
});

module.exports = ReplaceImage;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/state-machine.js":[function(require,module,exports){
/*globals _, Backbone */

/**
 * wp.media.controller.StateMachine
 *
 * A state machine keeps track of state. It is in one state at a time,
 * and can change from one state to another.
 *
 * States are stored as models in a Backbone collection.
 *
 * @since 3.5.0
 *
 * @class
 * @augments Backbone.Model
 * @mixin
 * @mixes Backbone.Events
 *
 * @param {Array} states
 */
var StateMachine = function( states ) {
	// @todo This is dead code. The states collection gets created in media.view.Frame._createStates.
	this.states = new Backbone.Collection( states );
};

// Use Backbone's self-propagating `extend` inheritance method.
StateMachine.extend = Backbone.Model.extend;

_.extend( StateMachine.prototype, Backbone.Events, {
	/**
	 * Fetch a state.
	 *
	 * If no `id` is provided, returns the active state.
	 *
	 * Implicitly creates states.
	 *
	 * Ensure that the `states` collection exists so the `StateMachine`
	 *   can be used as a mixin.
	 *
	 * @since 3.5.0
	 *
	 * @param {string} id
	 * @returns {wp.media.controller.State} Returns a State model
	 *   from the StateMachine collection
	 */
	state: function( id ) {
		this.states = this.states || new Backbone.Collection();

		// Default to the active state.
		id = id || this._state;

		if ( id && ! this.states.get( id ) ) {
			this.states.add({ id: id });
		}
		return this.states.get( id );
	},

	/**
	 * Sets the active state.
	 *
	 * Bail if we're trying to select the current state, if we haven't
	 * created the `states` collection, or are trying to select a state
	 * that does not exist.
	 *
	 * @since 3.5.0
	 *
	 * @param {string} id
	 *
	 * @fires wp.media.controller.State#deactivate
	 * @fires wp.media.controller.State#activate
	 *
	 * @returns {wp.media.controller.StateMachine} Returns itself to allow chaining
	 */
	setState: function( id ) {
		var previous = this.state();

		if ( ( previous && id === previous.id ) || ! this.states || ! this.states.get( id ) ) {
			return this;
		}

		if ( previous ) {
			previous.trigger('deactivate');
			this._lastState = previous.id;
		}

		this._state = id;
		this.state().trigger('activate');

		return this;
	},

	/**
	 * Returns the previous active state.
	 *
	 * Call the `state()` method with no parameters to retrieve the current
	 * active state.
	 *
	 * @since 3.5.0
	 *
	 * @returns {wp.media.controller.State} Returns a State model
	 *    from the StateMachine collection
	 */
	lastState: function() {
		if ( this._lastState ) {
			return this.state( this._lastState );
		}
	}
});

// Map all event binding and triggering on a StateMachine to its `states` collection.
_.each([ 'on', 'off', 'trigger' ], function( method ) {
	/**
	 * @returns {wp.media.controller.StateMachine} Returns itself to allow chaining.
	 */
	StateMachine.prototype[ method ] = function() {
		// Ensure that the `states` collection exists so the `StateMachine`
		// can be used as a mixin.
		this.states = this.states || new Backbone.Collection();
		// Forward the method to the `states` collection.
		this.states[ method ].apply( this.states, arguments );
		return this;
	};
});

module.exports = StateMachine;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/state.js":[function(require,module,exports){
/*globals _, Backbone */

/**
 * wp.media.controller.State
 *
 * A state is a step in a workflow that when set will trigger the controllers
 * for the regions to be updated as specified in the frame.
 *
 * A state has an event-driven lifecycle:
 *
 *     'ready'      triggers when a state is added to a state machine's collection.
 *     'activate'   triggers when a state is activated by a state machine.
 *     'deactivate' triggers when a state is deactivated by a state machine.
 *     'reset'      is not triggered automatically. It should be invoked by the
 *                  proper controller to reset the state to its default.
 *
 * @class
 * @augments Backbone.Model
 */
var State = Backbone.Model.extend({
	/**
	 * Constructor.
	 *
	 * @since 3.5.0
	 */
	constructor: function() {
		this.on( 'activate', this._preActivate, this );
		this.on( 'activate', this.activate, this );
		this.on( 'activate', this._postActivate, this );
		this.on( 'deactivate', this._deactivate, this );
		this.on( 'deactivate', this.deactivate, this );
		this.on( 'reset', this.reset, this );
		this.on( 'ready', this._ready, this );
		this.on( 'ready', this.ready, this );
		/**
		 * Call parent constructor with passed arguments
		 */
		Backbone.Model.apply( this, arguments );
		this.on( 'change:menu', this._updateMenu, this );
	},
	/**
	 * Ready event callback.
	 *
	 * @abstract
	 * @since 3.5.0
	 */
	ready: function() {},

	/**
	 * Activate event callback.
	 *
	 * @abstract
	 * @since 3.5.0
	 */
	activate: function() {},

	/**
	 * Deactivate event callback.
	 *
	 * @abstract
	 * @since 3.5.0
	 */
	deactivate: function() {},

	/**
	 * Reset event callback.
	 *
	 * @abstract
	 * @since 3.5.0
	 */
	reset: function() {},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_ready: function() {
		this._updateMenu();
	},

	/**
	 * @access private
	 * @since 3.5.0
	*/
	_preActivate: function() {
		this.active = true;
	},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_postActivate: function() {
		this.on( 'change:menu', this._menu, this );
		this.on( 'change:titleMode', this._title, this );
		this.on( 'change:content', this._content, this );
		this.on( 'change:toolbar', this._toolbar, this );

		this.frame.on( 'title:render:default', this._renderTitle, this );

		this._title();
		this._menu();
		this._toolbar();
		this._content();
		this._router();
	},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_deactivate: function() {
		this.active = false;

		this.frame.off( 'title:render:default', this._renderTitle, this );

		this.off( 'change:menu', this._menu, this );
		this.off( 'change:titleMode', this._title, this );
		this.off( 'change:content', this._content, this );
		this.off( 'change:toolbar', this._toolbar, this );
	},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_title: function() {
		this.frame.title.render( this.get('titleMode') || 'default' );
	},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_renderTitle: function( view ) {
		view.$el.text( this.get('title') || '' );
	},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_router: function() {
		var router = this.frame.router,
			mode = this.get('router'),
			view;

		this.frame.$el.toggleClass( 'hide-router', ! mode );
		if ( ! mode ) {
			return;
		}

		this.frame.router.render( mode );

		view = router.get();
		if ( view && view.select ) {
			view.select( this.frame.content.mode() );
		}
	},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_menu: function() {
		var menu = this.frame.menu,
			mode = this.get('menu'),
			view;

		this.frame.$el.toggleClass( 'hide-menu', ! mode );
		if ( ! mode ) {
			return;
		}

		menu.mode( mode );

		view = menu.get();
		if ( view && view.select ) {
			view.select( this.id );
		}
	},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_updateMenu: function() {
		var previous = this.previous('menu'),
			menu = this.get('menu');

		if ( previous ) {
			this.frame.off( 'menu:render:' + previous, this._renderMenu, this );
		}

		if ( menu ) {
			this.frame.on( 'menu:render:' + menu, this._renderMenu, this );
		}
	},

	/**
	 * Create a view in the media menu for the state.
	 *
	 * @access private
	 * @since 3.5.0
	 *
	 * @param {media.view.Menu} view The menu view.
	 */
	_renderMenu: function( view ) {
		var menuItem = this.get('menuItem'),
			title = this.get('title'),
			priority = this.get('priority');

		if ( ! menuItem && title ) {
			menuItem = { text: title };

			if ( priority ) {
				menuItem.priority = priority;
			}
		}

		if ( ! menuItem ) {
			return;
		}

		view.set( this.id, menuItem );
	}
});

_.each(['toolbar','content'], function( region ) {
	/**
	 * @access private
	 */
	State.prototype[ '_' + region ] = function() {
		var mode = this.get( region );
		if ( mode ) {
			this.frame[ region ].render( mode );
		}
	};
});

module.exports = State;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/utils/selection-sync.js":[function(require,module,exports){
/*globals _ */

/**
 * wp.media.selectionSync
 *
 * Sync an attachments selection in a state with another state.
 *
 * Allows for selecting multiple images in the Insert Media workflow, and then
 * switching to the Insert Gallery workflow while preserving the attachments selection.
 *
 * @mixin
 */
var selectionSync = {
	/**
	 * @since 3.5.0
	 */
	syncSelection: function() {
		var selection = this.get('selection'),
			manager = this.frame._selection;

		if ( ! this.get('syncSelection') || ! manager || ! selection ) {
			return;
		}

		// If the selection supports multiple items, validate the stored
		// attachments based on the new selection's conditions. Record
		// the attachments that are not included; we'll maintain a
		// reference to those. Other attachments are considered in flux.
		if ( selection.multiple ) {
			selection.reset( [], { silent: true });
			selection.validateAll( manager.attachments );
			manager.difference = _.difference( manager.attachments.models, selection.models );
		}

		// Sync the selection's single item with the master.
		selection.single( manager.single );
	},

	/**
	 * Record the currently active attachments, which is a combination
	 * of the selection's attachments and the set of selected
	 * attachments that this specific selection considered invalid.
	 * Reset the difference and record the single attachment.
	 *
	 * @since 3.5.0
	 */
	recordSelection: function() {
		var selection = this.get('selection'),
			manager = this.frame._selection;

		if ( ! this.get('syncSelection') || ! manager || ! selection ) {
			return;
		}

		if ( selection.multiple ) {
			manager.attachments.reset( selection.toArray().concat( manager.difference ) );
			manager.difference = [];
		} else {
			manager.attachments.add( selection.toArray() );
		}

		manager.single = selection._single;
	}
};

module.exports = selectionSync;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views.manifest.js":[function(require,module,exports){
/*globals wp, jQuery, _, Backbone */

var media = wp.media,
	$ = jQuery,
	l10n;

media.isTouchDevice = ( 'ontouchend' in document );

// Link any localized strings.
l10n = media.view.l10n = window._wpMediaViewsL10n || {};

// Link any settings.
media.view.settings = l10n.settings || {};
delete l10n.settings;

// Copy the `post` setting over to the model settings.
media.model.settings.post = media.view.settings.post;

// Check if the browser supports CSS 3.0 transitions
$.support.transition = (function(){
	var style = document.documentElement.style,
		transitions = {
			WebkitTransition: 'webkitTransitionEnd',
			MozTransition:    'transitionend',
			OTransition:      'oTransitionEnd otransitionend',
			transition:       'transitionend'
		}, transition;

	transition = _.find( _.keys( transitions ), function( transition ) {
		return ! _.isUndefined( style[ transition ] );
	});

	return transition && {
		end: transitions[ transition ]
	};
}());

/**
 * A shared event bus used to provide events into
 * the media workflows that 3rd-party devs can use to hook
 * in.
 */
media.events = _.extend( {}, Backbone.Events );

/**
 * Makes it easier to bind events using transitions.
 *
 * @param {string} selector
 * @param {Number} sensitivity
 * @returns {Promise}
 */
media.transition = function( selector, sensitivity ) {
	var deferred = $.Deferred();

	sensitivity = sensitivity || 2000;

	if ( $.support.transition ) {
		if ( ! (selector instanceof $) ) {
			selector = $( selector );
		}

		// Resolve the deferred when the first element finishes animating.
		selector.first().one( $.support.transition.end, deferred.resolve );

		// Just in case the event doesn't trigger, fire a callback.
		_.delay( deferred.resolve, sensitivity );

	// Otherwise, execute on the spot.
	} else {
		deferred.resolve();
	}

	return deferred.promise();
};

media.controller.Region = require( './controllers/region.js' );
media.controller.StateMachine = require( './controllers/state-machine.js' );
media.controller.State = require( './controllers/state.js' );

media.selectionSync = require( './utils/selection-sync.js' );
media.controller.Library = require( './controllers/library.js' );
media.controller.ImageDetails = require( './controllers/image-details.js' );
media.controller.GalleryEdit = require( './controllers/gallery-edit.js' );
media.controller.GalleryAdd = require( './controllers/gallery-add.js' );
media.controller.CollectionEdit = require( './controllers/collection-edit.js' );
media.controller.CollectionAdd = require( './controllers/collection-add.js' );
media.controller.FeaturedImage = require( './controllers/featured-image.js' );
media.controller.ReplaceImage = require( './controllers/replace-image.js' );
media.controller.EditImage = require( './controllers/edit-image.js' );
media.controller.MediaLibrary = require( './controllers/media-library.js' );
media.controller.Embed = require( './controllers/embed.js' );
media.controller.Cropper = require( './controllers/cropper.js' );

media.View = require( './views/view.js' );
media.view.Frame = require( './views/frame.js' );
media.view.MediaFrame = require( './views/media-frame.js' );
media.view.MediaFrame.Select = require( './views/frame/select.js' );
media.view.MediaFrame.Post = require( './views/frame/post.js' );
media.view.MediaFrame.ImageDetails = require( './views/frame/image-details.js' );
media.view.Modal = require( './views/modal.js' );
media.view.FocusManager = require( './views/focus-manager.js' );
media.view.UploaderWindow = require( './views/uploader/window.js' );
media.view.EditorUploader = require( './views/uploader/editor.js' );
media.view.UploaderInline = require( './views/uploader/inline.js' );
media.view.UploaderStatus = require( './views/uploader/status.js' );
media.view.UploaderStatusError = require( './views/uploader/status-error.js' );
media.view.Toolbar = require( './views/toolbar.js' );
media.view.Toolbar.Select = require( './views/toolbar/select.js' );
media.view.Toolbar.Embed = require( './views/toolbar/embed.js' );
media.view.Button = require( './views/button.js' );
media.view.ButtonGroup = require( './views/button-group.js' );
media.view.PriorityList = require( './views/priority-list.js' );
media.view.MenuItem = require( './views/menu-item.js' );
media.view.Menu = require( './views/menu.js' );
media.view.RouterItem = require( './views/router-item.js' );
media.view.Router = require( './views/router.js' );
media.view.Sidebar = require( './views/sidebar.js' );
media.view.Attachment = require( './views/attachment.js' );
media.view.Attachment.Library = require( './views/attachment/library.js' );
media.view.Attachment.EditLibrary = require( './views/attachment/edit-library.js' );
media.view.Attachments = require( './views/attachments.js' );
media.view.Search = require( './views/search.js' );
media.view.AttachmentFilters = require( './views/attachment-filters.js' );
media.view.DateFilter = require( './views/attachment-filters/date.js' );
media.view.AttachmentFilters.Uploaded = require( './views/attachment-filters/uploaded.js' );
media.view.AttachmentFilters.All = require( './views/attachment-filters/all.js' );
media.view.AttachmentsBrowser = require( './views/attachments/browser.js' );
media.view.Selection = require( './views/selection.js' );
media.view.Attachment.Selection = require( './views/attachment/selection.js' );
media.view.Attachments.Selection = require( './views/attachments/selection.js' );
media.view.Attachment.EditSelection = require( './views/attachment/edit-selection.js' );
media.view.Settings = require( './views/settings.js' );
media.view.Settings.AttachmentDisplay = require( './views/settings/attachment-display.js' );
media.view.Settings.Gallery = require( './views/settings/gallery.js' );
media.view.Settings.Playlist = require( './views/settings/playlist.js' );
media.view.Attachment.Details = require( './views/attachment/details.js' );
media.view.AttachmentCompat = require( './views/attachment-compat.js' );
media.view.Iframe = require( './views/iframe.js' );
media.view.Embed = require( './views/embed.js' );
media.view.Label = require( './views/label.js' );
media.view.EmbedUrl = require( './views/embed/url.js' );
media.view.EmbedLink = require( './views/embed/link.js' );
media.view.EmbedImage = require( './views/embed/image.js' );
media.view.ImageDetails = require( './views/image-details.js' );
media.view.Cropper = require( './views/cropper.js' );
media.view.EditImage = require( './views/edit-image.js' );
media.view.Spinner = require( './views/spinner.js' );

},{"./controllers/collection-add.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/collection-add.js","./controllers/collection-edit.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/collection-edit.js","./controllers/cropper.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/cropper.js","./controllers/edit-image.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/edit-image.js","./controllers/embed.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/embed.js","./controllers/featured-image.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/featured-image.js","./controllers/gallery-add.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/gallery-add.js","./controllers/gallery-edit.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/gallery-edit.js","./controllers/image-details.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/image-details.js","./controllers/library.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/library.js","./controllers/media-library.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/media-library.js","./controllers/region.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/region.js","./controllers/replace-image.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/replace-image.js","./controllers/state-machine.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/state-machine.js","./controllers/state.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/controllers/state.js","./utils/selection-sync.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/utils/selection-sync.js","./views/attachment-compat.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment-compat.js","./views/attachment-filters.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment-filters.js","./views/attachment-filters/all.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment-filters/all.js","./views/attachment-filters/date.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment-filters/date.js","./views/attachment-filters/uploaded.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment-filters/uploaded.js","./views/attachment.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment.js","./views/attachment/details.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment/details.js","./views/attachment/edit-library.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment/edit-library.js","./views/attachment/edit-selection.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment/edit-selection.js","./views/attachment/library.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment/library.js","./views/attachment/selection.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment/selection.js","./views/attachments.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachments.js","./views/attachments/browser.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachments/browser.js","./views/attachments/selection.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachments/selection.js","./views/button-group.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/button-group.js","./views/button.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/button.js","./views/cropper.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/cropper.js","./views/edit-image.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/edit-image.js","./views/embed.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/embed.js","./views/embed/image.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/embed/image.js","./views/embed/link.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/embed/link.js","./views/embed/url.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/embed/url.js","./views/focus-manager.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/focus-manager.js","./views/frame.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame.js","./views/frame/image-details.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/image-details.js","./views/frame/post.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/post.js","./views/frame/select.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/select.js","./views/iframe.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/iframe.js","./views/image-details.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/image-details.js","./views/label.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/label.js","./views/media-frame.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/media-frame.js","./views/menu-item.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/menu-item.js","./views/menu.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/menu.js","./views/modal.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/modal.js","./views/priority-list.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/priority-list.js","./views/router-item.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/router-item.js","./views/router.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/router.js","./views/search.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/search.js","./views/selection.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/selection.js","./views/settings.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/settings.js","./views/settings/attachment-display.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/settings/attachment-display.js","./views/settings/gallery.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/settings/gallery.js","./views/settings/playlist.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/settings/playlist.js","./views/sidebar.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/sidebar.js","./views/spinner.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/spinner.js","./views/toolbar.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/toolbar.js","./views/toolbar/embed.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/toolbar/embed.js","./views/toolbar/select.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/toolbar/select.js","./views/uploader/editor.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/uploader/editor.js","./views/uploader/inline.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/uploader/inline.js","./views/uploader/status-error.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/uploader/status-error.js","./views/uploader/status.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/uploader/status.js","./views/uploader/window.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/uploader/window.js","./views/view.js":"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/view.js"}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment-compat.js":[function(require,module,exports){
/*globals _ */

/**
 * wp.media.view.AttachmentCompat
 *
 * A view to display fields added via the `attachment_fields_to_edit` filter.
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	AttachmentCompat;

AttachmentCompat = View.extend({
	tagName:   'form',
	className: 'compat-item',

	events: {
		'submit':          'preventDefault',
		'change input':    'save',
		'change select':   'save',
		'change textarea': 'save'
	},

	initialize: function() {
		this.listenTo( this.model, 'change:compat', this.render );
	},
	/**
	 * @returns {wp.media.view.AttachmentCompat} Returns itself to allow chaining
	 */
	dispose: function() {
		if ( this.$(':focus').length ) {
			this.save();
		}
		/**
		 * call 'dispose' directly on the parent class
		 */
		return View.prototype.dispose.apply( this, arguments );
	},
	/**
	 * @returns {wp.media.view.AttachmentCompat} Returns itself to allow chaining
	 */
	render: function() {
		var compat = this.model.get('compat');
		if ( ! compat || ! compat.item ) {
			return;
		}

		this.views.detach();
		this.$el.html( compat.item );
		this.views.render();
		return this;
	},
	/**
	 * @param {Object} event
	 */
	preventDefault: function( event ) {
		event.preventDefault();
	},
	/**
	 * @param {Object} event
	 */
	save: function( event ) {
		var data = {};

		if ( event ) {
			event.preventDefault();
		}

		_.each( this.$el.serializeArray(), function( pair ) {
			data[ pair.name ] = pair.value;
		});

		this.controller.trigger( 'attachment:compat:waiting', ['waiting'] );
		this.model.saveCompat( data ).always( _.bind( this.postSave, this ) );
	},

	postSave: function() {
		this.controller.trigger( 'attachment:compat:ready', ['ready'] );
	}
});

module.exports = AttachmentCompat;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment-filters.js":[function(require,module,exports){
/*globals _, jQuery */

/**
 * wp.media.view.AttachmentFilters
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var $ = jQuery,
	AttachmentFilters;

AttachmentFilters = wp.media.View.extend({
	tagName:   'select',
	className: 'attachment-filters',
	id:        'media-attachment-filters',

	events: {
		change: 'change'
	},

	keys: [],

	initialize: function() {
		this.createFilters();
		_.extend( this.filters, this.options.filters );

		// Build `<option>` elements.
		this.$el.html( _.chain( this.filters ).map( function( filter, value ) {
			return {
				el: $( '<option></option>' ).val( value ).html( filter.text )[0],
				priority: filter.priority || 50
			};
		}, this ).sortBy('priority').pluck('el').value() );

		this.listenTo( this.model, 'change', this.select );
		this.select();
	},

	/**
	 * @abstract
	 */
	createFilters: function() {
		this.filters = {};
	},

	/**
	 * When the selected filter changes, update the Attachment Query properties to match.
	 */
	change: function() {
		var filter = this.filters[ this.el.value ];
		if ( filter ) {
			this.model.set( filter.props );
		}
	},

	select: function() {
		var model = this.model,
			value = 'all',
			props = model.toJSON();

		_.find( this.filters, function( filter, id ) {
			var equal = _.all( filter.props, function( prop, key ) {
				return prop === ( _.isUndefined( props[ key ] ) ? null : props[ key ] );
			});

			if ( equal ) {
				return value = id;
			}
		});

		this.$el.val( value );
	}
});

module.exports = AttachmentFilters;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment-filters/all.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.AttachmentFilters.All
 *
 * @class
 * @augments wp.media.view.AttachmentFilters
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var l10n = wp.media.view.l10n,
	All;

All = wp.media.view.AttachmentFilters.extend({
	createFilters: function() {
		var filters = {};

		_.each( wp.media.view.settings.mimeTypes || {}, function( text, key ) {
			filters[ key ] = {
				text: text,
				props: {
					status:  null,
					type:    key,
					uploadedTo: null,
					orderby: 'date',
					order:   'DESC'
				}
			};
		});

		filters.all = {
			text:  l10n.allMediaItems,
			props: {
				status:  null,
				type:    null,
				uploadedTo: null,
				orderby: 'date',
				order:   'DESC'
			},
			priority: 10
		};

		if ( wp.media.view.settings.post.id ) {
			filters.uploaded = {
				text:  l10n.uploadedToThisPost,
				props: {
					status:  null,
					type:    null,
					uploadedTo: wp.media.view.settings.post.id,
					orderby: 'menuOrder',
					order:   'ASC'
				},
				priority: 20
			};
		}

		filters.unattached = {
			text:  l10n.unattached,
			props: {
				status:     null,
				uploadedTo: 0,
				type:       null,
				orderby:    'menuOrder',
				order:      'ASC'
			},
			priority: 50
		};

		if ( wp.media.view.settings.mediaTrash &&
			this.controller.isModeActive( 'grid' ) ) {

			filters.trash = {
				text:  l10n.trash,
				props: {
					uploadedTo: null,
					status:     'trash',
					type:       null,
					orderby:    'date',
					order:      'DESC'
				},
				priority: 50
			};
		}

		this.filters = filters;
	}
});

module.exports = All;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment-filters/date.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * A filter dropdown for month/dates.
 *
 * @class
 * @augments wp.media.view.AttachmentFilters
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var l10n = wp.media.view.l10n,
	DateFilter;

DateFilter = wp.media.view.AttachmentFilters.extend({
	id: 'media-attachment-date-filters',

	createFilters: function() {
		var filters = {};
		_.each( wp.media.view.settings.months || {}, function( value, index ) {
			filters[ index ] = {
				text: value.text,
				props: {
					year: value.year,
					monthnum: value.month
				}
			};
		});
		filters.all = {
			text:  l10n.allDates,
			props: {
				monthnum: false,
				year:  false
			},
			priority: 10
		};
		this.filters = filters;
	}
});

module.exports = DateFilter;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment-filters/uploaded.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.AttachmentFilters.Uploaded
 *
 * @class
 * @augments wp.media.view.AttachmentFilters
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var l10n = wp.media.view.l10n,
	Uploaded;

Uploaded = wp.media.view.AttachmentFilters.extend({
	createFilters: function() {
		var type = this.model.get('type'),
			types = wp.media.view.settings.mimeTypes,
			text;

		if ( types && type ) {
			text = types[ type ];
		}

		this.filters = {
			all: {
				text:  text || l10n.allMediaItems,
				props: {
					uploadedTo: null,
					orderby: 'date',
					order:   'DESC'
				},
				priority: 10
			},

			uploaded: {
				text:  l10n.uploadedToThisPost,
				props: {
					uploadedTo: wp.media.view.settings.post.id,
					orderby: 'menuOrder',
					order:   'ASC'
				},
				priority: 20
			},

			unattached: {
				text:  l10n.unattached,
				props: {
					uploadedTo: 0,
					orderby: 'menuOrder',
					order:   'ASC'
				},
				priority: 50
			}
		};
	}
});

module.exports = Uploaded;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment.js":[function(require,module,exports){
/*globals wp, _, jQuery */

/**
 * wp.media.view.Attachment
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	$ = jQuery,
	Attachment;

Attachment = View.extend({
	tagName:   'li',
	className: 'attachment',
	template:  wp.template('attachment'),

	attributes: function() {
		return {
			'tabIndex':     0,
			'role':         'checkbox',
			'aria-label':   this.model.get( 'title' ),
			'aria-checked': false,
			'data-id':      this.model.get( 'id' )
		};
	},

	events: {
		'click .js--select-attachment':   'toggleSelectionHandler',
		'change [data-setting]':          'updateSetting',
		'change [data-setting] input':    'updateSetting',
		'change [data-setting] select':   'updateSetting',
		'change [data-setting] textarea': 'updateSetting',
		'click .close':                   'removeFromLibrary',
		'click .check':                   'checkClickHandler',
		'click a':                        'preventDefault',
		'keydown .close':                 'removeFromLibrary',
		'keydown':                        'toggleSelectionHandler'
	},

	buttons: {},

	initialize: function() {
		var selection = this.options.selection,
			options = _.defaults( this.options, {
				rerenderOnModelChange: true
			} );

		if ( options.rerenderOnModelChange ) {
			this.listenTo( this.model, 'change', this.render );
		} else {
			this.listenTo( this.model, 'change:percent', this.progress );
		}
		this.listenTo( this.model, 'change:title', this._syncTitle );
		this.listenTo( this.model, 'change:caption', this._syncCaption );
		this.listenTo( this.model, 'change:artist', this._syncArtist );
		this.listenTo( this.model, 'change:album', this._syncAlbum );

		// Update the selection.
		this.listenTo( this.model, 'add', this.select );
		this.listenTo( this.model, 'remove', this.deselect );
		if ( selection ) {
			selection.on( 'reset', this.updateSelect, this );
			// Update the model's details view.
			this.listenTo( this.model, 'selection:single selection:unsingle', this.details );
			this.details( this.model, this.controller.state().get('selection') );
		}

		this.listenTo( this.controller, 'attachment:compat:waiting attachment:compat:ready', this.updateSave );
	},
	/**
	 * @returns {wp.media.view.Attachment} Returns itself to allow chaining
	 */
	dispose: function() {
		var selection = this.options.selection;

		// Make sure all settings are saved before removing the view.
		this.updateAll();

		if ( selection ) {
			selection.off( null, null, this );
		}
		/**
		 * call 'dispose' directly on the parent class
		 */
		View.prototype.dispose.apply( this, arguments );
		return this;
	},
	/**
	 * @returns {wp.media.view.Attachment} Returns itself to allow chaining
	 */
	render: function() {
		var options = _.defaults( this.model.toJSON(), {
				orientation:   'landscape',
				uploading:     false,
				type:          '',
				subtype:       '',
				icon:          '',
				filename:      '',
				caption:       '',
				title:         '',
				dateFormatted: '',
				width:         '',
				height:        '',
				compat:        false,
				alt:           '',
				description:   ''
			}, this.options );

		options.buttons  = this.buttons;
		options.describe = this.controller.state().get('describe');

		if ( 'image' === options.type ) {
			options.size = this.imageSize();
		}

		options.can = {};
		if ( options.nonces ) {
			options.can.remove = !! options.nonces['delete'];
			options.can.save = !! options.nonces.update;
		}

		if ( this.controller.state().get('allowLocalEdits') ) {
			options.allowLocalEdits = true;
		}

		if ( options.uploading && ! options.percent ) {
			options.percent = 0;
		}

		this.views.detach();
		this.$el.html( this.template( options ) );

		this.$el.toggleClass( 'uploading', options.uploading );

		if ( options.uploading ) {
			this.$bar = this.$('.media-progress-bar div');
		} else {
			delete this.$bar;
		}

		// Check if the model is selected.
		this.updateSelect();

		// Update the save status.
		this.updateSave();

		this.views.render();

		return this;
	},

	progress: function() {
		if ( this.$bar && this.$bar.length ) {
			this.$bar.width( this.model.get('percent') + '%' );
		}
	},

	/**
	 * @param {Object} event
	 */
	toggleSelectionHandler: function( event ) {
		var method;

		// Don't do anything inside inputs.
		if ( 'INPUT' === event.target.nodeName ) {
			return;
		}

		// Catch arrow events
		if ( 37 === event.keyCode || 38 === event.keyCode || 39 === event.keyCode || 40 === event.keyCode ) {
			this.controller.trigger( 'attachment:keydown:arrow', event );
			return;
		}

		// Catch enter and space events
		if ( 'keydown' === event.type && 13 !== event.keyCode && 32 !== event.keyCode ) {
			return;
		}

		event.preventDefault();

		// In the grid view, bubble up an edit:attachment event to the controller.
		if ( this.controller.isModeActive( 'grid' ) ) {
			if ( this.controller.isModeActive( 'edit' ) ) {
				// Pass the current target to restore focus when closing
				this.controller.trigger( 'edit:attachment', this.model, event.currentTarget );
				return;
			}

			if ( this.controller.isModeActive( 'select' ) ) {
				method = 'toggle';
			}
		}

		if ( event.shiftKey ) {
			method = 'between';
		} else if ( event.ctrlKey || event.metaKey ) {
			method = 'toggle';
		}

		this.toggleSelection({
			method: method
		});

		this.controller.trigger( 'selection:toggle' );
	},
	/**
	 * @param {Object} options
	 */
	toggleSelection: function( options ) {
		var collection = this.collection,
			selection = this.options.selection,
			model = this.model,
			method = options && options.method,
			single, models, singleIndex, modelIndex;

		if ( ! selection ) {
			return;
		}

		single = selection.single();
		method = _.isUndefined( method ) ? selection.multiple : method;

		// If the `method` is set to `between`, select all models that
		// exist between the current and the selected model.
		if ( 'between' === method && single && selection.multiple ) {
			// If the models are the same, short-circuit.
			if ( single === model ) {
				return;
			}

			singleIndex = collection.indexOf( single );
			modelIndex  = collection.indexOf( this.model );

			if ( singleIndex < modelIndex ) {
				models = collection.models.slice( singleIndex, modelIndex + 1 );
			} else {
				models = collection.models.slice( modelIndex, singleIndex + 1 );
			}

			selection.add( models );
			selection.single( model );
			return;

		// If the `method` is set to `toggle`, just flip the selection
		// status, regardless of whether the model is the single model.
		} else if ( 'toggle' === method ) {
			selection[ this.selected() ? 'remove' : 'add' ]( model );
			selection.single( model );
			return;
		} else if ( 'add' === method ) {
			selection.add( model );
			selection.single( model );
			return;
		}

		// Fixes bug that loses focus when selecting a featured image
		if ( ! method ) {
			method = 'add';
		}

		if ( method !== 'add' ) {
			method = 'reset';
		}

		if ( this.selected() ) {
			// If the model is the single model, remove it.
			// If it is not the same as the single model,
			// it now becomes the single model.
			selection[ single === model ? 'remove' : 'single' ]( model );
		} else {
			// If the model is not selected, run the `method` on the
			// selection. By default, we `reset` the selection, but the
			// `method` can be set to `add` the model to the selection.
			selection[ method ]( model );
			selection.single( model );
		}
	},

	updateSelect: function() {
		this[ this.selected() ? 'select' : 'deselect' ]();
	},
	/**
	 * @returns {unresolved|Boolean}
	 */
	selected: function() {
		var selection = this.options.selection;
		if ( selection ) {
			return !! selection.get( this.model.cid );
		}
	},
	/**
	 * @param {Backbone.Model} model
	 * @param {Backbone.Collection} collection
	 */
	select: function( model, collection ) {
		var selection = this.options.selection,
			controller = this.controller;

		// Check if a selection exists and if it's the collection provided.
		// If they're not the same collection, bail; we're in another
		// selection's event loop.
		if ( ! selection || ( collection && collection !== selection ) ) {
			return;
		}

		// Bail if the model is already selected.
		if ( this.$el.hasClass( 'selected' ) ) {
			return;
		}

		// Add 'selected' class to model, set aria-checked to true.
		this.$el.addClass( 'selected' ).attr( 'aria-checked', true );
		//  Make the checkbox tabable, except in media grid (bulk select mode).
		if ( ! ( controller.isModeActive( 'grid' ) && controller.isModeActive( 'select' ) ) ) {
			this.$( '.check' ).attr( 'tabindex', '0' );
		}
	},
	/**
	 * @param {Backbone.Model} model
	 * @param {Backbone.Collection} collection
	 */
	deselect: function( model, collection ) {
		var selection = this.options.selection;

		// Check if a selection exists and if it's the collection provided.
		// If they're not the same collection, bail; we're in another
		// selection's event loop.
		if ( ! selection || ( collection && collection !== selection ) ) {
			return;
		}
		this.$el.removeClass( 'selected' ).attr( 'aria-checked', false )
			.find( '.check' ).attr( 'tabindex', '-1' );
	},
	/**
	 * @param {Backbone.Model} model
	 * @param {Backbone.Collection} collection
	 */
	details: function( model, collection ) {
		var selection = this.options.selection,
			details;

		if ( selection !== collection ) {
			return;
		}

		details = selection.single();
		this.$el.toggleClass( 'details', details === this.model );
	},
	/**
	 * @param {Object} event
	 */
	preventDefault: function( event ) {
		event.preventDefault();
	},
	/**
	 * @param {string} size
	 * @returns {Object}
	 */
	imageSize: function( size ) {
		var sizes = this.model.get('sizes'), matched = false;

		size = size || 'medium';

		// Use the provided image size if possible.
		if ( sizes ) {
			if ( sizes[ size ] ) {
				matched = sizes[ size ];
			} else if ( sizes.large ) {
				matched = sizes.large;
			} else if ( sizes.thumbnail ) {
				matched = sizes.thumbnail;
			} else if ( sizes.full ) {
				matched = sizes.full;
			}

			if ( matched ) {
				return _.clone( matched );
			}
		}

		return {
			url:         this.model.get('url'),
			width:       this.model.get('width'),
			height:      this.model.get('height'),
			orientation: this.model.get('orientation')
		};
	},
	/**
	 * @param {Object} event
	 */
	updateSetting: function( event ) {
		var $setting = $( event.target ).closest('[data-setting]'),
			setting, value;

		if ( ! $setting.length ) {
			return;
		}

		setting = $setting.data('setting');
		value   = event.target.value;

		if ( this.model.get( setting ) !== value ) {
			this.save( setting, value );
		}
	},

	/**
	 * Pass all the arguments to the model's save method.
	 *
	 * Records the aggregate status of all save requests and updates the
	 * view's classes accordingly.
	 */
	save: function() {
		var view = this,
			save = this._save = this._save || { status: 'ready' },
			request = this.model.save.apply( this.model, arguments ),
			requests = save.requests ? $.when( request, save.requests ) : request;

		// If we're waiting to remove 'Saved.', stop.
		if ( save.savedTimer ) {
			clearTimeout( save.savedTimer );
		}

		this.updateSave('waiting');
		save.requests = requests;
		requests.always( function() {
			// If we've performed another request since this one, bail.
			if ( save.requests !== requests ) {
				return;
			}

			view.updateSave( requests.state() === 'resolved' ? 'complete' : 'error' );
			save.savedTimer = setTimeout( function() {
				view.updateSave('ready');
				delete save.savedTimer;
			}, 2000 );
		});
	},
	/**
	 * @param {string} status
	 * @returns {wp.media.view.Attachment} Returns itself to allow chaining
	 */
	updateSave: function( status ) {
		var save = this._save = this._save || { status: 'ready' };

		if ( status && status !== save.status ) {
			this.$el.removeClass( 'save-' + save.status );
			save.status = status;
		}

		this.$el.addClass( 'save-' + save.status );
		return this;
	},

	updateAll: function() {
		var $settings = this.$('[data-setting]'),
			model = this.model,
			changed;

		changed = _.chain( $settings ).map( function( el ) {
			var $input = $('input, textarea, select, [value]', el ),
				setting, value;

			if ( ! $input.length ) {
				return;
			}

			setting = $(el).data('setting');
			value = $input.val();

			// Record the value if it changed.
			if ( model.get( setting ) !== value ) {
				return [ setting, value ];
			}
		}).compact().object().value();

		if ( ! _.isEmpty( changed ) ) {
			model.save( changed );
		}
	},
	/**
	 * @param {Object} event
	 */
	removeFromLibrary: function( event ) {
		// Catch enter and space events
		if ( 'keydown' === event.type && 13 !== event.keyCode && 32 !== event.keyCode ) {
			return;
		}

		// Stop propagation so the model isn't selected.
		event.stopPropagation();

		this.collection.remove( this.model );
	},

	/**
	 * Add the model if it isn't in the selection, if it is in the selection,
	 * remove it.
	 *
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 */
	checkClickHandler: function ( event ) {
		var selection = this.options.selection;
		if ( ! selection ) {
			return;
		}
		event.stopPropagation();
		if ( selection.where( { id: this.model.get( 'id' ) } ).length ) {
			selection.remove( this.model );
			// Move focus back to the attachment tile (from the check).
			this.$el.focus();
		} else {
			selection.add( this.model );
		}
	}
});

// Ensure settings remain in sync between attachment views.
_.each({
	caption: '_syncCaption',
	title:   '_syncTitle',
	artist:  '_syncArtist',
	album:   '_syncAlbum'
}, function( method, setting ) {
	/**
	 * @param {Backbone.Model} model
	 * @param {string} value
	 * @returns {wp.media.view.Attachment} Returns itself to allow chaining
	 */
	Attachment.prototype[ method ] = function( model, value ) {
		var $setting = this.$('[data-setting="' + setting + '"]');

		if ( ! $setting.length ) {
			return this;
		}

		// If the updated value is in sync with the value in the DOM, there
		// is no need to re-render. If we're currently editing the value,
		// it will automatically be in sync, suppressing the re-render for
		// the view we're editing, while updating any others.
		if ( value === $setting.find('input, textarea, select, [value]').val() ) {
			return this;
		}

		return this.render();
	};
});

module.exports = Attachment;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment/details.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.view.Attachment.Details
 *
 * @class
 * @augments wp.media.view.Attachment
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Attachment = wp.media.view.Attachment,
	l10n = wp.media.view.l10n,
	Details;

Details = Attachment.extend({
	tagName:   'div',
	className: 'attachment-details',
	template:  wp.template('attachment-details'),

	attributes: function() {
		return {
			'tabIndex':     0,
			'data-id':      this.model.get( 'id' )
		};
	},

	events: {
		'change [data-setting]':          'updateSetting',
		'change [data-setting] input':    'updateSetting',
		'change [data-setting] select':   'updateSetting',
		'change [data-setting] textarea': 'updateSetting',
		'click .delete-attachment':       'deleteAttachment',
		'click .trash-attachment':        'trashAttachment',
		'click .untrash-attachment':      'untrashAttachment',
		'click .edit-attachment':         'editAttachment',
		'click .refresh-attachment':      'refreshAttachment',
		'keydown':                        'toggleSelectionHandler'
	},

	initialize: function() {
		this.options = _.defaults( this.options, {
			rerenderOnModelChange: false
		});

		this.on( 'ready', this.initialFocus );
		// Call 'initialize' directly on the parent class.
		Attachment.prototype.initialize.apply( this, arguments );
	},

	initialFocus: function() {
		if ( ! wp.media.isTouchDevice ) {
			this.$( ':input' ).eq( 0 ).focus();
		}
	},
	/**
	 * @param {Object} event
	 */
	deleteAttachment: function( event ) {
		event.preventDefault();

		if ( window.confirm( l10n.warnDelete ) ) {
			this.model.destroy();
			// Keep focus inside media modal
			// after image is deleted
			this.controller.modal.focusManager.focus();
		}
	},
	/**
	 * @param {Object} event
	 */
	trashAttachment: function( event ) {
		var library = this.controller.library;
		event.preventDefault();

		if ( wp.media.view.settings.mediaTrash &&
			'edit-metadata' === this.controller.content.mode() ) {

			this.model.set( 'status', 'trash' );
			this.model.save().done( function() {
				library._requery( true );
			} );
		}  else {
			this.model.destroy();
		}
	},
	/**
	 * @param {Object} event
	 */
	untrashAttachment: function( event ) {
		var library = this.controller.library;
		event.preventDefault();

		this.model.set( 'status', 'inherit' );
		this.model.save().done( function() {
			library._requery( true );
		} );
	},
	/**
	 * @param {Object} event
	 */
	editAttachment: function( event ) {
		var editState = this.controller.states.get( 'edit-image' );
		if ( window.imageEdit && editState ) {
			event.preventDefault();

			editState.set( 'image', this.model );
			this.controller.setState( 'edit-image' );
		} else {
			this.$el.addClass('needs-refresh');
		}
	},
	/**
	 * @param {Object} event
	 */
	refreshAttachment: function( event ) {
		this.$el.removeClass('needs-refresh');
		event.preventDefault();
		this.model.fetch();
	},
	/**
	 * When reverse tabbing(shift+tab) out of the right details panel, deliver
	 * the focus to the item in the list that was being edited.
	 *
	 * @param {Object} event
	 */
	toggleSelectionHandler: function( event ) {
		if ( 'keydown' === event.type && 9 === event.keyCode && event.shiftKey && event.target === this.$( ':tabbable' ).get( 0 ) ) {
			this.controller.trigger( 'attachment:details:shift-tab', event );
			return false;
		}

		if ( 37 === event.keyCode || 38 === event.keyCode || 39 === event.keyCode || 40 === event.keyCode ) {
			this.controller.trigger( 'attachment:keydown:arrow', event );
			return;
		}
	}
});

module.exports = Details;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment/edit-library.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.Attachment.EditLibrary
 *
 * @class
 * @augments wp.media.view.Attachment
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var EditLibrary = wp.media.view.Attachment.extend({
	buttons: {
		close: true
	}
});

module.exports = EditLibrary;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment/edit-selection.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.Attachments.EditSelection
 *
 * @class
 * @augments wp.media.view.Attachment.Selection
 * @augments wp.media.view.Attachment
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var EditSelection = wp.media.view.Attachment.Selection.extend({
	buttons: {
		close: true
	}
});

module.exports = EditSelection;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment/library.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.Attachment.Library
 *
 * @class
 * @augments wp.media.view.Attachment
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Library = wp.media.view.Attachment.extend({
	buttons: {
		check: true
	}
});

module.exports = Library;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachment/selection.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.Attachment.Selection
 *
 * @class
 * @augments wp.media.view.Attachment
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Selection = wp.media.view.Attachment.extend({
	className: 'attachment selection',

	// On click, just select the model, instead of removing the model from
	// the selection.
	toggleSelection: function() {
		this.options.selection.single( this.model );
	}
});

module.exports = Selection;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachments.js":[function(require,module,exports){
/*globals wp, _, jQuery */

/**
 * wp.media.view.Attachments
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	$ = jQuery,
	Attachments;

Attachments = View.extend({
	tagName:   'ul',
	className: 'attachments',

	attributes: {
		tabIndex: -1
	},

	initialize: function() {
		this.el.id = _.uniqueId('__attachments-view-');

		_.defaults( this.options, {
			refreshSensitivity: wp.media.isTouchDevice ? 300 : 200,
			refreshThreshold:   3,
			AttachmentView:     wp.media.view.Attachment,
			sortable:           false,
			resize:             true,
			idealColumnWidth:   $( window ).width() < 640 ? 135 : 150
		});

		this._viewsByCid = {};
		this.$window = $( window );
		this.resizeEvent = 'resize.media-modal-columns';

		this.collection.on( 'add', function( attachment ) {
			this.views.add( this.createAttachmentView( attachment ), {
				at: this.collection.indexOf( attachment )
			});
		}, this );

		this.collection.on( 'remove', function( attachment ) {
			var view = this._viewsByCid[ attachment.cid ];
			delete this._viewsByCid[ attachment.cid ];

			if ( view ) {
				view.remove();
			}
		}, this );

		this.collection.on( 'reset', this.render, this );

		this.listenTo( this.controller, 'library:selection:add',    this.attachmentFocus );

		// Throttle the scroll handler and bind this.
		this.scroll = _.chain( this.scroll ).bind( this ).throttle( this.options.refreshSensitivity ).value();

		this.options.scrollElement = this.options.scrollElement || this.el;
		$( this.options.scrollElement ).on( 'scroll', this.scroll );

		this.initSortable();

		_.bindAll( this, 'setColumns' );

		if ( this.options.resize ) {
			this.on( 'ready', this.bindEvents );
			this.controller.on( 'open', this.setColumns );

			// Call this.setColumns() after this view has been rendered in the DOM so
			// attachments get proper width applied.
			_.defer( this.setColumns, this );
		}
	},

	bindEvents: function() {
		this.$window.off( this.resizeEvent ).on( this.resizeEvent, _.debounce( this.setColumns, 50 ) );
	},

	attachmentFocus: function() {
		this.$( 'li:first' ).focus();
	},

	restoreFocus: function() {
		this.$( 'li.selected:first' ).focus();
	},

	arrowEvent: function( event ) {
		var attachments = this.$el.children( 'li' ),
			perRow = this.columns,
			index = attachments.filter( ':focus' ).index(),
			row = ( index + 1 ) <= perRow ? 1 : Math.ceil( ( index + 1 ) / perRow );

		if ( index === -1 ) {
			return;
		}

		// Left arrow
		if ( 37 === event.keyCode ) {
			if ( 0 === index ) {
				return;
			}
			attachments.eq( index - 1 ).focus();
		}

		// Up arrow
		if ( 38 === event.keyCode ) {
			if ( 1 === row ) {
				return;
			}
			attachments.eq( index - perRow ).focus();
		}

		// Right arrow
		if ( 39 === event.keyCode ) {
			if ( attachments.length === index ) {
				return;
			}
			attachments.eq( index + 1 ).focus();
		}

		// Down arrow
		if ( 40 === event.keyCode ) {
			if ( Math.ceil( attachments.length / perRow ) === row ) {
				return;
			}
			attachments.eq( index + perRow ).focus();
		}
	},

	dispose: function() {
		this.collection.props.off( null, null, this );
		if ( this.options.resize ) {
			this.$window.off( this.resizeEvent );
		}

		/**
		 * call 'dispose' directly on the parent class
		 */
		View.prototype.dispose.apply( this, arguments );
	},

	setColumns: function() {
		var prev = this.columns,
			width = this.$el.width();

		if ( width ) {
			this.columns = Math.min( Math.round( width / this.options.idealColumnWidth ), 12 ) || 1;

			if ( ! prev || prev !== this.columns ) {
				this.$el.closest( '.media-frame-content' ).attr( 'data-columns', this.columns );
			}
		}
	},

	initSortable: function() {
		var collection = this.collection;

		if ( wp.media.isTouchDevice || ! this.options.sortable || ! $.fn.sortable ) {
			return;
		}

		this.$el.sortable( _.extend({
			// If the `collection` has a `comparator`, disable sorting.
			disabled: !! collection.comparator,

			// Change the position of the attachment as soon as the
			// mouse pointer overlaps a thumbnail.
			tolerance: 'pointer',

			// Record the initial `index` of the dragged model.
			start: function( event, ui ) {
				ui.item.data('sortableIndexStart', ui.item.index());
			},

			// Update the model's index in the collection.
			// Do so silently, as the view is already accurate.
			update: function( event, ui ) {
				var model = collection.at( ui.item.data('sortableIndexStart') ),
					comparator = collection.comparator;

				// Temporarily disable the comparator to prevent `add`
				// from re-sorting.
				delete collection.comparator;

				// Silently shift the model to its new index.
				collection.remove( model, {
					silent: true
				});
				collection.add( model, {
					silent: true,
					at:     ui.item.index()
				});

				// Restore the comparator.
				collection.comparator = comparator;

				// Fire the `reset` event to ensure other collections sync.
				collection.trigger( 'reset', collection );

				// If the collection is sorted by menu order,
				// update the menu order.
				collection.saveMenuOrder();
			}
		}, this.options.sortable ) );

		// If the `orderby` property is changed on the `collection`,
		// check to see if we have a `comparator`. If so, disable sorting.
		collection.props.on( 'change:orderby', function() {
			this.$el.sortable( 'option', 'disabled', !! collection.comparator );
		}, this );

		this.collection.props.on( 'change:orderby', this.refreshSortable, this );
		this.refreshSortable();
	},

	refreshSortable: function() {
		if ( wp.media.isTouchDevice || ! this.options.sortable || ! $.fn.sortable ) {
			return;
		}

		// If the `collection` has a `comparator`, disable sorting.
		var collection = this.collection,
			orderby = collection.props.get('orderby'),
			enabled = 'menuOrder' === orderby || ! collection.comparator;

		this.$el.sortable( 'option', 'disabled', ! enabled );
	},

	/**
	 * @param {wp.media.model.Attachment} attachment
	 * @returns {wp.media.View}
	 */
	createAttachmentView: function( attachment ) {
		var view = new this.options.AttachmentView({
			controller:           this.controller,
			model:                attachment,
			collection:           this.collection,
			selection:            this.options.selection
		});

		return this._viewsByCid[ attachment.cid ] = view;
	},

	prepare: function() {
		// Create all of the Attachment views, and replace
		// the list in a single DOM operation.
		if ( this.collection.length ) {
			this.views.set( this.collection.map( this.createAttachmentView, this ) );

		// If there are no elements, clear the views and load some.
		} else {
			this.views.unset();
			this.collection.more().done( this.scroll );
		}
	},

	ready: function() {
		// Trigger the scroll event to check if we're within the
		// threshold to query for additional attachments.
		this.scroll();
	},

	scroll: function() {
		var view = this,
			el = this.options.scrollElement,
			scrollTop = el.scrollTop,
			toolbar;

		// The scroll event occurs on the document, but the element
		// that should be checked is the document body.
		if ( el === document ) {
			el = document.body;
			scrollTop = $(document).scrollTop();
		}

		if ( ! $(el).is(':visible') || ! this.collection.hasMore() ) {
			return;
		}

		toolbar = this.views.parent.toolbar;

		// Show the spinner only if we are close to the bottom.
		if ( el.scrollHeight - ( scrollTop + el.clientHeight ) < el.clientHeight / 3 ) {
			toolbar.get('spinner').show();
		}

		if ( el.scrollHeight < scrollTop + ( el.clientHeight * this.options.refreshThreshold ) ) {
			this.collection.more().done(function() {
				view.scroll();
				toolbar.get('spinner').hide();
			});
		}
	}
});

module.exports = Attachments;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachments/browser.js":[function(require,module,exports){
/*globals wp, _, jQuery */

/**
 * wp.media.view.AttachmentsBrowser
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 *
 * @param {object}         [options]               The options hash passed to the view.
 * @param {boolean|string} [options.filters=false] Which filters to show in the browser's toolbar.
 *                                                 Accepts 'uploaded' and 'all'.
 * @param {boolean}        [options.search=true]   Whether to show the search interface in the
 *                                                 browser's toolbar.
 * @param {boolean}        [options.date=true]     Whether to show the date filter in the
 *                                                 browser's toolbar.
 * @param {boolean}        [options.display=false] Whether to show the attachments display settings
 *                                                 view in the sidebar.
 * @param {boolean|string} [options.sidebar=true]  Whether to create a sidebar for the browser.
 *                                                 Accepts true, false, and 'errors'.
 */
var View = wp.media.View,
	mediaTrash = wp.media.view.settings.mediaTrash,
	l10n = wp.media.view.l10n,
	$ = jQuery,
	AttachmentsBrowser;

AttachmentsBrowser = View.extend({
	tagName:   'div',
	className: 'attachments-browser',

	initialize: function() {
		_.defaults( this.options, {
			filters: false,
			search:  true,
			date:    true,
			display: false,
			sidebar: true,
			AttachmentView: wp.media.view.Attachment.Library
		});

		this.listenTo( this.controller, 'toggle:upload:attachment', _.bind( this.toggleUploader, this ) );
		this.controller.on( 'edit:selection', this.editSelection );
		this.createToolbar();
		if ( this.options.sidebar ) {
			this.createSidebar();
		}
		this.createUploader();
		this.createAttachments();
		this.updateContent();

		if ( ! this.options.sidebar || 'errors' === this.options.sidebar ) {
			this.$el.addClass( 'hide-sidebar' );

			if ( 'errors' === this.options.sidebar ) {
				this.$el.addClass( 'sidebar-for-errors' );
			}
		}

		this.collection.on( 'add remove reset', this.updateContent, this );
	},

	editSelection: function( modal ) {
		modal.$( '.media-button-backToLibrary' ).focus();
	},

	/**
	 * @returns {wp.media.view.AttachmentsBrowser} Returns itself to allow chaining
	 */
	dispose: function() {
		this.options.selection.off( null, null, this );
		View.prototype.dispose.apply( this, arguments );
		return this;
	},

	createToolbar: function() {
		var LibraryViewSwitcher, Filters, toolbarOptions;

		toolbarOptions = {
			controller: this.controller
		};

		if ( this.controller.isModeActive( 'grid' ) ) {
			toolbarOptions.className = 'media-toolbar wp-filter';
		}

		/**
		* @member {wp.media.view.Toolbar}
		*/
		this.toolbar = new wp.media.view.Toolbar( toolbarOptions );

		this.views.add( this.toolbar );

		this.toolbar.set( 'spinner', new wp.media.view.Spinner({
			priority: -60
		}) );

		if ( -1 !== $.inArray( this.options.filters, [ 'uploaded', 'all' ] ) ) {
			// "Filters" will return a <select>, need to render
			// screen reader text before
			this.toolbar.set( 'filtersLabel', new wp.media.view.Label({
				value: l10n.filterByType,
				attributes: {
					'for':  'media-attachment-filters'
				},
				priority:   -80
			}).render() );

			if ( 'uploaded' === this.options.filters ) {
				this.toolbar.set( 'filters', new wp.media.view.AttachmentFilters.Uploaded({
					controller: this.controller,
					model:      this.collection.props,
					priority:   -80
				}).render() );
			} else {
				Filters = new wp.media.view.AttachmentFilters.All({
					controller: this.controller,
					model:      this.collection.props,
					priority:   -80
				});

				this.toolbar.set( 'filters', Filters.render() );
			}
		}

		// Feels odd to bring the global media library switcher into the Attachment
		// browser view. Is this a use case for doAction( 'add:toolbar-items:attachments-browser', this.toolbar );
		// which the controller can tap into and add this view?
		if ( this.controller.isModeActive( 'grid' ) ) {
			LibraryViewSwitcher = View.extend({
				className: 'view-switch media-grid-view-switch',
				template: wp.template( 'media-library-view-switcher')
			});

			this.toolbar.set( 'libraryViewSwitcher', new LibraryViewSwitcher({
				controller: this.controller,
				priority: -90
			}).render() );

			// DateFilter is a <select>, screen reader text needs to be rendered before
			this.toolbar.set( 'dateFilterLabel', new wp.media.view.Label({
				value: l10n.filterByDate,
				attributes: {
					'for': 'media-attachment-date-filters'
				},
				priority: -75
			}).render() );
			this.toolbar.set( 'dateFilter', new wp.media.view.DateFilter({
				controller: this.controller,
				model:      this.collection.props,
				priority: -75
			}).render() );

			// BulkSelection is a <div> with subviews, including screen reader text
			this.toolbar.set( 'selectModeToggleButton', new wp.media.view.SelectModeToggleButton({
				text: l10n.bulkSelect,
				controller: this.controller,
				priority: -70
			}).render() );

			this.toolbar.set( 'deleteSelectedButton', new wp.media.view.DeleteSelectedButton({
				filters: Filters,
				style: 'primary',
				disabled: true,
				text: mediaTrash ? l10n.trashSelected : l10n.deleteSelected,
				controller: this.controller,
				priority: -60,
				click: function() {
					var changed = [], removed = [],
						selection = this.controller.state().get( 'selection' ),
						library = this.controller.state().get( 'library' );

					if ( ! selection.length ) {
						return;
					}

					if ( ! mediaTrash && ! window.confirm( l10n.warnBulkDelete ) ) {
						return;
					}

					if ( mediaTrash &&
						'trash' !== selection.at( 0 ).get( 'status' ) &&
						! window.confirm( l10n.warnBulkTrash ) ) {

						return;
					}

					selection.each( function( model ) {
						if ( ! model.get( 'nonces' )['delete'] ) {
							removed.push( model );
							return;
						}

						if ( mediaTrash && 'trash' === model.get( 'status' ) ) {
							model.set( 'status', 'inherit' );
							changed.push( model.save() );
							removed.push( model );
						} else if ( mediaTrash ) {
							model.set( 'status', 'trash' );
							changed.push( model.save() );
							removed.push( model );
						} else {
							model.destroy({wait: true});
						}
					} );

					if ( changed.length ) {
						selection.remove( removed );

						$.when.apply( null, changed ).then( _.bind( function() {
							library._requery( true );
							this.controller.trigger( 'selection:action:done' );
						}, this ) );
					} else {
						this.controller.trigger( 'selection:action:done' );
					}
				}
			}).render() );

			if ( mediaTrash ) {
				this.toolbar.set( 'deleteSelectedPermanentlyButton', new wp.media.view.DeleteSelectedPermanentlyButton({
					filters: Filters,
					style: 'primary',
					disabled: true,
					text: l10n.deleteSelected,
					controller: this.controller,
					priority: -55,
					click: function() {
						var removed = [], selection = this.controller.state().get( 'selection' );

						if ( ! selection.length || ! window.confirm( l10n.warnBulkDelete ) ) {
							return;
						}

						selection.each( function( model ) {
							if ( ! model.get( 'nonces' )['delete'] ) {
								removed.push( model );
								return;
							}

							model.destroy();
						} );

						selection.remove( removed );
						this.controller.trigger( 'selection:action:done' );
					}
				}).render() );
			}

		} else if ( this.options.date ) {
			// DateFilter is a <select>, screen reader text needs to be rendered before
			this.toolbar.set( 'dateFilterLabel', new wp.media.view.Label({
				value: l10n.filterByDate,
				attributes: {
					'for': 'media-attachment-date-filters'
				},
				priority: -75
			}).render() );
			this.toolbar.set( 'dateFilter', new wp.media.view.DateFilter({
				controller: this.controller,
				model:      this.collection.props,
				priority: -75
			}).render() );
		}

		if ( this.options.search ) {
			// Search is an input, screen reader text needs to be rendered before
			this.toolbar.set( 'searchLabel', new wp.media.view.Label({
				value: l10n.searchMediaLabel,
				attributes: {
					'for': 'media-search-input'
				},
				priority:   60
			}).render() );
			this.toolbar.set( 'search', new wp.media.view.Search({
				controller: this.controller,
				model:      this.collection.props,
				priority:   60
			}).render() );
		}

		if ( this.options.dragInfo ) {
			this.toolbar.set( 'dragInfo', new View({
				el: $( '<div class="instructions">' + l10n.dragInfo + '</div>' )[0],
				priority: -40
			}) );
		}

		if ( this.options.suggestedWidth && this.options.suggestedHeight ) {
			this.toolbar.set( 'suggestedDimensions', new View({
				el: $( '<div class="instructions">' + l10n.suggestedDimensions + ' ' + this.options.suggestedWidth + ' &times; ' + this.options.suggestedHeight + '</div>' )[0],
				priority: -40
			}) );
		}
	},

	updateContent: function() {
		var view = this,
			noItemsView;

		if ( this.controller.isModeActive( 'grid' ) ) {
			noItemsView = view.attachmentsNoResults;
		} else {
			noItemsView = view.uploader;
		}

		if ( ! this.collection.length ) {
			this.toolbar.get( 'spinner' ).show();
			this.dfd = this.collection.more().done( function() {
				if ( ! view.collection.length ) {
					noItemsView.$el.removeClass( 'hidden' );
				} else {
					noItemsView.$el.addClass( 'hidden' );
				}
				view.toolbar.get( 'spinner' ).hide();
			} );
		} else {
			noItemsView.$el.addClass( 'hidden' );
			view.toolbar.get( 'spinner' ).hide();
		}
	},

	createUploader: function() {
		this.uploader = new wp.media.view.UploaderInline({
			controller: this.controller,
			status:     false,
			message:    this.controller.isModeActive( 'grid' ) ? '' : l10n.noItemsFound,
			canClose:   this.controller.isModeActive( 'grid' )
		});

		this.uploader.hide();
		this.views.add( this.uploader );
	},

	toggleUploader: function() {
		if ( this.uploader.$el.hasClass( 'hidden' ) ) {
			this.uploader.show();
		} else {
			this.uploader.hide();
		}
	},

	createAttachments: function() {
		this.attachments = new wp.media.view.Attachments({
			controller:           this.controller,
			collection:           this.collection,
			selection:            this.options.selection,
			model:                this.model,
			sortable:             this.options.sortable,
			scrollElement:        this.options.scrollElement,
			idealColumnWidth:     this.options.idealColumnWidth,

			// The single `Attachment` view to be used in the `Attachments` view.
			AttachmentView: this.options.AttachmentView
		});

		// Add keydown listener to the instance of the Attachments view
		this.attachments.listenTo( this.controller, 'attachment:keydown:arrow',     this.attachments.arrowEvent );
		this.attachments.listenTo( this.controller, 'attachment:details:shift-tab', this.attachments.restoreFocus );

		this.views.add( this.attachments );


		if ( this.controller.isModeActive( 'grid' ) ) {
			this.attachmentsNoResults = new View({
				controller: this.controller,
				tagName: 'p'
			});

			this.attachmentsNoResults.$el.addClass( 'hidden no-media' );
			this.attachmentsNoResults.$el.html( l10n.noMedia );

			this.views.add( this.attachmentsNoResults );
		}
	},

	createSidebar: function() {
		var options = this.options,
			selection = options.selection,
			sidebar = this.sidebar = new wp.media.view.Sidebar({
				controller: this.controller
			});

		this.views.add( sidebar );

		if ( this.controller.uploader ) {
			sidebar.set( 'uploads', new wp.media.view.UploaderStatus({
				controller: this.controller,
				priority:   40
			}) );
		}

		selection.on( 'selection:single', this.createSingle, this );
		selection.on( 'selection:unsingle', this.disposeSingle, this );

		if ( selection.single() ) {
			this.createSingle();
		}
	},

	createSingle: function() {
		var sidebar = this.sidebar,
			single = this.options.selection.single();

		sidebar.set( 'details', new wp.media.view.Attachment.Details({
			controller: this.controller,
			model:      single,
			priority:   80
		}) );

		sidebar.set( 'compat', new wp.media.view.AttachmentCompat({
			controller: this.controller,
			model:      single,
			priority:   120
		}) );

		if ( this.options.display ) {
			sidebar.set( 'display', new wp.media.view.Settings.AttachmentDisplay({
				controller:   this.controller,
				model:        this.model.display( single ),
				attachment:   single,
				priority:     160,
				userSettings: this.model.get('displayUserSettings')
			}) );
		}

		// Show the sidebar on mobile
		if ( this.model.id === 'insert' ) {
			sidebar.$el.addClass( 'visible' );
		}
	},

	disposeSingle: function() {
		var sidebar = this.sidebar;
		sidebar.unset('details');
		sidebar.unset('compat');
		sidebar.unset('display');
		// Hide the sidebar on mobile
		sidebar.$el.removeClass( 'visible' );
	}
});

module.exports = AttachmentsBrowser;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/attachments/selection.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.view.Attachments.Selection
 *
 * @class
 * @augments wp.media.view.Attachments
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Attachments = wp.media.view.Attachments,
	Selection;

Selection = Attachments.extend({
	events: {},
	initialize: function() {
		_.defaults( this.options, {
			sortable:   false,
			resize:     false,

			// The single `Attachment` view to be used in the `Attachments` view.
			AttachmentView: wp.media.view.Attachment.Selection
		});
		// Call 'initialize' directly on the parent class.
		return Attachments.prototype.initialize.apply( this, arguments );
	}
});

module.exports = Selection;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/button-group.js":[function(require,module,exports){
/*globals _, Backbone */

/**
 * wp.media.view.ButtonGroup
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var $ = Backbone.$,
	ButtonGroup;

ButtonGroup = wp.media.View.extend({
	tagName:   'div',
	className: 'button-group button-large media-button-group',

	initialize: function() {
		/**
		 * @member {wp.media.view.Button[]}
		 */
		this.buttons = _.map( this.options.buttons || [], function( button ) {
			if ( button instanceof Backbone.View ) {
				return button;
			} else {
				return new wp.media.view.Button( button ).render();
			}
		});

		delete this.options.buttons;

		if ( this.options.classes ) {
			this.$el.addClass( this.options.classes );
		}
	},

	/**
	 * @returns {wp.media.view.ButtonGroup}
	 */
	render: function() {
		this.$el.html( $( _.pluck( this.buttons, 'el' ) ).detach() );
		return this;
	}
});

module.exports = ButtonGroup;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/button.js":[function(require,module,exports){
/*globals _, Backbone */

/**
 * wp.media.view.Button
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Button = wp.media.View.extend({
	tagName:    'button',
	className:  'media-button',
	attributes: { type: 'button' },

	events: {
		'click': 'click'
	},

	defaults: {
		text:     '',
		style:    '',
		size:     'large',
		disabled: false
	},

	initialize: function() {
		/**
		 * Create a model with the provided `defaults`.
		 *
		 * @member {Backbone.Model}
		 */
		this.model = new Backbone.Model( this.defaults );

		// If any of the `options` have a key from `defaults`, apply its
		// value to the `model` and remove it from the `options object.
		_.each( this.defaults, function( def, key ) {
			var value = this.options[ key ];
			if ( _.isUndefined( value ) ) {
				return;
			}

			this.model.set( key, value );
			delete this.options[ key ];
		}, this );

		this.listenTo( this.model, 'change', this.render );
	},
	/**
	 * @returns {wp.media.view.Button} Returns itself to allow chaining
	 */
	render: function() {
		var classes = [ 'button', this.className ],
			model = this.model.toJSON();

		if ( model.style ) {
			classes.push( 'button-' + model.style );
		}

		if ( model.size ) {
			classes.push( 'button-' + model.size );
		}

		classes = _.uniq( classes.concat( this.options.classes ) );
		this.el.className = classes.join(' ');

		this.$el.attr( 'disabled', model.disabled );
		this.$el.text( this.model.get('text') );

		return this;
	},
	/**
	 * @param {Object} event
	 */
	click: function( event ) {
		if ( '#' === this.attributes.href ) {
			event.preventDefault();
		}

		if ( this.options.click && ! this.model.get('disabled') ) {
			this.options.click.apply( this, arguments );
		}
	}
});

module.exports = Button;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/cropper.js":[function(require,module,exports){
/*globals wp, _, jQuery */

/**
 * wp.media.view.Cropper
 *
 * Uses the imgAreaSelect plugin to allow a user to crop an image.
 *
 * Takes imgAreaSelect options from
 * wp.customize.HeaderControl.calculateImageSelectOptions via
 * wp.customize.HeaderControl.openMM.
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	UploaderStatus = wp.media.view.UploaderStatus,
	l10n = wp.media.view.l10n,
	$ = jQuery,
	Cropper;

Cropper = View.extend({
	className: 'crop-content',
	template: wp.template('crop-content'),
	initialize: function() {
		_.bindAll(this, 'onImageLoad');
	},
	ready: function() {
		this.controller.frame.on('content:error:crop', this.onError, this);
		this.$image = this.$el.find('.crop-image');
		this.$image.on('load', this.onImageLoad);
		$(window).on('resize.cropper', _.debounce(this.onImageLoad, 250));
	},
	remove: function() {
		$(window).off('resize.cropper');
		this.$el.remove();
		this.$el.off();
		View.prototype.remove.apply(this, arguments);
	},
	prepare: function() {
		return {
			title: l10n.cropYourImage,
			url: this.options.attachment.get('url')
		};
	},
	onImageLoad: function() {
		var imgOptions = this.controller.get('imgSelectOptions');
		if (typeof imgOptions === 'function') {
			imgOptions = imgOptions(this.options.attachment, this.controller);
		}

		imgOptions = _.extend(imgOptions, {parent: this.$el});
		this.trigger('image-loaded');
		this.controller.imgSelect = this.$image.imgAreaSelect(imgOptions);
	},
	onError: function() {
		var filename = this.options.attachment.get('filename');

		this.views.add( '.upload-errors', new wp.media.view.UploaderStatusError({
			filename: UploaderStatus.prototype.filename(filename),
			message: window._wpMediaViewsL10n.cropError
		}), { at: 0 });
	}
});

module.exports = Cropper;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/edit-image.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.view.EditImage
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	EditImage;

EditImage = View.extend({
	className: 'image-editor',
	template: wp.template('image-editor'),

	initialize: function( options ) {
		this.editor = window.imageEdit;
		this.controller = options.controller;
		View.prototype.initialize.apply( this, arguments );
	},

	prepare: function() {
		return this.model.toJSON();
	},

	loadEditor: function() {
		var dfd = this.editor.open( this.model.get('id'), this.model.get('nonces').edit, this );
		dfd.done( _.bind( this.focus, this ) );
	},

	focus: function() {
		this.$( '.imgedit-submit .button' ).eq( 0 ).focus();
	},

	back: function() {
		var lastState = this.controller.lastState();
		this.controller.setState( lastState );
	},

	refresh: function() {
		this.model.fetch();
	},

	save: function() {
		var lastState = this.controller.lastState();

		this.model.fetch().done( _.bind( function() {
			this.controller.setState( lastState );
		}, this ) );
	}

});

module.exports = EditImage;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/embed.js":[function(require,module,exports){
/**
 * wp.media.view.Embed
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Embed = wp.media.View.extend({
	className: 'media-embed',

	initialize: function() {
		/**
		 * @member {wp.media.view.EmbedUrl}
		 */
		this.url = new wp.media.view.EmbedUrl({
			controller: this.controller,
			model:      this.model.props
		}).render();

		this.views.set([ this.url ]);
		this.refresh();
		this.listenTo( this.model, 'change:type', this.refresh );
		this.listenTo( this.model, 'change:loading', this.loading );
	},

	/**
	 * @param {Object} view
	 */
	settings: function( view ) {
		if ( this._settings ) {
			this._settings.remove();
		}
		this._settings = view;
		this.views.add( view );
	},

	refresh: function() {
		var type = this.model.get('type'),
			constructor;

		if ( 'image' === type ) {
			constructor = wp.media.view.EmbedImage;
		} else if ( 'link' === type ) {
			constructor = wp.media.view.EmbedLink;
		} else {
			return;
		}

		this.settings( new constructor({
			controller: this.controller,
			model:      this.model.props,
			priority:   40
		}) );
	},

	loading: function() {
		this.$el.toggleClass( 'embed-loading', this.model.get('loading') );
	}
});

module.exports = Embed;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/embed/image.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.EmbedImage
 *
 * @class
 * @augments wp.media.view.Settings.AttachmentDisplay
 * @augments wp.media.view.Settings
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var AttachmentDisplay = wp.media.view.Settings.AttachmentDisplay,
	EmbedImage;

EmbedImage = AttachmentDisplay.extend({
	className: 'embed-media-settings',
	template:  wp.template('embed-image-settings'),

	initialize: function() {
		/**
		 * Call `initialize` directly on parent class with passed arguments
		 */
		AttachmentDisplay.prototype.initialize.apply( this, arguments );
		this.listenTo( this.model, 'change:url', this.updateImage );
	},

	updateImage: function() {
		this.$('img').attr( 'src', this.model.get('url') );
	}
});

module.exports = EmbedImage;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/embed/link.js":[function(require,module,exports){
/*globals wp, _, jQuery */

/**
 * wp.media.view.EmbedLink
 *
 * @class
 * @augments wp.media.view.Settings
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var $ = jQuery,
	EmbedLink;

EmbedLink = wp.media.view.Settings.extend({
	className: 'embed-link-settings',
	template:  wp.template('embed-link-settings'),

	initialize: function() {
		this.listenTo( this.model, 'change:url', this.updateoEmbed );
	},

	updateoEmbed: _.debounce( function() {
		var url = this.model.get( 'url' );

		// clear out previous results
		this.$('.embed-container').hide().find('.embed-preview').empty();
		this.$( '.setting' ).hide();

		// only proceed with embed if the field contains more than 11 characters
		// Example: http://a.io is 11 chars
		if ( url && ( url.length < 11 || ! url.match(/^http(s)?:\/\//) ) ) {
			return;
		}

		this.fetch();
	}, wp.media.controller.Embed.sensitivity ),

	fetch: function() {
		var embed;

		// check if they haven't typed in 500 ms
		if ( $('#embed-url-field').val() !== this.model.get('url') ) {
			return;
		}

		if ( this.dfd && 'pending' === this.dfd.state() ) {
			this.dfd.abort();
		}

		embed = new wp.shortcode({
			tag: 'embed',
			attrs: _.pick( this.model.attributes, [ 'width', 'height', 'src' ] ),
			content: this.model.get('url')
		});

		this.dfd = $.ajax({
			type:    'POST',
			url:     wp.ajax.settings.url,
			context: this,
			data:    {
				action: 'parse-embed',
				post_ID: wp.media.view.settings.post.id,
				shortcode: embed.string()
			}
		})
			.done( this.renderoEmbed )
			.fail( this.renderFail );
	},

	renderFail: function ( response, status ) {
		if ( 'abort' === status ) {
			return;
		}
		this.$( '.link-text' ).show();
	},

	renderoEmbed: function( response ) {
		var html = ( response && response.data && response.data.body ) || '';

		if ( html ) {
			this.$('.embed-container').show().find('.embed-preview').html( html );
		} else {
			this.renderFail();
		}
	}
});

module.exports = EmbedLink;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/embed/url.js":[function(require,module,exports){
/*globals wp, _, jQuery */

/**
 * wp.media.view.EmbedUrl
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	$ = jQuery,
	EmbedUrl;

EmbedUrl = View.extend({
	tagName:   'label',
	className: 'embed-url',

	events: {
		'input':  'url',
		'keyup':  'url',
		'change': 'url'
	},

	initialize: function() {
		this.$input = $('<input id="embed-url-field" type="url" />').val( this.model.get('url') );
		this.input = this.$input[0];

		this.spinner = $('<span class="spinner" />')[0];
		this.$el.append([ this.input, this.spinner ]);

		this.listenTo( this.model, 'change:url', this.render );

		if ( this.model.get( 'url' ) ) {
			_.delay( _.bind( function () {
				this.model.trigger( 'change:url' );
			}, this ), 500 );
		}
	},
	/**
	 * @returns {wp.media.view.EmbedUrl} Returns itself to allow chaining
	 */
	render: function() {
		var $input = this.$input;

		if ( $input.is(':focus') ) {
			return;
		}

		this.input.value = this.model.get('url') || 'http://';
		/**
		 * Call `render` directly on parent class with passed arguments
		 */
		View.prototype.render.apply( this, arguments );
		return this;
	},

	ready: function() {
		if ( ! wp.media.isTouchDevice ) {
			this.focus();
		}
	},

	url: function( event ) {
		this.model.set( 'url', event.target.value );
	},

	/**
	 * If the input is visible, focus and select its contents.
	 */
	focus: function() {
		var $input = this.$input;
		if ( $input.is(':visible') ) {
			$input.focus()[0].select();
		}
	}
});

module.exports = EmbedUrl;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/focus-manager.js":[function(require,module,exports){
/**
 * wp.media.view.FocusManager
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var FocusManager = wp.media.View.extend({

	events: {
		'keydown': 'constrainTabbing'
	},

	focus: function() { // Reset focus on first left menu item
		this.$('.media-menu-item').first().focus();
	},
	/**
	 * @param {Object} event
	 */
	constrainTabbing: function( event ) {
		var tabbables;

		// Look for the tab key.
		if ( 9 !== event.keyCode ) {
			return;
		}

		// Skip the file input added by Plupload.
		tabbables = this.$( ':tabbable' ).not( '.moxie-shim input[type="file"]' );

		// Keep tab focus within media modal while it's open
		if ( tabbables.last()[0] === event.target && ! event.shiftKey ) {
			tabbables.first().focus();
			return false;
		} else if ( tabbables.first()[0] === event.target && event.shiftKey ) {
			tabbables.last().focus();
			return false;
		}
	}

});

module.exports = FocusManager;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame.js":[function(require,module,exports){
/*globals _, Backbone */

/**
 * wp.media.view.Frame
 *
 * A frame is a composite view consisting of one or more regions and one or more
 * states.
 *
 * @see wp.media.controller.State
 * @see wp.media.controller.Region
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 * @mixes wp.media.controller.StateMachine
 */
var Frame = wp.media.View.extend({
	initialize: function() {
		_.defaults( this.options, {
			mode: [ 'select' ]
		});
		this._createRegions();
		this._createStates();
		this._createModes();
	},

	_createRegions: function() {
		// Clone the regions array.
		this.regions = this.regions ? this.regions.slice() : [];

		// Initialize regions.
		_.each( this.regions, function( region ) {
			this[ region ] = new wp.media.controller.Region({
				view:     this,
				id:       region,
				selector: '.media-frame-' + region
			});
		}, this );
	},
	/**
	 * Create the frame's states.
	 *
	 * @see wp.media.controller.State
	 * @see wp.media.controller.StateMachine
	 *
	 * @fires wp.media.controller.State#ready
	 */
	_createStates: function() {
		// Create the default `states` collection.
		this.states = new Backbone.Collection( null, {
			model: wp.media.controller.State
		});

		// Ensure states have a reference to the frame.
		this.states.on( 'add', function( model ) {
			model.frame = this;
			model.trigger('ready');
		}, this );

		if ( this.options.states ) {
			this.states.add( this.options.states );
		}
	},

	/**
	 * A frame can be in a mode or multiple modes at one time.
	 *
	 * For example, the manage media frame can be in the `Bulk Select` or `Edit` mode.
	 */
	_createModes: function() {
		// Store active "modes" that the frame is in. Unrelated to region modes.
		this.activeModes = new Backbone.Collection();
		this.activeModes.on( 'add remove reset', _.bind( this.triggerModeEvents, this ) );

		_.each( this.options.mode, function( mode ) {
			this.activateMode( mode );
		}, this );
	},
	/**
	 * Reset all states on the frame to their defaults.
	 *
	 * @returns {wp.media.view.Frame} Returns itself to allow chaining
	 */
	reset: function() {
		this.states.invoke( 'trigger', 'reset' );
		return this;
	},
	/**
	 * Map activeMode collection events to the frame.
	 */
	triggerModeEvents: function( model, collection, options ) {
		var collectionEvent,
			modeEventMap = {
				add: 'activate',
				remove: 'deactivate'
			},
			eventToTrigger;
		// Probably a better way to do this.
		_.each( options, function( value, key ) {
			if ( value ) {
				collectionEvent = key;
			}
		} );

		if ( ! _.has( modeEventMap, collectionEvent ) ) {
			return;
		}

		eventToTrigger = model.get('id') + ':' + modeEventMap[collectionEvent];
		this.trigger( eventToTrigger );
	},
	/**
	 * Activate a mode on the frame.
	 *
	 * @param string mode Mode ID.
	 * @returns {this} Returns itself to allow chaining.
	 */
	activateMode: function( mode ) {
		// Bail if the mode is already active.
		if ( this.isModeActive( mode ) ) {
			return;
		}
		this.activeModes.add( [ { id: mode } ] );
		// Add a CSS class to the frame so elements can be styled for the mode.
		this.$el.addClass( 'mode-' + mode );

		return this;
	},
	/**
	 * Deactivate a mode on the frame.
	 *
	 * @param string mode Mode ID.
	 * @returns {this} Returns itself to allow chaining.
	 */
	deactivateMode: function( mode ) {
		// Bail if the mode isn't active.
		if ( ! this.isModeActive( mode ) ) {
			return this;
		}
		this.activeModes.remove( this.activeModes.where( { id: mode } ) );
		this.$el.removeClass( 'mode-' + mode );
		/**
		 * Frame mode deactivation event.
		 *
		 * @event this#{mode}:deactivate
		 */
		this.trigger( mode + ':deactivate' );

		return this;
	},
	/**
	 * Check if a mode is enabled on the frame.
	 *
	 * @param  string mode Mode ID.
	 * @return bool
	 */
	isModeActive: function( mode ) {
		return Boolean( this.activeModes.where( { id: mode } ).length );
	}
});

// Make the `Frame` a `StateMachine`.
_.extend( Frame.prototype, wp.media.controller.StateMachine.prototype );

module.exports = Frame;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/image-details.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.MediaFrame.ImageDetails
 *
 * A media frame for manipulating an image that's already been inserted
 * into a post.
 *
 * @class
 * @augments wp.media.view.MediaFrame.Select
 * @augments wp.media.view.MediaFrame
 * @augments wp.media.view.Frame
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 * @mixes wp.media.controller.StateMachine
 */
var Select = wp.media.view.MediaFrame.Select,
	l10n = wp.media.view.l10n,
	ImageDetails;

ImageDetails = Select.extend({
	defaults: {
		id:      'image',
		url:     '',
		menu:    'image-details',
		content: 'image-details',
		toolbar: 'image-details',
		type:    'link',
		title:    l10n.imageDetailsTitle,
		priority: 120
	},

	initialize: function( options ) {
		this.image = new wp.media.model.PostImage( options.metadata );
		this.options.selection = new wp.media.model.Selection( this.image.attachment, { multiple: false } );
		Select.prototype.initialize.apply( this, arguments );
	},

	bindHandlers: function() {
		Select.prototype.bindHandlers.apply( this, arguments );
		this.on( 'menu:create:image-details', this.createMenu, this );
		this.on( 'content:create:image-details', this.imageDetailsContent, this );
		this.on( 'content:render:edit-image', this.editImageContent, this );
		this.on( 'toolbar:render:image-details', this.renderImageDetailsToolbar, this );
		// override the select toolbar
		this.on( 'toolbar:render:replace', this.renderReplaceImageToolbar, this );
	},

	createStates: function() {
		this.states.add([
			new wp.media.controller.ImageDetails({
				image: this.image,
				editable: false
			}),
			new wp.media.controller.ReplaceImage({
				id: 'replace-image',
				library: wp.media.query( { type: 'image' } ),
				image: this.image,
				multiple:  false,
				title:     l10n.imageReplaceTitle,
				toolbar: 'replace',
				priority:  80,
				displaySettings: true
			}),
			new wp.media.controller.EditImage( {
				image: this.image,
				selection: this.options.selection
			} )
		]);
	},

	imageDetailsContent: function( options ) {
		options.view = new wp.media.view.ImageDetails({
			controller: this,
			model: this.state().image,
			attachment: this.state().image.attachment
		});
	},

	editImageContent: function() {
		var state = this.state(),
			model = state.get('image'),
			view;

		if ( ! model ) {
			return;
		}

		view = new wp.media.view.EditImage( { model: model, controller: this } ).render();

		this.content.set( view );

		// after bringing in the frame, load the actual editor via an ajax call
		view.loadEditor();

	},

	renderImageDetailsToolbar: function() {
		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				select: {
					style:    'primary',
					text:     l10n.update,
					priority: 80,

					click: function() {
						var controller = this.controller,
							state = controller.state();

						controller.close();

						// not sure if we want to use wp.media.string.image which will create a shortcode or
						// perhaps wp.html.string to at least to build the <img />
						state.trigger( 'update', controller.image.toJSON() );

						// Restore and reset the default state.
						controller.setState( controller.options.state );
						controller.reset();
					}
				}
			}
		}) );
	},

	renderReplaceImageToolbar: function() {
		var frame = this,
			lastState = frame.lastState(),
			previous = lastState && lastState.id;

		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				back: {
					text:     l10n.back,
					priority: 20,
					click:    function() {
						if ( previous ) {
							frame.setState( previous );
						} else {
							frame.close();
						}
					}
				},

				replace: {
					style:    'primary',
					text:     l10n.replace,
					priority: 80,

					click: function() {
						var controller = this.controller,
							state = controller.state(),
							selection = state.get( 'selection' ),
							attachment = selection.single();

						controller.close();

						controller.image.changeAttachment( attachment, state.display( attachment ) );

						// not sure if we want to use wp.media.string.image which will create a shortcode or
						// perhaps wp.html.string to at least to build the <img />
						state.trigger( 'replace', controller.image.toJSON() );

						// Restore and reset the default state.
						controller.setState( controller.options.state );
						controller.reset();
					}
				}
			}
		}) );
	}

});

module.exports = ImageDetails;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/post.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.view.MediaFrame.Post
 *
 * The frame for manipulating media on the Edit Post page.
 *
 * @class
 * @augments wp.media.view.MediaFrame.Select
 * @augments wp.media.view.MediaFrame
 * @augments wp.media.view.Frame
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 * @mixes wp.media.controller.StateMachine
 */
var Select = wp.media.view.MediaFrame.Select,
	Library = wp.media.controller.Library,
	l10n = wp.media.view.l10n,
	Post;

Post = Select.extend({
	initialize: function() {
		this.counts = {
			audio: {
				count: wp.media.view.settings.attachmentCounts.audio,
				state: 'playlist'
			},
			video: {
				count: wp.media.view.settings.attachmentCounts.video,
				state: 'video-playlist'
			}
		};

		_.defaults( this.options, {
			multiple:  true,
			editing:   false,
			state:    'insert',
			metadata:  {}
		});

		// Call 'initialize' directly on the parent class.
		Select.prototype.initialize.apply( this, arguments );
		this.createIframeStates();

	},

	/**
	 * Create the default states.
	 */
	createStates: function() {
		var options = this.options;

		this.states.add([
			// Main states.
			new Library({
				id:         'insert',
				title:      l10n.insertMediaTitle,
				priority:   20,
				toolbar:    'main-insert',
				filterable: 'all',
				library:    wp.media.query( options.library ),
				multiple:   options.multiple ? 'reset' : false,
				editable:   true,

				// If the user isn't allowed to edit fields,
				// can they still edit it locally?
				allowLocalEdits: true,

				// Show the attachment display settings.
				displaySettings: true,
				// Update user settings when users adjust the
				// attachment display settings.
				displayUserSettings: true
			}),

			new Library({
				id:         'gallery',
				title:      l10n.createGalleryTitle,
				priority:   40,
				toolbar:    'main-gallery',
				filterable: 'uploaded',
				multiple:   'add',
				editable:   false,

				library:  wp.media.query( _.defaults({
					type: 'image'
				}, options.library ) )
			}),

			// Embed states.
			new wp.media.controller.Embed( { metadata: options.metadata } ),

			new wp.media.controller.EditImage( { model: options.editImage } ),

			// Gallery states.
			new wp.media.controller.GalleryEdit({
				library: options.selection,
				editing: options.editing,
				menu:    'gallery'
			}),

			new wp.media.controller.GalleryAdd(),

			new Library({
				id:         'playlist',
				title:      l10n.createPlaylistTitle,
				priority:   60,
				toolbar:    'main-playlist',
				filterable: 'uploaded',
				multiple:   'add',
				editable:   false,

				library:  wp.media.query( _.defaults({
					type: 'audio'
				}, options.library ) )
			}),

			// Playlist states.
			new wp.media.controller.CollectionEdit({
				type: 'audio',
				collectionType: 'playlist',
				title:          l10n.editPlaylistTitle,
				SettingsView:   wp.media.view.Settings.Playlist,
				library:        options.selection,
				editing:        options.editing,
				menu:           'playlist',
				dragInfoText:   l10n.playlistDragInfo,
				dragInfo:       false
			}),

			new wp.media.controller.CollectionAdd({
				type: 'audio',
				collectionType: 'playlist',
				title: l10n.addToPlaylistTitle
			}),

			new Library({
				id:         'video-playlist',
				title:      l10n.createVideoPlaylistTitle,
				priority:   60,
				toolbar:    'main-video-playlist',
				filterable: 'uploaded',
				multiple:   'add',
				editable:   false,

				library:  wp.media.query( _.defaults({
					type: 'video'
				}, options.library ) )
			}),

			new wp.media.controller.CollectionEdit({
				type: 'video',
				collectionType: 'playlist',
				title:          l10n.editVideoPlaylistTitle,
				SettingsView:   wp.media.view.Settings.Playlist,
				library:        options.selection,
				editing:        options.editing,
				menu:           'video-playlist',
				dragInfoText:   l10n.videoPlaylistDragInfo,
				dragInfo:       false
			}),

			new wp.media.controller.CollectionAdd({
				type: 'video',
				collectionType: 'playlist',
				title: l10n.addToVideoPlaylistTitle
			})
		]);

		if ( wp.media.view.settings.post.featuredImageId ) {
			this.states.add( new wp.media.controller.FeaturedImage() );
		}
	},

	bindHandlers: function() {
		var handlers, checkCounts;

		Select.prototype.bindHandlers.apply( this, arguments );

		this.on( 'activate', this.activate, this );

		// Only bother checking media type counts if one of the counts is zero
		checkCounts = _.find( this.counts, function( type ) {
			return type.count === 0;
		} );

		if ( typeof checkCounts !== 'undefined' ) {
			this.listenTo( wp.media.model.Attachments.all, 'change:type', this.mediaTypeCounts );
		}

		this.on( 'menu:create:gallery', this.createMenu, this );
		this.on( 'menu:create:playlist', this.createMenu, this );
		this.on( 'menu:create:video-playlist', this.createMenu, this );
		this.on( 'toolbar:create:main-insert', this.createToolbar, this );
		this.on( 'toolbar:create:main-gallery', this.createToolbar, this );
		this.on( 'toolbar:create:main-playlist', this.createToolbar, this );
		this.on( 'toolbar:create:main-video-playlist', this.createToolbar, this );
		this.on( 'toolbar:create:featured-image', this.featuredImageToolbar, this );
		this.on( 'toolbar:create:main-embed', this.mainEmbedToolbar, this );

		handlers = {
			menu: {
				'default': 'mainMenu',
				'gallery': 'galleryMenu',
				'playlist': 'playlistMenu',
				'video-playlist': 'videoPlaylistMenu'
			},

			content: {
				'embed':          'embedContent',
				'edit-image':     'editImageContent',
				'edit-selection': 'editSelectionContent'
			},

			toolbar: {
				'main-insert':      'mainInsertToolbar',
				'main-gallery':     'mainGalleryToolbar',
				'gallery-edit':     'galleryEditToolbar',
				'gallery-add':      'galleryAddToolbar',
				'main-playlist':	'mainPlaylistToolbar',
				'playlist-edit':	'playlistEditToolbar',
				'playlist-add':		'playlistAddToolbar',
				'main-video-playlist': 'mainVideoPlaylistToolbar',
				'video-playlist-edit': 'videoPlaylistEditToolbar',
				'video-playlist-add': 'videoPlaylistAddToolbar'
			}
		};

		_.each( handlers, function( regionHandlers, region ) {
			_.each( regionHandlers, function( callback, handler ) {
				this.on( region + ':render:' + handler, this[ callback ], this );
			}, this );
		}, this );
	},

	activate: function() {
		// Hide menu items for states tied to particular media types if there are no items
		_.each( this.counts, function( type ) {
			if ( type.count < 1 ) {
				this.menuItemVisibility( type.state, 'hide' );
			}
		}, this );
	},

	mediaTypeCounts: function( model, attr ) {
		if ( typeof this.counts[ attr ] !== 'undefined' && this.counts[ attr ].count < 1 ) {
			this.counts[ attr ].count++;
			this.menuItemVisibility( this.counts[ attr ].state, 'show' );
		}
	},

	// Menus
	/**
	 * @param {wp.Backbone.View} view
	 */
	mainMenu: function( view ) {
		view.set({
			'library-separator': new wp.media.View({
				className: 'separator',
				priority: 100
			})
		});
	},

	menuItemVisibility: function( state, visibility ) {
		var menu = this.menu.get();
		if ( visibility === 'hide' ) {
			menu.hide( state );
		} else if ( visibility === 'show' ) {
			menu.show( state );
		}
	},
	/**
	 * @param {wp.Backbone.View} view
	 */
	galleryMenu: function( view ) {
		var lastState = this.lastState(),
			previous = lastState && lastState.id,
			frame = this;

		view.set({
			cancel: {
				text:     l10n.cancelGalleryTitle,
				priority: 20,
				click:    function() {
					if ( previous ) {
						frame.setState( previous );
					} else {
						frame.close();
					}

					// Keep focus inside media modal
					// after canceling a gallery
					this.controller.modal.focusManager.focus();
				}
			},
			separateCancel: new wp.media.View({
				className: 'separator',
				priority: 40
			})
		});
	},

	playlistMenu: function( view ) {
		var lastState = this.lastState(),
			previous = lastState && lastState.id,
			frame = this;

		view.set({
			cancel: {
				text:     l10n.cancelPlaylistTitle,
				priority: 20,
				click:    function() {
					if ( previous ) {
						frame.setState( previous );
					} else {
						frame.close();
					}
				}
			},
			separateCancel: new wp.media.View({
				className: 'separator',
				priority: 40
			})
		});
	},

	videoPlaylistMenu: function( view ) {
		var lastState = this.lastState(),
			previous = lastState && lastState.id,
			frame = this;

		view.set({
			cancel: {
				text:     l10n.cancelVideoPlaylistTitle,
				priority: 20,
				click:    function() {
					if ( previous ) {
						frame.setState( previous );
					} else {
						frame.close();
					}
				}
			},
			separateCancel: new wp.media.View({
				className: 'separator',
				priority: 40
			})
		});
	},

	// Content
	embedContent: function() {
		var view = new wp.media.view.Embed({
			controller: this,
			model:      this.state()
		}).render();

		this.content.set( view );

		if ( ! wp.media.isTouchDevice ) {
			view.url.focus();
		}
	},

	editSelectionContent: function() {
		var state = this.state(),
			selection = state.get('selection'),
			view;

		view = new wp.media.view.AttachmentsBrowser({
			controller: this,
			collection: selection,
			selection:  selection,
			model:      state,
			sortable:   true,
			search:     false,
			date:       false,
			dragInfo:   true,

			AttachmentView: wp.media.view.Attachments.EditSelection
		}).render();

		view.toolbar.set( 'backToLibrary', {
			text:     l10n.returnToLibrary,
			priority: -100,

			click: function() {
				this.controller.content.mode('browse');
			}
		});

		// Browse our library of attachments.
		this.content.set( view );

		// Trigger the controller to set focus
		this.trigger( 'edit:selection', this );
	},

	editImageContent: function() {
		var image = this.state().get('image'),
			view = new wp.media.view.EditImage( { model: image, controller: this } ).render();

		this.content.set( view );

		// after creating the wrapper view, load the actual editor via an ajax call
		view.loadEditor();

	},

	// Toolbars

	/**
	 * @param {wp.Backbone.View} view
	 */
	selectionStatusToolbar: function( view ) {
		var editable = this.state().get('editable');

		view.set( 'selection', new wp.media.view.Selection({
			controller: this,
			collection: this.state().get('selection'),
			priority:   -40,

			// If the selection is editable, pass the callback to
			// switch the content mode.
			editable: editable && function() {
				this.controller.content.mode('edit-selection');
			}
		}).render() );
	},

	/**
	 * @param {wp.Backbone.View} view
	 */
	mainInsertToolbar: function( view ) {
		var controller = this;

		this.selectionStatusToolbar( view );

		view.set( 'insert', {
			style:    'primary',
			priority: 80,
			text:     l10n.insertIntoPost,
			requires: { selection: true },

			/**
			 * @fires wp.media.controller.State#insert
			 */
			click: function() {
				var state = controller.state(),
					selection = state.get('selection');

				controller.close();
				state.trigger( 'insert', selection ).reset();
			}
		});
	},

	/**
	 * @param {wp.Backbone.View} view
	 */
	mainGalleryToolbar: function( view ) {
		var controller = this;

		this.selectionStatusToolbar( view );

		view.set( 'gallery', {
			style:    'primary',
			text:     l10n.createNewGallery,
			priority: 60,
			requires: { selection: true },

			click: function() {
				var selection = controller.state().get('selection'),
					edit = controller.state('gallery-edit'),
					models = selection.where({ type: 'image' });

				edit.set( 'library', new wp.media.model.Selection( models, {
					props:    selection.props.toJSON(),
					multiple: true
				}) );

				this.controller.setState('gallery-edit');

				// Keep focus inside media modal
				// after jumping to gallery view
				this.controller.modal.focusManager.focus();
			}
		});
	},

	mainPlaylistToolbar: function( view ) {
		var controller = this;

		this.selectionStatusToolbar( view );

		view.set( 'playlist', {
			style:    'primary',
			text:     l10n.createNewPlaylist,
			priority: 100,
			requires: { selection: true },

			click: function() {
				var selection = controller.state().get('selection'),
					edit = controller.state('playlist-edit'),
					models = selection.where({ type: 'audio' });

				edit.set( 'library', new wp.media.model.Selection( models, {
					props:    selection.props.toJSON(),
					multiple: true
				}) );

				this.controller.setState('playlist-edit');

				// Keep focus inside media modal
				// after jumping to playlist view
				this.controller.modal.focusManager.focus();
			}
		});
	},

	mainVideoPlaylistToolbar: function( view ) {
		var controller = this;

		this.selectionStatusToolbar( view );

		view.set( 'video-playlist', {
			style:    'primary',
			text:     l10n.createNewVideoPlaylist,
			priority: 100,
			requires: { selection: true },

			click: function() {
				var selection = controller.state().get('selection'),
					edit = controller.state('video-playlist-edit'),
					models = selection.where({ type: 'video' });

				edit.set( 'library', new wp.media.model.Selection( models, {
					props:    selection.props.toJSON(),
					multiple: true
				}) );

				this.controller.setState('video-playlist-edit');

				// Keep focus inside media modal
				// after jumping to video playlist view
				this.controller.modal.focusManager.focus();
			}
		});
	},

	featuredImageToolbar: function( toolbar ) {
		this.createSelectToolbar( toolbar, {
			text:  l10n.setFeaturedImage,
			state: this.options.state
		});
	},

	mainEmbedToolbar: function( toolbar ) {
		toolbar.view = new wp.media.view.Toolbar.Embed({
			controller: this
		});
	},

	galleryEditToolbar: function() {
		var editing = this.state().get('editing');
		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				insert: {
					style:    'primary',
					text:     editing ? l10n.updateGallery : l10n.insertGallery,
					priority: 80,
					requires: { library: true },

					/**
					 * @fires wp.media.controller.State#update
					 */
					click: function() {
						var controller = this.controller,
							state = controller.state();

						controller.close();
						state.trigger( 'update', state.get('library') );

						// Restore and reset the default state.
						controller.setState( controller.options.state );
						controller.reset();
					}
				}
			}
		}) );
	},

	galleryAddToolbar: function() {
		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				insert: {
					style:    'primary',
					text:     l10n.addToGallery,
					priority: 80,
					requires: { selection: true },

					/**
					 * @fires wp.media.controller.State#reset
					 */
					click: function() {
						var controller = this.controller,
							state = controller.state(),
							edit = controller.state('gallery-edit');

						edit.get('library').add( state.get('selection').models );
						state.trigger('reset');
						controller.setState('gallery-edit');
					}
				}
			}
		}) );
	},

	playlistEditToolbar: function() {
		var editing = this.state().get('editing');
		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				insert: {
					style:    'primary',
					text:     editing ? l10n.updatePlaylist : l10n.insertPlaylist,
					priority: 80,
					requires: { library: true },

					/**
					 * @fires wp.media.controller.State#update
					 */
					click: function() {
						var controller = this.controller,
							state = controller.state();

						controller.close();
						state.trigger( 'update', state.get('library') );

						// Restore and reset the default state.
						controller.setState( controller.options.state );
						controller.reset();
					}
				}
			}
		}) );
	},

	playlistAddToolbar: function() {
		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				insert: {
					style:    'primary',
					text:     l10n.addToPlaylist,
					priority: 80,
					requires: { selection: true },

					/**
					 * @fires wp.media.controller.State#reset
					 */
					click: function() {
						var controller = this.controller,
							state = controller.state(),
							edit = controller.state('playlist-edit');

						edit.get('library').add( state.get('selection').models );
						state.trigger('reset');
						controller.setState('playlist-edit');
					}
				}
			}
		}) );
	},

	videoPlaylistEditToolbar: function() {
		var editing = this.state().get('editing');
		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				insert: {
					style:    'primary',
					text:     editing ? l10n.updateVideoPlaylist : l10n.insertVideoPlaylist,
					priority: 140,
					requires: { library: true },

					click: function() {
						var controller = this.controller,
							state = controller.state(),
							library = state.get('library');

						library.type = 'video';

						controller.close();
						state.trigger( 'update', library );

						// Restore and reset the default state.
						controller.setState( controller.options.state );
						controller.reset();
					}
				}
			}
		}) );
	},

	videoPlaylistAddToolbar: function() {
		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				insert: {
					style:    'primary',
					text:     l10n.addToVideoPlaylist,
					priority: 140,
					requires: { selection: true },

					click: function() {
						var controller = this.controller,
							state = controller.state(),
							edit = controller.state('video-playlist-edit');

						edit.get('library').add( state.get('selection').models );
						state.trigger('reset');
						controller.setState('video-playlist-edit');
					}
				}
			}
		}) );
	}
});

module.exports = Post;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/frame/select.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.view.MediaFrame.Select
 *
 * A frame for selecting an item or items from the media library.
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
	l10n = wp.media.view.l10n,
	Select;

Select = MediaFrame.extend({
	initialize: function() {
		// Call 'initialize' directly on the parent class.
		MediaFrame.prototype.initialize.apply( this, arguments );

		_.defaults( this.options, {
			selection: [],
			library:   {},
			multiple:  false,
			state:    'library'
		});

		this.createSelection();
		this.createStates();
		this.bindHandlers();
	},

	/**
	 * Attach a selection collection to the frame.
	 *
	 * A selection is a collection of attachments used for a specific purpose
	 * by a media frame. e.g. Selecting an attachment (or many) to insert into
	 * post content.
	 *
	 * @see media.model.Selection
	 */
	createSelection: function() {
		var selection = this.options.selection;

		if ( ! (selection instanceof wp.media.model.Selection) ) {
			this.options.selection = new wp.media.model.Selection( selection, {
				multiple: this.options.multiple
			});
		}

		this._selection = {
			attachments: new wp.media.model.Attachments(),
			difference: []
		};
	},

	/**
	 * Create the default states on the frame.
	 */
	createStates: function() {
		var options = this.options;

		if ( this.options.states ) {
			return;
		}

		// Add the default states.
		this.states.add([
			// Main states.
			new wp.media.controller.Library({
				library:   wp.media.query( options.library ),
				multiple:  options.multiple,
				title:     options.title,
				priority:  20
			})
		]);
	},

	/**
	 * Bind region mode event callbacks.
	 *
	 * @see media.controller.Region.render
	 */
	bindHandlers: function() {
		this.on( 'router:create:browse', this.createRouter, this );
		this.on( 'router:render:browse', this.browseRouter, this );
		this.on( 'content:create:browse', this.browseContent, this );
		this.on( 'content:render:upload', this.uploadContent, this );
		this.on( 'toolbar:create:select', this.createSelectToolbar, this );
	},

	/**
	 * Render callback for the router region in the `browse` mode.
	 *
	 * @param {wp.media.view.Router} routerView
	 */
	browseRouter: function( routerView ) {
		routerView.set({
			upload: {
				text:     l10n.uploadFilesTitle,
				priority: 20
			},
			browse: {
				text:     l10n.mediaLibraryTitle,
				priority: 40
			}
		});
	},

	/**
	 * Render callback for the content region in the `browse` mode.
	 *
	 * @param {wp.media.controller.Region} contentRegion
	 */
	browseContent: function( contentRegion ) {
		var state = this.state();

		this.$el.removeClass('hide-toolbar');

		// Browse our library of attachments.
		contentRegion.view = new wp.media.view.AttachmentsBrowser({
			controller: this,
			collection: state.get('library'),
			selection:  state.get('selection'),
			model:      state,
			sortable:   state.get('sortable'),
			search:     state.get('searchable'),
			filters:    state.get('filterable'),
			date:       state.get('date'),
			display:    state.has('display') ? state.get('display') : state.get('displaySettings'),
			dragInfo:   state.get('dragInfo'),

			idealColumnWidth: state.get('idealColumnWidth'),
			suggestedWidth:   state.get('suggestedWidth'),
			suggestedHeight:  state.get('suggestedHeight'),

			AttachmentView: state.get('AttachmentView')
		});
	},

	/**
	 * Render callback for the content region in the `upload` mode.
	 */
	uploadContent: function() {
		this.$el.removeClass( 'hide-toolbar' );
		this.content.set( new wp.media.view.UploaderInline({
			controller: this
		}) );
	},

	/**
	 * Toolbars
	 *
	 * @param {Object} toolbar
	 * @param {Object} [options={}]
	 * @this wp.media.controller.Region
	 */
	createSelectToolbar: function( toolbar, options ) {
		options = options || this.options.button || {};
		options.controller = this;

		toolbar.view = new wp.media.view.Toolbar.Select( options );
	}
});

module.exports = Select;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/iframe.js":[function(require,module,exports){
/**
 * wp.media.view.Iframe
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Iframe = wp.media.View.extend({
	className: 'media-iframe',
	/**
	 * @returns {wp.media.view.Iframe} Returns itself to allow chaining
	 */
	render: function() {
		this.views.detach();
		this.$el.html( '<iframe src="' + this.controller.state().get('src') + '" />' );
		this.views.render();
		return this;
	}
});

module.exports = Iframe;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/image-details.js":[function(require,module,exports){
/*globals wp, _, jQuery */

/**
 * wp.media.view.ImageDetails
 *
 * @class
 * @augments wp.media.view.Settings.AttachmentDisplay
 * @augments wp.media.view.Settings
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var AttachmentDisplay = wp.media.view.Settings.AttachmentDisplay,
	$ = jQuery,
	ImageDetails;

ImageDetails = AttachmentDisplay.extend({
	className: 'image-details',
	template:  wp.template('image-details'),
	events: _.defaults( AttachmentDisplay.prototype.events, {
		'click .edit-attachment': 'editAttachment',
		'click .replace-attachment': 'replaceAttachment',
		'click .advanced-toggle': 'onToggleAdvanced',
		'change [data-setting="customWidth"]': 'onCustomSize',
		'change [data-setting="customHeight"]': 'onCustomSize',
		'keyup [data-setting="customWidth"]': 'onCustomSize',
		'keyup [data-setting="customHeight"]': 'onCustomSize'
	} ),
	initialize: function() {
		// used in AttachmentDisplay.prototype.updateLinkTo
		this.options.attachment = this.model.attachment;
		this.listenTo( this.model, 'change:url', this.updateUrl );
		this.listenTo( this.model, 'change:link', this.toggleLinkSettings );
		this.listenTo( this.model, 'change:size', this.toggleCustomSize );

		AttachmentDisplay.prototype.initialize.apply( this, arguments );
	},

	prepare: function() {
		var attachment = false;

		if ( this.model.attachment ) {
			attachment = this.model.attachment.toJSON();
		}
		return _.defaults({
			model: this.model.toJSON(),
			attachment: attachment
		}, this.options );
	},

	render: function() {
		var args = arguments;

		if ( this.model.attachment && 'pending' === this.model.dfd.state() ) {
			this.model.dfd
				.done( _.bind( function() {
					AttachmentDisplay.prototype.render.apply( this, args );
					this.postRender();
				}, this ) )
				.fail( _.bind( function() {
					this.model.attachment = false;
					AttachmentDisplay.prototype.render.apply( this, args );
					this.postRender();
				}, this ) );
		} else {
			AttachmentDisplay.prototype.render.apply( this, arguments );
			this.postRender();
		}

		return this;
	},

	postRender: function() {
		setTimeout( _.bind( this.resetFocus, this ), 10 );
		this.toggleLinkSettings();
		if ( window.getUserSetting( 'advImgDetails' ) === 'show' ) {
			this.toggleAdvanced( true );
		}
		this.trigger( 'post-render' );
	},

	resetFocus: function() {
		this.$( '.link-to-custom' ).blur();
		this.$( '.embed-media-settings' ).scrollTop( 0 );
	},

	updateUrl: function() {
		this.$( '.image img' ).attr( 'src', this.model.get( 'url' ) );
		this.$( '.url' ).val( this.model.get( 'url' ) );
	},

	toggleLinkSettings: function() {
		if ( this.model.get( 'link' ) === 'none' ) {
			this.$( '.link-settings' ).addClass('hidden');
		} else {
			this.$( '.link-settings' ).removeClass('hidden');
		}
	},

	toggleCustomSize: function() {
		if ( this.model.get( 'size' ) !== 'custom' ) {
			this.$( '.custom-size' ).addClass('hidden');
		} else {
			this.$( '.custom-size' ).removeClass('hidden');
		}
	},

	onCustomSize: function( event ) {
		var dimension = $( event.target ).data('setting'),
			num = $( event.target ).val(),
			value;

		// Ignore bogus input
		if ( ! /^\d+/.test( num ) || parseInt( num, 10 ) < 1 ) {
			event.preventDefault();
			return;
		}

		if ( dimension === 'customWidth' ) {
			value = Math.round( 1 / this.model.get( 'aspectRatio' ) * num );
			this.model.set( 'customHeight', value, { silent: true } );
			this.$( '[data-setting="customHeight"]' ).val( value );
		} else {
			value = Math.round( this.model.get( 'aspectRatio' ) * num );
			this.model.set( 'customWidth', value, { silent: true  } );
			this.$( '[data-setting="customWidth"]' ).val( value );
		}
	},

	onToggleAdvanced: function( event ) {
		event.preventDefault();
		this.toggleAdvanced();
	},

	toggleAdvanced: function( show ) {
		var $advanced = this.$el.find( '.advanced-section' ),
			mode;

		if ( $advanced.hasClass('advanced-visible') || show === false ) {
			$advanced.removeClass('advanced-visible');
			$advanced.find('.advanced-settings').addClass('hidden');
			mode = 'hide';
		} else {
			$advanced.addClass('advanced-visible');
			$advanced.find('.advanced-settings').removeClass('hidden');
			mode = 'show';
		}

		window.setUserSetting( 'advImgDetails', mode );
	},

	editAttachment: function( event ) {
		var editState = this.controller.states.get( 'edit-image' );

		if ( window.imageEdit && editState ) {
			event.preventDefault();
			editState.set( 'image', this.model.attachment );
			this.controller.setState( 'edit-image' );
		}
	},

	replaceAttachment: function( event ) {
		event.preventDefault();
		this.controller.setState( 'replace-image' );
	}
});

module.exports = ImageDetails;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/label.js":[function(require,module,exports){
/**
 * wp.media.view.Label
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Label = wp.media.View.extend({
	tagName: 'label',
	className: 'screen-reader-text',

	initialize: function() {
		this.value = this.options.value;
	},

	render: function() {
		this.$el.html( this.value );

		return this;
	}
});

module.exports = Label;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/media-frame.js":[function(require,module,exports){
/*globals wp, _, jQuery */

/**
 * wp.media.view.MediaFrame
 *
 * The frame used to create the media modal.
 *
 * @class
 * @augments wp.media.view.Frame
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 * @mixes wp.media.controller.StateMachine
 */
var Frame = wp.media.view.Frame,
	$ = jQuery,
	MediaFrame;

MediaFrame = Frame.extend({
	className: 'media-frame',
	template:  wp.template('media-frame'),
	regions:   ['menu','title','content','toolbar','router'],

	events: {
		'click div.media-frame-title h1': 'toggleMenu'
	},

	/**
	 * @global wp.Uploader
	 */
	initialize: function() {
		Frame.prototype.initialize.apply( this, arguments );

		_.defaults( this.options, {
			title:    '',
			modal:    true,
			uploader: true
		});

		// Ensure core UI is enabled.
		this.$el.addClass('wp-core-ui');

		// Initialize modal container view.
		if ( this.options.modal ) {
			this.modal = new wp.media.view.Modal({
				controller: this,
				title:      this.options.title
			});

			this.modal.content( this );
		}

		// Force the uploader off if the upload limit has been exceeded or
		// if the browser isn't supported.
		if ( wp.Uploader.limitExceeded || ! wp.Uploader.browser.supported ) {
			this.options.uploader = false;
		}

		// Initialize window-wide uploader.
		if ( this.options.uploader ) {
			this.uploader = new wp.media.view.UploaderWindow({
				controller: this,
				uploader: {
					dropzone:  this.modal ? this.modal.$el : this.$el,
					container: this.$el
				}
			});
			this.views.set( '.media-frame-uploader', this.uploader );
		}

		this.on( 'attach', _.bind( this.views.ready, this.views ), this );

		// Bind default title creation.
		this.on( 'title:create:default', this.createTitle, this );
		this.title.mode('default');

		this.on( 'title:render', function( view ) {
			view.$el.append( '<span class="dashicons dashicons-arrow-down"></span>' );
		});

		// Bind default menu.
		this.on( 'menu:create:default', this.createMenu, this );
	},
	/**
	 * @returns {wp.media.view.MediaFrame} Returns itself to allow chaining
	 */
	render: function() {
		// Activate the default state if no active state exists.
		if ( ! this.state() && this.options.state ) {
			this.setState( this.options.state );
		}
		/**
		 * call 'render' directly on the parent class
		 */
		return Frame.prototype.render.apply( this, arguments );
	},
	/**
	 * @param {Object} title
	 * @this wp.media.controller.Region
	 */
	createTitle: function( title ) {
		title.view = new wp.media.View({
			controller: this,
			tagName: 'h1'
		});
	},
	/**
	 * @param {Object} menu
	 * @this wp.media.controller.Region
	 */
	createMenu: function( menu ) {
		menu.view = new wp.media.view.Menu({
			controller: this
		});
	},

	toggleMenu: function() {
		this.$el.find( '.media-menu' ).toggleClass( 'visible' );
	},

	/**
	 * @param {Object} toolbar
	 * @this wp.media.controller.Region
	 */
	createToolbar: function( toolbar ) {
		toolbar.view = new wp.media.view.Toolbar({
			controller: this
		});
	},
	/**
	 * @param {Object} router
	 * @this wp.media.controller.Region
	 */
	createRouter: function( router ) {
		router.view = new wp.media.view.Router({
			controller: this
		});
	},
	/**
	 * @param {Object} options
	 */
	createIframeStates: function( options ) {
		var settings = wp.media.view.settings,
			tabs = settings.tabs,
			tabUrl = settings.tabUrl,
			$postId;

		if ( ! tabs || ! tabUrl ) {
			return;
		}

		// Add the post ID to the tab URL if it exists.
		$postId = $('#post_ID');
		if ( $postId.length ) {
			tabUrl += '&post_id=' + $postId.val();
		}

		// Generate the tab states.
		_.each( tabs, function( title, id ) {
			this.state( 'iframe:' + id ).set( _.defaults({
				tab:     id,
				src:     tabUrl + '&tab=' + id,
				title:   title,
				content: 'iframe',
				menu:    'default'
			}, options ) );
		}, this );

		this.on( 'content:create:iframe', this.iframeContent, this );
		this.on( 'content:deactivate:iframe', this.iframeContentCleanup, this );
		this.on( 'menu:render:default', this.iframeMenu, this );
		this.on( 'open', this.hijackThickbox, this );
		this.on( 'close', this.restoreThickbox, this );
	},

	/**
	 * @param {Object} content
	 * @this wp.media.controller.Region
	 */
	iframeContent: function( content ) {
		this.$el.addClass('hide-toolbar');
		content.view = new wp.media.view.Iframe({
			controller: this
		});
	},

	iframeContentCleanup: function() {
		this.$el.removeClass('hide-toolbar');
	},

	iframeMenu: function( view ) {
		var views = {};

		if ( ! view ) {
			return;
		}

		_.each( wp.media.view.settings.tabs, function( title, id ) {
			views[ 'iframe:' + id ] = {
				text: this.state( 'iframe:' + id ).get('title'),
				priority: 200
			};
		}, this );

		view.set( views );
	},

	hijackThickbox: function() {
		var frame = this;

		if ( ! window.tb_remove || this._tb_remove ) {
			return;
		}

		this._tb_remove = window.tb_remove;
		window.tb_remove = function() {
			frame.close();
			frame.reset();
			frame.setState( frame.options.state );
			frame._tb_remove.call( window );
		};
	},

	restoreThickbox: function() {
		if ( ! this._tb_remove ) {
			return;
		}

		window.tb_remove = this._tb_remove;
		delete this._tb_remove;
	}
});

// Map some of the modal's methods to the frame.
_.each(['open','close','attach','detach','escape'], function( method ) {
	/**
	 * @returns {wp.media.view.MediaFrame} Returns itself to allow chaining
	 */
	MediaFrame.prototype[ method ] = function() {
		if ( this.modal ) {
			this.modal[ method ].apply( this.modal, arguments );
		}
		return this;
	};
});

module.exports = MediaFrame;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/menu-item.js":[function(require,module,exports){
/*globals jQuery */

/**
 * wp.media.view.MenuItem
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var $ = jQuery,
	MenuItem;

MenuItem = wp.media.View.extend({
	tagName:   'a',
	className: 'media-menu-item',

	attributes: {
		href: '#'
	},

	events: {
		'click': '_click'
	},
	/**
	 * @param {Object} event
	 */
	_click: function( event ) {
		var clickOverride = this.options.click;

		if ( event ) {
			event.preventDefault();
		}

		if ( clickOverride ) {
			clickOverride.call( this );
		} else {
			this.click();
		}

		// When selecting a tab along the left side,
		// focus should be transferred into the main panel
		if ( ! wp.media.isTouchDevice ) {
			$('.media-frame-content input').first().focus();
		}
	},

	click: function() {
		var state = this.options.state;

		if ( state ) {
			this.controller.setState( state );
			this.views.parent.$el.removeClass( 'visible' ); // TODO: or hide on any click, see below
		}
	},
	/**
	 * @returns {wp.media.view.MenuItem} returns itself to allow chaining
	 */
	render: function() {
		var options = this.options;

		if ( options.text ) {
			this.$el.text( options.text );
		} else if ( options.html ) {
			this.$el.html( options.html );
		}

		return this;
	}
});

module.exports = MenuItem;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/menu.js":[function(require,module,exports){
/**
 * wp.media.view.Menu
 *
 * @class
 * @augments wp.media.view.PriorityList
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var MenuItem = wp.media.view.MenuItem,
	PriorityList = wp.media.view.PriorityList,
	Menu;

Menu = PriorityList.extend({
	tagName:   'div',
	className: 'media-menu',
	property:  'state',
	ItemView:  MenuItem,
	region:    'menu',

	/* TODO: alternatively hide on any click anywhere
	events: {
		'click': 'click'
	},

	click: function() {
		this.$el.removeClass( 'visible' );
	},
	*/

	/**
	 * @param {Object} options
	 * @param {string} id
	 * @returns {wp.media.View}
	 */
	toView: function( options, id ) {
		options = options || {};
		options[ this.property ] = options[ this.property ] || id;
		return new this.ItemView( options ).render();
	},

	ready: function() {
		/**
		 * call 'ready' directly on the parent class
		 */
		PriorityList.prototype.ready.apply( this, arguments );
		this.visibility();
	},

	set: function() {
		/**
		 * call 'set' directly on the parent class
		 */
		PriorityList.prototype.set.apply( this, arguments );
		this.visibility();
	},

	unset: function() {
		/**
		 * call 'unset' directly on the parent class
		 */
		PriorityList.prototype.unset.apply( this, arguments );
		this.visibility();
	},

	visibility: function() {
		var region = this.region,
			view = this.controller[ region ].get(),
			views = this.views.get(),
			hide = ! views || views.length < 2;

		if ( this === view ) {
			this.controller.$el.toggleClass( 'hide-' + region, hide );
		}
	},
	/**
	 * @param {string} id
	 */
	select: function( id ) {
		var view = this.get( id );

		if ( ! view ) {
			return;
		}

		this.deselect();
		view.$el.addClass('active');
	},

	deselect: function() {
		this.$el.children().removeClass('active');
	},

	hide: function( id ) {
		var view = this.get( id );

		if ( ! view ) {
			return;
		}

		view.$el.addClass('hidden');
	},

	show: function( id ) {
		var view = this.get( id );

		if ( ! view ) {
			return;
		}

		view.$el.removeClass('hidden');
	}
});

module.exports = Menu;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/modal.js":[function(require,module,exports){
/*globals wp, _, jQuery */

/**
 * wp.media.view.Modal
 *
 * A modal view, which the media modal uses as its default container.
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var $ = jQuery,
	Modal;

Modal = wp.media.View.extend({
	tagName:  'div',
	template: wp.template('media-modal'),

	attributes: {
		tabindex: 0
	},

	events: {
		'click .media-modal-backdrop, .media-modal-close': 'escapeHandler',
		'keydown': 'keydown'
	},

	initialize: function() {
		_.defaults( this.options, {
			container: document.body,
			title:     '',
			propagate: true,
			freeze:    true
		});

		this.focusManager = new wp.media.view.FocusManager({
			el: this.el
		});
	},
	/**
	 * @returns {Object}
	 */
	prepare: function() {
		return {
			title: this.options.title
		};
	},

	/**
	 * @returns {wp.media.view.Modal} Returns itself to allow chaining
	 */
	attach: function() {
		if ( this.views.attached ) {
			return this;
		}

		if ( ! this.views.rendered ) {
			this.render();
		}

		this.$el.appendTo( this.options.container );

		// Manually mark the view as attached and trigger ready.
		this.views.attached = true;
		this.views.ready();

		return this.propagate('attach');
	},

	/**
	 * @returns {wp.media.view.Modal} Returns itself to allow chaining
	 */
	detach: function() {
		if ( this.$el.is(':visible') ) {
			this.close();
		}

		this.$el.detach();
		this.views.attached = false;
		return this.propagate('detach');
	},

	/**
	 * @returns {wp.media.view.Modal} Returns itself to allow chaining
	 */
	open: function() {
		var $el = this.$el,
			options = this.options,
			mceEditor;

		if ( $el.is(':visible') ) {
			return this;
		}

		if ( ! this.views.attached ) {
			this.attach();
		}

		// If the `freeze` option is set, record the window's scroll position.
		if ( options.freeze ) {
			this._freeze = {
				scrollTop: $( window ).scrollTop()
			};
		}

		// Disable page scrolling.
		$( 'body' ).addClass( 'modal-open' );

		$el.show();

		// Try to close the onscreen keyboard
		if ( 'ontouchend' in document ) {
			if ( ( mceEditor = window.tinymce && window.tinymce.activeEditor )  && ! mceEditor.isHidden() && mceEditor.iframeElement ) {
				mceEditor.iframeElement.focus();
				mceEditor.iframeElement.blur();

				setTimeout( function() {
					mceEditor.iframeElement.blur();
				}, 100 );
			}
		}

		this.$el.focus();

		return this.propagate('open');
	},

	/**
	 * @param {Object} options
	 * @returns {wp.media.view.Modal} Returns itself to allow chaining
	 */
	close: function( options ) {
		var freeze = this._freeze;

		if ( ! this.views.attached || ! this.$el.is(':visible') ) {
			return this;
		}

		// Enable page scrolling.
		$( 'body' ).removeClass( 'modal-open' );

		// Hide modal and remove restricted media modal tab focus once it's closed
		this.$el.hide().undelegate( 'keydown' );

		// Put focus back in useful location once modal is closed
		$('#wpbody-content').focus();

		this.propagate('close');

		// If the `freeze` option is set, restore the container's scroll position.
		if ( freeze ) {
			$( window ).scrollTop( freeze.scrollTop );
		}

		if ( options && options.escape ) {
			this.propagate('escape');
		}

		return this;
	},
	/**
	 * @returns {wp.media.view.Modal} Returns itself to allow chaining
	 */
	escape: function() {
		return this.close({ escape: true });
	},
	/**
	 * @param {Object} event
	 */
	escapeHandler: function( event ) {
		event.preventDefault();
		this.escape();
	},

	/**
	 * @param {Array|Object} content Views to register to '.media-modal-content'
	 * @returns {wp.media.view.Modal} Returns itself to allow chaining
	 */
	content: function( content ) {
		this.views.set( '.media-modal-content', content );
		return this;
	},

	/**
	 * Triggers a modal event and if the `propagate` option is set,
	 * forwards events to the modal's controller.
	 *
	 * @param {string} id
	 * @returns {wp.media.view.Modal} Returns itself to allow chaining
	 */
	propagate: function( id ) {
		this.trigger( id );

		if ( this.options.propagate ) {
			this.controller.trigger( id );
		}

		return this;
	},
	/**
	 * @param {Object} event
	 */
	keydown: function( event ) {
		// Close the modal when escape is pressed.
		if ( 27 === event.which && this.$el.is(':visible') ) {
			this.escape();
			event.stopImmediatePropagation();
		}
	}
});

module.exports = Modal;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/priority-list.js":[function(require,module,exports){
/*globals _, Backbone */

/**
 * wp.media.view.PriorityList
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var PriorityList = wp.media.View.extend({
	tagName:   'div',

	initialize: function() {
		this._views = {};

		this.set( _.extend( {}, this._views, this.options.views ), { silent: true });
		delete this.options.views;

		if ( ! this.options.silent ) {
			this.render();
		}
	},
	/**
	 * @param {string} id
	 * @param {wp.media.View|Object} view
	 * @param {Object} options
	 * @returns {wp.media.view.PriorityList} Returns itself to allow chaining
	 */
	set: function( id, view, options ) {
		var priority, views, index;

		options = options || {};

		// Accept an object with an `id` : `view` mapping.
		if ( _.isObject( id ) ) {
			_.each( id, function( view, id ) {
				this.set( id, view );
			}, this );
			return this;
		}

		if ( ! (view instanceof Backbone.View) ) {
			view = this.toView( view, id, options );
		}
		view.controller = view.controller || this.controller;

		this.unset( id );

		priority = view.options.priority || 10;
		views = this.views.get() || [];

		_.find( views, function( existing, i ) {
			if ( existing.options.priority > priority ) {
				index = i;
				return true;
			}
		});

		this._views[ id ] = view;
		this.views.add( view, {
			at: _.isNumber( index ) ? index : views.length || 0
		});

		return this;
	},
	/**
	 * @param {string} id
	 * @returns {wp.media.View}
	 */
	get: function( id ) {
		return this._views[ id ];
	},
	/**
	 * @param {string} id
	 * @returns {wp.media.view.PriorityList}
	 */
	unset: function( id ) {
		var view = this.get( id );

		if ( view ) {
			view.remove();
		}

		delete this._views[ id ];
		return this;
	},
	/**
	 * @param {Object} options
	 * @returns {wp.media.View}
	 */
	toView: function( options ) {
		return new wp.media.View( options );
	}
});

module.exports = PriorityList;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/router-item.js":[function(require,module,exports){
/**
 * wp.media.view.RouterItem
 *
 * @class
 * @augments wp.media.view.MenuItem
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var RouterItem = wp.media.view.MenuItem.extend({
	/**
	 * On click handler to activate the content region's corresponding mode.
	 */
	click: function() {
		var contentMode = this.options.contentMode;
		if ( contentMode ) {
			this.controller.content.mode( contentMode );
		}
	}
});

module.exports = RouterItem;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/router.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.Router
 *
 * @class
 * @augments wp.media.view.Menu
 * @augments wp.media.view.PriorityList
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Menu = wp.media.view.Menu,
	Router;

Router = Menu.extend({
	tagName:   'div',
	className: 'media-router',
	property:  'contentMode',
	ItemView:  wp.media.view.RouterItem,
	region:    'router',

	initialize: function() {
		this.controller.on( 'content:render', this.update, this );
		// Call 'initialize' directly on the parent class.
		Menu.prototype.initialize.apply( this, arguments );
	},

	update: function() {
		var mode = this.controller.content.mode();
		if ( mode ) {
			this.select( mode );
		}
	}
});

module.exports = Router;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/search.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.Search
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var l10n = wp.media.view.l10n,
	Search;

Search = wp.media.View.extend({
	tagName:   'input',
	className: 'search',
	id:        'media-search-input',

	attributes: {
		type:        'search',
		placeholder: l10n.search
	},

	events: {
		'input':  'search',
		'keyup':  'search',
		'change': 'search',
		'search': 'search'
	},

	/**
	 * @returns {wp.media.view.Search} Returns itself to allow chaining
	 */
	render: function() {
		this.el.value = this.model.escape('search');
		return this;
	},

	search: function( event ) {
		if ( event.target.value ) {
			this.model.set( 'search', event.target.value );
		} else {
			this.model.unset('search');
		}
	}
});

module.exports = Search;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/selection.js":[function(require,module,exports){
/*globals wp, _, Backbone */

/**
 * wp.media.view.Selection
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var l10n = wp.media.view.l10n,
	Selection;

Selection = wp.media.View.extend({
	tagName:   'div',
	className: 'media-selection',
	template:  wp.template('media-selection'),

	events: {
		'click .edit-selection':  'edit',
		'click .clear-selection': 'clear'
	},

	initialize: function() {
		_.defaults( this.options, {
			editable:  false,
			clearable: true
		});

		/**
		 * @member {wp.media.view.Attachments.Selection}
		 */
		this.attachments = new wp.media.view.Attachments.Selection({
			controller: this.controller,
			collection: this.collection,
			selection:  this.collection,
			model:      new Backbone.Model()
		});

		this.views.set( '.selection-view', this.attachments );
		this.collection.on( 'add remove reset', this.refresh, this );
		this.controller.on( 'content:activate', this.refresh, this );
	},

	ready: function() {
		this.refresh();
	},

	refresh: function() {
		// If the selection hasn't been rendered, bail.
		if ( ! this.$el.children().length ) {
			return;
		}

		var collection = this.collection,
			editing = 'edit-selection' === this.controller.content.mode();

		// If nothing is selected, display nothing.
		this.$el.toggleClass( 'empty', ! collection.length );
		this.$el.toggleClass( 'one', 1 === collection.length );
		this.$el.toggleClass( 'editing', editing );

		this.$('.count').text( l10n.selected.replace('%d', collection.length) );
	},

	edit: function( event ) {
		event.preventDefault();
		if ( this.options.editable ) {
			this.options.editable.call( this, this.collection );
		}
	},

	clear: function( event ) {
		event.preventDefault();
		this.collection.reset();

		// Keep focus inside media modal
		// after clear link is selected
		this.controller.modal.focusManager.focus();
	}
});

module.exports = Selection;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/settings.js":[function(require,module,exports){
/*globals _, Backbone */

/**
 * wp.media.view.Settings
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	$ = Backbone.$,
	Settings;

Settings = View.extend({
	events: {
		'click button':    'updateHandler',
		'change input':    'updateHandler',
		'change select':   'updateHandler',
		'change textarea': 'updateHandler'
	},

	initialize: function() {
		this.model = this.model || new Backbone.Model();
		this.listenTo( this.model, 'change', this.updateChanges );
	},

	prepare: function() {
		return _.defaults({
			model: this.model.toJSON()
		}, this.options );
	},
	/**
	 * @returns {wp.media.view.Settings} Returns itself to allow chaining
	 */
	render: function() {
		View.prototype.render.apply( this, arguments );
		// Select the correct values.
		_( this.model.attributes ).chain().keys().each( this.update, this );
		return this;
	},
	/**
	 * @param {string} key
	 */
	update: function( key ) {
		var value = this.model.get( key ),
			$setting = this.$('[data-setting="' + key + '"]'),
			$buttons, $value;

		// Bail if we didn't find a matching setting.
		if ( ! $setting.length ) {
			return;
		}

		// Attempt to determine how the setting is rendered and update
		// the selected value.

		// Handle dropdowns.
		if ( $setting.is('select') ) {
			$value = $setting.find('[value="' + value + '"]');

			if ( $value.length ) {
				$setting.find('option').prop( 'selected', false );
				$value.prop( 'selected', true );
			} else {
				// If we can't find the desired value, record what *is* selected.
				this.model.set( key, $setting.find(':selected').val() );
			}

		// Handle button groups.
		} else if ( $setting.hasClass('button-group') ) {
			$buttons = $setting.find('button').removeClass('active');
			$buttons.filter( '[value="' + value + '"]' ).addClass('active');

		// Handle text inputs and textareas.
		} else if ( $setting.is('input[type="text"], textarea') ) {
			if ( ! $setting.is(':focus') ) {
				$setting.val( value );
			}
		// Handle checkboxes.
		} else if ( $setting.is('input[type="checkbox"]') ) {
			$setting.prop( 'checked', !! value && 'false' !== value );
		}
	},
	/**
	 * @param {Object} event
	 */
	updateHandler: function( event ) {
		var $setting = $( event.target ).closest('[data-setting]'),
			value = event.target.value,
			userSetting;

		event.preventDefault();

		if ( ! $setting.length ) {
			return;
		}

		// Use the correct value for checkboxes.
		if ( $setting.is('input[type="checkbox"]') ) {
			value = $setting[0].checked;
		}

		// Update the corresponding setting.
		this.model.set( $setting.data('setting'), value );

		// If the setting has a corresponding user setting,
		// update that as well.
		if ( userSetting = $setting.data('userSetting') ) {
			window.setUserSetting( userSetting, value );
		}
	},

	updateChanges: function( model ) {
		if ( model.hasChanged() ) {
			_( model.changed ).chain().keys().each( this.update, this );
		}
	}
});

module.exports = Settings;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/settings/attachment-display.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.view.Settings.AttachmentDisplay
 *
 * @class
 * @augments wp.media.view.Settings
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Settings = wp.media.view.Settings,
	AttachmentDisplay;

AttachmentDisplay = Settings.extend({
	className: 'attachment-display-settings',
	template:  wp.template('attachment-display-settings'),

	initialize: function() {
		var attachment = this.options.attachment;

		_.defaults( this.options, {
			userSettings: false
		});
		// Call 'initialize' directly on the parent class.
		Settings.prototype.initialize.apply( this, arguments );
		this.listenTo( this.model, 'change:link', this.updateLinkTo );

		if ( attachment ) {
			attachment.on( 'change:uploading', this.render, this );
		}
	},

	dispose: function() {
		var attachment = this.options.attachment;
		if ( attachment ) {
			attachment.off( null, null, this );
		}
		/**
		 * call 'dispose' directly on the parent class
		 */
		Settings.prototype.dispose.apply( this, arguments );
	},
	/**
	 * @returns {wp.media.view.AttachmentDisplay} Returns itself to allow chaining
	 */
	render: function() {
		var attachment = this.options.attachment;
		if ( attachment ) {
			_.extend( this.options, {
				sizes: attachment.get('sizes'),
				type:  attachment.get('type')
			});
		}
		/**
		 * call 'render' directly on the parent class
		 */
		Settings.prototype.render.call( this );
		this.updateLinkTo();
		return this;
	},

	updateLinkTo: function() {
		var linkTo = this.model.get('link'),
			$input = this.$('.link-to-custom'),
			attachment = this.options.attachment;

		if ( 'none' === linkTo || 'embed' === linkTo || ( ! attachment && 'custom' !== linkTo ) ) {
			$input.addClass( 'hidden' );
			return;
		}

		if ( attachment ) {
			if ( 'post' === linkTo ) {
				$input.val( attachment.get('link') );
			} else if ( 'file' === linkTo ) {
				$input.val( attachment.get('url') );
			} else if ( ! this.model.get('linkUrl') ) {
				$input.val('http://');
			}

			$input.prop( 'readonly', 'custom' !== linkTo );
		}

		$input.removeClass( 'hidden' );

		// If the input is visible, focus and select its contents.
		if ( ! wp.media.isTouchDevice && $input.is(':visible') ) {
			$input.focus()[0].select();
		}
	}
});

module.exports = AttachmentDisplay;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/settings/gallery.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.Settings.Gallery
 *
 * @class
 * @augments wp.media.view.Settings
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Gallery = wp.media.view.Settings.extend({
	className: 'collection-settings gallery-settings',
	template:  wp.template('gallery-settings')
});

module.exports = Gallery;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/settings/playlist.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.Settings.Playlist
 *
 * @class
 * @augments wp.media.view.Settings
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Playlist = wp.media.view.Settings.extend({
	className: 'collection-settings playlist-settings',
	template:  wp.template('playlist-settings')
});

module.exports = Playlist;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/sidebar.js":[function(require,module,exports){
/**
 * wp.media.view.Sidebar
 *
 * @class
 * @augments wp.media.view.PriorityList
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Sidebar = wp.media.view.PriorityList.extend({
	className: 'media-sidebar'
});

module.exports = Sidebar;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/spinner.js":[function(require,module,exports){
/*globals _ */

/**
 * wp.media.view.Spinner
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Spinner = wp.media.View.extend({
	tagName:   'span',
	className: 'spinner',
	spinnerTimeout: false,
	delay: 400,

	show: function() {
		if ( ! this.spinnerTimeout ) {
			this.spinnerTimeout = _.delay(function( $el ) {
				$el.addClass( 'is-active' );
			}, this.delay, this.$el );
		}

		return this;
	},

	hide: function() {
		this.$el.removeClass( 'is-active' );
		this.spinnerTimeout = clearTimeout( this.spinnerTimeout );

		return this;
	}
});

module.exports = Spinner;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/toolbar.js":[function(require,module,exports){
/*globals _, Backbone */

/**
 * wp.media.view.Toolbar
 *
 * A toolbar which consists of a primary and a secondary section. Each sections
 * can be filled with views.
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	Toolbar;

Toolbar = View.extend({
	tagName:   'div',
	className: 'media-toolbar',

	initialize: function() {
		var state = this.controller.state(),
			selection = this.selection = state.get('selection'),
			library = this.library = state.get('library');

		this._views = {};

		// The toolbar is composed of two `PriorityList` views.
		this.primary   = new wp.media.view.PriorityList();
		this.secondary = new wp.media.view.PriorityList();
		this.primary.$el.addClass('media-toolbar-primary search-form');
		this.secondary.$el.addClass('media-toolbar-secondary');

		this.views.set([ this.secondary, this.primary ]);

		if ( this.options.items ) {
			this.set( this.options.items, { silent: true });
		}

		if ( ! this.options.silent ) {
			this.render();
		}

		if ( selection ) {
			selection.on( 'add remove reset', this.refresh, this );
		}

		if ( library ) {
			library.on( 'add remove reset', this.refresh, this );
		}
	},
	/**
	 * @returns {wp.media.view.Toolbar} Returns itsef to allow chaining
	 */
	dispose: function() {
		if ( this.selection ) {
			this.selection.off( null, null, this );
		}

		if ( this.library ) {
			this.library.off( null, null, this );
		}
		/**
		 * call 'dispose' directly on the parent class
		 */
		return View.prototype.dispose.apply( this, arguments );
	},

	ready: function() {
		this.refresh();
	},

	/**
	 * @param {string} id
	 * @param {Backbone.View|Object} view
	 * @param {Object} [options={}]
	 * @returns {wp.media.view.Toolbar} Returns itself to allow chaining
	 */
	set: function( id, view, options ) {
		var list;
		options = options || {};

		// Accept an object with an `id` : `view` mapping.
		if ( _.isObject( id ) ) {
			_.each( id, function( view, id ) {
				this.set( id, view, { silent: true });
			}, this );

		} else {
			if ( ! ( view instanceof Backbone.View ) ) {
				view.classes = [ 'media-button-' + id ].concat( view.classes || [] );
				view = new wp.media.view.Button( view ).render();
			}

			view.controller = view.controller || this.controller;

			this._views[ id ] = view;

			list = view.options.priority < 0 ? 'secondary' : 'primary';
			this[ list ].set( id, view, options );
		}

		if ( ! options.silent ) {
			this.refresh();
		}

		return this;
	},
	/**
	 * @param {string} id
	 * @returns {wp.media.view.Button}
	 */
	get: function( id ) {
		return this._views[ id ];
	},
	/**
	 * @param {string} id
	 * @param {Object} options
	 * @returns {wp.media.view.Toolbar} Returns itself to allow chaining
	 */
	unset: function( id, options ) {
		delete this._views[ id ];
		this.primary.unset( id, options );
		this.secondary.unset( id, options );

		if ( ! options || ! options.silent ) {
			this.refresh();
		}
		return this;
	},

	refresh: function() {
		var state = this.controller.state(),
			library = state.get('library'),
			selection = state.get('selection');

		_.each( this._views, function( button ) {
			if ( ! button.model || ! button.options || ! button.options.requires ) {
				return;
			}

			var requires = button.options.requires,
				disabled = false;

			// Prevent insertion of attachments if any of them are still uploading
			disabled = _.some( selection.models, function( attachment ) {
				return attachment.get('uploading') === true;
			});

			if ( requires.selection && selection && ! selection.length ) {
				disabled = true;
			} else if ( requires.library && library && ! library.length ) {
				disabled = true;
			}
			button.model.set( 'disabled', disabled );
		});
	}
});

module.exports = Toolbar;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/toolbar/embed.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.view.Toolbar.Embed
 *
 * @class
 * @augments wp.media.view.Toolbar.Select
 * @augments wp.media.view.Toolbar
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Select = wp.media.view.Toolbar.Select,
	l10n = wp.media.view.l10n,
	Embed;

Embed = Select.extend({
	initialize: function() {
		_.defaults( this.options, {
			text: l10n.insertIntoPost,
			requires: false
		});
		// Call 'initialize' directly on the parent class.
		Select.prototype.initialize.apply( this, arguments );
	},

	refresh: function() {
		var url = this.controller.state().props.get('url');
		this.get('select').model.set( 'disabled', ! url || url === 'http://' );
		/**
		 * call 'refresh' directly on the parent class
		 */
		Select.prototype.refresh.apply( this, arguments );
	}
});

module.exports = Embed;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/toolbar/select.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.view.Toolbar.Select
 *
 * @class
 * @augments wp.media.view.Toolbar
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Toolbar = wp.media.view.Toolbar,
	l10n = wp.media.view.l10n,
	Select;

Select = Toolbar.extend({
	initialize: function() {
		var options = this.options;

		_.bindAll( this, 'clickSelect' );

		_.defaults( options, {
			event: 'select',
			state: false,
			reset: true,
			close: true,
			text:  l10n.select,

			// Does the button rely on the selection?
			requires: {
				selection: true
			}
		});

		options.items = _.defaults( options.items || {}, {
			select: {
				style:    'primary',
				text:     options.text,
				priority: 80,
				click:    this.clickSelect,
				requires: options.requires
			}
		});
		// Call 'initialize' directly on the parent class.
		Toolbar.prototype.initialize.apply( this, arguments );
	},

	clickSelect: function() {
		var options = this.options,
			controller = this.controller;

		if ( options.close ) {
			controller.close();
		}

		if ( options.event ) {
			controller.state().trigger( options.event );
		}

		if ( options.state ) {
			controller.setState( options.state );
		}

		if ( options.reset ) {
			controller.reset();
		}
	}
});

module.exports = Select;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/uploader/editor.js":[function(require,module,exports){
/*globals wp, _, jQuery */

/**
 * Creates a dropzone on WP editor instances (elements with .wp-editor-wrap
 * or #wp-fullscreen-body) and relays drag'n'dropped files to a media workflow.
 *
 * wp.media.view.EditorUploader
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	l10n = wp.media.view.l10n,
	$ = jQuery,
	EditorUploader;

EditorUploader = View.extend({
	tagName:   'div',
	className: 'uploader-editor',
	template:  wp.template( 'uploader-editor' ),

	localDrag: false,
	overContainer: false,
	overDropzone: false,
	draggingFile: null,

	/**
	 * Bind drag'n'drop events to callbacks.
	 */
	initialize: function() {
		this.initialized = false;

		// Bail if not enabled or UA does not support drag'n'drop or File API.
		if ( ! window.tinyMCEPreInit || ! window.tinyMCEPreInit.dragDropUpload || ! this.browserSupport() ) {
			return this;
		}

		this.$document = $(document);
		this.dropzones = [];
		this.files = [];

		this.$document.on( 'drop', '.uploader-editor', _.bind( this.drop, this ) );
		this.$document.on( 'dragover', '.uploader-editor', _.bind( this.dropzoneDragover, this ) );
		this.$document.on( 'dragleave', '.uploader-editor', _.bind( this.dropzoneDragleave, this ) );
		this.$document.on( 'click', '.uploader-editor', _.bind( this.click, this ) );

		this.$document.on( 'dragover', _.bind( this.containerDragover, this ) );
		this.$document.on( 'dragleave', _.bind( this.containerDragleave, this ) );

		this.$document.on( 'dragstart dragend drop', _.bind( function( event ) {
			this.localDrag = event.type === 'dragstart';
		}, this ) );

		this.initialized = true;
		return this;
	},

	/**
	 * Check browser support for drag'n'drop.
	 *
	 * @return Boolean
	 */
	browserSupport: function() {
		var supports = false, div = document.createElement('div');

		supports = ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div );
		supports = supports && !! ( window.File && window.FileList && window.FileReader );
		return supports;
	},

	isDraggingFile: function( event ) {
		if ( this.draggingFile !== null ) {
			return this.draggingFile;
		}

		if ( _.isUndefined( event.originalEvent ) || _.isUndefined( event.originalEvent.dataTransfer ) ) {
			return false;
		}

		this.draggingFile = _.indexOf( event.originalEvent.dataTransfer.types, 'Files' ) > -1 &&
			_.indexOf( event.originalEvent.dataTransfer.types, 'text/plain' ) === -1;

		return this.draggingFile;
	},

	refresh: function( e ) {
		var dropzone_id;
		for ( dropzone_id in this.dropzones ) {
			// Hide the dropzones only if dragging has left the screen.
			this.dropzones[ dropzone_id ].toggle( this.overContainer || this.overDropzone );
		}

		if ( ! _.isUndefined( e ) ) {
			$( e.target ).closest( '.uploader-editor' ).toggleClass( 'droppable', this.overDropzone );
		}

		if ( ! this.overContainer && ! this.overDropzone ) {
			this.draggingFile = null;
		}

		return this;
	},

	render: function() {
		if ( ! this.initialized ) {
			return this;
		}

		View.prototype.render.apply( this, arguments );
		$( '.wp-editor-wrap, #wp-fullscreen-body' ).each( _.bind( this.attach, this ) );
		return this;
	},

	attach: function( index, editor ) {
		// Attach a dropzone to an editor.
		var dropzone = this.$el.clone();
		this.dropzones.push( dropzone );
		$( editor ).append( dropzone );
		return this;
	},

	/**
	 * When a file is dropped on the editor uploader, open up an editor media workflow
	 * and upload the file immediately.
	 *
	 * @param  {jQuery.Event} event The 'drop' event.
	 */
	drop: function( event ) {
		var $wrap = null, uploadView;

		this.containerDragleave( event );
		this.dropzoneDragleave( event );

		this.files = event.originalEvent.dataTransfer.files;
		if ( this.files.length < 1 ) {
			return;
		}

		// Set the active editor to the drop target.
		$wrap = $( event.target ).parents( '.wp-editor-wrap' );
		if ( $wrap.length > 0 && $wrap[0].id ) {
			window.wpActiveEditor = $wrap[0].id.slice( 3, -5 );
		}

		if ( ! this.workflow ) {
			this.workflow = wp.media.editor.open( 'content', {
				frame:    'post',
				state:    'insert',
				title:    l10n.addMedia,
				multiple: true
			});
			uploadView = this.workflow.uploader;
			if ( uploadView.uploader && uploadView.uploader.ready ) {
				this.addFiles.apply( this );
			} else {
				this.workflow.on( 'uploader:ready', this.addFiles, this );
			}
		} else {
			this.workflow.state().reset();
			this.addFiles.apply( this );
			this.workflow.open();
		}

		return false;
	},

	/**
	 * Add the files to the uploader.
	 */
	addFiles: function() {
		if ( this.files.length ) {
			this.workflow.uploader.uploader.uploader.addFile( _.toArray( this.files ) );
			this.files = [];
		}
		return this;
	},

	containerDragover: function( event ) {
		if ( this.localDrag || ! this.isDraggingFile( event ) ) {
			return;
		}

		this.overContainer = true;
		this.refresh();
	},

	containerDragleave: function() {
		this.overContainer = false;

		// Throttle dragleave because it's called when bouncing from some elements to others.
		_.delay( _.bind( this.refresh, this ), 50 );
	},

	dropzoneDragover: function( event ) {
		if ( this.localDrag || ! this.isDraggingFile( event ) ) {
			return;
		}

		this.overDropzone = true;
		this.refresh( event );
		return false;
	},

	dropzoneDragleave: function( e ) {
		this.overDropzone = false;
		_.delay( _.bind( this.refresh, this, e ), 50 );
	},

	click: function( e ) {
		// In the rare case where the dropzone gets stuck, hide it on click.
		this.containerDragleave( e );
		this.dropzoneDragleave( e );
		this.localDrag = false;
	}
});

module.exports = EditorUploader;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/uploader/inline.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.view.UploaderInline
 *
 * The inline uploader that shows up in the 'Upload Files' tab.
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	UploaderInline;

UploaderInline = View.extend({
	tagName:   'div',
	className: 'uploader-inline',
	template:  wp.template('uploader-inline'),

	events: {
		'click .close': 'hide'
	},

	initialize: function() {
		_.defaults( this.options, {
			message: '',
			status:  true,
			canClose: false
		});

		if ( ! this.options.$browser && this.controller.uploader ) {
			this.options.$browser = this.controller.uploader.$browser;
		}

		if ( _.isUndefined( this.options.postId ) ) {
			this.options.postId = wp.media.view.settings.post.id;
		}

		if ( this.options.status ) {
			this.views.set( '.upload-inline-status', new wp.media.view.UploaderStatus({
				controller: this.controller
			}) );
		}
	},

	prepare: function() {
		var suggestedWidth = this.controller.state().get('suggestedWidth'),
			suggestedHeight = this.controller.state().get('suggestedHeight'),
			data = {};

		data.message = this.options.message;
		data.canClose = this.options.canClose;

		if ( suggestedWidth && suggestedHeight ) {
			data.suggestedWidth = suggestedWidth;
			data.suggestedHeight = suggestedHeight;
		}

		return data;
	},
	/**
	 * @returns {wp.media.view.UploaderInline} Returns itself to allow chaining
	 */
	dispose: function() {
		if ( this.disposing ) {
			/**
			 * call 'dispose' directly on the parent class
			 */
			return View.prototype.dispose.apply( this, arguments );
		}

		// Run remove on `dispose`, so we can be sure to refresh the
		// uploader with a view-less DOM. Track whether we're disposing
		// so we don't trigger an infinite loop.
		this.disposing = true;
		return this.remove();
	},
	/**
	 * @returns {wp.media.view.UploaderInline} Returns itself to allow chaining
	 */
	remove: function() {
		/**
		 * call 'remove' directly on the parent class
		 */
		var result = View.prototype.remove.apply( this, arguments );

		_.defer( _.bind( this.refresh, this ) );
		return result;
	},

	refresh: function() {
		var uploader = this.controller.uploader;

		if ( uploader ) {
			uploader.refresh();
		}
	},
	/**
	 * @returns {wp.media.view.UploaderInline}
	 */
	ready: function() {
		var $browser = this.options.$browser,
			$placeholder;

		if ( this.controller.uploader ) {
			$placeholder = this.$('.browser');

			// Check if we've already replaced the placeholder.
			if ( $placeholder[0] === $browser[0] ) {
				return;
			}

			$browser.detach().text( $placeholder.text() );
			$browser[0].className = $placeholder[0].className;
			$placeholder.replaceWith( $browser.show() );
		}

		this.refresh();
		return this;
	},
	show: function() {
		this.$el.removeClass( 'hidden' );
	},
	hide: function() {
		this.$el.addClass( 'hidden' );
	}

});

module.exports = UploaderInline;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/uploader/status-error.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.view.UploaderStatusError
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var UploaderStatusError = wp.media.View.extend({
	className: 'upload-error',
	template:  wp.template('uploader-status-error')
});

module.exports = UploaderStatusError;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/uploader/status.js":[function(require,module,exports){
/*globals wp, _ */

/**
 * wp.media.view.UploaderStatus
 *
 * An uploader status for on-going uploads.
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	UploaderStatus;

UploaderStatus = View.extend({
	className: 'media-uploader-status',
	template:  wp.template('uploader-status'),

	events: {
		'click .upload-dismiss-errors': 'dismiss'
	},

	initialize: function() {
		this.queue = wp.Uploader.queue;
		this.queue.on( 'add remove reset', this.visibility, this );
		this.queue.on( 'add remove reset change:percent', this.progress, this );
		this.queue.on( 'add remove reset change:uploading', this.info, this );

		this.errors = wp.Uploader.errors;
		this.errors.reset();
		this.errors.on( 'add remove reset', this.visibility, this );
		this.errors.on( 'add', this.error, this );
	},
	/**
	 * @global wp.Uploader
	 * @returns {wp.media.view.UploaderStatus}
	 */
	dispose: function() {
		wp.Uploader.queue.off( null, null, this );
		/**
		 * call 'dispose' directly on the parent class
		 */
		View.prototype.dispose.apply( this, arguments );
		return this;
	},

	visibility: function() {
		this.$el.toggleClass( 'uploading', !! this.queue.length );
		this.$el.toggleClass( 'errors', !! this.errors.length );
		this.$el.toggle( !! this.queue.length || !! this.errors.length );
	},

	ready: function() {
		_.each({
			'$bar':      '.media-progress-bar div',
			'$index':    '.upload-index',
			'$total':    '.upload-total',
			'$filename': '.upload-filename'
		}, function( selector, key ) {
			this[ key ] = this.$( selector );
		}, this );

		this.visibility();
		this.progress();
		this.info();
	},

	progress: function() {
		var queue = this.queue,
			$bar = this.$bar;

		if ( ! $bar || ! queue.length ) {
			return;
		}

		$bar.width( ( queue.reduce( function( memo, attachment ) {
			if ( ! attachment.get('uploading') ) {
				return memo + 100;
			}

			var percent = attachment.get('percent');
			return memo + ( _.isNumber( percent ) ? percent : 100 );
		}, 0 ) / queue.length ) + '%' );
	},

	info: function() {
		var queue = this.queue,
			index = 0, active;

		if ( ! queue.length ) {
			return;
		}

		active = this.queue.find( function( attachment, i ) {
			index = i;
			return attachment.get('uploading');
		});

		this.$index.text( index + 1 );
		this.$total.text( queue.length );
		this.$filename.html( active ? this.filename( active.get('filename') ) : '' );
	},
	/**
	 * @param {string} filename
	 * @returns {string}
	 */
	filename: function( filename ) {
		return wp.media.truncate( _.escape( filename ), 24 );
	},
	/**
	 * @param {Backbone.Model} error
	 */
	error: function( error ) {
		this.views.add( '.upload-errors', new wp.media.view.UploaderStatusError({
			filename: this.filename( error.get('file').name ),
			message:  error.get('message')
		}), { at: 0 });
	},

	/**
	 * @global wp.Uploader
	 *
	 * @param {Object} event
	 */
	dismiss: function( event ) {
		var errors = this.views.get('.upload-errors');

		event.preventDefault();

		if ( errors ) {
			_.invoke( errors, 'remove' );
		}
		wp.Uploader.errors.reset();
	}
});

module.exports = UploaderStatus;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/uploader/window.js":[function(require,module,exports){
/*globals wp, _, jQuery */

/**
 * wp.media.view.UploaderWindow
 *
 * An uploader window that allows for dragging and dropping media.
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 *
 * @param {object} [options]                   Options hash passed to the view.
 * @param {object} [options.uploader]          Uploader properties.
 * @param {jQuery} [options.uploader.browser]
 * @param {jQuery} [options.uploader.dropzone] jQuery collection of the dropzone.
 * @param {object} [options.uploader.params]
 */
var $ = jQuery,
	UploaderWindow;

UploaderWindow = wp.media.View.extend({
	tagName:   'div',
	className: 'uploader-window',
	template:  wp.template('uploader-window'),

	initialize: function() {
		var uploader;

		this.$browser = $('<a href="#" class="browser" />').hide().appendTo('body');

		uploader = this.options.uploader = _.defaults( this.options.uploader || {}, {
			dropzone:  this.$el,
			browser:   this.$browser,
			params:    {}
		});

		// Ensure the dropzone is a jQuery collection.
		if ( uploader.dropzone && ! (uploader.dropzone instanceof $) ) {
			uploader.dropzone = $( uploader.dropzone );
		}

		this.controller.on( 'activate', this.refresh, this );

		this.controller.on( 'detach', function() {
			this.$browser.remove();
		}, this );
	},

	refresh: function() {
		if ( this.uploader ) {
			this.uploader.refresh();
		}
	},

	ready: function() {
		var postId = wp.media.view.settings.post.id,
			dropzone;

		// If the uploader already exists, bail.
		if ( this.uploader ) {
			return;
		}

		if ( postId ) {
			this.options.uploader.params.post_id = postId;
		}
		this.uploader = new wp.Uploader( this.options.uploader );

		dropzone = this.uploader.dropzone;
		dropzone.on( 'dropzone:enter', _.bind( this.show, this ) );
		dropzone.on( 'dropzone:leave', _.bind( this.hide, this ) );

		$( this.uploader ).on( 'uploader:ready', _.bind( this._ready, this ) );
	},

	_ready: function() {
		this.controller.trigger( 'uploader:ready' );
	},

	show: function() {
		var $el = this.$el.show();

		// Ensure that the animation is triggered by waiting until
		// the transparent element is painted into the DOM.
		_.defer( function() {
			$el.css({ opacity: 1 });
		});
	},

	hide: function() {
		var $el = this.$el.css({ opacity: 0 });

		wp.media.transition( $el ).done( function() {
			// Transition end events are subject to race conditions.
			// Make sure that the value is set as intended.
			if ( '0' === $el.css('opacity') ) {
				$el.hide();
			}
		});

		// https://core.trac.wordpress.org/ticket/27341
		_.delay( function() {
			if ( '0' === $el.css('opacity') && $el.is(':visible') ) {
				$el.hide();
			}
		}, 500 );
	}
});

module.exports = UploaderWindow;

},{}],"/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views/view.js":[function(require,module,exports){
/*globals wp */

/**
 * wp.media.View
 *
 * The base view class for media.
 *
 * Undelegating events, removing events from the model, and
 * removing events from the controller mirror the code for
 * `Backbone.View.dispose` in Backbone 0.9.8 development.
 *
 * This behavior has since been removed, and should not be used
 * outside of the media manager.
 *
 * @class
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.Backbone.View.extend({
	constructor: function( options ) {
		if ( options && options.controller ) {
			this.controller = options.controller;
		}
		wp.Backbone.View.apply( this, arguments );
	},
	/**
	 * @todo The internal comment mentions this might have been a stop-gap
	 *       before Backbone 0.9.8 came out. Figure out if Backbone core takes
	 *       care of this in Backbone.View now.
	 *
	 * @returns {wp.media.View} Returns itself to allow chaining
	 */
	dispose: function() {
		// Undelegating events, removing events from the model, and
		// removing events from the controller mirror the code for
		// `Backbone.View.dispose` in Backbone 0.9.8 development.
		this.undelegateEvents();

		if ( this.model && this.model.off ) {
			this.model.off( null, null, this );
		}

		if ( this.collection && this.collection.off ) {
			this.collection.off( null, null, this );
		}

		// Unbind controller events.
		if ( this.controller && this.controller.off ) {
			this.controller.off( null, null, this );
		}

		return this;
	},
	/**
	 * @returns {wp.media.View} Returns itself to allow chaining
	 */
	remove: function() {
		this.dispose();
		/**
		 * call 'remove' directly on the parent class
		 */
		return wp.Backbone.View.prototype.remove.apply( this, arguments );
	}
});

module.exports = View;

},{}]},{},["/Users/dovy/Development/Sites/wptrunk.dev/trunk/src/wp-includes/js/media/views.manifest.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvY29sbGVjdGlvbi1hZGQuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvY29sbGVjdGlvbi1lZGl0LmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL2NvbnRyb2xsZXJzL2Nyb3BwZXIuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvZWRpdC1pbWFnZS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS9jb250cm9sbGVycy9lbWJlZC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS9jb250cm9sbGVycy9mZWF0dXJlZC1pbWFnZS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS9jb250cm9sbGVycy9nYWxsZXJ5LWFkZC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS9jb250cm9sbGVycy9nYWxsZXJ5LWVkaXQuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvaW1hZ2UtZGV0YWlscy5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS9jb250cm9sbGVycy9saWJyYXJ5LmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL2NvbnRyb2xsZXJzL21lZGlhLWxpYnJhcnkuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvcmVnaW9uLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL2NvbnRyb2xsZXJzL3JlcGxhY2UtaW1hZ2UuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvc3RhdGUtbWFjaGluZS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS9jb250cm9sbGVycy9zdGF0ZS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS91dGlscy9zZWxlY3Rpb24tc3luYy5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy5tYW5pZmVzdC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9hdHRhY2htZW50LWNvbXBhdC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9hdHRhY2htZW50LWZpbHRlcnMuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudC1maWx0ZXJzL2FsbC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9hdHRhY2htZW50LWZpbHRlcnMvZGF0ZS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9hdHRhY2htZW50LWZpbHRlcnMvdXBsb2FkZWQuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9hdHRhY2htZW50L2RldGFpbHMuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudC9lZGl0LWxpYnJhcnkuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudC9lZGl0LXNlbGVjdGlvbi5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9hdHRhY2htZW50L2xpYnJhcnkuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudC9zZWxlY3Rpb24uanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudHMuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudHMvYnJvd3Nlci5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9hdHRhY2htZW50cy9zZWxlY3Rpb24uanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYnV0dG9uLWdyb3VwLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL2J1dHRvbi5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9jcm9wcGVyLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL2VkaXQtaW1hZ2UuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvZW1iZWQuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvZW1iZWQvaW1hZ2UuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvZW1iZWQvbGluay5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9lbWJlZC91cmwuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvZm9jdXMtbWFuYWdlci5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9mcmFtZS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9mcmFtZS9pbWFnZS1kZXRhaWxzLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL2ZyYW1lL3Bvc3QuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvZnJhbWUvc2VsZWN0LmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL2lmcmFtZS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9pbWFnZS1kZXRhaWxzLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL2xhYmVsLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL21lZGlhLWZyYW1lLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL21lbnUtaXRlbS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9tZW51LmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL21vZGFsLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL3ByaW9yaXR5LWxpc3QuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3Mvcm91dGVyLWl0ZW0uanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3Mvcm91dGVyLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL3NlYXJjaC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9zZWxlY3Rpb24uanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3Mvc2V0dGluZ3MuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3Mvc2V0dGluZ3MvYXR0YWNobWVudC1kaXNwbGF5LmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL3NldHRpbmdzL2dhbGxlcnkuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3Mvc2V0dGluZ3MvcGxheWxpc3QuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3Mvc2lkZWJhci5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9zcGlubmVyLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL3Rvb2xiYXIuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvdG9vbGJhci9lbWJlZC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy90b29sYmFyL3NlbGVjdC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy91cGxvYWRlci9lZGl0b3IuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvdXBsb2FkZXIvaW5saW5lLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL3VwbG9hZGVyL3N0YXR1cy1lcnJvci5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy91cGxvYWRlci9zdGF0dXMuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvdXBsb2FkZXIvd2luZG93LmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL3ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEuY29udHJvbGxlci5Db2xsZWN0aW9uQWRkXG4gKlxuICogQSBzdGF0ZSBmb3IgYWRkaW5nIGF0dGFjaG1lbnRzIHRvIGEgY29sbGVjdGlvbiAoZS5nLiB2aWRlbyBwbGF5bGlzdCkuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5XG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZVxuICogQGF1Z21lbnRzIEJhY2tib25lLk1vZGVsXG4gKlxuICogQHBhcmFtIHtvYmplY3R9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXNdICAgICAgICAgICAgICAgICAgICAgICAgIFRoZSBhdHRyaWJ1dGVzIGhhc2ggcGFzc2VkIHRvIHRoZSBzdGF0ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmlkPWxpYnJhcnldICAgICAgVW5pcXVlIGlkZW50aWZpZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnRpdGxlICAgICAgICAgICAgICAgICAgICBUaXRsZSBmb3IgdGhlIHN0YXRlLiBEaXNwbGF5cyBpbiB0aGUgZnJhbWUncyB0aXRsZSByZWdpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5tdWx0aXBsZT1hZGRdICAgICAgICAgICAgV2hldGhlciBtdWx0aS1zZWxlY3QgaXMgZW5hYmxlZC4gQHRvZG8gJ2FkZCcgZG9lc24ndCBzZWVtIGRvIGFueXRoaW5nIHNwZWNpYWwsIGFuZCBnZXRzIHVzZWQgYXMgYSBib29sZWFuLlxuICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c30gW2F0dHJpYnV0ZXMubGlicmFyeV0gICAgICAgICAgICAgICAgIFRoZSBhdHRhY2htZW50cyBjb2xsZWN0aW9uIHRvIGJyb3dzZS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJZiBvbmUgaXMgbm90IHN1cHBsaWVkLCBhIGNvbGxlY3Rpb24gb2YgYXR0YWNobWVudHMgb2YgdGhlIHNwZWNpZmllZCB0eXBlIHdpbGwgYmUgY3JlYXRlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9ICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmZpbHRlcmFibGU9dXBsb2FkZWRdICAgICBXaGV0aGVyIHRoZSBsaWJyYXJ5IGlzIGZpbHRlcmFibGUsIGFuZCBpZiBzbyB3aGF0IGZpbHRlcnMgc2hvdWxkIGJlIHNob3duLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjY2VwdHMgJ2FsbCcsICd1cGxvYWRlZCcsIG9yICd1bmF0dGFjaGVkJy5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLm1lbnU9Z2FsbGVyeV0gICAgICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSBtZW51IHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmNvbnRlbnQ9dXBsb2FkXSAgICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSBjb250ZW50IHJlZ2lvbi5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPdmVycmlkZGVuIGJ5IHBlcnNpc3RlbnQgdXNlciBzZXR0aW5nIGlmICdjb250ZW50VXNlclNldHRpbmcnIGlzIHRydWUuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5yb3V0ZXI9YnJvd3NlXSAgICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgcm91dGVyIHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnRvb2xiYXI9Z2FsbGVyeS1hZGRdICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSB0b29sYmFyIHJlZ2lvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnNlYXJjaGFibGU9dHJ1ZV0gICAgICAgICBXaGV0aGVyIHRoZSBsaWJyYXJ5IGlzIHNlYXJjaGFibGUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5zb3J0YWJsZT10cnVlXSAgICAgICAgICAgV2hldGhlciB0aGUgQXR0YWNobWVudHMgc2hvdWxkIGJlIHNvcnRhYmxlLiBEZXBlbmRzIG9uIHRoZSBvcmRlcmJ5IHByb3BlcnR5IGJlaW5nIHNldCB0byBtZW51T3JkZXIgb24gdGhlIGF0dGFjaG1lbnRzIGNvbGxlY3Rpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5hdXRvU2VsZWN0PXRydWVdICAgICAgICAgV2hldGhlciBhbiB1cGxvYWRlZCBhdHRhY2htZW50IHNob3VsZCBiZSBhdXRvbWF0aWNhbGx5IGFkZGVkIHRvIHRoZSBzZWxlY3Rpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5jb250ZW50VXNlclNldHRpbmc9dHJ1ZV0gV2hldGhlciB0aGUgY29udGVudCByZWdpb24ncyBtb2RlIHNob3VsZCBiZSBzZXQgYW5kIHBlcnNpc3RlZCBwZXIgdXNlci5cbiAqIEBwYXJhbSB7aW50fSAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnByaW9yaXR5PTEwMF0gICAgICAgICAgICBUaGUgcHJpb3JpdHkgZm9yIHRoZSBzdGF0ZSBsaW5rIGluIHRoZSBtZWRpYSBtZW51LlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc3luY1NlbGVjdGlvbj1mYWxzZV0gICAgIFdoZXRoZXIgdGhlIEF0dGFjaG1lbnRzIHNlbGVjdGlvbiBzaG91bGQgYmUgcGVyc2lzdGVkIGZyb20gdGhlIGxhc3Qgc3RhdGUuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRGVmYXVsdHMgdG8gZmFsc2UgYmVjYXVzZSBmb3IgdGhpcyBzdGF0ZSwgYmVjYXVzZSB0aGUgbGlicmFyeSBvZiB0aGUgRWRpdCBHYWxsZXJ5IHN0YXRlIGlzIHRoZSBzZWxlY3Rpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnR5cGUgICAgICAgICAgICAgICAgICAgVGhlIGNvbGxlY3Rpb24ncyBtZWRpYSB0eXBlLiAoZS5nLiAndmlkZW8nKS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuY29sbGVjdGlvblR5cGUgICAgICAgICBUaGUgY29sbGVjdGlvbiB0eXBlLiAoZS5nLiAncGxheWxpc3QnKS5cbiAqL1xudmFyIFNlbGVjdGlvbiA9IHdwLm1lZGlhLm1vZGVsLlNlbGVjdGlvbixcblx0TGlicmFyeSA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuTGlicmFyeSxcblx0Q29sbGVjdGlvbkFkZDtcblxuQ29sbGVjdGlvbkFkZCA9IExpYnJhcnkuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6IF8uZGVmYXVsdHMoIHtcblx0XHQvLyBTZWxlY3Rpb24gZGVmYXVsdHMuIEBzZWUgbWVkaWEubW9kZWwuU2VsZWN0aW9uXG5cdFx0bXVsdGlwbGU6ICAgICAgJ2FkZCcsXG5cdFx0Ly8gQXR0YWNobWVudHMgYnJvd3NlciBkZWZhdWx0cy4gQHNlZSBtZWRpYS52aWV3LkF0dGFjaG1lbnRzQnJvd3NlclxuXHRcdGZpbHRlcmFibGU6ICAgICd1cGxvYWRlZCcsXG5cblx0XHRwcmlvcml0eTogICAgICAxMDAsXG5cdFx0c3luY1NlbGVjdGlvbjogZmFsc2Vcblx0fSwgTGlicmFyeS5wcm90b3R5cGUuZGVmYXVsdHMgKSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuOS4wXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgY29sbGVjdGlvblR5cGUgPSB0aGlzLmdldCgnY29sbGVjdGlvblR5cGUnKTtcblxuXHRcdGlmICggJ3ZpZGVvJyA9PT0gdGhpcy5nZXQoICd0eXBlJyApICkge1xuXHRcdFx0Y29sbGVjdGlvblR5cGUgPSAndmlkZW8tJyArIGNvbGxlY3Rpb25UeXBlO1xuXHRcdH1cblxuXHRcdHRoaXMuc2V0KCAnaWQnLCBjb2xsZWN0aW9uVHlwZSArICctbGlicmFyeScgKTtcblx0XHR0aGlzLnNldCggJ3Rvb2xiYXInLCBjb2xsZWN0aW9uVHlwZSArICctYWRkJyApO1xuXHRcdHRoaXMuc2V0KCAnbWVudScsIGNvbGxlY3Rpb25UeXBlICk7XG5cblx0XHQvLyBJZiB3ZSBoYXZlbid0IGJlZW4gcHJvdmlkZWQgYSBgbGlicmFyeWAsIGNyZWF0ZSBhIGBTZWxlY3Rpb25gLlxuXHRcdGlmICggISB0aGlzLmdldCgnbGlicmFyeScpICkge1xuXHRcdFx0dGhpcy5zZXQoICdsaWJyYXJ5Jywgd3AubWVkaWEucXVlcnkoeyB0eXBlOiB0aGlzLmdldCgndHlwZScpIH0pICk7XG5cdFx0fVxuXHRcdExpYnJhcnkucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy45LjBcblx0ICovXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbGlicmFyeSA9IHRoaXMuZ2V0KCdsaWJyYXJ5JyksXG5cdFx0XHRlZGl0TGlicmFyeSA9IHRoaXMuZ2V0KCdlZGl0TGlicmFyeScpLFxuXHRcdFx0ZWRpdCA9IHRoaXMuZnJhbWUuc3RhdGUoIHRoaXMuZ2V0KCdjb2xsZWN0aW9uVHlwZScpICsgJy1lZGl0JyApLmdldCgnbGlicmFyeScpO1xuXG5cdFx0aWYgKCBlZGl0TGlicmFyeSAmJiBlZGl0TGlicmFyeSAhPT0gZWRpdCApIHtcblx0XHRcdGxpYnJhcnkudW5vYnNlcnZlKCBlZGl0TGlicmFyeSApO1xuXHRcdH1cblxuXHRcdC8vIEFjY2VwdHMgYXR0YWNobWVudHMgdGhhdCBleGlzdCBpbiB0aGUgb3JpZ2luYWwgbGlicmFyeSBhbmRcblx0XHQvLyB0aGF0IGRvIG5vdCBleGlzdCBpbiBnYWxsZXJ5J3MgbGlicmFyeS5cblx0XHRsaWJyYXJ5LnZhbGlkYXRvciA9IGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXHRcdFx0cmV0dXJuICEhIHRoaXMubWlycm9yaW5nLmdldCggYXR0YWNobWVudC5jaWQgKSAmJiAhIGVkaXQuZ2V0KCBhdHRhY2htZW50LmNpZCApICYmIFNlbGVjdGlvbi5wcm90b3R5cGUudmFsaWRhdG9yLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHR9O1xuXG5cdFx0Ly8gUmVzZXQgdGhlIGxpYnJhcnkgdG8gZW5zdXJlIHRoYXQgYWxsIGF0dGFjaG1lbnRzIGFyZSByZS1hZGRlZFxuXHRcdC8vIHRvIHRoZSBjb2xsZWN0aW9uLiBEbyBzbyBzaWxlbnRseSwgYXMgY2FsbGluZyBgb2JzZXJ2ZWAgd2lsbFxuXHRcdC8vIHRyaWdnZXIgdGhlIGByZXNldGAgZXZlbnQuXG5cdFx0bGlicmFyeS5yZXNldCggbGlicmFyeS5taXJyb3JpbmcubW9kZWxzLCB7IHNpbGVudDogdHJ1ZSB9KTtcblx0XHRsaWJyYXJ5Lm9ic2VydmUoIGVkaXQgKTtcblx0XHR0aGlzLnNldCgnZWRpdExpYnJhcnknLCBlZGl0KTtcblxuXHRcdExpYnJhcnkucHJvdG90eXBlLmFjdGl2YXRlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvbkFkZDtcbiIsIi8qZ2xvYmFscyB3cCwgQmFja2JvbmUgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5jb250cm9sbGVyLkNvbGxlY3Rpb25FZGl0XG4gKlxuICogQSBzdGF0ZSBmb3IgZWRpdGluZyBhIGNvbGxlY3Rpb24sIHdoaWNoIGlzIHVzZWQgYnkgYXVkaW8gYW5kIHZpZGVvIHBsYXlsaXN0cyxcbiAqIGFuZCBjYW4gYmUgdXNlZCBmb3Igb3RoZXIgY29sbGVjdGlvbnMuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5XG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZVxuICogQGF1Z21lbnRzIEJhY2tib25lLk1vZGVsXG4gKlxuICogQHBhcmFtIHtvYmplY3R9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXNdICAgICAgICAgICAgICAgICAgICAgIFRoZSBhdHRyaWJ1dGVzIGhhc2ggcGFzc2VkIHRvIHRoZSBzdGF0ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMudGl0bGUgICAgICAgICAgICAgICAgICBUaXRsZSBmb3IgdGhlIHN0YXRlLiBEaXNwbGF5cyBpbiB0aGUgbWVkaWEgbWVudSBhbmQgdGhlIGZyYW1lJ3MgdGl0bGUgcmVnaW9uLlxuICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c30gW2F0dHJpYnV0ZXMubGlicmFyeV0gICAgICAgICAgICAgIFRoZSBhdHRhY2htZW50cyBjb2xsZWN0aW9uIHRvIGVkaXQuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSWYgb25lIGlzIG5vdCBzdXBwbGllZCwgYW4gZW1wdHkgbWVkaWEubW9kZWwuU2VsZWN0aW9uIGNvbGxlY3Rpb24gaXMgY3JlYXRlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLm11bHRpcGxlPWZhbHNlXSAgICAgICBXaGV0aGVyIG11bHRpLXNlbGVjdCBpcyBlbmFibGVkLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuY29udGVudD1icm93c2VdICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIGNvbnRlbnQgcmVnaW9uLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5tZW51ICAgICAgICAgICAgICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIG1lbnUgcmVnaW9uLiBAdG9kbyB0aGlzIG5lZWRzIGEgYmV0dGVyIGV4cGxhbmF0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc2VhcmNoYWJsZT1mYWxzZV0gICAgIFdoZXRoZXIgdGhlIGxpYnJhcnkgaXMgc2VhcmNoYWJsZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnNvcnRhYmxlPXRydWVdICAgICAgICBXaGV0aGVyIHRoZSBBdHRhY2htZW50cyBzaG91bGQgYmUgc29ydGFibGUuIERlcGVuZHMgb24gdGhlIG9yZGVyYnkgcHJvcGVydHkgYmVpbmcgc2V0IHRvIG1lbnVPcmRlciBvbiB0aGUgYXR0YWNobWVudHMgY29sbGVjdGlvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmRhdGU9dHJ1ZV0gICAgICAgICAgICBXaGV0aGVyIHRvIHNob3cgdGhlIGRhdGUgZmlsdGVyIGluIHRoZSBicm93c2VyJ3MgdG9vbGJhci5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmRlc2NyaWJlPXRydWVdICAgICAgICBXaGV0aGVyIHRvIG9mZmVyIFVJIHRvIGRlc2NyaWJlIHRoZSBhdHRhY2htZW50cyAtIGUuZy4gY2FwdGlvbmluZyBpbWFnZXMgaW4gYSBnYWxsZXJ5LlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuZHJhZ0luZm89dHJ1ZV0gICAgICAgIFdoZXRoZXIgdG8gc2hvdyBpbnN0cnVjdGlvbmFsIHRleHQgYWJvdXQgdGhlIGF0dGFjaG1lbnRzIGJlaW5nIHNvcnRhYmxlLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuZHJhZ0luZm9UZXh0XSAgICAgICAgIEluc3RydWN0aW9uYWwgdGV4dCBhYm91dCB0aGUgYXR0YWNobWVudHMgYmVpbmcgc29ydGFibGUuXG4gKiBAcGFyYW0ge2ludH0gICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5pZGVhbENvbHVtbldpZHRoPTE3MF0gVGhlIGlkZWFsIGNvbHVtbiB3aWR0aCBpbiBwaXhlbHMgZm9yIGF0dGFjaG1lbnRzLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuZWRpdGluZz1mYWxzZV0gICAgICAgIFdoZXRoZXIgdGhlIGdhbGxlcnkgaXMgYmVpbmcgY3JlYXRlZCwgb3IgZWRpdGluZyBhbiBleGlzdGluZyBpbnN0YW5jZS5cbiAqIEBwYXJhbSB7aW50fSAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnByaW9yaXR5PTYwXSAgICAgICAgICBUaGUgcHJpb3JpdHkgZm9yIHRoZSBzdGF0ZSBsaW5rIGluIHRoZSBtZWRpYSBtZW51LlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc3luY1NlbGVjdGlvbj1mYWxzZV0gIFdoZXRoZXIgdGhlIEF0dGFjaG1lbnRzIHNlbGVjdGlvbiBzaG91bGQgYmUgcGVyc2lzdGVkIGZyb20gdGhlIGxhc3Qgc3RhdGUuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRGVmYXVsdHMgdG8gZmFsc2UgZm9yIHRoaXMgc3RhdGUsIGJlY2F1c2UgdGhlIGxpYnJhcnkgcGFzc2VkIGluICAqaXMqIHRoZSBzZWxlY3Rpb24uXG4gKiBAcGFyYW0ge3ZpZXd9ICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5TZXR0aW5nc1ZpZXddICAgICAgICAgVGhlIHZpZXcgdG8gZWRpdCB0aGUgY29sbGVjdGlvbiBpbnN0YW5jZSBzZXR0aW5ncyAoZS5nLiBQbGF5bGlzdCBzZXR0aW5ncyB3aXRoIFwiU2hvdyB0cmFja2xpc3RcIiBjaGVja2JveCkuXG4gKiBAcGFyYW0ge3ZpZXd9ICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5BdHRhY2htZW50Vmlld10gICAgICAgVGhlIHNpbmdsZSBgQXR0YWNobWVudGAgdmlldyB0byBiZSB1c2VkIGluIHRoZSBgQXR0YWNobWVudHNgLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIElmIG5vbmUgc3VwcGxpZWQsIGRlZmF1bHRzIHRvIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudC5FZGl0TGlicmFyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMudHlwZSAgICAgICAgICAgICAgICAgICBUaGUgY29sbGVjdGlvbidzIG1lZGlhIHR5cGUuIChlLmcuICd2aWRlbycpLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5jb2xsZWN0aW9uVHlwZSAgICAgICAgIFRoZSBjb2xsZWN0aW9uIHR5cGUuIChlLmcuICdwbGF5bGlzdCcpLlxuICovXG52YXIgTGlicmFyeSA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuTGlicmFyeSxcblx0bDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0JCA9IGpRdWVyeSxcblx0Q29sbGVjdGlvbkVkaXQ7XG5cbkNvbGxlY3Rpb25FZGl0ID0gTGlicmFyeS5leHRlbmQoe1xuXHRkZWZhdWx0czoge1xuXHRcdG11bHRpcGxlOiAgICAgICAgIGZhbHNlLFxuXHRcdHNvcnRhYmxlOiAgICAgICAgIHRydWUsXG5cdFx0ZGF0ZTogICAgICAgICAgICAgZmFsc2UsXG5cdFx0c2VhcmNoYWJsZTogICAgICAgZmFsc2UsXG5cdFx0Y29udGVudDogICAgICAgICAgJ2Jyb3dzZScsXG5cdFx0ZGVzY3JpYmU6ICAgICAgICAgdHJ1ZSxcblx0XHRkcmFnSW5mbzogICAgICAgICB0cnVlLFxuXHRcdGlkZWFsQ29sdW1uV2lkdGg6IDE3MCxcblx0XHRlZGl0aW5nOiAgICAgICAgICBmYWxzZSxcblx0XHRwcmlvcml0eTogICAgICAgICA2MCxcblx0XHRTZXR0aW5nc1ZpZXc6ICAgICBmYWxzZSxcblx0XHRzeW5jU2VsZWN0aW9uOiAgICBmYWxzZVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy45LjBcblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBjb2xsZWN0aW9uVHlwZSA9IHRoaXMuZ2V0KCdjb2xsZWN0aW9uVHlwZScpO1xuXG5cdFx0aWYgKCAndmlkZW8nID09PSB0aGlzLmdldCggJ3R5cGUnICkgKSB7XG5cdFx0XHRjb2xsZWN0aW9uVHlwZSA9ICd2aWRlby0nICsgY29sbGVjdGlvblR5cGU7XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXQoICdpZCcsIGNvbGxlY3Rpb25UeXBlICsgJy1lZGl0JyApO1xuXHRcdHRoaXMuc2V0KCAndG9vbGJhcicsIGNvbGxlY3Rpb25UeXBlICsgJy1lZGl0JyApO1xuXG5cdFx0Ly8gSWYgd2UgaGF2ZW4ndCBiZWVuIHByb3ZpZGVkIGEgYGxpYnJhcnlgLCBjcmVhdGUgYSBgU2VsZWN0aW9uYC5cblx0XHRpZiAoICEgdGhpcy5nZXQoJ2xpYnJhcnknKSApIHtcblx0XHRcdHRoaXMuc2V0KCAnbGlicmFyeScsIG5ldyB3cC5tZWRpYS5tb2RlbC5TZWxlY3Rpb24oKSApO1xuXHRcdH1cblx0XHQvLyBUaGUgc2luZ2xlIGBBdHRhY2htZW50YCB2aWV3IHRvIGJlIHVzZWQgaW4gdGhlIGBBdHRhY2htZW50c2Agdmlldy5cblx0XHRpZiAoICEgdGhpcy5nZXQoJ0F0dGFjaG1lbnRWaWV3JykgKSB7XG5cdFx0XHR0aGlzLnNldCggJ0F0dGFjaG1lbnRWaWV3Jywgd3AubWVkaWEudmlldy5BdHRhY2htZW50LkVkaXRMaWJyYXJ5ICk7XG5cdFx0fVxuXHRcdExpYnJhcnkucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy45LjBcblx0ICovXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbGlicmFyeSA9IHRoaXMuZ2V0KCdsaWJyYXJ5Jyk7XG5cblx0XHQvLyBMaW1pdCB0aGUgbGlicmFyeSB0byBpbWFnZXMgb25seS5cblx0XHRsaWJyYXJ5LnByb3BzLnNldCggJ3R5cGUnLCB0aGlzLmdldCggJ3R5cGUnICkgKTtcblxuXHRcdC8vIFdhdGNoIGZvciB1cGxvYWRlZCBhdHRhY2htZW50cy5cblx0XHR0aGlzLmdldCgnbGlicmFyeScpLm9ic2VydmUoIHdwLlVwbG9hZGVyLnF1ZXVlICk7XG5cblx0XHR0aGlzLmZyYW1lLm9uKCAnY29udGVudDpyZW5kZXI6YnJvd3NlJywgdGhpcy5yZW5kZXJTZXR0aW5ncywgdGhpcyApO1xuXG5cdFx0TGlicmFyeS5wcm90b3R5cGUuYWN0aXZhdGUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy45LjBcblx0ICovXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIFN0b3Agd2F0Y2hpbmcgZm9yIHVwbG9hZGVkIGF0dGFjaG1lbnRzLlxuXHRcdHRoaXMuZ2V0KCdsaWJyYXJ5JykudW5vYnNlcnZlKCB3cC5VcGxvYWRlci5xdWV1ZSApO1xuXG5cdFx0dGhpcy5mcmFtZS5vZmYoICdjb250ZW50OnJlbmRlcjpicm93c2UnLCB0aGlzLnJlbmRlclNldHRpbmdzLCB0aGlzICk7XG5cblx0XHRMaWJyYXJ5LnByb3RvdHlwZS5kZWFjdGl2YXRlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHQvKipcblx0ICogUmVuZGVyIHRoZSBjb2xsZWN0aW9uIGVtYmVkIHNldHRpbmdzIHZpZXcgaW4gdGhlIGJyb3dzZXIgc2lkZWJhci5cblx0ICpcblx0ICogQHRvZG8gVGhpcyBpcyBhZ2FpbnN0IHRoZSBwYXR0ZXJuIGVsc2V3aGVyZSBpbiBtZWRpYS4gVHlwaWNhbGx5IHRoZSBmcmFtZVxuXHQgKiAgICAgICBpcyByZXNwb25zaWJsZSBmb3IgYWRkaW5nIHJlZ2lvbiBtb2RlIGNhbGxiYWNrcy4gRXhwbGFpbi5cblx0ICpcblx0ICogQHNpbmNlIDMuOS4wXG5cdCAqXG5cdCAqIEBwYXJhbSB7d3AubWVkaWEudmlldy5hdHRhY2htZW50c0Jyb3dzZXJ9IFRoZSBhdHRhY2htZW50cyBicm93c2VyIHZpZXcuXG5cdCAqL1xuXHRyZW5kZXJTZXR0aW5nczogZnVuY3Rpb24oIGF0dGFjaG1lbnRzQnJvd3NlclZpZXcgKSB7XG5cdFx0dmFyIGxpYnJhcnkgPSB0aGlzLmdldCgnbGlicmFyeScpLFxuXHRcdFx0Y29sbGVjdGlvblR5cGUgPSB0aGlzLmdldCgnY29sbGVjdGlvblR5cGUnKSxcblx0XHRcdGRyYWdJbmZvVGV4dCA9IHRoaXMuZ2V0KCdkcmFnSW5mb1RleHQnKSxcblx0XHRcdFNldHRpbmdzVmlldyA9IHRoaXMuZ2V0KCdTZXR0aW5nc1ZpZXcnKSxcblx0XHRcdG9iaiA9IHt9O1xuXG5cdFx0aWYgKCAhIGxpYnJhcnkgfHwgISBhdHRhY2htZW50c0Jyb3dzZXJWaWV3ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxpYnJhcnlbIGNvbGxlY3Rpb25UeXBlIF0gPSBsaWJyYXJ5WyBjb2xsZWN0aW9uVHlwZSBdIHx8IG5ldyBCYWNrYm9uZS5Nb2RlbCgpO1xuXG5cdFx0b2JqWyBjb2xsZWN0aW9uVHlwZSBdID0gbmV3IFNldHRpbmdzVmlldyh7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0bW9kZWw6ICAgICAgbGlicmFyeVsgY29sbGVjdGlvblR5cGUgXSxcblx0XHRcdHByaW9yaXR5OiAgIDQwXG5cdFx0fSk7XG5cblx0XHRhdHRhY2htZW50c0Jyb3dzZXJWaWV3LnNpZGViYXIuc2V0KCBvYmogKTtcblxuXHRcdGlmICggZHJhZ0luZm9UZXh0ICkge1xuXHRcdFx0YXR0YWNobWVudHNCcm93c2VyVmlldy50b29sYmFyLnNldCggJ2RyYWdJbmZvJywgbmV3IHdwLm1lZGlhLlZpZXcoe1xuXHRcdFx0XHRlbDogJCggJzxkaXYgY2xhc3M9XCJpbnN0cnVjdGlvbnNcIj4nICsgZHJhZ0luZm9UZXh0ICsgJzwvZGl2PicgKVswXSxcblx0XHRcdFx0cHJpb3JpdHk6IC00MFxuXHRcdFx0fSkgKTtcblx0XHR9XG5cblx0XHQvLyBBZGQgdGhlICdSZXZlcnNlIG9yZGVyJyBidXR0b24gdG8gdGhlIHRvb2xiYXIuXG5cdFx0YXR0YWNobWVudHNCcm93c2VyVmlldy50b29sYmFyLnNldCggJ3JldmVyc2UnLCB7XG5cdFx0XHR0ZXh0OiAgICAgbDEwbi5yZXZlcnNlT3JkZXIsXG5cdFx0XHRwcmlvcml0eTogODAsXG5cblx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0bGlicmFyeS5yZXNldCggbGlicmFyeS50b0FycmF5KCkucmV2ZXJzZSgpICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxlY3Rpb25FZGl0O1xuIiwiLypnbG9iYWxzIHdwLCBfLCBCYWNrYm9uZSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLmNvbnRyb2xsZXIuQ3JvcHBlclxuICpcbiAqIEEgc3RhdGUgZm9yIGNyb3BwaW5nIGFuIGltYWdlLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5Nb2RlbFxuICovXG52YXIgbDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0Q3JvcHBlcjtcblxuQ3JvcHBlciA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGUuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6IHtcblx0XHRpZDogICAgICAgICAgJ2Nyb3BwZXInLFxuXHRcdHRpdGxlOiAgICAgICBsMTBuLmNyb3BJbWFnZSxcblx0XHQvLyBSZWdpb24gbW9kZSBkZWZhdWx0cy5cblx0XHR0b29sYmFyOiAgICAgJ2Nyb3AnLFxuXHRcdGNvbnRlbnQ6ICAgICAnY3JvcCcsXG5cdFx0cm91dGVyOiAgICAgIGZhbHNlLFxuXG5cdFx0Y2FuU2tpcENyb3A6IGZhbHNlXG5cdH0sXG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZnJhbWUub24oICdjb250ZW50OmNyZWF0ZTpjcm9wJywgdGhpcy5jcmVhdGVDcm9wQ29udGVudCwgdGhpcyApO1xuXHRcdHRoaXMuZnJhbWUub24oICdjbG9zZScsIHRoaXMucmVtb3ZlQ3JvcHBlciwgdGhpcyApO1xuXHRcdHRoaXMuc2V0KCdzZWxlY3Rpb24nLCBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbih0aGlzLmZyYW1lLl9zZWxlY3Rpb24uc2luZ2xlKSk7XG5cdH0sXG5cblx0ZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mcmFtZS50b29sYmFyLm1vZGUoJ2Jyb3dzZScpO1xuXHR9LFxuXG5cdGNyZWF0ZUNyb3BDb250ZW50OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNyb3BwZXJWaWV3ID0gbmV3IHdwLm1lZGlhLnZpZXcuQ3JvcHBlcih7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0YXR0YWNobWVudDogdGhpcy5nZXQoJ3NlbGVjdGlvbicpLmZpcnN0KClcblx0XHR9KTtcblx0XHR0aGlzLmNyb3BwZXJWaWV3Lm9uKCdpbWFnZS1sb2FkZWQnLCB0aGlzLmNyZWF0ZUNyb3BUb29sYmFyLCB0aGlzKTtcblx0XHR0aGlzLmZyYW1lLmNvbnRlbnQuc2V0KHRoaXMuY3JvcHBlclZpZXcpO1xuXG5cdH0sXG5cdHJlbW92ZUNyb3BwZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuaW1nU2VsZWN0LmNhbmNlbFNlbGVjdGlvbigpO1xuXHRcdHRoaXMuaW1nU2VsZWN0LnNldE9wdGlvbnMoe3JlbW92ZTogdHJ1ZX0pO1xuXHRcdHRoaXMuaW1nU2VsZWN0LnVwZGF0ZSgpO1xuXHRcdHRoaXMuY3JvcHBlclZpZXcucmVtb3ZlKCk7XG5cdH0sXG5cdGNyZWF0ZUNyb3BUb29sYmFyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgY2FuU2tpcENyb3AsIHRvb2xiYXJPcHRpb25zO1xuXG5cdFx0Y2FuU2tpcENyb3AgPSB0aGlzLmdldCgnY2FuU2tpcENyb3AnKSB8fCBmYWxzZTtcblxuXHRcdHRvb2xiYXJPcHRpb25zID0ge1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcy5mcmFtZSxcblx0XHRcdGl0ZW1zOiB7XG5cdFx0XHRcdGluc2VydDoge1xuXHRcdFx0XHRcdHN0eWxlOiAgICAncHJpbWFyeScsXG5cdFx0XHRcdFx0dGV4dDogICAgIGwxMG4uY3JvcEltYWdlLFxuXHRcdFx0XHRcdHByaW9yaXR5OiA4MCxcblx0XHRcdFx0XHRyZXF1aXJlczogeyBsaWJyYXJ5OiBmYWxzZSwgc2VsZWN0aW9uOiBmYWxzZSB9LFxuXG5cdFx0XHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGNvbnRyb2xsZXIgPSB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGlvbjtcblxuXHRcdFx0XHRcdFx0c2VsZWN0aW9uID0gY29udHJvbGxlci5zdGF0ZSgpLmdldCgnc2VsZWN0aW9uJykuZmlyc3QoKTtcblx0XHRcdFx0XHRcdHNlbGVjdGlvbi5zZXQoe2Nyb3BEZXRhaWxzOiBjb250cm9sbGVyLnN0YXRlKCkuaW1nU2VsZWN0LmdldFNlbGVjdGlvbigpfSk7XG5cblx0XHRcdFx0XHRcdHRoaXMuJGVsLnRleHQobDEwbi5jcm9wcGluZyk7XG5cdFx0XHRcdFx0XHR0aGlzLiRlbC5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuXG5cdFx0XHRcdFx0XHRjb250cm9sbGVyLnN0YXRlKCkuZG9Dcm9wKCBzZWxlY3Rpb24gKS5kb25lKCBmdW5jdGlvbiggY3JvcHBlZEltYWdlICkge1xuXHRcdFx0XHRcdFx0XHRjb250cm9sbGVyLnRyaWdnZXIoJ2Nyb3BwZWQnLCBjcm9wcGVkSW1hZ2UgKTtcblx0XHRcdFx0XHRcdFx0Y29udHJvbGxlci5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0fSkuZmFpbCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRyb2xsZXIudHJpZ2dlcignY29udGVudDplcnJvcjpjcm9wJyk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0aWYgKCBjYW5Ta2lwQ3JvcCApIHtcblx0XHRcdF8uZXh0ZW5kKCB0b29sYmFyT3B0aW9ucy5pdGVtcywge1xuXHRcdFx0XHRza2lwOiB7XG5cdFx0XHRcdFx0c3R5bGU6ICAgICAgJ3NlY29uZGFyeScsXG5cdFx0XHRcdFx0dGV4dDogICAgICAgbDEwbi5za2lwQ3JvcHBpbmcsXG5cdFx0XHRcdFx0cHJpb3JpdHk6ICAgNzAsXG5cdFx0XHRcdFx0cmVxdWlyZXM6ICAgeyBsaWJyYXJ5OiBmYWxzZSwgc2VsZWN0aW9uOiBmYWxzZSB9LFxuXHRcdFx0XHRcdGNsaWNrOiAgICAgIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLmdldCgnc2VsZWN0aW9uJykuZmlyc3QoKTtcblx0XHRcdFx0XHRcdHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLmNyb3BwZXJWaWV3LnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0dGhpcy5jb250cm9sbGVyLnRyaWdnZXIoJ3NraXBwZWRjcm9wJywgc2VsZWN0aW9uKTtcblx0XHRcdFx0XHRcdHRoaXMuY29udHJvbGxlci5jbG9zZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5mcmFtZS50b29sYmFyLnNldCggbmV3IHdwLm1lZGlhLnZpZXcuVG9vbGJhcih0b29sYmFyT3B0aW9ucykgKTtcblx0fSxcblxuXHRkb0Nyb3A6IGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXHRcdHJldHVybiB3cC5hamF4LnBvc3QoICdjdXN0b20taGVhZGVyLWNyb3AnLCB7XG5cdFx0XHRub25jZTogYXR0YWNobWVudC5nZXQoJ25vbmNlcycpLmVkaXQsXG5cdFx0XHRpZDogYXR0YWNobWVudC5nZXQoJ2lkJyksXG5cdFx0XHRjcm9wRGV0YWlsczogYXR0YWNobWVudC5nZXQoJ2Nyb3BEZXRhaWxzJylcblx0XHR9ICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENyb3BwZXI7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5jb250cm9sbGVyLkVkaXRJbWFnZVxuICpcbiAqIEEgc3RhdGUgZm9yIGVkaXRpbmcgKGNyb3BwaW5nLCBldGMuKSBhbiBpbWFnZS5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlXG4gKiBAYXVnbWVudHMgQmFja2JvbmUuTW9kZWxcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgICAgICAgICAgICAgICAgICAgICAgVGhlIGF0dHJpYnV0ZXMgaGFzaCBwYXNzZWQgdG8gdGhlIHN0YXRlLlxuICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50fSBhdHRyaWJ1dGVzLm1vZGVsICAgICAgICAgICAgICAgIFRoZSBhdHRhY2htZW50LlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5pZD1lZGl0LWltYWdlXSAgICAgIFVuaXF1ZSBpZGVudGlmaWVyLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy50aXRsZT1FZGl0IEltYWdlXSAgIFRpdGxlIGZvciB0aGUgc3RhdGUuIERpc3BsYXlzIGluIHRoZSBtZWRpYSBtZW51IGFuZCB0aGUgZnJhbWUncyB0aXRsZSByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmNvbnRlbnQ9ZWRpdC1pbWFnZV0gSW5pdGlhbCBtb2RlIGZvciB0aGUgY29udGVudCByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnRvb2xiYXI9ZWRpdC1pbWFnZV0gSW5pdGlhbCBtb2RlIGZvciB0aGUgdG9vbGJhciByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLm1lbnU9ZmFsc2VdICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgbWVudSByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnVybF0gICAgICAgICAgICAgICAgVW51c2VkLiBAdG9kbyBDb25zaWRlciByZW1vdmFsLlxuICovXG52YXIgbDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0RWRpdEltYWdlO1xuXG5FZGl0SW1hZ2UgPSB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlLmV4dGVuZCh7XG5cdGRlZmF1bHRzOiB7XG5cdFx0aWQ6ICAgICAgJ2VkaXQtaW1hZ2UnLFxuXHRcdHRpdGxlOiAgIGwxMG4uZWRpdEltYWdlLFxuXHRcdG1lbnU6ICAgIGZhbHNlLFxuXHRcdHRvb2xiYXI6ICdlZGl0LWltYWdlJyxcblx0XHRjb250ZW50OiAnZWRpdC1pbWFnZScsXG5cdFx0dXJsOiAgICAgJydcblx0fSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuOS4wXG5cdCAqL1xuXHRhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5mcmFtZSwgJ3Rvb2xiYXI6cmVuZGVyOmVkaXQtaW1hZ2UnLCB0aGlzLnRvb2xiYXIgKTtcblx0fSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuOS4wXG5cdCAqL1xuXHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnN0b3BMaXN0ZW5pbmcoIHRoaXMuZnJhbWUgKTtcblx0fSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuOS4wXG5cdCAqL1xuXHR0b29sYmFyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZnJhbWUgPSB0aGlzLmZyYW1lLFxuXHRcdFx0bGFzdFN0YXRlID0gZnJhbWUubGFzdFN0YXRlKCksXG5cdFx0XHRwcmV2aW91cyA9IGxhc3RTdGF0ZSAmJiBsYXN0U3RhdGUuaWQ7XG5cblx0XHRmcmFtZS50b29sYmFyLnNldCggbmV3IHdwLm1lZGlhLnZpZXcuVG9vbGJhcih7XG5cdFx0XHRjb250cm9sbGVyOiBmcmFtZSxcblx0XHRcdGl0ZW1zOiB7XG5cdFx0XHRcdGJhY2s6IHtcblx0XHRcdFx0XHRzdHlsZTogJ3ByaW1hcnknLFxuXHRcdFx0XHRcdHRleHQ6ICAgICBsMTBuLmJhY2ssXG5cdFx0XHRcdFx0cHJpb3JpdHk6IDIwLFxuXHRcdFx0XHRcdGNsaWNrOiAgICBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmICggcHJldmlvdXMgKSB7XG5cdFx0XHRcdFx0XHRcdGZyYW1lLnNldFN0YXRlKCBwcmV2aW91cyApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0ZnJhbWUuY2xvc2UoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KSApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0SW1hZ2U7XG4iLCIvKmdsb2JhbHMgd3AsIF8sIEJhY2tib25lICovXG5cbi8qKlxuICogd3AubWVkaWEuY29udHJvbGxlci5FbWJlZFxuICpcbiAqIEEgc3RhdGUgZm9yIGVtYmVkZGluZyBtZWRpYSBmcm9tIGEgVVJMLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5Nb2RlbFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBhdHRyaWJ1dGVzICAgICAgICAgICAgICAgICAgICAgICAgIFRoZSBhdHRyaWJ1dGVzIGhhc2ggcGFzc2VkIHRvIHRoZSBzdGF0ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbYXR0cmlidXRlcy5pZD1lbWJlZF0gICAgICAgICAgICAgIFVuaXF1ZSBpZGVudGlmaWVyLlxuICogQHBhcmFtIHtzdHJpbmd9IFthdHRyaWJ1dGVzLnRpdGxlPUluc2VydCBGcm9tIFVSTF0gVGl0bGUgZm9yIHRoZSBzdGF0ZS4gRGlzcGxheXMgaW4gdGhlIG1lZGlhIG1lbnUgYW5kIHRoZSBmcmFtZSdzIHRpdGxlIHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbYXR0cmlidXRlcy5jb250ZW50PWVtYmVkXSAgICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIGNvbnRlbnQgcmVnaW9uLlxuICogQHBhcmFtIHtzdHJpbmd9IFthdHRyaWJ1dGVzLm1lbnU9ZGVmYXVsdF0gICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgbWVudSByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gW2F0dHJpYnV0ZXMudG9vbGJhcj1tYWluLWVtYmVkXSAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSB0b29sYmFyIHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbYXR0cmlidXRlcy5tZW51PWZhbHNlXSAgICAgICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIG1lbnUgcmVnaW9uLlxuICogQHBhcmFtIHtpbnR9ICAgIFthdHRyaWJ1dGVzLnByaW9yaXR5PTEyMF0gICAgICAgICAgVGhlIHByaW9yaXR5IGZvciB0aGUgc3RhdGUgbGluayBpbiB0aGUgbWVkaWEgbWVudS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbYXR0cmlidXRlcy50eXBlPWxpbmtdICAgICAgICAgICAgIFRoZSB0eXBlIG9mIGVtYmVkLiBDdXJyZW50bHkgb25seSBsaW5rIGlzIHN1cHBvcnRlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbYXR0cmlidXRlcy51cmxdICAgICAgICAgICAgICAgICAgIFRoZSBlbWJlZCBVUkwuXG4gKiBAcGFyYW0ge29iamVjdH0gW2F0dHJpYnV0ZXMubWV0YWRhdGE9e31dICAgICAgICAgICBQcm9wZXJ0aWVzIG9mIHRoZSBlbWJlZCwgd2hpY2ggd2lsbCBvdmVycmlkZSBhdHRyaWJ1dGVzLnVybCBpZiBzZXQuXG4gKi9cbnZhciBsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHQkID0gQmFja2JvbmUuJCxcblx0RW1iZWQ7XG5cbkVtYmVkID0gd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZS5leHRlbmQoe1xuXHRkZWZhdWx0czoge1xuXHRcdGlkOiAgICAgICAnZW1iZWQnLFxuXHRcdHRpdGxlOiAgICBsMTBuLmluc2VydEZyb21VcmxUaXRsZSxcblx0XHRjb250ZW50OiAgJ2VtYmVkJyxcblx0XHRtZW51OiAgICAgJ2RlZmF1bHQnLFxuXHRcdHRvb2xiYXI6ICAnbWFpbi1lbWJlZCcsXG5cdFx0cHJpb3JpdHk6IDEyMCxcblx0XHR0eXBlOiAgICAgJ2xpbmsnLFxuXHRcdHVybDogICAgICAnJyxcblx0XHRtZXRhZGF0YToge31cblx0fSxcblxuXHQvLyBUaGUgYW1vdW50IG9mIHRpbWUgdXNlZCB3aGVuIGRlYm91bmNpbmcgdGhlIHNjYW4uXG5cdHNlbnNpdGl2aXR5OiA0MDAsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucykge1xuXHRcdHRoaXMubWV0YWRhdGEgPSBvcHRpb25zLm1ldGFkYXRhO1xuXHRcdHRoaXMuZGVib3VuY2VkU2NhbiA9IF8uZGVib3VuY2UoIF8uYmluZCggdGhpcy5zY2FuLCB0aGlzICksIHRoaXMuc2Vuc2l0aXZpdHkgKTtcblx0XHR0aGlzLnByb3BzID0gbmV3IEJhY2tib25lLk1vZGVsKCB0aGlzLm1ldGFkYXRhIHx8IHsgdXJsOiAnJyB9KTtcblx0XHR0aGlzLnByb3BzLm9uKCAnY2hhbmdlOnVybCcsIHRoaXMuZGVib3VuY2VkU2NhbiwgdGhpcyApO1xuXHRcdHRoaXMucHJvcHMub24oICdjaGFuZ2U6dXJsJywgdGhpcy5yZWZyZXNoLCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ3NjYW4nLCB0aGlzLnNjYW5JbWFnZSwgdGhpcyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUcmlnZ2VyIGEgc2NhbiBvZiB0aGUgZW1iZWRkZWQgVVJMJ3MgY29udGVudCBmb3IgbWV0YWRhdGEgcmVxdWlyZWQgdG8gZW1iZWQuXG5cdCAqXG5cdCAqIEBmaXJlcyB3cC5tZWRpYS5jb250cm9sbGVyLkVtYmVkI3NjYW5cblx0ICovXG5cdHNjYW46IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzY2FubmVycyxcblx0XHRcdGVtYmVkID0gdGhpcyxcblx0XHRcdGF0dHJpYnV0ZXMgPSB7XG5cdFx0XHRcdHR5cGU6ICdsaW5rJyxcblx0XHRcdFx0c2Nhbm5lcnM6IFtdXG5cdFx0XHR9O1xuXG5cdFx0Ly8gU2NhbiBpcyB0cmlnZ2VyZWQgd2l0aCB0aGUgbGlzdCBvZiBgYXR0cmlidXRlc2AgdG8gc2V0IG9uIHRoZVxuXHRcdC8vIHN0YXRlLCB1c2VmdWwgZm9yIHRoZSAndHlwZScgYXR0cmlidXRlIGFuZCAnc2Nhbm5lcnMnIGF0dHJpYnV0ZSxcblx0XHQvLyBhbiBhcnJheSBvZiBwcm9taXNlIG9iamVjdHMgZm9yIGFzeW5jaHJvbm91cyBzY2FuIG9wZXJhdGlvbnMuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmdldCgndXJsJykgKSB7XG5cdFx0XHR0aGlzLnRyaWdnZXIoICdzY2FuJywgYXR0cmlidXRlcyApO1xuXHRcdH1cblxuXHRcdGlmICggYXR0cmlidXRlcy5zY2FubmVycy5sZW5ndGggKSB7XG5cdFx0XHRzY2FubmVycyA9IGF0dHJpYnV0ZXMuc2Nhbm5lcnMgPSAkLndoZW4uYXBwbHkoICQsIGF0dHJpYnV0ZXMuc2Nhbm5lcnMgKTtcblx0XHRcdHNjYW5uZXJzLmFsd2F5cyggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggZW1iZWQuZ2V0KCdzY2FubmVycycpID09PSBzY2FubmVycyApIHtcblx0XHRcdFx0XHRlbWJlZC5zZXQoICdsb2FkaW5nJywgZmFsc2UgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGF0dHJpYnV0ZXMuc2Nhbm5lcnMgPSBudWxsO1xuXHRcdH1cblxuXHRcdGF0dHJpYnV0ZXMubG9hZGluZyA9ICEhIGF0dHJpYnV0ZXMuc2Nhbm5lcnM7XG5cdFx0dGhpcy5zZXQoIGF0dHJpYnV0ZXMgKTtcblx0fSxcblx0LyoqXG5cdCAqIFRyeSBzY2FubmluZyB0aGUgZW1iZWQgYXMgYW4gaW1hZ2UgdG8gZGlzY292ZXIgaXRzIGRpbWVuc2lvbnMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBhdHRyaWJ1dGVzXG5cdCAqL1xuXHRzY2FuSW1hZ2U6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzICkge1xuXHRcdHZhciBmcmFtZSA9IHRoaXMuZnJhbWUsXG5cdFx0XHRzdGF0ZSA9IHRoaXMsXG5cdFx0XHR1cmwgPSB0aGlzLnByb3BzLmdldCgndXJsJyksXG5cdFx0XHRpbWFnZSA9IG5ldyBJbWFnZSgpLFxuXHRcdFx0ZGVmZXJyZWQgPSAkLkRlZmVycmVkKCk7XG5cblx0XHRhdHRyaWJ1dGVzLnNjYW5uZXJzLnB1c2goIGRlZmVycmVkLnByb21pc2UoKSApO1xuXG5cdFx0Ly8gVHJ5IHRvIGxvYWQgdGhlIGltYWdlIGFuZCBmaW5kIGl0cyB3aWR0aC9oZWlnaHQuXG5cdFx0aW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRkZWZlcnJlZC5yZXNvbHZlKCk7XG5cblx0XHRcdGlmICggc3RhdGUgIT09IGZyYW1lLnN0YXRlKCkgfHwgdXJsICE9PSBzdGF0ZS5wcm9wcy5nZXQoJ3VybCcpICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHN0YXRlLnNldCh7XG5cdFx0XHRcdHR5cGU6ICdpbWFnZSdcblx0XHRcdH0pO1xuXG5cdFx0XHRzdGF0ZS5wcm9wcy5zZXQoe1xuXHRcdFx0XHR3aWR0aDogIGltYWdlLndpZHRoLFxuXHRcdFx0XHRoZWlnaHQ6IGltYWdlLmhlaWdodFxuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdGltYWdlLm9uZXJyb3IgPSBkZWZlcnJlZC5yZWplY3Q7XG5cdFx0aW1hZ2Uuc3JjID0gdXJsO1xuXHR9LFxuXG5cdHJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZnJhbWUudG9vbGJhci5nZXQoKS5yZWZyZXNoKCk7XG5cdH0sXG5cblx0cmVzZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMucHJvcHMuY2xlYXIoKS5zZXQoeyB1cmw6ICcnIH0pO1xuXG5cdFx0aWYgKCB0aGlzLmFjdGl2ZSApIHtcblx0XHRcdHRoaXMucmVmcmVzaCgpO1xuXHRcdH1cblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRW1iZWQ7XG4iLCIvKmdsb2JhbHMgd3AsIF8gKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5jb250cm9sbGVyLkZlYXR1cmVkSW1hZ2VcbiAqXG4gKiBBIHN0YXRlIGZvciBzZWxlY3RpbmcgYSBmZWF0dXJlZCBpbWFnZSBmb3IgYSBwb3N0LlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuTGlicmFyeVxuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5Nb2RlbFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzXSAgICAgICAgICAgICAgICAgICAgICAgICAgVGhlIGF0dHJpYnV0ZXMgaGFzaCBwYXNzZWQgdG8gdGhlIHN0YXRlLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuaWQ9ZmVhdHVyZWQtaW1hZ2VdICAgICAgICBVbmlxdWUgaWRlbnRpZmllci5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnRpdGxlPVNldCBGZWF0dXJlZCBJbWFnZV0gVGl0bGUgZm9yIHRoZSBzdGF0ZS4gRGlzcGxheXMgaW4gdGhlIG1lZGlhIG1lbnUgYW5kIHRoZSBmcmFtZSdzIHRpdGxlIHJlZ2lvbi5cbiAqIEBwYXJhbSB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudHN9IFthdHRyaWJ1dGVzLmxpYnJhcnldICAgICAgICAgICAgICAgICAgVGhlIGF0dGFjaG1lbnRzIGNvbGxlY3Rpb24gdG8gYnJvd3NlLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJZiBvbmUgaXMgbm90IHN1cHBsaWVkLCBhIGNvbGxlY3Rpb24gb2YgYWxsIGltYWdlcyB3aWxsIGJlIGNyZWF0ZWQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5tdWx0aXBsZT1mYWxzZV0gICAgICAgICAgIFdoZXRoZXIgbXVsdGktc2VsZWN0IGlzIGVuYWJsZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5jb250ZW50PXVwbG9hZF0gICAgICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIGNvbnRlbnQgcmVnaW9uLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPdmVycmlkZGVuIGJ5IHBlcnNpc3RlbnQgdXNlciBzZXR0aW5nIGlmICdjb250ZW50VXNlclNldHRpbmcnIGlzIHRydWUuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5tZW51PWRlZmF1bHRdICAgICAgICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIG1lbnUgcmVnaW9uLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMucm91dGVyPWJyb3dzZV0gICAgICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSByb3V0ZXIgcmVnaW9uLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMudG9vbGJhcj1mZWF0dXJlZC1pbWFnZV0gICBJbml0aWFsIG1vZGUgZm9yIHRoZSB0b29sYmFyIHJlZ2lvbi5cbiAqIEBwYXJhbSB7aW50fSAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnByaW9yaXR5PTYwXSAgICAgICAgICAgICAgVGhlIHByaW9yaXR5IGZvciB0aGUgc3RhdGUgbGluayBpbiB0aGUgbWVkaWEgbWVudS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnNlYXJjaGFibGU9dHJ1ZV0gICAgICAgICAgV2hldGhlciB0aGUgbGlicmFyeSBpcyBzZWFyY2hhYmxlLlxuICogQHBhcmFtIHtib29sZWFufHN0cmluZ30gICAgICAgICAgICAgW2F0dHJpYnV0ZXMuZmlsdGVyYWJsZT1mYWxzZV0gICAgICAgICBXaGV0aGVyIHRoZSBsaWJyYXJ5IGlzIGZpbHRlcmFibGUsIGFuZCBpZiBzbyB3aGF0IGZpbHRlcnMgc2hvdWxkIGJlIHNob3duLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBY2NlcHRzICdhbGwnLCAndXBsb2FkZWQnLCBvciAndW5hdHRhY2hlZCcuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5zb3J0YWJsZT10cnVlXSAgICAgICAgICAgIFdoZXRoZXIgdGhlIEF0dGFjaG1lbnRzIHNob3VsZCBiZSBzb3J0YWJsZS4gRGVwZW5kcyBvbiB0aGUgb3JkZXJieSBwcm9wZXJ0eSBiZWluZyBzZXQgdG8gbWVudU9yZGVyIG9uIHRoZSBhdHRhY2htZW50cyBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuYXV0b1NlbGVjdD10cnVlXSAgICAgICAgICBXaGV0aGVyIGFuIHVwbG9hZGVkIGF0dGFjaG1lbnQgc2hvdWxkIGJlIGF1dG9tYXRpY2FsbHkgYWRkZWQgdG8gdGhlIHNlbGVjdGlvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmRlc2NyaWJlPWZhbHNlXSAgICAgICAgICAgV2hldGhlciB0byBvZmZlciBVSSB0byBkZXNjcmliZSBhdHRhY2htZW50cyAtIGUuZy4gY2FwdGlvbmluZyBpbWFnZXMgaW4gYSBnYWxsZXJ5LlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuY29udGVudFVzZXJTZXR0aW5nPXRydWVdICBXaGV0aGVyIHRoZSBjb250ZW50IHJlZ2lvbidzIG1vZGUgc2hvdWxkIGJlIHNldCBhbmQgcGVyc2lzdGVkIHBlciB1c2VyLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc3luY1NlbGVjdGlvbj10cnVlXSAgICAgICBXaGV0aGVyIHRoZSBBdHRhY2htZW50cyBzZWxlY3Rpb24gc2hvdWxkIGJlIHBlcnNpc3RlZCBmcm9tIHRoZSBsYXN0IHN0YXRlLlxuICovXG52YXIgQXR0YWNobWVudCA9IHdwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnQsXG5cdExpYnJhcnkgPSB3cC5tZWRpYS5jb250cm9sbGVyLkxpYnJhcnksXG5cdGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdEZlYXR1cmVkSW1hZ2U7XG5cbkZlYXR1cmVkSW1hZ2UgPSBMaWJyYXJ5LmV4dGVuZCh7XG5cdGRlZmF1bHRzOiBfLmRlZmF1bHRzKHtcblx0XHRpZDogICAgICAgICAgICAnZmVhdHVyZWQtaW1hZ2UnLFxuXHRcdHRpdGxlOiAgICAgICAgIGwxMG4uc2V0RmVhdHVyZWRJbWFnZVRpdGxlLFxuXHRcdG11bHRpcGxlOiAgICAgIGZhbHNlLFxuXHRcdGZpbHRlcmFibGU6ICAgICd1cGxvYWRlZCcsXG5cdFx0dG9vbGJhcjogICAgICAgJ2ZlYXR1cmVkLWltYWdlJyxcblx0XHRwcmlvcml0eTogICAgICA2MCxcblx0XHRzeW5jU2VsZWN0aW9uOiB0cnVlXG5cdH0sIExpYnJhcnkucHJvdG90eXBlLmRlZmF1bHRzICksXG5cblx0LyoqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGxpYnJhcnksIGNvbXBhcmF0b3I7XG5cblx0XHQvLyBJZiB3ZSBoYXZlbid0IGJlZW4gcHJvdmlkZWQgYSBgbGlicmFyeWAsIGNyZWF0ZSBhIGBTZWxlY3Rpb25gLlxuXHRcdGlmICggISB0aGlzLmdldCgnbGlicmFyeScpICkge1xuXHRcdFx0dGhpcy5zZXQoICdsaWJyYXJ5Jywgd3AubWVkaWEucXVlcnkoeyB0eXBlOiAnaW1hZ2UnIH0pICk7XG5cdFx0fVxuXG5cdFx0TGlicmFyeS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHRsaWJyYXJ5ICAgID0gdGhpcy5nZXQoJ2xpYnJhcnknKTtcblx0XHRjb21wYXJhdG9yID0gbGlicmFyeS5jb21wYXJhdG9yO1xuXG5cdFx0Ly8gT3ZlcmxvYWQgdGhlIGxpYnJhcnkncyBjb21wYXJhdG9yIHRvIHB1c2ggaXRlbXMgdGhhdCBhcmUgbm90IGluXG5cdFx0Ly8gdGhlIG1pcnJvcmVkIHF1ZXJ5IHRvIHRoZSBmcm9udCBvZiB0aGUgYWdncmVnYXRlIGNvbGxlY3Rpb24uXG5cdFx0bGlicmFyeS5jb21wYXJhdG9yID0gZnVuY3Rpb24oIGEsIGIgKSB7XG5cdFx0XHR2YXIgYUluUXVlcnkgPSAhISB0aGlzLm1pcnJvcmluZy5nZXQoIGEuY2lkICksXG5cdFx0XHRcdGJJblF1ZXJ5ID0gISEgdGhpcy5taXJyb3JpbmcuZ2V0KCBiLmNpZCApO1xuXG5cdFx0XHRpZiAoICEgYUluUXVlcnkgJiYgYkluUXVlcnkgKSB7XG5cdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdH0gZWxzZSBpZiAoIGFJblF1ZXJ5ICYmICEgYkluUXVlcnkgKSB7XG5cdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGNvbXBhcmF0b3IuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvLyBBZGQgYWxsIGl0ZW1zIGluIHRoZSBzZWxlY3Rpb24gdG8gdGhlIGxpYnJhcnksIHNvIGFueSBmZWF0dXJlZFxuXHRcdC8vIGltYWdlcyB0aGF0IGFyZSBub3QgaW5pdGlhbGx5IGxvYWRlZCBzdGlsbCBhcHBlYXIuXG5cdFx0bGlicmFyeS5vYnNlcnZlKCB0aGlzLmdldCgnc2VsZWN0aW9uJykgKTtcblx0fSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy51cGRhdGVTZWxlY3Rpb24oKTtcblx0XHR0aGlzLmZyYW1lLm9uKCAnb3BlbicsIHRoaXMudXBkYXRlU2VsZWN0aW9uLCB0aGlzICk7XG5cblx0XHRMaWJyYXJ5LnByb3RvdHlwZS5hY3RpdmF0ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0ZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mcmFtZS5vZmYoICdvcGVuJywgdGhpcy51cGRhdGVTZWxlY3Rpb24sIHRoaXMgKTtcblxuXHRcdExpYnJhcnkucHJvdG90eXBlLmRlYWN0aXZhdGUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdHVwZGF0ZVNlbGVjdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMuZ2V0KCdzZWxlY3Rpb24nKSxcblx0XHRcdGlkID0gd3AubWVkaWEudmlldy5zZXR0aW5ncy5wb3N0LmZlYXR1cmVkSW1hZ2VJZCxcblx0XHRcdGF0dGFjaG1lbnQ7XG5cblx0XHRpZiAoICcnICE9PSBpZCAmJiAtMSAhPT0gaWQgKSB7XG5cdFx0XHRhdHRhY2htZW50ID0gQXR0YWNobWVudC5nZXQoIGlkICk7XG5cdFx0XHRhdHRhY2htZW50LmZldGNoKCk7XG5cdFx0fVxuXG5cdFx0c2VsZWN0aW9uLnJlc2V0KCBhdHRhY2htZW50ID8gWyBhdHRhY2htZW50IF0gOiBbXSApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGZWF0dXJlZEltYWdlO1xuIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEuY29udHJvbGxlci5HYWxsZXJ5QWRkXG4gKlxuICogQSBzdGF0ZSBmb3Igc2VsZWN0aW5nIG1vcmUgaW1hZ2VzIHRvIGFkZCB0byBhIGdhbGxlcnkuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5XG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZVxuICogQGF1Z21lbnRzIEJhY2tib25lLk1vZGVsXG4gKlxuICogQHBhcmFtIHtvYmplY3R9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXNdICAgICAgICAgICAgICAgICAgICAgICAgIFRoZSBhdHRyaWJ1dGVzIGhhc2ggcGFzc2VkIHRvIHRoZSBzdGF0ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmlkPWdhbGxlcnktbGlicmFyeV0gICAgICBVbmlxdWUgaWRlbnRpZmllci5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnRpdGxlPUFkZCB0byBHYWxsZXJ5XSAgICBUaXRsZSBmb3IgdGhlIHN0YXRlLiBEaXNwbGF5cyBpbiB0aGUgZnJhbWUncyB0aXRsZSByZWdpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5tdWx0aXBsZT1hZGRdICAgICAgICAgICAgV2hldGhlciBtdWx0aS1zZWxlY3QgaXMgZW5hYmxlZC4gQHRvZG8gJ2FkZCcgZG9lc24ndCBzZWVtIGRvIGFueXRoaW5nIHNwZWNpYWwsIGFuZCBnZXRzIHVzZWQgYXMgYSBib29sZWFuLlxuICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c30gW2F0dHJpYnV0ZXMubGlicmFyeV0gICAgICAgICAgICAgICAgIFRoZSBhdHRhY2htZW50cyBjb2xsZWN0aW9uIHRvIGJyb3dzZS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJZiBvbmUgaXMgbm90IHN1cHBsaWVkLCBhIGNvbGxlY3Rpb24gb2YgYWxsIGltYWdlcyB3aWxsIGJlIGNyZWF0ZWQuXG4gKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSAgICAgICAgICAgICBbYXR0cmlidXRlcy5maWx0ZXJhYmxlPXVwbG9hZGVkXSAgICAgV2hldGhlciB0aGUgbGlicmFyeSBpcyBmaWx0ZXJhYmxlLCBhbmQgaWYgc28gd2hhdCBmaWx0ZXJzIHNob3VsZCBiZSBzaG93bi5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBY2NlcHRzICdhbGwnLCAndXBsb2FkZWQnLCBvciAndW5hdHRhY2hlZCcuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5tZW51PWdhbGxlcnldICAgICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgbWVudSByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5jb250ZW50PXVwbG9hZF0gICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgY29udGVudCByZWdpb24uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT3ZlcnJpZGRlbiBieSBwZXJzaXN0ZW50IHVzZXIgc2V0dGluZyBpZiAnY29udGVudFVzZXJTZXR0aW5nJyBpcyB0cnVlLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMucm91dGVyPWJyb3dzZV0gICAgICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIHJvdXRlciByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy50b29sYmFyPWdhbGxlcnktYWRkXSAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgdG9vbGJhciByZWdpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5zZWFyY2hhYmxlPXRydWVdICAgICAgICAgV2hldGhlciB0aGUgbGlicmFyeSBpcyBzZWFyY2hhYmxlLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc29ydGFibGU9dHJ1ZV0gICAgICAgICAgIFdoZXRoZXIgdGhlIEF0dGFjaG1lbnRzIHNob3VsZCBiZSBzb3J0YWJsZS4gRGVwZW5kcyBvbiB0aGUgb3JkZXJieSBwcm9wZXJ0eSBiZWluZyBzZXQgdG8gbWVudU9yZGVyIG9uIHRoZSBhdHRhY2htZW50cyBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuYXV0b1NlbGVjdD10cnVlXSAgICAgICAgIFdoZXRoZXIgYW4gdXBsb2FkZWQgYXR0YWNobWVudCBzaG91bGQgYmUgYXV0b21hdGljYWxseSBhZGRlZCB0byB0aGUgc2VsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuY29udGVudFVzZXJTZXR0aW5nPXRydWVdIFdoZXRoZXIgdGhlIGNvbnRlbnQgcmVnaW9uJ3MgbW9kZSBzaG91bGQgYmUgc2V0IGFuZCBwZXJzaXN0ZWQgcGVyIHVzZXIuXG4gKiBAcGFyYW0ge2ludH0gICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5wcmlvcml0eT0xMDBdICAgICAgICAgICAgVGhlIHByaW9yaXR5IGZvciB0aGUgc3RhdGUgbGluayBpbiB0aGUgbWVkaWEgbWVudS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnN5bmNTZWxlY3Rpb249ZmFsc2VdICAgICBXaGV0aGVyIHRoZSBBdHRhY2htZW50cyBzZWxlY3Rpb24gc2hvdWxkIGJlIHBlcnNpc3RlZCBmcm9tIHRoZSBsYXN0IHN0YXRlLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIERlZmF1bHRzIHRvIGZhbHNlIGJlY2F1c2UgZm9yIHRoaXMgc3RhdGUsIGJlY2F1c2UgdGhlIGxpYnJhcnkgb2YgdGhlIEVkaXQgR2FsbGVyeSBzdGF0ZSBpcyB0aGUgc2VsZWN0aW9uLlxuICovXG52YXIgU2VsZWN0aW9uID0gd3AubWVkaWEubW9kZWwuU2VsZWN0aW9uLFxuXHRMaWJyYXJ5ID0gd3AubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5LFxuXHRsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHRHYWxsZXJ5QWRkO1xuXG5HYWxsZXJ5QWRkID0gTGlicmFyeS5leHRlbmQoe1xuXHRkZWZhdWx0czogXy5kZWZhdWx0cyh7XG5cdFx0aWQ6ICAgICAgICAgICAgJ2dhbGxlcnktbGlicmFyeScsXG5cdFx0dGl0bGU6ICAgICAgICAgbDEwbi5hZGRUb0dhbGxlcnlUaXRsZSxcblx0XHRtdWx0aXBsZTogICAgICAnYWRkJyxcblx0XHRmaWx0ZXJhYmxlOiAgICAndXBsb2FkZWQnLFxuXHRcdG1lbnU6ICAgICAgICAgICdnYWxsZXJ5Jyxcblx0XHR0b29sYmFyOiAgICAgICAnZ2FsbGVyeS1hZGQnLFxuXHRcdHByaW9yaXR5OiAgICAgIDEwMCxcblx0XHRzeW5jU2VsZWN0aW9uOiBmYWxzZVxuXHR9LCBMaWJyYXJ5LnByb3RvdHlwZS5kZWZhdWx0cyApLFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIElmIGEgbGlicmFyeSB3YXNuJ3Qgc3VwcGxpZWQsIGNyZWF0ZSBhIGxpYnJhcnkgb2YgaW1hZ2VzLlxuXHRcdGlmICggISB0aGlzLmdldCgnbGlicmFyeScpICkge1xuXHRcdFx0dGhpcy5zZXQoICdsaWJyYXJ5Jywgd3AubWVkaWEucXVlcnkoeyB0eXBlOiAnaW1hZ2UnIH0pICk7XG5cdFx0fVxuXG5cdFx0TGlicmFyeS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBsaWJyYXJ5ID0gdGhpcy5nZXQoJ2xpYnJhcnknKSxcblx0XHRcdGVkaXQgICAgPSB0aGlzLmZyYW1lLnN0YXRlKCdnYWxsZXJ5LWVkaXQnKS5nZXQoJ2xpYnJhcnknKTtcblxuXHRcdGlmICggdGhpcy5lZGl0TGlicmFyeSAmJiB0aGlzLmVkaXRMaWJyYXJ5ICE9PSBlZGl0ICkge1xuXHRcdFx0bGlicmFyeS51bm9ic2VydmUoIHRoaXMuZWRpdExpYnJhcnkgKTtcblx0XHR9XG5cblx0XHQvLyBBY2NlcHRzIGF0dGFjaG1lbnRzIHRoYXQgZXhpc3QgaW4gdGhlIG9yaWdpbmFsIGxpYnJhcnkgYW5kXG5cdFx0Ly8gdGhhdCBkbyBub3QgZXhpc3QgaW4gZ2FsbGVyeSdzIGxpYnJhcnkuXG5cdFx0bGlicmFyeS52YWxpZGF0b3IgPSBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblx0XHRcdHJldHVybiAhISB0aGlzLm1pcnJvcmluZy5nZXQoIGF0dGFjaG1lbnQuY2lkICkgJiYgISBlZGl0LmdldCggYXR0YWNobWVudC5jaWQgKSAmJiBTZWxlY3Rpb24ucHJvdG90eXBlLnZhbGlkYXRvci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0fTtcblxuXHRcdC8vIFJlc2V0IHRoZSBsaWJyYXJ5IHRvIGVuc3VyZSB0aGF0IGFsbCBhdHRhY2htZW50cyBhcmUgcmUtYWRkZWRcblx0XHQvLyB0byB0aGUgY29sbGVjdGlvbi4gRG8gc28gc2lsZW50bHksIGFzIGNhbGxpbmcgYG9ic2VydmVgIHdpbGxcblx0XHQvLyB0cmlnZ2VyIHRoZSBgcmVzZXRgIGV2ZW50LlxuXHRcdGxpYnJhcnkucmVzZXQoIGxpYnJhcnkubWlycm9yaW5nLm1vZGVscywgeyBzaWxlbnQ6IHRydWUgfSk7XG5cdFx0bGlicmFyeS5vYnNlcnZlKCBlZGl0ICk7XG5cdFx0dGhpcy5lZGl0TGlicmFyeSA9IGVkaXQ7XG5cblx0XHRMaWJyYXJ5LnByb3RvdHlwZS5hY3RpdmF0ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbGxlcnlBZGQ7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5jb250cm9sbGVyLkdhbGxlcnlFZGl0XG4gKlxuICogQSBzdGF0ZSBmb3IgZWRpdGluZyBhIGdhbGxlcnkncyBpbWFnZXMgYW5kIHNldHRpbmdzLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuTGlicmFyeVxuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5Nb2RlbFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzXSAgICAgICAgICAgICAgICAgICAgICAgVGhlIGF0dHJpYnV0ZXMgaGFzaCBwYXNzZWQgdG8gdGhlIHN0YXRlLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuaWQ9Z2FsbGVyeS1lZGl0XSAgICAgICBVbmlxdWUgaWRlbnRpZmllci5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnRpdGxlPUVkaXQgR2FsbGVyeV0gICAgVGl0bGUgZm9yIHRoZSBzdGF0ZS4gRGlzcGxheXMgaW4gdGhlIGZyYW1lJ3MgdGl0bGUgcmVnaW9uLlxuICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c30gW2F0dHJpYnV0ZXMubGlicmFyeV0gICAgICAgICAgICAgICBUaGUgY29sbGVjdGlvbiBvZiBhdHRhY2htZW50cyBpbiB0aGUgZ2FsbGVyeS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSWYgb25lIGlzIG5vdCBzdXBwbGllZCwgYW4gZW1wdHkgbWVkaWEubW9kZWwuU2VsZWN0aW9uIGNvbGxlY3Rpb24gaXMgY3JlYXRlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLm11bHRpcGxlPWZhbHNlXSAgICAgICAgV2hldGhlciBtdWx0aS1zZWxlY3QgaXMgZW5hYmxlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnNlYXJjaGFibGU9ZmFsc2VdICAgICAgV2hldGhlciB0aGUgbGlicmFyeSBpcyBzZWFyY2hhYmxlLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc29ydGFibGU9dHJ1ZV0gICAgICAgICBXaGV0aGVyIHRoZSBBdHRhY2htZW50cyBzaG91bGQgYmUgc29ydGFibGUuIERlcGVuZHMgb24gdGhlIG9yZGVyYnkgcHJvcGVydHkgYmVpbmcgc2V0IHRvIG1lbnVPcmRlciBvbiB0aGUgYXR0YWNobWVudHMgY29sbGVjdGlvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmRhdGU9dHJ1ZV0gICAgICAgICAgICAgV2hldGhlciB0byBzaG93IHRoZSBkYXRlIGZpbHRlciBpbiB0aGUgYnJvd3NlcidzIHRvb2xiYXIuXG4gKiBAcGFyYW0ge3N0cmluZ3xmYWxzZX0gICAgICAgICAgICAgICBbYXR0cmlidXRlcy5jb250ZW50PWJyb3dzZV0gICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIGNvbnRlbnQgcmVnaW9uLlxuICogQHBhcmFtIHtzdHJpbmd8ZmFsc2V9ICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMudG9vbGJhcj1pbWFnZS1kZXRhaWxzXSBJbml0aWFsIG1vZGUgZm9yIHRoZSB0b29sYmFyIHJlZ2lvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmRlc2NyaWJlPXRydWVdICAgICAgICAgV2hldGhlciB0byBvZmZlciBVSSB0byBkZXNjcmliZSBhdHRhY2htZW50cyAtIGUuZy4gY2FwdGlvbmluZyBpbWFnZXMgaW4gYSBnYWxsZXJ5LlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuZGlzcGxheVNldHRpbmdzPXRydWVdICBXaGV0aGVyIHRvIHNob3cgdGhlIGF0dGFjaG1lbnQgZGlzcGxheSBzZXR0aW5ncyBpbnRlcmZhY2UuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5kcmFnSW5mbz10cnVlXSAgICAgICAgIFdoZXRoZXIgdG8gc2hvdyBpbnN0cnVjdGlvbmFsIHRleHQgYWJvdXQgdGhlIGF0dGFjaG1lbnRzIGJlaW5nIHNvcnRhYmxlLlxuICogQHBhcmFtIHtpbnR9ICAgICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuaWRlYWxDb2x1bW5XaWR0aD0xNzBdICBUaGUgaWRlYWwgY29sdW1uIHdpZHRoIGluIHBpeGVscyBmb3IgYXR0YWNobWVudHMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5lZGl0aW5nPWZhbHNlXSAgICAgICAgIFdoZXRoZXIgdGhlIGdhbGxlcnkgaXMgYmVpbmcgY3JlYXRlZCwgb3IgZWRpdGluZyBhbiBleGlzdGluZyBpbnN0YW5jZS5cbiAqIEBwYXJhbSB7aW50fSAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnByaW9yaXR5PTYwXSAgICAgICAgICAgVGhlIHByaW9yaXR5IGZvciB0aGUgc3RhdGUgbGluayBpbiB0aGUgbWVkaWEgbWVudS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnN5bmNTZWxlY3Rpb249ZmFsc2VdICAgV2hldGhlciB0aGUgQXR0YWNobWVudHMgc2VsZWN0aW9uIHNob3VsZCBiZSBwZXJzaXN0ZWQgZnJvbSB0aGUgbGFzdCBzdGF0ZS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRGVmYXVsdHMgdG8gZmFsc2UgZm9yIHRoaXMgc3RhdGUsIGJlY2F1c2UgdGhlIGxpYnJhcnkgcGFzc2VkIGluICAqaXMqIHRoZSBzZWxlY3Rpb24uXG4gKiBAcGFyYW0ge3ZpZXd9ICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5BdHRhY2htZW50Vmlld10gICAgICAgIFRoZSBzaW5nbGUgYEF0dGFjaG1lbnRgIHZpZXcgdG8gYmUgdXNlZCBpbiB0aGUgYEF0dGFjaG1lbnRzYC5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSWYgbm9uZSBzdXBwbGllZCwgZGVmYXVsdHMgdG8gd3AubWVkaWEudmlldy5BdHRhY2htZW50LkVkaXRMaWJyYXJ5LlxuICovXG52YXIgTGlicmFyeSA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuTGlicmFyeSxcblx0bDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0R2FsbGVyeUVkaXQ7XG5cbkdhbGxlcnlFZGl0ID0gTGlicmFyeS5leHRlbmQoe1xuXHRkZWZhdWx0czoge1xuXHRcdGlkOiAgICAgICAgICAgICAgICdnYWxsZXJ5LWVkaXQnLFxuXHRcdHRpdGxlOiAgICAgICAgICAgIGwxMG4uZWRpdEdhbGxlcnlUaXRsZSxcblx0XHRtdWx0aXBsZTogICAgICAgICBmYWxzZSxcblx0XHRzZWFyY2hhYmxlOiAgICAgICBmYWxzZSxcblx0XHRzb3J0YWJsZTogICAgICAgICB0cnVlLFxuXHRcdGRhdGU6ICAgICAgICAgICAgIGZhbHNlLFxuXHRcdGRpc3BsYXk6ICAgICAgICAgIGZhbHNlLFxuXHRcdGNvbnRlbnQ6ICAgICAgICAgICdicm93c2UnLFxuXHRcdHRvb2xiYXI6ICAgICAgICAgICdnYWxsZXJ5LWVkaXQnLFxuXHRcdGRlc2NyaWJlOiAgICAgICAgIHRydWUsXG5cdFx0ZGlzcGxheVNldHRpbmdzOiAgdHJ1ZSxcblx0XHRkcmFnSW5mbzogICAgICAgICB0cnVlLFxuXHRcdGlkZWFsQ29sdW1uV2lkdGg6IDE3MCxcblx0XHRlZGl0aW5nOiAgICAgICAgICBmYWxzZSxcblx0XHRwcmlvcml0eTogICAgICAgICA2MCxcblx0XHRzeW5jU2VsZWN0aW9uOiAgICBmYWxzZVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIElmIHdlIGhhdmVuJ3QgYmVlbiBwcm92aWRlZCBhIGBsaWJyYXJ5YCwgY3JlYXRlIGEgYFNlbGVjdGlvbmAuXG5cdFx0aWYgKCAhIHRoaXMuZ2V0KCdsaWJyYXJ5JykgKSB7XG5cdFx0XHR0aGlzLnNldCggJ2xpYnJhcnknLCBuZXcgd3AubWVkaWEubW9kZWwuU2VsZWN0aW9uKCkgKTtcblx0XHR9XG5cblx0XHQvLyBUaGUgc2luZ2xlIGBBdHRhY2htZW50YCB2aWV3IHRvIGJlIHVzZWQgaW4gdGhlIGBBdHRhY2htZW50c2Agdmlldy5cblx0XHRpZiAoICEgdGhpcy5nZXQoJ0F0dGFjaG1lbnRWaWV3JykgKSB7XG5cdFx0XHR0aGlzLnNldCggJ0F0dGFjaG1lbnRWaWV3Jywgd3AubWVkaWEudmlldy5BdHRhY2htZW50LkVkaXRMaWJyYXJ5ICk7XG5cdFx0fVxuXG5cdFx0TGlicmFyeS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBsaWJyYXJ5ID0gdGhpcy5nZXQoJ2xpYnJhcnknKTtcblxuXHRcdC8vIExpbWl0IHRoZSBsaWJyYXJ5IHRvIGltYWdlcyBvbmx5LlxuXHRcdGxpYnJhcnkucHJvcHMuc2V0KCAndHlwZScsICdpbWFnZScgKTtcblxuXHRcdC8vIFdhdGNoIGZvciB1cGxvYWRlZCBhdHRhY2htZW50cy5cblx0XHR0aGlzLmdldCgnbGlicmFyeScpLm9ic2VydmUoIHdwLlVwbG9hZGVyLnF1ZXVlICk7XG5cblx0XHR0aGlzLmZyYW1lLm9uKCAnY29udGVudDpyZW5kZXI6YnJvd3NlJywgdGhpcy5nYWxsZXJ5U2V0dGluZ3MsIHRoaXMgKTtcblxuXHRcdExpYnJhcnkucHJvdG90eXBlLmFjdGl2YXRlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHQvLyBTdG9wIHdhdGNoaW5nIGZvciB1cGxvYWRlZCBhdHRhY2htZW50cy5cblx0XHR0aGlzLmdldCgnbGlicmFyeScpLnVub2JzZXJ2ZSggd3AuVXBsb2FkZXIucXVldWUgKTtcblxuXHRcdHRoaXMuZnJhbWUub2ZmKCAnY29udGVudDpyZW5kZXI6YnJvd3NlJywgdGhpcy5nYWxsZXJ5U2V0dGluZ3MsIHRoaXMgKTtcblxuXHRcdExpYnJhcnkucHJvdG90eXBlLmRlYWN0aXZhdGUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICpcblx0ICogQHBhcmFtIGJyb3dzZXJcblx0ICovXG5cdGdhbGxlcnlTZXR0aW5nczogZnVuY3Rpb24oIGJyb3dzZXIgKSB7XG5cdFx0aWYgKCAhIHRoaXMuZ2V0KCdkaXNwbGF5U2V0dGluZ3MnKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgbGlicmFyeSA9IHRoaXMuZ2V0KCdsaWJyYXJ5Jyk7XG5cblx0XHRpZiAoICEgbGlicmFyeSB8fCAhIGJyb3dzZXIgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bGlicmFyeS5nYWxsZXJ5ID0gbGlicmFyeS5nYWxsZXJ5IHx8IG5ldyBCYWNrYm9uZS5Nb2RlbCgpO1xuXG5cdFx0YnJvd3Nlci5zaWRlYmFyLnNldCh7XG5cdFx0XHRnYWxsZXJ5OiBuZXcgd3AubWVkaWEudmlldy5TZXR0aW5ncy5HYWxsZXJ5KHtcblx0XHRcdFx0Y29udHJvbGxlcjogdGhpcyxcblx0XHRcdFx0bW9kZWw6ICAgICAgbGlicmFyeS5nYWxsZXJ5LFxuXHRcdFx0XHRwcmlvcml0eTogICA0MFxuXHRcdFx0fSlcblx0XHR9KTtcblxuXHRcdGJyb3dzZXIudG9vbGJhci5zZXQoICdyZXZlcnNlJywge1xuXHRcdFx0dGV4dDogICAgIGwxMG4ucmV2ZXJzZU9yZGVyLFxuXHRcdFx0cHJpb3JpdHk6IDgwLFxuXG5cdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGxpYnJhcnkucmVzZXQoIGxpYnJhcnkudG9BcnJheSgpLnJldmVyc2UoKSApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYWxsZXJ5RWRpdDtcbiIsIi8qZ2xvYmFscyB3cCwgXyAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLmNvbnRyb2xsZXIuSW1hZ2VEZXRhaWxzXG4gKlxuICogQSBzdGF0ZSBmb3IgZWRpdGluZyB0aGUgYXR0YWNobWVudCBkaXNwbGF5IHNldHRpbmdzIG9mIGFuIGltYWdlIHRoYXQncyBiZWVuXG4gKiBpbnNlcnRlZCBpbnRvIHRoZSBlZGl0b3IuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZVxuICogQGF1Z21lbnRzIEJhY2tib25lLk1vZGVsXG4gKlxuICogQHBhcmFtIHtvYmplY3R9ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlc10gICAgICAgICAgICAgICAgICAgICAgIFRoZSBhdHRyaWJ1dGVzIGhhc2ggcGFzc2VkIHRvIHRoZSBzdGF0ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuaWQ9aW1hZ2UtZGV0YWlsc10gICAgICBVbmlxdWUgaWRlbnRpZmllci5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMudGl0bGU9SW1hZ2UgRGV0YWlsc10gICBUaXRsZSBmb3IgdGhlIHN0YXRlLiBEaXNwbGF5cyBpbiB0aGUgZnJhbWUncyB0aXRsZSByZWdpb24uXG4gKiBAcGFyYW0ge3dwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnR9IGF0dHJpYnV0ZXMuaW1hZ2UgICAgICAgICAgICAgICAgICAgVGhlIGltYWdlJ3MgbW9kZWwuXG4gKiBAcGFyYW0ge3N0cmluZ3xmYWxzZX0gICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmNvbnRlbnQ9aW1hZ2UtZGV0YWlsc10gSW5pdGlhbCBtb2RlIGZvciB0aGUgY29udGVudCByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ3xmYWxzZX0gICAgICAgICAgICAgIFthdHRyaWJ1dGVzLm1lbnU9ZmFsc2VdICAgICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgbWVudSByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ3xmYWxzZX0gICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnJvdXRlcj1mYWxzZV0gICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgcm91dGVyIHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfGZhbHNlfSAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMudG9vbGJhcj1pbWFnZS1kZXRhaWxzXSBJbml0aWFsIG1vZGUgZm9yIHRoZSB0b29sYmFyIHJlZ2lvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuZWRpdGluZz1mYWxzZV0gICAgICAgICBVbnVzZWQuXG4gKiBAcGFyYW0ge2ludH0gICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnByaW9yaXR5PTYwXSAgICAgICAgICAgVW51c2VkLlxuICpcbiAqIEB0b2RvIFRoaXMgc3RhdGUgaW5oZXJpdHMgc29tZSBkZWZhdWx0cyBmcm9tIG1lZGlhLmNvbnRyb2xsZXIuTGlicmFyeS5wcm90b3R5cGUuZGVmYXVsdHMsXG4gKiAgICAgICBob3dldmVyIHRoaXMgbWF5IG5vdCBkbyBhbnl0aGluZy5cbiAqL1xudmFyIFN0YXRlID0gd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZSxcblx0TGlicmFyeSA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuTGlicmFyeSxcblx0bDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0SW1hZ2VEZXRhaWxzO1xuXG5JbWFnZURldGFpbHMgPSBTdGF0ZS5leHRlbmQoe1xuXHRkZWZhdWx0czogXy5kZWZhdWx0cyh7XG5cdFx0aWQ6ICAgICAgICdpbWFnZS1kZXRhaWxzJyxcblx0XHR0aXRsZTogICAgbDEwbi5pbWFnZURldGFpbHNUaXRsZSxcblx0XHRjb250ZW50OiAgJ2ltYWdlLWRldGFpbHMnLFxuXHRcdG1lbnU6ICAgICBmYWxzZSxcblx0XHRyb3V0ZXI6ICAgZmFsc2UsXG5cdFx0dG9vbGJhcjogICdpbWFnZS1kZXRhaWxzJyxcblx0XHRlZGl0aW5nOiAgZmFsc2UsXG5cdFx0cHJpb3JpdHk6IDYwXG5cdH0sIExpYnJhcnkucHJvdG90eXBlLmRlZmF1bHRzICksXG5cblx0LyoqXG5cdCAqIEBzaW5jZSAzLjkuMFxuXHQgKlxuXHQgKiBAcGFyYW0gb3B0aW9ucyBBdHRyaWJ1dGVzXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHR0aGlzLmltYWdlID0gb3B0aW9ucy5pbWFnZTtcblx0XHRTdGF0ZS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBzaW5jZSAzLjkuMFxuXHQgKi9cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZnJhbWUubW9kYWwuJGVsLmFkZENsYXNzKCdpbWFnZS1kZXRhaWxzJyk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlRGV0YWlscztcbiIsIi8qZ2xvYmFscyB3cCwgXywgQmFja2JvbmUgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5jb250cm9sbGVyLkxpYnJhcnlcbiAqXG4gKiBBIHN0YXRlIGZvciBjaG9vc2luZyBhbiBhdHRhY2htZW50IG9yIGdyb3VwIG9mIGF0dGFjaG1lbnRzIGZyb20gdGhlIG1lZGlhIGxpYnJhcnkuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZVxuICogQGF1Z21lbnRzIEJhY2tib25lLk1vZGVsXG4gKiBAbWl4ZXMgbWVkaWEuc2VsZWN0aW9uU3luY1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSAgICAgICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXNdICAgICAgICAgICAgICAgICAgICAgICAgIFRoZSBhdHRyaWJ1dGVzIGhhc2ggcGFzc2VkIHRvIHRoZSBzdGF0ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuaWQ9bGlicmFyeV0gICAgICAgICAgICAgIFVuaXF1ZSBpZGVudGlmaWVyLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy50aXRsZT1NZWRpYSBsaWJyYXJ5XSAgICAgVGl0bGUgZm9yIHRoZSBzdGF0ZS4gRGlzcGxheXMgaW4gdGhlIG1lZGlhIG1lbnUgYW5kIHRoZSBmcmFtZSdzIHRpdGxlIHJlZ2lvbi5cbiAqIEBwYXJhbSB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudHN9ICAgICAgW2F0dHJpYnV0ZXMubGlicmFyeV0gICAgICAgICAgICAgICAgIFRoZSBhdHRhY2htZW50cyBjb2xsZWN0aW9uIHRvIGJyb3dzZS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIElmIG9uZSBpcyBub3Qgc3VwcGxpZWQsIGEgY29sbGVjdGlvbiBvZiBhbGwgYXR0YWNobWVudHMgd2lsbCBiZSBjcmVhdGVkLlxuICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5TZWxlY3Rpb258b2JqZWN0fSBbYXR0cmlidXRlcy5zZWxlY3Rpb25dICAgICAgICAgICAgICAgQSBjb2xsZWN0aW9uIHRvIGNvbnRhaW4gYXR0YWNobWVudCBzZWxlY3Rpb25zIHdpdGhpbiB0aGUgc3RhdGUuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJZiB0aGUgJ3NlbGVjdGlvbicgYXR0cmlidXRlIGlzIGEgcGxhaW4gSlMgb2JqZWN0LFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYSBTZWxlY3Rpb24gd2lsbCBiZSBjcmVhdGVkIHVzaW5nIGl0cyB2YWx1ZXMgYXMgdGhlIHNlbGVjdGlvbiBpbnN0YW5jZSdzIGBwcm9wc2AgbW9kZWwuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPdGhlcndpc2UsIGl0IHdpbGwgY29weSB0aGUgbGlicmFyeSdzIGBwcm9wc2AgbW9kZWwuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLm11bHRpcGxlPWZhbHNlXSAgICAgICAgICBXaGV0aGVyIG11bHRpLXNlbGVjdCBpcyBlbmFibGVkLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5jb250ZW50PXVwbG9hZF0gICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgY29udGVudCByZWdpb24uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPdmVycmlkZGVuIGJ5IHBlcnNpc3RlbnQgdXNlciBzZXR0aW5nIGlmICdjb250ZW50VXNlclNldHRpbmcnIGlzIHRydWUuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLm1lbnU9ZGVmYXVsdF0gICAgICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSBtZW51IHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMucm91dGVyPWJyb3dzZV0gICAgICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIHJvdXRlciByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnRvb2xiYXI9c2VsZWN0XSAgICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSB0b29sYmFyIHJlZ2lvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc2VhcmNoYWJsZT10cnVlXSAgICAgICAgIFdoZXRoZXIgdGhlIGxpYnJhcnkgaXMgc2VhcmNoYWJsZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9ICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuZmlsdGVyYWJsZT1mYWxzZV0gICAgICAgIFdoZXRoZXIgdGhlIGxpYnJhcnkgaXMgZmlsdGVyYWJsZSwgYW5kIGlmIHNvIHdoYXQgZmlsdGVycyBzaG91bGQgYmUgc2hvd24uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBY2NlcHRzICdhbGwnLCAndXBsb2FkZWQnLCBvciAndW5hdHRhY2hlZCcuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnNvcnRhYmxlPXRydWVdICAgICAgICAgICBXaGV0aGVyIHRoZSBBdHRhY2htZW50cyBzaG91bGQgYmUgc29ydGFibGUuIERlcGVuZHMgb24gdGhlIG9yZGVyYnkgcHJvcGVydHkgYmVpbmcgc2V0IHRvIG1lbnVPcmRlciBvbiB0aGUgYXR0YWNobWVudHMgY29sbGVjdGlvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuYXV0b1NlbGVjdD10cnVlXSAgICAgICAgIFdoZXRoZXIgYW4gdXBsb2FkZWQgYXR0YWNobWVudCBzaG91bGQgYmUgYXV0b21hdGljYWxseSBhZGRlZCB0byB0aGUgc2VsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5kZXNjcmliZT1mYWxzZV0gICAgICAgICAgV2hldGhlciB0byBvZmZlciBVSSB0byBkZXNjcmliZSBhdHRhY2htZW50cyAtIGUuZy4gY2FwdGlvbmluZyBpbWFnZXMgaW4gYSBnYWxsZXJ5LlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5jb250ZW50VXNlclNldHRpbmc9dHJ1ZV0gV2hldGhlciB0aGUgY29udGVudCByZWdpb24ncyBtb2RlIHNob3VsZCBiZSBzZXQgYW5kIHBlcnNpc3RlZCBwZXIgdXNlci5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc3luY1NlbGVjdGlvbj10cnVlXSAgICAgIFdoZXRoZXIgdGhlIEF0dGFjaG1lbnRzIHNlbGVjdGlvbiBzaG91bGQgYmUgcGVyc2lzdGVkIGZyb20gdGhlIGxhc3Qgc3RhdGUuXG4gKi9cbnZhciBsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHRnZXRVc2VyU2V0dGluZyA9IHdpbmRvdy5nZXRVc2VyU2V0dGluZyxcblx0c2V0VXNlclNldHRpbmcgPSB3aW5kb3cuc2V0VXNlclNldHRpbmcsXG5cdExpYnJhcnk7XG5cbkxpYnJhcnkgPSB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlLmV4dGVuZCh7XG5cdGRlZmF1bHRzOiB7XG5cdFx0aWQ6ICAgICAgICAgICAgICAgICAnbGlicmFyeScsXG5cdFx0dGl0bGU6ICAgICAgICAgICAgICBsMTBuLm1lZGlhTGlicmFyeVRpdGxlLFxuXHRcdG11bHRpcGxlOiAgICAgICAgICAgZmFsc2UsXG5cdFx0Y29udGVudDogICAgICAgICAgICAndXBsb2FkJyxcblx0XHRtZW51OiAgICAgICAgICAgICAgICdkZWZhdWx0Jyxcblx0XHRyb3V0ZXI6ICAgICAgICAgICAgICdicm93c2UnLFxuXHRcdHRvb2xiYXI6ICAgICAgICAgICAgJ3NlbGVjdCcsXG5cdFx0c2VhcmNoYWJsZTogICAgICAgICB0cnVlLFxuXHRcdGZpbHRlcmFibGU6ICAgICAgICAgZmFsc2UsXG5cdFx0c29ydGFibGU6ICAgICAgICAgICB0cnVlLFxuXHRcdGF1dG9TZWxlY3Q6ICAgICAgICAgdHJ1ZSxcblx0XHRkZXNjcmliZTogICAgICAgICAgIGZhbHNlLFxuXHRcdGNvbnRlbnRVc2VyU2V0dGluZzogdHJ1ZSxcblx0XHRzeW5jU2VsZWN0aW9uOiAgICAgIHRydWVcblx0fSxcblxuXHQvKipcblx0ICogSWYgYSBsaWJyYXJ5IGlzbid0IHByb3ZpZGVkLCBxdWVyeSBhbGwgbWVkaWEgaXRlbXMuXG5cdCAqIElmIGEgc2VsZWN0aW9uIGluc3RhbmNlIGlzbid0IHByb3ZpZGVkLCBjcmVhdGUgb25lLlxuXHQgKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLmdldCgnc2VsZWN0aW9uJyksXG5cdFx0XHRwcm9wcztcblxuXHRcdGlmICggISB0aGlzLmdldCgnbGlicmFyeScpICkge1xuXHRcdFx0dGhpcy5zZXQoICdsaWJyYXJ5Jywgd3AubWVkaWEucXVlcnkoKSApO1xuXHRcdH1cblxuXHRcdGlmICggISAoIHNlbGVjdGlvbiBpbnN0YW5jZW9mIHdwLm1lZGlhLm1vZGVsLlNlbGVjdGlvbiApICkge1xuXHRcdFx0cHJvcHMgPSBzZWxlY3Rpb247XG5cblx0XHRcdGlmICggISBwcm9wcyApIHtcblx0XHRcdFx0cHJvcHMgPSB0aGlzLmdldCgnbGlicmFyeScpLnByb3BzLnRvSlNPTigpO1xuXHRcdFx0XHRwcm9wcyA9IF8ub21pdCggcHJvcHMsICdvcmRlcmJ5JywgJ3F1ZXJ5JyApO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNldCggJ3NlbGVjdGlvbicsIG5ldyB3cC5tZWRpYS5tb2RlbC5TZWxlY3Rpb24oIG51bGwsIHtcblx0XHRcdFx0bXVsdGlwbGU6IHRoaXMuZ2V0KCdtdWx0aXBsZScpLFxuXHRcdFx0XHRwcm9wczogcHJvcHNcblx0XHRcdH0pICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5yZXNldERpc3BsYXlzKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc3luY1NlbGVjdGlvbigpO1xuXG5cdFx0d3AuVXBsb2FkZXIucXVldWUub24oICdhZGQnLCB0aGlzLnVwbG9hZGluZywgdGhpcyApO1xuXG5cdFx0dGhpcy5nZXQoJ3NlbGVjdGlvbicpLm9uKCAnYWRkIHJlbW92ZSByZXNldCcsIHRoaXMucmVmcmVzaENvbnRlbnQsIHRoaXMgKTtcblxuXHRcdGlmICggdGhpcy5nZXQoICdyb3V0ZXInICkgJiYgdGhpcy5nZXQoJ2NvbnRlbnRVc2VyU2V0dGluZycpICkge1xuXHRcdFx0dGhpcy5mcmFtZS5vbiggJ2NvbnRlbnQ6YWN0aXZhdGUnLCB0aGlzLnNhdmVDb250ZW50TW9kZSwgdGhpcyApO1xuXHRcdFx0dGhpcy5zZXQoICdjb250ZW50JywgZ2V0VXNlclNldHRpbmcoICdsaWJyYXJ5Q29udGVudCcsIHRoaXMuZ2V0KCdjb250ZW50JykgKSApO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnJlY29yZFNlbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5mcmFtZS5vZmYoICdjb250ZW50OmFjdGl2YXRlJywgdGhpcy5zYXZlQ29udGVudE1vZGUsIHRoaXMgKTtcblxuXHRcdC8vIFVuYmluZCBhbGwgZXZlbnQgaGFuZGxlcnMgdGhhdCB1c2UgdGhpcyBzdGF0ZSBhcyB0aGUgY29udGV4dFxuXHRcdC8vIGZyb20gdGhlIHNlbGVjdGlvbi5cblx0XHR0aGlzLmdldCgnc2VsZWN0aW9uJykub2ZmKCBudWxsLCBudWxsLCB0aGlzICk7XG5cblx0XHR3cC5VcGxvYWRlci5xdWV1ZS5vZmYoIG51bGwsIG51bGwsIHRoaXMgKTtcblx0fSxcblxuXHQvKipcblx0ICogUmVzZXQgdGhlIGxpYnJhcnkgdG8gaXRzIGluaXRpYWwgc3RhdGUuXG5cdCAqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0cmVzZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZ2V0KCdzZWxlY3Rpb24nKS5yZXNldCgpO1xuXHRcdHRoaXMucmVzZXREaXNwbGF5cygpO1xuXHRcdHRoaXMucmVmcmVzaENvbnRlbnQoKTtcblx0fSxcblxuXHQvKipcblx0ICogUmVzZXQgdGhlIGF0dGFjaG1lbnQgZGlzcGxheSBzZXR0aW5ncyBkZWZhdWx0cyB0byB0aGUgc2l0ZSBvcHRpb25zLlxuXHQgKlxuXHQgKiBJZiBzaXRlIG9wdGlvbnMgZG9uJ3QgZGVmaW5lIHRoZW0sIGZhbGwgYmFjayB0byBhIHBlcnNpc3RlbnQgdXNlciBzZXR0aW5nLlxuXHQgKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdHJlc2V0RGlzcGxheXM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkZWZhdWx0UHJvcHMgPSB3cC5tZWRpYS52aWV3LnNldHRpbmdzLmRlZmF1bHRQcm9wcztcblx0XHR0aGlzLl9kaXNwbGF5cyA9IFtdO1xuXHRcdHRoaXMuX2RlZmF1bHREaXNwbGF5U2V0dGluZ3MgPSB7XG5cdFx0XHRhbGlnbjogZGVmYXVsdFByb3BzLmFsaWduIHx8IGdldFVzZXJTZXR0aW5nKCAnYWxpZ24nLCAnbm9uZScgKSxcblx0XHRcdHNpemU6ICBkZWZhdWx0UHJvcHMuc2l6ZSAgfHwgZ2V0VXNlclNldHRpbmcoICdpbWdzaXplJywgJ21lZGl1bScgKSxcblx0XHRcdGxpbms6ICBkZWZhdWx0UHJvcHMubGluayAgfHwgZ2V0VXNlclNldHRpbmcoICd1cmxidXR0b24nLCAnZmlsZScgKVxuXHRcdH07XG5cdH0sXG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIG1vZGVsIHRvIHJlcHJlc2VudCBkaXNwbGF5IHNldHRpbmdzIChhbGlnbm1lbnQsIGV0Yy4pIGZvciBhbiBhdHRhY2htZW50LlxuXHQgKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICpcblx0ICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50fSBhdHRhY2htZW50XG5cdCAqIEByZXR1cm5zIHtCYWNrYm9uZS5Nb2RlbH1cblx0ICovXG5cdGRpc3BsYXk6IGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXHRcdHZhciBkaXNwbGF5cyA9IHRoaXMuX2Rpc3BsYXlzO1xuXG5cdFx0aWYgKCAhIGRpc3BsYXlzWyBhdHRhY2htZW50LmNpZCBdICkge1xuXHRcdFx0ZGlzcGxheXNbIGF0dGFjaG1lbnQuY2lkIF0gPSBuZXcgQmFja2JvbmUuTW9kZWwoIHRoaXMuZGVmYXVsdERpc3BsYXlTZXR0aW5ncyggYXR0YWNobWVudCApICk7XG5cdFx0fVxuXHRcdHJldHVybiBkaXNwbGF5c1sgYXR0YWNobWVudC5jaWQgXTtcblx0fSxcblxuXHQvKipcblx0ICogR2l2ZW4gYW4gYXR0YWNobWVudCwgY3JlYXRlIGF0dGFjaG1lbnQgZGlzcGxheSBzZXR0aW5ncyBwcm9wZXJ0aWVzLlxuXHQgKlxuXHQgKiBAc2luY2UgMy42LjBcblx0ICpcblx0ICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50fSBhdHRhY2htZW50XG5cdCAqIEByZXR1cm5zIHtPYmplY3R9XG5cdCAqL1xuXHRkZWZhdWx0RGlzcGxheVNldHRpbmdzOiBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblx0XHR2YXIgc2V0dGluZ3MgPSB0aGlzLl9kZWZhdWx0RGlzcGxheVNldHRpbmdzO1xuXHRcdGlmICggc2V0dGluZ3MuY2FuRW1iZWQgPSB0aGlzLmNhbkVtYmVkKCBhdHRhY2htZW50ICkgKSB7XG5cdFx0XHRzZXR0aW5ncy5saW5rID0gJ2VtYmVkJztcblx0XHR9XG5cdFx0cmV0dXJuIHNldHRpbmdzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIGFuIGF0dGFjaG1lbnQgY2FuIGJlIGVtYmVkZGVkIChhdWRpbyBvciB2aWRlbykuXG5cdCAqXG5cdCAqIEBzaW5jZSAzLjYuMFxuXHQgKlxuXHQgKiBAcGFyYW0ge3dwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnR9IGF0dGFjaG1lbnRcblx0ICogQHJldHVybnMge0Jvb2xlYW59XG5cdCAqL1xuXHRjYW5FbWJlZDogZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cdFx0Ly8gSWYgdXBsb2FkaW5nLCB3ZSBrbm93IHRoZSBmaWxlbmFtZSBidXQgbm90IHRoZSBtaW1lIHR5cGUuXG5cdFx0aWYgKCAhIGF0dGFjaG1lbnQuZ2V0KCd1cGxvYWRpbmcnKSApIHtcblx0XHRcdHZhciB0eXBlID0gYXR0YWNobWVudC5nZXQoJ3R5cGUnKTtcblx0XHRcdGlmICggdHlwZSAhPT0gJ2F1ZGlvJyAmJiB0eXBlICE9PSAndmlkZW8nICkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIF8uY29udGFpbnMoIHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MuZW1iZWRFeHRzLCBhdHRhY2htZW50LmdldCgnZmlsZW5hbWUnKS5zcGxpdCgnLicpLnBvcCgpICk7XG5cdH0sXG5cblxuXHQvKipcblx0ICogSWYgdGhlIHN0YXRlIGlzIGFjdGl2ZSwgbm8gaXRlbXMgYXJlIHNlbGVjdGVkLCBhbmQgdGhlIGN1cnJlbnRcblx0ICogY29udGVudCBtb2RlIGlzIG5vdCBhbiBvcHRpb24gaW4gdGhlIHN0YXRlJ3Mgcm91dGVyIChwcm92aWRlZFxuXHQgKiB0aGUgc3RhdGUgaGFzIGEgcm91dGVyKSwgcmVzZXQgdGhlIGNvbnRlbnQgbW9kZSB0byB0aGUgZGVmYXVsdC5cblx0ICpcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRyZWZyZXNoQ29udGVudDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMuZ2V0KCdzZWxlY3Rpb24nKSxcblx0XHRcdGZyYW1lID0gdGhpcy5mcmFtZSxcblx0XHRcdHJvdXRlciA9IGZyYW1lLnJvdXRlci5nZXQoKSxcblx0XHRcdG1vZGUgPSBmcmFtZS5jb250ZW50Lm1vZGUoKTtcblxuXHRcdGlmICggdGhpcy5hY3RpdmUgJiYgISBzZWxlY3Rpb24ubGVuZ3RoICYmIHJvdXRlciAmJiAhIHJvdXRlci5nZXQoIG1vZGUgKSApIHtcblx0XHRcdHRoaXMuZnJhbWUuY29udGVudC5yZW5kZXIoIHRoaXMuZ2V0KCdjb250ZW50JykgKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIGhhbmRsZXIgd2hlbiBhbiBhdHRhY2htZW50IGlzIHVwbG9hZGVkLlxuXHQgKlxuXHQgKiBTd2l0Y2ggdG8gdGhlIE1lZGlhIExpYnJhcnkgaWYgdXBsb2FkZWQgZnJvbSB0aGUgJ1VwbG9hZCBGaWxlcycgdGFiLlxuXHQgKlxuXHQgKiBBZGRzIGFueSB1cGxvYWRpbmcgYXR0YWNobWVudHMgdG8gdGhlIHNlbGVjdGlvbi5cblx0ICpcblx0ICogSWYgdGhlIHN0YXRlIG9ubHkgc3VwcG9ydHMgb25lIGF0dGFjaG1lbnQgdG8gYmUgc2VsZWN0ZWQgYW5kIG11bHRpcGxlXG5cdCAqIGF0dGFjaG1lbnRzIGFyZSB1cGxvYWRlZCwgdGhlIGxhc3QgYXR0YWNobWVudCBpbiB0aGUgdXBsb2FkIHF1ZXVlIHdpbGxcblx0ICogYmUgc2VsZWN0ZWQuXG5cdCAqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKlxuXHQgKiBAcGFyYW0ge3dwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnR9IGF0dGFjaG1lbnRcblx0ICovXG5cdHVwbG9hZGluZzogZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cdFx0dmFyIGNvbnRlbnQgPSB0aGlzLmZyYW1lLmNvbnRlbnQ7XG5cblx0XHRpZiAoICd1cGxvYWQnID09PSBjb250ZW50Lm1vZGUoKSApIHtcblx0XHRcdHRoaXMuZnJhbWUuY29udGVudC5tb2RlKCdicm93c2UnKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuZ2V0KCAnYXV0b1NlbGVjdCcgKSApIHtcblx0XHRcdHRoaXMuZ2V0KCdzZWxlY3Rpb24nKS5hZGQoIGF0dGFjaG1lbnQgKTtcblx0XHRcdHRoaXMuZnJhbWUudHJpZ2dlciggJ2xpYnJhcnk6c2VsZWN0aW9uOmFkZCcgKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFBlcnNpc3QgdGhlIG1vZGUgb2YgdGhlIGNvbnRlbnQgcmVnaW9uIGFzIGEgdXNlciBzZXR0aW5nLlxuXHQgKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdHNhdmVDb250ZW50TW9kZTogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCAnYnJvd3NlJyAhPT0gdGhpcy5nZXQoJ3JvdXRlcicpICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBtb2RlID0gdGhpcy5mcmFtZS5jb250ZW50Lm1vZGUoKSxcblx0XHRcdHZpZXcgPSB0aGlzLmZyYW1lLnJvdXRlci5nZXQoKTtcblxuXHRcdGlmICggdmlldyAmJiB2aWV3LmdldCggbW9kZSApICkge1xuXHRcdFx0c2V0VXNlclNldHRpbmcoICdsaWJyYXJ5Q29udGVudCcsIG1vZGUgKTtcblx0XHR9XG5cdH1cbn0pO1xuXG4vLyBNYWtlIHNlbGVjdGlvblN5bmMgYXZhaWxhYmxlIG9uIGFueSBNZWRpYSBMaWJyYXJ5IHN0YXRlLlxuXy5leHRlbmQoIExpYnJhcnkucHJvdG90eXBlLCB3cC5tZWRpYS5zZWxlY3Rpb25TeW5jICk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGlicmFyeTtcbiIsIi8qZ2xvYmFscyB3cCwgXyAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLmNvbnRyb2xsZXIuTWVkaWFMaWJyYXJ5XG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5XG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZVxuICogQGF1Z21lbnRzIEJhY2tib25lLk1vZGVsXG4gKi9cbnZhciBMaWJyYXJ5ID0gd3AubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5LFxuXHRNZWRpYUxpYnJhcnk7XG5cbk1lZGlhTGlicmFyeSA9IExpYnJhcnkuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6IF8uZGVmYXVsdHMoe1xuXHRcdC8vIEF0dGFjaG1lbnRzIGJyb3dzZXIgZGVmYXVsdHMuIEBzZWUgbWVkaWEudmlldy5BdHRhY2htZW50c0Jyb3dzZXJcblx0XHRmaWx0ZXJhYmxlOiAgICAgICd1cGxvYWRlZCcsXG5cblx0XHRkaXNwbGF5U2V0dGluZ3M6IGZhbHNlLFxuXHRcdHByaW9yaXR5OiAgICAgICAgODAsXG5cdFx0c3luY1NlbGVjdGlvbjogICBmYWxzZVxuXHR9LCBMaWJyYXJ5LnByb3RvdHlwZS5kZWZhdWx0cyApLFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy45LjBcblx0ICpcblx0ICogQHBhcmFtIG9wdGlvbnNcblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdHRoaXMubWVkaWEgPSBvcHRpb25zLm1lZGlhO1xuXHRcdHRoaXMudHlwZSA9IG9wdGlvbnMudHlwZTtcblx0XHR0aGlzLnNldCggJ2xpYnJhcnknLCB3cC5tZWRpYS5xdWVyeSh7IHR5cGU6IHRoaXMudHlwZSB9KSApO1xuXG5cdFx0TGlicmFyeS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBzaW5jZSAzLjkuMFxuXHQgKi9cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIEB0b2RvIHRoaXMgc2hvdWxkIHVzZSB0aGlzLmZyYW1lLlxuXHRcdGlmICggd3AubWVkaWEuZnJhbWUubGFzdE1pbWUgKSB7XG5cdFx0XHR0aGlzLnNldCggJ2xpYnJhcnknLCB3cC5tZWRpYS5xdWVyeSh7IHR5cGU6IHdwLm1lZGlhLmZyYW1lLmxhc3RNaW1lIH0pICk7XG5cdFx0XHRkZWxldGUgd3AubWVkaWEuZnJhbWUubGFzdE1pbWU7XG5cdFx0fVxuXHRcdExpYnJhcnkucHJvdG90eXBlLmFjdGl2YXRlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWVkaWFMaWJyYXJ5O1xuIiwiLypnbG9iYWxzIEJhY2tib25lLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEuY29udHJvbGxlci5SZWdpb25cbiAqXG4gKiBBIHJlZ2lvbiBpcyBhIHBlcnNpc3RlbnQgYXBwbGljYXRpb24gbGF5b3V0IGFyZWEuXG4gKlxuICogQSByZWdpb24gYXNzdW1lcyBvbmUgbW9kZSBhdCBhbnkgdGltZSwgYW5kIGNhbiBiZSBzd2l0Y2hlZCB0byBhbm90aGVyLlxuICpcbiAqIFdoZW4gbW9kZSBjaGFuZ2VzLCBldmVudHMgYXJlIHRyaWdnZXJlZCBvbiB0aGUgcmVnaW9uJ3MgcGFyZW50IHZpZXcuXG4gKiBUaGUgcGFyZW50IHZpZXcgd2lsbCBsaXN0ZW4gdG8gc3BlY2lmaWMgZXZlbnRzIGFuZCBmaWxsIHRoZSByZWdpb24gd2l0aCBhblxuICogYXBwcm9wcmlhdGUgdmlldyBkZXBlbmRpbmcgb24gbW9kZS4gRm9yIGV4YW1wbGUsIGEgZnJhbWUgbGlzdGVucyBmb3IgdGhlXG4gKiAnYnJvd3NlJyBtb2RlIHQgYmUgYWN0aXZhdGVkIG9uIHRoZSAnY29udGVudCcgdmlldyBhbmQgdGhlbiBmaWxscyB0aGUgcmVnaW9uXG4gKiB3aXRoIGFuIEF0dGFjaG1lbnRzQnJvd3NlciB2aWV3LlxuICpcbiAqIEBjbGFzc1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSAgICAgICAgb3B0aW9ucyAgICAgICAgICBPcHRpb25zIGhhc2ggZm9yIHRoZSByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgIG9wdGlvbnMuaWQgICAgICAgVW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoZSByZWdpb24uXG4gKiBAcGFyYW0ge0JhY2tib25lLlZpZXd9IG9wdGlvbnMudmlldyAgICAgQSBwYXJlbnQgdmlldyB0aGUgcmVnaW9uIGV4aXN0cyB3aXRoaW4uXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgIG9wdGlvbnMuc2VsZWN0b3IgalF1ZXJ5IHNlbGVjdG9yIGZvciB0aGUgcmVnaW9uIHdpdGhpbiB0aGUgcGFyZW50IHZpZXcuXG4gKi9cbnZhciBSZWdpb24gPSBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0Xy5leHRlbmQoIHRoaXMsIF8ucGljayggb3B0aW9ucyB8fCB7fSwgJ2lkJywgJ3ZpZXcnLCAnc2VsZWN0b3InICkgKTtcbn07XG5cbi8vIFVzZSBCYWNrYm9uZSdzIHNlbGYtcHJvcGFnYXRpbmcgYGV4dGVuZGAgaW5oZXJpdGFuY2UgbWV0aG9kLlxuUmVnaW9uLmV4dGVuZCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZDtcblxuXy5leHRlbmQoIFJlZ2lvbi5wcm90b3R5cGUsIHtcblx0LyoqXG5cdCAqIEFjdGl2YXRlIGEgbW9kZS5cblx0ICpcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlXG5cdCAqXG5cdCAqIEBmaXJlcyB0aGlzLnZpZXcje3RoaXMuaWR9OmFjdGl2YXRlOnt0aGlzLl9tb2RlfVxuXHQgKiBAZmlyZXMgdGhpcy52aWV3I3t0aGlzLmlkfTphY3RpdmF0ZVxuXHQgKiBAZmlyZXMgdGhpcy52aWV3I3t0aGlzLmlkfTpkZWFjdGl2YXRlOnt0aGlzLl9tb2RlfVxuXHQgKiBAZmlyZXMgdGhpcy52aWV3I3t0aGlzLmlkfTpkZWFjdGl2YXRlXG5cdCAqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5jb250cm9sbGVyLlJlZ2lvbn0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmcuXG5cdCAqL1xuXHRtb2RlOiBmdW5jdGlvbiggbW9kZSApIHtcblx0XHRpZiAoICEgbW9kZSApIHtcblx0XHRcdHJldHVybiB0aGlzLl9tb2RlO1xuXHRcdH1cblx0XHQvLyBCYWlsIGlmIHdlJ3JlIHRyeWluZyB0byBjaGFuZ2UgdG8gdGhlIGN1cnJlbnQgbW9kZS5cblx0XHRpZiAoIG1vZGUgPT09IHRoaXMuX21vZGUgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSZWdpb24gbW9kZSBkZWFjdGl2YXRpb24gZXZlbnQuXG5cdFx0ICpcblx0XHQgKiBAZXZlbnQgdGhpcy52aWV3I3t0aGlzLmlkfTpkZWFjdGl2YXRlOnt0aGlzLl9tb2RlfVxuXHRcdCAqIEBldmVudCB0aGlzLnZpZXcje3RoaXMuaWR9OmRlYWN0aXZhdGVcblx0XHQgKi9cblx0XHR0aGlzLnRyaWdnZXIoJ2RlYWN0aXZhdGUnKTtcblxuXHRcdHRoaXMuX21vZGUgPSBtb2RlO1xuXHRcdHRoaXMucmVuZGVyKCBtb2RlICk7XG5cblx0XHQvKipcblx0XHQgKiBSZWdpb24gbW9kZSBhY3RpdmF0aW9uIGV2ZW50LlxuXHRcdCAqXG5cdFx0ICogQGV2ZW50IHRoaXMudmlldyN7dGhpcy5pZH06YWN0aXZhdGU6e3RoaXMuX21vZGV9XG5cdFx0ICogQGV2ZW50IHRoaXMudmlldyN7dGhpcy5pZH06YWN0aXZhdGVcblx0XHQgKi9cblx0XHR0aGlzLnRyaWdnZXIoJ2FjdGl2YXRlJyk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdC8qKlxuXHQgKiBSZW5kZXIgYSBtb2RlLlxuXHQgKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IG1vZGVcblx0ICpcblx0ICogQGZpcmVzIHRoaXMudmlldyN7dGhpcy5pZH06Y3JlYXRlOnt0aGlzLl9tb2RlfVxuXHQgKiBAZmlyZXMgdGhpcy52aWV3I3t0aGlzLmlkfTpjcmVhdGVcblx0ICogQGZpcmVzIHRoaXMudmlldyN7dGhpcy5pZH06cmVuZGVyOnt0aGlzLl9tb2RlfVxuXHQgKiBAZmlyZXMgdGhpcy52aWV3I3t0aGlzLmlkfTpyZW5kZXJcblx0ICpcblx0ICogQHJldHVybnMge3dwLm1lZGlhLmNvbnRyb2xsZXIuUmVnaW9ufSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0cmVuZGVyOiBmdW5jdGlvbiggbW9kZSApIHtcblx0XHQvLyBJZiB0aGUgbW9kZSBpc24ndCBhY3RpdmUsIGFjdGl2YXRlIGl0LlxuXHRcdGlmICggbW9kZSAmJiBtb2RlICE9PSB0aGlzLl9tb2RlICkge1xuXHRcdFx0cmV0dXJuIHRoaXMubW9kZSggbW9kZSApO1xuXHRcdH1cblxuXHRcdHZhciBzZXQgPSB7IHZpZXc6IG51bGwgfSxcblx0XHRcdHZpZXc7XG5cblx0XHQvKipcblx0XHQgKiBDcmVhdGUgcmVnaW9uIHZpZXcgZXZlbnQuXG5cdFx0ICpcblx0XHQgKiBSZWdpb24gdmlldyBjcmVhdGlvbiB0YWtlcyBwbGFjZSBpbiBhbiBldmVudCBjYWxsYmFjayBvbiB0aGUgZnJhbWUuXG5cdFx0ICpcblx0XHQgKiBAZXZlbnQgdGhpcy52aWV3I3t0aGlzLmlkfTpjcmVhdGU6e3RoaXMuX21vZGV9XG5cdFx0ICogQGV2ZW50IHRoaXMudmlldyN7dGhpcy5pZH06Y3JlYXRlXG5cdFx0ICovXG5cdFx0dGhpcy50cmlnZ2VyKCAnY3JlYXRlJywgc2V0ICk7XG5cdFx0dmlldyA9IHNldC52aWV3O1xuXG5cdFx0LyoqXG5cdFx0ICogUmVuZGVyIHJlZ2lvbiB2aWV3IGV2ZW50LlxuXHRcdCAqXG5cdFx0ICogUmVnaW9uIHZpZXcgY3JlYXRpb24gdGFrZXMgcGxhY2UgaW4gYW4gZXZlbnQgY2FsbGJhY2sgb24gdGhlIGZyYW1lLlxuXHRcdCAqXG5cdFx0ICogQGV2ZW50IHRoaXMudmlldyN7dGhpcy5pZH06Y3JlYXRlOnt0aGlzLl9tb2RlfVxuXHRcdCAqIEBldmVudCB0aGlzLnZpZXcje3RoaXMuaWR9OmNyZWF0ZVxuXHRcdCAqL1xuXHRcdHRoaXMudHJpZ2dlciggJ3JlbmRlcicsIHZpZXcgKTtcblx0XHRpZiAoIHZpZXcgKSB7XG5cdFx0XHR0aGlzLnNldCggdmlldyApO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvKipcblx0ICogR2V0IHRoZSByZWdpb24ncyB2aWV3LlxuXHQgKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICpcblx0ICogQHJldHVybnMge3dwLm1lZGlhLlZpZXd9XG5cdCAqL1xuXHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnZpZXcudmlld3MuZmlyc3QoIHRoaXMuc2VsZWN0b3IgKTtcblx0fSxcblxuXHQvKipcblx0ICogU2V0IHRoZSByZWdpb24ncyB2aWV3IGFzIGEgc3VidmlldyBvZiB0aGUgZnJhbWUuXG5cdCAqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gdmlld3Ncblx0ICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XVxuXHQgKiBAcmV0dXJucyB7d3AuQmFja2JvbmUuU3Vidmlld3N9IFN1YnZpZXdzIGlzIHJldHVybmVkIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRzZXQ6IGZ1bmN0aW9uKCB2aWV3cywgb3B0aW9ucyApIHtcblx0XHRpZiAoIG9wdGlvbnMgKSB7XG5cdFx0XHRvcHRpb25zLmFkZCA9IGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy52aWV3LnZpZXdzLnNldCggdGhpcy5zZWxlY3Rvciwgdmlld3MsIG9wdGlvbnMgKTtcblx0fSxcblxuXHQvKipcblx0ICogVHJpZ2dlciByZWdpb25hbCB2aWV3IGV2ZW50cyBvbiB0aGUgZnJhbWUuXG5cdCAqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRcblx0ICogQHJldHVybnMge3VuZGVmaW5lZHx3cC5tZWRpYS5jb250cm9sbGVyLlJlZ2lvbn0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmcuXG5cdCAqL1xuXHR0cmlnZ2VyOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dmFyIGJhc2UsIGFyZ3M7XG5cblx0XHRpZiAoICEgdGhpcy5fbW9kZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRhcmdzID0gXy50b0FycmF5KCBhcmd1bWVudHMgKTtcblx0XHRiYXNlID0gdGhpcy5pZCArICc6JyArIGV2ZW50O1xuXG5cdFx0Ly8gVHJpZ2dlciBge3RoaXMuaWR9OntldmVudH06e3RoaXMuX21vZGV9YCBldmVudCBvbiB0aGUgZnJhbWUuXG5cdFx0YXJnc1swXSA9IGJhc2UgKyAnOicgKyB0aGlzLl9tb2RlO1xuXHRcdHRoaXMudmlldy50cmlnZ2VyLmFwcGx5KCB0aGlzLnZpZXcsIGFyZ3MgKTtcblxuXHRcdC8vIFRyaWdnZXIgYHt0aGlzLmlkfTp7ZXZlbnR9YCBldmVudCBvbiB0aGUgZnJhbWUuXG5cdFx0YXJnc1swXSA9IGJhc2U7XG5cdFx0dGhpcy52aWV3LnRyaWdnZXIuYXBwbHkoIHRoaXMudmlldywgYXJncyApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWdpb247XG4iLCIvKmdsb2JhbHMgd3AsIF8gKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5jb250cm9sbGVyLlJlcGxhY2VJbWFnZVxuICpcbiAqIEEgc3RhdGUgZm9yIHJlcGxhY2luZyBhbiBpbWFnZS5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5jb250cm9sbGVyLkxpYnJhcnlcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlXG4gKiBAYXVnbWVudHMgQmFja2JvbmUuTW9kZWxcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlc10gICAgICAgICAgICAgICAgICAgICAgICAgVGhlIGF0dHJpYnV0ZXMgaGFzaCBwYXNzZWQgdG8gdGhlIHN0YXRlLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuaWQ9cmVwbGFjZS1pbWFnZV0gICAgICAgIFVuaXF1ZSBpZGVudGlmaWVyLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMudGl0bGU9UmVwbGFjZSBJbWFnZV0gICAgIFRpdGxlIGZvciB0aGUgc3RhdGUuIERpc3BsYXlzIGluIHRoZSBtZWRpYSBtZW51IGFuZCB0aGUgZnJhbWUncyB0aXRsZSByZWdpb24uXG4gKiBAcGFyYW0ge3dwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzfSBbYXR0cmlidXRlcy5saWJyYXJ5XSAgICAgICAgICAgICAgICAgVGhlIGF0dGFjaG1lbnRzIGNvbGxlY3Rpb24gdG8gYnJvd3NlLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIElmIG9uZSBpcyBub3Qgc3VwcGxpZWQsIGEgY29sbGVjdGlvbiBvZiBhbGwgaW1hZ2VzIHdpbGwgYmUgY3JlYXRlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLm11bHRpcGxlPWZhbHNlXSAgICAgICAgICBXaGV0aGVyIG11bHRpLXNlbGVjdCBpcyBlbmFibGVkLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuY29udGVudD11cGxvYWRdICAgICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIGNvbnRlbnQgcmVnaW9uLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE92ZXJyaWRkZW4gYnkgcGVyc2lzdGVudCB1c2VyIHNldHRpbmcgaWYgJ2NvbnRlbnRVc2VyU2V0dGluZycgaXMgdHJ1ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLm1lbnU9ZGVmYXVsdF0gICAgICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSBtZW51IHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnJvdXRlcj1icm93c2VdICAgICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSByb3V0ZXIgcmVnaW9uLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMudG9vbGJhcj1yZXBsYWNlXSAgICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIHRvb2xiYXIgcmVnaW9uLlxuICogQHBhcmFtIHtpbnR9ICAgICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMucHJpb3JpdHk9NjBdICAgICAgICAgICAgIFRoZSBwcmlvcml0eSBmb3IgdGhlIHN0YXRlIGxpbmsgaW4gdGhlIG1lZGlhIG1lbnUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5zZWFyY2hhYmxlPXRydWVdICAgICAgICAgV2hldGhlciB0aGUgbGlicmFyeSBpcyBzZWFyY2hhYmxlLlxuICogQHBhcmFtIHtib29sZWFufHN0cmluZ30gICAgICAgICAgICAgW2F0dHJpYnV0ZXMuZmlsdGVyYWJsZT11cGxvYWRlZF0gICAgIFdoZXRoZXIgdGhlIGxpYnJhcnkgaXMgZmlsdGVyYWJsZSwgYW5kIGlmIHNvIHdoYXQgZmlsdGVycyBzaG91bGQgYmUgc2hvd24uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWNjZXB0cyAnYWxsJywgJ3VwbG9hZGVkJywgb3IgJ3VuYXR0YWNoZWQnLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc29ydGFibGU9dHJ1ZV0gICAgICAgICAgIFdoZXRoZXIgdGhlIEF0dGFjaG1lbnRzIHNob3VsZCBiZSBzb3J0YWJsZS4gRGVwZW5kcyBvbiB0aGUgb3JkZXJieSBwcm9wZXJ0eSBiZWluZyBzZXQgdG8gbWVudU9yZGVyIG9uIHRoZSBhdHRhY2htZW50cyBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuYXV0b1NlbGVjdD10cnVlXSAgICAgICAgIFdoZXRoZXIgYW4gdXBsb2FkZWQgYXR0YWNobWVudCBzaG91bGQgYmUgYXV0b21hdGljYWxseSBhZGRlZCB0byB0aGUgc2VsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuZGVzY3JpYmU9ZmFsc2VdICAgICAgICAgIFdoZXRoZXIgdG8gb2ZmZXIgVUkgdG8gZGVzY3JpYmUgYXR0YWNobWVudHMgLSBlLmcuIGNhcHRpb25pbmcgaW1hZ2VzIGluIGEgZ2FsbGVyeS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmNvbnRlbnRVc2VyU2V0dGluZz10cnVlXSBXaGV0aGVyIHRoZSBjb250ZW50IHJlZ2lvbidzIG1vZGUgc2hvdWxkIGJlIHNldCBhbmQgcGVyc2lzdGVkIHBlciB1c2VyLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc3luY1NlbGVjdGlvbj10cnVlXSAgICAgIFdoZXRoZXIgdGhlIEF0dGFjaG1lbnRzIHNlbGVjdGlvbiBzaG91bGQgYmUgcGVyc2lzdGVkIGZyb20gdGhlIGxhc3Qgc3RhdGUuXG4gKi9cbnZhciBMaWJyYXJ5ID0gd3AubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5LFxuXHRsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHRSZXBsYWNlSW1hZ2U7XG5cblJlcGxhY2VJbWFnZSA9IExpYnJhcnkuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6IF8uZGVmYXVsdHMoe1xuXHRcdGlkOiAgICAgICAgICAgICdyZXBsYWNlLWltYWdlJyxcblx0XHR0aXRsZTogICAgICAgICBsMTBuLnJlcGxhY2VJbWFnZVRpdGxlLFxuXHRcdG11bHRpcGxlOiAgICAgIGZhbHNlLFxuXHRcdGZpbHRlcmFibGU6ICAgICd1cGxvYWRlZCcsXG5cdFx0dG9vbGJhcjogICAgICAgJ3JlcGxhY2UnLFxuXHRcdG1lbnU6ICAgICAgICAgIGZhbHNlLFxuXHRcdHByaW9yaXR5OiAgICAgIDYwLFxuXHRcdHN5bmNTZWxlY3Rpb246IHRydWVcblx0fSwgTGlicmFyeS5wcm90b3R5cGUuZGVmYXVsdHMgKSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuOS4wXG5cdCAqXG5cdCAqIEBwYXJhbSBvcHRpb25zXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHR2YXIgbGlicmFyeSwgY29tcGFyYXRvcjtcblxuXHRcdHRoaXMuaW1hZ2UgPSBvcHRpb25zLmltYWdlO1xuXHRcdC8vIElmIHdlIGhhdmVuJ3QgYmVlbiBwcm92aWRlZCBhIGBsaWJyYXJ5YCwgY3JlYXRlIGEgYFNlbGVjdGlvbmAuXG5cdFx0aWYgKCAhIHRoaXMuZ2V0KCdsaWJyYXJ5JykgKSB7XG5cdFx0XHR0aGlzLnNldCggJ2xpYnJhcnknLCB3cC5tZWRpYS5xdWVyeSh7IHR5cGU6ICdpbWFnZScgfSkgKTtcblx0XHR9XG5cblx0XHRMaWJyYXJ5LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdGxpYnJhcnkgICAgPSB0aGlzLmdldCgnbGlicmFyeScpO1xuXHRcdGNvbXBhcmF0b3IgPSBsaWJyYXJ5LmNvbXBhcmF0b3I7XG5cblx0XHQvLyBPdmVybG9hZCB0aGUgbGlicmFyeSdzIGNvbXBhcmF0b3IgdG8gcHVzaCBpdGVtcyB0aGF0IGFyZSBub3QgaW5cblx0XHQvLyB0aGUgbWlycm9yZWQgcXVlcnkgdG8gdGhlIGZyb250IG9mIHRoZSBhZ2dyZWdhdGUgY29sbGVjdGlvbi5cblx0XHRsaWJyYXJ5LmNvbXBhcmF0b3IgPSBmdW5jdGlvbiggYSwgYiApIHtcblx0XHRcdHZhciBhSW5RdWVyeSA9ICEhIHRoaXMubWlycm9yaW5nLmdldCggYS5jaWQgKSxcblx0XHRcdFx0YkluUXVlcnkgPSAhISB0aGlzLm1pcnJvcmluZy5nZXQoIGIuY2lkICk7XG5cblx0XHRcdGlmICggISBhSW5RdWVyeSAmJiBiSW5RdWVyeSApIHtcblx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0fSBlbHNlIGlmICggYUluUXVlcnkgJiYgISBiSW5RdWVyeSApIHtcblx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gY29tcGFyYXRvci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIEFkZCBhbGwgaXRlbXMgaW4gdGhlIHNlbGVjdGlvbiB0byB0aGUgbGlicmFyeSwgc28gYW55IGZlYXR1cmVkXG5cdFx0Ly8gaW1hZ2VzIHRoYXQgYXJlIG5vdCBpbml0aWFsbHkgbG9hZGVkIHN0aWxsIGFwcGVhci5cblx0XHRsaWJyYXJ5Lm9ic2VydmUoIHRoaXMuZ2V0KCdzZWxlY3Rpb24nKSApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy45LjBcblx0ICovXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnVwZGF0ZVNlbGVjdGlvbigpO1xuXHRcdExpYnJhcnkucHJvdG90eXBlLmFjdGl2YXRlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuOS4wXG5cdCAqL1xuXHR1cGRhdGVTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLmdldCgnc2VsZWN0aW9uJyksXG5cdFx0XHRhdHRhY2htZW50ID0gdGhpcy5pbWFnZS5hdHRhY2htZW50O1xuXG5cdFx0c2VsZWN0aW9uLnJlc2V0KCBhdHRhY2htZW50ID8gWyBhdHRhY2htZW50IF0gOiBbXSApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXBsYWNlSW1hZ2U7XG4iLCIvKmdsb2JhbHMgXywgQmFja2JvbmUgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlTWFjaGluZVxuICpcbiAqIEEgc3RhdGUgbWFjaGluZSBrZWVwcyB0cmFjayBvZiBzdGF0ZS4gSXQgaXMgaW4gb25lIHN0YXRlIGF0IGEgdGltZSxcbiAqIGFuZCBjYW4gY2hhbmdlIGZyb20gb25lIHN0YXRlIHRvIGFub3RoZXIuXG4gKlxuICogU3RhdGVzIGFyZSBzdG9yZWQgYXMgbW9kZWxzIGluIGEgQmFja2JvbmUgY29sbGVjdGlvbi5cbiAqXG4gKiBAc2luY2UgMy41LjBcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5Nb2RlbFxuICogQG1peGluXG4gKiBAbWl4ZXMgQmFja2JvbmUuRXZlbnRzXG4gKlxuICogQHBhcmFtIHtBcnJheX0gc3RhdGVzXG4gKi9cbnZhciBTdGF0ZU1hY2hpbmUgPSBmdW5jdGlvbiggc3RhdGVzICkge1xuXHQvLyBAdG9kbyBUaGlzIGlzIGRlYWQgY29kZS4gVGhlIHN0YXRlcyBjb2xsZWN0aW9uIGdldHMgY3JlYXRlZCBpbiBtZWRpYS52aWV3LkZyYW1lLl9jcmVhdGVTdGF0ZXMuXG5cdHRoaXMuc3RhdGVzID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oIHN0YXRlcyApO1xufTtcblxuLy8gVXNlIEJhY2tib25lJ3Mgc2VsZi1wcm9wYWdhdGluZyBgZXh0ZW5kYCBpbmhlcml0YW5jZSBtZXRob2QuXG5TdGF0ZU1hY2hpbmUuZXh0ZW5kID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kO1xuXG5fLmV4dGVuZCggU3RhdGVNYWNoaW5lLnByb3RvdHlwZSwgQmFja2JvbmUuRXZlbnRzLCB7XG5cdC8qKlxuXHQgKiBGZXRjaCBhIHN0YXRlLlxuXHQgKlxuXHQgKiBJZiBubyBgaWRgIGlzIHByb3ZpZGVkLCByZXR1cm5zIHRoZSBhY3RpdmUgc3RhdGUuXG5cdCAqXG5cdCAqIEltcGxpY2l0bHkgY3JlYXRlcyBzdGF0ZXMuXG5cdCAqXG5cdCAqIEVuc3VyZSB0aGF0IHRoZSBgc3RhdGVzYCBjb2xsZWN0aW9uIGV4aXN0cyBzbyB0aGUgYFN0YXRlTWFjaGluZWBcblx0ICogICBjYW4gYmUgdXNlZCBhcyBhIG1peGluLlxuXHQgKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGlkXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlfSBSZXR1cm5zIGEgU3RhdGUgbW9kZWxcblx0ICogICBmcm9tIHRoZSBTdGF0ZU1hY2hpbmUgY29sbGVjdGlvblxuXHQgKi9cblx0c3RhdGU6IGZ1bmN0aW9uKCBpZCApIHtcblx0XHR0aGlzLnN0YXRlcyA9IHRoaXMuc3RhdGVzIHx8IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKCk7XG5cblx0XHQvLyBEZWZhdWx0IHRvIHRoZSBhY3RpdmUgc3RhdGUuXG5cdFx0aWQgPSBpZCB8fCB0aGlzLl9zdGF0ZTtcblxuXHRcdGlmICggaWQgJiYgISB0aGlzLnN0YXRlcy5nZXQoIGlkICkgKSB7XG5cdFx0XHR0aGlzLnN0YXRlcy5hZGQoeyBpZDogaWQgfSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnN0YXRlcy5nZXQoIGlkICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGFjdGl2ZSBzdGF0ZS5cblx0ICpcblx0ICogQmFpbCBpZiB3ZSdyZSB0cnlpbmcgdG8gc2VsZWN0IHRoZSBjdXJyZW50IHN0YXRlLCBpZiB3ZSBoYXZlbid0XG5cdCAqIGNyZWF0ZWQgdGhlIGBzdGF0ZXNgIGNvbGxlY3Rpb24sIG9yIGFyZSB0cnlpbmcgdG8gc2VsZWN0IGEgc3RhdGVcblx0ICogdGhhdCBkb2VzIG5vdCBleGlzdC5cblx0ICpcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuXHQgKlxuXHQgKiBAZmlyZXMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZSNkZWFjdGl2YXRlXG5cdCAqIEBmaXJlcyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlI2FjdGl2YXRlXG5cdCAqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlTWFjaGluZX0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHNldFN0YXRlOiBmdW5jdGlvbiggaWQgKSB7XG5cdFx0dmFyIHByZXZpb3VzID0gdGhpcy5zdGF0ZSgpO1xuXG5cdFx0aWYgKCAoIHByZXZpb3VzICYmIGlkID09PSBwcmV2aW91cy5pZCApIHx8ICEgdGhpcy5zdGF0ZXMgfHwgISB0aGlzLnN0YXRlcy5nZXQoIGlkICkgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRpZiAoIHByZXZpb3VzICkge1xuXHRcdFx0cHJldmlvdXMudHJpZ2dlcignZGVhY3RpdmF0ZScpO1xuXHRcdFx0dGhpcy5fbGFzdFN0YXRlID0gcHJldmlvdXMuaWQ7XG5cdFx0fVxuXG5cdFx0dGhpcy5fc3RhdGUgPSBpZDtcblx0XHR0aGlzLnN0YXRlKCkudHJpZ2dlcignYWN0aXZhdGUnKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBwcmV2aW91cyBhY3RpdmUgc3RhdGUuXG5cdCAqXG5cdCAqIENhbGwgdGhlIGBzdGF0ZSgpYCBtZXRob2Qgd2l0aCBubyBwYXJhbWV0ZXJzIHRvIHJldHJpZXZlIHRoZSBjdXJyZW50XG5cdCAqIGFjdGl2ZSBzdGF0ZS5cblx0ICpcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlfSBSZXR1cm5zIGEgU3RhdGUgbW9kZWxcblx0ICogICAgZnJvbSB0aGUgU3RhdGVNYWNoaW5lIGNvbGxlY3Rpb25cblx0ICovXG5cdGxhc3RTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLl9sYXN0U3RhdGUgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zdGF0ZSggdGhpcy5fbGFzdFN0YXRlICk7XG5cdFx0fVxuXHR9XG59KTtcblxuLy8gTWFwIGFsbCBldmVudCBiaW5kaW5nIGFuZCB0cmlnZ2VyaW5nIG9uIGEgU3RhdGVNYWNoaW5lIHRvIGl0cyBgc3RhdGVzYCBjb2xsZWN0aW9uLlxuXy5lYWNoKFsgJ29uJywgJ29mZicsICd0cmlnZ2VyJyBdLCBmdW5jdGlvbiggbWV0aG9kICkge1xuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVNYWNoaW5lfSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZy5cblx0ICovXG5cdFN0YXRlTWFjaGluZS5wcm90b3R5cGVbIG1ldGhvZCBdID0gZnVuY3Rpb24oKSB7XG5cdFx0Ly8gRW5zdXJlIHRoYXQgdGhlIGBzdGF0ZXNgIGNvbGxlY3Rpb24gZXhpc3RzIHNvIHRoZSBgU3RhdGVNYWNoaW5lYFxuXHRcdC8vIGNhbiBiZSB1c2VkIGFzIGEgbWl4aW4uXG5cdFx0dGhpcy5zdGF0ZXMgPSB0aGlzLnN0YXRlcyB8fCBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xuXHRcdC8vIEZvcndhcmQgdGhlIG1ldGhvZCB0byB0aGUgYHN0YXRlc2AgY29sbGVjdGlvbi5cblx0XHR0aGlzLnN0YXRlc1sgbWV0aG9kIF0uYXBwbHkoIHRoaXMuc3RhdGVzLCBhcmd1bWVudHMgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXRlTWFjaGluZTtcbiIsIi8qZ2xvYmFscyBfLCBCYWNrYm9uZSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVcbiAqXG4gKiBBIHN0YXRlIGlzIGEgc3RlcCBpbiBhIHdvcmtmbG93IHRoYXQgd2hlbiBzZXQgd2lsbCB0cmlnZ2VyIHRoZSBjb250cm9sbGVyc1xuICogZm9yIHRoZSByZWdpb25zIHRvIGJlIHVwZGF0ZWQgYXMgc3BlY2lmaWVkIGluIHRoZSBmcmFtZS5cbiAqXG4gKiBBIHN0YXRlIGhhcyBhbiBldmVudC1kcml2ZW4gbGlmZWN5Y2xlOlxuICpcbiAqICAgICAncmVhZHknICAgICAgdHJpZ2dlcnMgd2hlbiBhIHN0YXRlIGlzIGFkZGVkIHRvIGEgc3RhdGUgbWFjaGluZSdzIGNvbGxlY3Rpb24uXG4gKiAgICAgJ2FjdGl2YXRlJyAgIHRyaWdnZXJzIHdoZW4gYSBzdGF0ZSBpcyBhY3RpdmF0ZWQgYnkgYSBzdGF0ZSBtYWNoaW5lLlxuICogICAgICdkZWFjdGl2YXRlJyB0cmlnZ2VycyB3aGVuIGEgc3RhdGUgaXMgZGVhY3RpdmF0ZWQgYnkgYSBzdGF0ZSBtYWNoaW5lLlxuICogICAgICdyZXNldCcgICAgICBpcyBub3QgdHJpZ2dlcmVkIGF1dG9tYXRpY2FsbHkuIEl0IHNob3VsZCBiZSBpbnZva2VkIGJ5IHRoZVxuICogICAgICAgICAgICAgICAgICBwcm9wZXIgY29udHJvbGxlciB0byByZXNldCB0aGUgc3RhdGUgdG8gaXRzIGRlZmF1bHQuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgQmFja2JvbmUuTW9kZWxcbiAqL1xudmFyIFN0YXRlID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdGNvbnN0cnVjdG9yOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm9uKCAnYWN0aXZhdGUnLCB0aGlzLl9wcmVBY3RpdmF0ZSwgdGhpcyApO1xuXHRcdHRoaXMub24oICdhY3RpdmF0ZScsIHRoaXMuYWN0aXZhdGUsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnYWN0aXZhdGUnLCB0aGlzLl9wb3N0QWN0aXZhdGUsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnZGVhY3RpdmF0ZScsIHRoaXMuX2RlYWN0aXZhdGUsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnZGVhY3RpdmF0ZScsIHRoaXMuZGVhY3RpdmF0ZSwgdGhpcyApO1xuXHRcdHRoaXMub24oICdyZXNldCcsIHRoaXMucmVzZXQsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAncmVhZHknLCB0aGlzLl9yZWFkeSwgdGhpcyApO1xuXHRcdHRoaXMub24oICdyZWFkeScsIHRoaXMucmVhZHksIHRoaXMgKTtcblx0XHQvKipcblx0XHQgKiBDYWxsIHBhcmVudCBjb25zdHJ1Y3RvciB3aXRoIHBhc3NlZCBhcmd1bWVudHNcblx0XHQgKi9cblx0XHRCYWNrYm9uZS5Nb2RlbC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0dGhpcy5vbiggJ2NoYW5nZTptZW51JywgdGhpcy5fdXBkYXRlTWVudSwgdGhpcyApO1xuXHR9LFxuXHQvKipcblx0ICogUmVhZHkgZXZlbnQgY2FsbGJhY2suXG5cdCAqXG5cdCAqIEBhYnN0cmFjdFxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdHJlYWR5OiBmdW5jdGlvbigpIHt9LFxuXG5cdC8qKlxuXHQgKiBBY3RpdmF0ZSBldmVudCBjYWxsYmFjay5cblx0ICpcblx0ICogQGFic3RyYWN0XG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge30sXG5cblx0LyoqXG5cdCAqIERlYWN0aXZhdGUgZXZlbnQgY2FsbGJhY2suXG5cdCAqXG5cdCAqIEBhYnN0cmFjdFxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge30sXG5cblx0LyoqXG5cdCAqIFJlc2V0IGV2ZW50IGNhbGxiYWNrLlxuXHQgKlxuXHQgKiBAYWJzdHJhY3Rcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRyZXNldDogZnVuY3Rpb24oKSB7fSxcblxuXHQvKipcblx0ICogQGFjY2VzcyBwcml2YXRlXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0X3JlYWR5OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLl91cGRhdGVNZW51KCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBhY2Nlc3MgcHJpdmF0ZVxuXHQgKiBAc2luY2UgMy41LjBcblx0Ki9cblx0X3ByZUFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmFjdGl2ZSA9IHRydWU7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBhY2Nlc3MgcHJpdmF0ZVxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdF9wb3N0QWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub24oICdjaGFuZ2U6bWVudScsIHRoaXMuX21lbnUsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnY2hhbmdlOnRpdGxlTW9kZScsIHRoaXMuX3RpdGxlLCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ2NoYW5nZTpjb250ZW50JywgdGhpcy5fY29udGVudCwgdGhpcyApO1xuXHRcdHRoaXMub24oICdjaGFuZ2U6dG9vbGJhcicsIHRoaXMuX3Rvb2xiYXIsIHRoaXMgKTtcblxuXHRcdHRoaXMuZnJhbWUub24oICd0aXRsZTpyZW5kZXI6ZGVmYXVsdCcsIHRoaXMuX3JlbmRlclRpdGxlLCB0aGlzICk7XG5cblx0XHR0aGlzLl90aXRsZSgpO1xuXHRcdHRoaXMuX21lbnUoKTtcblx0XHR0aGlzLl90b29sYmFyKCk7XG5cdFx0dGhpcy5fY29udGVudCgpO1xuXHRcdHRoaXMuX3JvdXRlcigpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAYWNjZXNzIHByaXZhdGVcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRfZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5hY3RpdmUgPSBmYWxzZTtcblxuXHRcdHRoaXMuZnJhbWUub2ZmKCAndGl0bGU6cmVuZGVyOmRlZmF1bHQnLCB0aGlzLl9yZW5kZXJUaXRsZSwgdGhpcyApO1xuXG5cdFx0dGhpcy5vZmYoICdjaGFuZ2U6bWVudScsIHRoaXMuX21lbnUsIHRoaXMgKTtcblx0XHR0aGlzLm9mZiggJ2NoYW5nZTp0aXRsZU1vZGUnLCB0aGlzLl90aXRsZSwgdGhpcyApO1xuXHRcdHRoaXMub2ZmKCAnY2hhbmdlOmNvbnRlbnQnLCB0aGlzLl9jb250ZW50LCB0aGlzICk7XG5cdFx0dGhpcy5vZmYoICdjaGFuZ2U6dG9vbGJhcicsIHRoaXMuX3Rvb2xiYXIsIHRoaXMgKTtcblx0fSxcblxuXHQvKipcblx0ICogQGFjY2VzcyBwcml2YXRlXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0X3RpdGxlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmZyYW1lLnRpdGxlLnJlbmRlciggdGhpcy5nZXQoJ3RpdGxlTW9kZScpIHx8ICdkZWZhdWx0JyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAYWNjZXNzIHByaXZhdGVcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRfcmVuZGVyVGl0bGU6IGZ1bmN0aW9uKCB2aWV3ICkge1xuXHRcdHZpZXcuJGVsLnRleHQoIHRoaXMuZ2V0KCd0aXRsZScpIHx8ICcnICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBhY2Nlc3MgcHJpdmF0ZVxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdF9yb3V0ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciByb3V0ZXIgPSB0aGlzLmZyYW1lLnJvdXRlcixcblx0XHRcdG1vZGUgPSB0aGlzLmdldCgncm91dGVyJyksXG5cdFx0XHR2aWV3O1xuXG5cdFx0dGhpcy5mcmFtZS4kZWwudG9nZ2xlQ2xhc3MoICdoaWRlLXJvdXRlcicsICEgbW9kZSApO1xuXHRcdGlmICggISBtb2RlICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuZnJhbWUucm91dGVyLnJlbmRlciggbW9kZSApO1xuXG5cdFx0dmlldyA9IHJvdXRlci5nZXQoKTtcblx0XHRpZiAoIHZpZXcgJiYgdmlldy5zZWxlY3QgKSB7XG5cdFx0XHR2aWV3LnNlbGVjdCggdGhpcy5mcmFtZS5jb250ZW50Lm1vZGUoKSApO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogQGFjY2VzcyBwcml2YXRlXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0X21lbnU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBtZW51ID0gdGhpcy5mcmFtZS5tZW51LFxuXHRcdFx0bW9kZSA9IHRoaXMuZ2V0KCdtZW51JyksXG5cdFx0XHR2aWV3O1xuXG5cdFx0dGhpcy5mcmFtZS4kZWwudG9nZ2xlQ2xhc3MoICdoaWRlLW1lbnUnLCAhIG1vZGUgKTtcblx0XHRpZiAoICEgbW9kZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRtZW51Lm1vZGUoIG1vZGUgKTtcblxuXHRcdHZpZXcgPSBtZW51LmdldCgpO1xuXHRcdGlmICggdmlldyAmJiB2aWV3LnNlbGVjdCApIHtcblx0XHRcdHZpZXcuc2VsZWN0KCB0aGlzLmlkICk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBAYWNjZXNzIHByaXZhdGVcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRfdXBkYXRlTWVudTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHByZXZpb3VzID0gdGhpcy5wcmV2aW91cygnbWVudScpLFxuXHRcdFx0bWVudSA9IHRoaXMuZ2V0KCdtZW51Jyk7XG5cblx0XHRpZiAoIHByZXZpb3VzICkge1xuXHRcdFx0dGhpcy5mcmFtZS5vZmYoICdtZW51OnJlbmRlcjonICsgcHJldmlvdXMsIHRoaXMuX3JlbmRlck1lbnUsIHRoaXMgKTtcblx0XHR9XG5cblx0XHRpZiAoIG1lbnUgKSB7XG5cdFx0XHR0aGlzLmZyYW1lLm9uKCAnbWVudTpyZW5kZXI6JyArIG1lbnUsIHRoaXMuX3JlbmRlck1lbnUsIHRoaXMgKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhIHZpZXcgaW4gdGhlIG1lZGlhIG1lbnUgZm9yIHRoZSBzdGF0ZS5cblx0ICpcblx0ICogQGFjY2VzcyBwcml2YXRlXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKlxuXHQgKiBAcGFyYW0ge21lZGlhLnZpZXcuTWVudX0gdmlldyBUaGUgbWVudSB2aWV3LlxuXHQgKi9cblx0X3JlbmRlck1lbnU6IGZ1bmN0aW9uKCB2aWV3ICkge1xuXHRcdHZhciBtZW51SXRlbSA9IHRoaXMuZ2V0KCdtZW51SXRlbScpLFxuXHRcdFx0dGl0bGUgPSB0aGlzLmdldCgndGl0bGUnKSxcblx0XHRcdHByaW9yaXR5ID0gdGhpcy5nZXQoJ3ByaW9yaXR5Jyk7XG5cblx0XHRpZiAoICEgbWVudUl0ZW0gJiYgdGl0bGUgKSB7XG5cdFx0XHRtZW51SXRlbSA9IHsgdGV4dDogdGl0bGUgfTtcblxuXHRcdFx0aWYgKCBwcmlvcml0eSApIHtcblx0XHRcdFx0bWVudUl0ZW0ucHJpb3JpdHkgPSBwcmlvcml0eTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoICEgbWVudUl0ZW0gKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmlldy5zZXQoIHRoaXMuaWQsIG1lbnVJdGVtICk7XG5cdH1cbn0pO1xuXG5fLmVhY2goWyd0b29sYmFyJywnY29udGVudCddLCBmdW5jdGlvbiggcmVnaW9uICkge1xuXHQvKipcblx0ICogQGFjY2VzcyBwcml2YXRlXG5cdCAqL1xuXHRTdGF0ZS5wcm90b3R5cGVbICdfJyArIHJlZ2lvbiBdID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG1vZGUgPSB0aGlzLmdldCggcmVnaW9uICk7XG5cdFx0aWYgKCBtb2RlICkge1xuXHRcdFx0dGhpcy5mcmFtZVsgcmVnaW9uIF0ucmVuZGVyKCBtb2RlICk7XG5cdFx0fVxuXHR9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdGU7XG4iLCIvKmdsb2JhbHMgXyAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnNlbGVjdGlvblN5bmNcbiAqXG4gKiBTeW5jIGFuIGF0dGFjaG1lbnRzIHNlbGVjdGlvbiBpbiBhIHN0YXRlIHdpdGggYW5vdGhlciBzdGF0ZS5cbiAqXG4gKiBBbGxvd3MgZm9yIHNlbGVjdGluZyBtdWx0aXBsZSBpbWFnZXMgaW4gdGhlIEluc2VydCBNZWRpYSB3b3JrZmxvdywgYW5kIHRoZW5cbiAqIHN3aXRjaGluZyB0byB0aGUgSW5zZXJ0IEdhbGxlcnkgd29ya2Zsb3cgd2hpbGUgcHJlc2VydmluZyB0aGUgYXR0YWNobWVudHMgc2VsZWN0aW9uLlxuICpcbiAqIEBtaXhpblxuICovXG52YXIgc2VsZWN0aW9uU3luYyA9IHtcblx0LyoqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0c3luY1NlbGVjdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMuZ2V0KCdzZWxlY3Rpb24nKSxcblx0XHRcdG1hbmFnZXIgPSB0aGlzLmZyYW1lLl9zZWxlY3Rpb247XG5cblx0XHRpZiAoICEgdGhpcy5nZXQoJ3N5bmNTZWxlY3Rpb24nKSB8fCAhIG1hbmFnZXIgfHwgISBzZWxlY3Rpb24gKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gSWYgdGhlIHNlbGVjdGlvbiBzdXBwb3J0cyBtdWx0aXBsZSBpdGVtcywgdmFsaWRhdGUgdGhlIHN0b3JlZFxuXHRcdC8vIGF0dGFjaG1lbnRzIGJhc2VkIG9uIHRoZSBuZXcgc2VsZWN0aW9uJ3MgY29uZGl0aW9ucy4gUmVjb3JkXG5cdFx0Ly8gdGhlIGF0dGFjaG1lbnRzIHRoYXQgYXJlIG5vdCBpbmNsdWRlZDsgd2UnbGwgbWFpbnRhaW4gYVxuXHRcdC8vIHJlZmVyZW5jZSB0byB0aG9zZS4gT3RoZXIgYXR0YWNobWVudHMgYXJlIGNvbnNpZGVyZWQgaW4gZmx1eC5cblx0XHRpZiAoIHNlbGVjdGlvbi5tdWx0aXBsZSApIHtcblx0XHRcdHNlbGVjdGlvbi5yZXNldCggW10sIHsgc2lsZW50OiB0cnVlIH0pO1xuXHRcdFx0c2VsZWN0aW9uLnZhbGlkYXRlQWxsKCBtYW5hZ2VyLmF0dGFjaG1lbnRzICk7XG5cdFx0XHRtYW5hZ2VyLmRpZmZlcmVuY2UgPSBfLmRpZmZlcmVuY2UoIG1hbmFnZXIuYXR0YWNobWVudHMubW9kZWxzLCBzZWxlY3Rpb24ubW9kZWxzICk7XG5cdFx0fVxuXG5cdFx0Ly8gU3luYyB0aGUgc2VsZWN0aW9uJ3Mgc2luZ2xlIGl0ZW0gd2l0aCB0aGUgbWFzdGVyLlxuXHRcdHNlbGVjdGlvbi5zaW5nbGUoIG1hbmFnZXIuc2luZ2xlICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlY29yZCB0aGUgY3VycmVudGx5IGFjdGl2ZSBhdHRhY2htZW50cywgd2hpY2ggaXMgYSBjb21iaW5hdGlvblxuXHQgKiBvZiB0aGUgc2VsZWN0aW9uJ3MgYXR0YWNobWVudHMgYW5kIHRoZSBzZXQgb2Ygc2VsZWN0ZWRcblx0ICogYXR0YWNobWVudHMgdGhhdCB0aGlzIHNwZWNpZmljIHNlbGVjdGlvbiBjb25zaWRlcmVkIGludmFsaWQuXG5cdCAqIFJlc2V0IHRoZSBkaWZmZXJlbmNlIGFuZCByZWNvcmQgdGhlIHNpbmdsZSBhdHRhY2htZW50LlxuXHQgKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdHJlY29yZFNlbGVjdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMuZ2V0KCdzZWxlY3Rpb24nKSxcblx0XHRcdG1hbmFnZXIgPSB0aGlzLmZyYW1lLl9zZWxlY3Rpb247XG5cblx0XHRpZiAoICEgdGhpcy5nZXQoJ3N5bmNTZWxlY3Rpb24nKSB8fCAhIG1hbmFnZXIgfHwgISBzZWxlY3Rpb24gKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCBzZWxlY3Rpb24ubXVsdGlwbGUgKSB7XG5cdFx0XHRtYW5hZ2VyLmF0dGFjaG1lbnRzLnJlc2V0KCBzZWxlY3Rpb24udG9BcnJheSgpLmNvbmNhdCggbWFuYWdlci5kaWZmZXJlbmNlICkgKTtcblx0XHRcdG1hbmFnZXIuZGlmZmVyZW5jZSA9IFtdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtYW5hZ2VyLmF0dGFjaG1lbnRzLmFkZCggc2VsZWN0aW9uLnRvQXJyYXkoKSApO1xuXHRcdH1cblxuXHRcdG1hbmFnZXIuc2luZ2xlID0gc2VsZWN0aW9uLl9zaW5nbGU7XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2VsZWN0aW9uU3luYztcbiIsIi8qZ2xvYmFscyB3cCwgalF1ZXJ5LCBfLCBCYWNrYm9uZSAqL1xuXG52YXIgbWVkaWEgPSB3cC5tZWRpYSxcblx0JCA9IGpRdWVyeSxcblx0bDEwbjtcblxubWVkaWEuaXNUb3VjaERldmljZSA9ICggJ29udG91Y2hlbmQnIGluIGRvY3VtZW50ICk7XG5cbi8vIExpbmsgYW55IGxvY2FsaXplZCBzdHJpbmdzLlxubDEwbiA9IG1lZGlhLnZpZXcubDEwbiA9IHdpbmRvdy5fd3BNZWRpYVZpZXdzTDEwbiB8fCB7fTtcblxuLy8gTGluayBhbnkgc2V0dGluZ3MuXG5tZWRpYS52aWV3LnNldHRpbmdzID0gbDEwbi5zZXR0aW5ncyB8fCB7fTtcbmRlbGV0ZSBsMTBuLnNldHRpbmdzO1xuXG4vLyBDb3B5IHRoZSBgcG9zdGAgc2V0dGluZyBvdmVyIHRvIHRoZSBtb2RlbCBzZXR0aW5ncy5cbm1lZGlhLm1vZGVsLnNldHRpbmdzLnBvc3QgPSBtZWRpYS52aWV3LnNldHRpbmdzLnBvc3Q7XG5cbi8vIENoZWNrIGlmIHRoZSBicm93c2VyIHN1cHBvcnRzIENTUyAzLjAgdHJhbnNpdGlvbnNcbiQuc3VwcG9ydC50cmFuc2l0aW9uID0gKGZ1bmN0aW9uKCl7XG5cdHZhciBzdHlsZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZSxcblx0XHR0cmFuc2l0aW9ucyA9IHtcblx0XHRcdFdlYmtpdFRyYW5zaXRpb246ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcblx0XHRcdE1velRyYW5zaXRpb246ICAgICd0cmFuc2l0aW9uZW5kJyxcblx0XHRcdE9UcmFuc2l0aW9uOiAgICAgICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCcsXG5cdFx0XHR0cmFuc2l0aW9uOiAgICAgICAndHJhbnNpdGlvbmVuZCdcblx0XHR9LCB0cmFuc2l0aW9uO1xuXG5cdHRyYW5zaXRpb24gPSBfLmZpbmQoIF8ua2V5cyggdHJhbnNpdGlvbnMgKSwgZnVuY3Rpb24oIHRyYW5zaXRpb24gKSB7XG5cdFx0cmV0dXJuICEgXy5pc1VuZGVmaW5lZCggc3R5bGVbIHRyYW5zaXRpb24gXSApO1xuXHR9KTtcblxuXHRyZXR1cm4gdHJhbnNpdGlvbiAmJiB7XG5cdFx0ZW5kOiB0cmFuc2l0aW9uc1sgdHJhbnNpdGlvbiBdXG5cdH07XG59KCkpO1xuXG4vKipcbiAqIEEgc2hhcmVkIGV2ZW50IGJ1cyB1c2VkIHRvIHByb3ZpZGUgZXZlbnRzIGludG9cbiAqIHRoZSBtZWRpYSB3b3JrZmxvd3MgdGhhdCAzcmQtcGFydHkgZGV2cyBjYW4gdXNlIHRvIGhvb2tcbiAqIGluLlxuICovXG5tZWRpYS5ldmVudHMgPSBfLmV4dGVuZCgge30sIEJhY2tib25lLkV2ZW50cyApO1xuXG4vKipcbiAqIE1ha2VzIGl0IGVhc2llciB0byBiaW5kIGV2ZW50cyB1c2luZyB0cmFuc2l0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBzZW5zaXRpdml0eVxuICogQHJldHVybnMge1Byb21pc2V9XG4gKi9cbm1lZGlhLnRyYW5zaXRpb24gPSBmdW5jdGlvbiggc2VsZWN0b3IsIHNlbnNpdGl2aXR5ICkge1xuXHR2YXIgZGVmZXJyZWQgPSAkLkRlZmVycmVkKCk7XG5cblx0c2Vuc2l0aXZpdHkgPSBzZW5zaXRpdml0eSB8fCAyMDAwO1xuXG5cdGlmICggJC5zdXBwb3J0LnRyYW5zaXRpb24gKSB7XG5cdFx0aWYgKCAhIChzZWxlY3RvciBpbnN0YW5jZW9mICQpICkge1xuXHRcdFx0c2VsZWN0b3IgPSAkKCBzZWxlY3RvciApO1xuXHRcdH1cblxuXHRcdC8vIFJlc29sdmUgdGhlIGRlZmVycmVkIHdoZW4gdGhlIGZpcnN0IGVsZW1lbnQgZmluaXNoZXMgYW5pbWF0aW5nLlxuXHRcdHNlbGVjdG9yLmZpcnN0KCkub25lKCAkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsIGRlZmVycmVkLnJlc29sdmUgKTtcblxuXHRcdC8vIEp1c3QgaW4gY2FzZSB0aGUgZXZlbnQgZG9lc24ndCB0cmlnZ2VyLCBmaXJlIGEgY2FsbGJhY2suXG5cdFx0Xy5kZWxheSggZGVmZXJyZWQucmVzb2x2ZSwgc2Vuc2l0aXZpdHkgKTtcblxuXHQvLyBPdGhlcndpc2UsIGV4ZWN1dGUgb24gdGhlIHNwb3QuXG5cdH0gZWxzZSB7XG5cdFx0ZGVmZXJyZWQucmVzb2x2ZSgpO1xuXHR9XG5cblx0cmV0dXJuIGRlZmVycmVkLnByb21pc2UoKTtcbn07XG5cbm1lZGlhLmNvbnRyb2xsZXIuUmVnaW9uID0gcmVxdWlyZSggJy4vY29udHJvbGxlcnMvcmVnaW9uLmpzJyApO1xubWVkaWEuY29udHJvbGxlci5TdGF0ZU1hY2hpbmUgPSByZXF1aXJlKCAnLi9jb250cm9sbGVycy9zdGF0ZS1tYWNoaW5lLmpzJyApO1xubWVkaWEuY29udHJvbGxlci5TdGF0ZSA9IHJlcXVpcmUoICcuL2NvbnRyb2xsZXJzL3N0YXRlLmpzJyApO1xuXG5tZWRpYS5zZWxlY3Rpb25TeW5jID0gcmVxdWlyZSggJy4vdXRpbHMvc2VsZWN0aW9uLXN5bmMuanMnICk7XG5tZWRpYS5jb250cm9sbGVyLkxpYnJhcnkgPSByZXF1aXJlKCAnLi9jb250cm9sbGVycy9saWJyYXJ5LmpzJyApO1xubWVkaWEuY29udHJvbGxlci5JbWFnZURldGFpbHMgPSByZXF1aXJlKCAnLi9jb250cm9sbGVycy9pbWFnZS1kZXRhaWxzLmpzJyApO1xubWVkaWEuY29udHJvbGxlci5HYWxsZXJ5RWRpdCA9IHJlcXVpcmUoICcuL2NvbnRyb2xsZXJzL2dhbGxlcnktZWRpdC5qcycgKTtcbm1lZGlhLmNvbnRyb2xsZXIuR2FsbGVyeUFkZCA9IHJlcXVpcmUoICcuL2NvbnRyb2xsZXJzL2dhbGxlcnktYWRkLmpzJyApO1xubWVkaWEuY29udHJvbGxlci5Db2xsZWN0aW9uRWRpdCA9IHJlcXVpcmUoICcuL2NvbnRyb2xsZXJzL2NvbGxlY3Rpb24tZWRpdC5qcycgKTtcbm1lZGlhLmNvbnRyb2xsZXIuQ29sbGVjdGlvbkFkZCA9IHJlcXVpcmUoICcuL2NvbnRyb2xsZXJzL2NvbGxlY3Rpb24tYWRkLmpzJyApO1xubWVkaWEuY29udHJvbGxlci5GZWF0dXJlZEltYWdlID0gcmVxdWlyZSggJy4vY29udHJvbGxlcnMvZmVhdHVyZWQtaW1hZ2UuanMnICk7XG5tZWRpYS5jb250cm9sbGVyLlJlcGxhY2VJbWFnZSA9IHJlcXVpcmUoICcuL2NvbnRyb2xsZXJzL3JlcGxhY2UtaW1hZ2UuanMnICk7XG5tZWRpYS5jb250cm9sbGVyLkVkaXRJbWFnZSA9IHJlcXVpcmUoICcuL2NvbnRyb2xsZXJzL2VkaXQtaW1hZ2UuanMnICk7XG5tZWRpYS5jb250cm9sbGVyLk1lZGlhTGlicmFyeSA9IHJlcXVpcmUoICcuL2NvbnRyb2xsZXJzL21lZGlhLWxpYnJhcnkuanMnICk7XG5tZWRpYS5jb250cm9sbGVyLkVtYmVkID0gcmVxdWlyZSggJy4vY29udHJvbGxlcnMvZW1iZWQuanMnICk7XG5tZWRpYS5jb250cm9sbGVyLkNyb3BwZXIgPSByZXF1aXJlKCAnLi9jb250cm9sbGVycy9jcm9wcGVyLmpzJyApO1xuXG5tZWRpYS5WaWV3ID0gcmVxdWlyZSggJy4vdmlld3Mvdmlldy5qcycgKTtcbm1lZGlhLnZpZXcuRnJhbWUgPSByZXF1aXJlKCAnLi92aWV3cy9mcmFtZS5qcycgKTtcbm1lZGlhLnZpZXcuTWVkaWFGcmFtZSA9IHJlcXVpcmUoICcuL3ZpZXdzL21lZGlhLWZyYW1lLmpzJyApO1xubWVkaWEudmlldy5NZWRpYUZyYW1lLlNlbGVjdCA9IHJlcXVpcmUoICcuL3ZpZXdzL2ZyYW1lL3NlbGVjdC5qcycgKTtcbm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5Qb3N0ID0gcmVxdWlyZSggJy4vdmlld3MvZnJhbWUvcG9zdC5qcycgKTtcbm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5JbWFnZURldGFpbHMgPSByZXF1aXJlKCAnLi92aWV3cy9mcmFtZS9pbWFnZS1kZXRhaWxzLmpzJyApO1xubWVkaWEudmlldy5Nb2RhbCA9IHJlcXVpcmUoICcuL3ZpZXdzL21vZGFsLmpzJyApO1xubWVkaWEudmlldy5Gb2N1c01hbmFnZXIgPSByZXF1aXJlKCAnLi92aWV3cy9mb2N1cy1tYW5hZ2VyLmpzJyApO1xubWVkaWEudmlldy5VcGxvYWRlcldpbmRvdyA9IHJlcXVpcmUoICcuL3ZpZXdzL3VwbG9hZGVyL3dpbmRvdy5qcycgKTtcbm1lZGlhLnZpZXcuRWRpdG9yVXBsb2FkZXIgPSByZXF1aXJlKCAnLi92aWV3cy91cGxvYWRlci9lZGl0b3IuanMnICk7XG5tZWRpYS52aWV3LlVwbG9hZGVySW5saW5lID0gcmVxdWlyZSggJy4vdmlld3MvdXBsb2FkZXIvaW5saW5lLmpzJyApO1xubWVkaWEudmlldy5VcGxvYWRlclN0YXR1cyA9IHJlcXVpcmUoICcuL3ZpZXdzL3VwbG9hZGVyL3N0YXR1cy5qcycgKTtcbm1lZGlhLnZpZXcuVXBsb2FkZXJTdGF0dXNFcnJvciA9IHJlcXVpcmUoICcuL3ZpZXdzL3VwbG9hZGVyL3N0YXR1cy1lcnJvci5qcycgKTtcbm1lZGlhLnZpZXcuVG9vbGJhciA9IHJlcXVpcmUoICcuL3ZpZXdzL3Rvb2xiYXIuanMnICk7XG5tZWRpYS52aWV3LlRvb2xiYXIuU2VsZWN0ID0gcmVxdWlyZSggJy4vdmlld3MvdG9vbGJhci9zZWxlY3QuanMnICk7XG5tZWRpYS52aWV3LlRvb2xiYXIuRW1iZWQgPSByZXF1aXJlKCAnLi92aWV3cy90b29sYmFyL2VtYmVkLmpzJyApO1xubWVkaWEudmlldy5CdXR0b24gPSByZXF1aXJlKCAnLi92aWV3cy9idXR0b24uanMnICk7XG5tZWRpYS52aWV3LkJ1dHRvbkdyb3VwID0gcmVxdWlyZSggJy4vdmlld3MvYnV0dG9uLWdyb3VwLmpzJyApO1xubWVkaWEudmlldy5Qcmlvcml0eUxpc3QgPSByZXF1aXJlKCAnLi92aWV3cy9wcmlvcml0eS1saXN0LmpzJyApO1xubWVkaWEudmlldy5NZW51SXRlbSA9IHJlcXVpcmUoICcuL3ZpZXdzL21lbnUtaXRlbS5qcycgKTtcbm1lZGlhLnZpZXcuTWVudSA9IHJlcXVpcmUoICcuL3ZpZXdzL21lbnUuanMnICk7XG5tZWRpYS52aWV3LlJvdXRlckl0ZW0gPSByZXF1aXJlKCAnLi92aWV3cy9yb3V0ZXItaXRlbS5qcycgKTtcbm1lZGlhLnZpZXcuUm91dGVyID0gcmVxdWlyZSggJy4vdmlld3Mvcm91dGVyLmpzJyApO1xubWVkaWEudmlldy5TaWRlYmFyID0gcmVxdWlyZSggJy4vdmlld3Mvc2lkZWJhci5qcycgKTtcbm1lZGlhLnZpZXcuQXR0YWNobWVudCA9IHJlcXVpcmUoICcuL3ZpZXdzL2F0dGFjaG1lbnQuanMnICk7XG5tZWRpYS52aWV3LkF0dGFjaG1lbnQuTGlicmFyeSA9IHJlcXVpcmUoICcuL3ZpZXdzL2F0dGFjaG1lbnQvbGlicmFyeS5qcycgKTtcbm1lZGlhLnZpZXcuQXR0YWNobWVudC5FZGl0TGlicmFyeSA9IHJlcXVpcmUoICcuL3ZpZXdzL2F0dGFjaG1lbnQvZWRpdC1saWJyYXJ5LmpzJyApO1xubWVkaWEudmlldy5BdHRhY2htZW50cyA9IHJlcXVpcmUoICcuL3ZpZXdzL2F0dGFjaG1lbnRzLmpzJyApO1xubWVkaWEudmlldy5TZWFyY2ggPSByZXF1aXJlKCAnLi92aWV3cy9zZWFyY2guanMnICk7XG5tZWRpYS52aWV3LkF0dGFjaG1lbnRGaWx0ZXJzID0gcmVxdWlyZSggJy4vdmlld3MvYXR0YWNobWVudC1maWx0ZXJzLmpzJyApO1xubWVkaWEudmlldy5EYXRlRmlsdGVyID0gcmVxdWlyZSggJy4vdmlld3MvYXR0YWNobWVudC1maWx0ZXJzL2RhdGUuanMnICk7XG5tZWRpYS52aWV3LkF0dGFjaG1lbnRGaWx0ZXJzLlVwbG9hZGVkID0gcmVxdWlyZSggJy4vdmlld3MvYXR0YWNobWVudC1maWx0ZXJzL3VwbG9hZGVkLmpzJyApO1xubWVkaWEudmlldy5BdHRhY2htZW50RmlsdGVycy5BbGwgPSByZXF1aXJlKCAnLi92aWV3cy9hdHRhY2htZW50LWZpbHRlcnMvYWxsLmpzJyApO1xubWVkaWEudmlldy5BdHRhY2htZW50c0Jyb3dzZXIgPSByZXF1aXJlKCAnLi92aWV3cy9hdHRhY2htZW50cy9icm93c2VyLmpzJyApO1xubWVkaWEudmlldy5TZWxlY3Rpb24gPSByZXF1aXJlKCAnLi92aWV3cy9zZWxlY3Rpb24uanMnICk7XG5tZWRpYS52aWV3LkF0dGFjaG1lbnQuU2VsZWN0aW9uID0gcmVxdWlyZSggJy4vdmlld3MvYXR0YWNobWVudC9zZWxlY3Rpb24uanMnICk7XG5tZWRpYS52aWV3LkF0dGFjaG1lbnRzLlNlbGVjdGlvbiA9IHJlcXVpcmUoICcuL3ZpZXdzL2F0dGFjaG1lbnRzL3NlbGVjdGlvbi5qcycgKTtcbm1lZGlhLnZpZXcuQXR0YWNobWVudC5FZGl0U2VsZWN0aW9uID0gcmVxdWlyZSggJy4vdmlld3MvYXR0YWNobWVudC9lZGl0LXNlbGVjdGlvbi5qcycgKTtcbm1lZGlhLnZpZXcuU2V0dGluZ3MgPSByZXF1aXJlKCAnLi92aWV3cy9zZXR0aW5ncy5qcycgKTtcbm1lZGlhLnZpZXcuU2V0dGluZ3MuQXR0YWNobWVudERpc3BsYXkgPSByZXF1aXJlKCAnLi92aWV3cy9zZXR0aW5ncy9hdHRhY2htZW50LWRpc3BsYXkuanMnICk7XG5tZWRpYS52aWV3LlNldHRpbmdzLkdhbGxlcnkgPSByZXF1aXJlKCAnLi92aWV3cy9zZXR0aW5ncy9nYWxsZXJ5LmpzJyApO1xubWVkaWEudmlldy5TZXR0aW5ncy5QbGF5bGlzdCA9IHJlcXVpcmUoICcuL3ZpZXdzL3NldHRpbmdzL3BsYXlsaXN0LmpzJyApO1xubWVkaWEudmlldy5BdHRhY2htZW50LkRldGFpbHMgPSByZXF1aXJlKCAnLi92aWV3cy9hdHRhY2htZW50L2RldGFpbHMuanMnICk7XG5tZWRpYS52aWV3LkF0dGFjaG1lbnRDb21wYXQgPSByZXF1aXJlKCAnLi92aWV3cy9hdHRhY2htZW50LWNvbXBhdC5qcycgKTtcbm1lZGlhLnZpZXcuSWZyYW1lID0gcmVxdWlyZSggJy4vdmlld3MvaWZyYW1lLmpzJyApO1xubWVkaWEudmlldy5FbWJlZCA9IHJlcXVpcmUoICcuL3ZpZXdzL2VtYmVkLmpzJyApO1xubWVkaWEudmlldy5MYWJlbCA9IHJlcXVpcmUoICcuL3ZpZXdzL2xhYmVsLmpzJyApO1xubWVkaWEudmlldy5FbWJlZFVybCA9IHJlcXVpcmUoICcuL3ZpZXdzL2VtYmVkL3VybC5qcycgKTtcbm1lZGlhLnZpZXcuRW1iZWRMaW5rID0gcmVxdWlyZSggJy4vdmlld3MvZW1iZWQvbGluay5qcycgKTtcbm1lZGlhLnZpZXcuRW1iZWRJbWFnZSA9IHJlcXVpcmUoICcuL3ZpZXdzL2VtYmVkL2ltYWdlLmpzJyApO1xubWVkaWEudmlldy5JbWFnZURldGFpbHMgPSByZXF1aXJlKCAnLi92aWV3cy9pbWFnZS1kZXRhaWxzLmpzJyApO1xubWVkaWEudmlldy5Dcm9wcGVyID0gcmVxdWlyZSggJy4vdmlld3MvY3JvcHBlci5qcycgKTtcbm1lZGlhLnZpZXcuRWRpdEltYWdlID0gcmVxdWlyZSggJy4vdmlld3MvZWRpdC1pbWFnZS5qcycgKTtcbm1lZGlhLnZpZXcuU3Bpbm5lciA9IHJlcXVpcmUoICcuL3ZpZXdzL3NwaW5uZXIuanMnICk7XG4iLCIvKmdsb2JhbHMgXyAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudENvbXBhdFxuICpcbiAqIEEgdmlldyB0byBkaXNwbGF5IGZpZWxkcyBhZGRlZCB2aWEgdGhlIGBhdHRhY2htZW50X2ZpZWxkc190b19lZGl0YCBmaWx0ZXIuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBWaWV3ID0gd3AubWVkaWEuVmlldyxcblx0QXR0YWNobWVudENvbXBhdDtcblxuQXR0YWNobWVudENvbXBhdCA9IFZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogICAnZm9ybScsXG5cdGNsYXNzTmFtZTogJ2NvbXBhdC1pdGVtJyxcblxuXHRldmVudHM6IHtcblx0XHQnc3VibWl0JzogICAgICAgICAgJ3ByZXZlbnREZWZhdWx0Jyxcblx0XHQnY2hhbmdlIGlucHV0JzogICAgJ3NhdmUnLFxuXHRcdCdjaGFuZ2Ugc2VsZWN0JzogICAnc2F2ZScsXG5cdFx0J2NoYW5nZSB0ZXh0YXJlYSc6ICdzYXZlJ1xuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdjaGFuZ2U6Y29tcGF0JywgdGhpcy5yZW5kZXIgKTtcblx0fSxcblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRDb21wYXR9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRkaXNwb3NlOiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMuJCgnOmZvY3VzJykubGVuZ3RoICkge1xuXHRcdFx0dGhpcy5zYXZlKCk7XG5cdFx0fVxuXHRcdC8qKlxuXHRcdCAqIGNhbGwgJ2Rpc3Bvc2UnIGRpcmVjdGx5IG9uIHRoZSBwYXJlbnQgY2xhc3Ncblx0XHQgKi9cblx0XHRyZXR1cm4gVmlldy5wcm90b3R5cGUuZGlzcG9zZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5BdHRhY2htZW50Q29tcGF0fSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgY29tcGF0ID0gdGhpcy5tb2RlbC5nZXQoJ2NvbXBhdCcpO1xuXHRcdGlmICggISBjb21wYXQgfHwgISBjb21wYXQuaXRlbSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnZpZXdzLmRldGFjaCgpO1xuXHRcdHRoaXMuJGVsLmh0bWwoIGNvbXBhdC5pdGVtICk7XG5cdFx0dGhpcy52aWV3cy5yZW5kZXIoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuXHQgKi9cblx0cHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHRzYXZlOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dmFyIGRhdGEgPSB7fTtcblxuXHRcdGlmICggZXZlbnQgKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblxuXHRcdF8uZWFjaCggdGhpcy4kZWwuc2VyaWFsaXplQXJyYXkoKSwgZnVuY3Rpb24oIHBhaXIgKSB7XG5cdFx0XHRkYXRhWyBwYWlyLm5hbWUgXSA9IHBhaXIudmFsdWU7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmNvbnRyb2xsZXIudHJpZ2dlciggJ2F0dGFjaG1lbnQ6Y29tcGF0OndhaXRpbmcnLCBbJ3dhaXRpbmcnXSApO1xuXHRcdHRoaXMubW9kZWwuc2F2ZUNvbXBhdCggZGF0YSApLmFsd2F5cyggXy5iaW5kKCB0aGlzLnBvc3RTYXZlLCB0aGlzICkgKTtcblx0fSxcblxuXHRwb3N0U2F2ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5jb250cm9sbGVyLnRyaWdnZXIoICdhdHRhY2htZW50OmNvbXBhdDpyZWFkeScsIFsncmVhZHknXSApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBdHRhY2htZW50Q29tcGF0O1xuIiwiLypnbG9iYWxzIF8sIGpRdWVyeSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudEZpbHRlcnNcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyICQgPSBqUXVlcnksXG5cdEF0dGFjaG1lbnRGaWx0ZXJzO1xuXG5BdHRhY2htZW50RmlsdGVycyA9IHdwLm1lZGlhLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogICAnc2VsZWN0Jyxcblx0Y2xhc3NOYW1lOiAnYXR0YWNobWVudC1maWx0ZXJzJyxcblx0aWQ6ICAgICAgICAnbWVkaWEtYXR0YWNobWVudC1maWx0ZXJzJyxcblxuXHRldmVudHM6IHtcblx0XHRjaGFuZ2U6ICdjaGFuZ2UnXG5cdH0sXG5cblx0a2V5czogW10sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5jcmVhdGVGaWx0ZXJzKCk7XG5cdFx0Xy5leHRlbmQoIHRoaXMuZmlsdGVycywgdGhpcy5vcHRpb25zLmZpbHRlcnMgKTtcblxuXHRcdC8vIEJ1aWxkIGA8b3B0aW9uPmAgZWxlbWVudHMuXG5cdFx0dGhpcy4kZWwuaHRtbCggXy5jaGFpbiggdGhpcy5maWx0ZXJzICkubWFwKCBmdW5jdGlvbiggZmlsdGVyLCB2YWx1ZSApIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGVsOiAkKCAnPG9wdGlvbj48L29wdGlvbj4nICkudmFsKCB2YWx1ZSApLmh0bWwoIGZpbHRlci50ZXh0IClbMF0sXG5cdFx0XHRcdHByaW9yaXR5OiBmaWx0ZXIucHJpb3JpdHkgfHwgNTBcblx0XHRcdH07XG5cdFx0fSwgdGhpcyApLnNvcnRCeSgncHJpb3JpdHknKS5wbHVjaygnZWwnKS52YWx1ZSgpICk7XG5cblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnY2hhbmdlJywgdGhpcy5zZWxlY3QgKTtcblx0XHR0aGlzLnNlbGVjdCgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAYWJzdHJhY3Rcblx0ICovXG5cdGNyZWF0ZUZpbHRlcnM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZmlsdGVycyA9IHt9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBXaGVuIHRoZSBzZWxlY3RlZCBmaWx0ZXIgY2hhbmdlcywgdXBkYXRlIHRoZSBBdHRhY2htZW50IFF1ZXJ5IHByb3BlcnRpZXMgdG8gbWF0Y2guXG5cdCAqL1xuXHRjaGFuZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBmaWx0ZXIgPSB0aGlzLmZpbHRlcnNbIHRoaXMuZWwudmFsdWUgXTtcblx0XHRpZiAoIGZpbHRlciApIHtcblx0XHRcdHRoaXMubW9kZWwuc2V0KCBmaWx0ZXIucHJvcHMgKTtcblx0XHR9XG5cdH0sXG5cblx0c2VsZWN0OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbW9kZWwgPSB0aGlzLm1vZGVsLFxuXHRcdFx0dmFsdWUgPSAnYWxsJyxcblx0XHRcdHByb3BzID0gbW9kZWwudG9KU09OKCk7XG5cblx0XHRfLmZpbmQoIHRoaXMuZmlsdGVycywgZnVuY3Rpb24oIGZpbHRlciwgaWQgKSB7XG5cdFx0XHR2YXIgZXF1YWwgPSBfLmFsbCggZmlsdGVyLnByb3BzLCBmdW5jdGlvbiggcHJvcCwga2V5ICkge1xuXHRcdFx0XHRyZXR1cm4gcHJvcCA9PT0gKCBfLmlzVW5kZWZpbmVkKCBwcm9wc1sga2V5IF0gKSA/IG51bGwgOiBwcm9wc1sga2V5IF0gKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoIGVxdWFsICkge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPSBpZDtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHRoaXMuJGVsLnZhbCggdmFsdWUgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXR0YWNobWVudEZpbHRlcnM7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRGaWx0ZXJzLkFsbFxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudEZpbHRlcnNcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdEFsbDtcblxuQWxsID0gd3AubWVkaWEudmlldy5BdHRhY2htZW50RmlsdGVycy5leHRlbmQoe1xuXHRjcmVhdGVGaWx0ZXJzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZmlsdGVycyA9IHt9O1xuXG5cdFx0Xy5lYWNoKCB3cC5tZWRpYS52aWV3LnNldHRpbmdzLm1pbWVUeXBlcyB8fCB7fSwgZnVuY3Rpb24oIHRleHQsIGtleSApIHtcblx0XHRcdGZpbHRlcnNbIGtleSBdID0ge1xuXHRcdFx0XHR0ZXh0OiB0ZXh0LFxuXHRcdFx0XHRwcm9wczoge1xuXHRcdFx0XHRcdHN0YXR1czogIG51bGwsXG5cdFx0XHRcdFx0dHlwZTogICAga2V5LFxuXHRcdFx0XHRcdHVwbG9hZGVkVG86IG51bGwsXG5cdFx0XHRcdFx0b3JkZXJieTogJ2RhdGUnLFxuXHRcdFx0XHRcdG9yZGVyOiAgICdERVNDJ1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdFx0ZmlsdGVycy5hbGwgPSB7XG5cdFx0XHR0ZXh0OiAgbDEwbi5hbGxNZWRpYUl0ZW1zLFxuXHRcdFx0cHJvcHM6IHtcblx0XHRcdFx0c3RhdHVzOiAgbnVsbCxcblx0XHRcdFx0dHlwZTogICAgbnVsbCxcblx0XHRcdFx0dXBsb2FkZWRUbzogbnVsbCxcblx0XHRcdFx0b3JkZXJieTogJ2RhdGUnLFxuXHRcdFx0XHRvcmRlcjogICAnREVTQydcblx0XHRcdH0sXG5cdFx0XHRwcmlvcml0eTogMTBcblx0XHR9O1xuXG5cdFx0aWYgKCB3cC5tZWRpYS52aWV3LnNldHRpbmdzLnBvc3QuaWQgKSB7XG5cdFx0XHRmaWx0ZXJzLnVwbG9hZGVkID0ge1xuXHRcdFx0XHR0ZXh0OiAgbDEwbi51cGxvYWRlZFRvVGhpc1Bvc3QsXG5cdFx0XHRcdHByb3BzOiB7XG5cdFx0XHRcdFx0c3RhdHVzOiAgbnVsbCxcblx0XHRcdFx0XHR0eXBlOiAgICBudWxsLFxuXHRcdFx0XHRcdHVwbG9hZGVkVG86IHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MucG9zdC5pZCxcblx0XHRcdFx0XHRvcmRlcmJ5OiAnbWVudU9yZGVyJyxcblx0XHRcdFx0XHRvcmRlcjogICAnQVNDJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmlvcml0eTogMjBcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0ZmlsdGVycy51bmF0dGFjaGVkID0ge1xuXHRcdFx0dGV4dDogIGwxMG4udW5hdHRhY2hlZCxcblx0XHRcdHByb3BzOiB7XG5cdFx0XHRcdHN0YXR1czogICAgIG51bGwsXG5cdFx0XHRcdHVwbG9hZGVkVG86IDAsXG5cdFx0XHRcdHR5cGU6ICAgICAgIG51bGwsXG5cdFx0XHRcdG9yZGVyYnk6ICAgICdtZW51T3JkZXInLFxuXHRcdFx0XHRvcmRlcjogICAgICAnQVNDJ1xuXHRcdFx0fSxcblx0XHRcdHByaW9yaXR5OiA1MFxuXHRcdH07XG5cblx0XHRpZiAoIHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MubWVkaWFUcmFzaCAmJlxuXHRcdFx0dGhpcy5jb250cm9sbGVyLmlzTW9kZUFjdGl2ZSggJ2dyaWQnICkgKSB7XG5cblx0XHRcdGZpbHRlcnMudHJhc2ggPSB7XG5cdFx0XHRcdHRleHQ6ICBsMTBuLnRyYXNoLFxuXHRcdFx0XHRwcm9wczoge1xuXHRcdFx0XHRcdHVwbG9hZGVkVG86IG51bGwsXG5cdFx0XHRcdFx0c3RhdHVzOiAgICAgJ3RyYXNoJyxcblx0XHRcdFx0XHR0eXBlOiAgICAgICBudWxsLFxuXHRcdFx0XHRcdG9yZGVyYnk6ICAgICdkYXRlJyxcblx0XHRcdFx0XHRvcmRlcjogICAgICAnREVTQydcblx0XHRcdFx0fSxcblx0XHRcdFx0cHJpb3JpdHk6IDUwXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHRoaXMuZmlsdGVycyA9IGZpbHRlcnM7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFsbDtcbiIsIi8qZ2xvYmFscyB3cCwgXyAqL1xuXG4vKipcbiAqIEEgZmlsdGVyIGRyb3Bkb3duIGZvciBtb250aC9kYXRlcy5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRGaWx0ZXJzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHREYXRlRmlsdGVyO1xuXG5EYXRlRmlsdGVyID0gd3AubWVkaWEudmlldy5BdHRhY2htZW50RmlsdGVycy5leHRlbmQoe1xuXHRpZDogJ21lZGlhLWF0dGFjaG1lbnQtZGF0ZS1maWx0ZXJzJyxcblxuXHRjcmVhdGVGaWx0ZXJzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZmlsdGVycyA9IHt9O1xuXHRcdF8uZWFjaCggd3AubWVkaWEudmlldy5zZXR0aW5ncy5tb250aHMgfHwge30sIGZ1bmN0aW9uKCB2YWx1ZSwgaW5kZXggKSB7XG5cdFx0XHRmaWx0ZXJzWyBpbmRleCBdID0ge1xuXHRcdFx0XHR0ZXh0OiB2YWx1ZS50ZXh0LFxuXHRcdFx0XHRwcm9wczoge1xuXHRcdFx0XHRcdHllYXI6IHZhbHVlLnllYXIsXG5cdFx0XHRcdFx0bW9udGhudW06IHZhbHVlLm1vbnRoXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fSk7XG5cdFx0ZmlsdGVycy5hbGwgPSB7XG5cdFx0XHR0ZXh0OiAgbDEwbi5hbGxEYXRlcyxcblx0XHRcdHByb3BzOiB7XG5cdFx0XHRcdG1vbnRobnVtOiBmYWxzZSxcblx0XHRcdFx0eWVhcjogIGZhbHNlXG5cdFx0XHR9LFxuXHRcdFx0cHJpb3JpdHk6IDEwXG5cdFx0fTtcblx0XHR0aGlzLmZpbHRlcnMgPSBmaWx0ZXJzO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRlRmlsdGVyO1xuIiwiLypnbG9iYWxzIHdwICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5BdHRhY2htZW50RmlsdGVycy5VcGxvYWRlZFxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudEZpbHRlcnNcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdFVwbG9hZGVkO1xuXG5VcGxvYWRlZCA9IHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudEZpbHRlcnMuZXh0ZW5kKHtcblx0Y3JlYXRlRmlsdGVyczogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHR5cGUgPSB0aGlzLm1vZGVsLmdldCgndHlwZScpLFxuXHRcdFx0dHlwZXMgPSB3cC5tZWRpYS52aWV3LnNldHRpbmdzLm1pbWVUeXBlcyxcblx0XHRcdHRleHQ7XG5cblx0XHRpZiAoIHR5cGVzICYmIHR5cGUgKSB7XG5cdFx0XHR0ZXh0ID0gdHlwZXNbIHR5cGUgXTtcblx0XHR9XG5cblx0XHR0aGlzLmZpbHRlcnMgPSB7XG5cdFx0XHRhbGw6IHtcblx0XHRcdFx0dGV4dDogIHRleHQgfHwgbDEwbi5hbGxNZWRpYUl0ZW1zLFxuXHRcdFx0XHRwcm9wczoge1xuXHRcdFx0XHRcdHVwbG9hZGVkVG86IG51bGwsXG5cdFx0XHRcdFx0b3JkZXJieTogJ2RhdGUnLFxuXHRcdFx0XHRcdG9yZGVyOiAgICdERVNDJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmlvcml0eTogMTBcblx0XHRcdH0sXG5cblx0XHRcdHVwbG9hZGVkOiB7XG5cdFx0XHRcdHRleHQ6ICBsMTBuLnVwbG9hZGVkVG9UaGlzUG9zdCxcblx0XHRcdFx0cHJvcHM6IHtcblx0XHRcdFx0XHR1cGxvYWRlZFRvOiB3cC5tZWRpYS52aWV3LnNldHRpbmdzLnBvc3QuaWQsXG5cdFx0XHRcdFx0b3JkZXJieTogJ21lbnVPcmRlcicsXG5cdFx0XHRcdFx0b3JkZXI6ICAgJ0FTQydcblx0XHRcdFx0fSxcblx0XHRcdFx0cHJpb3JpdHk6IDIwXG5cdFx0XHR9LFxuXG5cdFx0XHR1bmF0dGFjaGVkOiB7XG5cdFx0XHRcdHRleHQ6ICBsMTBuLnVuYXR0YWNoZWQsXG5cdFx0XHRcdHByb3BzOiB7XG5cdFx0XHRcdFx0dXBsb2FkZWRUbzogMCxcblx0XHRcdFx0XHRvcmRlcmJ5OiAnbWVudU9yZGVyJyxcblx0XHRcdFx0XHRvcmRlcjogICAnQVNDJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmlvcml0eTogNTBcblx0XHRcdH1cblx0XHR9O1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBVcGxvYWRlZDtcbiIsIi8qZ2xvYmFscyB3cCwgXywgalF1ZXJ5ICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5BdHRhY2htZW50XG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBWaWV3ID0gd3AubWVkaWEuVmlldyxcblx0JCA9IGpRdWVyeSxcblx0QXR0YWNobWVudDtcblxuQXR0YWNobWVudCA9IFZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogICAnbGknLFxuXHRjbGFzc05hbWU6ICdhdHRhY2htZW50Jyxcblx0dGVtcGxhdGU6ICB3cC50ZW1wbGF0ZSgnYXR0YWNobWVudCcpLFxuXG5cdGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHQndGFiSW5kZXgnOiAgICAgMCxcblx0XHRcdCdyb2xlJzogICAgICAgICAnY2hlY2tib3gnLFxuXHRcdFx0J2FyaWEtbGFiZWwnOiAgIHRoaXMubW9kZWwuZ2V0KCAndGl0bGUnICksXG5cdFx0XHQnYXJpYS1jaGVja2VkJzogZmFsc2UsXG5cdFx0XHQnZGF0YS1pZCc6ICAgICAgdGhpcy5tb2RlbC5nZXQoICdpZCcgKVxuXHRcdH07XG5cdH0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIC5qcy0tc2VsZWN0LWF0dGFjaG1lbnQnOiAgICd0b2dnbGVTZWxlY3Rpb25IYW5kbGVyJyxcblx0XHQnY2hhbmdlIFtkYXRhLXNldHRpbmddJzogICAgICAgICAgJ3VwZGF0ZVNldHRpbmcnLFxuXHRcdCdjaGFuZ2UgW2RhdGEtc2V0dGluZ10gaW5wdXQnOiAgICAndXBkYXRlU2V0dGluZycsXG5cdFx0J2NoYW5nZSBbZGF0YS1zZXR0aW5nXSBzZWxlY3QnOiAgICd1cGRhdGVTZXR0aW5nJyxcblx0XHQnY2hhbmdlIFtkYXRhLXNldHRpbmddIHRleHRhcmVhJzogJ3VwZGF0ZVNldHRpbmcnLFxuXHRcdCdjbGljayAuY2xvc2UnOiAgICAgICAgICAgICAgICAgICAncmVtb3ZlRnJvbUxpYnJhcnknLFxuXHRcdCdjbGljayAuY2hlY2snOiAgICAgICAgICAgICAgICAgICAnY2hlY2tDbGlja0hhbmRsZXInLFxuXHRcdCdjbGljayBhJzogICAgICAgICAgICAgICAgICAgICAgICAncHJldmVudERlZmF1bHQnLFxuXHRcdCdrZXlkb3duIC5jbG9zZSc6ICAgICAgICAgICAgICAgICAncmVtb3ZlRnJvbUxpYnJhcnknLFxuXHRcdCdrZXlkb3duJzogICAgICAgICAgICAgICAgICAgICAgICAndG9nZ2xlU2VsZWN0aW9uSGFuZGxlcidcblx0fSxcblxuXHRidXR0b25zOiB7fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5vcHRpb25zLnNlbGVjdGlvbixcblx0XHRcdG9wdGlvbnMgPSBfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdFx0cmVyZW5kZXJPbk1vZGVsQ2hhbmdlOiB0cnVlXG5cdFx0XHR9ICk7XG5cblx0XHRpZiAoIG9wdGlvbnMucmVyZW5kZXJPbk1vZGVsQ2hhbmdlICkge1xuXHRcdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZScsIHRoaXMucmVuZGVyICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdjaGFuZ2U6cGVyY2VudCcsIHRoaXMucHJvZ3Jlc3MgKTtcblx0XHR9XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZTp0aXRsZScsIHRoaXMuX3N5bmNUaXRsZSApO1xuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdjaGFuZ2U6Y2FwdGlvbicsIHRoaXMuX3N5bmNDYXB0aW9uICk7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZTphcnRpc3QnLCB0aGlzLl9zeW5jQXJ0aXN0ICk7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZTphbGJ1bScsIHRoaXMuX3N5bmNBbGJ1bSApO1xuXG5cdFx0Ly8gVXBkYXRlIHRoZSBzZWxlY3Rpb24uXG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2FkZCcsIHRoaXMuc2VsZWN0ICk7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ3JlbW92ZScsIHRoaXMuZGVzZWxlY3QgKTtcblx0XHRpZiAoIHNlbGVjdGlvbiApIHtcblx0XHRcdHNlbGVjdGlvbi5vbiggJ3Jlc2V0JywgdGhpcy51cGRhdGVTZWxlY3QsIHRoaXMgKTtcblx0XHRcdC8vIFVwZGF0ZSB0aGUgbW9kZWwncyBkZXRhaWxzIHZpZXcuXG5cdFx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnc2VsZWN0aW9uOnNpbmdsZSBzZWxlY3Rpb246dW5zaW5nbGUnLCB0aGlzLmRldGFpbHMgKTtcblx0XHRcdHRoaXMuZGV0YWlscyggdGhpcy5tb2RlbCwgdGhpcy5jb250cm9sbGVyLnN0YXRlKCkuZ2V0KCdzZWxlY3Rpb24nKSApO1xuXHRcdH1cblxuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMuY29udHJvbGxlciwgJ2F0dGFjaG1lbnQ6Y29tcGF0OndhaXRpbmcgYXR0YWNobWVudDpjb21wYXQ6cmVhZHknLCB0aGlzLnVwZGF0ZVNhdmUgKTtcblx0fSxcblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnR9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRkaXNwb3NlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5vcHRpb25zLnNlbGVjdGlvbjtcblxuXHRcdC8vIE1ha2Ugc3VyZSBhbGwgc2V0dGluZ3MgYXJlIHNhdmVkIGJlZm9yZSByZW1vdmluZyB0aGUgdmlldy5cblx0XHR0aGlzLnVwZGF0ZUFsbCgpO1xuXG5cdFx0aWYgKCBzZWxlY3Rpb24gKSB7XG5cdFx0XHRzZWxlY3Rpb24ub2ZmKCBudWxsLCBudWxsLCB0aGlzICk7XG5cdFx0fVxuXHRcdC8qKlxuXHRcdCAqIGNhbGwgJ2Rpc3Bvc2UnIGRpcmVjdGx5IG9uIHRoZSBwYXJlbnQgY2xhc3Ncblx0XHQgKi9cblx0XHRWaWV3LnByb3RvdHlwZS5kaXNwb3NlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnR9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBvcHRpb25zID0gXy5kZWZhdWx0cyggdGhpcy5tb2RlbC50b0pTT04oKSwge1xuXHRcdFx0XHRvcmllbnRhdGlvbjogICAnbGFuZHNjYXBlJyxcblx0XHRcdFx0dXBsb2FkaW5nOiAgICAgZmFsc2UsXG5cdFx0XHRcdHR5cGU6ICAgICAgICAgICcnLFxuXHRcdFx0XHRzdWJ0eXBlOiAgICAgICAnJyxcblx0XHRcdFx0aWNvbjogICAgICAgICAgJycsXG5cdFx0XHRcdGZpbGVuYW1lOiAgICAgICcnLFxuXHRcdFx0XHRjYXB0aW9uOiAgICAgICAnJyxcblx0XHRcdFx0dGl0bGU6ICAgICAgICAgJycsXG5cdFx0XHRcdGRhdGVGb3JtYXR0ZWQ6ICcnLFxuXHRcdFx0XHR3aWR0aDogICAgICAgICAnJyxcblx0XHRcdFx0aGVpZ2h0OiAgICAgICAgJycsXG5cdFx0XHRcdGNvbXBhdDogICAgICAgIGZhbHNlLFxuXHRcdFx0XHRhbHQ6ICAgICAgICAgICAnJyxcblx0XHRcdFx0ZGVzY3JpcHRpb246ICAgJydcblx0XHRcdH0sIHRoaXMub3B0aW9ucyApO1xuXG5cdFx0b3B0aW9ucy5idXR0b25zICA9IHRoaXMuYnV0dG9ucztcblx0XHRvcHRpb25zLmRlc2NyaWJlID0gdGhpcy5jb250cm9sbGVyLnN0YXRlKCkuZ2V0KCdkZXNjcmliZScpO1xuXG5cdFx0aWYgKCAnaW1hZ2UnID09PSBvcHRpb25zLnR5cGUgKSB7XG5cdFx0XHRvcHRpb25zLnNpemUgPSB0aGlzLmltYWdlU2l6ZSgpO1xuXHRcdH1cblxuXHRcdG9wdGlvbnMuY2FuID0ge307XG5cdFx0aWYgKCBvcHRpb25zLm5vbmNlcyApIHtcblx0XHRcdG9wdGlvbnMuY2FuLnJlbW92ZSA9ICEhIG9wdGlvbnMubm9uY2VzWydkZWxldGUnXTtcblx0XHRcdG9wdGlvbnMuY2FuLnNhdmUgPSAhISBvcHRpb25zLm5vbmNlcy51cGRhdGU7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLmNvbnRyb2xsZXIuc3RhdGUoKS5nZXQoJ2FsbG93TG9jYWxFZGl0cycpICkge1xuXHRcdFx0b3B0aW9ucy5hbGxvd0xvY2FsRWRpdHMgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICggb3B0aW9ucy51cGxvYWRpbmcgJiYgISBvcHRpb25zLnBlcmNlbnQgKSB7XG5cdFx0XHRvcHRpb25zLnBlcmNlbnQgPSAwO1xuXHRcdH1cblxuXHRcdHRoaXMudmlld3MuZGV0YWNoKCk7XG5cdFx0dGhpcy4kZWwuaHRtbCggdGhpcy50ZW1wbGF0ZSggb3B0aW9ucyApICk7XG5cblx0XHR0aGlzLiRlbC50b2dnbGVDbGFzcyggJ3VwbG9hZGluZycsIG9wdGlvbnMudXBsb2FkaW5nICk7XG5cblx0XHRpZiAoIG9wdGlvbnMudXBsb2FkaW5nICkge1xuXHRcdFx0dGhpcy4kYmFyID0gdGhpcy4kKCcubWVkaWEtcHJvZ3Jlc3MtYmFyIGRpdicpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRkZWxldGUgdGhpcy4kYmFyO1xuXHRcdH1cblxuXHRcdC8vIENoZWNrIGlmIHRoZSBtb2RlbCBpcyBzZWxlY3RlZC5cblx0XHR0aGlzLnVwZGF0ZVNlbGVjdCgpO1xuXG5cdFx0Ly8gVXBkYXRlIHRoZSBzYXZlIHN0YXR1cy5cblx0XHR0aGlzLnVwZGF0ZVNhdmUoKTtcblxuXHRcdHRoaXMudmlld3MucmVuZGVyKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRwcm9ncmVzczogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLiRiYXIgJiYgdGhpcy4kYmFyLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuJGJhci53aWR0aCggdGhpcy5tb2RlbC5nZXQoJ3BlcmNlbnQnKSArICclJyApO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHR0b2dnbGVTZWxlY3Rpb25IYW5kbGVyOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dmFyIG1ldGhvZDtcblxuXHRcdC8vIERvbid0IGRvIGFueXRoaW5nIGluc2lkZSBpbnB1dHMuXG5cdFx0aWYgKCAnSU5QVVQnID09PSBldmVudC50YXJnZXQubm9kZU5hbWUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gQ2F0Y2ggYXJyb3cgZXZlbnRzXG5cdFx0aWYgKCAzNyA9PT0gZXZlbnQua2V5Q29kZSB8fCAzOCA9PT0gZXZlbnQua2V5Q29kZSB8fCAzOSA9PT0gZXZlbnQua2V5Q29kZSB8fCA0MCA9PT0gZXZlbnQua2V5Q29kZSApIHtcblx0XHRcdHRoaXMuY29udHJvbGxlci50cmlnZ2VyKCAnYXR0YWNobWVudDprZXlkb3duOmFycm93JywgZXZlbnQgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBDYXRjaCBlbnRlciBhbmQgc3BhY2UgZXZlbnRzXG5cdFx0aWYgKCAna2V5ZG93bicgPT09IGV2ZW50LnR5cGUgJiYgMTMgIT09IGV2ZW50LmtleUNvZGUgJiYgMzIgIT09IGV2ZW50LmtleUNvZGUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdC8vIEluIHRoZSBncmlkIHZpZXcsIGJ1YmJsZSB1cCBhbiBlZGl0OmF0dGFjaG1lbnQgZXZlbnQgdG8gdGhlIGNvbnRyb2xsZXIuXG5cdFx0aWYgKCB0aGlzLmNvbnRyb2xsZXIuaXNNb2RlQWN0aXZlKCAnZ3JpZCcgKSApIHtcblx0XHRcdGlmICggdGhpcy5jb250cm9sbGVyLmlzTW9kZUFjdGl2ZSggJ2VkaXQnICkgKSB7XG5cdFx0XHRcdC8vIFBhc3MgdGhlIGN1cnJlbnQgdGFyZ2V0IHRvIHJlc3RvcmUgZm9jdXMgd2hlbiBjbG9zaW5nXG5cdFx0XHRcdHRoaXMuY29udHJvbGxlci50cmlnZ2VyKCAnZWRpdDphdHRhY2htZW50JywgdGhpcy5tb2RlbCwgZXZlbnQuY3VycmVudFRhcmdldCApO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmICggdGhpcy5jb250cm9sbGVyLmlzTW9kZUFjdGl2ZSggJ3NlbGVjdCcgKSApIHtcblx0XHRcdFx0bWV0aG9kID0gJ3RvZ2dsZSc7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCBldmVudC5zaGlmdEtleSApIHtcblx0XHRcdG1ldGhvZCA9ICdiZXR3ZWVuJztcblx0XHR9IGVsc2UgaWYgKCBldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkgKSB7XG5cdFx0XHRtZXRob2QgPSAndG9nZ2xlJztcblx0XHR9XG5cblx0XHR0aGlzLnRvZ2dsZVNlbGVjdGlvbih7XG5cdFx0XHRtZXRob2Q6IG1ldGhvZFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5jb250cm9sbGVyLnRyaWdnZXIoICdzZWxlY3Rpb246dG9nZ2xlJyApO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblx0ICovXG5cdHRvZ2dsZVNlbGVjdGlvbjogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0dmFyIGNvbGxlY3Rpb24gPSB0aGlzLmNvbGxlY3Rpb24sXG5cdFx0XHRzZWxlY3Rpb24gPSB0aGlzLm9wdGlvbnMuc2VsZWN0aW9uLFxuXHRcdFx0bW9kZWwgPSB0aGlzLm1vZGVsLFxuXHRcdFx0bWV0aG9kID0gb3B0aW9ucyAmJiBvcHRpb25zLm1ldGhvZCxcblx0XHRcdHNpbmdsZSwgbW9kZWxzLCBzaW5nbGVJbmRleCwgbW9kZWxJbmRleDtcblxuXHRcdGlmICggISBzZWxlY3Rpb24gKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0c2luZ2xlID0gc2VsZWN0aW9uLnNpbmdsZSgpO1xuXHRcdG1ldGhvZCA9IF8uaXNVbmRlZmluZWQoIG1ldGhvZCApID8gc2VsZWN0aW9uLm11bHRpcGxlIDogbWV0aG9kO1xuXG5cdFx0Ly8gSWYgdGhlIGBtZXRob2RgIGlzIHNldCB0byBgYmV0d2VlbmAsIHNlbGVjdCBhbGwgbW9kZWxzIHRoYXRcblx0XHQvLyBleGlzdCBiZXR3ZWVuIHRoZSBjdXJyZW50IGFuZCB0aGUgc2VsZWN0ZWQgbW9kZWwuXG5cdFx0aWYgKCAnYmV0d2VlbicgPT09IG1ldGhvZCAmJiBzaW5nbGUgJiYgc2VsZWN0aW9uLm11bHRpcGxlICkge1xuXHRcdFx0Ly8gSWYgdGhlIG1vZGVscyBhcmUgdGhlIHNhbWUsIHNob3J0LWNpcmN1aXQuXG5cdFx0XHRpZiAoIHNpbmdsZSA9PT0gbW9kZWwgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0c2luZ2xlSW5kZXggPSBjb2xsZWN0aW9uLmluZGV4T2YoIHNpbmdsZSApO1xuXHRcdFx0bW9kZWxJbmRleCAgPSBjb2xsZWN0aW9uLmluZGV4T2YoIHRoaXMubW9kZWwgKTtcblxuXHRcdFx0aWYgKCBzaW5nbGVJbmRleCA8IG1vZGVsSW5kZXggKSB7XG5cdFx0XHRcdG1vZGVscyA9IGNvbGxlY3Rpb24ubW9kZWxzLnNsaWNlKCBzaW5nbGVJbmRleCwgbW9kZWxJbmRleCArIDEgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG1vZGVscyA9IGNvbGxlY3Rpb24ubW9kZWxzLnNsaWNlKCBtb2RlbEluZGV4LCBzaW5nbGVJbmRleCArIDEgKTtcblx0XHRcdH1cblxuXHRcdFx0c2VsZWN0aW9uLmFkZCggbW9kZWxzICk7XG5cdFx0XHRzZWxlY3Rpb24uc2luZ2xlKCBtb2RlbCApO1xuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Ly8gSWYgdGhlIGBtZXRob2RgIGlzIHNldCB0byBgdG9nZ2xlYCwganVzdCBmbGlwIHRoZSBzZWxlY3Rpb25cblx0XHQvLyBzdGF0dXMsIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgbW9kZWwgaXMgdGhlIHNpbmdsZSBtb2RlbC5cblx0XHR9IGVsc2UgaWYgKCAndG9nZ2xlJyA9PT0gbWV0aG9kICkge1xuXHRcdFx0c2VsZWN0aW9uWyB0aGlzLnNlbGVjdGVkKCkgPyAncmVtb3ZlJyA6ICdhZGQnIF0oIG1vZGVsICk7XG5cdFx0XHRzZWxlY3Rpb24uc2luZ2xlKCBtb2RlbCApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH0gZWxzZSBpZiAoICdhZGQnID09PSBtZXRob2QgKSB7XG5cdFx0XHRzZWxlY3Rpb24uYWRkKCBtb2RlbCApO1xuXHRcdFx0c2VsZWN0aW9uLnNpbmdsZSggbW9kZWwgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBGaXhlcyBidWcgdGhhdCBsb3NlcyBmb2N1cyB3aGVuIHNlbGVjdGluZyBhIGZlYXR1cmVkIGltYWdlXG5cdFx0aWYgKCAhIG1ldGhvZCApIHtcblx0XHRcdG1ldGhvZCA9ICdhZGQnO1xuXHRcdH1cblxuXHRcdGlmICggbWV0aG9kICE9PSAnYWRkJyApIHtcblx0XHRcdG1ldGhvZCA9ICdyZXNldCc7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnNlbGVjdGVkKCkgKSB7XG5cdFx0XHQvLyBJZiB0aGUgbW9kZWwgaXMgdGhlIHNpbmdsZSBtb2RlbCwgcmVtb3ZlIGl0LlxuXHRcdFx0Ly8gSWYgaXQgaXMgbm90IHRoZSBzYW1lIGFzIHRoZSBzaW5nbGUgbW9kZWwsXG5cdFx0XHQvLyBpdCBub3cgYmVjb21lcyB0aGUgc2luZ2xlIG1vZGVsLlxuXHRcdFx0c2VsZWN0aW9uWyBzaW5nbGUgPT09IG1vZGVsID8gJ3JlbW92ZScgOiAnc2luZ2xlJyBdKCBtb2RlbCApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBJZiB0aGUgbW9kZWwgaXMgbm90IHNlbGVjdGVkLCBydW4gdGhlIGBtZXRob2RgIG9uIHRoZVxuXHRcdFx0Ly8gc2VsZWN0aW9uLiBCeSBkZWZhdWx0LCB3ZSBgcmVzZXRgIHRoZSBzZWxlY3Rpb24sIGJ1dCB0aGVcblx0XHRcdC8vIGBtZXRob2RgIGNhbiBiZSBzZXQgdG8gYGFkZGAgdGhlIG1vZGVsIHRvIHRoZSBzZWxlY3Rpb24uXG5cdFx0XHRzZWxlY3Rpb25bIG1ldGhvZCBdKCBtb2RlbCApO1xuXHRcdFx0c2VsZWN0aW9uLnNpbmdsZSggbW9kZWwgKTtcblx0XHR9XG5cdH0sXG5cblx0dXBkYXRlU2VsZWN0OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzWyB0aGlzLnNlbGVjdGVkKCkgPyAnc2VsZWN0JyA6ICdkZXNlbGVjdCcgXSgpO1xuXHR9LFxuXHQvKipcblx0ICogQHJldHVybnMge3VucmVzb2x2ZWR8Qm9vbGVhbn1cblx0ICovXG5cdHNlbGVjdGVkOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5vcHRpb25zLnNlbGVjdGlvbjtcblx0XHRpZiAoIHNlbGVjdGlvbiApIHtcblx0XHRcdHJldHVybiAhISBzZWxlY3Rpb24uZ2V0KCB0aGlzLm1vZGVsLmNpZCApO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7QmFja2JvbmUuTW9kZWx9IG1vZGVsXG5cdCAqIEBwYXJhbSB7QmFja2JvbmUuQ29sbGVjdGlvbn0gY29sbGVjdGlvblxuXHQgKi9cblx0c2VsZWN0OiBmdW5jdGlvbiggbW9kZWwsIGNvbGxlY3Rpb24gKSB7XG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMub3B0aW9ucy5zZWxlY3Rpb24sXG5cdFx0XHRjb250cm9sbGVyID0gdGhpcy5jb250cm9sbGVyO1xuXG5cdFx0Ly8gQ2hlY2sgaWYgYSBzZWxlY3Rpb24gZXhpc3RzIGFuZCBpZiBpdCdzIHRoZSBjb2xsZWN0aW9uIHByb3ZpZGVkLlxuXHRcdC8vIElmIHRoZXkncmUgbm90IHRoZSBzYW1lIGNvbGxlY3Rpb24sIGJhaWw7IHdlJ3JlIGluIGFub3RoZXJcblx0XHQvLyBzZWxlY3Rpb24ncyBldmVudCBsb29wLlxuXHRcdGlmICggISBzZWxlY3Rpb24gfHwgKCBjb2xsZWN0aW9uICYmIGNvbGxlY3Rpb24gIT09IHNlbGVjdGlvbiApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEJhaWwgaWYgdGhlIG1vZGVsIGlzIGFscmVhZHkgc2VsZWN0ZWQuXG5cdFx0aWYgKCB0aGlzLiRlbC5oYXNDbGFzcyggJ3NlbGVjdGVkJyApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEFkZCAnc2VsZWN0ZWQnIGNsYXNzIHRvIG1vZGVsLCBzZXQgYXJpYS1jaGVja2VkIHRvIHRydWUuXG5cdFx0dGhpcy4kZWwuYWRkQ2xhc3MoICdzZWxlY3RlZCcgKS5hdHRyKCAnYXJpYS1jaGVja2VkJywgdHJ1ZSApO1xuXHRcdC8vICBNYWtlIHRoZSBjaGVja2JveCB0YWJhYmxlLCBleGNlcHQgaW4gbWVkaWEgZ3JpZCAoYnVsayBzZWxlY3QgbW9kZSkuXG5cdFx0aWYgKCAhICggY29udHJvbGxlci5pc01vZGVBY3RpdmUoICdncmlkJyApICYmIGNvbnRyb2xsZXIuaXNNb2RlQWN0aXZlKCAnc2VsZWN0JyApICkgKSB7XG5cdFx0XHR0aGlzLiQoICcuY2hlY2snICkuYXR0ciggJ3RhYmluZGV4JywgJzAnICk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtCYWNrYm9uZS5Nb2RlbH0gbW9kZWxcblx0ICogQHBhcmFtIHtCYWNrYm9uZS5Db2xsZWN0aW9ufSBjb2xsZWN0aW9uXG5cdCAqL1xuXHRkZXNlbGVjdDogZnVuY3Rpb24oIG1vZGVsLCBjb2xsZWN0aW9uICkge1xuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLm9wdGlvbnMuc2VsZWN0aW9uO1xuXG5cdFx0Ly8gQ2hlY2sgaWYgYSBzZWxlY3Rpb24gZXhpc3RzIGFuZCBpZiBpdCdzIHRoZSBjb2xsZWN0aW9uIHByb3ZpZGVkLlxuXHRcdC8vIElmIHRoZXkncmUgbm90IHRoZSBzYW1lIGNvbGxlY3Rpb24sIGJhaWw7IHdlJ3JlIGluIGFub3RoZXJcblx0XHQvLyBzZWxlY3Rpb24ncyBldmVudCBsb29wLlxuXHRcdGlmICggISBzZWxlY3Rpb24gfHwgKCBjb2xsZWN0aW9uICYmIGNvbGxlY3Rpb24gIT09IHNlbGVjdGlvbiApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0aGlzLiRlbC5yZW1vdmVDbGFzcyggJ3NlbGVjdGVkJyApLmF0dHIoICdhcmlhLWNoZWNrZWQnLCBmYWxzZSApXG5cdFx0XHQuZmluZCggJy5jaGVjaycgKS5hdHRyKCAndGFiaW5kZXgnLCAnLTEnICk7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge0JhY2tib25lLk1vZGVsfSBtb2RlbFxuXHQgKiBAcGFyYW0ge0JhY2tib25lLkNvbGxlY3Rpb259IGNvbGxlY3Rpb25cblx0ICovXG5cdGRldGFpbHM6IGZ1bmN0aW9uKCBtb2RlbCwgY29sbGVjdGlvbiApIHtcblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5vcHRpb25zLnNlbGVjdGlvbixcblx0XHRcdGRldGFpbHM7XG5cblx0XHRpZiAoIHNlbGVjdGlvbiAhPT0gY29sbGVjdGlvbiApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRkZXRhaWxzID0gc2VsZWN0aW9uLnNpbmdsZSgpO1xuXHRcdHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCAnZGV0YWlscycsIGRldGFpbHMgPT09IHRoaXMubW9kZWwgKTtcblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuXHQgKi9cblx0cHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtzdHJpbmd9IHNpemVcblx0ICogQHJldHVybnMge09iamVjdH1cblx0ICovXG5cdGltYWdlU2l6ZTogZnVuY3Rpb24oIHNpemUgKSB7XG5cdFx0dmFyIHNpemVzID0gdGhpcy5tb2RlbC5nZXQoJ3NpemVzJyksIG1hdGNoZWQgPSBmYWxzZTtcblxuXHRcdHNpemUgPSBzaXplIHx8ICdtZWRpdW0nO1xuXG5cdFx0Ly8gVXNlIHRoZSBwcm92aWRlZCBpbWFnZSBzaXplIGlmIHBvc3NpYmxlLlxuXHRcdGlmICggc2l6ZXMgKSB7XG5cdFx0XHRpZiAoIHNpemVzWyBzaXplIF0gKSB7XG5cdFx0XHRcdG1hdGNoZWQgPSBzaXplc1sgc2l6ZSBdO1xuXHRcdFx0fSBlbHNlIGlmICggc2l6ZXMubGFyZ2UgKSB7XG5cdFx0XHRcdG1hdGNoZWQgPSBzaXplcy5sYXJnZTtcblx0XHRcdH0gZWxzZSBpZiAoIHNpemVzLnRodW1ibmFpbCApIHtcblx0XHRcdFx0bWF0Y2hlZCA9IHNpemVzLnRodW1ibmFpbDtcblx0XHRcdH0gZWxzZSBpZiAoIHNpemVzLmZ1bGwgKSB7XG5cdFx0XHRcdG1hdGNoZWQgPSBzaXplcy5mdWxsO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIG1hdGNoZWQgKSB7XG5cdFx0XHRcdHJldHVybiBfLmNsb25lKCBtYXRjaGVkICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHVybDogICAgICAgICB0aGlzLm1vZGVsLmdldCgndXJsJyksXG5cdFx0XHR3aWR0aDogICAgICAgdGhpcy5tb2RlbC5nZXQoJ3dpZHRoJyksXG5cdFx0XHRoZWlnaHQ6ICAgICAgdGhpcy5tb2RlbC5nZXQoJ2hlaWdodCcpLFxuXHRcdFx0b3JpZW50YXRpb246IHRoaXMubW9kZWwuZ2V0KCdvcmllbnRhdGlvbicpXG5cdFx0fTtcblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuXHQgKi9cblx0dXBkYXRlU2V0dGluZzogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciAkc2V0dGluZyA9ICQoIGV2ZW50LnRhcmdldCApLmNsb3Nlc3QoJ1tkYXRhLXNldHRpbmddJyksXG5cdFx0XHRzZXR0aW5nLCB2YWx1ZTtcblxuXHRcdGlmICggISAkc2V0dGluZy5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0c2V0dGluZyA9ICRzZXR0aW5nLmRhdGEoJ3NldHRpbmcnKTtcblx0XHR2YWx1ZSAgID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuXG5cdFx0aWYgKCB0aGlzLm1vZGVsLmdldCggc2V0dGluZyApICE9PSB2YWx1ZSApIHtcblx0XHRcdHRoaXMuc2F2ZSggc2V0dGluZywgdmFsdWUgKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFBhc3MgYWxsIHRoZSBhcmd1bWVudHMgdG8gdGhlIG1vZGVsJ3Mgc2F2ZSBtZXRob2QuXG5cdCAqXG5cdCAqIFJlY29yZHMgdGhlIGFnZ3JlZ2F0ZSBzdGF0dXMgb2YgYWxsIHNhdmUgcmVxdWVzdHMgYW5kIHVwZGF0ZXMgdGhlXG5cdCAqIHZpZXcncyBjbGFzc2VzIGFjY29yZGluZ2x5LlxuXHQgKi9cblx0c2F2ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHZpZXcgPSB0aGlzLFxuXHRcdFx0c2F2ZSA9IHRoaXMuX3NhdmUgPSB0aGlzLl9zYXZlIHx8IHsgc3RhdHVzOiAncmVhZHknIH0sXG5cdFx0XHRyZXF1ZXN0ID0gdGhpcy5tb2RlbC5zYXZlLmFwcGx5KCB0aGlzLm1vZGVsLCBhcmd1bWVudHMgKSxcblx0XHRcdHJlcXVlc3RzID0gc2F2ZS5yZXF1ZXN0cyA/ICQud2hlbiggcmVxdWVzdCwgc2F2ZS5yZXF1ZXN0cyApIDogcmVxdWVzdDtcblxuXHRcdC8vIElmIHdlJ3JlIHdhaXRpbmcgdG8gcmVtb3ZlICdTYXZlZC4nLCBzdG9wLlxuXHRcdGlmICggc2F2ZS5zYXZlZFRpbWVyICkge1xuXHRcdFx0Y2xlYXJUaW1lb3V0KCBzYXZlLnNhdmVkVGltZXIgKTtcblx0XHR9XG5cblx0XHR0aGlzLnVwZGF0ZVNhdmUoJ3dhaXRpbmcnKTtcblx0XHRzYXZlLnJlcXVlc3RzID0gcmVxdWVzdHM7XG5cdFx0cmVxdWVzdHMuYWx3YXlzKCBmdW5jdGlvbigpIHtcblx0XHRcdC8vIElmIHdlJ3ZlIHBlcmZvcm1lZCBhbm90aGVyIHJlcXVlc3Qgc2luY2UgdGhpcyBvbmUsIGJhaWwuXG5cdFx0XHRpZiAoIHNhdmUucmVxdWVzdHMgIT09IHJlcXVlc3RzICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHZpZXcudXBkYXRlU2F2ZSggcmVxdWVzdHMuc3RhdGUoKSA9PT0gJ3Jlc29sdmVkJyA/ICdjb21wbGV0ZScgOiAnZXJyb3InICk7XG5cdFx0XHRzYXZlLnNhdmVkVGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmlldy51cGRhdGVTYXZlKCdyZWFkeScpO1xuXHRcdFx0XHRkZWxldGUgc2F2ZS5zYXZlZFRpbWVyO1xuXHRcdFx0fSwgMjAwMCApO1xuXHRcdH0pO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtzdHJpbmd9IHN0YXR1c1xuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5BdHRhY2htZW50fSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0dXBkYXRlU2F2ZTogZnVuY3Rpb24oIHN0YXR1cyApIHtcblx0XHR2YXIgc2F2ZSA9IHRoaXMuX3NhdmUgPSB0aGlzLl9zYXZlIHx8IHsgc3RhdHVzOiAncmVhZHknIH07XG5cblx0XHRpZiAoIHN0YXR1cyAmJiBzdGF0dXMgIT09IHNhdmUuc3RhdHVzICkge1xuXHRcdFx0dGhpcy4kZWwucmVtb3ZlQ2xhc3MoICdzYXZlLScgKyBzYXZlLnN0YXR1cyApO1xuXHRcdFx0c2F2ZS5zdGF0dXMgPSBzdGF0dXM7XG5cdFx0fVxuXG5cdFx0dGhpcy4kZWwuYWRkQ2xhc3MoICdzYXZlLScgKyBzYXZlLnN0YXR1cyApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHVwZGF0ZUFsbDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRzZXR0aW5ncyA9IHRoaXMuJCgnW2RhdGEtc2V0dGluZ10nKSxcblx0XHRcdG1vZGVsID0gdGhpcy5tb2RlbCxcblx0XHRcdGNoYW5nZWQ7XG5cblx0XHRjaGFuZ2VkID0gXy5jaGFpbiggJHNldHRpbmdzICkubWFwKCBmdW5jdGlvbiggZWwgKSB7XG5cdFx0XHR2YXIgJGlucHV0ID0gJCgnaW5wdXQsIHRleHRhcmVhLCBzZWxlY3QsIFt2YWx1ZV0nLCBlbCApLFxuXHRcdFx0XHRzZXR0aW5nLCB2YWx1ZTtcblxuXHRcdFx0aWYgKCAhICRpbnB1dC5sZW5ndGggKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0c2V0dGluZyA9ICQoZWwpLmRhdGEoJ3NldHRpbmcnKTtcblx0XHRcdHZhbHVlID0gJGlucHV0LnZhbCgpO1xuXG5cdFx0XHQvLyBSZWNvcmQgdGhlIHZhbHVlIGlmIGl0IGNoYW5nZWQuXG5cdFx0XHRpZiAoIG1vZGVsLmdldCggc2V0dGluZyApICE9PSB2YWx1ZSApIHtcblx0XHRcdFx0cmV0dXJuIFsgc2V0dGluZywgdmFsdWUgXTtcblx0XHRcdH1cblx0XHR9KS5jb21wYWN0KCkub2JqZWN0KCkudmFsdWUoKTtcblxuXHRcdGlmICggISBfLmlzRW1wdHkoIGNoYW5nZWQgKSApIHtcblx0XHRcdG1vZGVsLnNhdmUoIGNoYW5nZWQgKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcblx0ICovXG5cdHJlbW92ZUZyb21MaWJyYXJ5OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0Ly8gQ2F0Y2ggZW50ZXIgYW5kIHNwYWNlIGV2ZW50c1xuXHRcdGlmICggJ2tleWRvd24nID09PSBldmVudC50eXBlICYmIDEzICE9PSBldmVudC5rZXlDb2RlICYmIDMyICE9PSBldmVudC5rZXlDb2RlICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFN0b3AgcHJvcGFnYXRpb24gc28gdGhlIG1vZGVsIGlzbid0IHNlbGVjdGVkLlxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dGhpcy5jb2xsZWN0aW9uLnJlbW92ZSggdGhpcy5tb2RlbCApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGQgdGhlIG1vZGVsIGlmIGl0IGlzbid0IGluIHRoZSBzZWxlY3Rpb24sIGlmIGl0IGlzIGluIHRoZSBzZWxlY3Rpb24sXG5cdCAqIHJlbW92ZSBpdC5cblx0ICpcblx0ICogQHBhcmFtICB7W3R5cGVdfSBldmVudCBbZGVzY3JpcHRpb25dXG5cdCAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgW2Rlc2NyaXB0aW9uXVxuXHQgKi9cblx0Y2hlY2tDbGlja0hhbmRsZXI6IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMub3B0aW9ucy5zZWxlY3Rpb247XG5cdFx0aWYgKCAhIHNlbGVjdGlvbiApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0aWYgKCBzZWxlY3Rpb24ud2hlcmUoIHsgaWQ6IHRoaXMubW9kZWwuZ2V0KCAnaWQnICkgfSApLmxlbmd0aCApIHtcblx0XHRcdHNlbGVjdGlvbi5yZW1vdmUoIHRoaXMubW9kZWwgKTtcblx0XHRcdC8vIE1vdmUgZm9jdXMgYmFjayB0byB0aGUgYXR0YWNobWVudCB0aWxlIChmcm9tIHRoZSBjaGVjaykuXG5cdFx0XHR0aGlzLiRlbC5mb2N1cygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzZWxlY3Rpb24uYWRkKCB0aGlzLm1vZGVsICk7XG5cdFx0fVxuXHR9XG59KTtcblxuLy8gRW5zdXJlIHNldHRpbmdzIHJlbWFpbiBpbiBzeW5jIGJldHdlZW4gYXR0YWNobWVudCB2aWV3cy5cbl8uZWFjaCh7XG5cdGNhcHRpb246ICdfc3luY0NhcHRpb24nLFxuXHR0aXRsZTogICAnX3N5bmNUaXRsZScsXG5cdGFydGlzdDogICdfc3luY0FydGlzdCcsXG5cdGFsYnVtOiAgICdfc3luY0FsYnVtJ1xufSwgZnVuY3Rpb24oIG1ldGhvZCwgc2V0dGluZyApIHtcblx0LyoqXG5cdCAqIEBwYXJhbSB7QmFja2JvbmUuTW9kZWx9IG1vZGVsXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5BdHRhY2htZW50fSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0QXR0YWNobWVudC5wcm90b3R5cGVbIG1ldGhvZCBdID0gZnVuY3Rpb24oIG1vZGVsLCB2YWx1ZSApIHtcblx0XHR2YXIgJHNldHRpbmcgPSB0aGlzLiQoJ1tkYXRhLXNldHRpbmc9XCInICsgc2V0dGluZyArICdcIl0nKTtcblxuXHRcdGlmICggISAkc2V0dGluZy5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvLyBJZiB0aGUgdXBkYXRlZCB2YWx1ZSBpcyBpbiBzeW5jIHdpdGggdGhlIHZhbHVlIGluIHRoZSBET00sIHRoZXJlXG5cdFx0Ly8gaXMgbm8gbmVlZCB0byByZS1yZW5kZXIuIElmIHdlJ3JlIGN1cnJlbnRseSBlZGl0aW5nIHRoZSB2YWx1ZSxcblx0XHQvLyBpdCB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgaW4gc3luYywgc3VwcHJlc3NpbmcgdGhlIHJlLXJlbmRlciBmb3Jcblx0XHQvLyB0aGUgdmlldyB3ZSdyZSBlZGl0aW5nLCB3aGlsZSB1cGRhdGluZyBhbnkgb3RoZXJzLlxuXHRcdGlmICggdmFsdWUgPT09ICRzZXR0aW5nLmZpbmQoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0LCBbdmFsdWVdJykudmFsKCkgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5yZW5kZXIoKTtcblx0fTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF0dGFjaG1lbnQ7XG4iLCIvKmdsb2JhbHMgd3AsIF8gKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnQuRGV0YWlsc1xuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudFxuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgQXR0YWNobWVudCA9IHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudCxcblx0bDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0RGV0YWlscztcblxuRGV0YWlscyA9IEF0dGFjaG1lbnQuZXh0ZW5kKHtcblx0dGFnTmFtZTogICAnZGl2Jyxcblx0Y2xhc3NOYW1lOiAnYXR0YWNobWVudC1kZXRhaWxzJyxcblx0dGVtcGxhdGU6ICB3cC50ZW1wbGF0ZSgnYXR0YWNobWVudC1kZXRhaWxzJyksXG5cblx0YXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdCd0YWJJbmRleCc6ICAgICAwLFxuXHRcdFx0J2RhdGEtaWQnOiAgICAgIHRoaXMubW9kZWwuZ2V0KCAnaWQnIClcblx0XHR9O1xuXHR9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdjaGFuZ2UgW2RhdGEtc2V0dGluZ10nOiAgICAgICAgICAndXBkYXRlU2V0dGluZycsXG5cdFx0J2NoYW5nZSBbZGF0YS1zZXR0aW5nXSBpbnB1dCc6ICAgICd1cGRhdGVTZXR0aW5nJyxcblx0XHQnY2hhbmdlIFtkYXRhLXNldHRpbmddIHNlbGVjdCc6ICAgJ3VwZGF0ZVNldHRpbmcnLFxuXHRcdCdjaGFuZ2UgW2RhdGEtc2V0dGluZ10gdGV4dGFyZWEnOiAndXBkYXRlU2V0dGluZycsXG5cdFx0J2NsaWNrIC5kZWxldGUtYXR0YWNobWVudCc6ICAgICAgICdkZWxldGVBdHRhY2htZW50Jyxcblx0XHQnY2xpY2sgLnRyYXNoLWF0dGFjaG1lbnQnOiAgICAgICAgJ3RyYXNoQXR0YWNobWVudCcsXG5cdFx0J2NsaWNrIC51bnRyYXNoLWF0dGFjaG1lbnQnOiAgICAgICd1bnRyYXNoQXR0YWNobWVudCcsXG5cdFx0J2NsaWNrIC5lZGl0LWF0dGFjaG1lbnQnOiAgICAgICAgICdlZGl0QXR0YWNobWVudCcsXG5cdFx0J2NsaWNrIC5yZWZyZXNoLWF0dGFjaG1lbnQnOiAgICAgICdyZWZyZXNoQXR0YWNobWVudCcsXG5cdFx0J2tleWRvd24nOiAgICAgICAgICAgICAgICAgICAgICAgICd0b2dnbGVTZWxlY3Rpb25IYW5kbGVyJ1xuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub3B0aW9ucyA9IF8uZGVmYXVsdHMoIHRoaXMub3B0aW9ucywge1xuXHRcdFx0cmVyZW5kZXJPbk1vZGVsQ2hhbmdlOiBmYWxzZVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5vbiggJ3JlYWR5JywgdGhpcy5pbml0aWFsRm9jdXMgKTtcblx0XHQvLyBDYWxsICdpbml0aWFsaXplJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzLlxuXHRcdEF0dGFjaG1lbnQucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdGluaXRpYWxGb2N1czogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCAhIHdwLm1lZGlhLmlzVG91Y2hEZXZpY2UgKSB7XG5cdFx0XHR0aGlzLiQoICc6aW5wdXQnICkuZXEoIDAgKS5mb2N1cygpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuXHQgKi9cblx0ZGVsZXRlQXR0YWNobWVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRpZiAoIHdpbmRvdy5jb25maXJtKCBsMTBuLndhcm5EZWxldGUgKSApIHtcblx0XHRcdHRoaXMubW9kZWwuZGVzdHJveSgpO1xuXHRcdFx0Ly8gS2VlcCBmb2N1cyBpbnNpZGUgbWVkaWEgbW9kYWxcblx0XHRcdC8vIGFmdGVyIGltYWdlIGlzIGRlbGV0ZWRcblx0XHRcdHRoaXMuY29udHJvbGxlci5tb2RhbC5mb2N1c01hbmFnZXIuZm9jdXMoKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcblx0ICovXG5cdHRyYXNoQXR0YWNobWVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBsaWJyYXJ5ID0gdGhpcy5jb250cm9sbGVyLmxpYnJhcnk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGlmICggd3AubWVkaWEudmlldy5zZXR0aW5ncy5tZWRpYVRyYXNoICYmXG5cdFx0XHQnZWRpdC1tZXRhZGF0YScgPT09IHRoaXMuY29udHJvbGxlci5jb250ZW50Lm1vZGUoKSApIHtcblxuXHRcdFx0dGhpcy5tb2RlbC5zZXQoICdzdGF0dXMnLCAndHJhc2gnICk7XG5cdFx0XHR0aGlzLm1vZGVsLnNhdmUoKS5kb25lKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0bGlicmFyeS5fcmVxdWVyeSggdHJ1ZSApO1xuXHRcdFx0fSApO1xuXHRcdH0gIGVsc2Uge1xuXHRcdFx0dGhpcy5tb2RlbC5kZXN0cm95KCk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHR1bnRyYXNoQXR0YWNobWVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBsaWJyYXJ5ID0gdGhpcy5jb250cm9sbGVyLmxpYnJhcnk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHRoaXMubW9kZWwuc2V0KCAnc3RhdHVzJywgJ2luaGVyaXQnICk7XG5cdFx0dGhpcy5tb2RlbC5zYXZlKCkuZG9uZSggZnVuY3Rpb24oKSB7XG5cdFx0XHRsaWJyYXJ5Ll9yZXF1ZXJ5KCB0cnVlICk7XG5cdFx0fSApO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHRlZGl0QXR0YWNobWVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBlZGl0U3RhdGUgPSB0aGlzLmNvbnRyb2xsZXIuc3RhdGVzLmdldCggJ2VkaXQtaW1hZ2UnICk7XG5cdFx0aWYgKCB3aW5kb3cuaW1hZ2VFZGl0ICYmIGVkaXRTdGF0ZSApIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGVkaXRTdGF0ZS5zZXQoICdpbWFnZScsIHRoaXMubW9kZWwgKTtcblx0XHRcdHRoaXMuY29udHJvbGxlci5zZXRTdGF0ZSggJ2VkaXQtaW1hZ2UnICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuJGVsLmFkZENsYXNzKCduZWVkcy1yZWZyZXNoJyk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHRyZWZyZXNoQXR0YWNobWVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHRoaXMuJGVsLnJlbW92ZUNsYXNzKCduZWVkcy1yZWZyZXNoJyk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR0aGlzLm1vZGVsLmZldGNoKCk7XG5cdH0sXG5cdC8qKlxuXHQgKiBXaGVuIHJldmVyc2UgdGFiYmluZyhzaGlmdCt0YWIpIG91dCBvZiB0aGUgcmlnaHQgZGV0YWlscyBwYW5lbCwgZGVsaXZlclxuXHQgKiB0aGUgZm9jdXMgdG8gdGhlIGl0ZW0gaW4gdGhlIGxpc3QgdGhhdCB3YXMgYmVpbmcgZWRpdGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcblx0ICovXG5cdHRvZ2dsZVNlbGVjdGlvbkhhbmRsZXI6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRpZiAoICdrZXlkb3duJyA9PT0gZXZlbnQudHlwZSAmJiA5ID09PSBldmVudC5rZXlDb2RlICYmIGV2ZW50LnNoaWZ0S2V5ICYmIGV2ZW50LnRhcmdldCA9PT0gdGhpcy4kKCAnOnRhYmJhYmxlJyApLmdldCggMCApICkge1xuXHRcdFx0dGhpcy5jb250cm9sbGVyLnRyaWdnZXIoICdhdHRhY2htZW50OmRldGFpbHM6c2hpZnQtdGFiJywgZXZlbnQgKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRpZiAoIDM3ID09PSBldmVudC5rZXlDb2RlIHx8IDM4ID09PSBldmVudC5rZXlDb2RlIHx8IDM5ID09PSBldmVudC5rZXlDb2RlIHx8IDQwID09PSBldmVudC5rZXlDb2RlICkge1xuXHRcdFx0dGhpcy5jb250cm9sbGVyLnRyaWdnZXIoICdhdHRhY2htZW50OmtleWRvd246YXJyb3cnLCBldmVudCApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGV0YWlscztcbiIsIi8qZ2xvYmFscyB3cCAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudC5FZGl0TGlicmFyeVxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudFxuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgRWRpdExpYnJhcnkgPSB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnQuZXh0ZW5kKHtcblx0YnV0dG9uczoge1xuXHRcdGNsb3NlOiB0cnVlXG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRMaWJyYXJ5O1xuIiwiLypnbG9iYWxzIHdwICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5BdHRhY2htZW50cy5FZGl0U2VsZWN0aW9uXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5BdHRhY2htZW50LlNlbGVjdGlvblxuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudFxuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgRWRpdFNlbGVjdGlvbiA9IHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudC5TZWxlY3Rpb24uZXh0ZW5kKHtcblx0YnV0dG9uczoge1xuXHRcdGNsb3NlOiB0cnVlXG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRTZWxlY3Rpb247XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnQuTGlicmFyeVxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudFxuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgTGlicmFyeSA9IHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudC5leHRlbmQoe1xuXHRidXR0b25zOiB7XG5cdFx0Y2hlY2s6IHRydWVcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGlicmFyeTtcbiIsIi8qZ2xvYmFscyB3cCAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudC5TZWxlY3Rpb25cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFNlbGVjdGlvbiA9IHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudC5leHRlbmQoe1xuXHRjbGFzc05hbWU6ICdhdHRhY2htZW50IHNlbGVjdGlvbicsXG5cblx0Ly8gT24gY2xpY2ssIGp1c3Qgc2VsZWN0IHRoZSBtb2RlbCwgaW5zdGVhZCBvZiByZW1vdmluZyB0aGUgbW9kZWwgZnJvbVxuXHQvLyB0aGUgc2VsZWN0aW9uLlxuXHR0b2dnbGVTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub3B0aW9ucy5zZWxlY3Rpb24uc2luZ2xlKCB0aGlzLm1vZGVsICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdGlvbjtcbiIsIi8qZ2xvYmFscyB3cCwgXywgalF1ZXJ5ICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5BdHRhY2htZW50c1xuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgVmlldyA9IHdwLm1lZGlhLlZpZXcsXG5cdCQgPSBqUXVlcnksXG5cdEF0dGFjaG1lbnRzO1xuXG5BdHRhY2htZW50cyA9IFZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogICAndWwnLFxuXHRjbGFzc05hbWU6ICdhdHRhY2htZW50cycsXG5cblx0YXR0cmlidXRlczoge1xuXHRcdHRhYkluZGV4OiAtMVxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZWwuaWQgPSBfLnVuaXF1ZUlkKCdfX2F0dGFjaG1lbnRzLXZpZXctJyk7XG5cblx0XHRfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdHJlZnJlc2hTZW5zaXRpdml0eTogd3AubWVkaWEuaXNUb3VjaERldmljZSA/IDMwMCA6IDIwMCxcblx0XHRcdHJlZnJlc2hUaHJlc2hvbGQ6ICAgMyxcblx0XHRcdEF0dGFjaG1lbnRWaWV3OiAgICAgd3AubWVkaWEudmlldy5BdHRhY2htZW50LFxuXHRcdFx0c29ydGFibGU6ICAgICAgICAgICBmYWxzZSxcblx0XHRcdHJlc2l6ZTogICAgICAgICAgICAgdHJ1ZSxcblx0XHRcdGlkZWFsQ29sdW1uV2lkdGg6ICAgJCggd2luZG93ICkud2lkdGgoKSA8IDY0MCA/IDEzNSA6IDE1MFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5fdmlld3NCeUNpZCA9IHt9O1xuXHRcdHRoaXMuJHdpbmRvdyA9ICQoIHdpbmRvdyApO1xuXHRcdHRoaXMucmVzaXplRXZlbnQgPSAncmVzaXplLm1lZGlhLW1vZGFsLWNvbHVtbnMnO1xuXG5cdFx0dGhpcy5jb2xsZWN0aW9uLm9uKCAnYWRkJywgZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cdFx0XHR0aGlzLnZpZXdzLmFkZCggdGhpcy5jcmVhdGVBdHRhY2htZW50VmlldyggYXR0YWNobWVudCApLCB7XG5cdFx0XHRcdGF0OiB0aGlzLmNvbGxlY3Rpb24uaW5kZXhPZiggYXR0YWNobWVudCApXG5cdFx0XHR9KTtcblx0XHR9LCB0aGlzICk7XG5cblx0XHR0aGlzLmNvbGxlY3Rpb24ub24oICdyZW1vdmUnLCBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblx0XHRcdHZhciB2aWV3ID0gdGhpcy5fdmlld3NCeUNpZFsgYXR0YWNobWVudC5jaWQgXTtcblx0XHRcdGRlbGV0ZSB0aGlzLl92aWV3c0J5Q2lkWyBhdHRhY2htZW50LmNpZCBdO1xuXG5cdFx0XHRpZiAoIHZpZXcgKSB7XG5cdFx0XHRcdHZpZXcucmVtb3ZlKCk7XG5cdFx0XHR9XG5cdFx0fSwgdGhpcyApO1xuXG5cdFx0dGhpcy5jb2xsZWN0aW9uLm9uKCAncmVzZXQnLCB0aGlzLnJlbmRlciwgdGhpcyApO1xuXG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5jb250cm9sbGVyLCAnbGlicmFyeTpzZWxlY3Rpb246YWRkJywgICAgdGhpcy5hdHRhY2htZW50Rm9jdXMgKTtcblxuXHRcdC8vIFRocm90dGxlIHRoZSBzY3JvbGwgaGFuZGxlciBhbmQgYmluZCB0aGlzLlxuXHRcdHRoaXMuc2Nyb2xsID0gXy5jaGFpbiggdGhpcy5zY3JvbGwgKS5iaW5kKCB0aGlzICkudGhyb3R0bGUoIHRoaXMub3B0aW9ucy5yZWZyZXNoU2Vuc2l0aXZpdHkgKS52YWx1ZSgpO1xuXG5cdFx0dGhpcy5vcHRpb25zLnNjcm9sbEVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuc2Nyb2xsRWxlbWVudCB8fCB0aGlzLmVsO1xuXHRcdCQoIHRoaXMub3B0aW9ucy5zY3JvbGxFbGVtZW50ICkub24oICdzY3JvbGwnLCB0aGlzLnNjcm9sbCApO1xuXG5cdFx0dGhpcy5pbml0U29ydGFibGUoKTtcblxuXHRcdF8uYmluZEFsbCggdGhpcywgJ3NldENvbHVtbnMnICk7XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5yZXNpemUgKSB7XG5cdFx0XHR0aGlzLm9uKCAncmVhZHknLCB0aGlzLmJpbmRFdmVudHMgKTtcblx0XHRcdHRoaXMuY29udHJvbGxlci5vbiggJ29wZW4nLCB0aGlzLnNldENvbHVtbnMgKTtcblxuXHRcdFx0Ly8gQ2FsbCB0aGlzLnNldENvbHVtbnMoKSBhZnRlciB0aGlzIHZpZXcgaGFzIGJlZW4gcmVuZGVyZWQgaW4gdGhlIERPTSBzb1xuXHRcdFx0Ly8gYXR0YWNobWVudHMgZ2V0IHByb3BlciB3aWR0aCBhcHBsaWVkLlxuXHRcdFx0Xy5kZWZlciggdGhpcy5zZXRDb2x1bW5zLCB0aGlzICk7XG5cdFx0fVxuXHR9LFxuXG5cdGJpbmRFdmVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJHdpbmRvdy5vZmYoIHRoaXMucmVzaXplRXZlbnQgKS5vbiggdGhpcy5yZXNpemVFdmVudCwgXy5kZWJvdW5jZSggdGhpcy5zZXRDb2x1bW5zLCA1MCApICk7XG5cdH0sXG5cblx0YXR0YWNobWVudEZvY3VzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiQoICdsaTpmaXJzdCcgKS5mb2N1cygpO1xuXHR9LFxuXG5cdHJlc3RvcmVGb2N1czogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kKCAnbGkuc2VsZWN0ZWQ6Zmlyc3QnICkuZm9jdXMoKTtcblx0fSxcblxuXHRhcnJvd0V2ZW50OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dmFyIGF0dGFjaG1lbnRzID0gdGhpcy4kZWwuY2hpbGRyZW4oICdsaScgKSxcblx0XHRcdHBlclJvdyA9IHRoaXMuY29sdW1ucyxcblx0XHRcdGluZGV4ID0gYXR0YWNobWVudHMuZmlsdGVyKCAnOmZvY3VzJyApLmluZGV4KCksXG5cdFx0XHRyb3cgPSAoIGluZGV4ICsgMSApIDw9IHBlclJvdyA/IDEgOiBNYXRoLmNlaWwoICggaW5kZXggKyAxICkgLyBwZXJSb3cgKTtcblxuXHRcdGlmICggaW5kZXggPT09IC0xICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIExlZnQgYXJyb3dcblx0XHRpZiAoIDM3ID09PSBldmVudC5rZXlDb2RlICkge1xuXHRcdFx0aWYgKCAwID09PSBpbmRleCApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0YXR0YWNobWVudHMuZXEoIGluZGV4IC0gMSApLmZvY3VzKCk7XG5cdFx0fVxuXG5cdFx0Ly8gVXAgYXJyb3dcblx0XHRpZiAoIDM4ID09PSBldmVudC5rZXlDb2RlICkge1xuXHRcdFx0aWYgKCAxID09PSByb3cgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGF0dGFjaG1lbnRzLmVxKCBpbmRleCAtIHBlclJvdyApLmZvY3VzKCk7XG5cdFx0fVxuXG5cdFx0Ly8gUmlnaHQgYXJyb3dcblx0XHRpZiAoIDM5ID09PSBldmVudC5rZXlDb2RlICkge1xuXHRcdFx0aWYgKCBhdHRhY2htZW50cy5sZW5ndGggPT09IGluZGV4ICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRhdHRhY2htZW50cy5lcSggaW5kZXggKyAxICkuZm9jdXMoKTtcblx0XHR9XG5cblx0XHQvLyBEb3duIGFycm93XG5cdFx0aWYgKCA0MCA9PT0gZXZlbnQua2V5Q29kZSApIHtcblx0XHRcdGlmICggTWF0aC5jZWlsKCBhdHRhY2htZW50cy5sZW5ndGggLyBwZXJSb3cgKSA9PT0gcm93ICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRhdHRhY2htZW50cy5lcSggaW5kZXggKyBwZXJSb3cgKS5mb2N1cygpO1xuXHRcdH1cblx0fSxcblxuXHRkaXNwb3NlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNvbGxlY3Rpb24ucHJvcHMub2ZmKCBudWxsLCBudWxsLCB0aGlzICk7XG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMucmVzaXplICkge1xuXHRcdFx0dGhpcy4kd2luZG93Lm9mZiggdGhpcy5yZXNpemVFdmVudCApO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIGNhbGwgJ2Rpc3Bvc2UnIGRpcmVjdGx5IG9uIHRoZSBwYXJlbnQgY2xhc3Ncblx0XHQgKi9cblx0XHRWaWV3LnByb3RvdHlwZS5kaXNwb3NlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHRzZXRDb2x1bW5zOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgcHJldiA9IHRoaXMuY29sdW1ucyxcblx0XHRcdHdpZHRoID0gdGhpcy4kZWwud2lkdGgoKTtcblxuXHRcdGlmICggd2lkdGggKSB7XG5cdFx0XHR0aGlzLmNvbHVtbnMgPSBNYXRoLm1pbiggTWF0aC5yb3VuZCggd2lkdGggLyB0aGlzLm9wdGlvbnMuaWRlYWxDb2x1bW5XaWR0aCApLCAxMiApIHx8IDE7XG5cblx0XHRcdGlmICggISBwcmV2IHx8IHByZXYgIT09IHRoaXMuY29sdW1ucyApIHtcblx0XHRcdFx0dGhpcy4kZWwuY2xvc2VzdCggJy5tZWRpYS1mcmFtZS1jb250ZW50JyApLmF0dHIoICdkYXRhLWNvbHVtbnMnLCB0aGlzLmNvbHVtbnMgKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0aW5pdFNvcnRhYmxlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgY29sbGVjdGlvbiA9IHRoaXMuY29sbGVjdGlvbjtcblxuXHRcdGlmICggd3AubWVkaWEuaXNUb3VjaERldmljZSB8fCAhIHRoaXMub3B0aW9ucy5zb3J0YWJsZSB8fCAhICQuZm4uc29ydGFibGUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy4kZWwuc29ydGFibGUoIF8uZXh0ZW5kKHtcblx0XHRcdC8vIElmIHRoZSBgY29sbGVjdGlvbmAgaGFzIGEgYGNvbXBhcmF0b3JgLCBkaXNhYmxlIHNvcnRpbmcuXG5cdFx0XHRkaXNhYmxlZDogISEgY29sbGVjdGlvbi5jb21wYXJhdG9yLFxuXG5cdFx0XHQvLyBDaGFuZ2UgdGhlIHBvc2l0aW9uIG9mIHRoZSBhdHRhY2htZW50IGFzIHNvb24gYXMgdGhlXG5cdFx0XHQvLyBtb3VzZSBwb2ludGVyIG92ZXJsYXBzIGEgdGh1bWJuYWlsLlxuXHRcdFx0dG9sZXJhbmNlOiAncG9pbnRlcicsXG5cblx0XHRcdC8vIFJlY29yZCB0aGUgaW5pdGlhbCBgaW5kZXhgIG9mIHRoZSBkcmFnZ2VkIG1vZGVsLlxuXHRcdFx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCwgdWkgKSB7XG5cdFx0XHRcdHVpLml0ZW0uZGF0YSgnc29ydGFibGVJbmRleFN0YXJ0JywgdWkuaXRlbS5pbmRleCgpKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vIFVwZGF0ZSB0aGUgbW9kZWwncyBpbmRleCBpbiB0aGUgY29sbGVjdGlvbi5cblx0XHRcdC8vIERvIHNvIHNpbGVudGx5LCBhcyB0aGUgdmlldyBpcyBhbHJlYWR5IGFjY3VyYXRlLlxuXHRcdFx0dXBkYXRlOiBmdW5jdGlvbiggZXZlbnQsIHVpICkge1xuXHRcdFx0XHR2YXIgbW9kZWwgPSBjb2xsZWN0aW9uLmF0KCB1aS5pdGVtLmRhdGEoJ3NvcnRhYmxlSW5kZXhTdGFydCcpICksXG5cdFx0XHRcdFx0Y29tcGFyYXRvciA9IGNvbGxlY3Rpb24uY29tcGFyYXRvcjtcblxuXHRcdFx0XHQvLyBUZW1wb3JhcmlseSBkaXNhYmxlIHRoZSBjb21wYXJhdG9yIHRvIHByZXZlbnQgYGFkZGBcblx0XHRcdFx0Ly8gZnJvbSByZS1zb3J0aW5nLlxuXHRcdFx0XHRkZWxldGUgY29sbGVjdGlvbi5jb21wYXJhdG9yO1xuXG5cdFx0XHRcdC8vIFNpbGVudGx5IHNoaWZ0IHRoZSBtb2RlbCB0byBpdHMgbmV3IGluZGV4LlxuXHRcdFx0XHRjb2xsZWN0aW9uLnJlbW92ZSggbW9kZWwsIHtcblx0XHRcdFx0XHRzaWxlbnQ6IHRydWVcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGNvbGxlY3Rpb24uYWRkKCBtb2RlbCwge1xuXHRcdFx0XHRcdHNpbGVudDogdHJ1ZSxcblx0XHRcdFx0XHRhdDogICAgIHVpLml0ZW0uaW5kZXgoKVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvLyBSZXN0b3JlIHRoZSBjb21wYXJhdG9yLlxuXHRcdFx0XHRjb2xsZWN0aW9uLmNvbXBhcmF0b3IgPSBjb21wYXJhdG9yO1xuXG5cdFx0XHRcdC8vIEZpcmUgdGhlIGByZXNldGAgZXZlbnQgdG8gZW5zdXJlIG90aGVyIGNvbGxlY3Rpb25zIHN5bmMuXG5cdFx0XHRcdGNvbGxlY3Rpb24udHJpZ2dlciggJ3Jlc2V0JywgY29sbGVjdGlvbiApO1xuXG5cdFx0XHRcdC8vIElmIHRoZSBjb2xsZWN0aW9uIGlzIHNvcnRlZCBieSBtZW51IG9yZGVyLFxuXHRcdFx0XHQvLyB1cGRhdGUgdGhlIG1lbnUgb3JkZXIuXG5cdFx0XHRcdGNvbGxlY3Rpb24uc2F2ZU1lbnVPcmRlcigpO1xuXHRcdFx0fVxuXHRcdH0sIHRoaXMub3B0aW9ucy5zb3J0YWJsZSApICk7XG5cblx0XHQvLyBJZiB0aGUgYG9yZGVyYnlgIHByb3BlcnR5IGlzIGNoYW5nZWQgb24gdGhlIGBjb2xsZWN0aW9uYCxcblx0XHQvLyBjaGVjayB0byBzZWUgaWYgd2UgaGF2ZSBhIGBjb21wYXJhdG9yYC4gSWYgc28sIGRpc2FibGUgc29ydGluZy5cblx0XHRjb2xsZWN0aW9uLnByb3BzLm9uKCAnY2hhbmdlOm9yZGVyYnknLCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGVsLnNvcnRhYmxlKCAnb3B0aW9uJywgJ2Rpc2FibGVkJywgISEgY29sbGVjdGlvbi5jb21wYXJhdG9yICk7XG5cdFx0fSwgdGhpcyApO1xuXG5cdFx0dGhpcy5jb2xsZWN0aW9uLnByb3BzLm9uKCAnY2hhbmdlOm9yZGVyYnknLCB0aGlzLnJlZnJlc2hTb3J0YWJsZSwgdGhpcyApO1xuXHRcdHRoaXMucmVmcmVzaFNvcnRhYmxlKCk7XG5cdH0sXG5cblx0cmVmcmVzaFNvcnRhYmxlOiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHdwLm1lZGlhLmlzVG91Y2hEZXZpY2UgfHwgISB0aGlzLm9wdGlvbnMuc29ydGFibGUgfHwgISAkLmZuLnNvcnRhYmxlICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoZSBgY29sbGVjdGlvbmAgaGFzIGEgYGNvbXBhcmF0b3JgLCBkaXNhYmxlIHNvcnRpbmcuXG5cdFx0dmFyIGNvbGxlY3Rpb24gPSB0aGlzLmNvbGxlY3Rpb24sXG5cdFx0XHRvcmRlcmJ5ID0gY29sbGVjdGlvbi5wcm9wcy5nZXQoJ29yZGVyYnknKSxcblx0XHRcdGVuYWJsZWQgPSAnbWVudU9yZGVyJyA9PT0gb3JkZXJieSB8fCAhIGNvbGxlY3Rpb24uY29tcGFyYXRvcjtcblxuXHRcdHRoaXMuJGVsLnNvcnRhYmxlKCAnb3B0aW9uJywgJ2Rpc2FibGVkJywgISBlbmFibGVkICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudH0gYXR0YWNobWVudFxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEuVmlld31cblx0ICovXG5cdGNyZWF0ZUF0dGFjaG1lbnRWaWV3OiBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblx0XHR2YXIgdmlldyA9IG5ldyB0aGlzLm9wdGlvbnMuQXR0YWNobWVudFZpZXcoe1xuXHRcdFx0Y29udHJvbGxlcjogICAgICAgICAgIHRoaXMuY29udHJvbGxlcixcblx0XHRcdG1vZGVsOiAgICAgICAgICAgICAgICBhdHRhY2htZW50LFxuXHRcdFx0Y29sbGVjdGlvbjogICAgICAgICAgIHRoaXMuY29sbGVjdGlvbixcblx0XHRcdHNlbGVjdGlvbjogICAgICAgICAgICB0aGlzLm9wdGlvbnMuc2VsZWN0aW9uXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gdGhpcy5fdmlld3NCeUNpZFsgYXR0YWNobWVudC5jaWQgXSA9IHZpZXc7XG5cdH0sXG5cblx0cHJlcGFyZTogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gQ3JlYXRlIGFsbCBvZiB0aGUgQXR0YWNobWVudCB2aWV3cywgYW5kIHJlcGxhY2Vcblx0XHQvLyB0aGUgbGlzdCBpbiBhIHNpbmdsZSBET00gb3BlcmF0aW9uLlxuXHRcdGlmICggdGhpcy5jb2xsZWN0aW9uLmxlbmd0aCApIHtcblx0XHRcdHRoaXMudmlld3Muc2V0KCB0aGlzLmNvbGxlY3Rpb24ubWFwKCB0aGlzLmNyZWF0ZUF0dGFjaG1lbnRWaWV3LCB0aGlzICkgKTtcblxuXHRcdC8vIElmIHRoZXJlIGFyZSBubyBlbGVtZW50cywgY2xlYXIgdGhlIHZpZXdzIGFuZCBsb2FkIHNvbWUuXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudmlld3MudW5zZXQoKTtcblx0XHRcdHRoaXMuY29sbGVjdGlvbi5tb3JlKCkuZG9uZSggdGhpcy5zY3JvbGwgKTtcblx0XHR9XG5cdH0sXG5cblx0cmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIFRyaWdnZXIgdGhlIHNjcm9sbCBldmVudCB0byBjaGVjayBpZiB3ZSdyZSB3aXRoaW4gdGhlXG5cdFx0Ly8gdGhyZXNob2xkIHRvIHF1ZXJ5IGZvciBhZGRpdGlvbmFsIGF0dGFjaG1lbnRzLlxuXHRcdHRoaXMuc2Nyb2xsKCk7XG5cdH0sXG5cblx0c2Nyb2xsOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdmlldyA9IHRoaXMsXG5cdFx0XHRlbCA9IHRoaXMub3B0aW9ucy5zY3JvbGxFbGVtZW50LFxuXHRcdFx0c2Nyb2xsVG9wID0gZWwuc2Nyb2xsVG9wLFxuXHRcdFx0dG9vbGJhcjtcblxuXHRcdC8vIFRoZSBzY3JvbGwgZXZlbnQgb2NjdXJzIG9uIHRoZSBkb2N1bWVudCwgYnV0IHRoZSBlbGVtZW50XG5cdFx0Ly8gdGhhdCBzaG91bGQgYmUgY2hlY2tlZCBpcyB0aGUgZG9jdW1lbnQgYm9keS5cblx0XHRpZiAoIGVsID09PSBkb2N1bWVudCApIHtcblx0XHRcdGVsID0gZG9jdW1lbnQuYm9keTtcblx0XHRcdHNjcm9sbFRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpO1xuXHRcdH1cblxuXHRcdGlmICggISAkKGVsKS5pcygnOnZpc2libGUnKSB8fCAhIHRoaXMuY29sbGVjdGlvbi5oYXNNb3JlKCkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dG9vbGJhciA9IHRoaXMudmlld3MucGFyZW50LnRvb2xiYXI7XG5cblx0XHQvLyBTaG93IHRoZSBzcGlubmVyIG9ubHkgaWYgd2UgYXJlIGNsb3NlIHRvIHRoZSBib3R0b20uXG5cdFx0aWYgKCBlbC5zY3JvbGxIZWlnaHQgLSAoIHNjcm9sbFRvcCArIGVsLmNsaWVudEhlaWdodCApIDwgZWwuY2xpZW50SGVpZ2h0IC8gMyApIHtcblx0XHRcdHRvb2xiYXIuZ2V0KCdzcGlubmVyJykuc2hvdygpO1xuXHRcdH1cblxuXHRcdGlmICggZWwuc2Nyb2xsSGVpZ2h0IDwgc2Nyb2xsVG9wICsgKCBlbC5jbGllbnRIZWlnaHQgKiB0aGlzLm9wdGlvbnMucmVmcmVzaFRocmVzaG9sZCApICkge1xuXHRcdFx0dGhpcy5jb2xsZWN0aW9uLm1vcmUoKS5kb25lKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2aWV3LnNjcm9sbCgpO1xuXHRcdFx0XHR0b29sYmFyLmdldCgnc3Bpbm5lcicpLmhpZGUoKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXR0YWNobWVudHM7XG4iLCIvKmdsb2JhbHMgd3AsIF8sIGpRdWVyeSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudHNCcm93c2VyXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKlxuICogQHBhcmFtIHtvYmplY3R9ICAgICAgICAgW29wdGlvbnNdICAgICAgICAgICAgICAgVGhlIG9wdGlvbnMgaGFzaCBwYXNzZWQgdG8gdGhlIHZpZXcuXG4gKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSBbb3B0aW9ucy5maWx0ZXJzPWZhbHNlXSBXaGljaCBmaWx0ZXJzIHRvIHNob3cgaW4gdGhlIGJyb3dzZXIncyB0b29sYmFyLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWNjZXB0cyAndXBsb2FkZWQnIGFuZCAnYWxsJy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgIFtvcHRpb25zLnNlYXJjaD10cnVlXSAgIFdoZXRoZXIgdG8gc2hvdyB0aGUgc2VhcmNoIGludGVyZmFjZSBpbiB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyb3dzZXIncyB0b29sYmFyLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgW29wdGlvbnMuZGF0ZT10cnVlXSAgICAgV2hldGhlciB0byBzaG93IHRoZSBkYXRlIGZpbHRlciBpbiB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyb3dzZXIncyB0b29sYmFyLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgW29wdGlvbnMuZGlzcGxheT1mYWxzZV0gV2hldGhlciB0byBzaG93IHRoZSBhdHRhY2htZW50cyBkaXNwbGF5IHNldHRpbmdzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3IGluIHRoZSBzaWRlYmFyLlxuICogQHBhcmFtIHtib29sZWFufHN0cmluZ30gW29wdGlvbnMuc2lkZWJhcj10cnVlXSAgV2hldGhlciB0byBjcmVhdGUgYSBzaWRlYmFyIGZvciB0aGUgYnJvd3Nlci5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjY2VwdHMgdHJ1ZSwgZmFsc2UsIGFuZCAnZXJyb3JzJy5cbiAqL1xudmFyIFZpZXcgPSB3cC5tZWRpYS5WaWV3LFxuXHRtZWRpYVRyYXNoID0gd3AubWVkaWEudmlldy5zZXR0aW5ncy5tZWRpYVRyYXNoLFxuXHRsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHQkID0galF1ZXJ5LFxuXHRBdHRhY2htZW50c0Jyb3dzZXI7XG5cbkF0dGFjaG1lbnRzQnJvd3NlciA9IFZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogICAnZGl2Jyxcblx0Y2xhc3NOYW1lOiAnYXR0YWNobWVudHMtYnJvd3NlcicsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0Xy5kZWZhdWx0cyggdGhpcy5vcHRpb25zLCB7XG5cdFx0XHRmaWx0ZXJzOiBmYWxzZSxcblx0XHRcdHNlYXJjaDogIHRydWUsXG5cdFx0XHRkYXRlOiAgICB0cnVlLFxuXHRcdFx0ZGlzcGxheTogZmFsc2UsXG5cdFx0XHRzaWRlYmFyOiB0cnVlLFxuXHRcdFx0QXR0YWNobWVudFZpZXc6IHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudC5MaWJyYXJ5XG5cdFx0fSk7XG5cblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLmNvbnRyb2xsZXIsICd0b2dnbGU6dXBsb2FkOmF0dGFjaG1lbnQnLCBfLmJpbmQoIHRoaXMudG9nZ2xlVXBsb2FkZXIsIHRoaXMgKSApO1xuXHRcdHRoaXMuY29udHJvbGxlci5vbiggJ2VkaXQ6c2VsZWN0aW9uJywgdGhpcy5lZGl0U2VsZWN0aW9uICk7XG5cdFx0dGhpcy5jcmVhdGVUb29sYmFyKCk7XG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuc2lkZWJhciApIHtcblx0XHRcdHRoaXMuY3JlYXRlU2lkZWJhcigpO1xuXHRcdH1cblx0XHR0aGlzLmNyZWF0ZVVwbG9hZGVyKCk7XG5cdFx0dGhpcy5jcmVhdGVBdHRhY2htZW50cygpO1xuXHRcdHRoaXMudXBkYXRlQ29udGVudCgpO1xuXG5cdFx0aWYgKCAhIHRoaXMub3B0aW9ucy5zaWRlYmFyIHx8ICdlcnJvcnMnID09PSB0aGlzLm9wdGlvbnMuc2lkZWJhciApIHtcblx0XHRcdHRoaXMuJGVsLmFkZENsYXNzKCAnaGlkZS1zaWRlYmFyJyApO1xuXG5cdFx0XHRpZiAoICdlcnJvcnMnID09PSB0aGlzLm9wdGlvbnMuc2lkZWJhciApIHtcblx0XHRcdFx0dGhpcy4kZWwuYWRkQ2xhc3MoICdzaWRlYmFyLWZvci1lcnJvcnMnICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5jb2xsZWN0aW9uLm9uKCAnYWRkIHJlbW92ZSByZXNldCcsIHRoaXMudXBkYXRlQ29udGVudCwgdGhpcyApO1xuXHR9LFxuXG5cdGVkaXRTZWxlY3Rpb246IGZ1bmN0aW9uKCBtb2RhbCApIHtcblx0XHRtb2RhbC4kKCAnLm1lZGlhLWJ1dHRvbi1iYWNrVG9MaWJyYXJ5JyApLmZvY3VzKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRzQnJvd3Nlcn0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdGRpc3Bvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub3B0aW9ucy5zZWxlY3Rpb24ub2ZmKCBudWxsLCBudWxsLCB0aGlzICk7XG5cdFx0Vmlldy5wcm90b3R5cGUuZGlzcG9zZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0Y3JlYXRlVG9vbGJhcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIExpYnJhcnlWaWV3U3dpdGNoZXIsIEZpbHRlcnMsIHRvb2xiYXJPcHRpb25zO1xuXG5cdFx0dG9vbGJhck9wdGlvbnMgPSB7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLmNvbnRyb2xsZXJcblx0XHR9O1xuXG5cdFx0aWYgKCB0aGlzLmNvbnRyb2xsZXIuaXNNb2RlQWN0aXZlKCAnZ3JpZCcgKSApIHtcblx0XHRcdHRvb2xiYXJPcHRpb25zLmNsYXNzTmFtZSA9ICdtZWRpYS10b29sYmFyIHdwLWZpbHRlcic7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0KiBAbWVtYmVyIHt3cC5tZWRpYS52aWV3LlRvb2xiYXJ9XG5cdFx0Ki9cblx0XHR0aGlzLnRvb2xiYXIgPSBuZXcgd3AubWVkaWEudmlldy5Ub29sYmFyKCB0b29sYmFyT3B0aW9ucyApO1xuXG5cdFx0dGhpcy52aWV3cy5hZGQoIHRoaXMudG9vbGJhciApO1xuXG5cdFx0dGhpcy50b29sYmFyLnNldCggJ3NwaW5uZXInLCBuZXcgd3AubWVkaWEudmlldy5TcGlubmVyKHtcblx0XHRcdHByaW9yaXR5OiAtNjBcblx0XHR9KSApO1xuXG5cdFx0aWYgKCAtMSAhPT0gJC5pbkFycmF5KCB0aGlzLm9wdGlvbnMuZmlsdGVycywgWyAndXBsb2FkZWQnLCAnYWxsJyBdICkgKSB7XG5cdFx0XHQvLyBcIkZpbHRlcnNcIiB3aWxsIHJldHVybiBhIDxzZWxlY3Q+LCBuZWVkIHRvIHJlbmRlclxuXHRcdFx0Ly8gc2NyZWVuIHJlYWRlciB0ZXh0IGJlZm9yZVxuXHRcdFx0dGhpcy50b29sYmFyLnNldCggJ2ZpbHRlcnNMYWJlbCcsIG5ldyB3cC5tZWRpYS52aWV3LkxhYmVsKHtcblx0XHRcdFx0dmFsdWU6IGwxMG4uZmlsdGVyQnlUeXBlLFxuXHRcdFx0XHRhdHRyaWJ1dGVzOiB7XG5cdFx0XHRcdFx0J2Zvcic6ICAnbWVkaWEtYXR0YWNobWVudC1maWx0ZXJzJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmlvcml0eTogICAtODBcblx0XHRcdH0pLnJlbmRlcigpICk7XG5cblx0XHRcdGlmICggJ3VwbG9hZGVkJyA9PT0gdGhpcy5vcHRpb25zLmZpbHRlcnMgKSB7XG5cdFx0XHRcdHRoaXMudG9vbGJhci5zZXQoICdmaWx0ZXJzJywgbmV3IHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudEZpbHRlcnMuVXBsb2FkZWQoe1xuXHRcdFx0XHRcdGNvbnRyb2xsZXI6IHRoaXMuY29udHJvbGxlcixcblx0XHRcdFx0XHRtb2RlbDogICAgICB0aGlzLmNvbGxlY3Rpb24ucHJvcHMsXG5cdFx0XHRcdFx0cHJpb3JpdHk6ICAgLTgwXG5cdFx0XHRcdH0pLnJlbmRlcigpICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRGaWx0ZXJzID0gbmV3IHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudEZpbHRlcnMuQWxsKHtcblx0XHRcdFx0XHRjb250cm9sbGVyOiB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRcdFx0bW9kZWw6ICAgICAgdGhpcy5jb2xsZWN0aW9uLnByb3BzLFxuXHRcdFx0XHRcdHByaW9yaXR5OiAgIC04MFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGlzLnRvb2xiYXIuc2V0KCAnZmlsdGVycycsIEZpbHRlcnMucmVuZGVyKCkgKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBGZWVscyBvZGQgdG8gYnJpbmcgdGhlIGdsb2JhbCBtZWRpYSBsaWJyYXJ5IHN3aXRjaGVyIGludG8gdGhlIEF0dGFjaG1lbnRcblx0XHQvLyBicm93c2VyIHZpZXcuIElzIHRoaXMgYSB1c2UgY2FzZSBmb3IgZG9BY3Rpb24oICdhZGQ6dG9vbGJhci1pdGVtczphdHRhY2htZW50cy1icm93c2VyJywgdGhpcy50b29sYmFyICk7XG5cdFx0Ly8gd2hpY2ggdGhlIGNvbnRyb2xsZXIgY2FuIHRhcCBpbnRvIGFuZCBhZGQgdGhpcyB2aWV3P1xuXHRcdGlmICggdGhpcy5jb250cm9sbGVyLmlzTW9kZUFjdGl2ZSggJ2dyaWQnICkgKSB7XG5cdFx0XHRMaWJyYXJ5Vmlld1N3aXRjaGVyID0gVmlldy5leHRlbmQoe1xuXHRcdFx0XHRjbGFzc05hbWU6ICd2aWV3LXN3aXRjaCBtZWRpYS1ncmlkLXZpZXctc3dpdGNoJyxcblx0XHRcdFx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnbWVkaWEtbGlicmFyeS12aWV3LXN3aXRjaGVyJylcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLnRvb2xiYXIuc2V0KCAnbGlicmFyeVZpZXdTd2l0Y2hlcicsIG5ldyBMaWJyYXJ5Vmlld1N3aXRjaGVyKHtcblx0XHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRwcmlvcml0eTogLTkwXG5cdFx0XHR9KS5yZW5kZXIoKSApO1xuXG5cdFx0XHQvLyBEYXRlRmlsdGVyIGlzIGEgPHNlbGVjdD4sIHNjcmVlbiByZWFkZXIgdGV4dCBuZWVkcyB0byBiZSByZW5kZXJlZCBiZWZvcmVcblx0XHRcdHRoaXMudG9vbGJhci5zZXQoICdkYXRlRmlsdGVyTGFiZWwnLCBuZXcgd3AubWVkaWEudmlldy5MYWJlbCh7XG5cdFx0XHRcdHZhbHVlOiBsMTBuLmZpbHRlckJ5RGF0ZSxcblx0XHRcdFx0YXR0cmlidXRlczoge1xuXHRcdFx0XHRcdCdmb3InOiAnbWVkaWEtYXR0YWNobWVudC1kYXRlLWZpbHRlcnMnXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHByaW9yaXR5OiAtNzVcblx0XHRcdH0pLnJlbmRlcigpICk7XG5cdFx0XHR0aGlzLnRvb2xiYXIuc2V0KCAnZGF0ZUZpbHRlcicsIG5ldyB3cC5tZWRpYS52aWV3LkRhdGVGaWx0ZXIoe1xuXHRcdFx0XHRjb250cm9sbGVyOiB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRcdG1vZGVsOiAgICAgIHRoaXMuY29sbGVjdGlvbi5wcm9wcyxcblx0XHRcdFx0cHJpb3JpdHk6IC03NVxuXHRcdFx0fSkucmVuZGVyKCkgKTtcblxuXHRcdFx0Ly8gQnVsa1NlbGVjdGlvbiBpcyBhIDxkaXY+IHdpdGggc3Vidmlld3MsIGluY2x1ZGluZyBzY3JlZW4gcmVhZGVyIHRleHRcblx0XHRcdHRoaXMudG9vbGJhci5zZXQoICdzZWxlY3RNb2RlVG9nZ2xlQnV0dG9uJywgbmV3IHdwLm1lZGlhLnZpZXcuU2VsZWN0TW9kZVRvZ2dsZUJ1dHRvbih7XG5cdFx0XHRcdHRleHQ6IGwxMG4uYnVsa1NlbGVjdCxcblx0XHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRwcmlvcml0eTogLTcwXG5cdFx0XHR9KS5yZW5kZXIoKSApO1xuXG5cdFx0XHR0aGlzLnRvb2xiYXIuc2V0KCAnZGVsZXRlU2VsZWN0ZWRCdXR0b24nLCBuZXcgd3AubWVkaWEudmlldy5EZWxldGVTZWxlY3RlZEJ1dHRvbih7XG5cdFx0XHRcdGZpbHRlcnM6IEZpbHRlcnMsXG5cdFx0XHRcdHN0eWxlOiAncHJpbWFyeScsXG5cdFx0XHRcdGRpc2FibGVkOiB0cnVlLFxuXHRcdFx0XHR0ZXh0OiBtZWRpYVRyYXNoID8gbDEwbi50cmFzaFNlbGVjdGVkIDogbDEwbi5kZWxldGVTZWxlY3RlZCxcblx0XHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRwcmlvcml0eTogLTYwLFxuXHRcdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dmFyIGNoYW5nZWQgPSBbXSwgcmVtb3ZlZCA9IFtdLFxuXHRcdFx0XHRcdFx0c2VsZWN0aW9uID0gdGhpcy5jb250cm9sbGVyLnN0YXRlKCkuZ2V0KCAnc2VsZWN0aW9uJyApLFxuXHRcdFx0XHRcdFx0bGlicmFyeSA9IHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLmdldCggJ2xpYnJhcnknICk7XG5cblx0XHRcdFx0XHRpZiAoICEgc2VsZWN0aW9uLmxlbmd0aCApIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoICEgbWVkaWFUcmFzaCAmJiAhIHdpbmRvdy5jb25maXJtKCBsMTBuLndhcm5CdWxrRGVsZXRlICkgKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCBtZWRpYVRyYXNoICYmXG5cdFx0XHRcdFx0XHQndHJhc2gnICE9PSBzZWxlY3Rpb24uYXQoIDAgKS5nZXQoICdzdGF0dXMnICkgJiZcblx0XHRcdFx0XHRcdCEgd2luZG93LmNvbmZpcm0oIGwxMG4ud2FybkJ1bGtUcmFzaCApICkge1xuXG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0c2VsZWN0aW9uLmVhY2goIGZ1bmN0aW9uKCBtb2RlbCApIHtcblx0XHRcdFx0XHRcdGlmICggISBtb2RlbC5nZXQoICdub25jZXMnIClbJ2RlbGV0ZSddICkge1xuXHRcdFx0XHRcdFx0XHRyZW1vdmVkLnB1c2goIG1vZGVsICk7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKCBtZWRpYVRyYXNoICYmICd0cmFzaCcgPT09IG1vZGVsLmdldCggJ3N0YXR1cycgKSApIHtcblx0XHRcdFx0XHRcdFx0bW9kZWwuc2V0KCAnc3RhdHVzJywgJ2luaGVyaXQnICk7XG5cdFx0XHRcdFx0XHRcdGNoYW5nZWQucHVzaCggbW9kZWwuc2F2ZSgpICk7XG5cdFx0XHRcdFx0XHRcdHJlbW92ZWQucHVzaCggbW9kZWwgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoIG1lZGlhVHJhc2ggKSB7XG5cdFx0XHRcdFx0XHRcdG1vZGVsLnNldCggJ3N0YXR1cycsICd0cmFzaCcgKTtcblx0XHRcdFx0XHRcdFx0Y2hhbmdlZC5wdXNoKCBtb2RlbC5zYXZlKCkgKTtcblx0XHRcdFx0XHRcdFx0cmVtb3ZlZC5wdXNoKCBtb2RlbCApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0bW9kZWwuZGVzdHJveSh7d2FpdDogdHJ1ZX0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdGlmICggY2hhbmdlZC5sZW5ndGggKSB7XG5cdFx0XHRcdFx0XHRzZWxlY3Rpb24ucmVtb3ZlKCByZW1vdmVkICk7XG5cblx0XHRcdFx0XHRcdCQud2hlbi5hcHBseSggbnVsbCwgY2hhbmdlZCApLnRoZW4oIF8uYmluZCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGxpYnJhcnkuX3JlcXVlcnkoIHRydWUgKTtcblx0XHRcdFx0XHRcdFx0dGhpcy5jb250cm9sbGVyLnRyaWdnZXIoICdzZWxlY3Rpb246YWN0aW9uOmRvbmUnICk7XG5cdFx0XHRcdFx0XHR9LCB0aGlzICkgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy5jb250cm9sbGVyLnRyaWdnZXIoICdzZWxlY3Rpb246YWN0aW9uOmRvbmUnICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KS5yZW5kZXIoKSApO1xuXG5cdFx0XHRpZiAoIG1lZGlhVHJhc2ggKSB7XG5cdFx0XHRcdHRoaXMudG9vbGJhci5zZXQoICdkZWxldGVTZWxlY3RlZFBlcm1hbmVudGx5QnV0dG9uJywgbmV3IHdwLm1lZGlhLnZpZXcuRGVsZXRlU2VsZWN0ZWRQZXJtYW5lbnRseUJ1dHRvbih7XG5cdFx0XHRcdFx0ZmlsdGVyczogRmlsdGVycyxcblx0XHRcdFx0XHRzdHlsZTogJ3ByaW1hcnknLFxuXHRcdFx0XHRcdGRpc2FibGVkOiB0cnVlLFxuXHRcdFx0XHRcdHRleHQ6IGwxMG4uZGVsZXRlU2VsZWN0ZWQsXG5cdFx0XHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRcdHByaW9yaXR5OiAtNTUsXG5cdFx0XHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIHJlbW92ZWQgPSBbXSwgc2VsZWN0aW9uID0gdGhpcy5jb250cm9sbGVyLnN0YXRlKCkuZ2V0KCAnc2VsZWN0aW9uJyApO1xuXG5cdFx0XHRcdFx0XHRpZiAoICEgc2VsZWN0aW9uLmxlbmd0aCB8fCAhIHdpbmRvdy5jb25maXJtKCBsMTBuLndhcm5CdWxrRGVsZXRlICkgKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0c2VsZWN0aW9uLmVhY2goIGZ1bmN0aW9uKCBtb2RlbCApIHtcblx0XHRcdFx0XHRcdFx0aWYgKCAhIG1vZGVsLmdldCggJ25vbmNlcycgKVsnZGVsZXRlJ10gKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmVtb3ZlZC5wdXNoKCBtb2RlbCApO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdG1vZGVsLmRlc3Ryb3koKTtcblx0XHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdFx0c2VsZWN0aW9uLnJlbW92ZSggcmVtb3ZlZCApO1xuXHRcdFx0XHRcdFx0dGhpcy5jb250cm9sbGVyLnRyaWdnZXIoICdzZWxlY3Rpb246YWN0aW9uOmRvbmUnICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KS5yZW5kZXIoKSApO1xuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIGlmICggdGhpcy5vcHRpb25zLmRhdGUgKSB7XG5cdFx0XHQvLyBEYXRlRmlsdGVyIGlzIGEgPHNlbGVjdD4sIHNjcmVlbiByZWFkZXIgdGV4dCBuZWVkcyB0byBiZSByZW5kZXJlZCBiZWZvcmVcblx0XHRcdHRoaXMudG9vbGJhci5zZXQoICdkYXRlRmlsdGVyTGFiZWwnLCBuZXcgd3AubWVkaWEudmlldy5MYWJlbCh7XG5cdFx0XHRcdHZhbHVlOiBsMTBuLmZpbHRlckJ5RGF0ZSxcblx0XHRcdFx0YXR0cmlidXRlczoge1xuXHRcdFx0XHRcdCdmb3InOiAnbWVkaWEtYXR0YWNobWVudC1kYXRlLWZpbHRlcnMnXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHByaW9yaXR5OiAtNzVcblx0XHRcdH0pLnJlbmRlcigpICk7XG5cdFx0XHR0aGlzLnRvb2xiYXIuc2V0KCAnZGF0ZUZpbHRlcicsIG5ldyB3cC5tZWRpYS52aWV3LkRhdGVGaWx0ZXIoe1xuXHRcdFx0XHRjb250cm9sbGVyOiB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRcdG1vZGVsOiAgICAgIHRoaXMuY29sbGVjdGlvbi5wcm9wcyxcblx0XHRcdFx0cHJpb3JpdHk6IC03NVxuXHRcdFx0fSkucmVuZGVyKCkgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5zZWFyY2ggKSB7XG5cdFx0XHQvLyBTZWFyY2ggaXMgYW4gaW5wdXQsIHNjcmVlbiByZWFkZXIgdGV4dCBuZWVkcyB0byBiZSByZW5kZXJlZCBiZWZvcmVcblx0XHRcdHRoaXMudG9vbGJhci5zZXQoICdzZWFyY2hMYWJlbCcsIG5ldyB3cC5tZWRpYS52aWV3LkxhYmVsKHtcblx0XHRcdFx0dmFsdWU6IGwxMG4uc2VhcmNoTWVkaWFMYWJlbCxcblx0XHRcdFx0YXR0cmlidXRlczoge1xuXHRcdFx0XHRcdCdmb3InOiAnbWVkaWEtc2VhcmNoLWlucHV0J1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmlvcml0eTogICA2MFxuXHRcdFx0fSkucmVuZGVyKCkgKTtcblx0XHRcdHRoaXMudG9vbGJhci5zZXQoICdzZWFyY2gnLCBuZXcgd3AubWVkaWEudmlldy5TZWFyY2goe1xuXHRcdFx0XHRjb250cm9sbGVyOiB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRcdG1vZGVsOiAgICAgIHRoaXMuY29sbGVjdGlvbi5wcm9wcyxcblx0XHRcdFx0cHJpb3JpdHk6ICAgNjBcblx0XHRcdH0pLnJlbmRlcigpICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuZHJhZ0luZm8gKSB7XG5cdFx0XHR0aGlzLnRvb2xiYXIuc2V0KCAnZHJhZ0luZm8nLCBuZXcgVmlldyh7XG5cdFx0XHRcdGVsOiAkKCAnPGRpdiBjbGFzcz1cImluc3RydWN0aW9uc1wiPicgKyBsMTBuLmRyYWdJbmZvICsgJzwvZGl2PicgKVswXSxcblx0XHRcdFx0cHJpb3JpdHk6IC00MFxuXHRcdFx0fSkgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5zdWdnZXN0ZWRXaWR0aCAmJiB0aGlzLm9wdGlvbnMuc3VnZ2VzdGVkSGVpZ2h0ICkge1xuXHRcdFx0dGhpcy50b29sYmFyLnNldCggJ3N1Z2dlc3RlZERpbWVuc2lvbnMnLCBuZXcgVmlldyh7XG5cdFx0XHRcdGVsOiAkKCAnPGRpdiBjbGFzcz1cImluc3RydWN0aW9uc1wiPicgKyBsMTBuLnN1Z2dlc3RlZERpbWVuc2lvbnMgKyAnICcgKyB0aGlzLm9wdGlvbnMuc3VnZ2VzdGVkV2lkdGggKyAnICZ0aW1lczsgJyArIHRoaXMub3B0aW9ucy5zdWdnZXN0ZWRIZWlnaHQgKyAnPC9kaXY+JyApWzBdLFxuXHRcdFx0XHRwcmlvcml0eTogLTQwXG5cdFx0XHR9KSApO1xuXHRcdH1cblx0fSxcblxuXHR1cGRhdGVDb250ZW50OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdmlldyA9IHRoaXMsXG5cdFx0XHRub0l0ZW1zVmlldztcblxuXHRcdGlmICggdGhpcy5jb250cm9sbGVyLmlzTW9kZUFjdGl2ZSggJ2dyaWQnICkgKSB7XG5cdFx0XHRub0l0ZW1zVmlldyA9IHZpZXcuYXR0YWNobWVudHNOb1Jlc3VsdHM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vSXRlbXNWaWV3ID0gdmlldy51cGxvYWRlcjtcblx0XHR9XG5cblx0XHRpZiAoICEgdGhpcy5jb2xsZWN0aW9uLmxlbmd0aCApIHtcblx0XHRcdHRoaXMudG9vbGJhci5nZXQoICdzcGlubmVyJyApLnNob3coKTtcblx0XHRcdHRoaXMuZGZkID0gdGhpcy5jb2xsZWN0aW9uLm1vcmUoKS5kb25lKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCAhIHZpZXcuY29sbGVjdGlvbi5sZW5ndGggKSB7XG5cdFx0XHRcdFx0bm9JdGVtc1ZpZXcuJGVsLnJlbW92ZUNsYXNzKCAnaGlkZGVuJyApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG5vSXRlbXNWaWV3LiRlbC5hZGRDbGFzcyggJ2hpZGRlbicgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2aWV3LnRvb2xiYXIuZ2V0KCAnc3Bpbm5lcicgKS5oaWRlKCk7XG5cdFx0XHR9ICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vSXRlbXNWaWV3LiRlbC5hZGRDbGFzcyggJ2hpZGRlbicgKTtcblx0XHRcdHZpZXcudG9vbGJhci5nZXQoICdzcGlubmVyJyApLmhpZGUoKTtcblx0XHR9XG5cdH0sXG5cblx0Y3JlYXRlVXBsb2FkZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudXBsb2FkZXIgPSBuZXcgd3AubWVkaWEudmlldy5VcGxvYWRlcklubGluZSh7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRzdGF0dXM6ICAgICBmYWxzZSxcblx0XHRcdG1lc3NhZ2U6ICAgIHRoaXMuY29udHJvbGxlci5pc01vZGVBY3RpdmUoICdncmlkJyApID8gJycgOiBsMTBuLm5vSXRlbXNGb3VuZCxcblx0XHRcdGNhbkNsb3NlOiAgIHRoaXMuY29udHJvbGxlci5pc01vZGVBY3RpdmUoICdncmlkJyApXG5cdFx0fSk7XG5cblx0XHR0aGlzLnVwbG9hZGVyLmhpZGUoKTtcblx0XHR0aGlzLnZpZXdzLmFkZCggdGhpcy51cGxvYWRlciApO1xuXHR9LFxuXG5cdHRvZ2dsZVVwbG9hZGVyOiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMudXBsb2FkZXIuJGVsLmhhc0NsYXNzKCAnaGlkZGVuJyApICkge1xuXHRcdFx0dGhpcy51cGxvYWRlci5zaG93KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudXBsb2FkZXIuaGlkZSgpO1xuXHRcdH1cblx0fSxcblxuXHRjcmVhdGVBdHRhY2htZW50czogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5hdHRhY2htZW50cyA9IG5ldyB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRzKHtcblx0XHRcdGNvbnRyb2xsZXI6ICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRjb2xsZWN0aW9uOiAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uLFxuXHRcdFx0c2VsZWN0aW9uOiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zZWxlY3Rpb24sXG5cdFx0XHRtb2RlbDogICAgICAgICAgICAgICAgdGhpcy5tb2RlbCxcblx0XHRcdHNvcnRhYmxlOiAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuc29ydGFibGUsXG5cdFx0XHRzY3JvbGxFbGVtZW50OiAgICAgICAgdGhpcy5vcHRpb25zLnNjcm9sbEVsZW1lbnQsXG5cdFx0XHRpZGVhbENvbHVtbldpZHRoOiAgICAgdGhpcy5vcHRpb25zLmlkZWFsQ29sdW1uV2lkdGgsXG5cblx0XHRcdC8vIFRoZSBzaW5nbGUgYEF0dGFjaG1lbnRgIHZpZXcgdG8gYmUgdXNlZCBpbiB0aGUgYEF0dGFjaG1lbnRzYCB2aWV3LlxuXHRcdFx0QXR0YWNobWVudFZpZXc6IHRoaXMub3B0aW9ucy5BdHRhY2htZW50Vmlld1xuXHRcdH0pO1xuXG5cdFx0Ly8gQWRkIGtleWRvd24gbGlzdGVuZXIgdG8gdGhlIGluc3RhbmNlIG9mIHRoZSBBdHRhY2htZW50cyB2aWV3XG5cdFx0dGhpcy5hdHRhY2htZW50cy5saXN0ZW5UbyggdGhpcy5jb250cm9sbGVyLCAnYXR0YWNobWVudDprZXlkb3duOmFycm93JywgICAgIHRoaXMuYXR0YWNobWVudHMuYXJyb3dFdmVudCApO1xuXHRcdHRoaXMuYXR0YWNobWVudHMubGlzdGVuVG8oIHRoaXMuY29udHJvbGxlciwgJ2F0dGFjaG1lbnQ6ZGV0YWlsczpzaGlmdC10YWInLCB0aGlzLmF0dGFjaG1lbnRzLnJlc3RvcmVGb2N1cyApO1xuXG5cdFx0dGhpcy52aWV3cy5hZGQoIHRoaXMuYXR0YWNobWVudHMgKTtcblxuXG5cdFx0aWYgKCB0aGlzLmNvbnRyb2xsZXIuaXNNb2RlQWN0aXZlKCAnZ3JpZCcgKSApIHtcblx0XHRcdHRoaXMuYXR0YWNobWVudHNOb1Jlc3VsdHMgPSBuZXcgVmlldyh7XG5cdFx0XHRcdGNvbnRyb2xsZXI6IHRoaXMuY29udHJvbGxlcixcblx0XHRcdFx0dGFnTmFtZTogJ3AnXG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5hdHRhY2htZW50c05vUmVzdWx0cy4kZWwuYWRkQ2xhc3MoICdoaWRkZW4gbm8tbWVkaWEnICk7XG5cdFx0XHR0aGlzLmF0dGFjaG1lbnRzTm9SZXN1bHRzLiRlbC5odG1sKCBsMTBuLm5vTWVkaWEgKTtcblxuXHRcdFx0dGhpcy52aWV3cy5hZGQoIHRoaXMuYXR0YWNobWVudHNOb1Jlc3VsdHMgKTtcblx0XHR9XG5cdH0sXG5cblx0Y3JlYXRlU2lkZWJhcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG5cdFx0XHRzZWxlY3Rpb24gPSBvcHRpb25zLnNlbGVjdGlvbixcblx0XHRcdHNpZGViYXIgPSB0aGlzLnNpZGViYXIgPSBuZXcgd3AubWVkaWEudmlldy5TaWRlYmFyKHtcblx0XHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyXG5cdFx0XHR9KTtcblxuXHRcdHRoaXMudmlld3MuYWRkKCBzaWRlYmFyICk7XG5cblx0XHRpZiAoIHRoaXMuY29udHJvbGxlci51cGxvYWRlciApIHtcblx0XHRcdHNpZGViYXIuc2V0KCAndXBsb2FkcycsIG5ldyB3cC5tZWRpYS52aWV3LlVwbG9hZGVyU3RhdHVzKHtcblx0XHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRwcmlvcml0eTogICA0MFxuXHRcdFx0fSkgKTtcblx0XHR9XG5cblx0XHRzZWxlY3Rpb24ub24oICdzZWxlY3Rpb246c2luZ2xlJywgdGhpcy5jcmVhdGVTaW5nbGUsIHRoaXMgKTtcblx0XHRzZWxlY3Rpb24ub24oICdzZWxlY3Rpb246dW5zaW5nbGUnLCB0aGlzLmRpc3Bvc2VTaW5nbGUsIHRoaXMgKTtcblxuXHRcdGlmICggc2VsZWN0aW9uLnNpbmdsZSgpICkge1xuXHRcdFx0dGhpcy5jcmVhdGVTaW5nbGUoKTtcblx0XHR9XG5cdH0sXG5cblx0Y3JlYXRlU2luZ2xlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2lkZWJhciA9IHRoaXMuc2lkZWJhcixcblx0XHRcdHNpbmdsZSA9IHRoaXMub3B0aW9ucy5zZWxlY3Rpb24uc2luZ2xlKCk7XG5cblx0XHRzaWRlYmFyLnNldCggJ2RldGFpbHMnLCBuZXcgd3AubWVkaWEudmlldy5BdHRhY2htZW50LkRldGFpbHMoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0bW9kZWw6ICAgICAgc2luZ2xlLFxuXHRcdFx0cHJpb3JpdHk6ICAgODBcblx0XHR9KSApO1xuXG5cdFx0c2lkZWJhci5zZXQoICdjb21wYXQnLCBuZXcgd3AubWVkaWEudmlldy5BdHRhY2htZW50Q29tcGF0KHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMuY29udHJvbGxlcixcblx0XHRcdG1vZGVsOiAgICAgIHNpbmdsZSxcblx0XHRcdHByaW9yaXR5OiAgIDEyMFxuXHRcdH0pICk7XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5kaXNwbGF5ICkge1xuXHRcdFx0c2lkZWJhci5zZXQoICdkaXNwbGF5JywgbmV3IHdwLm1lZGlhLnZpZXcuU2V0dGluZ3MuQXR0YWNobWVudERpc3BsYXkoe1xuXHRcdFx0XHRjb250cm9sbGVyOiAgIHRoaXMuY29udHJvbGxlcixcblx0XHRcdFx0bW9kZWw6ICAgICAgICB0aGlzLm1vZGVsLmRpc3BsYXkoIHNpbmdsZSApLFxuXHRcdFx0XHRhdHRhY2htZW50OiAgIHNpbmdsZSxcblx0XHRcdFx0cHJpb3JpdHk6ICAgICAxNjAsXG5cdFx0XHRcdHVzZXJTZXR0aW5nczogdGhpcy5tb2RlbC5nZXQoJ2Rpc3BsYXlVc2VyU2V0dGluZ3MnKVxuXHRcdFx0fSkgKTtcblx0XHR9XG5cblx0XHQvLyBTaG93IHRoZSBzaWRlYmFyIG9uIG1vYmlsZVxuXHRcdGlmICggdGhpcy5tb2RlbC5pZCA9PT0gJ2luc2VydCcgKSB7XG5cdFx0XHRzaWRlYmFyLiRlbC5hZGRDbGFzcyggJ3Zpc2libGUnICk7XG5cdFx0fVxuXHR9LFxuXG5cdGRpc3Bvc2VTaW5nbGU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzaWRlYmFyID0gdGhpcy5zaWRlYmFyO1xuXHRcdHNpZGViYXIudW5zZXQoJ2RldGFpbHMnKTtcblx0XHRzaWRlYmFyLnVuc2V0KCdjb21wYXQnKTtcblx0XHRzaWRlYmFyLnVuc2V0KCdkaXNwbGF5Jyk7XG5cdFx0Ly8gSGlkZSB0aGUgc2lkZWJhciBvbiBtb2JpbGVcblx0XHRzaWRlYmFyLiRlbC5yZW1vdmVDbGFzcyggJ3Zpc2libGUnICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF0dGFjaG1lbnRzQnJvd3NlcjtcbiIsIi8qZ2xvYmFscyB3cCwgXyAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudHMuU2VsZWN0aW9uXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5BdHRhY2htZW50c1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgQXR0YWNobWVudHMgPSB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRzLFxuXHRTZWxlY3Rpb247XG5cblNlbGVjdGlvbiA9IEF0dGFjaG1lbnRzLmV4dGVuZCh7XG5cdGV2ZW50czoge30sXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdF8uZGVmYXVsdHMoIHRoaXMub3B0aW9ucywge1xuXHRcdFx0c29ydGFibGU6ICAgZmFsc2UsXG5cdFx0XHRyZXNpemU6ICAgICBmYWxzZSxcblxuXHRcdFx0Ly8gVGhlIHNpbmdsZSBgQXR0YWNobWVudGAgdmlldyB0byBiZSB1c2VkIGluIHRoZSBgQXR0YWNobWVudHNgIHZpZXcuXG5cdFx0XHRBdHRhY2htZW50Vmlldzogd3AubWVkaWEudmlldy5BdHRhY2htZW50LlNlbGVjdGlvblxuXHRcdH0pO1xuXHRcdC8vIENhbGwgJ2luaXRpYWxpemUnIGRpcmVjdGx5IG9uIHRoZSBwYXJlbnQgY2xhc3MuXG5cdFx0cmV0dXJuIEF0dGFjaG1lbnRzLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0aW9uO1xuIiwiLypnbG9iYWxzIF8sIEJhY2tib25lICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5CdXR0b25Hcm91cFxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgJCA9IEJhY2tib25lLiQsXG5cdEJ1dHRvbkdyb3VwO1xuXG5CdXR0b25Hcm91cCA9IHdwLm1lZGlhLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogICAnZGl2Jyxcblx0Y2xhc3NOYW1lOiAnYnV0dG9uLWdyb3VwIGJ1dHRvbi1sYXJnZSBtZWRpYS1idXR0b24tZ3JvdXAnLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdC8qKlxuXHRcdCAqIEBtZW1iZXIge3dwLm1lZGlhLnZpZXcuQnV0dG9uW119XG5cdFx0ICovXG5cdFx0dGhpcy5idXR0b25zID0gXy5tYXAoIHRoaXMub3B0aW9ucy5idXR0b25zIHx8IFtdLCBmdW5jdGlvbiggYnV0dG9uICkge1xuXHRcdFx0aWYgKCBidXR0b24gaW5zdGFuY2VvZiBCYWNrYm9uZS5WaWV3ICkge1xuXHRcdFx0XHRyZXR1cm4gYnV0dG9uO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG5ldyB3cC5tZWRpYS52aWV3LkJ1dHRvbiggYnV0dG9uICkucmVuZGVyKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRkZWxldGUgdGhpcy5vcHRpb25zLmJ1dHRvbnM7XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5jbGFzc2VzICkge1xuXHRcdFx0dGhpcy4kZWwuYWRkQ2xhc3MoIHRoaXMub3B0aW9ucy5jbGFzc2VzICk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5CdXR0b25Hcm91cH1cblx0ICovXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZWwuaHRtbCggJCggXy5wbHVjayggdGhpcy5idXR0b25zLCAnZWwnICkgKS5kZXRhY2goKSApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCdXR0b25Hcm91cDtcbiIsIi8qZ2xvYmFscyBfLCBCYWNrYm9uZSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuQnV0dG9uXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBCdXR0b24gPSB3cC5tZWRpYS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAgICdidXR0b24nLFxuXHRjbGFzc05hbWU6ICAnbWVkaWEtYnV0dG9uJyxcblx0YXR0cmlidXRlczogeyB0eXBlOiAnYnV0dG9uJyB9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayc6ICdjbGljaydcblx0fSxcblxuXHRkZWZhdWx0czoge1xuXHRcdHRleHQ6ICAgICAnJyxcblx0XHRzdHlsZTogICAgJycsXG5cdFx0c2l6ZTogICAgICdsYXJnZScsXG5cdFx0ZGlzYWJsZWQ6IGZhbHNlXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlIGEgbW9kZWwgd2l0aCB0aGUgcHJvdmlkZWQgYGRlZmF1bHRzYC5cblx0XHQgKlxuXHRcdCAqIEBtZW1iZXIge0JhY2tib25lLk1vZGVsfVxuXHRcdCAqL1xuXHRcdHRoaXMubW9kZWwgPSBuZXcgQmFja2JvbmUuTW9kZWwoIHRoaXMuZGVmYXVsdHMgKTtcblxuXHRcdC8vIElmIGFueSBvZiB0aGUgYG9wdGlvbnNgIGhhdmUgYSBrZXkgZnJvbSBgZGVmYXVsdHNgLCBhcHBseSBpdHNcblx0XHQvLyB2YWx1ZSB0byB0aGUgYG1vZGVsYCBhbmQgcmVtb3ZlIGl0IGZyb20gdGhlIGBvcHRpb25zIG9iamVjdC5cblx0XHRfLmVhY2goIHRoaXMuZGVmYXVsdHMsIGZ1bmN0aW9uKCBkZWYsIGtleSApIHtcblx0XHRcdHZhciB2YWx1ZSA9IHRoaXMub3B0aW9uc1sga2V5IF07XG5cdFx0XHRpZiAoIF8uaXNVbmRlZmluZWQoIHZhbHVlICkgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5tb2RlbC5zZXQoIGtleSwgdmFsdWUgKTtcblx0XHRcdGRlbGV0ZSB0aGlzLm9wdGlvbnNbIGtleSBdO1xuXHRcdH0sIHRoaXMgKTtcblxuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdjaGFuZ2UnLCB0aGlzLnJlbmRlciApO1xuXHR9LFxuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuQnV0dG9ufSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgY2xhc3NlcyA9IFsgJ2J1dHRvbicsIHRoaXMuY2xhc3NOYW1lIF0sXG5cdFx0XHRtb2RlbCA9IHRoaXMubW9kZWwudG9KU09OKCk7XG5cblx0XHRpZiAoIG1vZGVsLnN0eWxlICkge1xuXHRcdFx0Y2xhc3Nlcy5wdXNoKCAnYnV0dG9uLScgKyBtb2RlbC5zdHlsZSApO1xuXHRcdH1cblxuXHRcdGlmICggbW9kZWwuc2l6ZSApIHtcblx0XHRcdGNsYXNzZXMucHVzaCggJ2J1dHRvbi0nICsgbW9kZWwuc2l6ZSApO1xuXHRcdH1cblxuXHRcdGNsYXNzZXMgPSBfLnVuaXEoIGNsYXNzZXMuY29uY2F0KCB0aGlzLm9wdGlvbnMuY2xhc3NlcyApICk7XG5cdFx0dGhpcy5lbC5jbGFzc05hbWUgPSBjbGFzc2VzLmpvaW4oJyAnKTtcblxuXHRcdHRoaXMuJGVsLmF0dHIoICdkaXNhYmxlZCcsIG1vZGVsLmRpc2FibGVkICk7XG5cdFx0dGhpcy4kZWwudGV4dCggdGhpcy5tb2RlbC5nZXQoJ3RleHQnKSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcblx0ICovXG5cdGNsaWNrOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0aWYgKCAnIycgPT09IHRoaXMuYXR0cmlidXRlcy5ocmVmICkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5jbGljayAmJiAhIHRoaXMubW9kZWwuZ2V0KCdkaXNhYmxlZCcpICkge1xuXHRcdFx0dGhpcy5vcHRpb25zLmNsaWNrLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1dHRvbjtcbiIsIi8qZ2xvYmFscyB3cCwgXywgalF1ZXJ5ICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5Dcm9wcGVyXG4gKlxuICogVXNlcyB0aGUgaW1nQXJlYVNlbGVjdCBwbHVnaW4gdG8gYWxsb3cgYSB1c2VyIHRvIGNyb3AgYW4gaW1hZ2UuXG4gKlxuICogVGFrZXMgaW1nQXJlYVNlbGVjdCBvcHRpb25zIGZyb21cbiAqIHdwLmN1c3RvbWl6ZS5IZWFkZXJDb250cm9sLmNhbGN1bGF0ZUltYWdlU2VsZWN0T3B0aW9ucyB2aWFcbiAqIHdwLmN1c3RvbWl6ZS5IZWFkZXJDb250cm9sLm9wZW5NTS5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFZpZXcgPSB3cC5tZWRpYS5WaWV3LFxuXHRVcGxvYWRlclN0YXR1cyA9IHdwLm1lZGlhLnZpZXcuVXBsb2FkZXJTdGF0dXMsXG5cdGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdCQgPSBqUXVlcnksXG5cdENyb3BwZXI7XG5cbkNyb3BwZXIgPSBWaWV3LmV4dGVuZCh7XG5cdGNsYXNzTmFtZTogJ2Nyb3AtY29udGVudCcsXG5cdHRlbXBsYXRlOiB3cC50ZW1wbGF0ZSgnY3JvcC1jb250ZW50JyksXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdF8uYmluZEFsbCh0aGlzLCAnb25JbWFnZUxvYWQnKTtcblx0fSxcblx0cmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuY29udHJvbGxlci5mcmFtZS5vbignY29udGVudDplcnJvcjpjcm9wJywgdGhpcy5vbkVycm9yLCB0aGlzKTtcblx0XHR0aGlzLiRpbWFnZSA9IHRoaXMuJGVsLmZpbmQoJy5jcm9wLWltYWdlJyk7XG5cdFx0dGhpcy4kaW1hZ2Uub24oJ2xvYWQnLCB0aGlzLm9uSW1hZ2VMb2FkKTtcblx0XHQkKHdpbmRvdykub24oJ3Jlc2l6ZS5jcm9wcGVyJywgXy5kZWJvdW5jZSh0aGlzLm9uSW1hZ2VMb2FkLCAyNTApKTtcblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbigpIHtcblx0XHQkKHdpbmRvdykub2ZmKCdyZXNpemUuY3JvcHBlcicpO1xuXHRcdHRoaXMuJGVsLnJlbW92ZSgpO1xuXHRcdHRoaXMuJGVsLm9mZigpO1xuXHRcdFZpZXcucHJvdG90eXBlLnJlbW92ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHR9LFxuXHRwcmVwYXJlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dGl0bGU6IGwxMG4uY3JvcFlvdXJJbWFnZSxcblx0XHRcdHVybDogdGhpcy5vcHRpb25zLmF0dGFjaG1lbnQuZ2V0KCd1cmwnKVxuXHRcdH07XG5cdH0sXG5cdG9uSW1hZ2VMb2FkOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgaW1nT3B0aW9ucyA9IHRoaXMuY29udHJvbGxlci5nZXQoJ2ltZ1NlbGVjdE9wdGlvbnMnKTtcblx0XHRpZiAodHlwZW9mIGltZ09wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGltZ09wdGlvbnMgPSBpbWdPcHRpb25zKHRoaXMub3B0aW9ucy5hdHRhY2htZW50LCB0aGlzLmNvbnRyb2xsZXIpO1xuXHRcdH1cblxuXHRcdGltZ09wdGlvbnMgPSBfLmV4dGVuZChpbWdPcHRpb25zLCB7cGFyZW50OiB0aGlzLiRlbH0pO1xuXHRcdHRoaXMudHJpZ2dlcignaW1hZ2UtbG9hZGVkJyk7XG5cdFx0dGhpcy5jb250cm9sbGVyLmltZ1NlbGVjdCA9IHRoaXMuJGltYWdlLmltZ0FyZWFTZWxlY3QoaW1nT3B0aW9ucyk7XG5cdH0sXG5cdG9uRXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBmaWxlbmFtZSA9IHRoaXMub3B0aW9ucy5hdHRhY2htZW50LmdldCgnZmlsZW5hbWUnKTtcblxuXHRcdHRoaXMudmlld3MuYWRkKCAnLnVwbG9hZC1lcnJvcnMnLCBuZXcgd3AubWVkaWEudmlldy5VcGxvYWRlclN0YXR1c0Vycm9yKHtcblx0XHRcdGZpbGVuYW1lOiBVcGxvYWRlclN0YXR1cy5wcm90b3R5cGUuZmlsZW5hbWUoZmlsZW5hbWUpLFxuXHRcdFx0bWVzc2FnZTogd2luZG93Ll93cE1lZGlhVmlld3NMMTBuLmNyb3BFcnJvclxuXHRcdH0pLCB7IGF0OiAwIH0pO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBDcm9wcGVyO1xuIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5FZGl0SW1hZ2VcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFZpZXcgPSB3cC5tZWRpYS5WaWV3LFxuXHRFZGl0SW1hZ2U7XG5cbkVkaXRJbWFnZSA9IFZpZXcuZXh0ZW5kKHtcblx0Y2xhc3NOYW1lOiAnaW1hZ2UtZWRpdG9yJyxcblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCdpbWFnZS1lZGl0b3InKSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHR0aGlzLmVkaXRvciA9IHdpbmRvdy5pbWFnZUVkaXQ7XG5cdFx0dGhpcy5jb250cm9sbGVyID0gb3B0aW9ucy5jb250cm9sbGVyO1xuXHRcdFZpZXcucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdHByZXBhcmU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLm1vZGVsLnRvSlNPTigpO1xuXHR9LFxuXG5cdGxvYWRFZGl0b3I6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkZmQgPSB0aGlzLmVkaXRvci5vcGVuKCB0aGlzLm1vZGVsLmdldCgnaWQnKSwgdGhpcy5tb2RlbC5nZXQoJ25vbmNlcycpLmVkaXQsIHRoaXMgKTtcblx0XHRkZmQuZG9uZSggXy5iaW5kKCB0aGlzLmZvY3VzLCB0aGlzICkgKTtcblx0fSxcblxuXHRmb2N1czogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kKCAnLmltZ2VkaXQtc3VibWl0IC5idXR0b24nICkuZXEoIDAgKS5mb2N1cygpO1xuXHR9LFxuXG5cdGJhY2s6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBsYXN0U3RhdGUgPSB0aGlzLmNvbnRyb2xsZXIubGFzdFN0YXRlKCk7XG5cdFx0dGhpcy5jb250cm9sbGVyLnNldFN0YXRlKCBsYXN0U3RhdGUgKTtcblx0fSxcblxuXHRyZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm1vZGVsLmZldGNoKCk7XG5cdH0sXG5cblx0c2F2ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGxhc3RTdGF0ZSA9IHRoaXMuY29udHJvbGxlci5sYXN0U3RhdGUoKTtcblxuXHRcdHRoaXMubW9kZWwuZmV0Y2goKS5kb25lKCBfLmJpbmQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5jb250cm9sbGVyLnNldFN0YXRlKCBsYXN0U3RhdGUgKTtcblx0XHR9LCB0aGlzICkgKTtcblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0SW1hZ2U7XG4iLCIvKipcbiAqIHdwLm1lZGlhLnZpZXcuRW1iZWRcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIEVtYmVkID0gd3AubWVkaWEuVmlldy5leHRlbmQoe1xuXHRjbGFzc05hbWU6ICdtZWRpYS1lbWJlZCcsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0LyoqXG5cdFx0ICogQG1lbWJlciB7d3AubWVkaWEudmlldy5FbWJlZFVybH1cblx0XHQgKi9cblx0XHR0aGlzLnVybCA9IG5ldyB3cC5tZWRpYS52aWV3LkVtYmVkVXJsKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMuY29udHJvbGxlcixcblx0XHRcdG1vZGVsOiAgICAgIHRoaXMubW9kZWwucHJvcHNcblx0XHR9KS5yZW5kZXIoKTtcblxuXHRcdHRoaXMudmlld3Muc2V0KFsgdGhpcy51cmwgXSk7XG5cdFx0dGhpcy5yZWZyZXNoKCk7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZTp0eXBlJywgdGhpcy5yZWZyZXNoICk7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZTpsb2FkaW5nJywgdGhpcy5sb2FkaW5nICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSB2aWV3XG5cdCAqL1xuXHRzZXR0aW5nczogZnVuY3Rpb24oIHZpZXcgKSB7XG5cdFx0aWYgKCB0aGlzLl9zZXR0aW5ncyApIHtcblx0XHRcdHRoaXMuX3NldHRpbmdzLnJlbW92ZSgpO1xuXHRcdH1cblx0XHR0aGlzLl9zZXR0aW5ncyA9IHZpZXc7XG5cdFx0dGhpcy52aWV3cy5hZGQoIHZpZXcgKTtcblx0fSxcblxuXHRyZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdHlwZSA9IHRoaXMubW9kZWwuZ2V0KCd0eXBlJyksXG5cdFx0XHRjb25zdHJ1Y3RvcjtcblxuXHRcdGlmICggJ2ltYWdlJyA9PT0gdHlwZSApIHtcblx0XHRcdGNvbnN0cnVjdG9yID0gd3AubWVkaWEudmlldy5FbWJlZEltYWdlO1xuXHRcdH0gZWxzZSBpZiAoICdsaW5rJyA9PT0gdHlwZSApIHtcblx0XHRcdGNvbnN0cnVjdG9yID0gd3AubWVkaWEudmlldy5FbWJlZExpbms7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnNldHRpbmdzKCBuZXcgY29uc3RydWN0b3Ioe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0bW9kZWw6ICAgICAgdGhpcy5tb2RlbC5wcm9wcyxcblx0XHRcdHByaW9yaXR5OiAgIDQwXG5cdFx0fSkgKTtcblx0fSxcblxuXHRsb2FkaW5nOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiRlbC50b2dnbGVDbGFzcyggJ2VtYmVkLWxvYWRpbmcnLCB0aGlzLm1vZGVsLmdldCgnbG9hZGluZycpICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtYmVkO1xuIiwiLypnbG9iYWxzIHdwICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5FbWJlZEltYWdlXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5TZXR0aW5ncy5BdHRhY2htZW50RGlzcGxheVxuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuU2V0dGluZ3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIEF0dGFjaG1lbnREaXNwbGF5ID0gd3AubWVkaWEudmlldy5TZXR0aW5ncy5BdHRhY2htZW50RGlzcGxheSxcblx0RW1iZWRJbWFnZTtcblxuRW1iZWRJbWFnZSA9IEF0dGFjaG1lbnREaXNwbGF5LmV4dGVuZCh7XG5cdGNsYXNzTmFtZTogJ2VtYmVkLW1lZGlhLXNldHRpbmdzJyxcblx0dGVtcGxhdGU6ICB3cC50ZW1wbGF0ZSgnZW1iZWQtaW1hZ2Utc2V0dGluZ3MnKSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHQvKipcblx0XHQgKiBDYWxsIGBpbml0aWFsaXplYCBkaXJlY3RseSBvbiBwYXJlbnQgY2xhc3Mgd2l0aCBwYXNzZWQgYXJndW1lbnRzXG5cdFx0ICovXG5cdFx0QXR0YWNobWVudERpc3BsYXkucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdjaGFuZ2U6dXJsJywgdGhpcy51cGRhdGVJbWFnZSApO1xuXHR9LFxuXG5cdHVwZGF0ZUltYWdlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiQoJ2ltZycpLmF0dHIoICdzcmMnLCB0aGlzLm1vZGVsLmdldCgndXJsJykgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRW1iZWRJbWFnZTtcbiIsIi8qZ2xvYmFscyB3cCwgXywgalF1ZXJ5ICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5FbWJlZExpbmtcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LlNldHRpbmdzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciAkID0galF1ZXJ5LFxuXHRFbWJlZExpbms7XG5cbkVtYmVkTGluayA9IHdwLm1lZGlhLnZpZXcuU2V0dGluZ3MuZXh0ZW5kKHtcblx0Y2xhc3NOYW1lOiAnZW1iZWQtbGluay1zZXR0aW5ncycsXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoJ2VtYmVkLWxpbmstc2V0dGluZ3MnKSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnY2hhbmdlOnVybCcsIHRoaXMudXBkYXRlb0VtYmVkICk7XG5cdH0sXG5cblx0dXBkYXRlb0VtYmVkOiBfLmRlYm91bmNlKCBmdW5jdGlvbigpIHtcblx0XHR2YXIgdXJsID0gdGhpcy5tb2RlbC5nZXQoICd1cmwnICk7XG5cblx0XHQvLyBjbGVhciBvdXQgcHJldmlvdXMgcmVzdWx0c1xuXHRcdHRoaXMuJCgnLmVtYmVkLWNvbnRhaW5lcicpLmhpZGUoKS5maW5kKCcuZW1iZWQtcHJldmlldycpLmVtcHR5KCk7XG5cdFx0dGhpcy4kKCAnLnNldHRpbmcnICkuaGlkZSgpO1xuXG5cdFx0Ly8gb25seSBwcm9jZWVkIHdpdGggZW1iZWQgaWYgdGhlIGZpZWxkIGNvbnRhaW5zIG1vcmUgdGhhbiAxMSBjaGFyYWN0ZXJzXG5cdFx0Ly8gRXhhbXBsZTogaHR0cDovL2EuaW8gaXMgMTEgY2hhcnNcblx0XHRpZiAoIHVybCAmJiAoIHVybC5sZW5ndGggPCAxMSB8fCAhIHVybC5tYXRjaCgvXmh0dHAocyk/OlxcL1xcLy8pICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5mZXRjaCgpO1xuXHR9LCB3cC5tZWRpYS5jb250cm9sbGVyLkVtYmVkLnNlbnNpdGl2aXR5ICksXG5cblx0ZmV0Y2g6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBlbWJlZDtcblxuXHRcdC8vIGNoZWNrIGlmIHRoZXkgaGF2ZW4ndCB0eXBlZCBpbiA1MDAgbXNcblx0XHRpZiAoICQoJyNlbWJlZC11cmwtZmllbGQnKS52YWwoKSAhPT0gdGhpcy5tb2RlbC5nZXQoJ3VybCcpICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5kZmQgJiYgJ3BlbmRpbmcnID09PSB0aGlzLmRmZC5zdGF0ZSgpICkge1xuXHRcdFx0dGhpcy5kZmQuYWJvcnQoKTtcblx0XHR9XG5cblx0XHRlbWJlZCA9IG5ldyB3cC5zaG9ydGNvZGUoe1xuXHRcdFx0dGFnOiAnZW1iZWQnLFxuXHRcdFx0YXR0cnM6IF8ucGljayggdGhpcy5tb2RlbC5hdHRyaWJ1dGVzLCBbICd3aWR0aCcsICdoZWlnaHQnLCAnc3JjJyBdICksXG5cdFx0XHRjb250ZW50OiB0aGlzLm1vZGVsLmdldCgndXJsJylcblx0XHR9KTtcblxuXHRcdHRoaXMuZGZkID0gJC5hamF4KHtcblx0XHRcdHR5cGU6ICAgICdQT1NUJyxcblx0XHRcdHVybDogICAgIHdwLmFqYXguc2V0dGluZ3MudXJsLFxuXHRcdFx0Y29udGV4dDogdGhpcyxcblx0XHRcdGRhdGE6ICAgIHtcblx0XHRcdFx0YWN0aW9uOiAncGFyc2UtZW1iZWQnLFxuXHRcdFx0XHRwb3N0X0lEOiB3cC5tZWRpYS52aWV3LnNldHRpbmdzLnBvc3QuaWQsXG5cdFx0XHRcdHNob3J0Y29kZTogZW1iZWQuc3RyaW5nKClcblx0XHRcdH1cblx0XHR9KVxuXHRcdFx0LmRvbmUoIHRoaXMucmVuZGVyb0VtYmVkIClcblx0XHRcdC5mYWlsKCB0aGlzLnJlbmRlckZhaWwgKTtcblx0fSxcblxuXHRyZW5kZXJGYWlsOiBmdW5jdGlvbiAoIHJlc3BvbnNlLCBzdGF0dXMgKSB7XG5cdFx0aWYgKCAnYWJvcnQnID09PSBzdGF0dXMgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRoaXMuJCggJy5saW5rLXRleHQnICkuc2hvdygpO1xuXHR9LFxuXG5cdHJlbmRlcm9FbWJlZDogZnVuY3Rpb24oIHJlc3BvbnNlICkge1xuXHRcdHZhciBodG1sID0gKCByZXNwb25zZSAmJiByZXNwb25zZS5kYXRhICYmIHJlc3BvbnNlLmRhdGEuYm9keSApIHx8ICcnO1xuXG5cdFx0aWYgKCBodG1sICkge1xuXHRcdFx0dGhpcy4kKCcuZW1iZWQtY29udGFpbmVyJykuc2hvdygpLmZpbmQoJy5lbWJlZC1wcmV2aWV3JykuaHRtbCggaHRtbCApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnJlbmRlckZhaWwoKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtYmVkTGluaztcbiIsIi8qZ2xvYmFscyB3cCwgXywgalF1ZXJ5ICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5FbWJlZFVybFxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgVmlldyA9IHdwLm1lZGlhLlZpZXcsXG5cdCQgPSBqUXVlcnksXG5cdEVtYmVkVXJsO1xuXG5FbWJlZFVybCA9IFZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogICAnbGFiZWwnLFxuXHRjbGFzc05hbWU6ICdlbWJlZC11cmwnLFxuXG5cdGV2ZW50czoge1xuXHRcdCdpbnB1dCc6ICAndXJsJyxcblx0XHQna2V5dXAnOiAgJ3VybCcsXG5cdFx0J2NoYW5nZSc6ICd1cmwnXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kaW5wdXQgPSAkKCc8aW5wdXQgaWQ9XCJlbWJlZC11cmwtZmllbGRcIiB0eXBlPVwidXJsXCIgLz4nKS52YWwoIHRoaXMubW9kZWwuZ2V0KCd1cmwnKSApO1xuXHRcdHRoaXMuaW5wdXQgPSB0aGlzLiRpbnB1dFswXTtcblxuXHRcdHRoaXMuc3Bpbm5lciA9ICQoJzxzcGFuIGNsYXNzPVwic3Bpbm5lclwiIC8+JylbMF07XG5cdFx0dGhpcy4kZWwuYXBwZW5kKFsgdGhpcy5pbnB1dCwgdGhpcy5zcGlubmVyIF0pO1xuXG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZTp1cmwnLCB0aGlzLnJlbmRlciApO1xuXG5cdFx0aWYgKCB0aGlzLm1vZGVsLmdldCggJ3VybCcgKSApIHtcblx0XHRcdF8uZGVsYXkoIF8uYmluZCggZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR0aGlzLm1vZGVsLnRyaWdnZXIoICdjaGFuZ2U6dXJsJyApO1xuXHRcdFx0fSwgdGhpcyApLCA1MDAgKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5FbWJlZFVybH0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRpbnB1dCA9IHRoaXMuJGlucHV0O1xuXG5cdFx0aWYgKCAkaW5wdXQuaXMoJzpmb2N1cycpICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuaW5wdXQudmFsdWUgPSB0aGlzLm1vZGVsLmdldCgndXJsJykgfHwgJ2h0dHA6Ly8nO1xuXHRcdC8qKlxuXHRcdCAqIENhbGwgYHJlbmRlcmAgZGlyZWN0bHkgb24gcGFyZW50IGNsYXNzIHdpdGggcGFzc2VkIGFyZ3VtZW50c1xuXHRcdCAqL1xuXHRcdFZpZXcucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0cmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggISB3cC5tZWRpYS5pc1RvdWNoRGV2aWNlICkge1xuXHRcdFx0dGhpcy5mb2N1cygpO1xuXHRcdH1cblx0fSxcblxuXHR1cmw6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR0aGlzLm1vZGVsLnNldCggJ3VybCcsIGV2ZW50LnRhcmdldC52YWx1ZSApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBJZiB0aGUgaW5wdXQgaXMgdmlzaWJsZSwgZm9jdXMgYW5kIHNlbGVjdCBpdHMgY29udGVudHMuXG5cdCAqL1xuXHRmb2N1czogZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRpbnB1dCA9IHRoaXMuJGlucHV0O1xuXHRcdGlmICggJGlucHV0LmlzKCc6dmlzaWJsZScpICkge1xuXHRcdFx0JGlucHV0LmZvY3VzKClbMF0uc2VsZWN0KCk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbWJlZFVybDtcbiIsIi8qKlxuICogd3AubWVkaWEudmlldy5Gb2N1c01hbmFnZXJcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIEZvY3VzTWFuYWdlciA9IHdwLm1lZGlhLlZpZXcuZXh0ZW5kKHtcblxuXHRldmVudHM6IHtcblx0XHQna2V5ZG93bic6ICdjb25zdHJhaW5UYWJiaW5nJ1xuXHR9LFxuXG5cdGZvY3VzOiBmdW5jdGlvbigpIHsgLy8gUmVzZXQgZm9jdXMgb24gZmlyc3QgbGVmdCBtZW51IGl0ZW1cblx0XHR0aGlzLiQoJy5tZWRpYS1tZW51LWl0ZW0nKS5maXJzdCgpLmZvY3VzKCk7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcblx0ICovXG5cdGNvbnN0cmFpblRhYmJpbmc6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR2YXIgdGFiYmFibGVzO1xuXG5cdFx0Ly8gTG9vayBmb3IgdGhlIHRhYiBrZXkuXG5cdFx0aWYgKCA5ICE9PSBldmVudC5rZXlDb2RlICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFNraXAgdGhlIGZpbGUgaW5wdXQgYWRkZWQgYnkgUGx1cGxvYWQuXG5cdFx0dGFiYmFibGVzID0gdGhpcy4kKCAnOnRhYmJhYmxlJyApLm5vdCggJy5tb3hpZS1zaGltIGlucHV0W3R5cGU9XCJmaWxlXCJdJyApO1xuXG5cdFx0Ly8gS2VlcCB0YWIgZm9jdXMgd2l0aGluIG1lZGlhIG1vZGFsIHdoaWxlIGl0J3Mgb3BlblxuXHRcdGlmICggdGFiYmFibGVzLmxhc3QoKVswXSA9PT0gZXZlbnQudGFyZ2V0ICYmICEgZXZlbnQuc2hpZnRLZXkgKSB7XG5cdFx0XHR0YWJiYWJsZXMuZmlyc3QoKS5mb2N1cygpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoIHRhYmJhYmxlcy5maXJzdCgpWzBdID09PSBldmVudC50YXJnZXQgJiYgZXZlbnQuc2hpZnRLZXkgKSB7XG5cdFx0XHR0YWJiYWJsZXMubGFzdCgpLmZvY3VzKCk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvY3VzTWFuYWdlcjtcbiIsIi8qZ2xvYmFscyBfLCBCYWNrYm9uZSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuRnJhbWVcbiAqXG4gKiBBIGZyYW1lIGlzIGEgY29tcG9zaXRlIHZpZXcgY29uc2lzdGluZyBvZiBvbmUgb3IgbW9yZSByZWdpb25zIGFuZCBvbmUgb3IgbW9yZVxuICogc3RhdGVzLlxuICpcbiAqIEBzZWUgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZVxuICogQHNlZSB3cC5tZWRpYS5jb250cm9sbGVyLlJlZ2lvblxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICogQG1peGVzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVNYWNoaW5lXG4gKi9cbnZhciBGcmFtZSA9IHdwLm1lZGlhLlZpZXcuZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0Xy5kZWZhdWx0cyggdGhpcy5vcHRpb25zLCB7XG5cdFx0XHRtb2RlOiBbICdzZWxlY3QnIF1cblx0XHR9KTtcblx0XHR0aGlzLl9jcmVhdGVSZWdpb25zKCk7XG5cdFx0dGhpcy5fY3JlYXRlU3RhdGVzKCk7XG5cdFx0dGhpcy5fY3JlYXRlTW9kZXMoKTtcblx0fSxcblxuXHRfY3JlYXRlUmVnaW9uczogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gQ2xvbmUgdGhlIHJlZ2lvbnMgYXJyYXkuXG5cdFx0dGhpcy5yZWdpb25zID0gdGhpcy5yZWdpb25zID8gdGhpcy5yZWdpb25zLnNsaWNlKCkgOiBbXTtcblxuXHRcdC8vIEluaXRpYWxpemUgcmVnaW9ucy5cblx0XHRfLmVhY2goIHRoaXMucmVnaW9ucywgZnVuY3Rpb24oIHJlZ2lvbiApIHtcblx0XHRcdHRoaXNbIHJlZ2lvbiBdID0gbmV3IHdwLm1lZGlhLmNvbnRyb2xsZXIuUmVnaW9uKHtcblx0XHRcdFx0dmlldzogICAgIHRoaXMsXG5cdFx0XHRcdGlkOiAgICAgICByZWdpb24sXG5cdFx0XHRcdHNlbGVjdG9yOiAnLm1lZGlhLWZyYW1lLScgKyByZWdpb25cblx0XHRcdH0pO1xuXHRcdH0sIHRoaXMgKTtcblx0fSxcblx0LyoqXG5cdCAqIENyZWF0ZSB0aGUgZnJhbWUncyBzdGF0ZXMuXG5cdCAqXG5cdCAqIEBzZWUgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZVxuXHQgKiBAc2VlIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVNYWNoaW5lXG5cdCAqXG5cdCAqIEBmaXJlcyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlI3JlYWR5XG5cdCAqL1xuXHRfY3JlYXRlU3RhdGVzOiBmdW5jdGlvbigpIHtcblx0XHQvLyBDcmVhdGUgdGhlIGRlZmF1bHQgYHN0YXRlc2AgY29sbGVjdGlvbi5cblx0XHR0aGlzLnN0YXRlcyA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKCBudWxsLCB7XG5cdFx0XHRtb2RlbDogd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZVxuXHRcdH0pO1xuXG5cdFx0Ly8gRW5zdXJlIHN0YXRlcyBoYXZlIGEgcmVmZXJlbmNlIHRvIHRoZSBmcmFtZS5cblx0XHR0aGlzLnN0YXRlcy5vbiggJ2FkZCcsIGZ1bmN0aW9uKCBtb2RlbCApIHtcblx0XHRcdG1vZGVsLmZyYW1lID0gdGhpcztcblx0XHRcdG1vZGVsLnRyaWdnZXIoJ3JlYWR5Jyk7XG5cdFx0fSwgdGhpcyApO1xuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuc3RhdGVzICkge1xuXHRcdFx0dGhpcy5zdGF0ZXMuYWRkKCB0aGlzLm9wdGlvbnMuc3RhdGVzICk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBBIGZyYW1lIGNhbiBiZSBpbiBhIG1vZGUgb3IgbXVsdGlwbGUgbW9kZXMgYXQgb25lIHRpbWUuXG5cdCAqXG5cdCAqIEZvciBleGFtcGxlLCB0aGUgbWFuYWdlIG1lZGlhIGZyYW1lIGNhbiBiZSBpbiB0aGUgYEJ1bGsgU2VsZWN0YCBvciBgRWRpdGAgbW9kZS5cblx0ICovXG5cdF9jcmVhdGVNb2RlczogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gU3RvcmUgYWN0aXZlIFwibW9kZXNcIiB0aGF0IHRoZSBmcmFtZSBpcyBpbi4gVW5yZWxhdGVkIHRvIHJlZ2lvbiBtb2Rlcy5cblx0XHR0aGlzLmFjdGl2ZU1vZGVzID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKTtcblx0XHR0aGlzLmFjdGl2ZU1vZGVzLm9uKCAnYWRkIHJlbW92ZSByZXNldCcsIF8uYmluZCggdGhpcy50cmlnZ2VyTW9kZUV2ZW50cywgdGhpcyApICk7XG5cblx0XHRfLmVhY2goIHRoaXMub3B0aW9ucy5tb2RlLCBmdW5jdGlvbiggbW9kZSApIHtcblx0XHRcdHRoaXMuYWN0aXZhdGVNb2RlKCBtb2RlICk7XG5cdFx0fSwgdGhpcyApO1xuXHR9LFxuXHQvKipcblx0ICogUmVzZXQgYWxsIHN0YXRlcyBvbiB0aGUgZnJhbWUgdG8gdGhlaXIgZGVmYXVsdHMuXG5cdCAqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LkZyYW1lfSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0cmVzZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc3RhdGVzLmludm9rZSggJ3RyaWdnZXInLCAncmVzZXQnICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdC8qKlxuXHQgKiBNYXAgYWN0aXZlTW9kZSBjb2xsZWN0aW9uIGV2ZW50cyB0byB0aGUgZnJhbWUuXG5cdCAqL1xuXHR0cmlnZ2VyTW9kZUV2ZW50czogZnVuY3Rpb24oIG1vZGVsLCBjb2xsZWN0aW9uLCBvcHRpb25zICkge1xuXHRcdHZhciBjb2xsZWN0aW9uRXZlbnQsXG5cdFx0XHRtb2RlRXZlbnRNYXAgPSB7XG5cdFx0XHRcdGFkZDogJ2FjdGl2YXRlJyxcblx0XHRcdFx0cmVtb3ZlOiAnZGVhY3RpdmF0ZSdcblx0XHRcdH0sXG5cdFx0XHRldmVudFRvVHJpZ2dlcjtcblx0XHQvLyBQcm9iYWJseSBhIGJldHRlciB3YXkgdG8gZG8gdGhpcy5cblx0XHRfLmVhY2goIG9wdGlvbnMsIGZ1bmN0aW9uKCB2YWx1ZSwga2V5ICkge1xuXHRcdFx0aWYgKCB2YWx1ZSApIHtcblx0XHRcdFx0Y29sbGVjdGlvbkV2ZW50ID0ga2V5O1xuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHRcdGlmICggISBfLmhhcyggbW9kZUV2ZW50TWFwLCBjb2xsZWN0aW9uRXZlbnQgKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRldmVudFRvVHJpZ2dlciA9IG1vZGVsLmdldCgnaWQnKSArICc6JyArIG1vZGVFdmVudE1hcFtjb2xsZWN0aW9uRXZlbnRdO1xuXHRcdHRoaXMudHJpZ2dlciggZXZlbnRUb1RyaWdnZXIgKTtcblx0fSxcblx0LyoqXG5cdCAqIEFjdGl2YXRlIGEgbW9kZSBvbiB0aGUgZnJhbWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBzdHJpbmcgbW9kZSBNb2RlIElELlxuXHQgKiBAcmV0dXJucyB7dGhpc30gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmcuXG5cdCAqL1xuXHRhY3RpdmF0ZU1vZGU6IGZ1bmN0aW9uKCBtb2RlICkge1xuXHRcdC8vIEJhaWwgaWYgdGhlIG1vZGUgaXMgYWxyZWFkeSBhY3RpdmUuXG5cdFx0aWYgKCB0aGlzLmlzTW9kZUFjdGl2ZSggbW9kZSApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0aGlzLmFjdGl2ZU1vZGVzLmFkZCggWyB7IGlkOiBtb2RlIH0gXSApO1xuXHRcdC8vIEFkZCBhIENTUyBjbGFzcyB0byB0aGUgZnJhbWUgc28gZWxlbWVudHMgY2FuIGJlIHN0eWxlZCBmb3IgdGhlIG1vZGUuXG5cdFx0dGhpcy4kZWwuYWRkQ2xhc3MoICdtb2RlLScgKyBtb2RlICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0LyoqXG5cdCAqIERlYWN0aXZhdGUgYSBtb2RlIG9uIHRoZSBmcmFtZS5cblx0ICpcblx0ICogQHBhcmFtIHN0cmluZyBtb2RlIE1vZGUgSUQuXG5cdCAqIEByZXR1cm5zIHt0aGlzfSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZy5cblx0ICovXG5cdGRlYWN0aXZhdGVNb2RlOiBmdW5jdGlvbiggbW9kZSApIHtcblx0XHQvLyBCYWlsIGlmIHRoZSBtb2RlIGlzbid0IGFjdGl2ZS5cblx0XHRpZiAoICEgdGhpcy5pc01vZGVBY3RpdmUoIG1vZGUgKSApIHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblx0XHR0aGlzLmFjdGl2ZU1vZGVzLnJlbW92ZSggdGhpcy5hY3RpdmVNb2Rlcy53aGVyZSggeyBpZDogbW9kZSB9ICkgKTtcblx0XHR0aGlzLiRlbC5yZW1vdmVDbGFzcyggJ21vZGUtJyArIG1vZGUgKTtcblx0XHQvKipcblx0XHQgKiBGcmFtZSBtb2RlIGRlYWN0aXZhdGlvbiBldmVudC5cblx0XHQgKlxuXHRcdCAqIEBldmVudCB0aGlzI3ttb2RlfTpkZWFjdGl2YXRlXG5cdFx0ICovXG5cdFx0dGhpcy50cmlnZ2VyKCBtb2RlICsgJzpkZWFjdGl2YXRlJyApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdC8qKlxuXHQgKiBDaGVjayBpZiBhIG1vZGUgaXMgZW5hYmxlZCBvbiB0aGUgZnJhbWUuXG5cdCAqXG5cdCAqIEBwYXJhbSAgc3RyaW5nIG1vZGUgTW9kZSBJRC5cblx0ICogQHJldHVybiBib29sXG5cdCAqL1xuXHRpc01vZGVBY3RpdmU6IGZ1bmN0aW9uKCBtb2RlICkge1xuXHRcdHJldHVybiBCb29sZWFuKCB0aGlzLmFjdGl2ZU1vZGVzLndoZXJlKCB7IGlkOiBtb2RlIH0gKS5sZW5ndGggKTtcblx0fVxufSk7XG5cbi8vIE1ha2UgdGhlIGBGcmFtZWAgYSBgU3RhdGVNYWNoaW5lYC5cbl8uZXh0ZW5kKCBGcmFtZS5wcm90b3R5cGUsIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVNYWNoaW5lLnByb3RvdHlwZSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZyYW1lO1xuIiwiLypnbG9iYWxzIHdwICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5NZWRpYUZyYW1lLkltYWdlRGV0YWlsc1xuICpcbiAqIEEgbWVkaWEgZnJhbWUgZm9yIG1hbmlwdWxhdGluZyBhbiBpbWFnZSB0aGF0J3MgYWxyZWFkeSBiZWVuIGluc2VydGVkXG4gKiBpbnRvIGEgcG9zdC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWUuU2VsZWN0XG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5NZWRpYUZyYW1lXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5GcmFtZVxuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICogQG1peGVzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVNYWNoaW5lXG4gKi9cbnZhciBTZWxlY3QgPSB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWUuU2VsZWN0LFxuXHRsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHRJbWFnZURldGFpbHM7XG5cbkltYWdlRGV0YWlscyA9IFNlbGVjdC5leHRlbmQoe1xuXHRkZWZhdWx0czoge1xuXHRcdGlkOiAgICAgICdpbWFnZScsXG5cdFx0dXJsOiAgICAgJycsXG5cdFx0bWVudTogICAgJ2ltYWdlLWRldGFpbHMnLFxuXHRcdGNvbnRlbnQ6ICdpbWFnZS1kZXRhaWxzJyxcblx0XHR0b29sYmFyOiAnaW1hZ2UtZGV0YWlscycsXG5cdFx0dHlwZTogICAgJ2xpbmsnLFxuXHRcdHRpdGxlOiAgICBsMTBuLmltYWdlRGV0YWlsc1RpdGxlLFxuXHRcdHByaW9yaXR5OiAxMjBcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHR0aGlzLmltYWdlID0gbmV3IHdwLm1lZGlhLm1vZGVsLlBvc3RJbWFnZSggb3B0aW9ucy5tZXRhZGF0YSApO1xuXHRcdHRoaXMub3B0aW9ucy5zZWxlY3Rpb24gPSBuZXcgd3AubWVkaWEubW9kZWwuU2VsZWN0aW9uKCB0aGlzLmltYWdlLmF0dGFjaG1lbnQsIHsgbXVsdGlwbGU6IGZhbHNlIH0gKTtcblx0XHRTZWxlY3QucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdGJpbmRIYW5kbGVyczogZnVuY3Rpb24oKSB7XG5cdFx0U2VsZWN0LnByb3RvdHlwZS5iaW5kSGFuZGxlcnMuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHRoaXMub24oICdtZW51OmNyZWF0ZTppbWFnZS1kZXRhaWxzJywgdGhpcy5jcmVhdGVNZW51LCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ2NvbnRlbnQ6Y3JlYXRlOmltYWdlLWRldGFpbHMnLCB0aGlzLmltYWdlRGV0YWlsc0NvbnRlbnQsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnY29udGVudDpyZW5kZXI6ZWRpdC1pbWFnZScsIHRoaXMuZWRpdEltYWdlQ29udGVudCwgdGhpcyApO1xuXHRcdHRoaXMub24oICd0b29sYmFyOnJlbmRlcjppbWFnZS1kZXRhaWxzJywgdGhpcy5yZW5kZXJJbWFnZURldGFpbHNUb29sYmFyLCB0aGlzICk7XG5cdFx0Ly8gb3ZlcnJpZGUgdGhlIHNlbGVjdCB0b29sYmFyXG5cdFx0dGhpcy5vbiggJ3Rvb2xiYXI6cmVuZGVyOnJlcGxhY2UnLCB0aGlzLnJlbmRlclJlcGxhY2VJbWFnZVRvb2xiYXIsIHRoaXMgKTtcblx0fSxcblxuXHRjcmVhdGVTdGF0ZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc3RhdGVzLmFkZChbXG5cdFx0XHRuZXcgd3AubWVkaWEuY29udHJvbGxlci5JbWFnZURldGFpbHMoe1xuXHRcdFx0XHRpbWFnZTogdGhpcy5pbWFnZSxcblx0XHRcdFx0ZWRpdGFibGU6IGZhbHNlXG5cdFx0XHR9KSxcblx0XHRcdG5ldyB3cC5tZWRpYS5jb250cm9sbGVyLlJlcGxhY2VJbWFnZSh7XG5cdFx0XHRcdGlkOiAncmVwbGFjZS1pbWFnZScsXG5cdFx0XHRcdGxpYnJhcnk6IHdwLm1lZGlhLnF1ZXJ5KCB7IHR5cGU6ICdpbWFnZScgfSApLFxuXHRcdFx0XHRpbWFnZTogdGhpcy5pbWFnZSxcblx0XHRcdFx0bXVsdGlwbGU6ICBmYWxzZSxcblx0XHRcdFx0dGl0bGU6ICAgICBsMTBuLmltYWdlUmVwbGFjZVRpdGxlLFxuXHRcdFx0XHR0b29sYmFyOiAncmVwbGFjZScsXG5cdFx0XHRcdHByaW9yaXR5OiAgODAsXG5cdFx0XHRcdGRpc3BsYXlTZXR0aW5nczogdHJ1ZVxuXHRcdFx0fSksXG5cdFx0XHRuZXcgd3AubWVkaWEuY29udHJvbGxlci5FZGl0SW1hZ2UoIHtcblx0XHRcdFx0aW1hZ2U6IHRoaXMuaW1hZ2UsXG5cdFx0XHRcdHNlbGVjdGlvbjogdGhpcy5vcHRpb25zLnNlbGVjdGlvblxuXHRcdFx0fSApXG5cdFx0XSk7XG5cdH0sXG5cblx0aW1hZ2VEZXRhaWxzQ29udGVudDogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0b3B0aW9ucy52aWV3ID0gbmV3IHdwLm1lZGlhLnZpZXcuSW1hZ2VEZXRhaWxzKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRtb2RlbDogdGhpcy5zdGF0ZSgpLmltYWdlLFxuXHRcdFx0YXR0YWNobWVudDogdGhpcy5zdGF0ZSgpLmltYWdlLmF0dGFjaG1lbnRcblx0XHR9KTtcblx0fSxcblxuXHRlZGl0SW1hZ2VDb250ZW50OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc3RhdGUgPSB0aGlzLnN0YXRlKCksXG5cdFx0XHRtb2RlbCA9IHN0YXRlLmdldCgnaW1hZ2UnKSxcblx0XHRcdHZpZXc7XG5cblx0XHRpZiAoICEgbW9kZWwgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmlldyA9IG5ldyB3cC5tZWRpYS52aWV3LkVkaXRJbWFnZSggeyBtb2RlbDogbW9kZWwsIGNvbnRyb2xsZXI6IHRoaXMgfSApLnJlbmRlcigpO1xuXG5cdFx0dGhpcy5jb250ZW50LnNldCggdmlldyApO1xuXG5cdFx0Ly8gYWZ0ZXIgYnJpbmdpbmcgaW4gdGhlIGZyYW1lLCBsb2FkIHRoZSBhY3R1YWwgZWRpdG9yIHZpYSBhbiBhamF4IGNhbGxcblx0XHR2aWV3LmxvYWRFZGl0b3IoKTtcblxuXHR9LFxuXG5cdHJlbmRlckltYWdlRGV0YWlsc1Rvb2xiYXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudG9vbGJhci5zZXQoIG5ldyB3cC5tZWRpYS52aWV3LlRvb2xiYXIoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcyxcblx0XHRcdGl0ZW1zOiB7XG5cdFx0XHRcdHNlbGVjdDoge1xuXHRcdFx0XHRcdHN0eWxlOiAgICAncHJpbWFyeScsXG5cdFx0XHRcdFx0dGV4dDogICAgIGwxMG4udXBkYXRlLFxuXHRcdFx0XHRcdHByaW9yaXR5OiA4MCxcblxuXHRcdFx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBjb250cm9sbGVyID0gdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRcdFx0XHRzdGF0ZSA9IGNvbnRyb2xsZXIuc3RhdGUoKTtcblxuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5jbG9zZSgpO1xuXG5cdFx0XHRcdFx0XHQvLyBub3Qgc3VyZSBpZiB3ZSB3YW50IHRvIHVzZSB3cC5tZWRpYS5zdHJpbmcuaW1hZ2Ugd2hpY2ggd2lsbCBjcmVhdGUgYSBzaG9ydGNvZGUgb3Jcblx0XHRcdFx0XHRcdC8vIHBlcmhhcHMgd3AuaHRtbC5zdHJpbmcgdG8gYXQgbGVhc3QgdG8gYnVpbGQgdGhlIDxpbWcgLz5cblx0XHRcdFx0XHRcdHN0YXRlLnRyaWdnZXIoICd1cGRhdGUnLCBjb250cm9sbGVyLmltYWdlLnRvSlNPTigpICk7XG5cblx0XHRcdFx0XHRcdC8vIFJlc3RvcmUgYW5kIHJlc2V0IHRoZSBkZWZhdWx0IHN0YXRlLlxuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5zZXRTdGF0ZSggY29udHJvbGxlci5vcHRpb25zLnN0YXRlICk7XG5cdFx0XHRcdFx0XHRjb250cm9sbGVyLnJlc2V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSkgKTtcblx0fSxcblxuXHRyZW5kZXJSZXBsYWNlSW1hZ2VUb29sYmFyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZnJhbWUgPSB0aGlzLFxuXHRcdFx0bGFzdFN0YXRlID0gZnJhbWUubGFzdFN0YXRlKCksXG5cdFx0XHRwcmV2aW91cyA9IGxhc3RTdGF0ZSAmJiBsYXN0U3RhdGUuaWQ7XG5cblx0XHR0aGlzLnRvb2xiYXIuc2V0KCBuZXcgd3AubWVkaWEudmlldy5Ub29sYmFyKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRpdGVtczoge1xuXHRcdFx0XHRiYWNrOiB7XG5cdFx0XHRcdFx0dGV4dDogICAgIGwxMG4uYmFjayxcblx0XHRcdFx0XHRwcmlvcml0eTogMjAsXG5cdFx0XHRcdFx0Y2xpY2s6ICAgIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKCBwcmV2aW91cyApIHtcblx0XHRcdFx0XHRcdFx0ZnJhbWUuc2V0U3RhdGUoIHByZXZpb3VzICk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRmcmFtZS5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblxuXHRcdFx0XHRyZXBsYWNlOiB7XG5cdFx0XHRcdFx0c3R5bGU6ICAgICdwcmltYXJ5Jyxcblx0XHRcdFx0XHR0ZXh0OiAgICAgbDEwbi5yZXBsYWNlLFxuXHRcdFx0XHRcdHByaW9yaXR5OiA4MCxcblxuXHRcdFx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBjb250cm9sbGVyID0gdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRcdFx0XHRzdGF0ZSA9IGNvbnRyb2xsZXIuc3RhdGUoKSxcblx0XHRcdFx0XHRcdFx0c2VsZWN0aW9uID0gc3RhdGUuZ2V0KCAnc2VsZWN0aW9uJyApLFxuXHRcdFx0XHRcdFx0XHRhdHRhY2htZW50ID0gc2VsZWN0aW9uLnNpbmdsZSgpO1xuXG5cdFx0XHRcdFx0XHRjb250cm9sbGVyLmNsb3NlKCk7XG5cblx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuaW1hZ2UuY2hhbmdlQXR0YWNobWVudCggYXR0YWNobWVudCwgc3RhdGUuZGlzcGxheSggYXR0YWNobWVudCApICk7XG5cblx0XHRcdFx0XHRcdC8vIG5vdCBzdXJlIGlmIHdlIHdhbnQgdG8gdXNlIHdwLm1lZGlhLnN0cmluZy5pbWFnZSB3aGljaCB3aWxsIGNyZWF0ZSBhIHNob3J0Y29kZSBvclxuXHRcdFx0XHRcdFx0Ly8gcGVyaGFwcyB3cC5odG1sLnN0cmluZyB0byBhdCBsZWFzdCB0byBidWlsZCB0aGUgPGltZyAvPlxuXHRcdFx0XHRcdFx0c3RhdGUudHJpZ2dlciggJ3JlcGxhY2UnLCBjb250cm9sbGVyLmltYWdlLnRvSlNPTigpICk7XG5cblx0XHRcdFx0XHRcdC8vIFJlc3RvcmUgYW5kIHJlc2V0IHRoZSBkZWZhdWx0IHN0YXRlLlxuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5zZXRTdGF0ZSggY29udHJvbGxlci5vcHRpb25zLnN0YXRlICk7XG5cdFx0XHRcdFx0XHRjb250cm9sbGVyLnJlc2V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSkgKTtcblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnZURldGFpbHM7XG4iLCIvKmdsb2JhbHMgd3AsIF8gKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWUuUG9zdFxuICpcbiAqIFRoZSBmcmFtZSBmb3IgbWFuaXB1bGF0aW5nIG1lZGlhIG9uIHRoZSBFZGl0IFBvc3QgcGFnZS5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWUuU2VsZWN0XG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5NZWRpYUZyYW1lXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5GcmFtZVxuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICogQG1peGVzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVNYWNoaW5lXG4gKi9cbnZhciBTZWxlY3QgPSB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWUuU2VsZWN0LFxuXHRMaWJyYXJ5ID0gd3AubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5LFxuXHRsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHRQb3N0O1xuXG5Qb3N0ID0gU2VsZWN0LmV4dGVuZCh7XG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuY291bnRzID0ge1xuXHRcdFx0YXVkaW86IHtcblx0XHRcdFx0Y291bnQ6IHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MuYXR0YWNobWVudENvdW50cy5hdWRpbyxcblx0XHRcdFx0c3RhdGU6ICdwbGF5bGlzdCdcblx0XHRcdH0sXG5cdFx0XHR2aWRlbzoge1xuXHRcdFx0XHRjb3VudDogd3AubWVkaWEudmlldy5zZXR0aW5ncy5hdHRhY2htZW50Q291bnRzLnZpZGVvLFxuXHRcdFx0XHRzdGF0ZTogJ3ZpZGVvLXBsYXlsaXN0J1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdG11bHRpcGxlOiAgdHJ1ZSxcblx0XHRcdGVkaXRpbmc6ICAgZmFsc2UsXG5cdFx0XHRzdGF0ZTogICAgJ2luc2VydCcsXG5cdFx0XHRtZXRhZGF0YTogIHt9XG5cdFx0fSk7XG5cblx0XHQvLyBDYWxsICdpbml0aWFsaXplJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzLlxuXHRcdFNlbGVjdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0dGhpcy5jcmVhdGVJZnJhbWVTdGF0ZXMoKTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgdGhlIGRlZmF1bHQgc3RhdGVzLlxuXHQgKi9cblx0Y3JlYXRlU3RhdGVzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuXHRcdHRoaXMuc3RhdGVzLmFkZChbXG5cdFx0XHQvLyBNYWluIHN0YXRlcy5cblx0XHRcdG5ldyBMaWJyYXJ5KHtcblx0XHRcdFx0aWQ6ICAgICAgICAgJ2luc2VydCcsXG5cdFx0XHRcdHRpdGxlOiAgICAgIGwxMG4uaW5zZXJ0TWVkaWFUaXRsZSxcblx0XHRcdFx0cHJpb3JpdHk6ICAgMjAsXG5cdFx0XHRcdHRvb2xiYXI6ICAgICdtYWluLWluc2VydCcsXG5cdFx0XHRcdGZpbHRlcmFibGU6ICdhbGwnLFxuXHRcdFx0XHRsaWJyYXJ5OiAgICB3cC5tZWRpYS5xdWVyeSggb3B0aW9ucy5saWJyYXJ5ICksXG5cdFx0XHRcdG11bHRpcGxlOiAgIG9wdGlvbnMubXVsdGlwbGUgPyAncmVzZXQnIDogZmFsc2UsXG5cdFx0XHRcdGVkaXRhYmxlOiAgIHRydWUsXG5cblx0XHRcdFx0Ly8gSWYgdGhlIHVzZXIgaXNuJ3QgYWxsb3dlZCB0byBlZGl0IGZpZWxkcyxcblx0XHRcdFx0Ly8gY2FuIHRoZXkgc3RpbGwgZWRpdCBpdCBsb2NhbGx5P1xuXHRcdFx0XHRhbGxvd0xvY2FsRWRpdHM6IHRydWUsXG5cblx0XHRcdFx0Ly8gU2hvdyB0aGUgYXR0YWNobWVudCBkaXNwbGF5IHNldHRpbmdzLlxuXHRcdFx0XHRkaXNwbGF5U2V0dGluZ3M6IHRydWUsXG5cdFx0XHRcdC8vIFVwZGF0ZSB1c2VyIHNldHRpbmdzIHdoZW4gdXNlcnMgYWRqdXN0IHRoZVxuXHRcdFx0XHQvLyBhdHRhY2htZW50IGRpc3BsYXkgc2V0dGluZ3MuXG5cdFx0XHRcdGRpc3BsYXlVc2VyU2V0dGluZ3M6IHRydWVcblx0XHRcdH0pLFxuXG5cdFx0XHRuZXcgTGlicmFyeSh7XG5cdFx0XHRcdGlkOiAgICAgICAgICdnYWxsZXJ5Jyxcblx0XHRcdFx0dGl0bGU6ICAgICAgbDEwbi5jcmVhdGVHYWxsZXJ5VGl0bGUsXG5cdFx0XHRcdHByaW9yaXR5OiAgIDQwLFxuXHRcdFx0XHR0b29sYmFyOiAgICAnbWFpbi1nYWxsZXJ5Jyxcblx0XHRcdFx0ZmlsdGVyYWJsZTogJ3VwbG9hZGVkJyxcblx0XHRcdFx0bXVsdGlwbGU6ICAgJ2FkZCcsXG5cdFx0XHRcdGVkaXRhYmxlOiAgIGZhbHNlLFxuXG5cdFx0XHRcdGxpYnJhcnk6ICB3cC5tZWRpYS5xdWVyeSggXy5kZWZhdWx0cyh7XG5cdFx0XHRcdFx0dHlwZTogJ2ltYWdlJ1xuXHRcdFx0XHR9LCBvcHRpb25zLmxpYnJhcnkgKSApXG5cdFx0XHR9KSxcblxuXHRcdFx0Ly8gRW1iZWQgc3RhdGVzLlxuXHRcdFx0bmV3IHdwLm1lZGlhLmNvbnRyb2xsZXIuRW1iZWQoIHsgbWV0YWRhdGE6IG9wdGlvbnMubWV0YWRhdGEgfSApLFxuXG5cdFx0XHRuZXcgd3AubWVkaWEuY29udHJvbGxlci5FZGl0SW1hZ2UoIHsgbW9kZWw6IG9wdGlvbnMuZWRpdEltYWdlIH0gKSxcblxuXHRcdFx0Ly8gR2FsbGVyeSBzdGF0ZXMuXG5cdFx0XHRuZXcgd3AubWVkaWEuY29udHJvbGxlci5HYWxsZXJ5RWRpdCh7XG5cdFx0XHRcdGxpYnJhcnk6IG9wdGlvbnMuc2VsZWN0aW9uLFxuXHRcdFx0XHRlZGl0aW5nOiBvcHRpb25zLmVkaXRpbmcsXG5cdFx0XHRcdG1lbnU6ICAgICdnYWxsZXJ5J1xuXHRcdFx0fSksXG5cblx0XHRcdG5ldyB3cC5tZWRpYS5jb250cm9sbGVyLkdhbGxlcnlBZGQoKSxcblxuXHRcdFx0bmV3IExpYnJhcnkoe1xuXHRcdFx0XHRpZDogICAgICAgICAncGxheWxpc3QnLFxuXHRcdFx0XHR0aXRsZTogICAgICBsMTBuLmNyZWF0ZVBsYXlsaXN0VGl0bGUsXG5cdFx0XHRcdHByaW9yaXR5OiAgIDYwLFxuXHRcdFx0XHR0b29sYmFyOiAgICAnbWFpbi1wbGF5bGlzdCcsXG5cdFx0XHRcdGZpbHRlcmFibGU6ICd1cGxvYWRlZCcsXG5cdFx0XHRcdG11bHRpcGxlOiAgICdhZGQnLFxuXHRcdFx0XHRlZGl0YWJsZTogICBmYWxzZSxcblxuXHRcdFx0XHRsaWJyYXJ5OiAgd3AubWVkaWEucXVlcnkoIF8uZGVmYXVsdHMoe1xuXHRcdFx0XHRcdHR5cGU6ICdhdWRpbydcblx0XHRcdFx0fSwgb3B0aW9ucy5saWJyYXJ5ICkgKVxuXHRcdFx0fSksXG5cblx0XHRcdC8vIFBsYXlsaXN0IHN0YXRlcy5cblx0XHRcdG5ldyB3cC5tZWRpYS5jb250cm9sbGVyLkNvbGxlY3Rpb25FZGl0KHtcblx0XHRcdFx0dHlwZTogJ2F1ZGlvJyxcblx0XHRcdFx0Y29sbGVjdGlvblR5cGU6ICdwbGF5bGlzdCcsXG5cdFx0XHRcdHRpdGxlOiAgICAgICAgICBsMTBuLmVkaXRQbGF5bGlzdFRpdGxlLFxuXHRcdFx0XHRTZXR0aW5nc1ZpZXc6ICAgd3AubWVkaWEudmlldy5TZXR0aW5ncy5QbGF5bGlzdCxcblx0XHRcdFx0bGlicmFyeTogICAgICAgIG9wdGlvbnMuc2VsZWN0aW9uLFxuXHRcdFx0XHRlZGl0aW5nOiAgICAgICAgb3B0aW9ucy5lZGl0aW5nLFxuXHRcdFx0XHRtZW51OiAgICAgICAgICAgJ3BsYXlsaXN0Jyxcblx0XHRcdFx0ZHJhZ0luZm9UZXh0OiAgIGwxMG4ucGxheWxpc3REcmFnSW5mbyxcblx0XHRcdFx0ZHJhZ0luZm86ICAgICAgIGZhbHNlXG5cdFx0XHR9KSxcblxuXHRcdFx0bmV3IHdwLm1lZGlhLmNvbnRyb2xsZXIuQ29sbGVjdGlvbkFkZCh7XG5cdFx0XHRcdHR5cGU6ICdhdWRpbycsXG5cdFx0XHRcdGNvbGxlY3Rpb25UeXBlOiAncGxheWxpc3QnLFxuXHRcdFx0XHR0aXRsZTogbDEwbi5hZGRUb1BsYXlsaXN0VGl0bGVcblx0XHRcdH0pLFxuXG5cdFx0XHRuZXcgTGlicmFyeSh7XG5cdFx0XHRcdGlkOiAgICAgICAgICd2aWRlby1wbGF5bGlzdCcsXG5cdFx0XHRcdHRpdGxlOiAgICAgIGwxMG4uY3JlYXRlVmlkZW9QbGF5bGlzdFRpdGxlLFxuXHRcdFx0XHRwcmlvcml0eTogICA2MCxcblx0XHRcdFx0dG9vbGJhcjogICAgJ21haW4tdmlkZW8tcGxheWxpc3QnLFxuXHRcdFx0XHRmaWx0ZXJhYmxlOiAndXBsb2FkZWQnLFxuXHRcdFx0XHRtdWx0aXBsZTogICAnYWRkJyxcblx0XHRcdFx0ZWRpdGFibGU6ICAgZmFsc2UsXG5cblx0XHRcdFx0bGlicmFyeTogIHdwLm1lZGlhLnF1ZXJ5KCBfLmRlZmF1bHRzKHtcblx0XHRcdFx0XHR0eXBlOiAndmlkZW8nXG5cdFx0XHRcdH0sIG9wdGlvbnMubGlicmFyeSApIClcblx0XHRcdH0pLFxuXG5cdFx0XHRuZXcgd3AubWVkaWEuY29udHJvbGxlci5Db2xsZWN0aW9uRWRpdCh7XG5cdFx0XHRcdHR5cGU6ICd2aWRlbycsXG5cdFx0XHRcdGNvbGxlY3Rpb25UeXBlOiAncGxheWxpc3QnLFxuXHRcdFx0XHR0aXRsZTogICAgICAgICAgbDEwbi5lZGl0VmlkZW9QbGF5bGlzdFRpdGxlLFxuXHRcdFx0XHRTZXR0aW5nc1ZpZXc6ICAgd3AubWVkaWEudmlldy5TZXR0aW5ncy5QbGF5bGlzdCxcblx0XHRcdFx0bGlicmFyeTogICAgICAgIG9wdGlvbnMuc2VsZWN0aW9uLFxuXHRcdFx0XHRlZGl0aW5nOiAgICAgICAgb3B0aW9ucy5lZGl0aW5nLFxuXHRcdFx0XHRtZW51OiAgICAgICAgICAgJ3ZpZGVvLXBsYXlsaXN0Jyxcblx0XHRcdFx0ZHJhZ0luZm9UZXh0OiAgIGwxMG4udmlkZW9QbGF5bGlzdERyYWdJbmZvLFxuXHRcdFx0XHRkcmFnSW5mbzogICAgICAgZmFsc2Vcblx0XHRcdH0pLFxuXG5cdFx0XHRuZXcgd3AubWVkaWEuY29udHJvbGxlci5Db2xsZWN0aW9uQWRkKHtcblx0XHRcdFx0dHlwZTogJ3ZpZGVvJyxcblx0XHRcdFx0Y29sbGVjdGlvblR5cGU6ICdwbGF5bGlzdCcsXG5cdFx0XHRcdHRpdGxlOiBsMTBuLmFkZFRvVmlkZW9QbGF5bGlzdFRpdGxlXG5cdFx0XHR9KVxuXHRcdF0pO1xuXG5cdFx0aWYgKCB3cC5tZWRpYS52aWV3LnNldHRpbmdzLnBvc3QuZmVhdHVyZWRJbWFnZUlkICkge1xuXHRcdFx0dGhpcy5zdGF0ZXMuYWRkKCBuZXcgd3AubWVkaWEuY29udHJvbGxlci5GZWF0dXJlZEltYWdlKCkgKTtcblx0XHR9XG5cdH0sXG5cblx0YmluZEhhbmRsZXJzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgaGFuZGxlcnMsIGNoZWNrQ291bnRzO1xuXG5cdFx0U2VsZWN0LnByb3RvdHlwZS5iaW5kSGFuZGxlcnMuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0dGhpcy5vbiggJ2FjdGl2YXRlJywgdGhpcy5hY3RpdmF0ZSwgdGhpcyApO1xuXG5cdFx0Ly8gT25seSBib3RoZXIgY2hlY2tpbmcgbWVkaWEgdHlwZSBjb3VudHMgaWYgb25lIG9mIHRoZSBjb3VudHMgaXMgemVyb1xuXHRcdGNoZWNrQ291bnRzID0gXy5maW5kKCB0aGlzLmNvdW50cywgZnVuY3Rpb24oIHR5cGUgKSB7XG5cdFx0XHRyZXR1cm4gdHlwZS5jb3VudCA9PT0gMDtcblx0XHR9ICk7XG5cblx0XHRpZiAoIHR5cGVvZiBjaGVja0NvdW50cyAhPT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0XHR0aGlzLmxpc3RlblRvKCB3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50cy5hbGwsICdjaGFuZ2U6dHlwZScsIHRoaXMubWVkaWFUeXBlQ291bnRzICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5vbiggJ21lbnU6Y3JlYXRlOmdhbGxlcnknLCB0aGlzLmNyZWF0ZU1lbnUsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnbWVudTpjcmVhdGU6cGxheWxpc3QnLCB0aGlzLmNyZWF0ZU1lbnUsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnbWVudTpjcmVhdGU6dmlkZW8tcGxheWxpc3QnLCB0aGlzLmNyZWF0ZU1lbnUsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAndG9vbGJhcjpjcmVhdGU6bWFpbi1pbnNlcnQnLCB0aGlzLmNyZWF0ZVRvb2xiYXIsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAndG9vbGJhcjpjcmVhdGU6bWFpbi1nYWxsZXJ5JywgdGhpcy5jcmVhdGVUb29sYmFyLCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ3Rvb2xiYXI6Y3JlYXRlOm1haW4tcGxheWxpc3QnLCB0aGlzLmNyZWF0ZVRvb2xiYXIsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAndG9vbGJhcjpjcmVhdGU6bWFpbi12aWRlby1wbGF5bGlzdCcsIHRoaXMuY3JlYXRlVG9vbGJhciwgdGhpcyApO1xuXHRcdHRoaXMub24oICd0b29sYmFyOmNyZWF0ZTpmZWF0dXJlZC1pbWFnZScsIHRoaXMuZmVhdHVyZWRJbWFnZVRvb2xiYXIsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAndG9vbGJhcjpjcmVhdGU6bWFpbi1lbWJlZCcsIHRoaXMubWFpbkVtYmVkVG9vbGJhciwgdGhpcyApO1xuXG5cdFx0aGFuZGxlcnMgPSB7XG5cdFx0XHRtZW51OiB7XG5cdFx0XHRcdCdkZWZhdWx0JzogJ21haW5NZW51Jyxcblx0XHRcdFx0J2dhbGxlcnknOiAnZ2FsbGVyeU1lbnUnLFxuXHRcdFx0XHQncGxheWxpc3QnOiAncGxheWxpc3RNZW51Jyxcblx0XHRcdFx0J3ZpZGVvLXBsYXlsaXN0JzogJ3ZpZGVvUGxheWxpc3RNZW51J1xuXHRcdFx0fSxcblxuXHRcdFx0Y29udGVudDoge1xuXHRcdFx0XHQnZW1iZWQnOiAgICAgICAgICAnZW1iZWRDb250ZW50Jyxcblx0XHRcdFx0J2VkaXQtaW1hZ2UnOiAgICAgJ2VkaXRJbWFnZUNvbnRlbnQnLFxuXHRcdFx0XHQnZWRpdC1zZWxlY3Rpb24nOiAnZWRpdFNlbGVjdGlvbkNvbnRlbnQnXG5cdFx0XHR9LFxuXG5cdFx0XHR0b29sYmFyOiB7XG5cdFx0XHRcdCdtYWluLWluc2VydCc6ICAgICAgJ21haW5JbnNlcnRUb29sYmFyJyxcblx0XHRcdFx0J21haW4tZ2FsbGVyeSc6ICAgICAnbWFpbkdhbGxlcnlUb29sYmFyJyxcblx0XHRcdFx0J2dhbGxlcnktZWRpdCc6ICAgICAnZ2FsbGVyeUVkaXRUb29sYmFyJyxcblx0XHRcdFx0J2dhbGxlcnktYWRkJzogICAgICAnZ2FsbGVyeUFkZFRvb2xiYXInLFxuXHRcdFx0XHQnbWFpbi1wbGF5bGlzdCc6XHQnbWFpblBsYXlsaXN0VG9vbGJhcicsXG5cdFx0XHRcdCdwbGF5bGlzdC1lZGl0JzpcdCdwbGF5bGlzdEVkaXRUb29sYmFyJyxcblx0XHRcdFx0J3BsYXlsaXN0LWFkZCc6XHRcdCdwbGF5bGlzdEFkZFRvb2xiYXInLFxuXHRcdFx0XHQnbWFpbi12aWRlby1wbGF5bGlzdCc6ICdtYWluVmlkZW9QbGF5bGlzdFRvb2xiYXInLFxuXHRcdFx0XHQndmlkZW8tcGxheWxpc3QtZWRpdCc6ICd2aWRlb1BsYXlsaXN0RWRpdFRvb2xiYXInLFxuXHRcdFx0XHQndmlkZW8tcGxheWxpc3QtYWRkJzogJ3ZpZGVvUGxheWxpc3RBZGRUb29sYmFyJ1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRfLmVhY2goIGhhbmRsZXJzLCBmdW5jdGlvbiggcmVnaW9uSGFuZGxlcnMsIHJlZ2lvbiApIHtcblx0XHRcdF8uZWFjaCggcmVnaW9uSGFuZGxlcnMsIGZ1bmN0aW9uKCBjYWxsYmFjaywgaGFuZGxlciApIHtcblx0XHRcdFx0dGhpcy5vbiggcmVnaW9uICsgJzpyZW5kZXI6JyArIGhhbmRsZXIsIHRoaXNbIGNhbGxiYWNrIF0sIHRoaXMgKTtcblx0XHRcdH0sIHRoaXMgKTtcblx0XHR9LCB0aGlzICk7XG5cdH0sXG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIEhpZGUgbWVudSBpdGVtcyBmb3Igc3RhdGVzIHRpZWQgdG8gcGFydGljdWxhciBtZWRpYSB0eXBlcyBpZiB0aGVyZSBhcmUgbm8gaXRlbXNcblx0XHRfLmVhY2goIHRoaXMuY291bnRzLCBmdW5jdGlvbiggdHlwZSApIHtcblx0XHRcdGlmICggdHlwZS5jb3VudCA8IDEgKSB7XG5cdFx0XHRcdHRoaXMubWVudUl0ZW1WaXNpYmlsaXR5KCB0eXBlLnN0YXRlLCAnaGlkZScgKTtcblx0XHRcdH1cblx0XHR9LCB0aGlzICk7XG5cdH0sXG5cblx0bWVkaWFUeXBlQ291bnRzOiBmdW5jdGlvbiggbW9kZWwsIGF0dHIgKSB7XG5cdFx0aWYgKCB0eXBlb2YgdGhpcy5jb3VudHNbIGF0dHIgXSAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5jb3VudHNbIGF0dHIgXS5jb3VudCA8IDEgKSB7XG5cdFx0XHR0aGlzLmNvdW50c1sgYXR0ciBdLmNvdW50Kys7XG5cdFx0XHR0aGlzLm1lbnVJdGVtVmlzaWJpbGl0eSggdGhpcy5jb3VudHNbIGF0dHIgXS5zdGF0ZSwgJ3Nob3cnICk7XG5cdFx0fVxuXHR9LFxuXG5cdC8vIE1lbnVzXG5cdC8qKlxuXHQgKiBAcGFyYW0ge3dwLkJhY2tib25lLlZpZXd9IHZpZXdcblx0ICovXG5cdG1haW5NZW51OiBmdW5jdGlvbiggdmlldyApIHtcblx0XHR2aWV3LnNldCh7XG5cdFx0XHQnbGlicmFyeS1zZXBhcmF0b3InOiBuZXcgd3AubWVkaWEuVmlldyh7XG5cdFx0XHRcdGNsYXNzTmFtZTogJ3NlcGFyYXRvcicsXG5cdFx0XHRcdHByaW9yaXR5OiAxMDBcblx0XHRcdH0pXG5cdFx0fSk7XG5cdH0sXG5cblx0bWVudUl0ZW1WaXNpYmlsaXR5OiBmdW5jdGlvbiggc3RhdGUsIHZpc2liaWxpdHkgKSB7XG5cdFx0dmFyIG1lbnUgPSB0aGlzLm1lbnUuZ2V0KCk7XG5cdFx0aWYgKCB2aXNpYmlsaXR5ID09PSAnaGlkZScgKSB7XG5cdFx0XHRtZW51LmhpZGUoIHN0YXRlICk7XG5cdFx0fSBlbHNlIGlmICggdmlzaWJpbGl0eSA9PT0gJ3Nob3cnICkge1xuXHRcdFx0bWVudS5zaG93KCBzdGF0ZSApO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7d3AuQmFja2JvbmUuVmlld30gdmlld1xuXHQgKi9cblx0Z2FsbGVyeU1lbnU6IGZ1bmN0aW9uKCB2aWV3ICkge1xuXHRcdHZhciBsYXN0U3RhdGUgPSB0aGlzLmxhc3RTdGF0ZSgpLFxuXHRcdFx0cHJldmlvdXMgPSBsYXN0U3RhdGUgJiYgbGFzdFN0YXRlLmlkLFxuXHRcdFx0ZnJhbWUgPSB0aGlzO1xuXG5cdFx0dmlldy5zZXQoe1xuXHRcdFx0Y2FuY2VsOiB7XG5cdFx0XHRcdHRleHQ6ICAgICBsMTBuLmNhbmNlbEdhbGxlcnlUaXRsZSxcblx0XHRcdFx0cHJpb3JpdHk6IDIwLFxuXHRcdFx0XHRjbGljazogICAgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKCBwcmV2aW91cyApIHtcblx0XHRcdFx0XHRcdGZyYW1lLnNldFN0YXRlKCBwcmV2aW91cyApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRmcmFtZS5jbG9zZSgpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIEtlZXAgZm9jdXMgaW5zaWRlIG1lZGlhIG1vZGFsXG5cdFx0XHRcdFx0Ly8gYWZ0ZXIgY2FuY2VsaW5nIGEgZ2FsbGVyeVxuXHRcdFx0XHRcdHRoaXMuY29udHJvbGxlci5tb2RhbC5mb2N1c01hbmFnZXIuZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHNlcGFyYXRlQ2FuY2VsOiBuZXcgd3AubWVkaWEuVmlldyh7XG5cdFx0XHRcdGNsYXNzTmFtZTogJ3NlcGFyYXRvcicsXG5cdFx0XHRcdHByaW9yaXR5OiA0MFxuXHRcdFx0fSlcblx0XHR9KTtcblx0fSxcblxuXHRwbGF5bGlzdE1lbnU6IGZ1bmN0aW9uKCB2aWV3ICkge1xuXHRcdHZhciBsYXN0U3RhdGUgPSB0aGlzLmxhc3RTdGF0ZSgpLFxuXHRcdFx0cHJldmlvdXMgPSBsYXN0U3RhdGUgJiYgbGFzdFN0YXRlLmlkLFxuXHRcdFx0ZnJhbWUgPSB0aGlzO1xuXG5cdFx0dmlldy5zZXQoe1xuXHRcdFx0Y2FuY2VsOiB7XG5cdFx0XHRcdHRleHQ6ICAgICBsMTBuLmNhbmNlbFBsYXlsaXN0VGl0bGUsXG5cdFx0XHRcdHByaW9yaXR5OiAyMCxcblx0XHRcdFx0Y2xpY2s6ICAgIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICggcHJldmlvdXMgKSB7XG5cdFx0XHRcdFx0XHRmcmFtZS5zZXRTdGF0ZSggcHJldmlvdXMgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZnJhbWUuY2xvc2UoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRzZXBhcmF0ZUNhbmNlbDogbmV3IHdwLm1lZGlhLlZpZXcoe1xuXHRcdFx0XHRjbGFzc05hbWU6ICdzZXBhcmF0b3InLFxuXHRcdFx0XHRwcmlvcml0eTogNDBcblx0XHRcdH0pXG5cdFx0fSk7XG5cdH0sXG5cblx0dmlkZW9QbGF5bGlzdE1lbnU6IGZ1bmN0aW9uKCB2aWV3ICkge1xuXHRcdHZhciBsYXN0U3RhdGUgPSB0aGlzLmxhc3RTdGF0ZSgpLFxuXHRcdFx0cHJldmlvdXMgPSBsYXN0U3RhdGUgJiYgbGFzdFN0YXRlLmlkLFxuXHRcdFx0ZnJhbWUgPSB0aGlzO1xuXG5cdFx0dmlldy5zZXQoe1xuXHRcdFx0Y2FuY2VsOiB7XG5cdFx0XHRcdHRleHQ6ICAgICBsMTBuLmNhbmNlbFZpZGVvUGxheWxpc3RUaXRsZSxcblx0XHRcdFx0cHJpb3JpdHk6IDIwLFxuXHRcdFx0XHRjbGljazogICAgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKCBwcmV2aW91cyApIHtcblx0XHRcdFx0XHRcdGZyYW1lLnNldFN0YXRlKCBwcmV2aW91cyApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRmcmFtZS5jbG9zZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHNlcGFyYXRlQ2FuY2VsOiBuZXcgd3AubWVkaWEuVmlldyh7XG5cdFx0XHRcdGNsYXNzTmFtZTogJ3NlcGFyYXRvcicsXG5cdFx0XHRcdHByaW9yaXR5OiA0MFxuXHRcdFx0fSlcblx0XHR9KTtcblx0fSxcblxuXHQvLyBDb250ZW50XG5cdGVtYmVkQ29udGVudDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHZpZXcgPSBuZXcgd3AubWVkaWEudmlldy5FbWJlZCh7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0bW9kZWw6ICAgICAgdGhpcy5zdGF0ZSgpXG5cdFx0fSkucmVuZGVyKCk7XG5cblx0XHR0aGlzLmNvbnRlbnQuc2V0KCB2aWV3ICk7XG5cblx0XHRpZiAoICEgd3AubWVkaWEuaXNUb3VjaERldmljZSApIHtcblx0XHRcdHZpZXcudXJsLmZvY3VzKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGVkaXRTZWxlY3Rpb25Db250ZW50OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc3RhdGUgPSB0aGlzLnN0YXRlKCksXG5cdFx0XHRzZWxlY3Rpb24gPSBzdGF0ZS5nZXQoJ3NlbGVjdGlvbicpLFxuXHRcdFx0dmlldztcblxuXHRcdHZpZXcgPSBuZXcgd3AubWVkaWEudmlldy5BdHRhY2htZW50c0Jyb3dzZXIoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcyxcblx0XHRcdGNvbGxlY3Rpb246IHNlbGVjdGlvbixcblx0XHRcdHNlbGVjdGlvbjogIHNlbGVjdGlvbixcblx0XHRcdG1vZGVsOiAgICAgIHN0YXRlLFxuXHRcdFx0c29ydGFibGU6ICAgdHJ1ZSxcblx0XHRcdHNlYXJjaDogICAgIGZhbHNlLFxuXHRcdFx0ZGF0ZTogICAgICAgZmFsc2UsXG5cdFx0XHRkcmFnSW5mbzogICB0cnVlLFxuXG5cdFx0XHRBdHRhY2htZW50Vmlldzogd3AubWVkaWEudmlldy5BdHRhY2htZW50cy5FZGl0U2VsZWN0aW9uXG5cdFx0fSkucmVuZGVyKCk7XG5cblx0XHR2aWV3LnRvb2xiYXIuc2V0KCAnYmFja1RvTGlicmFyeScsIHtcblx0XHRcdHRleHQ6ICAgICBsMTBuLnJldHVyblRvTGlicmFyeSxcblx0XHRcdHByaW9yaXR5OiAtMTAwLFxuXG5cdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRoaXMuY29udHJvbGxlci5jb250ZW50Lm1vZGUoJ2Jyb3dzZScpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gQnJvd3NlIG91ciBsaWJyYXJ5IG9mIGF0dGFjaG1lbnRzLlxuXHRcdHRoaXMuY29udGVudC5zZXQoIHZpZXcgKTtcblxuXHRcdC8vIFRyaWdnZXIgdGhlIGNvbnRyb2xsZXIgdG8gc2V0IGZvY3VzXG5cdFx0dGhpcy50cmlnZ2VyKCAnZWRpdDpzZWxlY3Rpb24nLCB0aGlzICk7XG5cdH0sXG5cblx0ZWRpdEltYWdlQ29udGVudDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGltYWdlID0gdGhpcy5zdGF0ZSgpLmdldCgnaW1hZ2UnKSxcblx0XHRcdHZpZXcgPSBuZXcgd3AubWVkaWEudmlldy5FZGl0SW1hZ2UoIHsgbW9kZWw6IGltYWdlLCBjb250cm9sbGVyOiB0aGlzIH0gKS5yZW5kZXIoKTtcblxuXHRcdHRoaXMuY29udGVudC5zZXQoIHZpZXcgKTtcblxuXHRcdC8vIGFmdGVyIGNyZWF0aW5nIHRoZSB3cmFwcGVyIHZpZXcsIGxvYWQgdGhlIGFjdHVhbCBlZGl0b3IgdmlhIGFuIGFqYXggY2FsbFxuXHRcdHZpZXcubG9hZEVkaXRvcigpO1xuXG5cdH0sXG5cblx0Ly8gVG9vbGJhcnNcblxuXHQvKipcblx0ICogQHBhcmFtIHt3cC5CYWNrYm9uZS5WaWV3fSB2aWV3XG5cdCAqL1xuXHRzZWxlY3Rpb25TdGF0dXNUb29sYmFyOiBmdW5jdGlvbiggdmlldyApIHtcblx0XHR2YXIgZWRpdGFibGUgPSB0aGlzLnN0YXRlKCkuZ2V0KCdlZGl0YWJsZScpO1xuXG5cdFx0dmlldy5zZXQoICdzZWxlY3Rpb24nLCBuZXcgd3AubWVkaWEudmlldy5TZWxlY3Rpb24oe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcyxcblx0XHRcdGNvbGxlY3Rpb246IHRoaXMuc3RhdGUoKS5nZXQoJ3NlbGVjdGlvbicpLFxuXHRcdFx0cHJpb3JpdHk6ICAgLTQwLFxuXG5cdFx0XHQvLyBJZiB0aGUgc2VsZWN0aW9uIGlzIGVkaXRhYmxlLCBwYXNzIHRoZSBjYWxsYmFjayB0b1xuXHRcdFx0Ly8gc3dpdGNoIHRoZSBjb250ZW50IG1vZGUuXG5cdFx0XHRlZGl0YWJsZTogZWRpdGFibGUgJiYgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRoaXMuY29udHJvbGxlci5jb250ZW50Lm1vZGUoJ2VkaXQtc2VsZWN0aW9uJyk7XG5cdFx0XHR9XG5cdFx0fSkucmVuZGVyKCkgKTtcblx0fSxcblxuXHQvKipcblx0ICogQHBhcmFtIHt3cC5CYWNrYm9uZS5WaWV3fSB2aWV3XG5cdCAqL1xuXHRtYWluSW5zZXJ0VG9vbGJhcjogZnVuY3Rpb24oIHZpZXcgKSB7XG5cdFx0dmFyIGNvbnRyb2xsZXIgPSB0aGlzO1xuXG5cdFx0dGhpcy5zZWxlY3Rpb25TdGF0dXNUb29sYmFyKCB2aWV3ICk7XG5cblx0XHR2aWV3LnNldCggJ2luc2VydCcsIHtcblx0XHRcdHN0eWxlOiAgICAncHJpbWFyeScsXG5cdFx0XHRwcmlvcml0eTogODAsXG5cdFx0XHR0ZXh0OiAgICAgbDEwbi5pbnNlcnRJbnRvUG9zdCxcblx0XHRcdHJlcXVpcmVzOiB7IHNlbGVjdGlvbjogdHJ1ZSB9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEBmaXJlcyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlI2luc2VydFxuXHRcdFx0ICovXG5cdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzdGF0ZSA9IGNvbnRyb2xsZXIuc3RhdGUoKSxcblx0XHRcdFx0XHRzZWxlY3Rpb24gPSBzdGF0ZS5nZXQoJ3NlbGVjdGlvbicpO1xuXG5cdFx0XHRcdGNvbnRyb2xsZXIuY2xvc2UoKTtcblx0XHRcdFx0c3RhdGUudHJpZ2dlciggJ2luc2VydCcsIHNlbGVjdGlvbiApLnJlc2V0KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7d3AuQmFja2JvbmUuVmlld30gdmlld1xuXHQgKi9cblx0bWFpbkdhbGxlcnlUb29sYmFyOiBmdW5jdGlvbiggdmlldyApIHtcblx0XHR2YXIgY29udHJvbGxlciA9IHRoaXM7XG5cblx0XHR0aGlzLnNlbGVjdGlvblN0YXR1c1Rvb2xiYXIoIHZpZXcgKTtcblxuXHRcdHZpZXcuc2V0KCAnZ2FsbGVyeScsIHtcblx0XHRcdHN0eWxlOiAgICAncHJpbWFyeScsXG5cdFx0XHR0ZXh0OiAgICAgbDEwbi5jcmVhdGVOZXdHYWxsZXJ5LFxuXHRcdFx0cHJpb3JpdHk6IDYwLFxuXHRcdFx0cmVxdWlyZXM6IHsgc2VsZWN0aW9uOiB0cnVlIH0sXG5cblx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHNlbGVjdGlvbiA9IGNvbnRyb2xsZXIuc3RhdGUoKS5nZXQoJ3NlbGVjdGlvbicpLFxuXHRcdFx0XHRcdGVkaXQgPSBjb250cm9sbGVyLnN0YXRlKCdnYWxsZXJ5LWVkaXQnKSxcblx0XHRcdFx0XHRtb2RlbHMgPSBzZWxlY3Rpb24ud2hlcmUoeyB0eXBlOiAnaW1hZ2UnIH0pO1xuXG5cdFx0XHRcdGVkaXQuc2V0KCAnbGlicmFyeScsIG5ldyB3cC5tZWRpYS5tb2RlbC5TZWxlY3Rpb24oIG1vZGVscywge1xuXHRcdFx0XHRcdHByb3BzOiAgICBzZWxlY3Rpb24ucHJvcHMudG9KU09OKCksXG5cdFx0XHRcdFx0bXVsdGlwbGU6IHRydWVcblx0XHRcdFx0fSkgKTtcblxuXHRcdFx0XHR0aGlzLmNvbnRyb2xsZXIuc2V0U3RhdGUoJ2dhbGxlcnktZWRpdCcpO1xuXG5cdFx0XHRcdC8vIEtlZXAgZm9jdXMgaW5zaWRlIG1lZGlhIG1vZGFsXG5cdFx0XHRcdC8vIGFmdGVyIGp1bXBpbmcgdG8gZ2FsbGVyeSB2aWV3XG5cdFx0XHRcdHRoaXMuY29udHJvbGxlci5tb2RhbC5mb2N1c01hbmFnZXIuZm9jdXMoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRtYWluUGxheWxpc3RUb29sYmFyOiBmdW5jdGlvbiggdmlldyApIHtcblx0XHR2YXIgY29udHJvbGxlciA9IHRoaXM7XG5cblx0XHR0aGlzLnNlbGVjdGlvblN0YXR1c1Rvb2xiYXIoIHZpZXcgKTtcblxuXHRcdHZpZXcuc2V0KCAncGxheWxpc3QnLCB7XG5cdFx0XHRzdHlsZTogICAgJ3ByaW1hcnknLFxuXHRcdFx0dGV4dDogICAgIGwxMG4uY3JlYXRlTmV3UGxheWxpc3QsXG5cdFx0XHRwcmlvcml0eTogMTAwLFxuXHRcdFx0cmVxdWlyZXM6IHsgc2VsZWN0aW9uOiB0cnVlIH0sXG5cblx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHNlbGVjdGlvbiA9IGNvbnRyb2xsZXIuc3RhdGUoKS5nZXQoJ3NlbGVjdGlvbicpLFxuXHRcdFx0XHRcdGVkaXQgPSBjb250cm9sbGVyLnN0YXRlKCdwbGF5bGlzdC1lZGl0JyksXG5cdFx0XHRcdFx0bW9kZWxzID0gc2VsZWN0aW9uLndoZXJlKHsgdHlwZTogJ2F1ZGlvJyB9KTtcblxuXHRcdFx0XHRlZGl0LnNldCggJ2xpYnJhcnknLCBuZXcgd3AubWVkaWEubW9kZWwuU2VsZWN0aW9uKCBtb2RlbHMsIHtcblx0XHRcdFx0XHRwcm9wczogICAgc2VsZWN0aW9uLnByb3BzLnRvSlNPTigpLFxuXHRcdFx0XHRcdG11bHRpcGxlOiB0cnVlXG5cdFx0XHRcdH0pICk7XG5cblx0XHRcdFx0dGhpcy5jb250cm9sbGVyLnNldFN0YXRlKCdwbGF5bGlzdC1lZGl0Jyk7XG5cblx0XHRcdFx0Ly8gS2VlcCBmb2N1cyBpbnNpZGUgbWVkaWEgbW9kYWxcblx0XHRcdFx0Ly8gYWZ0ZXIganVtcGluZyB0byBwbGF5bGlzdCB2aWV3XG5cdFx0XHRcdHRoaXMuY29udHJvbGxlci5tb2RhbC5mb2N1c01hbmFnZXIuZm9jdXMoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRtYWluVmlkZW9QbGF5bGlzdFRvb2xiYXI6IGZ1bmN0aW9uKCB2aWV3ICkge1xuXHRcdHZhciBjb250cm9sbGVyID0gdGhpcztcblxuXHRcdHRoaXMuc2VsZWN0aW9uU3RhdHVzVG9vbGJhciggdmlldyApO1xuXG5cdFx0dmlldy5zZXQoICd2aWRlby1wbGF5bGlzdCcsIHtcblx0XHRcdHN0eWxlOiAgICAncHJpbWFyeScsXG5cdFx0XHR0ZXh0OiAgICAgbDEwbi5jcmVhdGVOZXdWaWRlb1BsYXlsaXN0LFxuXHRcdFx0cHJpb3JpdHk6IDEwMCxcblx0XHRcdHJlcXVpcmVzOiB7IHNlbGVjdGlvbjogdHJ1ZSB9LFxuXG5cdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzZWxlY3Rpb24gPSBjb250cm9sbGVyLnN0YXRlKCkuZ2V0KCdzZWxlY3Rpb24nKSxcblx0XHRcdFx0XHRlZGl0ID0gY29udHJvbGxlci5zdGF0ZSgndmlkZW8tcGxheWxpc3QtZWRpdCcpLFxuXHRcdFx0XHRcdG1vZGVscyA9IHNlbGVjdGlvbi53aGVyZSh7IHR5cGU6ICd2aWRlbycgfSk7XG5cblx0XHRcdFx0ZWRpdC5zZXQoICdsaWJyYXJ5JywgbmV3IHdwLm1lZGlhLm1vZGVsLlNlbGVjdGlvbiggbW9kZWxzLCB7XG5cdFx0XHRcdFx0cHJvcHM6ICAgIHNlbGVjdGlvbi5wcm9wcy50b0pTT04oKSxcblx0XHRcdFx0XHRtdWx0aXBsZTogdHJ1ZVxuXHRcdFx0XHR9KSApO1xuXG5cdFx0XHRcdHRoaXMuY29udHJvbGxlci5zZXRTdGF0ZSgndmlkZW8tcGxheWxpc3QtZWRpdCcpO1xuXG5cdFx0XHRcdC8vIEtlZXAgZm9jdXMgaW5zaWRlIG1lZGlhIG1vZGFsXG5cdFx0XHRcdC8vIGFmdGVyIGp1bXBpbmcgdG8gdmlkZW8gcGxheWxpc3Qgdmlld1xuXHRcdFx0XHR0aGlzLmNvbnRyb2xsZXIubW9kYWwuZm9jdXNNYW5hZ2VyLmZvY3VzKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0ZmVhdHVyZWRJbWFnZVRvb2xiYXI6IGZ1bmN0aW9uKCB0b29sYmFyICkge1xuXHRcdHRoaXMuY3JlYXRlU2VsZWN0VG9vbGJhciggdG9vbGJhciwge1xuXHRcdFx0dGV4dDogIGwxMG4uc2V0RmVhdHVyZWRJbWFnZSxcblx0XHRcdHN0YXRlOiB0aGlzLm9wdGlvbnMuc3RhdGVcblx0XHR9KTtcblx0fSxcblxuXHRtYWluRW1iZWRUb29sYmFyOiBmdW5jdGlvbiggdG9vbGJhciApIHtcblx0XHR0b29sYmFyLnZpZXcgPSBuZXcgd3AubWVkaWEudmlldy5Ub29sYmFyLkVtYmVkKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXNcblx0XHR9KTtcblx0fSxcblxuXHRnYWxsZXJ5RWRpdFRvb2xiYXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBlZGl0aW5nID0gdGhpcy5zdGF0ZSgpLmdldCgnZWRpdGluZycpO1xuXHRcdHRoaXMudG9vbGJhci5zZXQoIG5ldyB3cC5tZWRpYS52aWV3LlRvb2xiYXIoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcyxcblx0XHRcdGl0ZW1zOiB7XG5cdFx0XHRcdGluc2VydDoge1xuXHRcdFx0XHRcdHN0eWxlOiAgICAncHJpbWFyeScsXG5cdFx0XHRcdFx0dGV4dDogICAgIGVkaXRpbmcgPyBsMTBuLnVwZGF0ZUdhbGxlcnkgOiBsMTBuLmluc2VydEdhbGxlcnksXG5cdFx0XHRcdFx0cHJpb3JpdHk6IDgwLFxuXHRcdFx0XHRcdHJlcXVpcmVzOiB7IGxpYnJhcnk6IHRydWUgfSxcblxuXHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdCAqIEBmaXJlcyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlI3VwZGF0ZVxuXHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBjb250cm9sbGVyID0gdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRcdFx0XHRzdGF0ZSA9IGNvbnRyb2xsZXIuc3RhdGUoKTtcblxuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0c3RhdGUudHJpZ2dlciggJ3VwZGF0ZScsIHN0YXRlLmdldCgnbGlicmFyeScpICk7XG5cblx0XHRcdFx0XHRcdC8vIFJlc3RvcmUgYW5kIHJlc2V0IHRoZSBkZWZhdWx0IHN0YXRlLlxuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5zZXRTdGF0ZSggY29udHJvbGxlci5vcHRpb25zLnN0YXRlICk7XG5cdFx0XHRcdFx0XHRjb250cm9sbGVyLnJlc2V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSkgKTtcblx0fSxcblxuXHRnYWxsZXJ5QWRkVG9vbGJhcjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy50b29sYmFyLnNldCggbmV3IHdwLm1lZGlhLnZpZXcuVG9vbGJhcih7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0aXRlbXM6IHtcblx0XHRcdFx0aW5zZXJ0OiB7XG5cdFx0XHRcdFx0c3R5bGU6ICAgICdwcmltYXJ5Jyxcblx0XHRcdFx0XHR0ZXh0OiAgICAgbDEwbi5hZGRUb0dhbGxlcnksXG5cdFx0XHRcdFx0cHJpb3JpdHk6IDgwLFxuXHRcdFx0XHRcdHJlcXVpcmVzOiB7IHNlbGVjdGlvbjogdHJ1ZSB9LFxuXG5cdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0ICogQGZpcmVzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGUjcmVzZXRcblx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29udHJvbGxlciA9IHRoaXMuY29udHJvbGxlcixcblx0XHRcdFx0XHRcdFx0c3RhdGUgPSBjb250cm9sbGVyLnN0YXRlKCksXG5cdFx0XHRcdFx0XHRcdGVkaXQgPSBjb250cm9sbGVyLnN0YXRlKCdnYWxsZXJ5LWVkaXQnKTtcblxuXHRcdFx0XHRcdFx0ZWRpdC5nZXQoJ2xpYnJhcnknKS5hZGQoIHN0YXRlLmdldCgnc2VsZWN0aW9uJykubW9kZWxzICk7XG5cdFx0XHRcdFx0XHRzdGF0ZS50cmlnZ2VyKCdyZXNldCcpO1xuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5zZXRTdGF0ZSgnZ2FsbGVyeS1lZGl0Jyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSkgKTtcblx0fSxcblxuXHRwbGF5bGlzdEVkaXRUb29sYmFyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZWRpdGluZyA9IHRoaXMuc3RhdGUoKS5nZXQoJ2VkaXRpbmcnKTtcblx0XHR0aGlzLnRvb2xiYXIuc2V0KCBuZXcgd3AubWVkaWEudmlldy5Ub29sYmFyKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRpdGVtczoge1xuXHRcdFx0XHRpbnNlcnQ6IHtcblx0XHRcdFx0XHRzdHlsZTogICAgJ3ByaW1hcnknLFxuXHRcdFx0XHRcdHRleHQ6ICAgICBlZGl0aW5nID8gbDEwbi51cGRhdGVQbGF5bGlzdCA6IGwxMG4uaW5zZXJ0UGxheWxpc3QsXG5cdFx0XHRcdFx0cHJpb3JpdHk6IDgwLFxuXHRcdFx0XHRcdHJlcXVpcmVzOiB7IGxpYnJhcnk6IHRydWUgfSxcblxuXHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdCAqIEBmaXJlcyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlI3VwZGF0ZVxuXHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBjb250cm9sbGVyID0gdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRcdFx0XHRzdGF0ZSA9IGNvbnRyb2xsZXIuc3RhdGUoKTtcblxuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0c3RhdGUudHJpZ2dlciggJ3VwZGF0ZScsIHN0YXRlLmdldCgnbGlicmFyeScpICk7XG5cblx0XHRcdFx0XHRcdC8vIFJlc3RvcmUgYW5kIHJlc2V0IHRoZSBkZWZhdWx0IHN0YXRlLlxuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5zZXRTdGF0ZSggY29udHJvbGxlci5vcHRpb25zLnN0YXRlICk7XG5cdFx0XHRcdFx0XHRjb250cm9sbGVyLnJlc2V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSkgKTtcblx0fSxcblxuXHRwbGF5bGlzdEFkZFRvb2xiYXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudG9vbGJhci5zZXQoIG5ldyB3cC5tZWRpYS52aWV3LlRvb2xiYXIoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcyxcblx0XHRcdGl0ZW1zOiB7XG5cdFx0XHRcdGluc2VydDoge1xuXHRcdFx0XHRcdHN0eWxlOiAgICAncHJpbWFyeScsXG5cdFx0XHRcdFx0dGV4dDogICAgIGwxMG4uYWRkVG9QbGF5bGlzdCxcblx0XHRcdFx0XHRwcmlvcml0eTogODAsXG5cdFx0XHRcdFx0cmVxdWlyZXM6IHsgc2VsZWN0aW9uOiB0cnVlIH0sXG5cblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiBAZmlyZXMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZSNyZXNldFxuXHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBjb250cm9sbGVyID0gdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRcdFx0XHRzdGF0ZSA9IGNvbnRyb2xsZXIuc3RhdGUoKSxcblx0XHRcdFx0XHRcdFx0ZWRpdCA9IGNvbnRyb2xsZXIuc3RhdGUoJ3BsYXlsaXN0LWVkaXQnKTtcblxuXHRcdFx0XHRcdFx0ZWRpdC5nZXQoJ2xpYnJhcnknKS5hZGQoIHN0YXRlLmdldCgnc2VsZWN0aW9uJykubW9kZWxzICk7XG5cdFx0XHRcdFx0XHRzdGF0ZS50cmlnZ2VyKCdyZXNldCcpO1xuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5zZXRTdGF0ZSgncGxheWxpc3QtZWRpdCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pICk7XG5cdH0sXG5cblx0dmlkZW9QbGF5bGlzdEVkaXRUb29sYmFyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZWRpdGluZyA9IHRoaXMuc3RhdGUoKS5nZXQoJ2VkaXRpbmcnKTtcblx0XHR0aGlzLnRvb2xiYXIuc2V0KCBuZXcgd3AubWVkaWEudmlldy5Ub29sYmFyKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRpdGVtczoge1xuXHRcdFx0XHRpbnNlcnQ6IHtcblx0XHRcdFx0XHRzdHlsZTogICAgJ3ByaW1hcnknLFxuXHRcdFx0XHRcdHRleHQ6ICAgICBlZGl0aW5nID8gbDEwbi51cGRhdGVWaWRlb1BsYXlsaXN0IDogbDEwbi5pbnNlcnRWaWRlb1BsYXlsaXN0LFxuXHRcdFx0XHRcdHByaW9yaXR5OiAxNDAsXG5cdFx0XHRcdFx0cmVxdWlyZXM6IHsgbGlicmFyeTogdHJ1ZSB9LFxuXG5cdFx0XHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGNvbnRyb2xsZXIgPSB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRcdFx0XHRcdHN0YXRlID0gY29udHJvbGxlci5zdGF0ZSgpLFxuXHRcdFx0XHRcdFx0XHRsaWJyYXJ5ID0gc3RhdGUuZ2V0KCdsaWJyYXJ5Jyk7XG5cblx0XHRcdFx0XHRcdGxpYnJhcnkudHlwZSA9ICd2aWRlbyc7XG5cblx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuY2xvc2UoKTtcblx0XHRcdFx0XHRcdHN0YXRlLnRyaWdnZXIoICd1cGRhdGUnLCBsaWJyYXJ5ICk7XG5cblx0XHRcdFx0XHRcdC8vIFJlc3RvcmUgYW5kIHJlc2V0IHRoZSBkZWZhdWx0IHN0YXRlLlxuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5zZXRTdGF0ZSggY29udHJvbGxlci5vcHRpb25zLnN0YXRlICk7XG5cdFx0XHRcdFx0XHRjb250cm9sbGVyLnJlc2V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSkgKTtcblx0fSxcblxuXHR2aWRlb1BsYXlsaXN0QWRkVG9vbGJhcjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy50b29sYmFyLnNldCggbmV3IHdwLm1lZGlhLnZpZXcuVG9vbGJhcih7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0aXRlbXM6IHtcblx0XHRcdFx0aW5zZXJ0OiB7XG5cdFx0XHRcdFx0c3R5bGU6ICAgICdwcmltYXJ5Jyxcblx0XHRcdFx0XHR0ZXh0OiAgICAgbDEwbi5hZGRUb1ZpZGVvUGxheWxpc3QsXG5cdFx0XHRcdFx0cHJpb3JpdHk6IDE0MCxcblx0XHRcdFx0XHRyZXF1aXJlczogeyBzZWxlY3Rpb246IHRydWUgfSxcblxuXHRcdFx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBjb250cm9sbGVyID0gdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRcdFx0XHRzdGF0ZSA9IGNvbnRyb2xsZXIuc3RhdGUoKSxcblx0XHRcdFx0XHRcdFx0ZWRpdCA9IGNvbnRyb2xsZXIuc3RhdGUoJ3ZpZGVvLXBsYXlsaXN0LWVkaXQnKTtcblxuXHRcdFx0XHRcdFx0ZWRpdC5nZXQoJ2xpYnJhcnknKS5hZGQoIHN0YXRlLmdldCgnc2VsZWN0aW9uJykubW9kZWxzICk7XG5cdFx0XHRcdFx0XHRzdGF0ZS50cmlnZ2VyKCdyZXNldCcpO1xuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5zZXRTdGF0ZSgndmlkZW8tcGxheWxpc3QtZWRpdCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvc3Q7XG4iLCIvKmdsb2JhbHMgd3AsIF8gKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWUuU2VsZWN0XG4gKlxuICogQSBmcmFtZSBmb3Igc2VsZWN0aW5nIGFuIGl0ZW0gb3IgaXRlbXMgZnJvbSB0aGUgbWVkaWEgbGlicmFyeS5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWVcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkZyYW1lXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKiBAbWl4ZXMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZU1hY2hpbmVcbiAqL1xuXG52YXIgTWVkaWFGcmFtZSA9IHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZSxcblx0bDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0U2VsZWN0O1xuXG5TZWxlY3QgPSBNZWRpYUZyYW1lLmV4dGVuZCh7XG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIENhbGwgJ2luaXRpYWxpemUnIGRpcmVjdGx5IG9uIHRoZSBwYXJlbnQgY2xhc3MuXG5cdFx0TWVkaWFGcmFtZS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHRfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdHNlbGVjdGlvbjogW10sXG5cdFx0XHRsaWJyYXJ5OiAgIHt9LFxuXHRcdFx0bXVsdGlwbGU6ICBmYWxzZSxcblx0XHRcdHN0YXRlOiAgICAnbGlicmFyeSdcblx0XHR9KTtcblxuXHRcdHRoaXMuY3JlYXRlU2VsZWN0aW9uKCk7XG5cdFx0dGhpcy5jcmVhdGVTdGF0ZXMoKTtcblx0XHR0aGlzLmJpbmRIYW5kbGVycygpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBdHRhY2ggYSBzZWxlY3Rpb24gY29sbGVjdGlvbiB0byB0aGUgZnJhbWUuXG5cdCAqXG5cdCAqIEEgc2VsZWN0aW9uIGlzIGEgY29sbGVjdGlvbiBvZiBhdHRhY2htZW50cyB1c2VkIGZvciBhIHNwZWNpZmljIHB1cnBvc2Vcblx0ICogYnkgYSBtZWRpYSBmcmFtZS4gZS5nLiBTZWxlY3RpbmcgYW4gYXR0YWNobWVudCAob3IgbWFueSkgdG8gaW5zZXJ0IGludG9cblx0ICogcG9zdCBjb250ZW50LlxuXHQgKlxuXHQgKiBAc2VlIG1lZGlhLm1vZGVsLlNlbGVjdGlvblxuXHQgKi9cblx0Y3JlYXRlU2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5vcHRpb25zLnNlbGVjdGlvbjtcblxuXHRcdGlmICggISAoc2VsZWN0aW9uIGluc3RhbmNlb2Ygd3AubWVkaWEubW9kZWwuU2VsZWN0aW9uKSApIHtcblx0XHRcdHRoaXMub3B0aW9ucy5zZWxlY3Rpb24gPSBuZXcgd3AubWVkaWEubW9kZWwuU2VsZWN0aW9uKCBzZWxlY3Rpb24sIHtcblx0XHRcdFx0bXVsdGlwbGU6IHRoaXMub3B0aW9ucy5tdWx0aXBsZVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fc2VsZWN0aW9uID0ge1xuXHRcdFx0YXR0YWNobWVudHM6IG5ldyB3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50cygpLFxuXHRcdFx0ZGlmZmVyZW5jZTogW11cblx0XHR9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgdGhlIGRlZmF1bHQgc3RhdGVzIG9uIHRoZSBmcmFtZS5cblx0ICovXG5cdGNyZWF0ZVN0YXRlczogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5zdGF0ZXMgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gQWRkIHRoZSBkZWZhdWx0IHN0YXRlcy5cblx0XHR0aGlzLnN0YXRlcy5hZGQoW1xuXHRcdFx0Ly8gTWFpbiBzdGF0ZXMuXG5cdFx0XHRuZXcgd3AubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5KHtcblx0XHRcdFx0bGlicmFyeTogICB3cC5tZWRpYS5xdWVyeSggb3B0aW9ucy5saWJyYXJ5ICksXG5cdFx0XHRcdG11bHRpcGxlOiAgb3B0aW9ucy5tdWx0aXBsZSxcblx0XHRcdFx0dGl0bGU6ICAgICBvcHRpb25zLnRpdGxlLFxuXHRcdFx0XHRwcmlvcml0eTogIDIwXG5cdFx0XHR9KVxuXHRcdF0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBCaW5kIHJlZ2lvbiBtb2RlIGV2ZW50IGNhbGxiYWNrcy5cblx0ICpcblx0ICogQHNlZSBtZWRpYS5jb250cm9sbGVyLlJlZ2lvbi5yZW5kZXJcblx0ICovXG5cdGJpbmRIYW5kbGVyczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5vbiggJ3JvdXRlcjpjcmVhdGU6YnJvd3NlJywgdGhpcy5jcmVhdGVSb3V0ZXIsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAncm91dGVyOnJlbmRlcjpicm93c2UnLCB0aGlzLmJyb3dzZVJvdXRlciwgdGhpcyApO1xuXHRcdHRoaXMub24oICdjb250ZW50OmNyZWF0ZTpicm93c2UnLCB0aGlzLmJyb3dzZUNvbnRlbnQsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnY29udGVudDpyZW5kZXI6dXBsb2FkJywgdGhpcy51cGxvYWRDb250ZW50LCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ3Rvb2xiYXI6Y3JlYXRlOnNlbGVjdCcsIHRoaXMuY3JlYXRlU2VsZWN0VG9vbGJhciwgdGhpcyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW5kZXIgY2FsbGJhY2sgZm9yIHRoZSByb3V0ZXIgcmVnaW9uIGluIHRoZSBgYnJvd3NlYCBtb2RlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3dwLm1lZGlhLnZpZXcuUm91dGVyfSByb3V0ZXJWaWV3XG5cdCAqL1xuXHRicm93c2VSb3V0ZXI6IGZ1bmN0aW9uKCByb3V0ZXJWaWV3ICkge1xuXHRcdHJvdXRlclZpZXcuc2V0KHtcblx0XHRcdHVwbG9hZDoge1xuXHRcdFx0XHR0ZXh0OiAgICAgbDEwbi51cGxvYWRGaWxlc1RpdGxlLFxuXHRcdFx0XHRwcmlvcml0eTogMjBcblx0XHRcdH0sXG5cdFx0XHRicm93c2U6IHtcblx0XHRcdFx0dGV4dDogICAgIGwxMG4ubWVkaWFMaWJyYXJ5VGl0bGUsXG5cdFx0XHRcdHByaW9yaXR5OiA0MFxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW5kZXIgY2FsbGJhY2sgZm9yIHRoZSBjb250ZW50IHJlZ2lvbiBpbiB0aGUgYGJyb3dzZWAgbW9kZS5cblx0ICpcblx0ICogQHBhcmFtIHt3cC5tZWRpYS5jb250cm9sbGVyLlJlZ2lvbn0gY29udGVudFJlZ2lvblxuXHQgKi9cblx0YnJvd3NlQ29udGVudDogZnVuY3Rpb24oIGNvbnRlbnRSZWdpb24gKSB7XG5cdFx0dmFyIHN0YXRlID0gdGhpcy5zdGF0ZSgpO1xuXG5cdFx0dGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ2hpZGUtdG9vbGJhcicpO1xuXG5cdFx0Ly8gQnJvd3NlIG91ciBsaWJyYXJ5IG9mIGF0dGFjaG1lbnRzLlxuXHRcdGNvbnRlbnRSZWdpb24udmlldyA9IG5ldyB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRzQnJvd3Nlcih7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0Y29sbGVjdGlvbjogc3RhdGUuZ2V0KCdsaWJyYXJ5JyksXG5cdFx0XHRzZWxlY3Rpb246ICBzdGF0ZS5nZXQoJ3NlbGVjdGlvbicpLFxuXHRcdFx0bW9kZWw6ICAgICAgc3RhdGUsXG5cdFx0XHRzb3J0YWJsZTogICBzdGF0ZS5nZXQoJ3NvcnRhYmxlJyksXG5cdFx0XHRzZWFyY2g6ICAgICBzdGF0ZS5nZXQoJ3NlYXJjaGFibGUnKSxcblx0XHRcdGZpbHRlcnM6ICAgIHN0YXRlLmdldCgnZmlsdGVyYWJsZScpLFxuXHRcdFx0ZGF0ZTogICAgICAgc3RhdGUuZ2V0KCdkYXRlJyksXG5cdFx0XHRkaXNwbGF5OiAgICBzdGF0ZS5oYXMoJ2Rpc3BsYXknKSA/IHN0YXRlLmdldCgnZGlzcGxheScpIDogc3RhdGUuZ2V0KCdkaXNwbGF5U2V0dGluZ3MnKSxcblx0XHRcdGRyYWdJbmZvOiAgIHN0YXRlLmdldCgnZHJhZ0luZm8nKSxcblxuXHRcdFx0aWRlYWxDb2x1bW5XaWR0aDogc3RhdGUuZ2V0KCdpZGVhbENvbHVtbldpZHRoJyksXG5cdFx0XHRzdWdnZXN0ZWRXaWR0aDogICBzdGF0ZS5nZXQoJ3N1Z2dlc3RlZFdpZHRoJyksXG5cdFx0XHRzdWdnZXN0ZWRIZWlnaHQ6ICBzdGF0ZS5nZXQoJ3N1Z2dlc3RlZEhlaWdodCcpLFxuXG5cdFx0XHRBdHRhY2htZW50Vmlldzogc3RhdGUuZ2V0KCdBdHRhY2htZW50VmlldycpXG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlbmRlciBjYWxsYmFjayBmb3IgdGhlIGNvbnRlbnQgcmVnaW9uIGluIHRoZSBgdXBsb2FkYCBtb2RlLlxuXHQgKi9cblx0dXBsb2FkQ29udGVudDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZWwucmVtb3ZlQ2xhc3MoICdoaWRlLXRvb2xiYXInICk7XG5cdFx0dGhpcy5jb250ZW50LnNldCggbmV3IHdwLm1lZGlhLnZpZXcuVXBsb2FkZXJJbmxpbmUoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpc1xuXHRcdH0pICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRvb2xiYXJzXG5cdCAqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSB0b29sYmFyXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cblx0ICogQHRoaXMgd3AubWVkaWEuY29udHJvbGxlci5SZWdpb25cblx0ICovXG5cdGNyZWF0ZVNlbGVjdFRvb2xiYXI6IGZ1bmN0aW9uKCB0b29sYmFyLCBvcHRpb25zICkge1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHRoaXMub3B0aW9ucy5idXR0b24gfHwge307XG5cdFx0b3B0aW9ucy5jb250cm9sbGVyID0gdGhpcztcblxuXHRcdHRvb2xiYXIudmlldyA9IG5ldyB3cC5tZWRpYS52aWV3LlRvb2xiYXIuU2VsZWN0KCBvcHRpb25zICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdDtcbiIsIi8qKlxuICogd3AubWVkaWEudmlldy5JZnJhbWVcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIElmcmFtZSA9IHdwLm1lZGlhLlZpZXcuZXh0ZW5kKHtcblx0Y2xhc3NOYW1lOiAnbWVkaWEtaWZyYW1lJyxcblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LklmcmFtZX0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy52aWV3cy5kZXRhY2goKTtcblx0XHR0aGlzLiRlbC5odG1sKCAnPGlmcmFtZSBzcmM9XCInICsgdGhpcy5jb250cm9sbGVyLnN0YXRlKCkuZ2V0KCdzcmMnKSArICdcIiAvPicgKTtcblx0XHR0aGlzLnZpZXdzLnJlbmRlcigpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJZnJhbWU7XG4iLCIvKmdsb2JhbHMgd3AsIF8sIGpRdWVyeSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuSW1hZ2VEZXRhaWxzXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5TZXR0aW5ncy5BdHRhY2htZW50RGlzcGxheVxuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuU2V0dGluZ3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIEF0dGFjaG1lbnREaXNwbGF5ID0gd3AubWVkaWEudmlldy5TZXR0aW5ncy5BdHRhY2htZW50RGlzcGxheSxcblx0JCA9IGpRdWVyeSxcblx0SW1hZ2VEZXRhaWxzO1xuXG5JbWFnZURldGFpbHMgPSBBdHRhY2htZW50RGlzcGxheS5leHRlbmQoe1xuXHRjbGFzc05hbWU6ICdpbWFnZS1kZXRhaWxzJyxcblx0dGVtcGxhdGU6ICB3cC50ZW1wbGF0ZSgnaW1hZ2UtZGV0YWlscycpLFxuXHRldmVudHM6IF8uZGVmYXVsdHMoIEF0dGFjaG1lbnREaXNwbGF5LnByb3RvdHlwZS5ldmVudHMsIHtcblx0XHQnY2xpY2sgLmVkaXQtYXR0YWNobWVudCc6ICdlZGl0QXR0YWNobWVudCcsXG5cdFx0J2NsaWNrIC5yZXBsYWNlLWF0dGFjaG1lbnQnOiAncmVwbGFjZUF0dGFjaG1lbnQnLFxuXHRcdCdjbGljayAuYWR2YW5jZWQtdG9nZ2xlJzogJ29uVG9nZ2xlQWR2YW5jZWQnLFxuXHRcdCdjaGFuZ2UgW2RhdGEtc2V0dGluZz1cImN1c3RvbVdpZHRoXCJdJzogJ29uQ3VzdG9tU2l6ZScsXG5cdFx0J2NoYW5nZSBbZGF0YS1zZXR0aW5nPVwiY3VzdG9tSGVpZ2h0XCJdJzogJ29uQ3VzdG9tU2l6ZScsXG5cdFx0J2tleXVwIFtkYXRhLXNldHRpbmc9XCJjdXN0b21XaWR0aFwiXSc6ICdvbkN1c3RvbVNpemUnLFxuXHRcdCdrZXl1cCBbZGF0YS1zZXR0aW5nPVwiY3VzdG9tSGVpZ2h0XCJdJzogJ29uQ3VzdG9tU2l6ZSdcblx0fSApLFxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHQvLyB1c2VkIGluIEF0dGFjaG1lbnREaXNwbGF5LnByb3RvdHlwZS51cGRhdGVMaW5rVG9cblx0XHR0aGlzLm9wdGlvbnMuYXR0YWNobWVudCA9IHRoaXMubW9kZWwuYXR0YWNobWVudDtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnY2hhbmdlOnVybCcsIHRoaXMudXBkYXRlVXJsICk7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZTpsaW5rJywgdGhpcy50b2dnbGVMaW5rU2V0dGluZ3MgKTtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnY2hhbmdlOnNpemUnLCB0aGlzLnRvZ2dsZUN1c3RvbVNpemUgKTtcblxuXHRcdEF0dGFjaG1lbnREaXNwbGF5LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHRwcmVwYXJlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgYXR0YWNobWVudCA9IGZhbHNlO1xuXG5cdFx0aWYgKCB0aGlzLm1vZGVsLmF0dGFjaG1lbnQgKSB7XG5cdFx0XHRhdHRhY2htZW50ID0gdGhpcy5tb2RlbC5hdHRhY2htZW50LnRvSlNPTigpO1xuXHRcdH1cblx0XHRyZXR1cm4gXy5kZWZhdWx0cyh7XG5cdFx0XHRtb2RlbDogdGhpcy5tb2RlbC50b0pTT04oKSxcblx0XHRcdGF0dGFjaG1lbnQ6IGF0dGFjaG1lbnRcblx0XHR9LCB0aGlzLm9wdGlvbnMgKTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhcmdzID0gYXJndW1lbnRzO1xuXG5cdFx0aWYgKCB0aGlzLm1vZGVsLmF0dGFjaG1lbnQgJiYgJ3BlbmRpbmcnID09PSB0aGlzLm1vZGVsLmRmZC5zdGF0ZSgpICkge1xuXHRcdFx0dGhpcy5tb2RlbC5kZmRcblx0XHRcdFx0LmRvbmUoIF8uYmluZCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0QXR0YWNobWVudERpc3BsYXkucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcywgYXJncyApO1xuXHRcdFx0XHRcdHRoaXMucG9zdFJlbmRlcigpO1xuXHRcdFx0XHR9LCB0aGlzICkgKVxuXHRcdFx0XHQuZmFpbCggXy5iaW5kKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGlzLm1vZGVsLmF0dGFjaG1lbnQgPSBmYWxzZTtcblx0XHRcdFx0XHRBdHRhY2htZW50RGlzcGxheS5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzLCBhcmdzICk7XG5cdFx0XHRcdFx0dGhpcy5wb3N0UmVuZGVyKCk7XG5cdFx0XHRcdH0sIHRoaXMgKSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRBdHRhY2htZW50RGlzcGxheS5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHRcdHRoaXMucG9zdFJlbmRlcigpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHBvc3RSZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHNldFRpbWVvdXQoIF8uYmluZCggdGhpcy5yZXNldEZvY3VzLCB0aGlzICksIDEwICk7XG5cdFx0dGhpcy50b2dnbGVMaW5rU2V0dGluZ3MoKTtcblx0XHRpZiAoIHdpbmRvdy5nZXRVc2VyU2V0dGluZyggJ2FkdkltZ0RldGFpbHMnICkgPT09ICdzaG93JyApIHtcblx0XHRcdHRoaXMudG9nZ2xlQWR2YW5jZWQoIHRydWUgKTtcblx0XHR9XG5cdFx0dGhpcy50cmlnZ2VyKCAncG9zdC1yZW5kZXInICk7XG5cdH0sXG5cblx0cmVzZXRGb2N1czogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kKCAnLmxpbmstdG8tY3VzdG9tJyApLmJsdXIoKTtcblx0XHR0aGlzLiQoICcuZW1iZWQtbWVkaWEtc2V0dGluZ3MnICkuc2Nyb2xsVG9wKCAwICk7XG5cdH0sXG5cblx0dXBkYXRlVXJsOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiQoICcuaW1hZ2UgaW1nJyApLmF0dHIoICdzcmMnLCB0aGlzLm1vZGVsLmdldCggJ3VybCcgKSApO1xuXHRcdHRoaXMuJCggJy51cmwnICkudmFsKCB0aGlzLm1vZGVsLmdldCggJ3VybCcgKSApO1xuXHR9LFxuXG5cdHRvZ2dsZUxpbmtTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLm1vZGVsLmdldCggJ2xpbmsnICkgPT09ICdub25lJyApIHtcblx0XHRcdHRoaXMuJCggJy5saW5rLXNldHRpbmdzJyApLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy4kKCAnLmxpbmstc2V0dGluZ3MnICkucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdH1cblx0fSxcblxuXHR0b2dnbGVDdXN0b21TaXplOiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMubW9kZWwuZ2V0KCAnc2l6ZScgKSAhPT0gJ2N1c3RvbScgKSB7XG5cdFx0XHR0aGlzLiQoICcuY3VzdG9tLXNpemUnICkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLiQoICcuY3VzdG9tLXNpemUnICkucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdH1cblx0fSxcblxuXHRvbkN1c3RvbVNpemU6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR2YXIgZGltZW5zaW9uID0gJCggZXZlbnQudGFyZ2V0ICkuZGF0YSgnc2V0dGluZycpLFxuXHRcdFx0bnVtID0gJCggZXZlbnQudGFyZ2V0ICkudmFsKCksXG5cdFx0XHR2YWx1ZTtcblxuXHRcdC8vIElnbm9yZSBib2d1cyBpbnB1dFxuXHRcdGlmICggISAvXlxcZCsvLnRlc3QoIG51bSApIHx8IHBhcnNlSW50KCBudW0sIDEwICkgPCAxICkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIGRpbWVuc2lvbiA9PT0gJ2N1c3RvbVdpZHRoJyApIHtcblx0XHRcdHZhbHVlID0gTWF0aC5yb3VuZCggMSAvIHRoaXMubW9kZWwuZ2V0KCAnYXNwZWN0UmF0aW8nICkgKiBudW0gKTtcblx0XHRcdHRoaXMubW9kZWwuc2V0KCAnY3VzdG9tSGVpZ2h0JywgdmFsdWUsIHsgc2lsZW50OiB0cnVlIH0gKTtcblx0XHRcdHRoaXMuJCggJ1tkYXRhLXNldHRpbmc9XCJjdXN0b21IZWlnaHRcIl0nICkudmFsKCB2YWx1ZSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YWx1ZSA9IE1hdGgucm91bmQoIHRoaXMubW9kZWwuZ2V0KCAnYXNwZWN0UmF0aW8nICkgKiBudW0gKTtcblx0XHRcdHRoaXMubW9kZWwuc2V0KCAnY3VzdG9tV2lkdGgnLCB2YWx1ZSwgeyBzaWxlbnQ6IHRydWUgIH0gKTtcblx0XHRcdHRoaXMuJCggJ1tkYXRhLXNldHRpbmc9XCJjdXN0b21XaWR0aFwiXScgKS52YWwoIHZhbHVlICk7XG5cdFx0fVxuXHR9LFxuXG5cdG9uVG9nZ2xlQWR2YW5jZWQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHRoaXMudG9nZ2xlQWR2YW5jZWQoKTtcblx0fSxcblxuXHR0b2dnbGVBZHZhbmNlZDogZnVuY3Rpb24oIHNob3cgKSB7XG5cdFx0dmFyICRhZHZhbmNlZCA9IHRoaXMuJGVsLmZpbmQoICcuYWR2YW5jZWQtc2VjdGlvbicgKSxcblx0XHRcdG1vZGU7XG5cblx0XHRpZiAoICRhZHZhbmNlZC5oYXNDbGFzcygnYWR2YW5jZWQtdmlzaWJsZScpIHx8IHNob3cgPT09IGZhbHNlICkge1xuXHRcdFx0JGFkdmFuY2VkLnJlbW92ZUNsYXNzKCdhZHZhbmNlZC12aXNpYmxlJyk7XG5cdFx0XHQkYWR2YW5jZWQuZmluZCgnLmFkdmFuY2VkLXNldHRpbmdzJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0bW9kZSA9ICdoaWRlJztcblx0XHR9IGVsc2Uge1xuXHRcdFx0JGFkdmFuY2VkLmFkZENsYXNzKCdhZHZhbmNlZC12aXNpYmxlJyk7XG5cdFx0XHQkYWR2YW5jZWQuZmluZCgnLmFkdmFuY2VkLXNldHRpbmdzJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuXHRcdFx0bW9kZSA9ICdzaG93Jztcblx0XHR9XG5cblx0XHR3aW5kb3cuc2V0VXNlclNldHRpbmcoICdhZHZJbWdEZXRhaWxzJywgbW9kZSApO1xuXHR9LFxuXG5cdGVkaXRBdHRhY2htZW50OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dmFyIGVkaXRTdGF0ZSA9IHRoaXMuY29udHJvbGxlci5zdGF0ZXMuZ2V0KCAnZWRpdC1pbWFnZScgKTtcblxuXHRcdGlmICggd2luZG93LmltYWdlRWRpdCAmJiBlZGl0U3RhdGUgKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ZWRpdFN0YXRlLnNldCggJ2ltYWdlJywgdGhpcy5tb2RlbC5hdHRhY2htZW50ICk7XG5cdFx0XHR0aGlzLmNvbnRyb2xsZXIuc2V0U3RhdGUoICdlZGl0LWltYWdlJyApO1xuXHRcdH1cblx0fSxcblxuXHRyZXBsYWNlQXR0YWNobWVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dGhpcy5jb250cm9sbGVyLnNldFN0YXRlKCAncmVwbGFjZS1pbWFnZScgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VEZXRhaWxzO1xuIiwiLyoqXG4gKiB3cC5tZWRpYS52aWV3LkxhYmVsXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBMYWJlbCA9IHdwLm1lZGlhLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogJ2xhYmVsJyxcblx0Y2xhc3NOYW1lOiAnc2NyZWVuLXJlYWRlci10ZXh0JyxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnZhbHVlID0gdGhpcy5vcHRpb25zLnZhbHVlO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZWwuaHRtbCggdGhpcy52YWx1ZSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhYmVsO1xuIiwiLypnbG9iYWxzIHdwLCBfLCBqUXVlcnkgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWVcbiAqXG4gKiBUaGUgZnJhbWUgdXNlZCB0byBjcmVhdGUgdGhlIG1lZGlhIG1vZGFsLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuRnJhbWVcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqIEBtaXhlcyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlTWFjaGluZVxuICovXG52YXIgRnJhbWUgPSB3cC5tZWRpYS52aWV3LkZyYW1lLFxuXHQkID0galF1ZXJ5LFxuXHRNZWRpYUZyYW1lO1xuXG5NZWRpYUZyYW1lID0gRnJhbWUuZXh0ZW5kKHtcblx0Y2xhc3NOYW1lOiAnbWVkaWEtZnJhbWUnLFxuXHR0ZW1wbGF0ZTogIHdwLnRlbXBsYXRlKCdtZWRpYS1mcmFtZScpLFxuXHRyZWdpb25zOiAgIFsnbWVudScsJ3RpdGxlJywnY29udGVudCcsJ3Rvb2xiYXInLCdyb3V0ZXInXSxcblxuXHRldmVudHM6IHtcblx0XHQnY2xpY2sgZGl2Lm1lZGlhLWZyYW1lLXRpdGxlIGgxJzogJ3RvZ2dsZU1lbnUnXG5cdH0sXG5cblx0LyoqXG5cdCAqIEBnbG9iYWwgd3AuVXBsb2FkZXJcblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdEZyYW1lLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdF8uZGVmYXVsdHMoIHRoaXMub3B0aW9ucywge1xuXHRcdFx0dGl0bGU6ICAgICcnLFxuXHRcdFx0bW9kYWw6ICAgIHRydWUsXG5cdFx0XHR1cGxvYWRlcjogdHJ1ZVxuXHRcdH0pO1xuXG5cdFx0Ly8gRW5zdXJlIGNvcmUgVUkgaXMgZW5hYmxlZC5cblx0XHR0aGlzLiRlbC5hZGRDbGFzcygnd3AtY29yZS11aScpO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSBtb2RhbCBjb250YWluZXIgdmlldy5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5tb2RhbCApIHtcblx0XHRcdHRoaXMubW9kYWwgPSBuZXcgd3AubWVkaWEudmlldy5Nb2RhbCh7XG5cdFx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRcdHRpdGxlOiAgICAgIHRoaXMub3B0aW9ucy50aXRsZVxuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMubW9kYWwuY29udGVudCggdGhpcyApO1xuXHRcdH1cblxuXHRcdC8vIEZvcmNlIHRoZSB1cGxvYWRlciBvZmYgaWYgdGhlIHVwbG9hZCBsaW1pdCBoYXMgYmVlbiBleGNlZWRlZCBvclxuXHRcdC8vIGlmIHRoZSBicm93c2VyIGlzbid0IHN1cHBvcnRlZC5cblx0XHRpZiAoIHdwLlVwbG9hZGVyLmxpbWl0RXhjZWVkZWQgfHwgISB3cC5VcGxvYWRlci5icm93c2VyLnN1cHBvcnRlZCApIHtcblx0XHRcdHRoaXMub3B0aW9ucy51cGxvYWRlciA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIEluaXRpYWxpemUgd2luZG93LXdpZGUgdXBsb2FkZXIuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMudXBsb2FkZXIgKSB7XG5cdFx0XHR0aGlzLnVwbG9hZGVyID0gbmV3IHdwLm1lZGlhLnZpZXcuVXBsb2FkZXJXaW5kb3coe1xuXHRcdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0XHR1cGxvYWRlcjoge1xuXHRcdFx0XHRcdGRyb3B6b25lOiAgdGhpcy5tb2RhbCA/IHRoaXMubW9kYWwuJGVsIDogdGhpcy4kZWwsXG5cdFx0XHRcdFx0Y29udGFpbmVyOiB0aGlzLiRlbFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMudmlld3Muc2V0KCAnLm1lZGlhLWZyYW1lLXVwbG9hZGVyJywgdGhpcy51cGxvYWRlciApO1xuXHRcdH1cblxuXHRcdHRoaXMub24oICdhdHRhY2gnLCBfLmJpbmQoIHRoaXMudmlld3MucmVhZHksIHRoaXMudmlld3MgKSwgdGhpcyApO1xuXG5cdFx0Ly8gQmluZCBkZWZhdWx0IHRpdGxlIGNyZWF0aW9uLlxuXHRcdHRoaXMub24oICd0aXRsZTpjcmVhdGU6ZGVmYXVsdCcsIHRoaXMuY3JlYXRlVGl0bGUsIHRoaXMgKTtcblx0XHR0aGlzLnRpdGxlLm1vZGUoJ2RlZmF1bHQnKTtcblxuXHRcdHRoaXMub24oICd0aXRsZTpyZW5kZXInLCBmdW5jdGlvbiggdmlldyApIHtcblx0XHRcdHZpZXcuJGVsLmFwcGVuZCggJzxzcGFuIGNsYXNzPVwiZGFzaGljb25zIGRhc2hpY29ucy1hcnJvdy1kb3duXCI+PC9zcGFuPicgKTtcblx0XHR9KTtcblxuXHRcdC8vIEJpbmQgZGVmYXVsdCBtZW51LlxuXHRcdHRoaXMub24oICdtZW51OmNyZWF0ZTpkZWZhdWx0JywgdGhpcy5jcmVhdGVNZW51LCB0aGlzICk7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5NZWRpYUZyYW1lfSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHQvLyBBY3RpdmF0ZSB0aGUgZGVmYXVsdCBzdGF0ZSBpZiBubyBhY3RpdmUgc3RhdGUgZXhpc3RzLlxuXHRcdGlmICggISB0aGlzLnN0YXRlKCkgJiYgdGhpcy5vcHRpb25zLnN0YXRlICkge1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSggdGhpcy5vcHRpb25zLnN0YXRlICk7XG5cdFx0fVxuXHRcdC8qKlxuXHRcdCAqIGNhbGwgJ3JlbmRlcicgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzc1xuXHRcdCAqL1xuXHRcdHJldHVybiBGcmFtZS5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSB0aXRsZVxuXHQgKiBAdGhpcyB3cC5tZWRpYS5jb250cm9sbGVyLlJlZ2lvblxuXHQgKi9cblx0Y3JlYXRlVGl0bGU6IGZ1bmN0aW9uKCB0aXRsZSApIHtcblx0XHR0aXRsZS52aWV3ID0gbmV3IHdwLm1lZGlhLlZpZXcoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcyxcblx0XHRcdHRhZ05hbWU6ICdoMSdcblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBtZW51XG5cdCAqIEB0aGlzIHdwLm1lZGlhLmNvbnRyb2xsZXIuUmVnaW9uXG5cdCAqL1xuXHRjcmVhdGVNZW51OiBmdW5jdGlvbiggbWVudSApIHtcblx0XHRtZW51LnZpZXcgPSBuZXcgd3AubWVkaWEudmlldy5NZW51KHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXNcblx0XHR9KTtcblx0fSxcblxuXHR0b2dnbGVNZW51OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiRlbC5maW5kKCAnLm1lZGlhLW1lbnUnICkudG9nZ2xlQ2xhc3MoICd2aXNpYmxlJyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gdG9vbGJhclxuXHQgKiBAdGhpcyB3cC5tZWRpYS5jb250cm9sbGVyLlJlZ2lvblxuXHQgKi9cblx0Y3JlYXRlVG9vbGJhcjogZnVuY3Rpb24oIHRvb2xiYXIgKSB7XG5cdFx0dG9vbGJhci52aWV3ID0gbmV3IHdwLm1lZGlhLnZpZXcuVG9vbGJhcih7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzXG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gcm91dGVyXG5cdCAqIEB0aGlzIHdwLm1lZGlhLmNvbnRyb2xsZXIuUmVnaW9uXG5cdCAqL1xuXHRjcmVhdGVSb3V0ZXI6IGZ1bmN0aW9uKCByb3V0ZXIgKSB7XG5cdFx0cm91dGVyLnZpZXcgPSBuZXcgd3AubWVkaWEudmlldy5Sb3V0ZXIoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpc1xuXHRcdH0pO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblx0ICovXG5cdGNyZWF0ZUlmcmFtZVN0YXRlczogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0dmFyIHNldHRpbmdzID0gd3AubWVkaWEudmlldy5zZXR0aW5ncyxcblx0XHRcdHRhYnMgPSBzZXR0aW5ncy50YWJzLFxuXHRcdFx0dGFiVXJsID0gc2V0dGluZ3MudGFiVXJsLFxuXHRcdFx0JHBvc3RJZDtcblxuXHRcdGlmICggISB0YWJzIHx8ICEgdGFiVXJsICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEFkZCB0aGUgcG9zdCBJRCB0byB0aGUgdGFiIFVSTCBpZiBpdCBleGlzdHMuXG5cdFx0JHBvc3RJZCA9ICQoJyNwb3N0X0lEJyk7XG5cdFx0aWYgKCAkcG9zdElkLmxlbmd0aCApIHtcblx0XHRcdHRhYlVybCArPSAnJnBvc3RfaWQ9JyArICRwb3N0SWQudmFsKCk7XG5cdFx0fVxuXG5cdFx0Ly8gR2VuZXJhdGUgdGhlIHRhYiBzdGF0ZXMuXG5cdFx0Xy5lYWNoKCB0YWJzLCBmdW5jdGlvbiggdGl0bGUsIGlkICkge1xuXHRcdFx0dGhpcy5zdGF0ZSggJ2lmcmFtZTonICsgaWQgKS5zZXQoIF8uZGVmYXVsdHMoe1xuXHRcdFx0XHR0YWI6ICAgICBpZCxcblx0XHRcdFx0c3JjOiAgICAgdGFiVXJsICsgJyZ0YWI9JyArIGlkLFxuXHRcdFx0XHR0aXRsZTogICB0aXRsZSxcblx0XHRcdFx0Y29udGVudDogJ2lmcmFtZScsXG5cdFx0XHRcdG1lbnU6ICAgICdkZWZhdWx0J1xuXHRcdFx0fSwgb3B0aW9ucyApICk7XG5cdFx0fSwgdGhpcyApO1xuXG5cdFx0dGhpcy5vbiggJ2NvbnRlbnQ6Y3JlYXRlOmlmcmFtZScsIHRoaXMuaWZyYW1lQ29udGVudCwgdGhpcyApO1xuXHRcdHRoaXMub24oICdjb250ZW50OmRlYWN0aXZhdGU6aWZyYW1lJywgdGhpcy5pZnJhbWVDb250ZW50Q2xlYW51cCwgdGhpcyApO1xuXHRcdHRoaXMub24oICdtZW51OnJlbmRlcjpkZWZhdWx0JywgdGhpcy5pZnJhbWVNZW51LCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ29wZW4nLCB0aGlzLmhpamFja1RoaWNrYm94LCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ2Nsb3NlJywgdGhpcy5yZXN0b3JlVGhpY2tib3gsIHRoaXMgKTtcblx0fSxcblxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGNvbnRlbnRcblx0ICogQHRoaXMgd3AubWVkaWEuY29udHJvbGxlci5SZWdpb25cblx0ICovXG5cdGlmcmFtZUNvbnRlbnQ6IGZ1bmN0aW9uKCBjb250ZW50ICkge1xuXHRcdHRoaXMuJGVsLmFkZENsYXNzKCdoaWRlLXRvb2xiYXInKTtcblx0XHRjb250ZW50LnZpZXcgPSBuZXcgd3AubWVkaWEudmlldy5JZnJhbWUoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpc1xuXHRcdH0pO1xuXHR9LFxuXG5cdGlmcmFtZUNvbnRlbnRDbGVhbnVwOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiRlbC5yZW1vdmVDbGFzcygnaGlkZS10b29sYmFyJyk7XG5cdH0sXG5cblx0aWZyYW1lTWVudTogZnVuY3Rpb24oIHZpZXcgKSB7XG5cdFx0dmFyIHZpZXdzID0ge307XG5cblx0XHRpZiAoICEgdmlldyApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRfLmVhY2goIHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MudGFicywgZnVuY3Rpb24oIHRpdGxlLCBpZCApIHtcblx0XHRcdHZpZXdzWyAnaWZyYW1lOicgKyBpZCBdID0ge1xuXHRcdFx0XHR0ZXh0OiB0aGlzLnN0YXRlKCAnaWZyYW1lOicgKyBpZCApLmdldCgndGl0bGUnKSxcblx0XHRcdFx0cHJpb3JpdHk6IDIwMFxuXHRcdFx0fTtcblx0XHR9LCB0aGlzICk7XG5cblx0XHR2aWV3LnNldCggdmlld3MgKTtcblx0fSxcblxuXHRoaWphY2tUaGlja2JveDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGZyYW1lID0gdGhpcztcblxuXHRcdGlmICggISB3aW5kb3cudGJfcmVtb3ZlIHx8IHRoaXMuX3RiX3JlbW92ZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLl90Yl9yZW1vdmUgPSB3aW5kb3cudGJfcmVtb3ZlO1xuXHRcdHdpbmRvdy50Yl9yZW1vdmUgPSBmdW5jdGlvbigpIHtcblx0XHRcdGZyYW1lLmNsb3NlKCk7XG5cdFx0XHRmcmFtZS5yZXNldCgpO1xuXHRcdFx0ZnJhbWUuc2V0U3RhdGUoIGZyYW1lLm9wdGlvbnMuc3RhdGUgKTtcblx0XHRcdGZyYW1lLl90Yl9yZW1vdmUuY2FsbCggd2luZG93ICk7XG5cdFx0fTtcblx0fSxcblxuXHRyZXN0b3JlVGhpY2tib3g6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggISB0aGlzLl90Yl9yZW1vdmUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0d2luZG93LnRiX3JlbW92ZSA9IHRoaXMuX3RiX3JlbW92ZTtcblx0XHRkZWxldGUgdGhpcy5fdGJfcmVtb3ZlO1xuXHR9XG59KTtcblxuLy8gTWFwIHNvbWUgb2YgdGhlIG1vZGFsJ3MgbWV0aG9kcyB0byB0aGUgZnJhbWUuXG5fLmVhY2goWydvcGVuJywnY2xvc2UnLCdhdHRhY2gnLCdkZXRhY2gnLCdlc2NhcGUnXSwgZnVuY3Rpb24oIG1ldGhvZCApIHtcblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWV9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRNZWRpYUZyYW1lLnByb3RvdHlwZVsgbWV0aG9kIF0gPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMubW9kYWwgKSB7XG5cdFx0XHR0aGlzLm1vZGFsWyBtZXRob2QgXS5hcHBseSggdGhpcy5tb2RhbCwgYXJndW1lbnRzICk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWVkaWFGcmFtZTtcbiIsIi8qZ2xvYmFscyBqUXVlcnkgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3Lk1lbnVJdGVtXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciAkID0galF1ZXJ5LFxuXHRNZW51SXRlbTtcblxuTWVudUl0ZW0gPSB3cC5tZWRpYS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAgJ2EnLFxuXHRjbGFzc05hbWU6ICdtZWRpYS1tZW51LWl0ZW0nLFxuXG5cdGF0dHJpYnV0ZXM6IHtcblx0XHRocmVmOiAnIydcblx0fSxcblxuXHRldmVudHM6IHtcblx0XHQnY2xpY2snOiAnX2NsaWNrJ1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHRfY2xpY2s6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR2YXIgY2xpY2tPdmVycmlkZSA9IHRoaXMub3B0aW9ucy5jbGljaztcblxuXHRcdGlmICggZXZlbnQgKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblxuXHRcdGlmICggY2xpY2tPdmVycmlkZSApIHtcblx0XHRcdGNsaWNrT3ZlcnJpZGUuY2FsbCggdGhpcyApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNsaWNrKCk7XG5cdFx0fVxuXG5cdFx0Ly8gV2hlbiBzZWxlY3RpbmcgYSB0YWIgYWxvbmcgdGhlIGxlZnQgc2lkZSxcblx0XHQvLyBmb2N1cyBzaG91bGQgYmUgdHJhbnNmZXJyZWQgaW50byB0aGUgbWFpbiBwYW5lbFxuXHRcdGlmICggISB3cC5tZWRpYS5pc1RvdWNoRGV2aWNlICkge1xuXHRcdFx0JCgnLm1lZGlhLWZyYW1lLWNvbnRlbnQgaW5wdXQnKS5maXJzdCgpLmZvY3VzKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc3RhdGUgPSB0aGlzLm9wdGlvbnMuc3RhdGU7XG5cblx0XHRpZiAoIHN0YXRlICkge1xuXHRcdFx0dGhpcy5jb250cm9sbGVyLnNldFN0YXRlKCBzdGF0ZSApO1xuXHRcdFx0dGhpcy52aWV3cy5wYXJlbnQuJGVsLnJlbW92ZUNsYXNzKCAndmlzaWJsZScgKTsgLy8gVE9ETzogb3IgaGlkZSBvbiBhbnkgY2xpY2ssIHNlZSBiZWxvd1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3Lk1lbnVJdGVtfSByZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuXHRcdGlmICggb3B0aW9ucy50ZXh0ICkge1xuXHRcdFx0dGhpcy4kZWwudGV4dCggb3B0aW9ucy50ZXh0ICk7XG5cdFx0fSBlbHNlIGlmICggb3B0aW9ucy5odG1sICkge1xuXHRcdFx0dGhpcy4kZWwuaHRtbCggb3B0aW9ucy5odG1sICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbnVJdGVtO1xuIiwiLyoqXG4gKiB3cC5tZWRpYS52aWV3Lk1lbnVcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LlByaW9yaXR5TGlzdFxuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgTWVudUl0ZW0gPSB3cC5tZWRpYS52aWV3Lk1lbnVJdGVtLFxuXHRQcmlvcml0eUxpc3QgPSB3cC5tZWRpYS52aWV3LlByaW9yaXR5TGlzdCxcblx0TWVudTtcblxuTWVudSA9IFByaW9yaXR5TGlzdC5leHRlbmQoe1xuXHR0YWdOYW1lOiAgICdkaXYnLFxuXHRjbGFzc05hbWU6ICdtZWRpYS1tZW51Jyxcblx0cHJvcGVydHk6ICAnc3RhdGUnLFxuXHRJdGVtVmlldzogIE1lbnVJdGVtLFxuXHRyZWdpb246ICAgICdtZW51JyxcblxuXHQvKiBUT0RPOiBhbHRlcm5hdGl2ZWx5IGhpZGUgb24gYW55IGNsaWNrIGFueXdoZXJlXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayc6ICdjbGljaydcblx0fSxcblxuXHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZWwucmVtb3ZlQ2xhc3MoICd2aXNpYmxlJyApO1xuXHR9LFxuXHQqL1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gaWRcblx0ICogQHJldHVybnMge3dwLm1lZGlhLlZpZXd9XG5cdCAqL1xuXHR0b1ZpZXc6IGZ1bmN0aW9uKCBvcHRpb25zLCBpZCApIHtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHRvcHRpb25zWyB0aGlzLnByb3BlcnR5IF0gPSBvcHRpb25zWyB0aGlzLnByb3BlcnR5IF0gfHwgaWQ7XG5cdFx0cmV0dXJuIG5ldyB0aGlzLkl0ZW1WaWV3KCBvcHRpb25zICkucmVuZGVyKCk7XG5cdH0sXG5cblx0cmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdC8qKlxuXHRcdCAqIGNhbGwgJ3JlYWR5JyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzXG5cdFx0ICovXG5cdFx0UHJpb3JpdHlMaXN0LnByb3RvdHlwZS5yZWFkeS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0dGhpcy52aXNpYmlsaXR5KCk7XG5cdH0sXG5cblx0c2V0OiBmdW5jdGlvbigpIHtcblx0XHQvKipcblx0XHQgKiBjYWxsICdzZXQnIGRpcmVjdGx5IG9uIHRoZSBwYXJlbnQgY2xhc3Ncblx0XHQgKi9cblx0XHRQcmlvcml0eUxpc3QucHJvdG90eXBlLnNldC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0dGhpcy52aXNpYmlsaXR5KCk7XG5cdH0sXG5cblx0dW5zZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdC8qKlxuXHRcdCAqIGNhbGwgJ3Vuc2V0JyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzXG5cdFx0ICovXG5cdFx0UHJpb3JpdHlMaXN0LnByb3RvdHlwZS51bnNldC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0dGhpcy52aXNpYmlsaXR5KCk7XG5cdH0sXG5cblx0dmlzaWJpbGl0eTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHJlZ2lvbiA9IHRoaXMucmVnaW9uLFxuXHRcdFx0dmlldyA9IHRoaXMuY29udHJvbGxlclsgcmVnaW9uIF0uZ2V0KCksXG5cdFx0XHR2aWV3cyA9IHRoaXMudmlld3MuZ2V0KCksXG5cdFx0XHRoaWRlID0gISB2aWV3cyB8fCB2aWV3cy5sZW5ndGggPCAyO1xuXG5cdFx0aWYgKCB0aGlzID09PSB2aWV3ICkge1xuXHRcdFx0dGhpcy5jb250cm9sbGVyLiRlbC50b2dnbGVDbGFzcyggJ2hpZGUtJyArIHJlZ2lvbiwgaGlkZSApO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuXHQgKi9cblx0c2VsZWN0OiBmdW5jdGlvbiggaWQgKSB7XG5cdFx0dmFyIHZpZXcgPSB0aGlzLmdldCggaWQgKTtcblxuXHRcdGlmICggISB2aWV3ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuZGVzZWxlY3QoKTtcblx0XHR2aWV3LiRlbC5hZGRDbGFzcygnYWN0aXZlJyk7XG5cdH0sXG5cblx0ZGVzZWxlY3Q6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJGVsLmNoaWxkcmVuKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHR9LFxuXG5cdGhpZGU6IGZ1bmN0aW9uKCBpZCApIHtcblx0XHR2YXIgdmlldyA9IHRoaXMuZ2V0KCBpZCApO1xuXG5cdFx0aWYgKCAhIHZpZXcgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmlldy4kZWwuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHR9LFxuXG5cdHNob3c6IGZ1bmN0aW9uKCBpZCApIHtcblx0XHR2YXIgdmlldyA9IHRoaXMuZ2V0KCBpZCApO1xuXG5cdFx0aWYgKCAhIHZpZXcgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmlldy4kZWwucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNZW51O1xuIiwiLypnbG9iYWxzIHdwLCBfLCBqUXVlcnkgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3Lk1vZGFsXG4gKlxuICogQSBtb2RhbCB2aWV3LCB3aGljaCB0aGUgbWVkaWEgbW9kYWwgdXNlcyBhcyBpdHMgZGVmYXVsdCBjb250YWluZXIuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciAkID0galF1ZXJ5LFxuXHRNb2RhbDtcblxuTW9kYWwgPSB3cC5tZWRpYS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAnZGl2Jyxcblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCdtZWRpYS1tb2RhbCcpLFxuXG5cdGF0dHJpYnV0ZXM6IHtcblx0XHR0YWJpbmRleDogMFxuXHR9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayAubWVkaWEtbW9kYWwtYmFja2Ryb3AsIC5tZWRpYS1tb2RhbC1jbG9zZSc6ICdlc2NhcGVIYW5kbGVyJyxcblx0XHQna2V5ZG93bic6ICdrZXlkb3duJ1xuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdF8uZGVmYXVsdHMoIHRoaXMub3B0aW9ucywge1xuXHRcdFx0Y29udGFpbmVyOiBkb2N1bWVudC5ib2R5LFxuXHRcdFx0dGl0bGU6ICAgICAnJyxcblx0XHRcdHByb3BhZ2F0ZTogdHJ1ZSxcblx0XHRcdGZyZWV6ZTogICAgdHJ1ZVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5mb2N1c01hbmFnZXIgPSBuZXcgd3AubWVkaWEudmlldy5Gb2N1c01hbmFnZXIoe1xuXHRcdFx0ZWw6IHRoaXMuZWxcblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqIEByZXR1cm5zIHtPYmplY3R9XG5cdCAqL1xuXHRwcmVwYXJlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dGl0bGU6IHRoaXMub3B0aW9ucy50aXRsZVxuXHRcdH07XG5cdH0sXG5cblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3Lk1vZGFsfSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0YXR0YWNoOiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMudmlld3MuYXR0YWNoZWQgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRpZiAoICEgdGhpcy52aWV3cy5yZW5kZXJlZCApIHtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy4kZWwuYXBwZW5kVG8oIHRoaXMub3B0aW9ucy5jb250YWluZXIgKTtcblxuXHRcdC8vIE1hbnVhbGx5IG1hcmsgdGhlIHZpZXcgYXMgYXR0YWNoZWQgYW5kIHRyaWdnZXIgcmVhZHkuXG5cdFx0dGhpcy52aWV3cy5hdHRhY2hlZCA9IHRydWU7XG5cdFx0dGhpcy52aWV3cy5yZWFkeSgpO1xuXG5cdFx0cmV0dXJuIHRoaXMucHJvcGFnYXRlKCdhdHRhY2gnKTtcblx0fSxcblxuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuTW9kYWx9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRkZXRhY2g6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggdGhpcy4kZWwuaXMoJzp2aXNpYmxlJykgKSB7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy4kZWwuZGV0YWNoKCk7XG5cdFx0dGhpcy52aWV3cy5hdHRhY2hlZCA9IGZhbHNlO1xuXHRcdHJldHVybiB0aGlzLnByb3BhZ2F0ZSgnZGV0YWNoJyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3Lk1vZGFsfSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0b3BlbjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRlbCA9IHRoaXMuJGVsLFxuXHRcdFx0b3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcblx0XHRcdG1jZUVkaXRvcjtcblxuXHRcdGlmICggJGVsLmlzKCc6dmlzaWJsZScpICkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIHRoaXMudmlld3MuYXR0YWNoZWQgKSB7XG5cdFx0XHR0aGlzLmF0dGFjaCgpO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoZSBgZnJlZXplYCBvcHRpb24gaXMgc2V0LCByZWNvcmQgdGhlIHdpbmRvdydzIHNjcm9sbCBwb3NpdGlvbi5cblx0XHRpZiAoIG9wdGlvbnMuZnJlZXplICkge1xuXHRcdFx0dGhpcy5fZnJlZXplID0ge1xuXHRcdFx0XHRzY3JvbGxUb3A6ICQoIHdpbmRvdyApLnNjcm9sbFRvcCgpXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdC8vIERpc2FibGUgcGFnZSBzY3JvbGxpbmcuXG5cdFx0JCggJ2JvZHknICkuYWRkQ2xhc3MoICdtb2RhbC1vcGVuJyApO1xuXG5cdFx0JGVsLnNob3coKTtcblxuXHRcdC8vIFRyeSB0byBjbG9zZSB0aGUgb25zY3JlZW4ga2V5Ym9hcmRcblx0XHRpZiAoICdvbnRvdWNoZW5kJyBpbiBkb2N1bWVudCApIHtcblx0XHRcdGlmICggKCBtY2VFZGl0b3IgPSB3aW5kb3cudGlueW1jZSAmJiB3aW5kb3cudGlueW1jZS5hY3RpdmVFZGl0b3IgKSAgJiYgISBtY2VFZGl0b3IuaXNIaWRkZW4oKSAmJiBtY2VFZGl0b3IuaWZyYW1lRWxlbWVudCApIHtcblx0XHRcdFx0bWNlRWRpdG9yLmlmcmFtZUVsZW1lbnQuZm9jdXMoKTtcblx0XHRcdFx0bWNlRWRpdG9yLmlmcmFtZUVsZW1lbnQuYmx1cigpO1xuXG5cdFx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdG1jZUVkaXRvci5pZnJhbWVFbGVtZW50LmJsdXIoKTtcblx0XHRcdFx0fSwgMTAwICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy4kZWwuZm9jdXMoKTtcblxuXHRcdHJldHVybiB0aGlzLnByb3BhZ2F0ZSgnb3BlbicpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5Nb2RhbH0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdGNsb3NlOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHR2YXIgZnJlZXplID0gdGhpcy5fZnJlZXplO1xuXG5cdFx0aWYgKCAhIHRoaXMudmlld3MuYXR0YWNoZWQgfHwgISB0aGlzLiRlbC5pcygnOnZpc2libGUnKSApIHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8vIEVuYWJsZSBwYWdlIHNjcm9sbGluZy5cblx0XHQkKCAnYm9keScgKS5yZW1vdmVDbGFzcyggJ21vZGFsLW9wZW4nICk7XG5cblx0XHQvLyBIaWRlIG1vZGFsIGFuZCByZW1vdmUgcmVzdHJpY3RlZCBtZWRpYSBtb2RhbCB0YWIgZm9jdXMgb25jZSBpdCdzIGNsb3NlZFxuXHRcdHRoaXMuJGVsLmhpZGUoKS51bmRlbGVnYXRlKCAna2V5ZG93bicgKTtcblxuXHRcdC8vIFB1dCBmb2N1cyBiYWNrIGluIHVzZWZ1bCBsb2NhdGlvbiBvbmNlIG1vZGFsIGlzIGNsb3NlZFxuXHRcdCQoJyN3cGJvZHktY29udGVudCcpLmZvY3VzKCk7XG5cblx0XHR0aGlzLnByb3BhZ2F0ZSgnY2xvc2UnKTtcblxuXHRcdC8vIElmIHRoZSBgZnJlZXplYCBvcHRpb24gaXMgc2V0LCByZXN0b3JlIHRoZSBjb250YWluZXIncyBzY3JvbGwgcG9zaXRpb24uXG5cdFx0aWYgKCBmcmVlemUgKSB7XG5cdFx0XHQkKCB3aW5kb3cgKS5zY3JvbGxUb3AoIGZyZWV6ZS5zY3JvbGxUb3AgKTtcblx0XHR9XG5cblx0XHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5lc2NhcGUgKSB7XG5cdFx0XHR0aGlzLnByb3BhZ2F0ZSgnZXNjYXBlJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5Nb2RhbH0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdGVzY2FwZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuY2xvc2UoeyBlc2NhcGU6IHRydWUgfSk7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcblx0ICovXG5cdGVzY2FwZUhhbmRsZXI6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHRoaXMuZXNjYXBlKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb250ZW50IFZpZXdzIHRvIHJlZ2lzdGVyIHRvICcubWVkaWEtbW9kYWwtY29udGVudCdcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuTW9kYWx9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRjb250ZW50OiBmdW5jdGlvbiggY29udGVudCApIHtcblx0XHR0aGlzLnZpZXdzLnNldCggJy5tZWRpYS1tb2RhbC1jb250ZW50JywgY29udGVudCApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUcmlnZ2VycyBhIG1vZGFsIGV2ZW50IGFuZCBpZiB0aGUgYHByb3BhZ2F0ZWAgb3B0aW9uIGlzIHNldCxcblx0ICogZm9yd2FyZHMgZXZlbnRzIHRvIHRoZSBtb2RhbCdzIGNvbnRyb2xsZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5Nb2RhbH0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHByb3BhZ2F0ZTogZnVuY3Rpb24oIGlkICkge1xuXHRcdHRoaXMudHJpZ2dlciggaWQgKTtcblxuXHRcdGlmICggdGhpcy5vcHRpb25zLnByb3BhZ2F0ZSApIHtcblx0XHRcdHRoaXMuY29udHJvbGxlci50cmlnZ2VyKCBpZCApO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHRrZXlkb3duOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0Ly8gQ2xvc2UgdGhlIG1vZGFsIHdoZW4gZXNjYXBlIGlzIHByZXNzZWQuXG5cdFx0aWYgKCAyNyA9PT0gZXZlbnQud2hpY2ggJiYgdGhpcy4kZWwuaXMoJzp2aXNpYmxlJykgKSB7XG5cdFx0XHR0aGlzLmVzY2FwZSgpO1xuXHRcdFx0ZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb2RhbDtcbiIsIi8qZ2xvYmFscyBfLCBCYWNrYm9uZSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuUHJpb3JpdHlMaXN0XG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBQcmlvcml0eUxpc3QgPSB3cC5tZWRpYS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAgJ2RpdicsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fdmlld3MgPSB7fTtcblxuXHRcdHRoaXMuc2V0KCBfLmV4dGVuZCgge30sIHRoaXMuX3ZpZXdzLCB0aGlzLm9wdGlvbnMudmlld3MgKSwgeyBzaWxlbnQ6IHRydWUgfSk7XG5cdFx0ZGVsZXRlIHRoaXMub3B0aW9ucy52aWV3cztcblxuXHRcdGlmICggISB0aGlzLm9wdGlvbnMuc2lsZW50ICkge1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaWRcblx0ICogQHBhcmFtIHt3cC5tZWRpYS5WaWV3fE9iamVjdH0gdmlld1xuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5Qcmlvcml0eUxpc3R9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRzZXQ6IGZ1bmN0aW9uKCBpZCwgdmlldywgb3B0aW9ucyApIHtcblx0XHR2YXIgcHJpb3JpdHksIHZpZXdzLCBpbmRleDtcblxuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0Ly8gQWNjZXB0IGFuIG9iamVjdCB3aXRoIGFuIGBpZGAgOiBgdmlld2AgbWFwcGluZy5cblx0XHRpZiAoIF8uaXNPYmplY3QoIGlkICkgKSB7XG5cdFx0XHRfLmVhY2goIGlkLCBmdW5jdGlvbiggdmlldywgaWQgKSB7XG5cdFx0XHRcdHRoaXMuc2V0KCBpZCwgdmlldyApO1xuXHRcdFx0fSwgdGhpcyApO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0aWYgKCAhICh2aWV3IGluc3RhbmNlb2YgQmFja2JvbmUuVmlldykgKSB7XG5cdFx0XHR2aWV3ID0gdGhpcy50b1ZpZXcoIHZpZXcsIGlkLCBvcHRpb25zICk7XG5cdFx0fVxuXHRcdHZpZXcuY29udHJvbGxlciA9IHZpZXcuY29udHJvbGxlciB8fCB0aGlzLmNvbnRyb2xsZXI7XG5cblx0XHR0aGlzLnVuc2V0KCBpZCApO1xuXG5cdFx0cHJpb3JpdHkgPSB2aWV3Lm9wdGlvbnMucHJpb3JpdHkgfHwgMTA7XG5cdFx0dmlld3MgPSB0aGlzLnZpZXdzLmdldCgpIHx8IFtdO1xuXG5cdFx0Xy5maW5kKCB2aWV3cywgZnVuY3Rpb24oIGV4aXN0aW5nLCBpICkge1xuXHRcdFx0aWYgKCBleGlzdGluZy5vcHRpb25zLnByaW9yaXR5ID4gcHJpb3JpdHkgKSB7XG5cdFx0XHRcdGluZGV4ID0gaTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0aGlzLl92aWV3c1sgaWQgXSA9IHZpZXc7XG5cdFx0dGhpcy52aWV3cy5hZGQoIHZpZXcsIHtcblx0XHRcdGF0OiBfLmlzTnVtYmVyKCBpbmRleCApID8gaW5kZXggOiB2aWV3cy5sZW5ndGggfHwgMFxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaWRcblx0ICogQHJldHVybnMge3dwLm1lZGlhLlZpZXd9XG5cdCAqL1xuXHRnZXQ6IGZ1bmN0aW9uKCBpZCApIHtcblx0XHRyZXR1cm4gdGhpcy5fdmlld3NbIGlkIF07XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaWRcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuUHJpb3JpdHlMaXN0fVxuXHQgKi9cblx0dW5zZXQ6IGZ1bmN0aW9uKCBpZCApIHtcblx0XHR2YXIgdmlldyA9IHRoaXMuZ2V0KCBpZCApO1xuXG5cdFx0aWYgKCB2aWV3ICkge1xuXHRcdFx0dmlldy5yZW1vdmUoKTtcblx0XHR9XG5cblx0XHRkZWxldGUgdGhpcy5fdmlld3NbIGlkIF07XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEuVmlld31cblx0ICovXG5cdHRvVmlldzogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0cmV0dXJuIG5ldyB3cC5tZWRpYS5WaWV3KCBvcHRpb25zICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByaW9yaXR5TGlzdDtcbiIsIi8qKlxuICogd3AubWVkaWEudmlldy5Sb3V0ZXJJdGVtXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5NZW51SXRlbVxuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgUm91dGVySXRlbSA9IHdwLm1lZGlhLnZpZXcuTWVudUl0ZW0uZXh0ZW5kKHtcblx0LyoqXG5cdCAqIE9uIGNsaWNrIGhhbmRsZXIgdG8gYWN0aXZhdGUgdGhlIGNvbnRlbnQgcmVnaW9uJ3MgY29ycmVzcG9uZGluZyBtb2RlLlxuXHQgKi9cblx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBjb250ZW50TW9kZSA9IHRoaXMub3B0aW9ucy5jb250ZW50TW9kZTtcblx0XHRpZiAoIGNvbnRlbnRNb2RlICkge1xuXHRcdFx0dGhpcy5jb250cm9sbGVyLmNvbnRlbnQubW9kZSggY29udGVudE1vZGUgKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlckl0ZW07XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlJvdXRlclxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuTWVudVxuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuUHJpb3JpdHlMaXN0XG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBNZW51ID0gd3AubWVkaWEudmlldy5NZW51LFxuXHRSb3V0ZXI7XG5cblJvdXRlciA9IE1lbnUuZXh0ZW5kKHtcblx0dGFnTmFtZTogICAnZGl2Jyxcblx0Y2xhc3NOYW1lOiAnbWVkaWEtcm91dGVyJyxcblx0cHJvcGVydHk6ICAnY29udGVudE1vZGUnLFxuXHRJdGVtVmlldzogIHdwLm1lZGlhLnZpZXcuUm91dGVySXRlbSxcblx0cmVnaW9uOiAgICAncm91dGVyJyxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNvbnRyb2xsZXIub24oICdjb250ZW50OnJlbmRlcicsIHRoaXMudXBkYXRlLCB0aGlzICk7XG5cdFx0Ly8gQ2FsbCAnaW5pdGlhbGl6ZScgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzcy5cblx0XHRNZW51LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHR1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBtb2RlID0gdGhpcy5jb250cm9sbGVyLmNvbnRlbnQubW9kZSgpO1xuXHRcdGlmICggbW9kZSApIHtcblx0XHRcdHRoaXMuc2VsZWN0KCBtb2RlICk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb3V0ZXI7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlNlYXJjaFxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgbDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0U2VhcmNoO1xuXG5TZWFyY2ggPSB3cC5tZWRpYS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAgJ2lucHV0Jyxcblx0Y2xhc3NOYW1lOiAnc2VhcmNoJyxcblx0aWQ6ICAgICAgICAnbWVkaWEtc2VhcmNoLWlucHV0JyxcblxuXHRhdHRyaWJ1dGVzOiB7XG5cdFx0dHlwZTogICAgICAgICdzZWFyY2gnLFxuXHRcdHBsYWNlaG9sZGVyOiBsMTBuLnNlYXJjaFxuXHR9LFxuXG5cdGV2ZW50czoge1xuXHRcdCdpbnB1dCc6ICAnc2VhcmNoJyxcblx0XHQna2V5dXAnOiAgJ3NlYXJjaCcsXG5cdFx0J2NoYW5nZSc6ICdzZWFyY2gnLFxuXHRcdCdzZWFyY2gnOiAnc2VhcmNoJ1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5TZWFyY2h9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZWwudmFsdWUgPSB0aGlzLm1vZGVsLmVzY2FwZSgnc2VhcmNoJyk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0c2VhcmNoOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0aWYgKCBldmVudC50YXJnZXQudmFsdWUgKSB7XG5cdFx0XHR0aGlzLm1vZGVsLnNldCggJ3NlYXJjaCcsIGV2ZW50LnRhcmdldC52YWx1ZSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm1vZGVsLnVuc2V0KCdzZWFyY2gnKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaDtcbiIsIi8qZ2xvYmFscyB3cCwgXywgQmFja2JvbmUgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlNlbGVjdGlvblxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgbDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0U2VsZWN0aW9uO1xuXG5TZWxlY3Rpb24gPSB3cC5tZWRpYS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAgJ2RpdicsXG5cdGNsYXNzTmFtZTogJ21lZGlhLXNlbGVjdGlvbicsXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoJ21lZGlhLXNlbGVjdGlvbicpLFxuXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayAuZWRpdC1zZWxlY3Rpb24nOiAgJ2VkaXQnLFxuXHRcdCdjbGljayAuY2xlYXItc2VsZWN0aW9uJzogJ2NsZWFyJ1xuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdF8uZGVmYXVsdHMoIHRoaXMub3B0aW9ucywge1xuXHRcdFx0ZWRpdGFibGU6ICBmYWxzZSxcblx0XHRcdGNsZWFyYWJsZTogdHJ1ZVxuXHRcdH0pO1xuXG5cdFx0LyoqXG5cdFx0ICogQG1lbWJlciB7d3AubWVkaWEudmlldy5BdHRhY2htZW50cy5TZWxlY3Rpb259XG5cdFx0ICovXG5cdFx0dGhpcy5hdHRhY2htZW50cyA9IG5ldyB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRzLlNlbGVjdGlvbih7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRjb2xsZWN0aW9uOiB0aGlzLmNvbGxlY3Rpb24sXG5cdFx0XHRzZWxlY3Rpb246ICB0aGlzLmNvbGxlY3Rpb24sXG5cdFx0XHRtb2RlbDogICAgICBuZXcgQmFja2JvbmUuTW9kZWwoKVxuXHRcdH0pO1xuXG5cdFx0dGhpcy52aWV3cy5zZXQoICcuc2VsZWN0aW9uLXZpZXcnLCB0aGlzLmF0dGFjaG1lbnRzICk7XG5cdFx0dGhpcy5jb2xsZWN0aW9uLm9uKCAnYWRkIHJlbW92ZSByZXNldCcsIHRoaXMucmVmcmVzaCwgdGhpcyApO1xuXHRcdHRoaXMuY29udHJvbGxlci5vbiggJ2NvbnRlbnQ6YWN0aXZhdGUnLCB0aGlzLnJlZnJlc2gsIHRoaXMgKTtcblx0fSxcblxuXHRyZWFkeTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5yZWZyZXNoKCk7XG5cdH0sXG5cblx0cmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gSWYgdGhlIHNlbGVjdGlvbiBoYXNuJ3QgYmVlbiByZW5kZXJlZCwgYmFpbC5cblx0XHRpZiAoICEgdGhpcy4kZWwuY2hpbGRyZW4oKS5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIGNvbGxlY3Rpb24gPSB0aGlzLmNvbGxlY3Rpb24sXG5cdFx0XHRlZGl0aW5nID0gJ2VkaXQtc2VsZWN0aW9uJyA9PT0gdGhpcy5jb250cm9sbGVyLmNvbnRlbnQubW9kZSgpO1xuXG5cdFx0Ly8gSWYgbm90aGluZyBpcyBzZWxlY3RlZCwgZGlzcGxheSBub3RoaW5nLlxuXHRcdHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCAnZW1wdHknLCAhIGNvbGxlY3Rpb24ubGVuZ3RoICk7XG5cdFx0dGhpcy4kZWwudG9nZ2xlQ2xhc3MoICdvbmUnLCAxID09PSBjb2xsZWN0aW9uLmxlbmd0aCApO1xuXHRcdHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCAnZWRpdGluZycsIGVkaXRpbmcgKTtcblxuXHRcdHRoaXMuJCgnLmNvdW50JykudGV4dCggbDEwbi5zZWxlY3RlZC5yZXBsYWNlKCclZCcsIGNvbGxlY3Rpb24ubGVuZ3RoKSApO1xuXHR9LFxuXG5cdGVkaXQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGlmICggdGhpcy5vcHRpb25zLmVkaXRhYmxlICkge1xuXHRcdFx0dGhpcy5vcHRpb25zLmVkaXRhYmxlLmNhbGwoIHRoaXMsIHRoaXMuY29sbGVjdGlvbiApO1xuXHRcdH1cblx0fSxcblxuXHRjbGVhcjogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dGhpcy5jb2xsZWN0aW9uLnJlc2V0KCk7XG5cblx0XHQvLyBLZWVwIGZvY3VzIGluc2lkZSBtZWRpYSBtb2RhbFxuXHRcdC8vIGFmdGVyIGNsZWFyIGxpbmsgaXMgc2VsZWN0ZWRcblx0XHR0aGlzLmNvbnRyb2xsZXIubW9kYWwuZm9jdXNNYW5hZ2VyLmZvY3VzKCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdGlvbjtcbiIsIi8qZ2xvYmFscyBfLCBCYWNrYm9uZSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuU2V0dGluZ3NcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFZpZXcgPSB3cC5tZWRpYS5WaWV3LFxuXHQkID0gQmFja2JvbmUuJCxcblx0U2V0dGluZ3M7XG5cblNldHRpbmdzID0gVmlldy5leHRlbmQoe1xuXHRldmVudHM6IHtcblx0XHQnY2xpY2sgYnV0dG9uJzogICAgJ3VwZGF0ZUhhbmRsZXInLFxuXHRcdCdjaGFuZ2UgaW5wdXQnOiAgICAndXBkYXRlSGFuZGxlcicsXG5cdFx0J2NoYW5nZSBzZWxlY3QnOiAgICd1cGRhdGVIYW5kbGVyJyxcblx0XHQnY2hhbmdlIHRleHRhcmVhJzogJ3VwZGF0ZUhhbmRsZXInXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5tb2RlbCA9IHRoaXMubW9kZWwgfHwgbmV3IEJhY2tib25lLk1vZGVsKCk7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZScsIHRoaXMudXBkYXRlQ2hhbmdlcyApO1xuXHR9LFxuXG5cdHByZXBhcmU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBfLmRlZmF1bHRzKHtcblx0XHRcdG1vZGVsOiB0aGlzLm1vZGVsLnRvSlNPTigpXG5cdFx0fSwgdGhpcy5vcHRpb25zICk7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5TZXR0aW5nc30gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0Vmlldy5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHQvLyBTZWxlY3QgdGhlIGNvcnJlY3QgdmFsdWVzLlxuXHRcdF8oIHRoaXMubW9kZWwuYXR0cmlidXRlcyApLmNoYWluKCkua2V5cygpLmVhY2goIHRoaXMudXBkYXRlLCB0aGlzICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG5cdCAqL1xuXHR1cGRhdGU6IGZ1bmN0aW9uKCBrZXkgKSB7XG5cdFx0dmFyIHZhbHVlID0gdGhpcy5tb2RlbC5nZXQoIGtleSApLFxuXHRcdFx0JHNldHRpbmcgPSB0aGlzLiQoJ1tkYXRhLXNldHRpbmc9XCInICsga2V5ICsgJ1wiXScpLFxuXHRcdFx0JGJ1dHRvbnMsICR2YWx1ZTtcblxuXHRcdC8vIEJhaWwgaWYgd2UgZGlkbid0IGZpbmQgYSBtYXRjaGluZyBzZXR0aW5nLlxuXHRcdGlmICggISAkc2V0dGluZy5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gQXR0ZW1wdCB0byBkZXRlcm1pbmUgaG93IHRoZSBzZXR0aW5nIGlzIHJlbmRlcmVkIGFuZCB1cGRhdGVcblx0XHQvLyB0aGUgc2VsZWN0ZWQgdmFsdWUuXG5cblx0XHQvLyBIYW5kbGUgZHJvcGRvd25zLlxuXHRcdGlmICggJHNldHRpbmcuaXMoJ3NlbGVjdCcpICkge1xuXHRcdFx0JHZhbHVlID0gJHNldHRpbmcuZmluZCgnW3ZhbHVlPVwiJyArIHZhbHVlICsgJ1wiXScpO1xuXG5cdFx0XHRpZiAoICR2YWx1ZS5sZW5ndGggKSB7XG5cdFx0XHRcdCRzZXR0aW5nLmZpbmQoJ29wdGlvbicpLnByb3AoICdzZWxlY3RlZCcsIGZhbHNlICk7XG5cdFx0XHRcdCR2YWx1ZS5wcm9wKCAnc2VsZWN0ZWQnLCB0cnVlICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBJZiB3ZSBjYW4ndCBmaW5kIHRoZSBkZXNpcmVkIHZhbHVlLCByZWNvcmQgd2hhdCAqaXMqIHNlbGVjdGVkLlxuXHRcdFx0XHR0aGlzLm1vZGVsLnNldCgga2V5LCAkc2V0dGluZy5maW5kKCc6c2VsZWN0ZWQnKS52YWwoKSApO1xuXHRcdFx0fVxuXG5cdFx0Ly8gSGFuZGxlIGJ1dHRvbiBncm91cHMuXG5cdFx0fSBlbHNlIGlmICggJHNldHRpbmcuaGFzQ2xhc3MoJ2J1dHRvbi1ncm91cCcpICkge1xuXHRcdFx0JGJ1dHRvbnMgPSAkc2V0dGluZy5maW5kKCdidXR0b24nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cdFx0XHQkYnV0dG9ucy5maWx0ZXIoICdbdmFsdWU9XCInICsgdmFsdWUgKyAnXCJdJyApLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuXHRcdC8vIEhhbmRsZSB0ZXh0IGlucHV0cyBhbmQgdGV4dGFyZWFzLlxuXHRcdH0gZWxzZSBpZiAoICRzZXR0aW5nLmlzKCdpbnB1dFt0eXBlPVwidGV4dFwiXSwgdGV4dGFyZWEnKSApIHtcblx0XHRcdGlmICggISAkc2V0dGluZy5pcygnOmZvY3VzJykgKSB7XG5cdFx0XHRcdCRzZXR0aW5nLnZhbCggdmFsdWUgKTtcblx0XHRcdH1cblx0XHQvLyBIYW5kbGUgY2hlY2tib3hlcy5cblx0XHR9IGVsc2UgaWYgKCAkc2V0dGluZy5pcygnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykgKSB7XG5cdFx0XHQkc2V0dGluZy5wcm9wKCAnY2hlY2tlZCcsICEhIHZhbHVlICYmICdmYWxzZScgIT09IHZhbHVlICk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHR1cGRhdGVIYW5kbGVyOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dmFyICRzZXR0aW5nID0gJCggZXZlbnQudGFyZ2V0ICkuY2xvc2VzdCgnW2RhdGEtc2V0dGluZ10nKSxcblx0XHRcdHZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlLFxuXHRcdFx0dXNlclNldHRpbmc7XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0aWYgKCAhICRzZXR0aW5nLmxlbmd0aCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBVc2UgdGhlIGNvcnJlY3QgdmFsdWUgZm9yIGNoZWNrYm94ZXMuXG5cdFx0aWYgKCAkc2V0dGluZy5pcygnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykgKSB7XG5cdFx0XHR2YWx1ZSA9ICRzZXR0aW5nWzBdLmNoZWNrZWQ7XG5cdFx0fVxuXG5cdFx0Ly8gVXBkYXRlIHRoZSBjb3JyZXNwb25kaW5nIHNldHRpbmcuXG5cdFx0dGhpcy5tb2RlbC5zZXQoICRzZXR0aW5nLmRhdGEoJ3NldHRpbmcnKSwgdmFsdWUgKTtcblxuXHRcdC8vIElmIHRoZSBzZXR0aW5nIGhhcyBhIGNvcnJlc3BvbmRpbmcgdXNlciBzZXR0aW5nLFxuXHRcdC8vIHVwZGF0ZSB0aGF0IGFzIHdlbGwuXG5cdFx0aWYgKCB1c2VyU2V0dGluZyA9ICRzZXR0aW5nLmRhdGEoJ3VzZXJTZXR0aW5nJykgKSB7XG5cdFx0XHR3aW5kb3cuc2V0VXNlclNldHRpbmcoIHVzZXJTZXR0aW5nLCB2YWx1ZSApO1xuXHRcdH1cblx0fSxcblxuXHR1cGRhdGVDaGFuZ2VzOiBmdW5jdGlvbiggbW9kZWwgKSB7XG5cdFx0aWYgKCBtb2RlbC5oYXNDaGFuZ2VkKCkgKSB7XG5cdFx0XHRfKCBtb2RlbC5jaGFuZ2VkICkuY2hhaW4oKS5rZXlzKCkuZWFjaCggdGhpcy51cGRhdGUsIHRoaXMgKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNldHRpbmdzO1xuIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5TZXR0aW5ncy5BdHRhY2htZW50RGlzcGxheVxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuU2V0dGluZ3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFNldHRpbmdzID0gd3AubWVkaWEudmlldy5TZXR0aW5ncyxcblx0QXR0YWNobWVudERpc3BsYXk7XG5cbkF0dGFjaG1lbnREaXNwbGF5ID0gU2V0dGluZ3MuZXh0ZW5kKHtcblx0Y2xhc3NOYW1lOiAnYXR0YWNobWVudC1kaXNwbGF5LXNldHRpbmdzJyxcblx0dGVtcGxhdGU6ICB3cC50ZW1wbGF0ZSgnYXR0YWNobWVudC1kaXNwbGF5LXNldHRpbmdzJyksXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF0dGFjaG1lbnQgPSB0aGlzLm9wdGlvbnMuYXR0YWNobWVudDtcblxuXHRcdF8uZGVmYXVsdHMoIHRoaXMub3B0aW9ucywge1xuXHRcdFx0dXNlclNldHRpbmdzOiBmYWxzZVxuXHRcdH0pO1xuXHRcdC8vIENhbGwgJ2luaXRpYWxpemUnIGRpcmVjdGx5IG9uIHRoZSBwYXJlbnQgY2xhc3MuXG5cdFx0U2V0dGluZ3MucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdjaGFuZ2U6bGluaycsIHRoaXMudXBkYXRlTGlua1RvICk7XG5cblx0XHRpZiAoIGF0dGFjaG1lbnQgKSB7XG5cdFx0XHRhdHRhY2htZW50Lm9uKCAnY2hhbmdlOnVwbG9hZGluZycsIHRoaXMucmVuZGVyLCB0aGlzICk7XG5cdFx0fVxuXHR9LFxuXG5cdGRpc3Bvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdHRhY2htZW50ID0gdGhpcy5vcHRpb25zLmF0dGFjaG1lbnQ7XG5cdFx0aWYgKCBhdHRhY2htZW50ICkge1xuXHRcdFx0YXR0YWNobWVudC5vZmYoIG51bGwsIG51bGwsIHRoaXMgKTtcblx0XHR9XG5cdFx0LyoqXG5cdFx0ICogY2FsbCAnZGlzcG9zZScgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzc1xuXHRcdCAqL1xuXHRcdFNldHRpbmdzLnByb3RvdHlwZS5kaXNwb3NlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnREaXNwbGF5fSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgYXR0YWNobWVudCA9IHRoaXMub3B0aW9ucy5hdHRhY2htZW50O1xuXHRcdGlmICggYXR0YWNobWVudCApIHtcblx0XHRcdF8uZXh0ZW5kKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdFx0c2l6ZXM6IGF0dGFjaG1lbnQuZ2V0KCdzaXplcycpLFxuXHRcdFx0XHR0eXBlOiAgYXR0YWNobWVudC5nZXQoJ3R5cGUnKVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdC8qKlxuXHRcdCAqIGNhbGwgJ3JlbmRlcicgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzc1xuXHRcdCAqL1xuXHRcdFNldHRpbmdzLnByb3RvdHlwZS5yZW5kZXIuY2FsbCggdGhpcyApO1xuXHRcdHRoaXMudXBkYXRlTGlua1RvKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0dXBkYXRlTGlua1RvOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbGlua1RvID0gdGhpcy5tb2RlbC5nZXQoJ2xpbmsnKSxcblx0XHRcdCRpbnB1dCA9IHRoaXMuJCgnLmxpbmstdG8tY3VzdG9tJyksXG5cdFx0XHRhdHRhY2htZW50ID0gdGhpcy5vcHRpb25zLmF0dGFjaG1lbnQ7XG5cblx0XHRpZiAoICdub25lJyA9PT0gbGlua1RvIHx8ICdlbWJlZCcgPT09IGxpbmtUbyB8fCAoICEgYXR0YWNobWVudCAmJiAnY3VzdG9tJyAhPT0gbGlua1RvICkgKSB7XG5cdFx0XHQkaW5wdXQuYWRkQ2xhc3MoICdoaWRkZW4nICk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCBhdHRhY2htZW50ICkge1xuXHRcdFx0aWYgKCAncG9zdCcgPT09IGxpbmtUbyApIHtcblx0XHRcdFx0JGlucHV0LnZhbCggYXR0YWNobWVudC5nZXQoJ2xpbmsnKSApO1xuXHRcdFx0fSBlbHNlIGlmICggJ2ZpbGUnID09PSBsaW5rVG8gKSB7XG5cdFx0XHRcdCRpbnB1dC52YWwoIGF0dGFjaG1lbnQuZ2V0KCd1cmwnKSApO1xuXHRcdFx0fSBlbHNlIGlmICggISB0aGlzLm1vZGVsLmdldCgnbGlua1VybCcpICkge1xuXHRcdFx0XHQkaW5wdXQudmFsKCdodHRwOi8vJyk7XG5cdFx0XHR9XG5cblx0XHRcdCRpbnB1dC5wcm9wKCAncmVhZG9ubHknLCAnY3VzdG9tJyAhPT0gbGlua1RvICk7XG5cdFx0fVxuXG5cdFx0JGlucHV0LnJlbW92ZUNsYXNzKCAnaGlkZGVuJyApO1xuXG5cdFx0Ly8gSWYgdGhlIGlucHV0IGlzIHZpc2libGUsIGZvY3VzIGFuZCBzZWxlY3QgaXRzIGNvbnRlbnRzLlxuXHRcdGlmICggISB3cC5tZWRpYS5pc1RvdWNoRGV2aWNlICYmICRpbnB1dC5pcygnOnZpc2libGUnKSApIHtcblx0XHRcdCRpbnB1dC5mb2N1cygpWzBdLnNlbGVjdCgpO1xuXHRcdH1cblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXR0YWNobWVudERpc3BsYXk7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlNldHRpbmdzLkdhbGxlcnlcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LlNldHRpbmdzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBHYWxsZXJ5ID0gd3AubWVkaWEudmlldy5TZXR0aW5ncy5leHRlbmQoe1xuXHRjbGFzc05hbWU6ICdjb2xsZWN0aW9uLXNldHRpbmdzIGdhbGxlcnktc2V0dGluZ3MnLFxuXHR0ZW1wbGF0ZTogIHdwLnRlbXBsYXRlKCdnYWxsZXJ5LXNldHRpbmdzJylcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbGxlcnk7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlNldHRpbmdzLlBsYXlsaXN0XG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5TZXR0aW5nc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgUGxheWxpc3QgPSB3cC5tZWRpYS52aWV3LlNldHRpbmdzLmV4dGVuZCh7XG5cdGNsYXNzTmFtZTogJ2NvbGxlY3Rpb24tc2V0dGluZ3MgcGxheWxpc3Qtc2V0dGluZ3MnLFxuXHR0ZW1wbGF0ZTogIHdwLnRlbXBsYXRlKCdwbGF5bGlzdC1zZXR0aW5ncycpXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5bGlzdDtcbiIsIi8qKlxuICogd3AubWVkaWEudmlldy5TaWRlYmFyXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5Qcmlvcml0eUxpc3RcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFNpZGViYXIgPSB3cC5tZWRpYS52aWV3LlByaW9yaXR5TGlzdC5leHRlbmQoe1xuXHRjbGFzc05hbWU6ICdtZWRpYS1zaWRlYmFyJ1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2lkZWJhcjtcbiIsIi8qZ2xvYmFscyBfICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5TcGlubmVyXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBTcGlubmVyID0gd3AubWVkaWEuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiAgICdzcGFuJyxcblx0Y2xhc3NOYW1lOiAnc3Bpbm5lcicsXG5cdHNwaW5uZXJUaW1lb3V0OiBmYWxzZSxcblx0ZGVsYXk6IDQwMCxcblxuXHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHRpZiAoICEgdGhpcy5zcGlubmVyVGltZW91dCApIHtcblx0XHRcdHRoaXMuc3Bpbm5lclRpbWVvdXQgPSBfLmRlbGF5KGZ1bmN0aW9uKCAkZWwgKSB7XG5cdFx0XHRcdCRlbC5hZGRDbGFzcyggJ2lzLWFjdGl2ZScgKTtcblx0XHRcdH0sIHRoaXMuZGVsYXksIHRoaXMuJGVsICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZWwucmVtb3ZlQ2xhc3MoICdpcy1hY3RpdmUnICk7XG5cdFx0dGhpcy5zcGlubmVyVGltZW91dCA9IGNsZWFyVGltZW91dCggdGhpcy5zcGlubmVyVGltZW91dCApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwaW5uZXI7XG4iLCIvKmdsb2JhbHMgXywgQmFja2JvbmUgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlRvb2xiYXJcbiAqXG4gKiBBIHRvb2xiYXIgd2hpY2ggY29uc2lzdHMgb2YgYSBwcmltYXJ5IGFuZCBhIHNlY29uZGFyeSBzZWN0aW9uLiBFYWNoIHNlY3Rpb25zXG4gKiBjYW4gYmUgZmlsbGVkIHdpdGggdmlld3MuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBWaWV3ID0gd3AubWVkaWEuVmlldyxcblx0VG9vbGJhcjtcblxuVG9vbGJhciA9IFZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogICAnZGl2Jyxcblx0Y2xhc3NOYW1lOiAnbWVkaWEtdG9vbGJhcicsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHN0YXRlID0gdGhpcy5jb250cm9sbGVyLnN0YXRlKCksXG5cdFx0XHRzZWxlY3Rpb24gPSB0aGlzLnNlbGVjdGlvbiA9IHN0YXRlLmdldCgnc2VsZWN0aW9uJyksXG5cdFx0XHRsaWJyYXJ5ID0gdGhpcy5saWJyYXJ5ID0gc3RhdGUuZ2V0KCdsaWJyYXJ5Jyk7XG5cblx0XHR0aGlzLl92aWV3cyA9IHt9O1xuXG5cdFx0Ly8gVGhlIHRvb2xiYXIgaXMgY29tcG9zZWQgb2YgdHdvIGBQcmlvcml0eUxpc3RgIHZpZXdzLlxuXHRcdHRoaXMucHJpbWFyeSAgID0gbmV3IHdwLm1lZGlhLnZpZXcuUHJpb3JpdHlMaXN0KCk7XG5cdFx0dGhpcy5zZWNvbmRhcnkgPSBuZXcgd3AubWVkaWEudmlldy5Qcmlvcml0eUxpc3QoKTtcblx0XHR0aGlzLnByaW1hcnkuJGVsLmFkZENsYXNzKCdtZWRpYS10b29sYmFyLXByaW1hcnkgc2VhcmNoLWZvcm0nKTtcblx0XHR0aGlzLnNlY29uZGFyeS4kZWwuYWRkQ2xhc3MoJ21lZGlhLXRvb2xiYXItc2Vjb25kYXJ5Jyk7XG5cblx0XHR0aGlzLnZpZXdzLnNldChbIHRoaXMuc2Vjb25kYXJ5LCB0aGlzLnByaW1hcnkgXSk7XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5pdGVtcyApIHtcblx0XHRcdHRoaXMuc2V0KCB0aGlzLm9wdGlvbnMuaXRlbXMsIHsgc2lsZW50OiB0cnVlIH0pO1xuXHRcdH1cblxuXHRcdGlmICggISB0aGlzLm9wdGlvbnMuc2lsZW50ICkge1xuXHRcdFx0dGhpcy5yZW5kZXIoKTtcblx0XHR9XG5cblx0XHRpZiAoIHNlbGVjdGlvbiApIHtcblx0XHRcdHNlbGVjdGlvbi5vbiggJ2FkZCByZW1vdmUgcmVzZXQnLCB0aGlzLnJlZnJlc2gsIHRoaXMgKTtcblx0XHR9XG5cblx0XHRpZiAoIGxpYnJhcnkgKSB7XG5cdFx0XHRsaWJyYXJ5Lm9uKCAnYWRkIHJlbW92ZSByZXNldCcsIHRoaXMucmVmcmVzaCwgdGhpcyApO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LlRvb2xiYXJ9IFJldHVybnMgaXRzZWYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdGRpc3Bvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggdGhpcy5zZWxlY3Rpb24gKSB7XG5cdFx0XHR0aGlzLnNlbGVjdGlvbi5vZmYoIG51bGwsIG51bGwsIHRoaXMgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMubGlicmFyeSApIHtcblx0XHRcdHRoaXMubGlicmFyeS5vZmYoIG51bGwsIG51bGwsIHRoaXMgKTtcblx0XHR9XG5cdFx0LyoqXG5cdFx0ICogY2FsbCAnZGlzcG9zZScgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzc1xuXHRcdCAqL1xuXHRcdHJldHVybiBWaWV3LnByb3RvdHlwZS5kaXNwb3NlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHRyZWFkeTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5yZWZyZXNoKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuXHQgKiBAcGFyYW0ge0JhY2tib25lLlZpZXd8T2JqZWN0fSB2aWV3XG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuVG9vbGJhcn0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHNldDogZnVuY3Rpb24oIGlkLCB2aWV3LCBvcHRpb25zICkge1xuXHRcdHZhciBsaXN0O1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0Ly8gQWNjZXB0IGFuIG9iamVjdCB3aXRoIGFuIGBpZGAgOiBgdmlld2AgbWFwcGluZy5cblx0XHRpZiAoIF8uaXNPYmplY3QoIGlkICkgKSB7XG5cdFx0XHRfLmVhY2goIGlkLCBmdW5jdGlvbiggdmlldywgaWQgKSB7XG5cdFx0XHRcdHRoaXMuc2V0KCBpZCwgdmlldywgeyBzaWxlbnQ6IHRydWUgfSk7XG5cdFx0XHR9LCB0aGlzICk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCAhICggdmlldyBpbnN0YW5jZW9mIEJhY2tib25lLlZpZXcgKSApIHtcblx0XHRcdFx0dmlldy5jbGFzc2VzID0gWyAnbWVkaWEtYnV0dG9uLScgKyBpZCBdLmNvbmNhdCggdmlldy5jbGFzc2VzIHx8IFtdICk7XG5cdFx0XHRcdHZpZXcgPSBuZXcgd3AubWVkaWEudmlldy5CdXR0b24oIHZpZXcgKS5yZW5kZXIoKTtcblx0XHRcdH1cblxuXHRcdFx0dmlldy5jb250cm9sbGVyID0gdmlldy5jb250cm9sbGVyIHx8IHRoaXMuY29udHJvbGxlcjtcblxuXHRcdFx0dGhpcy5fdmlld3NbIGlkIF0gPSB2aWV3O1xuXG5cdFx0XHRsaXN0ID0gdmlldy5vcHRpb25zLnByaW9yaXR5IDwgMCA/ICdzZWNvbmRhcnknIDogJ3ByaW1hcnknO1xuXHRcdFx0dGhpc1sgbGlzdCBdLnNldCggaWQsIHZpZXcsIG9wdGlvbnMgKTtcblx0XHR9XG5cblx0XHRpZiAoICEgb3B0aW9ucy5zaWxlbnQgKSB7XG5cdFx0XHR0aGlzLnJlZnJlc2goKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5CdXR0b259XG5cdCAqL1xuXHRnZXQ6IGZ1bmN0aW9uKCBpZCApIHtcblx0XHRyZXR1cm4gdGhpcy5fdmlld3NbIGlkIF07XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaWRcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuVG9vbGJhcn0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHVuc2V0OiBmdW5jdGlvbiggaWQsIG9wdGlvbnMgKSB7XG5cdFx0ZGVsZXRlIHRoaXMuX3ZpZXdzWyBpZCBdO1xuXHRcdHRoaXMucHJpbWFyeS51bnNldCggaWQsIG9wdGlvbnMgKTtcblx0XHR0aGlzLnNlY29uZGFyeS51bnNldCggaWQsIG9wdGlvbnMgKTtcblxuXHRcdGlmICggISBvcHRpb25zIHx8ICEgb3B0aW9ucy5zaWxlbnQgKSB7XG5cdFx0XHR0aGlzLnJlZnJlc2goKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0cmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHN0YXRlID0gdGhpcy5jb250cm9sbGVyLnN0YXRlKCksXG5cdFx0XHRsaWJyYXJ5ID0gc3RhdGUuZ2V0KCdsaWJyYXJ5JyksXG5cdFx0XHRzZWxlY3Rpb24gPSBzdGF0ZS5nZXQoJ3NlbGVjdGlvbicpO1xuXG5cdFx0Xy5lYWNoKCB0aGlzLl92aWV3cywgZnVuY3Rpb24oIGJ1dHRvbiApIHtcblx0XHRcdGlmICggISBidXR0b24ubW9kZWwgfHwgISBidXR0b24ub3B0aW9ucyB8fCAhIGJ1dHRvbi5vcHRpb25zLnJlcXVpcmVzICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHZhciByZXF1aXJlcyA9IGJ1dHRvbi5vcHRpb25zLnJlcXVpcmVzLFxuXHRcdFx0XHRkaXNhYmxlZCA9IGZhbHNlO1xuXG5cdFx0XHQvLyBQcmV2ZW50IGluc2VydGlvbiBvZiBhdHRhY2htZW50cyBpZiBhbnkgb2YgdGhlbSBhcmUgc3RpbGwgdXBsb2FkaW5nXG5cdFx0XHRkaXNhYmxlZCA9IF8uc29tZSggc2VsZWN0aW9uLm1vZGVscywgZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cdFx0XHRcdHJldHVybiBhdHRhY2htZW50LmdldCgndXBsb2FkaW5nJykgPT09IHRydWU7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKCByZXF1aXJlcy5zZWxlY3Rpb24gJiYgc2VsZWN0aW9uICYmICEgc2VsZWN0aW9uLmxlbmd0aCApIHtcblx0XHRcdFx0ZGlzYWJsZWQgPSB0cnVlO1xuXHRcdFx0fSBlbHNlIGlmICggcmVxdWlyZXMubGlicmFyeSAmJiBsaWJyYXJ5ICYmICEgbGlicmFyeS5sZW5ndGggKSB7XG5cdFx0XHRcdGRpc2FibGVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGJ1dHRvbi5tb2RlbC5zZXQoICdkaXNhYmxlZCcsIGRpc2FibGVkICk7XG5cdFx0fSk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvb2xiYXI7XG4iLCIvKmdsb2JhbHMgd3AsIF8gKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlRvb2xiYXIuRW1iZWRcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LlRvb2xiYXIuU2VsZWN0XG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5Ub29sYmFyXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBTZWxlY3QgPSB3cC5tZWRpYS52aWV3LlRvb2xiYXIuU2VsZWN0LFxuXHRsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHRFbWJlZDtcblxuRW1iZWQgPSBTZWxlY3QuZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0Xy5kZWZhdWx0cyggdGhpcy5vcHRpb25zLCB7XG5cdFx0XHR0ZXh0OiBsMTBuLmluc2VydEludG9Qb3N0LFxuXHRcdFx0cmVxdWlyZXM6IGZhbHNlXG5cdFx0fSk7XG5cdFx0Ly8gQ2FsbCAnaW5pdGlhbGl6ZScgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzcy5cblx0XHRTZWxlY3QucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdHJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB1cmwgPSB0aGlzLmNvbnRyb2xsZXIuc3RhdGUoKS5wcm9wcy5nZXQoJ3VybCcpO1xuXHRcdHRoaXMuZ2V0KCdzZWxlY3QnKS5tb2RlbC5zZXQoICdkaXNhYmxlZCcsICEgdXJsIHx8IHVybCA9PT0gJ2h0dHA6Ly8nICk7XG5cdFx0LyoqXG5cdFx0ICogY2FsbCAncmVmcmVzaCcgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzc1xuXHRcdCAqL1xuXHRcdFNlbGVjdC5wcm90b3R5cGUucmVmcmVzaC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtYmVkO1xuIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5Ub29sYmFyLlNlbGVjdFxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuVG9vbGJhclxuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgVG9vbGJhciA9IHdwLm1lZGlhLnZpZXcuVG9vbGJhcixcblx0bDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0U2VsZWN0O1xuXG5TZWxlY3QgPSBUb29sYmFyLmV4dGVuZCh7XG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG5cdFx0Xy5iaW5kQWxsKCB0aGlzLCAnY2xpY2tTZWxlY3QnICk7XG5cblx0XHRfLmRlZmF1bHRzKCBvcHRpb25zLCB7XG5cdFx0XHRldmVudDogJ3NlbGVjdCcsXG5cdFx0XHRzdGF0ZTogZmFsc2UsXG5cdFx0XHRyZXNldDogdHJ1ZSxcblx0XHRcdGNsb3NlOiB0cnVlLFxuXHRcdFx0dGV4dDogIGwxMG4uc2VsZWN0LFxuXG5cdFx0XHQvLyBEb2VzIHRoZSBidXR0b24gcmVseSBvbiB0aGUgc2VsZWN0aW9uP1xuXHRcdFx0cmVxdWlyZXM6IHtcblx0XHRcdFx0c2VsZWN0aW9uOiB0cnVlXG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRvcHRpb25zLml0ZW1zID0gXy5kZWZhdWx0cyggb3B0aW9ucy5pdGVtcyB8fCB7fSwge1xuXHRcdFx0c2VsZWN0OiB7XG5cdFx0XHRcdHN0eWxlOiAgICAncHJpbWFyeScsXG5cdFx0XHRcdHRleHQ6ICAgICBvcHRpb25zLnRleHQsXG5cdFx0XHRcdHByaW9yaXR5OiA4MCxcblx0XHRcdFx0Y2xpY2s6ICAgIHRoaXMuY2xpY2tTZWxlY3QsXG5cdFx0XHRcdHJlcXVpcmVzOiBvcHRpb25zLnJlcXVpcmVzXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0Ly8gQ2FsbCAnaW5pdGlhbGl6ZScgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzcy5cblx0XHRUb29sYmFyLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHRjbGlja1NlbGVjdDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG5cdFx0XHRjb250cm9sbGVyID0gdGhpcy5jb250cm9sbGVyO1xuXG5cdFx0aWYgKCBvcHRpb25zLmNsb3NlICkge1xuXHRcdFx0Y29udHJvbGxlci5jbG9zZSgpO1xuXHRcdH1cblxuXHRcdGlmICggb3B0aW9ucy5ldmVudCApIHtcblx0XHRcdGNvbnRyb2xsZXIuc3RhdGUoKS50cmlnZ2VyKCBvcHRpb25zLmV2ZW50ICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBvcHRpb25zLnN0YXRlICkge1xuXHRcdFx0Y29udHJvbGxlci5zZXRTdGF0ZSggb3B0aW9ucy5zdGF0ZSApO1xuXHRcdH1cblxuXHRcdGlmICggb3B0aW9ucy5yZXNldCApIHtcblx0XHRcdGNvbnRyb2xsZXIucmVzZXQoKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdDtcbiIsIi8qZ2xvYmFscyB3cCwgXywgalF1ZXJ5ICovXG5cbi8qKlxuICogQ3JlYXRlcyBhIGRyb3B6b25lIG9uIFdQIGVkaXRvciBpbnN0YW5jZXMgKGVsZW1lbnRzIHdpdGggLndwLWVkaXRvci13cmFwXG4gKiBvciAjd3AtZnVsbHNjcmVlbi1ib2R5KSBhbmQgcmVsYXlzIGRyYWcnbidkcm9wcGVkIGZpbGVzIHRvIGEgbWVkaWEgd29ya2Zsb3cuXG4gKlxuICogd3AubWVkaWEudmlldy5FZGl0b3JVcGxvYWRlclxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgVmlldyA9IHdwLm1lZGlhLlZpZXcsXG5cdGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdCQgPSBqUXVlcnksXG5cdEVkaXRvclVwbG9hZGVyO1xuXG5FZGl0b3JVcGxvYWRlciA9IFZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogICAnZGl2Jyxcblx0Y2xhc3NOYW1lOiAndXBsb2FkZXItZWRpdG9yJyxcblx0dGVtcGxhdGU6ICB3cC50ZW1wbGF0ZSggJ3VwbG9hZGVyLWVkaXRvcicgKSxcblxuXHRsb2NhbERyYWc6IGZhbHNlLFxuXHRvdmVyQ29udGFpbmVyOiBmYWxzZSxcblx0b3ZlckRyb3B6b25lOiBmYWxzZSxcblx0ZHJhZ2dpbmdGaWxlOiBudWxsLFxuXG5cdC8qKlxuXHQgKiBCaW5kIGRyYWcnbidkcm9wIGV2ZW50cyB0byBjYWxsYmFja3MuXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG5cblx0XHQvLyBCYWlsIGlmIG5vdCBlbmFibGVkIG9yIFVBIGRvZXMgbm90IHN1cHBvcnQgZHJhZyduJ2Ryb3Agb3IgRmlsZSBBUEkuXG5cdFx0aWYgKCAhIHdpbmRvdy50aW55TUNFUHJlSW5pdCB8fCAhIHdpbmRvdy50aW55TUNFUHJlSW5pdC5kcmFnRHJvcFVwbG9hZCB8fCAhIHRoaXMuYnJvd3NlclN1cHBvcnQoKSApIHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdHRoaXMuJGRvY3VtZW50ID0gJChkb2N1bWVudCk7XG5cdFx0dGhpcy5kcm9wem9uZXMgPSBbXTtcblx0XHR0aGlzLmZpbGVzID0gW107XG5cblx0XHR0aGlzLiRkb2N1bWVudC5vbiggJ2Ryb3AnLCAnLnVwbG9hZGVyLWVkaXRvcicsIF8uYmluZCggdGhpcy5kcm9wLCB0aGlzICkgKTtcblx0XHR0aGlzLiRkb2N1bWVudC5vbiggJ2RyYWdvdmVyJywgJy51cGxvYWRlci1lZGl0b3InLCBfLmJpbmQoIHRoaXMuZHJvcHpvbmVEcmFnb3ZlciwgdGhpcyApICk7XG5cdFx0dGhpcy4kZG9jdW1lbnQub24oICdkcmFnbGVhdmUnLCAnLnVwbG9hZGVyLWVkaXRvcicsIF8uYmluZCggdGhpcy5kcm9wem9uZURyYWdsZWF2ZSwgdGhpcyApICk7XG5cdFx0dGhpcy4kZG9jdW1lbnQub24oICdjbGljaycsICcudXBsb2FkZXItZWRpdG9yJywgXy5iaW5kKCB0aGlzLmNsaWNrLCB0aGlzICkgKTtcblxuXHRcdHRoaXMuJGRvY3VtZW50Lm9uKCAnZHJhZ292ZXInLCBfLmJpbmQoIHRoaXMuY29udGFpbmVyRHJhZ292ZXIsIHRoaXMgKSApO1xuXHRcdHRoaXMuJGRvY3VtZW50Lm9uKCAnZHJhZ2xlYXZlJywgXy5iaW5kKCB0aGlzLmNvbnRhaW5lckRyYWdsZWF2ZSwgdGhpcyApICk7XG5cblx0XHR0aGlzLiRkb2N1bWVudC5vbiggJ2RyYWdzdGFydCBkcmFnZW5kIGRyb3AnLCBfLmJpbmQoIGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHRoaXMubG9jYWxEcmFnID0gZXZlbnQudHlwZSA9PT0gJ2RyYWdzdGFydCc7XG5cdFx0fSwgdGhpcyApICk7XG5cblx0XHR0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvKipcblx0ICogQ2hlY2sgYnJvd3NlciBzdXBwb3J0IGZvciBkcmFnJ24nZHJvcC5cblx0ICpcblx0ICogQHJldHVybiBCb29sZWFuXG5cdCAqL1xuXHRicm93c2VyU3VwcG9ydDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHN1cHBvcnRzID0gZmFsc2UsIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG5cdFx0c3VwcG9ydHMgPSAoICdkcmFnZ2FibGUnIGluIGRpdiApIHx8ICggJ29uZHJhZ3N0YXJ0JyBpbiBkaXYgJiYgJ29uZHJvcCcgaW4gZGl2ICk7XG5cdFx0c3VwcG9ydHMgPSBzdXBwb3J0cyAmJiAhISAoIHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuRmlsZVJlYWRlciApO1xuXHRcdHJldHVybiBzdXBwb3J0cztcblx0fSxcblxuXHRpc0RyYWdnaW5nRmlsZTogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGlmICggdGhpcy5kcmFnZ2luZ0ZpbGUgIT09IG51bGwgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5kcmFnZ2luZ0ZpbGU7XG5cdFx0fVxuXG5cdFx0aWYgKCBfLmlzVW5kZWZpbmVkKCBldmVudC5vcmlnaW5hbEV2ZW50ICkgfHwgXy5pc1VuZGVmaW5lZCggZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIgKSApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHR0aGlzLmRyYWdnaW5nRmlsZSA9IF8uaW5kZXhPZiggZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIudHlwZXMsICdGaWxlcycgKSA+IC0xICYmXG5cdFx0XHRfLmluZGV4T2YoIGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnR5cGVzLCAndGV4dC9wbGFpbicgKSA9PT0gLTE7XG5cblx0XHRyZXR1cm4gdGhpcy5kcmFnZ2luZ0ZpbGU7XG5cdH0sXG5cblx0cmVmcmVzaDogZnVuY3Rpb24oIGUgKSB7XG5cdFx0dmFyIGRyb3B6b25lX2lkO1xuXHRcdGZvciAoIGRyb3B6b25lX2lkIGluIHRoaXMuZHJvcHpvbmVzICkge1xuXHRcdFx0Ly8gSGlkZSB0aGUgZHJvcHpvbmVzIG9ubHkgaWYgZHJhZ2dpbmcgaGFzIGxlZnQgdGhlIHNjcmVlbi5cblx0XHRcdHRoaXMuZHJvcHpvbmVzWyBkcm9wem9uZV9pZCBdLnRvZ2dsZSggdGhpcy5vdmVyQ29udGFpbmVyIHx8IHRoaXMub3ZlckRyb3B6b25lICk7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIF8uaXNVbmRlZmluZWQoIGUgKSApIHtcblx0XHRcdCQoIGUudGFyZ2V0ICkuY2xvc2VzdCggJy51cGxvYWRlci1lZGl0b3InICkudG9nZ2xlQ2xhc3MoICdkcm9wcGFibGUnLCB0aGlzLm92ZXJEcm9wem9uZSApO1xuXHRcdH1cblxuXHRcdGlmICggISB0aGlzLm92ZXJDb250YWluZXIgJiYgISB0aGlzLm92ZXJEcm9wem9uZSApIHtcblx0XHRcdHRoaXMuZHJhZ2dpbmdGaWxlID0gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggISB0aGlzLmluaXRpYWxpemVkICkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0Vmlldy5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHQkKCAnLndwLWVkaXRvci13cmFwLCAjd3AtZnVsbHNjcmVlbi1ib2R5JyApLmVhY2goIF8uYmluZCggdGhpcy5hdHRhY2gsIHRoaXMgKSApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGF0dGFjaDogZnVuY3Rpb24oIGluZGV4LCBlZGl0b3IgKSB7XG5cdFx0Ly8gQXR0YWNoIGEgZHJvcHpvbmUgdG8gYW4gZWRpdG9yLlxuXHRcdHZhciBkcm9wem9uZSA9IHRoaXMuJGVsLmNsb25lKCk7XG5cdFx0dGhpcy5kcm9wem9uZXMucHVzaCggZHJvcHpvbmUgKTtcblx0XHQkKCBlZGl0b3IgKS5hcHBlbmQoIGRyb3B6b25lICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFdoZW4gYSBmaWxlIGlzIGRyb3BwZWQgb24gdGhlIGVkaXRvciB1cGxvYWRlciwgb3BlbiB1cCBhbiBlZGl0b3IgbWVkaWEgd29ya2Zsb3dcblx0ICogYW5kIHVwbG9hZCB0aGUgZmlsZSBpbW1lZGlhdGVseS5cblx0ICpcblx0ICogQHBhcmFtICB7alF1ZXJ5LkV2ZW50fSBldmVudCBUaGUgJ2Ryb3AnIGV2ZW50LlxuXHQgKi9cblx0ZHJvcDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciAkd3JhcCA9IG51bGwsIHVwbG9hZFZpZXc7XG5cblx0XHR0aGlzLmNvbnRhaW5lckRyYWdsZWF2ZSggZXZlbnQgKTtcblx0XHR0aGlzLmRyb3B6b25lRHJhZ2xlYXZlKCBldmVudCApO1xuXG5cdFx0dGhpcy5maWxlcyA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzO1xuXHRcdGlmICggdGhpcy5maWxlcy5sZW5ndGggPCAxICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFNldCB0aGUgYWN0aXZlIGVkaXRvciB0byB0aGUgZHJvcCB0YXJnZXQuXG5cdFx0JHdyYXAgPSAkKCBldmVudC50YXJnZXQgKS5wYXJlbnRzKCAnLndwLWVkaXRvci13cmFwJyApO1xuXHRcdGlmICggJHdyYXAubGVuZ3RoID4gMCAmJiAkd3JhcFswXS5pZCApIHtcblx0XHRcdHdpbmRvdy53cEFjdGl2ZUVkaXRvciA9ICR3cmFwWzBdLmlkLnNsaWNlKCAzLCAtNSApO1xuXHRcdH1cblxuXHRcdGlmICggISB0aGlzLndvcmtmbG93ICkge1xuXHRcdFx0dGhpcy53b3JrZmxvdyA9IHdwLm1lZGlhLmVkaXRvci5vcGVuKCAnY29udGVudCcsIHtcblx0XHRcdFx0ZnJhbWU6ICAgICdwb3N0Jyxcblx0XHRcdFx0c3RhdGU6ICAgICdpbnNlcnQnLFxuXHRcdFx0XHR0aXRsZTogICAgbDEwbi5hZGRNZWRpYSxcblx0XHRcdFx0bXVsdGlwbGU6IHRydWVcblx0XHRcdH0pO1xuXHRcdFx0dXBsb2FkVmlldyA9IHRoaXMud29ya2Zsb3cudXBsb2FkZXI7XG5cdFx0XHRpZiAoIHVwbG9hZFZpZXcudXBsb2FkZXIgJiYgdXBsb2FkVmlldy51cGxvYWRlci5yZWFkeSApIHtcblx0XHRcdFx0dGhpcy5hZGRGaWxlcy5hcHBseSggdGhpcyApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy53b3JrZmxvdy5vbiggJ3VwbG9hZGVyOnJlYWR5JywgdGhpcy5hZGRGaWxlcywgdGhpcyApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLndvcmtmbG93LnN0YXRlKCkucmVzZXQoKTtcblx0XHRcdHRoaXMuYWRkRmlsZXMuYXBwbHkoIHRoaXMgKTtcblx0XHRcdHRoaXMud29ya2Zsb3cub3BlbigpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblxuXHQvKipcblx0ICogQWRkIHRoZSBmaWxlcyB0byB0aGUgdXBsb2FkZXIuXG5cdCAqL1xuXHRhZGRGaWxlczogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLmZpbGVzLmxlbmd0aCApIHtcblx0XHRcdHRoaXMud29ya2Zsb3cudXBsb2FkZXIudXBsb2FkZXIudXBsb2FkZXIuYWRkRmlsZSggXy50b0FycmF5KCB0aGlzLmZpbGVzICkgKTtcblx0XHRcdHRoaXMuZmlsZXMgPSBbXTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0Y29udGFpbmVyRHJhZ292ZXI6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRpZiAoIHRoaXMubG9jYWxEcmFnIHx8ICEgdGhpcy5pc0RyYWdnaW5nRmlsZSggZXZlbnQgKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLm92ZXJDb250YWluZXIgPSB0cnVlO1xuXHRcdHRoaXMucmVmcmVzaCgpO1xuXHR9LFxuXG5cdGNvbnRhaW5lckRyYWdsZWF2ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5vdmVyQ29udGFpbmVyID0gZmFsc2U7XG5cblx0XHQvLyBUaHJvdHRsZSBkcmFnbGVhdmUgYmVjYXVzZSBpdCdzIGNhbGxlZCB3aGVuIGJvdW5jaW5nIGZyb20gc29tZSBlbGVtZW50cyB0byBvdGhlcnMuXG5cdFx0Xy5kZWxheSggXy5iaW5kKCB0aGlzLnJlZnJlc2gsIHRoaXMgKSwgNTAgKTtcblx0fSxcblxuXHRkcm9wem9uZURyYWdvdmVyOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0aWYgKCB0aGlzLmxvY2FsRHJhZyB8fCAhIHRoaXMuaXNEcmFnZ2luZ0ZpbGUoIGV2ZW50ICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5vdmVyRHJvcHpvbmUgPSB0cnVlO1xuXHRcdHRoaXMucmVmcmVzaCggZXZlbnQgKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cblx0ZHJvcHpvbmVEcmFnbGVhdmU6IGZ1bmN0aW9uKCBlICkge1xuXHRcdHRoaXMub3ZlckRyb3B6b25lID0gZmFsc2U7XG5cdFx0Xy5kZWxheSggXy5iaW5kKCB0aGlzLnJlZnJlc2gsIHRoaXMsIGUgKSwgNTAgKTtcblx0fSxcblxuXHRjbGljazogZnVuY3Rpb24oIGUgKSB7XG5cdFx0Ly8gSW4gdGhlIHJhcmUgY2FzZSB3aGVyZSB0aGUgZHJvcHpvbmUgZ2V0cyBzdHVjaywgaGlkZSBpdCBvbiBjbGljay5cblx0XHR0aGlzLmNvbnRhaW5lckRyYWdsZWF2ZSggZSApO1xuXHRcdHRoaXMuZHJvcHpvbmVEcmFnbGVhdmUoIGUgKTtcblx0XHR0aGlzLmxvY2FsRHJhZyA9IGZhbHNlO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3JVcGxvYWRlcjtcbiIsIi8qZ2xvYmFscyB3cCwgXyAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuVXBsb2FkZXJJbmxpbmVcbiAqXG4gKiBUaGUgaW5saW5lIHVwbG9hZGVyIHRoYXQgc2hvd3MgdXAgaW4gdGhlICdVcGxvYWQgRmlsZXMnIHRhYi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFZpZXcgPSB3cC5tZWRpYS5WaWV3LFxuXHRVcGxvYWRlcklubGluZTtcblxuVXBsb2FkZXJJbmxpbmUgPSBWaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAgJ2RpdicsXG5cdGNsYXNzTmFtZTogJ3VwbG9hZGVyLWlubGluZScsXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoJ3VwbG9hZGVyLWlubGluZScpLFxuXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayAuY2xvc2UnOiAnaGlkZSdcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdG1lc3NhZ2U6ICcnLFxuXHRcdFx0c3RhdHVzOiAgdHJ1ZSxcblx0XHRcdGNhbkNsb3NlOiBmYWxzZVxuXHRcdH0pO1xuXG5cdFx0aWYgKCAhIHRoaXMub3B0aW9ucy4kYnJvd3NlciAmJiB0aGlzLmNvbnRyb2xsZXIudXBsb2FkZXIgKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMuJGJyb3dzZXIgPSB0aGlzLmNvbnRyb2xsZXIudXBsb2FkZXIuJGJyb3dzZXI7XG5cdFx0fVxuXG5cdFx0aWYgKCBfLmlzVW5kZWZpbmVkKCB0aGlzLm9wdGlvbnMucG9zdElkICkgKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMucG9zdElkID0gd3AubWVkaWEudmlldy5zZXR0aW5ncy5wb3N0LmlkO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5vcHRpb25zLnN0YXR1cyApIHtcblx0XHRcdHRoaXMudmlld3Muc2V0KCAnLnVwbG9hZC1pbmxpbmUtc3RhdHVzJywgbmV3IHdwLm1lZGlhLnZpZXcuVXBsb2FkZXJTdGF0dXMoe1xuXHRcdFx0XHRjb250cm9sbGVyOiB0aGlzLmNvbnRyb2xsZXJcblx0XHRcdH0pICk7XG5cdFx0fVxuXHR9LFxuXG5cdHByZXBhcmU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzdWdnZXN0ZWRXaWR0aCA9IHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLmdldCgnc3VnZ2VzdGVkV2lkdGgnKSxcblx0XHRcdHN1Z2dlc3RlZEhlaWdodCA9IHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLmdldCgnc3VnZ2VzdGVkSGVpZ2h0JyksXG5cdFx0XHRkYXRhID0ge307XG5cblx0XHRkYXRhLm1lc3NhZ2UgPSB0aGlzLm9wdGlvbnMubWVzc2FnZTtcblx0XHRkYXRhLmNhbkNsb3NlID0gdGhpcy5vcHRpb25zLmNhbkNsb3NlO1xuXG5cdFx0aWYgKCBzdWdnZXN0ZWRXaWR0aCAmJiBzdWdnZXN0ZWRIZWlnaHQgKSB7XG5cdFx0XHRkYXRhLnN1Z2dlc3RlZFdpZHRoID0gc3VnZ2VzdGVkV2lkdGg7XG5cdFx0XHRkYXRhLnN1Z2dlc3RlZEhlaWdodCA9IHN1Z2dlc3RlZEhlaWdodDtcblx0XHR9XG5cblx0XHRyZXR1cm4gZGF0YTtcblx0fSxcblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LlVwbG9hZGVySW5saW5lfSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0ZGlzcG9zZTogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLmRpc3Bvc2luZyApIHtcblx0XHRcdC8qKlxuXHRcdFx0ICogY2FsbCAnZGlzcG9zZScgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzc1xuXHRcdFx0ICovXG5cdFx0XHRyZXR1cm4gVmlldy5wcm90b3R5cGUuZGlzcG9zZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0fVxuXG5cdFx0Ly8gUnVuIHJlbW92ZSBvbiBgZGlzcG9zZWAsIHNvIHdlIGNhbiBiZSBzdXJlIHRvIHJlZnJlc2ggdGhlXG5cdFx0Ly8gdXBsb2FkZXIgd2l0aCBhIHZpZXctbGVzcyBET00uIFRyYWNrIHdoZXRoZXIgd2UncmUgZGlzcG9zaW5nXG5cdFx0Ly8gc28gd2UgZG9uJ3QgdHJpZ2dlciBhbiBpbmZpbml0ZSBsb29wLlxuXHRcdHRoaXMuZGlzcG9zaW5nID0gdHJ1ZTtcblx0XHRyZXR1cm4gdGhpcy5yZW1vdmUoKTtcblx0fSxcblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LlVwbG9hZGVySW5saW5lfSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0cmVtb3ZlOiBmdW5jdGlvbigpIHtcblx0XHQvKipcblx0XHQgKiBjYWxsICdyZW1vdmUnIGRpcmVjdGx5IG9uIHRoZSBwYXJlbnQgY2xhc3Ncblx0XHQgKi9cblx0XHR2YXIgcmVzdWx0ID0gVmlldy5wcm90b3R5cGUucmVtb3ZlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdF8uZGVmZXIoIF8uYmluZCggdGhpcy5yZWZyZXNoLCB0aGlzICkgKTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdHJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB1cGxvYWRlciA9IHRoaXMuY29udHJvbGxlci51cGxvYWRlcjtcblxuXHRcdGlmICggdXBsb2FkZXIgKSB7XG5cdFx0XHR1cGxvYWRlci5yZWZyZXNoKCk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuVXBsb2FkZXJJbmxpbmV9XG5cdCAqL1xuXHRyZWFkeTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRicm93c2VyID0gdGhpcy5vcHRpb25zLiRicm93c2VyLFxuXHRcdFx0JHBsYWNlaG9sZGVyO1xuXG5cdFx0aWYgKCB0aGlzLmNvbnRyb2xsZXIudXBsb2FkZXIgKSB7XG5cdFx0XHQkcGxhY2Vob2xkZXIgPSB0aGlzLiQoJy5icm93c2VyJyk7XG5cblx0XHRcdC8vIENoZWNrIGlmIHdlJ3ZlIGFscmVhZHkgcmVwbGFjZWQgdGhlIHBsYWNlaG9sZGVyLlxuXHRcdFx0aWYgKCAkcGxhY2Vob2xkZXJbMF0gPT09ICRicm93c2VyWzBdICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdCRicm93c2VyLmRldGFjaCgpLnRleHQoICRwbGFjZWhvbGRlci50ZXh0KCkgKTtcblx0XHRcdCRicm93c2VyWzBdLmNsYXNzTmFtZSA9ICRwbGFjZWhvbGRlclswXS5jbGFzc05hbWU7XG5cdFx0XHQkcGxhY2Vob2xkZXIucmVwbGFjZVdpdGgoICRicm93c2VyLnNob3coKSApO1xuXHRcdH1cblxuXHRcdHRoaXMucmVmcmVzaCgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiRlbC5yZW1vdmVDbGFzcyggJ2hpZGRlbicgKTtcblx0fSxcblx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZWwuYWRkQ2xhc3MoICdoaWRkZW4nICk7XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVXBsb2FkZXJJbmxpbmU7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlVwbG9hZGVyU3RhdHVzRXJyb3JcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFVwbG9hZGVyU3RhdHVzRXJyb3IgPSB3cC5tZWRpYS5WaWV3LmV4dGVuZCh7XG5cdGNsYXNzTmFtZTogJ3VwbG9hZC1lcnJvcicsXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoJ3VwbG9hZGVyLXN0YXR1cy1lcnJvcicpXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBVcGxvYWRlclN0YXR1c0Vycm9yO1xuIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5VcGxvYWRlclN0YXR1c1xuICpcbiAqIEFuIHVwbG9hZGVyIHN0YXR1cyBmb3Igb24tZ29pbmcgdXBsb2Fkcy5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFZpZXcgPSB3cC5tZWRpYS5WaWV3LFxuXHRVcGxvYWRlclN0YXR1cztcblxuVXBsb2FkZXJTdGF0dXMgPSBWaWV3LmV4dGVuZCh7XG5cdGNsYXNzTmFtZTogJ21lZGlhLXVwbG9hZGVyLXN0YXR1cycsXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoJ3VwbG9hZGVyLXN0YXR1cycpLFxuXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayAudXBsb2FkLWRpc21pc3MtZXJyb3JzJzogJ2Rpc21pc3MnXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5xdWV1ZSA9IHdwLlVwbG9hZGVyLnF1ZXVlO1xuXHRcdHRoaXMucXVldWUub24oICdhZGQgcmVtb3ZlIHJlc2V0JywgdGhpcy52aXNpYmlsaXR5LCB0aGlzICk7XG5cdFx0dGhpcy5xdWV1ZS5vbiggJ2FkZCByZW1vdmUgcmVzZXQgY2hhbmdlOnBlcmNlbnQnLCB0aGlzLnByb2dyZXNzLCB0aGlzICk7XG5cdFx0dGhpcy5xdWV1ZS5vbiggJ2FkZCByZW1vdmUgcmVzZXQgY2hhbmdlOnVwbG9hZGluZycsIHRoaXMuaW5mbywgdGhpcyApO1xuXG5cdFx0dGhpcy5lcnJvcnMgPSB3cC5VcGxvYWRlci5lcnJvcnM7XG5cdFx0dGhpcy5lcnJvcnMucmVzZXQoKTtcblx0XHR0aGlzLmVycm9ycy5vbiggJ2FkZCByZW1vdmUgcmVzZXQnLCB0aGlzLnZpc2liaWxpdHksIHRoaXMgKTtcblx0XHR0aGlzLmVycm9ycy5vbiggJ2FkZCcsIHRoaXMuZXJyb3IsIHRoaXMgKTtcblx0fSxcblx0LyoqXG5cdCAqIEBnbG9iYWwgd3AuVXBsb2FkZXJcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuVXBsb2FkZXJTdGF0dXN9XG5cdCAqL1xuXHRkaXNwb3NlOiBmdW5jdGlvbigpIHtcblx0XHR3cC5VcGxvYWRlci5xdWV1ZS5vZmYoIG51bGwsIG51bGwsIHRoaXMgKTtcblx0XHQvKipcblx0XHQgKiBjYWxsICdkaXNwb3NlJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzXG5cdFx0ICovXG5cdFx0Vmlldy5wcm90b3R5cGUuZGlzcG9zZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0dmlzaWJpbGl0eTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZWwudG9nZ2xlQ2xhc3MoICd1cGxvYWRpbmcnLCAhISB0aGlzLnF1ZXVlLmxlbmd0aCApO1xuXHRcdHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCAnZXJyb3JzJywgISEgdGhpcy5lcnJvcnMubGVuZ3RoICk7XG5cdFx0dGhpcy4kZWwudG9nZ2xlKCAhISB0aGlzLnF1ZXVlLmxlbmd0aCB8fCAhISB0aGlzLmVycm9ycy5sZW5ndGggKTtcblx0fSxcblxuXHRyZWFkeTogZnVuY3Rpb24oKSB7XG5cdFx0Xy5lYWNoKHtcblx0XHRcdCckYmFyJzogICAgICAnLm1lZGlhLXByb2dyZXNzLWJhciBkaXYnLFxuXHRcdFx0JyRpbmRleCc6ICAgICcudXBsb2FkLWluZGV4Jyxcblx0XHRcdCckdG90YWwnOiAgICAnLnVwbG9hZC10b3RhbCcsXG5cdFx0XHQnJGZpbGVuYW1lJzogJy51cGxvYWQtZmlsZW5hbWUnXG5cdFx0fSwgZnVuY3Rpb24oIHNlbGVjdG9yLCBrZXkgKSB7XG5cdFx0XHR0aGlzWyBrZXkgXSA9IHRoaXMuJCggc2VsZWN0b3IgKTtcblx0XHR9LCB0aGlzICk7XG5cblx0XHR0aGlzLnZpc2liaWxpdHkoKTtcblx0XHR0aGlzLnByb2dyZXNzKCk7XG5cdFx0dGhpcy5pbmZvKCk7XG5cdH0sXG5cblx0cHJvZ3Jlc3M6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBxdWV1ZSA9IHRoaXMucXVldWUsXG5cdFx0XHQkYmFyID0gdGhpcy4kYmFyO1xuXG5cdFx0aWYgKCAhICRiYXIgfHwgISBxdWV1ZS5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JGJhci53aWR0aCggKCBxdWV1ZS5yZWR1Y2UoIGZ1bmN0aW9uKCBtZW1vLCBhdHRhY2htZW50ICkge1xuXHRcdFx0aWYgKCAhIGF0dGFjaG1lbnQuZ2V0KCd1cGxvYWRpbmcnKSApIHtcblx0XHRcdFx0cmV0dXJuIG1lbW8gKyAxMDA7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBwZXJjZW50ID0gYXR0YWNobWVudC5nZXQoJ3BlcmNlbnQnKTtcblx0XHRcdHJldHVybiBtZW1vICsgKCBfLmlzTnVtYmVyKCBwZXJjZW50ICkgPyBwZXJjZW50IDogMTAwICk7XG5cdFx0fSwgMCApIC8gcXVldWUubGVuZ3RoICkgKyAnJScgKTtcblx0fSxcblxuXHRpbmZvOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgcXVldWUgPSB0aGlzLnF1ZXVlLFxuXHRcdFx0aW5kZXggPSAwLCBhY3RpdmU7XG5cblx0XHRpZiAoICEgcXVldWUubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGFjdGl2ZSA9IHRoaXMucXVldWUuZmluZCggZnVuY3Rpb24oIGF0dGFjaG1lbnQsIGkgKSB7XG5cdFx0XHRpbmRleCA9IGk7XG5cdFx0XHRyZXR1cm4gYXR0YWNobWVudC5nZXQoJ3VwbG9hZGluZycpO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy4kaW5kZXgudGV4dCggaW5kZXggKyAxICk7XG5cdFx0dGhpcy4kdG90YWwudGV4dCggcXVldWUubGVuZ3RoICk7XG5cdFx0dGhpcy4kZmlsZW5hbWUuaHRtbCggYWN0aXZlID8gdGhpcy5maWxlbmFtZSggYWN0aXZlLmdldCgnZmlsZW5hbWUnKSApIDogJycgKTtcblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZVxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfVxuXHQgKi9cblx0ZmlsZW5hbWU6IGZ1bmN0aW9uKCBmaWxlbmFtZSApIHtcblx0XHRyZXR1cm4gd3AubWVkaWEudHJ1bmNhdGUoIF8uZXNjYXBlKCBmaWxlbmFtZSApLCAyNCApO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtCYWNrYm9uZS5Nb2RlbH0gZXJyb3Jcblx0ICovXG5cdGVycm9yOiBmdW5jdGlvbiggZXJyb3IgKSB7XG5cdFx0dGhpcy52aWV3cy5hZGQoICcudXBsb2FkLWVycm9ycycsIG5ldyB3cC5tZWRpYS52aWV3LlVwbG9hZGVyU3RhdHVzRXJyb3Ioe1xuXHRcdFx0ZmlsZW5hbWU6IHRoaXMuZmlsZW5hbWUoIGVycm9yLmdldCgnZmlsZScpLm5hbWUgKSxcblx0XHRcdG1lc3NhZ2U6ICBlcnJvci5nZXQoJ21lc3NhZ2UnKVxuXHRcdH0pLCB7IGF0OiAwIH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAZ2xvYmFsIHdwLlVwbG9hZGVyXG5cdCAqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuXHQgKi9cblx0ZGlzbWlzczogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBlcnJvcnMgPSB0aGlzLnZpZXdzLmdldCgnLnVwbG9hZC1lcnJvcnMnKTtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRpZiAoIGVycm9ycyApIHtcblx0XHRcdF8uaW52b2tlKCBlcnJvcnMsICdyZW1vdmUnICk7XG5cdFx0fVxuXHRcdHdwLlVwbG9hZGVyLmVycm9ycy5yZXNldCgpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBVcGxvYWRlclN0YXR1cztcbiIsIi8qZ2xvYmFscyB3cCwgXywgalF1ZXJ5ICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5VcGxvYWRlcldpbmRvd1xuICpcbiAqIEFuIHVwbG9hZGVyIHdpbmRvdyB0aGF0IGFsbG93cyBmb3IgZHJhZ2dpbmcgYW5kIGRyb3BwaW5nIG1lZGlhLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gICAgICAgICAgICAgICAgICAgT3B0aW9ucyBoYXNoIHBhc3NlZCB0byB0aGUgdmlldy5cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy51cGxvYWRlcl0gICAgICAgICAgVXBsb2FkZXIgcHJvcGVydGllcy5cbiAqIEBwYXJhbSB7alF1ZXJ5fSBbb3B0aW9ucy51cGxvYWRlci5icm93c2VyXVxuICogQHBhcmFtIHtqUXVlcnl9IFtvcHRpb25zLnVwbG9hZGVyLmRyb3B6b25lXSBqUXVlcnkgY29sbGVjdGlvbiBvZiB0aGUgZHJvcHpvbmUuXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMudXBsb2FkZXIucGFyYW1zXVxuICovXG52YXIgJCA9IGpRdWVyeSxcblx0VXBsb2FkZXJXaW5kb3c7XG5cblVwbG9hZGVyV2luZG93ID0gd3AubWVkaWEuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiAgICdkaXYnLFxuXHRjbGFzc05hbWU6ICd1cGxvYWRlci13aW5kb3cnLFxuXHR0ZW1wbGF0ZTogIHdwLnRlbXBsYXRlKCd1cGxvYWRlci13aW5kb3cnKSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdXBsb2FkZXI7XG5cblx0XHR0aGlzLiRicm93c2VyID0gJCgnPGEgaHJlZj1cIiNcIiBjbGFzcz1cImJyb3dzZXJcIiAvPicpLmhpZGUoKS5hcHBlbmRUbygnYm9keScpO1xuXG5cdFx0dXBsb2FkZXIgPSB0aGlzLm9wdGlvbnMudXBsb2FkZXIgPSBfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMudXBsb2FkZXIgfHwge30sIHtcblx0XHRcdGRyb3B6b25lOiAgdGhpcy4kZWwsXG5cdFx0XHRicm93c2VyOiAgIHRoaXMuJGJyb3dzZXIsXG5cdFx0XHRwYXJhbXM6ICAgIHt9XG5cdFx0fSk7XG5cblx0XHQvLyBFbnN1cmUgdGhlIGRyb3B6b25lIGlzIGEgalF1ZXJ5IGNvbGxlY3Rpb24uXG5cdFx0aWYgKCB1cGxvYWRlci5kcm9wem9uZSAmJiAhICh1cGxvYWRlci5kcm9wem9uZSBpbnN0YW5jZW9mICQpICkge1xuXHRcdFx0dXBsb2FkZXIuZHJvcHpvbmUgPSAkKCB1cGxvYWRlci5kcm9wem9uZSApO1xuXHRcdH1cblxuXHRcdHRoaXMuY29udHJvbGxlci5vbiggJ2FjdGl2YXRlJywgdGhpcy5yZWZyZXNoLCB0aGlzICk7XG5cblx0XHR0aGlzLmNvbnRyb2xsZXIub24oICdkZXRhY2gnLCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuJGJyb3dzZXIucmVtb3ZlKCk7XG5cdFx0fSwgdGhpcyApO1xuXHR9LFxuXG5cdHJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggdGhpcy51cGxvYWRlciApIHtcblx0XHRcdHRoaXMudXBsb2FkZXIucmVmcmVzaCgpO1xuXHRcdH1cblx0fSxcblxuXHRyZWFkeTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHBvc3RJZCA9IHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MucG9zdC5pZCxcblx0XHRcdGRyb3B6b25lO1xuXG5cdFx0Ly8gSWYgdGhlIHVwbG9hZGVyIGFscmVhZHkgZXhpc3RzLCBiYWlsLlxuXHRcdGlmICggdGhpcy51cGxvYWRlciApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIHBvc3RJZCApIHtcblx0XHRcdHRoaXMub3B0aW9ucy51cGxvYWRlci5wYXJhbXMucG9zdF9pZCA9IHBvc3RJZDtcblx0XHR9XG5cdFx0dGhpcy51cGxvYWRlciA9IG5ldyB3cC5VcGxvYWRlciggdGhpcy5vcHRpb25zLnVwbG9hZGVyICk7XG5cblx0XHRkcm9wem9uZSA9IHRoaXMudXBsb2FkZXIuZHJvcHpvbmU7XG5cdFx0ZHJvcHpvbmUub24oICdkcm9wem9uZTplbnRlcicsIF8uYmluZCggdGhpcy5zaG93LCB0aGlzICkgKTtcblx0XHRkcm9wem9uZS5vbiggJ2Ryb3B6b25lOmxlYXZlJywgXy5iaW5kKCB0aGlzLmhpZGUsIHRoaXMgKSApO1xuXG5cdFx0JCggdGhpcy51cGxvYWRlciApLm9uKCAndXBsb2FkZXI6cmVhZHknLCBfLmJpbmQoIHRoaXMuX3JlYWR5LCB0aGlzICkgKTtcblx0fSxcblxuXHRfcmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuY29udHJvbGxlci50cmlnZ2VyKCAndXBsb2FkZXI6cmVhZHknICk7XG5cdH0sXG5cblx0c2hvdzogZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRlbCA9IHRoaXMuJGVsLnNob3coKTtcblxuXHRcdC8vIEVuc3VyZSB0aGF0IHRoZSBhbmltYXRpb24gaXMgdHJpZ2dlcmVkIGJ5IHdhaXRpbmcgdW50aWxcblx0XHQvLyB0aGUgdHJhbnNwYXJlbnQgZWxlbWVudCBpcyBwYWludGVkIGludG8gdGhlIERPTS5cblx0XHRfLmRlZmVyKCBmdW5jdGlvbigpIHtcblx0XHRcdCRlbC5jc3MoeyBvcGFjaXR5OiAxIH0pO1xuXHRcdH0pO1xuXHR9LFxuXG5cdGhpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciAkZWwgPSB0aGlzLiRlbC5jc3MoeyBvcGFjaXR5OiAwIH0pO1xuXG5cdFx0d3AubWVkaWEudHJhbnNpdGlvbiggJGVsICkuZG9uZSggZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBUcmFuc2l0aW9uIGVuZCBldmVudHMgYXJlIHN1YmplY3QgdG8gcmFjZSBjb25kaXRpb25zLlxuXHRcdFx0Ly8gTWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIHNldCBhcyBpbnRlbmRlZC5cblx0XHRcdGlmICggJzAnID09PSAkZWwuY3NzKCdvcGFjaXR5JykgKSB7XG5cdFx0XHRcdCRlbC5oaWRlKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBodHRwczovL2NvcmUudHJhYy53b3JkcHJlc3Mub3JnL3RpY2tldC8yNzM0MVxuXHRcdF8uZGVsYXkoIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCAnMCcgPT09ICRlbC5jc3MoJ29wYWNpdHknKSAmJiAkZWwuaXMoJzp2aXNpYmxlJykgKSB7XG5cdFx0XHRcdCRlbC5oaWRlKCk7XG5cdFx0XHR9XG5cdFx0fSwgNTAwICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVwbG9hZGVyV2luZG93O1xuIiwiLypnbG9iYWxzIHdwICovXG5cbi8qKlxuICogd3AubWVkaWEuVmlld1xuICpcbiAqIFRoZSBiYXNlIHZpZXcgY2xhc3MgZm9yIG1lZGlhLlxuICpcbiAqIFVuZGVsZWdhdGluZyBldmVudHMsIHJlbW92aW5nIGV2ZW50cyBmcm9tIHRoZSBtb2RlbCwgYW5kXG4gKiByZW1vdmluZyBldmVudHMgZnJvbSB0aGUgY29udHJvbGxlciBtaXJyb3IgdGhlIGNvZGUgZm9yXG4gKiBgQmFja2JvbmUuVmlldy5kaXNwb3NlYCBpbiBCYWNrYm9uZSAwLjkuOCBkZXZlbG9wbWVudC5cbiAqXG4gKiBUaGlzIGJlaGF2aW9yIGhhcyBzaW5jZSBiZWVuIHJlbW92ZWQsIGFuZCBzaG91bGQgbm90IGJlIHVzZWRcbiAqIG91dHNpZGUgb2YgdGhlIG1lZGlhIG1hbmFnZXIuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFZpZXcgPSB3cC5CYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdGNvbnN0cnVjdG9yOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHRpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5jb250cm9sbGVyICkge1xuXHRcdFx0dGhpcy5jb250cm9sbGVyID0gb3B0aW9ucy5jb250cm9sbGVyO1xuXHRcdH1cblx0XHR3cC5CYWNrYm9uZS5WaWV3LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblx0LyoqXG5cdCAqIEB0b2RvIFRoZSBpbnRlcm5hbCBjb21tZW50IG1lbnRpb25zIHRoaXMgbWlnaHQgaGF2ZSBiZWVuIGEgc3RvcC1nYXBcblx0ICogICAgICAgYmVmb3JlIEJhY2tib25lIDAuOS44IGNhbWUgb3V0LiBGaWd1cmUgb3V0IGlmIEJhY2tib25lIGNvcmUgdGFrZXNcblx0ICogICAgICAgY2FyZSBvZiB0aGlzIGluIEJhY2tib25lLlZpZXcgbm93LlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEuVmlld30gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdGRpc3Bvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIFVuZGVsZWdhdGluZyBldmVudHMsIHJlbW92aW5nIGV2ZW50cyBmcm9tIHRoZSBtb2RlbCwgYW5kXG5cdFx0Ly8gcmVtb3ZpbmcgZXZlbnRzIGZyb20gdGhlIGNvbnRyb2xsZXIgbWlycm9yIHRoZSBjb2RlIGZvclxuXHRcdC8vIGBCYWNrYm9uZS5WaWV3LmRpc3Bvc2VgIGluIEJhY2tib25lIDAuOS44IGRldmVsb3BtZW50LlxuXHRcdHRoaXMudW5kZWxlZ2F0ZUV2ZW50cygpO1xuXG5cdFx0aWYgKCB0aGlzLm1vZGVsICYmIHRoaXMubW9kZWwub2ZmICkge1xuXHRcdFx0dGhpcy5tb2RlbC5vZmYoIG51bGwsIG51bGwsIHRoaXMgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuY29sbGVjdGlvbiAmJiB0aGlzLmNvbGxlY3Rpb24ub2ZmICkge1xuXHRcdFx0dGhpcy5jb2xsZWN0aW9uLm9mZiggbnVsbCwgbnVsbCwgdGhpcyApO1xuXHRcdH1cblxuXHRcdC8vIFVuYmluZCBjb250cm9sbGVyIGV2ZW50cy5cblx0XHRpZiAoIHRoaXMuY29udHJvbGxlciAmJiB0aGlzLmNvbnRyb2xsZXIub2ZmICkge1xuXHRcdFx0dGhpcy5jb250cm9sbGVyLm9mZiggbnVsbCwgbnVsbCwgdGhpcyApO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLlZpZXd9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRyZW1vdmU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZGlzcG9zZSgpO1xuXHRcdC8qKlxuXHRcdCAqIGNhbGwgJ3JlbW92ZScgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzc1xuXHRcdCAqL1xuXHRcdHJldHVybiB3cC5CYWNrYm9uZS5WaWV3LnByb3RvdHlwZS5yZW1vdmUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3O1xuIl19
