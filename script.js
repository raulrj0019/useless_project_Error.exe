/* ============================================================
   VOICE VOLUME CONTROLLER
   FRONTEND DEMO
   ============================================================ */


/* ============================================================
   SETTINGS
   ============================================================ */

const DEMO_MODE = true;

const UPDATE_INTERVAL = 800;

const MAX_GRAPH_POINTS = 80;


/* ============================================================
   STATE
   ============================================================ */

let currentState = "NORMAL";

let previousState = "NORMAL";

let eventCount = 0;

let graphData = [];



/* ============================================================
   DOM
   ============================================================ */

const dbValue = document.getElementById("dbValue");

const differenceValue =
    document.getElementById("differenceValue");

const volumeValue =
    document.getElementById("volumeValue");

const dbMeter =
    document.getElementById("dbMeter");

const differenceStatus =
    document.getElementById("differenceStatus");

const differenceIndicator =
    document.getElementById("differenceIndicator");

const volumeProgress =
    document.getElementById("volumeProgress");

const heroState =
    document.getElementById("heroState");

const heroDescription =
    document.getElementById("heroDescription");

const stateBox =
    document.getElementById("stateBox");

const stateName =
    document.getElementById("stateName");

const stateText =
    document.getElementById("stateText");

const stateIcon =
    document.getElementById("stateIcon");

const noiseLevel =
    document.getElementById("noiseLevel");

const normalLevel =
    document.getElementById("normalLevel");

const activityLog =
    document.getElementById("activityLog");

const eventCountElement =
    document.getElementById("eventCount");

const connectionText =
    document.getElementById("connectionText");



/* ============================================================
   GRAPH
   ============================================================ */

const canvas =
    document.getElementById("audioGraph");

const ctx =
    canvas.getContext("2d");


function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    canvas.width =
        rect.width * window.devicePixelRatio;

    canvas.height =
        rect.height * window.devicePixelRatio;

    ctx.scale(
        window.devicePixelRatio,
        window.devicePixelRatio
    );
}


window.addEventListener(
    "resize",
    resizeCanvas
);


resizeCanvas();



function drawGraph() {

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    if (graphData.length < 2) {
        return;
    }


    /*
        Convert dB range:

        -60 dB → bottom
        0 dB   → top
    */

    const minDb = -60;
    const maxDb = 0;


    ctx.beginPath();


    graphData.forEach((db, index) => {

        const x =
            (index / (MAX_GRAPH_POINTS - 1))
            * width;


        const clamped =
            Math.max(
                minDb,
                Math.min(maxDb, db)
            );


        const normalized =
            (clamped - minDb)
            / (maxDb - minDb);


        const y =
            height -
            normalized * height;


        if (index === 0) {

            ctx.moveTo(x, y);

        } else {

            ctx.lineTo(x, y);

        }

    });


    ctx.lineWidth = 2;

    ctx.strokeStyle = "#62e6a7";

    ctx.shadowBlur = 8;

    ctx.shadowColor = "rgba(98,230,167,0.5)";

    ctx.stroke();


    ctx.shadowBlur = 0;


    /*
        Fill below graph
    */

    ctx.lineTo(width, height);

    ctx.lineTo(0, height);

    ctx.closePath();


    ctx.fillStyle =
        "rgba(98,230,167,0.06)";

    ctx.fill();

}



/* ============================================================
   STATE INFORMATION
   ============================================================ */

function getStateDescription(state) {

    switch (state) {

        case "SILENCE":
            return {
                description:
                    "Background noise detected.",
                text:
                    "No volume adjustment required.",
                colorClass:
                    "silence",
                icon:
                    "○"
            };


        case "QUIET":
            return {
                description:
                    "Voice is quieter than the reference level.",
                text:
                    "Increasing system volume.",
                colorClass:
                    "quiet",
                icon:
                    "↑"
            };


        case "LOUD":
            return {
                description:
                    "Voice is significantly louder than normal.",
                text:
                    "Reducing system volume.",
                colorClass:
                    "loud",
                icon:
                    "↓"
            };


        default:
            return {
                description:
                    "Voice level is within the normal range.",
                text:
                    "No volume adjustment required.",
                colorClass:
                    "normal",
                icon:
                    "●"
            };

    }

}



/* ============================================================
   UPDATE STATE UI
   ============================================================ */

function updateState(state) {

    const info =
        getStateDescription(state);


    currentState = state;


    heroState.textContent =
        state;

    heroState.className =
        `hero-state ${info.colorClass}`;


    heroDescription.textContent =
        info.description;


    stateBox.className =
        `state-box ${info.colorClass}`;


    stateName.textContent =
        state;


    stateText.textContent =
        info.text;


    stateIcon.textContent =
        info.icon;


    /*
        Log state change
    */

    if (
        previousState !== state &&
        previousState !== null
    ) {

        addActivity(
            state
        );

    }


    previousState = state;

}



/* ============================================================
   ACTIVITY LOG
   ============================================================ */

