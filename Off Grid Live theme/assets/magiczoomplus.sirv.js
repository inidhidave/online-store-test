//var SirvOptions = { autostart: false };

var $lockMZUpdate = false, $firstImageIsVideo = false;

mzOptions = mzOptions || {};
mzOptions.onUpdate = function() {
    if (!$lockMZUpdate) {
        mtHighlightActiveSelector();
    }
    $lockMZUpdate = false;
};
var mtZoomIsReady = false;
mzOptions.onZoomReady = function(id) {
    mtZoomIsReady = true;
    if (!$firstImageIsVideo) {
        mtHighlightActiveSelector();
    }
}

function mtIfZoomReady(fnc) {
    if (!mtZoomIsReady) {
        setTimeout(function() {
            mtIfZoomReady(fnc);
        }, 250);
        return;
    }
    fnc();
}

function mtInitSelectors(selector) {
    jQuery(selector).on((mzOptions && mzOptions.selectorTrigger && mzOptions.selectorTrigger == 'hover')?'mouseover click':'click',function(e) {
        var el = jQuery(this);
        if (el.attr('data-slide-id') == 'spin') {
//             var spinObj = document.getElementById('sirv-spin');
//             if (spinObj && typeof Sirv != 'undefined' && !Sirv.exists(spinObj)) {
//                 Sirv.start(spinObj);
//             } 
        }
        if ( jQuery('.MagicToolboxContainer .MagicToolboxSlide.active-magic-slide iframe').length ==1 ) {
          jQuery('.MagicToolboxContainer .MagicToolboxSlide.active-magic-slide iframe')[0].src = jQuery('.MagicToolboxContainer .MagicToolboxSlide.active-magic-slide iframe')[0].src;
        }
        jQuery('.MagicToolboxContainer .MagicToolboxSlide').removeClass('active-magic-slide');
        jQuery('.MagicToolboxContainer .MagicToolboxSlide[data-slide-id="' + el.attr('data-slide-id') + '"]').addClass('active-magic-slide');
        jQuery('.MagicToolboxContainer .MagicToolboxSelectorsContainer a').removeClass('active-magic-selector mz-thumb-selected');
        el.addClass('active-magic-selector mz-thumb-selected');
        e.preventDefault();
    });
}

function mtInitVideoSelectors() {
  
    jQuery('.MagicToolboxSlides div[data-video-url]').each(function(){
      
        if (jQuery(this).data('processed')) return;
      
        var regex_youtube_short = /https?:\/\/youtu\.be\/([^\/]{1,})\/?/gm,
            regex_youtube_full = /https?:\/\/www\.youtube\.com\/watch\?v=(.*?)(&|$).*/gm,
            regex_youtube_embed = /https?:\/\/www\.youtube\.com\/embed\/(.{1,})/gm,
            regex_vimeo = /https?:\/\/vimeo\.com\/(.{1,})/gm,
            video_id, video_type;
        var $videoURL = jQuery(this).attr('data-video-url').replace(/https\:\/\/player\.vimeo\.com\/video\/([0-9]{1,})/gm,'https://vimeo.com/$1');
        var m = regex_youtube_short.exec($videoURL);
        if (m) {
            video_id = m[1];
            video_type = 'youtube';
        } else {
            var m = regex_youtube_full.exec($videoURL);
            if (m) {
                video_id = m[1];
                video_type = 'youtube';
            } else {
                var m = regex_youtube_embed.exec($videoURL);
                if (m) {
                    video_id = m[1];
                    video_type = 'youtube';
                } else {
                    var m = regex_vimeo.exec($videoURL);
                    if (m) {
                        video_id = m[1];
                        video_type = 'vimeo';
                    }
                }  
            }
        }
        if (video_type=='youtube') {
            jQuery(this).html('<div class="magic-video-container"><iframe src="https://www.youtube.com/embed/'+video_id+'" frameborder="0" allowfullscreen></iframe></div>');
        } else if (video_type=='vimeo') {
            jQuery(this).html('<div class="magic-video-container"><iframe src="https://player.vimeo.com/video/'+video_id+'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>');
        } else {
            jQuery('div[data-slide-id="'+jQuery(this).attr('data-slide-id')+'"],a[data-slide-id="'+jQuery(this).attr('data-slide-id')+'"]').remove();
        }       
    })
}

