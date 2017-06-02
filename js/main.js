require([], function () {
    let canvas = document.getElementById('main-canvas');
    let newCanvas = document.getElementById('secondary-canvas');

    canvas.width = window.innerWidth - 10;
    canvas.height = window.innerHeight - 10;
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;

    const width = Math.ceil(canvas.width);
    const height = Math.ceil(canvas.height);

    console.log('Width', width, 'Height', height);

    // Create object
    function createMap(defaultValue) {
        let map = [];
        let flatValues = new Array(height).fill(defaultValue);
        for (let i = 0; i < width; i++) {
            map.push(flatValues.slice());
        }
        return map;
    }

    let map = createMap(-200);

    // Height addition method
    const heightVariance = 0.05;

    function addHeight(map, height, radius, x, y) {
        if (height > 0 && radius > 0) {
            for (let i = x - radius; i < x + radius; i++) {
                for (let j = y - radius; j < y + radius; j++) {
                    if (map[i] !== undefined && map[i][j] !== undefined) {
                        map[i][j] += Math.round(height * (1 + 2 * (Math.random() - 0.5) * heightVariance));
                    }
                }
            }
            addHeight(map, Math.round(height * 0.8), radius - 1, x, y);
        }
    }

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

        addHeight(map, heightIncr, radius, x, y);
    }
    console.log('Added height everywhere', window.performance.now());

    // Smooth height map
    let newMap = createMap(0);
    let averageRadius = 10;
    console.log('Starting smoothing', window.performance.now());
    map.forEach(function (mapColumn, x) {
        mapColumn.forEach(function (heightValue, y) {
            if (heightValue > -30) {
                let accumulator = 0;
                let size = 0;
                for (let i = x - averageRadius; i <= x + averageRadius; i++) {
                    for (let j = y - averageRadius; j <= y + averageRadius; j++) {
                        if (map[i] !== undefined && map[i][j] !== undefined) {
                            accumulator += map[i][j];
                            size++;
                        }
                    }
                }
                newMap[x][y] = Math.floor(accumulator / size);
            } else {
                newMap[x][y] = map[x][y];
            }
        });
    });
    map = newMap;
    console.log('Smoothing done', window.performance.now());

    // Display map
    function displayMap(map, ctx) {
        let biomeImage = ctx.createImageData(width, height);
        let shadowImage = ctx.createImageData(width, height);

        map.forEach(function (mapColumn, x) {
            mapColumn.forEach(function (heightValue, y) {
                let currentIndex = (x + y * width) * 4;

                // Biome color - see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
                let biomeColor = [];
                if (heightValue < -20) {
                    // Blue
                    biomeColor = [0, 0, 255];
                } else if (-20 <= heightValue && heightValue < 0) {
                    // cornflowerblue
                    biomeColor = [100, 149, 237];
                } else if (0 <= heightValue && heightValue < 10) {
                    // yellow
                    biomeColor = [255, 255, 0];
                } else if (10 <= heightValue && heightValue < 20) {
                    // sandybrown
                    biomeColor = [244, 164, 96];
                } else if (20 <= heightValue && heightValue < 200) {
                    // forestgreen
                    biomeColor = [34, 139, 34];
                } else if (200 <= heightValue && heightValue < 500) {
                    // green
                    biomeColor = [0, 128, 0];
                } else if (500 <= heightValue && heightValue < 600) {
                    // seagreen
                    biomeColor = [46, 139, 87];
                } else if (600 <= heightValue && heightValue < 750) {
                    // silver
                    biomeColor = [192, 192, 192];
                } else if (750 <= heightValue) {
                    // white
                    biomeColor = [255, 255, 255];
                }
                biomeColor.forEach((value, i) => biomeImage.data[currentIndex + i] = value);
                biomeImage.data[currentIndex + 3] = 255;

                // Shadows
                if (heightValue > 0 && map[x - 1] !== undefined && map[x - 1][y] > map[x][y]) {
                    shadowImage.data[currentIndex + 3] += 10;
                }
                if (heightValue > 0 && map[x][y - 1] !== undefined && map[x][y - 1] > map[x][y]) {
                    shadowImage.data[currentIndex + 3] += 10;
                }
                if (heightValue > 0 && map[x - 1] !== undefined && map[x - 1][y - 1] !== undefined && map[x - 1][y - 1] > map[x][y]) {
                    shadowImage.data[currentIndex + 3] += 10;
                }
            })
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
