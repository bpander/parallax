
var linearEasingFunction = function(p) {
    return p;
};

var elasticEasingFunction = function(p) {
    var ps = p * p;
    var pc = p * ps;
    return 33 * pc * ps + -106 * ps * ps + 126 * pc + -67 * ps + 15 * p;
};

var pizza = document.getElementById('pizza');
var pizzaBox = document.getElementById('pizza-box');

var pizzaTweens = [
    new parallax.Tween(
        pizza,
        'left',
        '0px',
        '300px',
        20,
        420
    ),
    new parallax.Tween(
        pizza,
        'top',
        '0px',
        '50px',
        20,
        220
    ),
    new parallax.Tween(
        pizza,
        'top',
        '50px',
        '0px',
        220,
        420
    ),
    new parallax.Tween(
        pizza,
        'left',
        '300px',
        '0px',
        420,
        820,
        linearEasingFunction
    )
];

var pizzaBoxSwitches = [
    new parallax.Switch(
        pizzaBox,
        'position',
        'fixed',
        'relative',
        820
    ),
    new parallax.Switch(
        pizzaBox,
        'top',
        '0px',
        '820px',
        820
    )
];

var surprise = new parallax.Tween(
    document.getElementById('ostrich'),
    'height',
    '0px',
    '1100px',
    950,
    1500,
    elasticEasingFunction
);

parallax.init();