function mtHighlightActiveSelector() {
    if (typeof jQuery == 'undefined') {
      return;
    }
    jQuery('.MagicToolboxContainer .MagicToolboxSelectorsContainer a').removeClass('active-magic-selector');
    jQuery('.MagicToolboxContainer .MagicToolboxSelectorsContainer a.mz-thumb-selected').addClass('active-magic-selector');
}

function mtGetMaxSizes() {
    var $maxWidth = $maxHeight = 1;
    jQuery('.MagicToolboxSelectorsContainer a > img').each(function(){
        var img = jQuery(this);
        if (img.is(':visible')) {
            $maxHeight = Math.max($maxHeight, img.height());
            $maxWidth = Math.max($maxWidth, img.width());
        }
    });
    return {'width': $maxWidth, 'height': $maxHeight};
}

function SirvSKUTransform($sku) {
  if (SirvSpinsPathTransform!='') {
    var re = new RegExp('^'+SirvSpinsPathTransform+'$', 'gmsi');
    return $sku.replace(re, '$1');  
  }
    return $sku;
}


function mtInitSirv() {

    if(typeof(SirvID) == 'undefined' || SirvID == '') {
        initMagicScroll();
        return;
    }
  
    if (SirvSpinPosition == 'first') {
        SirvOptions = { autostart: true };
    }
  

    var sirv = document.createElement('script');
    sirv.type = 'text/javascript';
    sirv.async = true;
    sirv.src = document.location.protocol.replace('file:', 'http:') + '//scripts.sirv.com/sirvjs/v3/sirv.js';
    document.getElementsByTagName('script')[0].parentNode.appendChild(sirv);

    var spinURL = document.location.protocol.replace('file:', 'https:') + '//' + SirvID + '.sirv.com/' + 
        SirvSpinsPath.replace(/{product\-id}/g, SirvProductID)
        .replace(/{product\-sku}/g, SirvProductSKU)
        .replace(/{product\-name}/g, SirvProductName);

    jQuery.ajax({
        url: spinURL,
        //dataType: 'jsonp',
        type: 'HEAD',
        cache: true,
        timeout : 4000,
        error : function(jqXHR, textStatus, errorThrown) {
            initMagicScroll();
        },
        success: function(data, textStatus, jqXHR) {
            mtInitSirvIcon(spinURL);
        },
    });
  
    for (var i in SirvVariants) {
        var $sku = SirvSKUTransform(SirvVariantsSKU[i].sku);
        var v_spinURL = document.location.protocol.replace('file:', 'http:')+'//'+SirvID+'.sirv.com/'+
            SirvSpinsPath
        .replace(/{product\-id}/g, i)
        .replace(/{product\-sku}/g, (typeof SirvVariantsSKU[i].sku != 'undefined' && SirvVariantsSKU[i].sku!='' && SirvVariantsSKU[i].sku!=null)?$sku.replace('/',''):i)
        .replace(/{product\-name}/g, SirvProductName+'-'+i);        
        jQuery.ajax({
            url: v_spinURL,
            //dataType: "jsonp",
            type: 'HEAD',
            'cache': 'false',
            timeout : 4000,
            spinID: i,
            error : function() { SirvVariants[this.spinID] = false; },
            success: function( data ) {
                SirvVariants[this.spinID] = this.url.replace(/\?callback.*/gm,'');
                if (this.spinID == currentVariantID) {
                    if (SirvSpinPosition == 'first') {
                        mtShowSirvVariant(currentVariantID)
                    } else {
                        mtInitSirvIcon(SirvVariants[this.spinID]);
                        var $h = (SirvMaxHeight>0)?'?h='+SirvMaxHeight:'';
                        jQuery('.Sirv div').attr('data-src', SirvVariants[this.spinID]+$h);
                    }
                  currentVariantID = 0;
                }
            }  
        });
    }
    
}

