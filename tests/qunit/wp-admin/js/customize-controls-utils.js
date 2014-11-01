/* global wp */

jQuery( function( $ ) {
	var trueMockEvent, falseMockEvent, mockElementLists, $firstMockElement, $secondMockElement, $thirdMockElement;

	module( 'Customizer Model Utility functions' );

	trueMockEvent = {
		type : 'keydown',
		which : 14
	};

	falseMockEvent = {
		type : 'keydown',
		which : 13
	};

	test( 'isKeydownButNotEnterEvent returns true' , function () {
		ok( wp.customize.utils.isKeydownButNotEnterEvent( trueMockEvent ) );
	});

	test( 'isKeydownButNotEnterEvent returns false' , function () {
		equal( wp.customize.utils.isKeydownButNotEnterEvent( falseMockEvent ) , false );
	});

	$firstMockElement = $( '<div id="foo"></div>' );
	$secondMockElement = $( '<li id="bar"></li>' );
	$thirdMockElement = $( '<div id="thirdElement"></div>' );

	mockElementLists = {
		first : [ $firstMockElement , $secondMockElement ],
		second : [ $secondMockElement ],
		firstInReverseOrder : [ $secondMockElement , $firstMockElement ],
		third : [ $firstMockElement, $secondMockElement ],
		thirdButLonger : [ $firstMockElement, $secondMockElement, $thirdMockElement ]
	};

	test( 'areElementListsEqual returns true' , function () {
		ok( wp.customize.utils.areElementListsEqual( mockElementLists.first , mockElementLists.first ) );
	});

	test( 'areElementListsEqual returns false' , function () {
		equal( wp.customize.utils.areElementListsEqual( mockElementLists.first , mockElementLists.second ) , false );
	});

	test( 'areElementListsEqual: lists have same values, but in reverse order' , function () {
		equal( wp.customize.utils.areElementListsEqual( mockElementLists.first , mockElementLists.firstInReverseOrder ) , false );
	});

	test( 'areElementListsEqual: lists have same values, but one is longer' , function () {
		equal( wp.customize.utils.areElementListsEqual( mockElementLists.third , mockElementLists.thirdButLonger ) , false );
	});

});
