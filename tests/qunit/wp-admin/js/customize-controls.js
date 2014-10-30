/* global wp */

jQuery( function( $ ) {

	var control_id, control_label, control_type, control_content, control_data, mock_control, mock_control_instance,
	    section_id, section_content, section_data, mock_section, section_instance;

	module( 'Customizer Control Model' );

	control_id = 'new_blogname';
	control_label = 'Site Title';
	control_type = 'text';
	control_content = '<li id="customize-control-blogname" class="customize-control customize-control-text"></li>';
	control_data =	{
		content : control_content,
		description : "",
		label : control_label,
		settings : { default : 'blogname' },
		type : control_type
	};

	mock_control = new wp.customize.Control( control_id ,
						 { params : control_data,
						   previewer : wp.customize.previewer
						 }
	);

	test( 'Blogname control has the right id.', function () {
		equal( mock_control.id , control_id );
	});

	test( 'Blogname control has a priority of 10, the default if none is passed in the constructor.', function () {
		equal( mock_control.priority() , 10 );
	});

	test( 'Blogname control has the right content.', function () {
		equal( mock_control.params.content , control_content );
	});

	test( 'Blogname control is not active.', function () {
		equal( mock_control.active() , undefined );
	});

	test( 'Blogname control does not yet belong to a section.', function () {
		equal( mock_control.section() , undefined );
	});

	test( 'Blogname control has the right selector.', function () {
		equal( mock_control.selector , '#customize-control-new_blogname' );
	});

	wp.customize.control.add( control_id , mock_control );

	test( 'The blogname control instance was added to the control class.', function () {
		ok( wp.customize.control.has( control_id ) );
	});

	mock_control_instance = wp.customize.control( control_id );

	test( 'Blogname control instance has the right id when accessed from api.control().', function () {
		equal( mock_control_instance.id , control_id );
	});


	module( 'Customizer Section Model' );

	section_id = 'mock_title_tagline';
	section_content = '<li id="accordion-section-title_tagline" class="control-section accordion-section"></li>';
	section_data = {
		content : section_content
	};

	mock_section = new wp.customize.Section( section_id , { params : section_data }	);

	test( 'Section instance has the right id.', function () {
		equal( mock_section.id , section_id );
	});
	test( 'Section instance has a priority of 100, the default if none is passed in the constructor.', function () {
		equal( mock_section.priority() , 100 );
	});

	test( 'Section instance has the right content.', function () {
		equal( mock_section.params.content , section_content );
	});

	test( 'Section instance is not expanded', function () {
		equal( mock_section.expanded() , false );
	});

	test( 'Section instance is expanded after calling .focus()', function () {
		mock_section.focus();
		ok( mock_section.expanded() );
	});

	test( 'Section instance is collapsed after calling .collapse()', function () {
		mock_section.collapse();
		equal( mock_section.expanded() , false );
	});

	wp.customize.section.add( section_id , mock_section );

	test( 'Section instance added to the wp.customize.section object', function () {
		ok( wp.customize.section.has( section_id ) );
	});

	section_instance = wp.customize.section( section_id );

	test( 'Section instance has right content when accessed from wp.customize.section()', function () {
		equal( section_instance.params.content , section_content );
	});

});
