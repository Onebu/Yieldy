const os = require("os");
const request = require('request');
var nmap = require('node-nmap');

nmap.nmapLocation = "nmap"; //default


let cpuUsage = null;

//Create function to get CPU information
function cpuAverage() {
  //Initialise sum of idle and time of cores and fetch CPU info
  var totalIdle = 0, totalTick = 0;
  var cpus = os.cpus();
  //Loop through CPU cores
  for (var i = 0, len = cpus.length; i < len; i++) {
    //Select CPU core
    var cpu = cpus[i];
    //Total up the time in the cores tick
    for (type in cpu.times) {
      totalTick += cpu.times[type];
    }
    //Total up the idle time of the core
    totalIdle += cpu.times.idle;
  }
  //Return the average Idle and Tick times
  return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}

// function to calculate average of array
const arrAvg = function (arr) {
  if (arr && arr.length >= 1) {
    const sumArr = arr.reduce((a, b) => a + b, 0)
    return sumArr / arr.length;
  }
};

// load average for the past 1000 milliseconds calculated every 100
function getCPULoadAVG(avgTime = 1000, delay = 100) {
  return new Promise((resolve, reject) => {
    const n = ~~(avgTime / delay);
    if (n <= 1) {
      reject('Error: interval to small');
    }
    let i = 0;
    let samples = [];
    const avg1 = cpuAverage();
    let interval = setInterval(() => {
      if (i >= n) {
        clearInterval(interval);
        resolve(~~((arrAvg(samples) * 100)));
      }
      const avg2 = cpuAverage();
      const totalDiff = avg2.total - avg1.total;
      const idleDiff = avg2.idle - avg1.idle;
      samples[i] = (1 - idleDiff / totalDiff);
      i++;
    }, delay);
  });
}

if (process.argv.slice(2).length < 2) {
  process.exit(-1);
}

getCPULoadAVG(1000, 100).then((avg) => {
  cpuUsage = avg;
});

var requestLoop = setInterval(function () {
  //    Accepts array or comma separated string of NMAP acceptable hosts
  var quickscan = new nmap.NmapScan(process.argv.slice(2)[1]);

  quickscan.on('complete', function (data) {
    request.post(
      'https://yieldyapi.herokuapp.com/status',
      {
        json: {
          arch: os.arch(),
          cores: os.cpus().length,
          cpuusage: cpuUsage,
          memusage: 1 - (os.freemem() / os.totalmem()),
          platform: os.platform(),
          release: os.release(),
          uptime: os.uptime(),
          statuscode: process.argv.slice(2)[0],
          openedPort: data[0].openPorts
        }
      },
      (error, res, body) => {
        if (error) {
          console.error(error)
          return
        }
        console.log(`statusCode: ${res.statusCode}`)
        console.log("Uploaded")
      }
    )
  });

  quickscan.on('error', function (error) {
    console.log(error);
  });

  quickscan.startScan();
}, 60000);
