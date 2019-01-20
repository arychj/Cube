(function($){
    var _cameras, _baseurl;
	var _staleness;

    function init(params){
        console.log("Initializing cameras...");

        _cameras = this;

        acceptParameters(params);

        setupCameras();

        return this;
    }

    function acceptParameters(params){
        _baseurl = params['baseurl'];
    }

    function setupCameras(){
        $(_cameras).each(function(){
            var camera = this;
            var name = getName(this);

            $(this).html($('<div/>').addClass('title'));
            $(this).append($('<div/>').addClass('last-updated'));
            $(this).append($('<div/>').addClass('frame').append('<img/>'));
//            $(this).append($('<img/>'));

            bind(this, function(title, url){
                $(this).find('.title').html(title);
                $(this).attr({
                    'camera-snap-source': url
                });

                refresh(camera, true);
            });

            if($(this).is('[camera-refresh]')){
                setInterval(function(){ refresh(camera); }, parseInt($(this).attr('camera-refresh')) * 1000);
            }
        });

		_staleness = setInterval(updateStaleness, 1000);
    }

    function getName(camera){
        return $(camera).attr('entity-id').split('.')[1];
    }

    function bind(camera, updater){
        $(camera).bind('update-state', function(e, data){
            updater.apply(this, [
                data.attributes.friendly_name,
                _baseurl + data.attributes.entity_picture
            ]);
        });
    }

    function refresh(camera, force){
        if($(camera).is(':visible') || ($(camera).parents('.cube-face').css('display') == 'block') || (force == true)){
            var frame = $(camera).find('.frame');
			var ts = Date.now();
			$(camera).find('.last-updated').attr('ts', ts);

            var img = $('<img/>').attr({
                'src': $(camera).attr('camera-snap-source') + '&ts=' + ts
            }).hide();
            
            $(frame).append(img);

            $(img).on('load error', function(){
                $(img).fadeIn('fast', function(){
                    $(frame).find('img:first').remove();
                });
            });
        }
    }

	function updateStaleness(){
		$(_cameras).each(function(){
			if($(this).is(':visible')){
				var lastUpdated = $(this).find('.last-updated');
				var ts = $(lastUpdated).attr('ts');

				if(ts.length > 0){
					$(lastUpdated).html(
						'<i class="material-icons">restore</i>'
						+ moment(ts, 'x').fromNow()
					);
				}
			}
		});
	}

    $.fn.camera = function(params){
        var args = (arguments.length == 0 ? [{}] : arguments);

        args[0] = $.extend(true,{
            'baseurl': ''
        }, args[0]);

        return init.apply(this, args);
    }

})(jQuery);

