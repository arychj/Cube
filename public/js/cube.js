(function($){
    var _cube = null;

    var _isAnimating = false;
    var _endCurrentAnimation = false;
    var _endNextAnimation = false;

    function init(params){
        console.log('Initializing cube...');

        var faces = $(this).find('[cube-face]');
        if(faces.length == 6){
            _cube = generateCubeRotationGraph(faces);
        }
        else{
            throw 'Invalid number of faces.';
        }

        addEventListeners();

	    show($('[cube-face]').first());

        return this;
    }

    function acceptParameters(params){
        $.event.special.swipe.horizontalDistanceThreshold = params['horizontalSwipeThreshold'];
        $.event.special.swipe.verticalDistanceThreshold = params['verticalSwipeThreshold'];
    }

    function show(face){
        $('[cube-face]').fadeOut().removeAttr('cube-face-current');
	    $(face).attr({'cube-face-current': ''}).fadeIn();

        $('.cube-map-face').removeClass('active');
        $('.cube-map-face[cube-face-show=' + $(face).attr('cube-face') + ']').addClass('active');
    }

    function rotate(event){
        direction = event.data.direction;

        if(_isAnimating) {
            return false;
        }

        _isAnimating = true;

        switch(direction) {
            case 'left':
                outClass = 'pt-page-rotateCubeLeftOut pt-page-ontop';
                inClass = 'pt-page-rotateCubeLeftIn';
                break;
            case 'right':
                outClass = 'pt-page-rotateCubeRightOut pt-page-ontop';
                inClass = 'pt-page-rotateCubeRightIn';
                break;
            case 'up':
                outClass = 'pt-page-rotateCubeTopOut pt-page-ontop';
                inClass = 'pt-page-rotateCubeTopIn';
                break;
            case 'down':
                outClass = 'pt-page-rotateCubeBottomOut pt-page-ontop';
                inClass = 'pt-page-rotateCubeBottomIn';
                break;
        }

        current = $('[cube-face-current]');
        next = _cube[current.attr('cube-face')][direction].element;

        $(current)
            .addClass(outClass)
            .on('webkitAnimationEnd', {'current': current, 'next': next}, endAnimation);

        $(next)
            .addClass(inClass)
            .on('webkitAnimationEnd', {'current': current, 'next': next}, endAnimation);

        show(next);

        _isAnimating = false;
    }

    function endAnimation(event){
        $(event.data.current).removeClassByPrefix('pt-');
        $(event.data.next).removeClassByPrefix('pt-');
    }

    function addEventListeners(){
	    $('body').on('swipeup', {'direction': 'up'}, rotate);
    	$('body').on('swipedown', {'direction': 'down'}, rotate);
    	$('body').on('swipeleft', {'direction': 'left'}, rotate);
	    $('body').on('swiperight', {'direction': 'right'}, rotate);

        $('[cube-face-show]').on('click', function(e){
            show('[cube-face=' + $(this).attr('cube-face-show') + ']');
        });
    }

    function generateCubeRotationGraph(faces){
        var	cube = {
            front: {
                name: 'front',
                element: $(faces).locate('[cube-face="front"]')
            },
            back: {
                name: 'back',
                element: $(faces).locate('[cube-face="back"]')
            },
            left: {
                name: 'left',
                element: $(faces).locate('[cube-face="left"]')
            },
            right: {
                name: 'right',
                element: $(faces).locate('[cube-face="right"]')
            },
            top: {
                name: 'top',
                element: $(faces).locate('[cube-face="top"]')
            },
            bottom: {
                name: 'bottom',
                element: $(faces).locate('[cube-face="bottom"]')
            }
        };

        cube.front.up = cube.bottom;
        cube.front.down = cube.top;
        cube.front.left = cube.right;
        cube.front.right = cube.left;

        cube.back.up = cube.top;
        cube.back.down = cube.bottom;
        cube.back.left = cube.left;
        cube.back.right = cube.right;

        cube.top.up = cube.front;
        cube.top.down = cube.back;
        cube.top.left = cube.right;
        cube.top.right = cube.left;

        cube.bottom.up = cube.back;
        cube.bottom.down = cube.front;
        cube.bottom.left = cube.right;
        cube.bottom.right = cube.left;

        cube.left.up = cube.bottom;
        cube.left.down = cube.top;
        cube.left.left = cube.front;
        cube.left.right = cube.back;

        cube.right.up = cube.bottom;
        cube.right.down = cube.top;
        cube.right.left = cube.back;
        cube.right.right = cube.front;

        return cube;
    }

    $.fn.locate = function(selector) {
        return $(this).filter(function(index){
            return $(this).is(selector);
        });
    }

    $.fn.removeClassByPrefix = function(prefix) {
        this.each(function(i, el) {
            var classes = el.className.split(' ').filter(function(c) {
                return c.lastIndexOf(prefix, 0) !== 0;
            });

            el.className = $.trim(classes.join(' '));
        });

        return this;
    }

    $.fn.cubify = function(){
        arguments[0] = $.extend(true,{
            'horizontalSwipeThreshold': '40px',
            'verticalSwipeThreshold': '75px'
        }, arguments[0]);

        return init.apply(this, arguments);
    };
})(jQuery);
