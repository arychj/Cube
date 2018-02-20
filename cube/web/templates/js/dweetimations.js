(function($){
    var _dweetimations;

    var _dweets = {
        'cube': {
            'author': 'https://www.dwitter.net/d/2565',
            'dweet': function(c){
                for(a=c.width|=l=C(t),m=S(t);a--;x.fillRect((d*l-S(a)*m)*h+960,(g*l-f*m)*h+520,h/=65,h))d=S(a*(f=C(a*a))),g=d*m+S(a)*l,h=800/(3+g*m+f*l)
            }
        },
        'snow-cube': {
            'author': 'https://www.dwitter.net/d/2565', // customized
            'dweet': function(c){
                for(a=c.width|=l=C(t),m=S(t)*2.5;a--;x.fillRect((d*l-S(a)*m)*h+960,(g*l-f*m)*h+520,h/=65,h))d=S(a*(f=C(a*a))),g=d*m+S(a)*l,h=800/(4+g*m+f*l)
            }
        }
    };

    function getCanvas(element, create){
        var canvas = null;

        if($(element).is('canvas')){
            canvas = element;
        }
        else{
            var canvas = $(element).find('canvas');
            if((canvas.length == 0) && (create !== false)){
                var canvas = $('<canvas/>').css({
                    'width': '100%',
                    'height': '100%',
                });

                $(element).append(canvas);
            }
        }

        if(canvas.length > 0){
            $(canvas).attr({
                'width': '1920px',
                'height': '1080px'
            })
            .css({
                'filter': 'invert(100%)'
            });

            return canvas.get(0);
        }
        else{
            return null;
        }
    }

    function dweet(c, f){
        with(Math)S=sin,C=cos,T=tan;
        x=c.getContext("2d");
        frame=0;

        function u(){
            if(c.play){
                t = ++frame/120;
                f(c);
                requestAnimationFrame(u);
            }
        }

        u();
    }

    $.fn.dweetimate = function(){
        $(this).each(function(){
            var dweetimation = $(this).attr('dweetimation');
            if(dweetimation in _dweets){
                var canvas = getCanvas(this);
                if(canvas != null){
                    if(!('play' in canvas) || canvas.play == false){
                        canvas.play = true;
                        dweet(canvas, _dweets[dweetimation].dweet);
                        $(this).fadeIn();
                    }
                }
            }
        });

        return this;
    }

    $.fn.dweetistop = function(){
        $(this).each(function(){
            var canvas = getCanvas(this, false);
            canvas.play = false;

            $(this).fadeOut();
        });

        return this;
    }
})(jQuery);