function initMagicScroll() {
    if (jQuery('#msc-selectors-container').length) {
        MagicScroll.start();
    }
}

function mtInitArrows() {
    jQuery('.MagicToolboxSlides .MagicToolboxSlides-arrow').on('click', function(e){
        var $selectorsContainer = jQuery(this).closest('.MagicToolboxContainer').find('.MagicToolboxSelectorsContainer'),
            $currentSelector = $selectorsContainer.find('a.active-magic-selector'),
            $newSelector = false,
            $useScroll = jQuery('#msc-selectors-container').length,
            $forward = jQuery(this).hasClass('magic-next'),
            $mscItem, $mscCurItemId, $mscNewItemId;

            if ($useScroll) {
                $mscItem = $currentSelector.parent();
                $mscCurItemId = $mscItem.attr('data-item');
                $mscItem = $forward ? $mscItem.next() : $mscItem.prev();
                if (!$mscItem.length) {
                    $mscItem = $selectorsContainer.find('div[data-item='+$mscCurItemId+']');
                    $mscItem = $forward ? $mscItem.first().next() : $mscItem.last().prev();
                    if (!$mscItem.length) {
                        //NOTE: carousel, cover-flow
                        $mscItem = $forward ? $selectorsContainer.find('.mcs-item:first') : $selectorsContainer.find('.mcs-item:last');
                        if (!$mscItem.length) {
                            e.preventDefault();
                            return;
                        }
                    }
                }
                $newSelector = $mscItem.find('a');
                $mscNewItemId = $mscItem.attr('data-item');
                $mscNewItemId = parseInt($mscNewItemId, 10);
                MagicScroll.jump('msc-selectors-container', $mscNewItemId);
            } else {
                $newSelector = $forward ? $currentSelector.next('a') : $currentSelector.prev('a');
                if (!$newSelector.length) {
                    $newSelector = $forward ? $selectorsContainer.find('a:first') : $selectorsContainer.find('a:last');
                }
            }
      
        if ($newSelector.length) {
            $newSelector.trigger('click');
            if ($newSelector.hasClass('mz-thumb')) {
                $lockMZUpdate = true;
                MagicZoom.switchTo(jQuery(this).closest('.MagicToolboxContainer').find('a.MagicZoomPlus').attr('id'), $newSelector[0]);
            }
        }
        e.preventDefault();
    });
}

