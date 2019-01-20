(function($){
    var _streams;

    function init(params){
        console.log("Initializing streams...");

        _streams = this;

        acceptParameters(params);

        setupStreams();

        return this;
    }

    function acceptParameters(params){
        _baseurl = params['baseurl'];
    }

    function setupStreams(){
        $(_streams).each(function(){
            var stream = this;
            var name = $(this).text();

			if(name.length > 0){
	            $(this).html($('<div/>').addClass('title').text(name));
			}

            $(this).append($('<img/>').attr('stream-source', $(stream).attr('stream')));
        });

		$(document).on('cube-rotate', update);
    }

    function update(stream, force){
		setTimeout(function(){
			$(_streams).each(function(){
				var img = $(this).find('img');

				if($(img).is(':visible') || ($(img).parents('.cube-face').css('display') == 'block') || (force == true)){
					$(img).attr({
						'src': $(img).attr('stream-source')
					});
				}
				else{
					$(img).removeAttr('src');
				}
			});
		}, 500);
    }

    $.fn.stream = function(params){
        var args = (arguments.length == 0 ? [{}] : arguments);

        args[0] = $.extend(true,{
        }, args[0]);

        return init.apply(this, args);
    }

})(jQuery);