function addActivity(state) {

    eventCount++;

    eventCountElement.textContent =
        `${eventCount} event${eventCount === 1 ? "" : "s"}`;


    const empty =
        activityLog.querySelector(".empty-log");


    if (empty) {
        empty.remove();
    }


    const item =
        document.createElement("div");

    item.className =
        "activity-item";


    const left =
        document.createElement("div");

    left.className =
        "activity-left";


    const dot =
        document.createElement("span");

    dot.className =
        "activity-dot";


    if (state === "LOUD") {

        dot.style.background =
            "#ff6577";

    } else if (state === "QUIET") {

        dot.style.background =
            "#62a8ff";

    } else if (state === "NORMAL") {

        dot.style.background =
            "#62e6a7";

    } else {

        dot.style.background =
            "#68717d";

    }


    const text =
        document.createElement("span");

    text.textContent =
        `State changed to ${state}`;


    left.appendChild(dot);

    left.appendChild(text);


    const time =
        document.createElement("span");

    time.className =
        "activity-time";

    time.textContent =
        new Date().toLocaleTimeString();


    item.appendChild(left);

    item.appendChild(time);


    activityLog.prepend(item);


    /*
        Keep only latest 20 events
    */

    while (
        activityLog.children.length > 20
    ) {

        activityLog.removeChild(
            activityLog.lastChild
        );

    }

}



/* ============================================================
   UPDATE DASHBOARD
   ============================================================ */

function updateDashboard(data) {

    const db =
        Number(data.db);


    const difference =
        Number(data.difference);


    const volume =
        Number(data.volume);


    /*
        dB
    */

    dbValue.textContent =
        db.toFixed(1);


    /*
        Convert -60 → 0 dB
        into 0 → 100%
    */

    const dbPercent =
        Math.max(
            0,
            Math.min(
                100,
                ((db + 60) / 60) * 100
            )
        );


    dbMeter.style.width =
        `${dbPercent}%`;



    /*
        Difference
    */

    const sign =
        difference >= 0
            ? "+"
            : "";


    differenceValue.textContent =
        `${sign}${difference.toFixed(1)}`;


    if (difference < -4) {

        differenceStatus.textContent =
            "Below normal voice level";

    } else if (difference > 8) {

        differenceStatus.textContent =
            "Above loud threshold";

    } else {

        differenceStatus.textContent =
            "Within normal range";

    }


    /*
        Difference indicator

        -20 dB → left
        +20 dB → right
    */

    const differencePercent =
        Math.max(
            0,
            Math.min(
                100,
                ((difference + 20) / 40) * 100
            )
        );


    differenceIndicator.style.left =
        `${differencePercent}%`;



    /*
        Volume
    */

    volumeValue.textContent =
        Math.round(volume);


    /*
        SVG circle

        circumference ≈ 301.6
    */

    const circumference =
        301.6;


    const offset =
        circumference -
        (volume / 100) * circumference;


    volumeProgress.style.strokeDashoffset =
        offset;



    /*
        Calibration
    */

    if (data.noise_level !== undefined) {

        noiseLevel.textContent =
            `${Number(data.noise_level).toFixed(1)} dB`;

    }


    if (data.normal_level !== undefined) {

        normalLevel.textContent =
            `${Number(data.normal_level).toFixed(1)} dB`;

    }



    /*
        State
    */

    updateState(data.state);



    /*
        Graph
    */

    graphData.push(db);


    if (
        graphData.length >
        MAX_GRAPH_POINTS
    ) {

        graphData.shift();

    }


    drawGraph();

}



/* ============================================================
   DEMO DATA
   ============================================================ */

function generateDemoData() {

    /*
        Generate a natural-looking
        microphone signal.

        This is ONLY for the frontend
        while the Python controller
        isn't connected yet.
    */


    const time =
        Date.now() / 1000;


    const wave =
        Math.sin(time * 1.3) * 3;


    const wave2 =
        Math.sin(time * 3.7) * 1.5;


    const random =
        (Math.random() - 0.5) * 3;


    const db =
        -25 +
        wave +
        wave2 +
        random;


    const normal =
        -24;


    const difference =
        db - normal;


    let state;


    if (db < -33) {

        state = "SILENCE";

    } else if (difference < -4) {

        state = "QUIET";

    } else if (difference > 8) {

        state = "LOUD";

    } else {

        state = "NORMAL";

    }


    /*
        Slowly vary volume
        for demonstration.
    */

    const volume =
        50 +
        Math.sin(time * 0.25) * 10;


    return {

        db: db,

        difference: difference,

        state: state,

        volume: volume,

        noise_level: -36,

        normal_level: normal,

        running: true

    };

}



/* ============================================================
   CONNECTED DATA
   ============================================================ */

async function getRealData() {

    /*
        LATER:

        Replace the URL below with
        your Python API.

        Example:

        const response =
            await fetch(
                "https://your-api.com/api/status"
            );

        return await response.json();
    */


    const response =
        await fetch(
            "http://127.0.0.1:5000/api/status",
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            "API request failed"
        );

    }


    return await response.json();

}



/* ============================================================
   MAIN UPDATE LOOP
   ============================================================ */

async function update() {

    try {

        let data;


        if (DEMO_MODE) {

            /*
                Currently using
                demonstration data.
            */

            data =
                generateDemoData();

        } else {

            /*
                Real Python controller
            */

            data =
                await getRealData();

        }


        updateDashboard(data);


        connectionText.textContent =
            DEMO_MODE
                ? "Demo Mode"
                : "System Active";


    } catch (error) {

        console.error(error);


        connectionText.textContent =
            "Disconnected";

    }

}



/* ============================================================
   START
   ============================================================ */

update();


setInterval(
    update,
    UPDATE_INTERVAL
);