function mtInitVariants() {
    if (window.slate && slate.Variants && slate.Variants.prototype._updateImages) {
        slate.Variants.prototype._updateImagesOriginal = slate.Variants.prototype._updateImages;
        slate.Variants.prototype._updateImages = function(variant) {
            var variantImage = variant.featured_image || {};
            var currentVariantImage = this.currentVariant.featured_image || {};
          
            if (typeof SirvVariants != 'undefined') {
                if (typeof SirvVariants[variant.id] != 'undefined' && typeof SirvVariants[variant.id] == 'string') {
                    mtShowSirvVariant(variant.id);
                } else {
                    if (!variant.featured_image || variantImage.src === currentVariantImage.src) {
                        return;
                    }
                    var $s = $('a[data-variants*="'+variant.id+'"]');
                    if (typeof MagicZoom != 'undefined' && $s.length) {
                        MagicZoom.switchTo($s.closest('.MagicToolboxContainer').find('.MagicZoomPlus').attr('id'), $s.get(0))
                    }                    
                }
            }
            return this._updateImagesOriginal.apply(this, arguments);
        };
    }

  
    if (window.slate && slate.Variants && slate.Variants.prototype._onSelectChange) {
        slate.Variants.prototype._onSelectChangeOriginal = slate.Variants.prototype._onSelectChange;
        slate.Variants.prototype._onSelectChange = function(variant) {
          
            var variant = this._getVariantFromOptions();
          
            if (typeof SirvVariants != 'undefined') {
                if (typeof SirvVariants[variant.id] != 'undefined' && typeof SirvVariants[variant.id] == 'string') {
                    mtShowSirvVariant(variant.id);
                } else {
                    var $s = $('a[data-variants*="'+variant.id+'"]');
                    if (typeof MagicZoom != 'undefined' && $s.length) {
                        MagicZoom.switchTo($s.closest('.MagicToolboxContainer').find('.MagicZoomPlus').attr('id'), $s.get(0))
                    }                    
                }
            }
            return this._onSelectChangeOriginal.apply(this, arguments);
        };
    }  

    if (Shopify.OptionSelectors && Shopify.OptionSelectors.prototype.updateSelectors) {
        Shopify.OptionSelectors.prototype.updateSelectorsOriginal = Shopify.OptionSelectors.prototype.updateSelectors;
        Shopify.OptionSelectors.prototype.updateSelectors = function(index, option) {
            var values = this.selectedValues(),
                variant = this.product.getVariant(values);
            if (variant && typeof SirvVariants != 'undefined') {
              
                if (typeof SirvVariants != 'undefined' && typeof SirvVariants[variant.id] != 'undefined' && typeof SirvVariants[variant.id] == 'string') {
                    mtShowSirvVariant(variant.id);
                } else {
                    var featuredImage = variant.featured_image;
                    if (featuredImage) {
                        var largeImage = featuredImage.src;
                        var iSize = Shopify.Image.imageSize(jQuery('a.MagicZoomPlus img').first().attr('src'));
                        var smallImage = Shopify.Image.getSizedImageUrl(largeImage, iSize);
                        if (featuredImage.product_id == SirvProductID) {
                            mtIfZoomReady(function(){
                                mtSwitchImage(largeImage, smallImage);
                            });
                        }
                    }
                }
            }
            return this.updateSelectorsOriginal.apply(this, arguments);
        }
    }

    jQuery(document).on('variantImageSelected', function(e, variant){
        var $s = jQuery('a[data-variants*="'+variant.id+'"]');
        if (typeof MagicZoom != 'undefined' && $s.length) {
            MagicZoom.switchTo($s.closest('.MagicToolboxContainer').find('.MagicZoomPlus').attr('id'), $s.get(0))
        }      
    });

    jQuery(window).on('shopify-variants:switch-variant product-variant-switch', function() {
        if (!arguments[1].firstLoad) {
            var variant = arguments[1].variant;
            var $s = jQuery('a[data-variants*="'+variant.id+'"]');
            if (typeof MagicZoom != 'undefined' && $s.length) {
                MagicZoom.switchTo($s.closest('.MagicToolboxContainer').find('.MagicZoomPlus').attr('id'), $s.get(0))
            }      
        }
    });      

    jQuery('div[data-section-id="product-template"]').on('theme:variants:changed', function() {
      var variant = arguments[1].id;
      var $s = jQuery('a[data-variants*="'+variant+'"]');
      if (typeof MagicZoom != 'undefined' && $s.length) {
        MagicZoom.switchTo($s.closest('.MagicToolboxContainer').find('.MagicZoomPlus').attr('id'), $s.get(0))
      }      
    });

    jQuery('.product-template').on('variant_change', function() {
        var variant = arguments[3];
        var $s = jQuery('a[data-variants*="'+variant.id+'"]');
        if (typeof MagicZoom != 'undefined' && $s.length) {
            MagicZoom.switchTo($s.closest('.MagicToolboxContainer').find('.MagicZoomPlus').attr('id'), $s.get(0))
        }      
    });

    jQuery('section[data-section-type="product"]').on('variant:changed', function() {
        var variant = arguments[0].originalEvent.detail.variant;
        var $s = jQuery('a[data-variants*="'+variant.id+'"]');
        if (typeof MagicZoom != 'undefined' && $s.length) {
            MagicZoom.switchTo($s.closest('.MagicToolboxContainer').find('.MagicZoomPlus').attr('id'), $s.get(0))
        }      
    });      
    
    jQuery('[data-section-id="product-template"]').on('variant:changed', function() {
      var variant = arguments[0].originalEvent.detail.variant.id;
      var $s = jQuery('a[data-variants*="'+variant+'"]');
      if (typeof MagicZoom != 'undefined' && $s.length) {
        MagicZoom.switchTo($s.closest('.MagicToolboxContainer').find('.MagicZoomPlus').attr('id'), $s.get(0))
      }      
    });

  
    jQuery('div.product-section').on('variantChange', function() {
      var variant = arguments[0].variant;
      var $s = jQuery('a[data-variants*="'+variant.id+'"]');
      if (typeof MagicZoom != 'undefined' && $s.length) {
        MagicZoom.switchTo($s.closest('.MagicToolboxContainer').find('.MagicZoomPlus').attr('id'), $s.get(0))
      }      
    });

}

