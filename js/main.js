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
    for (let n = 0; n < 10000; n++) {
        let x = Math.floor((width - border * 2) * Math.random() + border);
        let y = Math.floor((height - border * 2) * Math.random() + border);

        let randomFactor = customRandom(x, y);

        let heightIncr = Math.ceil(10 * randomFactor);
        let radius = Math.ceil(70 * randomFactor);

        addHeight(map, heightIncr, radius, x, y);
    }

    // Smooth height map
    let newMap = createMap(0);
    let averageRadius = 10;
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

    // Display map
    function displayMap(map, ctx) {
        map.forEach(function (mapColumn, x) {
            mapColumn.forEach(function (heightValue, y) {
                // Biome color
                if (heightValue < -20) {
                    ctx.fillStyle = 'blue';
                } else if (-20 <= heightValue && heightValue < 0) {
                    ctx.fillStyle = 'cornflowerblue';
                } else if (0 <= heightValue && heightValue < 10) {
                    ctx.fillStyle = 'yellow';
                } else if (10 <= heightValue && heightValue < 20) {
                    ctx.fillStyle = 'sandybrown';
                } else if (20 <= heightValue && heightValue < 200) {
                    ctx.fillStyle = 'forestgreen';
                } else if (200 <= heightValue && heightValue < 500) {
                    ctx.fillStyle = 'green';
                } else if (500 <= heightValue && heightValue < 600) {
                    ctx.fillStyle = 'seagreen';
                } else if (600 <= heightValue && heightValue < 750) {
                    ctx.fillStyle = 'silver';
                } else if (750 <= heightValue) {
                    ctx.fillStyle = 'white';
                }
                ctx.fillRect(x, y, 1, 1);

                // Shadows
                if (heightValue > 0 && map[x - 1] !== undefined && map[x - 1][y] > map[x][y]) {
                    ctx.fillStyle = 'rgba(0,0,0,0.05)';
                    ctx.fillRect(x, y, 1, 1);
                }
                if (heightValue > 0 && map[x][y - 1] !== undefined && map[x][y - 1] > map[x][y]) {
                    ctx.fillStyle = 'rgba(0,0,0,0.05)';
                    ctx.fillRect(x, y, 1, 1);
                }
                if (heightValue > 0 && map[x - 1] !== undefined && map[x - 1][y - 1] !== undefined && map[x - 1][y - 1] > map[x][y]) {
                    ctx.fillStyle = 'rgba(0,0,0,0.05)';
                    ctx.fillRect(x, y, 1, 1);
                }
            })
        });
    }

    displayMap(map, canvas.getContext('2d'));
});
