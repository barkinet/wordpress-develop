
window._wpCustomizeNavMenusSettings = {
	'nonce': 'yo',
	'phpIntMax': '2147483647',
	'menuItemTransport': 'postMessage',
	'allMenus': [{
		'term_id': '2',
		'name': 'Awesome menu',
		'slug': 'awesome-menu',
		'term_group': '0',
		'term_taxonomy_id': '2',
		'taxonomy': 'nav_menu',
		'description': '',
		'parent': '0',
		'count': '0'
	}, {
		'term_id': '3',
		'name': 'Cool Menu',
		'slug': 'cool-menu',
		'term_group': '0',
		'term_taxonomy_id': '3',
		'taxonomy': 'nav_menu',
		'description': '',
		'parent': '0',
		'count': '0'
	}],
	'defaultSettingValues': {
		'nav_menu': {
			'name': '',
			'description': '',
			'parent': 0,
			'auto_add': false
		},
		'nav_menu_item': {
			'object_id': 0,
			'object': '',
			'menu_item_parent': 0,
			'position': 0,
			'type': 'custom',
			'title': '',
			'url': '',
			'target': '',
			'attr_title': '',
			'description': '',
			'classes': '',
			'xfn': '',
			'status': 'publish',
			'original_title': '',
			'nav_menu_term_id': 0
		}
	},
	'itemTypes': {
		'postTypes': {
			'page': {
				'label': 'Page'
			},
			'post': {
				'label': 'Post'
			}
		},
		'taxonomies': {
			'post_tag': {
				'label': 'Tag'
			},
			'post_format': {
				'label': 'Format'
			},
			'category': {
				'label': 'Category'
			}
		}
	},
	'l10n': {
		'custom_label': 'Custom Link',
		'customizingMenus': 'Customizing &#9656; Menus',
		'invalidTitleTpl': '%s (Invalid)',
		'itemAdded': 'Menu item added',
		'itemDeleted': 'Menu item deleted',
		'itemsFound': 'Number of items found: %d',
		'itemsFoundMore': 'Additional items found: %d',
		'itemsLoadingMore': 'Loading more results... please wait.',
		'menuAdded': 'Menu created',
		'menuDeleted': 'Menu deleted',
		'menuLocation': '(Currently set to: %s)',
		'menuNameLabel': 'Menu Name',
		'movedDown': 'Menu item moved down',
		'movedLeft': 'Menu item moved out of submenu',
		'movedRight': 'Menu item is now a sub-item',
		'movedUp': 'Menu item moved up',
		'pendingTitleTpl': '%s (Pending)',
		'postTypeLabel': 'Post Type',
		'reorderLabelOff': 'Close reorder mode',
		'reorderLabelOn': 'Reorder menu items',
		'reorderModeOff': 'Reorder mode closed',
		'reorderModeOn': 'Reorder mode enabled',
		'taxonomyTermLabel': 'Taxonomy',
		'unnamed': '(unnamed)',
		'untitled': '(no label)'
	}
};
window._wpCustomizeSettings.panels.nav_menus = {
	'id': 'nav_menus',
	'description': '<p>This panel is used for managing navigation menus for content you have already published on your site. You can create menus and add items for existing content such as pages, posts, categories, tags, formats, or custom links.</p><p>Menus can be displayed in locations defined by your theme or in <a href="javascript:wp.customize.panel( "widgets" ).focus();">widget areas</a> by adding a &#8220;Custom Menu&#8221; widget.</p>',
	'priority': 100,
	'type': 'nav_menus',
	'title': 'Menus',
	'content': '',
	'active': true,
	'instanceNumber': 2
};

window._wpCustomizeSettings.sections = {
  'menu_locations': {
    'id': 'menu_locations',
    'description': '<p>Your theme contains 1 menu location. Select which menu you would like to use.<\/p><p>You can also place menus in widget areas with the Custom Menu widget.<\/p>',
    'priority': 5,
    'panel': 'nav_menus',
    'type': 'default',
    'title': 'Menu Locations',
    'content': '',
    'active': true,
    'instanceNumber': 13,
    'customizeAction': 'Customizing &#9656; Menus'
  },
  'nav_menu[3]': {
    'id': 'nav_menu[3]',
    'description': '',
    'priority': 10,
    'panel': 'nav_menus',
    'type': 'nav_menu',
    'title': 'Cool Menu',
    'content': '',
    'active': true,
    'instanceNumber': 15,
    'customizeAction': 'Customizing &#9656; Menus',
    'menu_id': 3
  },
  'nav_menu[2]': {
    'id': 'nav_menu[2]',
    'description': '',
    'priority': 10,
    'panel': 'nav_menus',
    'type': 'nav_menu',
    'title': 'Awesome menu',
    'content': '',
    'active': true,
    'instanceNumber': 14,
    'customizeAction': 'Customizing &#9656; Menus',
    'menu_id': 2
  },
  'add_menu': {
    'id': 'add_menu',
    'description': '',
    'priority': 999,
    'panel': 'nav_menus',
    'type': 'new_menu',
    'title': 'Add a Menu',
    'content': '<li id="accordion-section-add_menu" class="accordion-section-new-menu">\n\t\t\t<button type="button" class="button-secondary add-new-menu-item add-menu-toggle" aria-expanded="false">\n\t\t\t\tAdd a Menu\t\t\t<\/button>\n\t\t\t<ul class="new-menu-section-content"><\/ul>\n\t\t<\/li>',
    'active': true,
    'instanceNumber': 16,
    'customizeAction': 'Customizing &#9656; Menus'
  }
};

window.wpNavMenu = {
	'options': {
		'menuItemDepthPerLevel': 30,
		'globalMaxDepth': 11,
		'sortableItems': '> *',
		'targetTolerance': 0
	},
	'menusChanged': false,
	'isRTL': false,
	'negateIfRTL': 1
};

