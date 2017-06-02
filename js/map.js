define([], function () {

    const DEFAULT_HEIGHT = -200;
    const PYRAMIDAL_HEIGHT_RATIO = 0.8;
    const PYRAMIDAL_HEIGHT_VARIANCE = 0.05;

    function makeMatrix(xSize, ySize, defaultValue) {
        let map = [];
        let flatValues = new Array(ySize).fill(defaultValue);
        for (let i = 0; i < xSize; i++) {
            map.push(flatValues.slice());
        }
        return map;
    }

    return {
        create: function (xSize, ySize) {
            let map = makeMatrix(xSize, ySize, DEFAULT_HEIGHT);

            function addPyramidalHeight(height, radius, x, y) {
                if (height > 0 && radius > 0) {
                    for (let i = x - radius; i < x + radius; i++) {
                        for (let j = y - radius; j < y + radius; j++) {
                            if (map[i] !== undefined && map[i][j] !== undefined) {
                                map[i][j] += Math.round(height * (1 + 2 * (Math.random() - 0.5) * PYRAMIDAL_HEIGHT_VARIANCE));
                            }
                        }
                    }
                    addPyramidalHeight(Math.round(height * PYRAMIDAL_HEIGHT_RATIO), radius - 1, x, y);
                }
            }

            return {
                addPyramidalHeight: addPyramidalHeight,
                smooth: function (averageRadius) {
                    let newMap = makeMatrix(xSize, ySize);
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
                },
                getBiomeColor: function (x, y) {
                    let biomeColor = [];
                    let heightValue = map[x][y];

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

                    return biomeColor;
                },
                getShadowAlpha: function (x, y) {
                    let heightValue = map[x][y];
                    let value = 0;

                    if (heightValue > 0 && map[x - 1] !== undefined && map[x - 1][y] > map[x][y]) {
                        value += 10;
                    }
                    if (heightValue > 0 && map[x][y - 1] !== undefined && map[x][y - 1] > map[x][y]) {
                        value += 10;
                    }
                    if (heightValue > 0 && map[x - 1] !== undefined && map[x - 1][y - 1] !== undefined && map[x - 1][y - 1] > map[x][y]) {
                        value += 10;
                    }

                    return value;
                },
                forEach: function (callback) {
                    map.forEach(function (mapColumn, x) {
                        mapColumn.forEach(function (heightValue, y) {
                            callback(heightValue, x, y);
                        })
                    });
                }
            }
        }
    };
});
