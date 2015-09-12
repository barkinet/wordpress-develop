/**
 * wp.media.controller.Insert
 *
 * A state for selecting a featured image for a post.
 *
 * @class
 * @augments wp.media.controller.Library
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 */
var l10n = wp.media.view.l10n,
	Library = wp.media.controller.Library,
	$ = Backbone.$,
	Insert;

Insert = Library.extend({
	defaults: _.defaults({
		id:         'insert',
		title:      l10n.insertMediaTitle,
		priority:   20,
		toolbar:    'main-insert',
		filterable: 'all',
		menu:       'default',
		multiple:   false,
		editable:   true,

		// If the user isn't allowed to edit fields,
		// can they still edit it locally?
		allowLocalEdits: true,

		// Show the attachment display settings.
		displaySettings: true,
		// Update user settings when users adjust the
		// attachment display settings.
		displayUserSettings: true
	}, Library.prototype.defaults ),

	initialize: function( options ) {
		var library;

		if ( ! this.get('library') ) {
			this.set( 'library', wp.media.query( options.library ) );
		}

		Library.prototype.initialize.apply( this, arguments );
	}
});

module.exports = Insert;
