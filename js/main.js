require(['map'], function (Map) {
    let canvas = document.getElementById('main-canvas');
    let newCanvas = document.getElementById('secondary-canvas');
    let shadowTmpCanvas = document.createElement('canvas');

    canvas.width = window.innerWidth - 10;
    canvas.height = window.innerHeight - 10;
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
    shadowTmpCanvas.width = canvas.width;
    shadowTmpCanvas.height = canvas.height;

    const width = Math.ceil(canvas.width);
    const height = Math.ceil(canvas.height);
    const border = 100;

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

    function applyRandomHeight() {
        let x = Math.floor((width - border * 2) * Math.random() + border);
        let y = Math.floor((height - border * 2) * Math.random() + border);

        let randomFactor = customRandom(x, y);

        let heightIncr = Math.ceil(10 * randomFactor);
        let radius = Math.ceil(70 * randomFactor);

        console.log("applying", heightIncr, radius, x, y);

        map.addPyramidalHeight(heightIncr, radius, x, y);

        return [x - radius, y - radius, x + radius, y + radius];
    }

    // Display map
    function displayMap(map, ctx, updateRect) {
        console.log("drawing", updateRect);
        let biomeImage, shadowImage;

        function updatePixel(x, y, dx, dy) {
            let currentIndex = (x - dx + (y - dy) * biomeImage.width) * 4;

            // Biome color - see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
            let biomeColor = map.getBiomeColor(x, y);
            biomeColor.forEach((value, i) => biomeImage.data[currentIndex + i] = value);
            biomeImage.data[currentIndex + 3] = 255;

            // Shadows
            shadowImage.data[currentIndex + 3] = map.getShadowAlpha(x, y);
        }

        if (!updateRect) {
            biomeImage = ctx.createImageData(width, height);
            shadowImage = ctx.createImageData(width, height);

            map.forEach((heightValue, x, y) => updatePixel(x, y, 0, 0));

            ctx.putImageData(biomeImage, 0, 0);

            // Use a temporary canvas to draw shadows (will not work using putImageData : https://stackoverflow.com/a/5292658)
            shadowTmpCanvas.getContext('2d').putImageData(shadowImage, 0, 0);
            ctx.drawImage(shadowTmpCanvas, 0, 0);
        } else if ((updateRect[2] > updateRect[0]) && (updateRect[3] > updateRect[1])) {
            biomeImage = ctx.createImageData(updateRect[2] - updateRect[0], updateRect[3] - updateRect[1]);
            shadowImage = ctx.createImageData(biomeImage);

            for (let i = updateRect[0]; i < updateRect[2]; i++) {
                for (let j = updateRect[1]; j < updateRect[3]; j++) {
                    updatePixel(i, j, updateRect[0], updateRect[1]);
                }
            }

            ctx.putImageData(biomeImage, updateRect[0], updateRect[1]);

            // Use a temporary canvas to draw shadows (will not work using putImageData : https://stackoverflow.com/a/5292658)
            shadowTmpCanvas.getContext('2d').putImageData(shadowImage, 0, 0);
            ctx.drawImage(shadowTmpCanvas, 0, 0, shadowImage.width, shadowImage.height, updateRect[0], updateRect[1], shadowImage.width, shadowImage.height);
        }
    }

    function mainLoop() {
        let updatedRect = applyRandomHeight();
        //map.smooth(1);
        displayMap(map, canvas.getContext('2d'), updatedRect);

        window.requestAnimationFrame(mainLoop);
    }

    displayMap(map, canvas.getContext('2d'));
    mainLoop();
});
