$(document).ready(function(){
  
      $('.navbar-brand').click(function(){
    $('nav').toggleClass('active-menu');
  });
  
  if($(window).scrollTop() >= 20){
		$('.top-section').hide();	
		 $('#shopify-section-header').addClass('fixed-header');
		 }
		 else{
		 	$('.top-section').show();
			$('#shopify-section-header').removeClass('fixed-header');
	  }
  
//   $('.active-menu li a').click(function(){
// event.preventDefault();
// $('ul.sub-menu').slideToggle('slow');
// });

  $(document).on("click", ".active-menu > ul li a", function() {
    $(".active-menu > ul li .sub-menu").not($(this).parent().find("div.sub-menu-main .sub-menu")).removeClass('active-menu-1');
    $(this).parent().find("div.sub-menu-main .sub-menu").toggleClass('active-menu-1');
  });
// $('.active-menu > ul li').click(function(){
//   console.log(123);
// // 	$('.sub-menu').toggleClass('active-menu-1');
// });

  
$(window).scroll(function(){
  
	if($(window).scrollTop() >= 20){
		$('.top-section').hide();	
		 $('#shopify-section-header').addClass('fixed-header');
		 }
		 else{
		 	$('.top-section').show();
			$('#shopify-section-header').removeClass('fixed-header');
	  }
	}); 


    $('.collection-listing-page .grid-view-change button').on('click',function(e) {
    if ($(this).hasClass('three_three')) {
        $('.collection-listing-page .col-md-4').removeClass('col-md-4').addClass('col-md-3');
        $('.collection-listing-page .grid-view-change button').removeClass('active');
        $(this).addClass('active');
    }
    else if($(this).hasClass('four_four')) {
 $('.collection-listing-page .grid-view-change button').removeClass('active');
        $(this).addClass('active');
        $('.collection-listing-page .col-md-3').removeClass('col-md-3').addClass('col-md-4');
    }
});
  
  $('.three_three').click(function (){
    $('.template-collection').addClass('three_three_active');
    $('.template-collection').removeClass('four_four_active');
  });


  $('.four_four').click(function (){
    $('.template-collection').addClass('four_four_active');
    $('.template-collection').removeClass('three_three_active');
  });
  
    $('.register-link').click(function() {
    $('.register-link').toggleClass('active-register');
    $('.register-form').toggleClass('form-active');
      $('.claim-form').removeClass('form-active');
       $('.claim-link').removeClass('active-register');
});
  
      $('.claim-link').click(function() {
        $('.claim-link').toggleClass('active-register');
    $('.claim-form').toggleClass('form-active');
         $('.register-form').removeClass('form-active');
        $('.register-link').removeClass('active-register');
});
  
   $('.submit_button_toggle_hidden').hide();
  
    $(".price-section button").click(function(){
    $(".price-section input.form-control").toggle();
      $('.submit_button_toggle').toggle();
      $('.submit_button_toggle_hidden').toggle();
      $('.search_focus').trigger('click');
  });
  
  
//   $('.register-link').click(function() {
//     if($('register-form').hasClass('register-form'))
//     {
//         $('register-form').addClass('active-register').removeClass('register-form');
//     }
//   });
  

//     $('.register-link').click(function(event){
//         $('.register-form').removeClass('register-form');
//         $(this).addClass('register-form-active');     
//         event.preventDefault();
//     });
  
});


$(window).on('load', function() {
  $('.picZoomer').picZoomer({picWidth: 450});
  $('.piclist li').on('click',function(event){
    var $pic = $(this).find('img');
    $('.picZoomer-pic').attr('src',$pic.attr('src'));
  });

});

// AJAX-search Script
  
$(function() {
  var currentAjaxRequest = null;
  var searchForms = $('form[action="/search"]').css('position', 'relative').each(function() {
    var input = $(this).find('input[name="q"]');
    input.attr('autocomplete', 'off').bind('keyup change', function() {
      var term = $(this).val();
      var form = $(this).closest('form');
      var searchURL = '/search?type=product&q=*' + term + '*';
      var resultsList = $('.search-results');
      console.log(resultsList+'---'+term+ '======'+term.length);
		//&& term !== $(this).attr('data-old-term')
      if (term.length > 3) {
        $(this).attr('data-old-term', term);
        if (currentAjaxRequest !== null) currentAjaxRequest.abort();
        currentAjaxRequest = $.getJSON(searchURL + '&view=json', function(data) {
          resultsList.empty();
          console.log(data.results)
          if (data.results_count === 0) {
            resultsList.html('<p>No results.</p>');
            resultsList.fadeIn(200);
            resultsList.hide();
          } else {
            $.each(data.results, function(index, item) {                
              console.log( item )
              var link = $('<a></a>').attr('href', item.url);                
              link.append('<span class="thumbnail"><img src="' + item.thumb + '" /></span>');
              link.append('<span class="title">' + item.title + '</span>');
              link.wrap('<div class="large-4 columns"></div>');
              resultsList.append(link.parent());
            });
            if (data.results_count > 10) {
              console.log('11');
              resultsList.append('<div class="row"><div class="semi-10 large-push-2 semi-push-1 large-8 columns"><a class="btn" href="' + searchURL + '"> +(' + data.results_count + ') more</a></div></div>');
            }
            resultsList.fadeIn(200);
          }
        });
      } else if (term.length < 1) {
      	resultsList.html('');
        resultsList.fadeOut(200);
      }
    });

  });
  
  
  $('#categoryFilter').on('change',function() {
  	window.location = $(this).val();
  });

  
});

//   $(document).ready(function() {
// //     $("#{{ media_wrapper_id }} .xzoom_image").xzoom({
// //       title: false, 
// //       tint: '#333', 
// //       Xoffset: 10,
// //     });

// // $("#bzoom").zoom({
// // 	zoom_area_width: 300,
// //     autoplay_interval :100,
// //     small_thumbs : 4,
// //     autoplay : false,
// // });

     
//         });
