/**
 * parallax.js
 * @author Brad Anderson
 * @description Tween elements based on the users scroll position or flip a switch when the user gets to a certain point in the page
 * @requires Nothing
 * @example
 *  var tween = new parallax.Tween(
        document.getElementById('pizza'),
        'left',
        '0px',
        '300px',
        20,
        220
    );
    parallax.init();
 */

////////////
// POLYFILLS
////////////

// requestAnimationFrame() polyfill
window.requestAnimationFrame = 
    window.requestAnimationFrame       || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame    || 
    window.oRequestAnimationFrame      || 
    window.msRequestAnimationFrame     || 
    function( callback ){
        window.setTimeout(callback, 1000 / 60);
    }
;

// Function.bind() polyfill
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
 
    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };
 
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
 
    return fBound;
  };
}

var parallax = (function() {
    var parallax = {};

    var SCROLL_AMOUNT = 65;

    var _tweens = [];
    
    var _switches = [];

    var _isScrolling = true;

    var _scrollTop = 0;
    
    var _lastScrollTop = 0;

    var _easedScrollTop = 0;

    var _scrollMax = 0;
    
    var _defaultEasingFunction = function(p) {
        return 0.5 + 0.5 * Math.sin(Math.PI * ( p - 0.5 ));
    };

    
    /**
     * Start listening for the scroll event, also figure out where all the elements need to be
     */
    parallax.init = function() {
        // Bindings
        this.$container = $('.parallax-container');
        this.onResizeHandler = _onResize.bind(this);
        this.onScrollHandler = _onScroll.bind(this);
        this.onMousewheelHandler = _onMousewheel.bind(this);

        // Event bindings
        $(window).on('resize', this.onResizeHandler);
        this.$container.on('scroll', this.onScrollHandler);
        this.$container.on('mousewheel', this.onMousewheelHandler);

        var self = this;
        console.log('requestAnimationFrame');
        // requestAnimationFrame(function() {
        //     self.update();
        // });
    };
    
    /**
     * Stop listening for the scroll event, also empty the private tweens array
     */
    parallax.exit = function() {
        $(window).off('resize', this.onResizeHandler);
        this.$container.off('scroll', this.onScrollHandler);
        _tweens = [];
    };
    
    /**
     * Tween an element based on how many pixels the user has scrolled
     * @class parallax.Tween
     * @param {DOM Element} element         The element to animate
     * @param {String}      property        The CSS property to animate
     * @param {String}      start           The initial value when we start animating (with units e.g. '0px')
     * @param {String}      end             The final value when we stop animating (with units e.g. '200px')
     * @param {Number}      delay           How many pixels will the user have scrolled when the animation starts
     * @param {Number}      animationEnd    How many pixels will the user have scrolled when the animation finishes
     * @param {Function}    easingFunction  Optional. A function taking the percentComplete of pixels scrolled and outputting the percentComplete of the animation
     */
    parallax.Tween = function ParallaxTween(
        element,
        property,
        start,
        end,
        delay,
        animationEnd,
        easingFunction
    ) {
        this.element = element;
        this.$element = $(element);
        this.property = property;
        this.start = parseFloat(start);
        this.end = parseFloat(end);
        this.delay = delay;
        this.animationEnd = animationEnd;
        this.easingFunction = easingFunction || _defaultEasingFunction;
        
        this.isAnimating = false;
        this.range = this.animationEnd - this.delay;
        this.change = this.end - this.start;
        this.units = start.split(this.start)[1];
        
        if (animationEnd > _scrollMax) {
            _scrollMax = animationEnd;
        }
        
        _tweens.push(this);
    };
    
    /**
     * Flip a switch when a user scrolls x pixels
     * @class parallax.Switch
     * @param {DOM Element} element     The element to change
     * @param {String}      property    The CSS property to change
     * @param {String}      start       The value of the CSS property *before* we scroll x pixels
     * @param {String}      end         The value of the CSS property *after* we scroll x pixels
     * @param {Number}      delay       How many pixels will the user have scrolled when we make the switch
     */
    parallax.Switch = function ParallaxSwitch(
        element,
        property,
        start,
        end,
        delay
    ) {
        this.element = element;
        this.property = property;
        this.start = start;
        this.end = end;
        this.delay = delay;

        if (end > _scrollMax) {
            _scrollMax = end;
        }
        
        _switches.push(this);
    };

    parallax.update = function() {
        console.log('update called');
        _scrollTop = this.$container.scrollTop();

        if (_easedScrollTop === _scrollTop) {
            _isScrolling = false;
            return;
        }

        _easedScrollPercentComplete = _easedScrollStart + _easedScrollTop / _easedScrollDiff;
        _easedScrollTop = _defaultEasingFunction(_easedScrollPercentComplete);

        var l = _tweens.length;
        for (var i = 0; i < l; i++) {
            var tween = _tweens[i];
            if (_easedScrollTop >= tween.animationEnd || _easedScrollTop <= tween.delay) {
                
                if (tween.isAnimating) {
                    
                    if (_lastScrollTop > _easedScrollTop) {
                        tween.element.style[tween.property] = tween.start + tween.units;
                    } else {
                        tween.element.style[tween.property] = tween.end + tween.units;
                    }
                    
                    tween.isAnimating = false;
                }
                
                continue;
            }
            tween.isAnimating = true;
            var percentComplete = (_easedScrollTop - tween.delay) / tween.range;
            var position = tween.start + tween.change * tween.easingFunction(percentComplete);
            tween.$element.css(tween.property, position + tween.units);
        }
        
        l = _switches.length;
        for (var i = 0; i < l; i++) {
            var _switch = _switches[i];
            if (_lastScrollTop < _switch.delay && _easedScrollTop >= _switch.delay) {
                _switch.element.style[_switch.property] = _switch.end;
            } else if (_lastScrollTop > _switch.delay && _easedScrollTop < _switch.delay) {
                _switch.element.style[_switch.property] = _switch.start;
            }
        }
        _lastScrollTop = _easedScrollTop;
    };

    var _onScroll = function(e) {
        _easedScrollStart = _easedScrollTop;
    };

    var _onResize = function(e) {
        // TODO: Adjust body min-height property so the user is able to scroll to the lowest trigger point
    };

    var _onMousewheel = function(e, delta) {
        // if(delta < 0) {
        //     this.$container.scrollTop($container.scrollTop() + SCROLL_AMOUNT);
        // } else if(delta > 0) {
        //     this.$container.scrollTop($container.scrollTop() - SCROLL_AMOUNT);
        // }
        // return false;
    };
    
    return parallax;
})();