function mtInitSirvIcon(spinURL) {

    if ( jQuery('div[data-slide-id="spin"]').length ) {
        return;
    }
    
    var $h = (SirvMaxHeight>0)?'?h='+SirvMaxHeight:'';
    jQuery('.MagicToolboxSlides').append(
        '<div data-slide-id="spin" class="MagicToolboxSlide"><div class="Sirv" id="sirv-spin"><div data-src="' + spinURL + $h + '"></div></div></div>'
    );

    jQuery('.MagicToolboxContainer').removeClass('no-thumbnails');
    jQuery('.MagicToolboxSelectorsContainer').show();

    jQuery('.MagicToolboxSlides .MagicToolboxSlides-arrow').show();

    var sizes = mtGetMaxSizes();

    if (jQuery('.MagicToolboxSelectorsContainer a').length == 0) {
        jQuery('.MagicToolboxSlides .MagicToolboxSlides-arrow').hide();      
        jQuery('.MagicToolboxSelectorsContainer').append(
            ' <a data-slide-id="spin" href="#"><img id="SirvIcon" style="display:none;" src="' + SirvIconURL + '"/></a>'
        );
    } else if (SirvSpinPosition == 'last') {
        jQuery('.MagicToolboxSelectorsContainer a:last').after(
            ' <a data-slide-id="spin" href="#"><img id="SirvIcon" style="display:none;" src="' + SirvIconURL + '"/></a>'
        );
    } else if (SirvSpinPosition == 'second') {
        jQuery('.MagicToolboxSelectorsContainer a:first').after(
            ' <a data-slide-id="spin" href="#"><img id="SirvIcon" style="display:none;" src="' + SirvIconURL + '"/></a>'
        );
    } else {
        jQuery('.MagicToolboxSelectorsContainer a:first').before(
            ' <a data-slide-id="spin" href="#"><img id="SirvIcon" style="display:none;" src="' + SirvIconURL + '"/></a>'
        );
    }
  
    if (jQuery('.MagicToolboxContainer').hasClass('layout-bottom')) {
        jQuery('#SirvIcon').css('height', sizes.height + 'px').show();
    } else {
        jQuery('#SirvIcon').css('width', sizes.width + 'px').show();
    }

    mtInitSelectors('.MagicToolboxSelectorsContainer a[data-slide-id="spin"]');

    if (SirvSpinPosition == 'first') {
        if (SirvVariants[currentVariantID]) {
            mtShowSirvVariant(currentVariantID);
            currentVariantID = 0;
        } else {
            jQuery('.MagicToolboxSelectorsContainer a[data-slide-id="spin"]').trigger('click');
        }
    }

    if (jQuery('.MagicToolboxSelectorsContainer a').length == 0) {
      jQuery('.MagicToolboxContainer').addClass('no-thumbnails');
      jQuery('.MagicToolboxSlides .MagicToolboxSlides-arrow, .MagicToolboxSelectorsContainer').hide();
      jQuery('div[data-slide-id="zoom"]').removeClass('active-magic-slide');
      jQuery('div[data-slide-id="spin"]').addClass('active-magic-slide');
      Sirv.start();
      
    }    
  
    initMagicScroll();
}

