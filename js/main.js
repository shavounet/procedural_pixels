require(['map'], function (Map) {
    let canvas = document.getElementById('main-canvas');
    let newCanvas = document.getElementById('secondary-canvas');

    canvas.width = window.innerWidth - 10;
    canvas.height = window.innerHeight - 10;
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;

    const width = Math.ceil(canvas.width);
    const height = Math.ceil(canvas.height);

    console.log('Width', width, 'Height', height);

    let map = Map.create(width, height);


    // Allow to change the shape
    function customRandom(x, y) {
        let xDist = (x - width / 2) / 15;
        let yDist = (y - height / 2) / 15;
        let centerDist = Math.hypot(x - width / 2, y - height / 2) / 400;
        let centerFactor = 0.2 + centerDist ** 2 / (1 + centerDist ** 6);
        let xFactor = xDist ** 2 / (1 + xDist ** 2);
        let yFactor = yDist ** 2 / (1 + yDist ** 2);

        return Math.random() * centerFactor * xFactor * yFactor;
    }

    // Pop height everywhere
    let border = 100;
    console.log('Starting to add height everywhere', window.performance.now());
    for (let n = 0; n < 10000; n++) {
        let x = Math.floor((width - border * 2) * Math.random() + border);
        let y = Math.floor((height - border * 2) * Math.random() + border);

        let randomFactor = customRandom(x, y);

        let heightIncr = Math.ceil(10 * randomFactor);
        let radius = Math.ceil(70 * randomFactor);

        map.addPyramidalHeight(heightIncr, radius, x, y);
    }
    console.log('Added height everywhere', window.performance.now());

    // Smooth height map
    console.log('Starting smoothing', window.performance.now());
    map.smooth(10);
    console.log('Smoothing done', window.performance.now());

    // Display map
    function displayMap(map, ctx) {
        let biomeImage = ctx.createImageData(width, height);
        let shadowImage = ctx.createImageData(width, height);

        map.forEach(function (heightValue, x, y) {
            let currentIndex = (x + y * width) * 4;

            // Biome color - see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
            let biomeColor = map.getBiomeColor(x, y);
            biomeColor.forEach((value, i) => biomeImage.data[currentIndex + i] = value);
            biomeImage.data[currentIndex + 3] = 255;

            // Shadows
            shadowImage.data[currentIndex + 3] = map.getShadowAlpha(x, y);
        });

        ctx.putImageData(biomeImage, 0, 0);

        // Use a temporary canvas to draw shadows (will not work using putImageData : https://stackoverflow.com/a/5292658)
        let shadowTmpCanvas = document.createElement('canvas');
        shadowTmpCanvas.width = width;
        shadowTmpCanvas.height = height;
        shadowTmpCanvas.getContext('2d').putImageData(shadowImage, 0, 0);
        ctx.drawImage(shadowTmpCanvas, 0, 0);
    }

    console.log('Compute rendering', window.performance.now());
    displayMap(map, canvas.getContext('2d'));
    console.log('Map rendered !', window.performance.now());
});
