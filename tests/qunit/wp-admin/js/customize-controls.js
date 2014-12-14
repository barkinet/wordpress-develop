/* global wp */

jQuery( function( $ ) {
	'use strict';

	var controlId, controlLabel, controlType, controlContent, controlDescription, controlData, mockControl,
		mockControlInstance, controlExpectedValues, sectionId, sectionContent, sectionData, mockSection,
		sectionInstance, sectionExpectedValues, panelId, panelTitle, panelDescription, panelContent, panelData,
		mockPanel, panelExpectedValues, testCustomizerModel, customizerRootElement, settingId, settingValue, mockSetting;

	customizerRootElement = $( '<div id="customize-theme-controls"><ul></ul></div>' );
	customizerRootElement.css( { position: 'absolute', top: -1000 } ); // remove from view
	$( document.body ).append( customizerRootElement );

	testCustomizerModel = function( model, expectedValues ) {
		if ( ! expectedValues.type || ! wp.customize[ expectedValues.type ] ) {
			throw new Error( 'Must pass value type in expectedValues.' );
		}
		var type = expectedValues.type;
		test( 'Model extends proper type', function () {
			ok( model.extended( wp.customize[ type ] ) );
		} );

		if ( expectedValues.hasOwnProperty( 'id' ) ) {
			test( type + ' instance has the right id', function () {
				equal( model.id, expectedValues.id );
			});
		}
		if ( expectedValues.hasOwnProperty( 'title') ) {
			test( type + ' instance has the right title.', function () {
				equal( model.params.title, expectedValues.title );
			});
		}
		if ( expectedValues.hasOwnProperty( 'description' ) ) {
			test( type + ' instance has the right description.', function () {
				equal( model.params.description, expectedValues.description );
			});
		}
		if ( expectedValues.hasOwnProperty( 'content' ) ) {
			test( type + ' instance has the right content.', function () {
				equal( model.params.content, expectedValues.content );
			});
		}
		if ( expectedValues.hasOwnProperty( 'priority' ) ) {
			test( type + ' instance has the right priority.', function () {
				equal( model.priority(), expectedValues.priority );
			});
		}
		if ( type === 'Panel' || type === 'Section' ) {
			test( type + ' instance is not expanded', function () {
				equal( model.expanded(), false );
			});

			test( type + ' instance is expanded after calling .expanded()', function () {
				model.expand();
				ok( model.expanded() );
			});

			test( type + ' instance is collapsed after calling .collapse()', function () {
				model.collapse();
				equal( model.expanded(), false );
			});
		}

	};

	module( 'Customizer Setting Model' );
	settingId = 'new_blogname';
	settingValue = 'Hello World';

	test( 'Create a new setting', function () {
		mockSetting = wp.customize.create(
			settingId,
			settingId,
			settingValue,
			{
				transport: 'refresh',
				previewer: wp.customize.previewer
			}
		);
		equal( mockSetting(), settingValue );
		equal( mockSetting.id, settingId );
	} );

	module( 'Customizer Section Model' );

	sectionId = 'mock_title_tagline';
	sectionContent = '<li id="accordion-section-title_tagline" class="control-section accordion-section"></li>';
	sectionData = {
		content: sectionContent
	};

	mockSection = new wp.customize.Section( sectionId, { params: sectionData } );

	sectionExpectedValues = {
		type: 'Section',
		id: sectionId,
		content: sectionContent,
		priority: 100
	};

	testCustomizerModel( mockSection, sectionExpectedValues );

	test( 'Section has been embedded', function () {
		equal( mockSection.deferred.embedded.state(), 'resolved' );
	} );

	wp.customize.section.add( sectionId, mockSection );

	test( 'Section instance added to the wp.customize.section object', function () {
		ok( wp.customize.section.has( sectionId ) );
	});

	sectionInstance = wp.customize.section( sectionId );

	test( 'Section instance has right content when accessed from wp.customize.section()', function () {
		equal( sectionInstance.params.content, sectionContent );
	});

	test( 'Section instance has no children yet', function () {
		equal( sectionInstance.controls().length, 0 );
	});

	module( 'Customizer Control Model' );

	controlId = 'new_blogname';
	controlLabel = 'Site Title';
	controlType = 'text';
	controlContent = '<li id="customize-control-blogname" class="customize-control customize-control-text"></li>';
	controlDescription = 'Test control description';

	controlData = {
		content: controlContent,
		description: controlDescription,
		label: controlLabel,
		settings: { 'default': 'new_blogname' },
		type: controlType
	};

	mockControl = new wp.customize.Control( controlId, {
		params: controlData,
		previewer: wp.customize.previewer
	});

	controlExpectedValues = {
		type: 'Control',
		content: controlContent,
		description: controlDescription,
		label: controlLabel,
		id: controlId,
		priority: 10
	};

	testCustomizerModel( mockControl, controlExpectedValues );

	test( 'Control instance does not yet belong to a section.', function () {
		equal( mockControl.section(), undefined );
	});
	test( 'Control has not been embedded yet', function () {
		equal( mockControl.deferred.embedded.state(), 'pending' );
	} );

	test( 'Control instance has the right selector.', function () {
		equal( mockControl.selector, '#customize-control-new_blogname' );
	});

	wp.customize.control.add( controlId, mockControl );

	test( 'Control instance was added to the control class.', function () {
		ok( wp.customize.control.has( controlId ) );
	});

	mockControlInstance = wp.customize.control( controlId );

	test( 'Control instance has the right id when accessed from api.control().', function () {
		equal( mockControlInstance.id, controlId );
	});

	test( 'Control section can be set as expected', function () {
		mockControl.section( mockSection.id );
		equal( mockControl.section(), mockSection.id );
	});
	test( 'Associating a control with a section allows it to be embedded', function () {
		equal( mockControl.deferred.embedded.state(), 'resolved' );
	});

	module( 'Customizer Panel Model' );

	panelId = 'mockPanelId';
	panelTitle = 'Mock Panel Title';
	panelDescription = 'Mock panel description';
	panelContent = '<li id="accordion-panel-widgets" class="control-section control-panel accordion-section">';
	panelData = {
		content: panelContent,
		title: panelTitle,
		description: panelDescription
	};

	mockPanel = new wp.customize.Panel( panelId, { params: panelData } );

	panelExpectedValues = {
		type: 'Panel',
		id: panelId,
		title: panelTitle,
		description: panelDescription,
		content: panelContent,
		priority: 100
	};

	testCustomizerModel( mockPanel, panelExpectedValues );

	test( 'Panel instance is not contextuallyActive', function () {
		equal( mockPanel.isContextuallyActive(), false );
	});
});
