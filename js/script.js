/**** 
 * jQuery ExpoUI plugin
 * Author: Gabrijel Gavranović // Gavro
 *
 * Depencencies:
 * - jQuery UI // need to specify function for custom UI usage
 * - jQuery hashchange event (http://benalman.com/projects/jquery-hashchange-plugin)
 *
 * Copyright (c) 2012 Gabrijel Gavranović / Gavro
 * Dual licensed under the MIT and GPL licenses.
 *
 ****/

/* global vars */
var screenWidthDiscrete,screenHeightDiscrete,screenWidth,panelWidthDiscrete,panelCount,panelWidth,initStatus;

/* call to functions on document ready */
jQuery(document).ready(function($){
	initScreen();
	
	$(window).load(function(){
		$('#launcher .screen').css({display:'block', opacity: 0}).delay(250).animate({opacity: 1}, 500, function(){
			panelWidthDiscrete = $('#launcher .screen .panel:eq(0)').outerWidth(); //hidden @ pageload, must check true width after fadeIn, not @ 1st initScreen!
			$(window).hashchange();
		});
	});
	
	/* init navigation */
	initFooterNavigation();
	initExpoUINavigation();
	
	$(window).on('resize', function(){
		initScreen();
	});
	
	/* init hash-bang functionality */
	$(window).hashchange( function(){ switchScreenOnHash(); } );
	
	/* init left-right key navigation */
	$(document).on("keydown", function(e){keyNavigation(e)});
	
	$('#preloader').fadeOut(1000);
});




/* ExpoUI functions; need to mold to jQuery Plugins .... ! */
function initScreen(){
	screenWidthDiscrete = $(document).width();
	screenHeightDiscrete = $(document).height();
	if(!initStatus) {
		panelCount = $('#launcher .screen .panel').length;
		screenWidth = panelCount*100;
		panelWidth = 1/panelCount*100;
		$('head').append('<style id="screen-init">#launcher .screen{width:'+screenWidth+'%;}#launcher .screen .panel{width:'+panelWidth+'%;}</style>');
		initStatus = true;
	} else {
		panelWidthDiscrete = $('#launcher .screen .panel:eq(0)').outerWidth(); //hidden @ pageload, must check true width after fadeIn, not @ 1st initScreen!
	}
}


function initPanel(curClass, prevIndex){
	$('#top-nav span').off('click');
	$('#top-nav').html('');
	
	var panel = $('#launcher .panel.'+curClass);
	var panelIndex = panel.index();
	var innerPanel = panel.find('.inner.active');
	var innerPanelIndex = innerPanel.index()-1;

	if(panel.find(".topmenucopy").length > 0) {
		panel.find(".topmenucopy").children().clone().appendTo('#top-nav').hide(0).fadeIn(500);
		var posSpan     = $('#top-nav span:eq('+innerPanelIndex+')').addClass('active').position()['left'];
		var newWidthNav = $('#top-nav span:eq('+innerPanelIndex+')').outerWidth();
		var newPosNav   = screenWidthDiscrete/2-posSpan;
		$('#top-nav .nav-status').css({marginLeft:-newPosNav, width:newWidthNav}).fadeIn(500);
	}
}


function keyNavigation(e) {
	if($('#launcherscreen.expo-ui').length > 0 && e.keyCode == 27) {
		$('#launcherscreen .panel.active').trigger('click');
	} else if($("#launcherscreen.expo-ui").length == 0) {
		var curMenuItem = $('#screen-nav span.active');
		switch(e.keyCode){
			case 37:
				if(curMenuItem.prev().length > 0 && curMenuItem.prev().attr('id') != 'zoom-btn')
					curMenuItem.prev().trigger('click');
				break;
			case 39:
				if(curMenuItem.next().length > 0)
					curMenuItem.next().trigger('click');
				break;
		}
	}
}


