/* global wp */

jQuery( function( $ ) {

	var control_id, control_label, control_type, control_content, control_data, mock_control, mock_control_instance;
    
	module( 'Customizer Control Model' );

	control_id = 'new_blogname';
	control_label = 'Site Title';
	control_type = 'text';
	control_content = '<li id="customize-control-blogname" class="customize-control customize-control-text"></li>';
	control_data =  {
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
});
