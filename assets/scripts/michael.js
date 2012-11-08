
var linearEasingFunction = function(p) {
    return p;
};

var parallaxContainer = document.getElementById('parallax-container');

var tweens = [];
var michaelImageSrc = 'assets/images/michael.png';
var michaelImage = new Image();
var michaelWidth = 0;
michaelImage.src = michaelImageSrc;
michaelImage.onload = function() {
    michaelWidth = michaelImage.width;
    spawnMichaels();
    parallax.init();
}

var spawnMichaels = function() {
    var numMichaels = 10;
    
    for (var i = 0; i < numMichaels; i++) {
        var michael = document.createElement('image');
        var z = Math.round(Math.random() * 100);
        michael.src = michaelImageSrc;
        michael.className = 'michael';
        michael.style.zIndex = z;
        michael.style.width = michaelWidth * (z / 50) + 'px';
        michael.style.top = Math.random() * 800 + 1000 + 'px';
        michael.style.left = Math.random() * 100 - 20 + '%';
        parallaxContainer.appendChild(michael);
        new parallax.Tween(
            michael,
            'top',
            michael.style.top,
            parseInt(michael.style.top) - (z - z / 2) * 50 + 'px',
            0,
            900,
            linearEasingFunction
        );
    }
}