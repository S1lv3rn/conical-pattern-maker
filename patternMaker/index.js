const form = document.querySelector('form'),
      errorMessage = document.getElementById("errorMessage"),
      download = document.getElementById("download");
const X = 0, Y = 1;
var centre = [],
    cirHeights = [],
    scale = 20,
    angles = [0, 0]
    zeroCoord = [0 , 0];

var bustStart = [],
    waistStart = [],
    bustEnd = [],
    waistEnd = [];
var canvas, ctx, b = 81, w = 66, i = 18;

var tempMinX, tempMinY, tempMaxY;

window.onload = function () {
  canvas  = document.getElementById('c');
  ctx     = canvas.getContext('2d');

  makePattern();
};

form.onsubmit = (event) => {
  console.console.log("Hi");
  event.preventDefault();
  b = parseFloat(document.getElementById('Braw').value);
  w = parseFloat(document.getElementById('Wraw').value);
  i = parseFloat(document.getElementById('Iraw').value);

  console.log(b, w, i);

  if (isNaN(b) || isNaN(w) || isNaN(i)) {
    errorMessage.innerHTML = "Please enter numbers";

  } else if (b <= 0 || w <= 0 || i <= 0) {
    errorMessage.innerHTML = "Please enter positive measurements";

  } else if (b <= w || b-w <= 0.001) {
    errorMessage.innerHTML = "Bust value must be more than waist value (if bust is the same as waist, add 0.01 to bust)";

  } else {
    errorMessage.innerHTML = "";
    makePattern();
  }
  //

}

function makePattern() {
  let tempX = 1000;
  let tempY = 400;
  zeroCoord = [tempX/2, 50];

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#000000';

  calculateShape();
  drawShape();
  resizeCanvas();
  makeFile();
}

function makeFile() {
  let dataURL = canvas.toDataURL("image/png");
  window.URL = window.webkitURL || window.URL;

  let contentType = 'image/png';

  //var pngFile = new Blob([myImage], {type: contentType});

  var a = document.createElement('a');
  a.download = 'conicalPattern.png';
  a.href = dataURL;
  a.textContent = 'Download PNG';

  a.dataset.downloadurl = [contentType, a.download, a.href].join(':');

  document.getElementById("downloaded").appendChild(a);
}

function resizeCanvas() {
  let min = [];
  let max = [];

  min[X] = Math.floor(Math.min(bustEnd[X], waistEnd[X], tempMinX));
  min[Y] = Math.floor(Math.min(bustEnd[Y], waistStart[Y], tempMinY));

  zeroCoord[X] = (waistStart[X] - min[X]) + 50;
  zeroCoord[Y] = (waistStart[Y] - min[Y]) + 50;

  calculateShape();
  drawShape();

  max[X] = bustStart[X];
  max[Y] = Math.max(bustEnd[Y], tempMaxY);

  tempX = Math.floor(max[X] + 50);
  tempY = Math.floor(max[Y] + 50);

  canvas.width = tempX;
  canvas.height = tempY;
  drawShape();
}

function calculateShape() {
  let bust = b/2;
  let waist = w/2;
  let inbetween = i;

  waistStart = [zeroCoord[X], zeroCoord[Y]];
  bustStart = [waistStart[X] + (inbetween*scale), waistStart[Y]];

  // draw line for B and W
  let wTemp = [waistStart[X], waistStart[Y] + (waist*scale)];
  let bTemp = [bustStart[X], bustStart[Y] + (bust*scale)];

  //find x-intercept for arc centre
  let m = (wTemp[Y]-bTemp[Y])/(wTemp[X]-bTemp[X]);
  centre = [(zeroCoord[Y]-bTemp[Y])/m + bTemp[X], zeroCoord[Y]];

  //find r of circle
  let radius = waistStart[X] - centre[X];
  angles[1] = (bust*scale)/radius;

  //diameter of circle
  cirHeights = [radius, (radius+inbetween*scale)];

  //final line
  bustEnd = [centre[X]+((radius+(inbetween*scale))*Math.cos(angles[1])),
             centre[Y]+((radius+(inbetween*scale))*Math.sin(angles[1]))];
  waistEnd = [centre[X] + (radius*Math.cos(angles[1])),
              centre[Y] + (radius*Math.sin(angles[1]))];
}

function drawShape() {
  ctx.lineWidth = 1;
  // ctx.fillStyle = "#FF0000";
  // ctx.fillRect(0, 0, tempX, 100);
  // ctx.stroke();
  ctx.strokeStyle = '#DCDCDC';


  for (let i = 0; i < canvas.width; i = i+scale) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i < canvas.height; i = i+scale) {
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.arc(centre[X], centre[Y], cirHeights[0], angles[0], angles[1]);
  ctx.stroke();

  ctx.moveTo(waistStart[X], waistStart[Y]);
  ctx.lineTo(bustStart[X], bustStart[Y]);
  ctx.stroke();


  ctx.beginPath();
  ctx.arc(centre[X], centre[Y], cirHeights[1], angles[0], angles[1]);

  if (ctx.isPointInPath(centre[X]-cirHeights[1], centre[Y])) tempMinX = centre[X]-cirHeights[1];
  else tempMinX = bustStart[X];

  if (ctx.isPointInPath(centre[X], centre[Y]-cirHeights[1])) tempMinY = centre[Y]-cirHeights[1];
  else tempMinY = bustStart[Y];

  if (ctx.isPointInPath(centre[X], centre[Y]+cirHeights[1])) tempMaxY = centre[Y]+cirHeights[1];
  else tempMaxY = bustStart[Y];

  ctx.stroke();


  ctx.moveTo(waistEnd[X], waistEnd[Y]);
  ctx.lineTo(bustEnd[X], bustEnd[Y]);
  ctx.stroke();
}

// let temp = [centre[X] + radius + (inbetween*scale), centre[Y]]
//   ctx.moveTo(temp[X], temp[Y]);
//   ctx.lineTo(temp[X], temp[Y]-40);
//   ctx.stroke();