function initFooterNavigation(){
	/* timeout needed, positioning without it goes wrong @ webkit */
	setTimeout(function(){
		var posSpan     = $('#screen-nav span:eq(0)').position()['left'];
		var newWidthNav = $('#screen-nav span:eq(0)').outerWidth();
		var newPosNav   = screenWidthDiscrete/2-posSpan;
		$('#screen-nav .nav-status').css({marginLeft:-newPosNav, width:newWidthNav}).fadeIn(500);
	},250);
		
	$('#screen-nav').on('click', 'span', function(){
		var curClasses = $(this).attr('class');
		var curClass = curClasses.split(' ')[0];
		var siblingIndex = $(this).index()-1; // index-1: there's the ExpoUI-button to deduct.
		if(curClasses.indexOf('active') == -1){
			$('body, #screen-nav, #top-nav, #launcher .screen, #screen-nav .nav-status, #portfolio-imageholder .visual').stop(true);
			$('#portfolio-imageholder').html('');
			
			if( $(this).index() > $('#screen-nav span.active').index() )
				var animDir = '-50%';
			else
				var animDir = '150%';
				
			window.location = location.protocol + '//' + location.hostname + location.pathname + '#!/' + curClass;
			var prevIndex = $('#screen-nav span.active').index()-1;
			$('#screen-nav span').removeClass('active');
			$(this).addClass('active');
			
			
			$('#launcher').animate({scrollTop: 0}, { 
				duration: 750, 
				queue: false/*, //queue false, fix for Chrome e.a. -->  uses scrollTop@body, so don't wait for this one to finish...
			});
			
			var newPos      = panelWidthDiscrete/screenWidthDiscrete*100*siblingIndex;
			var newWidthNav = $('#screen-nav span.active').outerWidth();
			var newPosNav   = screenWidthDiscrete/2-$(this).position()['left'];
						
			$('#portfolio-imageholder .visual:eq(0)').animate({left:animDir}, 750, 'easeInOutCubic', function(){ $('#portfolio-imageholder').html('') });
			$('body, #screen-nav, #top-nav').animate({backgroundPosition:-(newPos/5)+"%"}, {duration: 850, queue: false, easing: 'easeInOutCubic'});
			$('#launcher .screen').animate({left:-newPos+"%"}, 750, 'easeInOutCubic');
			$('#screen-nav .nav-status').animate({marginLeft:-newPosNav, width:newWidthNav}, 750, 'easeInOutCubic');
			$('#top-nav .nav-status, #top-nav span').fadeOut(750);
			
			function cleanUp(siblingIndex){ $('#launcher .screen .panel').removeClass('active').filter(':eq('+siblingIndex+')').addClass('active') };
			setTimeout(function(){ cleanUp(siblingIndex) }, 750);
			
			initPanel(curClass, prevIndex);
		}
	});
}



function initExpoUINavigation(){
	$('#launcher').on('click', '.screen.expo-ui .panel',function(){
		$('body, #screen-nav, #top-nav, #launcher .screen, #screen-nav .nav-status, #portfolio-imageholder .visual').stop(true);
		$('#portfolio-imageholder').html('');
		
		var prevIndex = $('#screen-nav span.active').index()-1;
		$('#screen-nav span, #launcher .screen .panel').removeClass('active');
		$(this).addClass('active');
		
		var curClasses = $(this).attr('class');
		var curClass = curClasses.split(' ')[1]; // [1] or pop().. same thing
		
		window.location = location.protocol + '//' + location.hostname + location.pathname + '#!/' + curClass;
		$('#screen-nav span').removeClass('active');
		$('#screen-nav span.'+curClass).addClass('active');
		$('#screen-nav, #top-nav').fadeIn(750);
		$('#launcherscreen').removeClass('expo-ui screens-'+$('#launcher .panel').length, 0);
		
		var siblingIndex = $(this).index();
		var newPos      = panelWidthDiscrete/screenWidthDiscrete*100*siblingIndex;
		var newWidthNav = $('#screen-nav span.active').outerWidth();
		var newPosNav   = screenWidthDiscrete/2-$('#screen-nav span.'+curClass).position()['left'];
		
		$('body, #screen-nav, #top-nav').animate({backgroundPosition:-(newPos/5)+"%"}, {
			duration: 850, 
			queue: false, 
			easing: 'easeInOutCubic'
		});
		$('#launcher .screen').animate({left:-newPos+'%'}, 750, 'easeInOutCubic');
		$('#screen-nav .nav-status').animate({marginLeft:-newPosNav, width:newWidthNav}, 750, 'easeInOutCubic');
		
		initPanel(curClass, prevIndex);
	});
	
	$('#screen-nav #zoom-btn').on('click', function(){
		$('body, #screen-nav, #top-nav, #launcher .screen, #screen-nav .nav-status, #portfolio-imageholder .visual').stop(true);
		$('#portfolio-imageholder').html('');
		
		var newPos = 0;
		
		$('#launcher').animate({scrollTop: 0}, {duration: 750, queue: false});
		$('#screen-nav, #top-nav').fadeOut(500);
		$('#portfolio-imageholder .visual:eq(0)').fadeOut(500/*, function(){ $(this).remove() }*/);
		$('#launcherscreen').addClass('expo-ui screens-'+panelCount, 0);
		$('body, #screen-nav, #top-nav').animate({backgroundPosition:-(newPos/5)+"%"}, {duration: 400, queue: false, easing: 'easeInOutCubic'});
		$('#launcher .screen').animate({left:-newPos+"%"}, 350, 'easeInOutCubic');
		
		function cleanUp(){ $('#portfolio-imageholder .visual:eq(0)').remove() };
		setTimeout(function(){ cleanUp() }, 500);
	});
}



function switchScreenOnHash(){
	var newLoc = location.href.replace( /^[^#]*#!\/?(.*)$/, '$1' );
        
	if( $('#screen-nav span.'+newLoc).length > 0 )
		$('#screen-nav span.'+newLoc).trigger('click');
}