function mtShowSirvVariant(variant_id) {
    if (jQuery('#SirvIcon').length==0) {
        var $useScroll = jQuery('#msc-selectors-container').length;
        if ($useScroll) {
            MagicScroll.stop();
        }
        mtInitSirvIcon(SirvVariants[variant_id]);
    }  
    if (typeof Sirv != 'undefined') {
        Sirv.stop();
    }      
    var $h = (SirvMaxHeight>0)?'?h='+SirvMaxHeight:'';
    jQuery('div[data-slide-id="spin"]').html('<div class="Sirv" id="sirv-spin"><div data-src="' + SirvVariants[variant_id] + $h + '"></div></div>');
    if (SirvSpinPosition == 'first') {
     jQuery('a[data-slide-id="spin"]').trigger('click');    
    } else {
        $('a.mz-thumb-selected').trigger('click')
    }
}

function mtSwitchImage(largeImage, smallImage) {
    var activeSlide = jQuery('.MagicToolboxContainer .active-magic-slide');
    if (activeSlide.attr('data-slide-id') == 'spin') {
        activeSlide.removeClass('active-magic-slide');
        jQuery('.MagicToolboxContainer .MagicToolboxSlide[data-slide-id="zoom"]').addClass('active-magic-slide');
    }
    if (jQuery('.mz-lens').length == 0) {
        mtHighlightActiveSelector();
        jQuery('a.MagicZoomPlus').attr('href', largeImage)
        jQuery('a.MagicZoomPlus img').first().attr('src', smallImage);
    } else {
        MagicZoom.update(jQuery('a.MagicZoomPlus').attr('id'), largeImage, smallImage);
    }
}

function mtOnDomReady(fnc) {
    if (typeof(jQuery) == 'undefined') {
        setTimeout(function() {
            mtOnDomReady(fnc);
        }, 250);
        return;
    }
    jQuery(document).ready(fnc);
}

function mtGetParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  var results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function mtGetVariantId() {
  // Try to get variant from URL
  var variantId = mtGetParameterByName('variant');
  // If not get variants on product object
  if (!variantId && mt_product.variants && mt_product.variants.length > 0) {
      for (var i = 0; i < mt_product.variants.length; i++) {
          if (mt_product.variants[i].available) {
              variantId = mt_product.variants[i].id;
              break;
          }
      }
  }
  return variantId;
}

function updateMZPGallery($id) {
    var $s = jQuery('a[data-variants*="' + $id + '"]');
    if ($s.length) {
        $s.show();
        $s.prevAll().hide();
        var $hide = false;
        $s.nextAll().each(function() {
            if (jQuery(this).attr('data-variants') != ',') {
                $hide = true;
            }
            if ($hide) {
                jQuery(this).hide();
            } else {
                jQuery(this).show();
            }
        })
        jQuery('a[data-slide-id="spin"]').show();
    }
}

function initmzp() {
    if (jQuery('#admin_bar_iframe').length) {
        jQuery(document.body).append(
            '<style type="text/css">.mz-zoom-window { margin-top: -' + jQuery('#admin_bar_iframe').height() + 'px; </style>'
        );
    }
  
    mtInitVideoSelectors('.MagicToolboxSelectorsContainer a');

    mtInitSelectors('.MagicToolboxSelectorsContainer a');

    var $firstVideoSelector = jQuery('[data-slide-num="0"][data-video-url]');
    if ($firstVideoSelector.length) {
      jQuery('a[data-slide-id="'+$firstVideoSelector.attr('data-slide-id')+'"]').trigger('click');
      $firstImageIsVideo = true;      
    }

    mtInitSirv();

    mtInitArrows();

    //mtInitVariants();

    jQuery('form[action="/cart/add"]').on('change', function() {
      var $id = mtGetVariantId();
      //updateMZPGallery($id)

      if ($id == currentVariantID) return;
      currentVariantID = $id;

      var $s = jQuery('a[data-variants*="' + $id + '"]');
      if (typeof MagicZoom != 'undefined' && $s.length) {
        MagicZoom.switchTo($s.closest('.MagicToolboxContainer').find('.MagicZoomPlus').attr('id'), $s.get(0))
      }
      
      if (typeof SirvVariants != 'undefined' && typeof SirvVariants[$id] != 'undefined' && typeof SirvVariants[$id] == 'string') {
          mtShowSirvVariant($id);
      } else {
        $s.trigger('click')
      }
      
    })    

}

mtOnDomReady(function() {
    initmzp();
});
