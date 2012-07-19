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
 
 ;(function($) {
	$.expoUI = function(el, options) {

		var pluginName = 'expoUI',
			document = window.document,
			defaults = { },
			plugin = this;
		
		plugin.settings = { };

		var screenWidthDiscrete,screenHeightDiscrete,screenWidth,
			panelWidthDiscrete,panelCount,panelWidth,initStatus;
		    
		var init = function() {
			plugin.settings = $.extend({}, defaults, options);
			plugin.el = el;
			
			
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
			
			/* fix positions and resize logic (sizes) on window resize */
			$(window).on('resize', function(){
				initScreen();
			});
			
			/* init hash-bang functionality */
			$(window).hashchange( function(){ switchScreenOnHash(); } );
			
			/* init left-right key navigation */
			$(document).on("keydown", function(e){keyNavigation(e)});
			
			/* Todo: relocate to init function callback */
			$('#preloader').fadeOut(1000);
			
		}
        
        /* private: initialize screen & all vars */
		var initScreen = function() {
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
		
		/* private: start the bottom slide navigation */
		var initFooterNavigation = function() {
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
				var oldIndex = $('#screen-nav span.active').index()-1;
				var siblingIndex = $(this).index()-1; // index-1: there's the ExpoUI-button to deduct.
				if(curClasses.indexOf('active') == -1){
					$('body, #screen-nav, #top-nav, #launcher .screen, #screen-nav .nav-status').stop(true);
						
					window.location = location.protocol + '//' + location.hostname + location.pathname + '#!/' + curClass;
					var prevIndex = $('#screen-nav span.active').index()-1;
					$('#screen-nav span').removeClass('active');
					$(this).addClass('active');
					
					
					$('#launcher').animate({scrollTop: 0}, { 
						duration: 750, 
						queue: false/*, //queue false, fix for Chrome e.a. -->  uses scrollTop@body, so don't wait for this one to finish... */
					});
					
					var newPos      = panelWidthDiscrete/screenWidthDiscrete*100*siblingIndex;
					var newBGdiff   = panelWidthDiscrete/screenWidthDiscrete*100/5;
					var newWidthNav = $('#screen-nav span.active').outerWidth();
					var newPosNav   = screenWidthDiscrete/2-$(this).position()['left'];
								
					curBGpos = parseInt($('body').css('backgroundPositionX'));
					$('body, #screen-nav, #top-nav').animate({backgroundPositionX:(curBGpos+newBGdiff*(oldIndex-siblingIndex))+"%"}, {duration: 850, queue: false, easing: 'easeInOutCubic'});
					$('#launcher .screen').animate({left:-newPos+"%"}, 750, 'easeInOutCubic');
					$('#screen-nav .nav-status').animate({marginLeft:-newPosNav, width:newWidthNav}, 750, 'easeInOutCubic');
					$('#top-nav .nav-status, #top-nav span').fadeOut(750);
					
					function cleanUp(siblingIndex){ $('#launcher .screen .panel').removeClass('active').filter(':eq('+siblingIndex+')').addClass('active') };
					setTimeout(function(){ cleanUp(siblingIndex) }, 750);
					
					initPanel(curClass, prevIndex);
				}
			});
		}
		
		/* private: start the launcher previews functionality */
		var initExpoUINavigation = function() {
			$('#launcher').on('click', '.screen.expo-ui .panel',function(){
				$('body, #screen-nav, #top-nav, #launcher .screen, #screen-nav .nav-status').stop(true);
				
				var prevIndex = $('#screen-nav span.active').index()-1;
				$('#screen-nav span, #launcher .screen .panel').removeClass('active');
				
				var thisPointer = $(this);
				setTimeout(function(){ thisPointer.addClass('active') }, 600);
				
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
				
				/*$('body, #screen-nav, #top-nav')/*.css({backgroundPosition:-(newPos/5)+"%"})/.animate({backgroundPosition:-(newPos/5)+"%"}, {
					duration: 850, 
					queue: false, 
					easing: 'easeInOutCubic'
				});*/
				$('#launcher .screen').css({left:-newPos+'%'})//.animate({left:-newPos+'%'}, 750, 'easeInOutCubic');
				$('#screen-nav .nav-status').css({marginLeft:-newPosNav, width:newWidthNav})//.animate({marginLeft:-newPosNav, width:newWidthNav}, 750, 'easeInOutCubic');
				
				initPanel(curClass, prevIndex);
			});
			
			$('#screen-nav #zoom-btn').on('click', function(){
				$('body, #screen-nav, #top-nav, #launcher .screen, #screen-nav .nav-status').stop(true);
				
				var newPos = 0;
				
				$('#launcher').animate({scrollTop: 0}, {duration: 750, queue: false});
				$('#screen-nav, #top-nav').fadeOut(500);
				$('#launcherscreen').addClass('expo-ui screens-'+panelCount, 0);
				//$('body, #screen-nav, #top-nav').animate({backgroundPosition:-(newPos/5)+"%"}, {duration: 400, queue: false, easing: 'easeInOutCubic'});
				$('#launcher .screen').animate({left:-newPos+"%"}, 350, 'easeInOutCubic');
				
				setTimeout(function(){ cleanUp() }, 500);
			});
		}
		
		/* private: init inidivual panels after slide/activation */
		var initPanel = function(curClass, prevIndex) {
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
		
		/* private: hash screen switch functionality */
		var switchScreenOnHash = function() {
			var newLoc = location.href.replace( /^[^#]*#!\/?(.*)$/, '$1' );
			    
			if( $('#screen-nav span.'+newLoc).length > 0 )
				$('#screen-nav span.'+newLoc).trigger('click');
		}
		
		/* private: slide (or exit previews) with keys */
		var keyNavigation = function(e) {
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
		
		init();

    }
    
	/*$.fn[pluginName] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
			}
		});
	}*/
})(jQuery);