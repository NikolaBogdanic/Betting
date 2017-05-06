$(document).ready(function() {

	/*
		Market search
	*/
	var searchTerm = sessionStorage.getItem('searchTerm') || '';
	$('#search').val(searchTerm);

	$('#search-button').on('click', function() {
		searchTerm = $('#search').val();
		sessionStorage.setItem('searchTerm', searchTerm);
		fireAjax();
	});

	/*
		Sort markets
	*/
	var ascendingMarketOrder = sessionStorage.getItem('ascendingMarketOrder') || 'unsorted';
	if (ascendingMarketOrder !== 'unsorted') {
		ascendingMarketOrder = (ascendingMarketOrder === 'true');
		ascendingMarketOrder ? 
		$('#sort-by-market-name-button').removeClass('desc').addClass('asc') :
		$('#sort-by-market-name-button').removeClass('asc').addClass('desc');
	}

	var sortByOdds = sessionStorage.getItem('sortByOdds') || false;
	if (sortByOdds === 'true') {
		sortByOdds = true;
		$('#sort-by-odds-button').addClass('on');
	}
	if (sortByOdds === 'false') {
		sortByOdds = false;
	}

	var sortBy = function(field, ascending, primer){
	   var key = function (x) {return primer ? primer(x[field]) : x[field]};
	   return function (a,b) {
		  var A = key(a), B = key(b);
		  return ( (A < B) ? -1 : ((A > B) ? 1 : 0) ) * [-1,1][+!!ascending];                  
	   }
	}

	$('#sort-by-market-name-button').on('click', function() {
		$('#sort-by-odds-button').removeClass('on');
		sortByOdds = false;
		sessionStorage.setItem('sortByOdds', sortByOdds);
		if (ascendingMarketOrder === 'unsorted') {
			ascendingMarketOrder = true;
			$(this).removeClass('desc');
			$(this).addClass('asc');
		} else {
			if (ascendingMarketOrder === true) {
				ascendingMarketOrder = false;
				$(this).addClass('desc');
				$(this).removeClass('asc');
			} else {
				ascendingMarketOrder = true;
				$(this).removeClass('desc');
				$(this).addClass('asc');
			}
		}
		sessionStorage.setItem('ascendingMarketOrder', ascendingMarketOrder);
		fireAjax();
	});

	$('#sort-by-odds-button').on('click', function() {
		$('#sort-by-market-name-button').removeClass('asc desc');
		sortByOdds ? $(this).removeClass('on') : $(this).addClass('on');
		ascendingMarketOrder = 'unsorted';
		sessionStorage.setItem('ascendingMarketOrder', ascendingMarketOrder);
		sortByOdds = sortByOdds ? false : true;
		sessionStorage.setItem('sortByOdds', sortByOdds);
		fireAjax();
	});
	
	/*
		Expand/Fold matches
	*/
	var activeTournaments = JSON.parse(sessionStorage.getItem('activeTournaments')) || [];
	$( 'body' ).on('click', '.icon-caret', function() {
		$(this).closest('.tournament-header').toggleClass('active');
		$(this).closest('.tournament').find('.matches').slideToggle('fast');

		// Remember which matches are expanded
		var tournamentId = $(this).closest('.tournament-header').data('id');
		if ($(this).closest('.tournament-header').hasClass('active')) {
			activeTournaments.push(tournamentId);
		} else {
			var index = activeTournaments.indexOf(tournamentId);
			if (index > -1) {
    			activeTournaments.splice(index, 1);
			}
		}
		sessionStorage.setItem('activeTournaments', JSON.stringify(activeTournaments));
	});

	/*
	  Loading data animation 
	*/
	$.loading = function() {
		$.blockUI({ 
			message: '<img class="cog" src="img/cog.png" alt="Cog">',
			fadeIn: false,
			baseZ: 10,
			overlayCSS:  {
				opacity: 0.2,
			},
			css: {
				border: 'none',
    		}, 
		});
	};

	/*
	  Template
	*/
	var TEMPLATE_URL = './template/template.html';
	var JSON_DATA_URL =  './json/odds.json';
	var $templatePlaceholder = $('#insert-template');
	var templateHTML = null;
	
	function renderTemplate(data) {
		if(templateHTML) {
			processTemplate(data);
			return;
		}

		$.ajax({
		    async: true,
		    type: 'GET',
		    url: TEMPLATE_URL,
		    success: function(t) {
		    	templateHTML = _.template($($.parseHTML(t)).html());
		    	processTemplate(data);
		    }
		});
	}
	
	function processTemplate(data){
		$templatePlaceholder.empty();
		var countries = $.map(data, function(value, index) {
			return [value];
		});
    	var templateData = {searchTerm, countries, sortBy, ascendingMarketOrder, sortByOdds};
    	$templatePlaceholder.append(templateHTML(templateData));

		// Expand matches which were expanded before rendering
		$('.tournament').each(function() {
			var tournamentId = $(this).find('.tournament-header').data('id');
			if (jQuery.inArray(tournamentId, activeTournaments) !== -1) {
				$(this).find('.tournament-header').addClass('active');
				$(this).find('.matches').show();
			}
		});
	}

	function fireAjax() {
		$.loading();
		$.ajax({
			type: 'POST',
			url: JSON_DATA_URL,
			encoding: 'UTF-8',
			contentType: 'application/x-www-form-urlencoded;charset=UTF-8'
			}).done(function(data) {
				renderTemplate(data);
				$.unblockUI();
		});
	}

	/*
		Fire Ajax every 10 sec
	*/
	fireAjax();
	setInterval(function() {
		fireAjax();
	}, 10000);

});