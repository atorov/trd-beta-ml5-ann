const p5Main = new p5((sketch) => {
    const s = sketch

    const FRAME_RATE = 60
    const PREDICT_PERIOD = 24 * 5 * 4

    s.preload = () => { }

    s.setup = () => {
        s.createCanvas(640, 480)
        s.frameRate(FRAME_RATE)

        s.loadJSON('http://localhost:8080/scripts/data-prep/out/data.json', async ({ data }) => {
            const sma200 = [...Array(199).fill(null), ...window.SMA.calculate({ period: 200, values: data })]
            const ema50 = [...Array(49).fill(null), ...window.EMA.calculate({ period: 50, values: data })]
            const ema20 = [...Array(19).fill(null), ...window.EMA.calculate({ period: 20, values: data })]
            const ema8 = [...Array(7).fill(null), ...window.EMA.calculate({ period: 8, values: data })]
            const rsi = [...Array(10).fill(null), ...window.RSI.calculate({ period: 10, values: data })]

            const trainingData = data
                .map((value, valueIndex) => ({
                    value,
                    sma200: sma200[valueIndex],
                    ema50: ema50[valueIndex],
                    ema20: ema20[valueIndex],
                    ema8: ema8[valueIndex],
                    rsi: rsi[valueIndex],
                }))
                .filter((entry) => !Object.values(entry).some((value) => value === null))

            const neuralNetwork = ml5.neuralNetwork({
                inputs: 5, // 10, // 1,
                outputs: 1,
                task: 'regression',
                // learningRate: 0.33,
                debug: true,
            })

            for (let i = 1; i < trainingData.length - PREDICT_PERIOD; i++) {
                const inputs = [
                    // trainingData[i - 1].sma200,
                    trainingData[i].sma200,

                    // trainingData[i - 1].ema50,
                    trainingData[i].ema50,

                    // trainingData[i - 1].ema20,
                    trainingData[i].ema20,

                    // trainingData[i - 1].ema8,
                    trainingData[i].ema8,

                    // trainingData[i].value,

                    // trainingData[i - 1].rsi,
                    trainingData[i].rsi,
                ]
                // const outputs = [trainingData[i].value - Math.min(...trainingData.slice(i, i + PREDICT_PERIOD).map(({ value }) => value))]
                const outputs = [(trainingData[i].value - Math.min(...trainingData.slice(i, i + PREDICT_PERIOD).map(({ value }) => value))) / trainingData[i].value]
                // const outputs = [Math.random()]
                neuralNetwork.addData(inputs, outputs)
            }

            neuralNetwork.data.normalize()
            console.log('::: nn', neuralNetwork)

            neuralNetwork.train({
                // batchSize: 128,
                // epochs: 132,
            }, (/* epoch, loss */) => {
                // console.log('training:', epoch, loss)
            }, () => {
                console.log('Done!')
                // neuralNetwork.predict([ ... ], (err, results) => {
                //     console.log('::: Results:', results)
                // })
            })
        })

        s.noLoop()
    }

    s.draw = async () => {
        // ---------------------------------------------------------------------
        s.background(0)

        s.strokeWeight(1)
        s.stroke(127)
        s.noFill()
        s.rect(0, 0, s.width, s.height)

        // ---------------------------------------------------------------------
        // TODO: ...
    }
}, 'p5-main')

window.p5Main = p5Main
