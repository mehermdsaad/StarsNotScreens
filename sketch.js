let allowOnlyOnIpad = true;

let stars = [];
let focusX;
let focusY;
let focusZ = 0;

let touchX = 0;

let permissionGranted = false;
let screenNormalVector;

let orientAlpha = 0;
let orientBeta = 0;
let orientGamma = 0;

let angA = 0;
let angB = 0;
let angG = 0;

let startAngA;
let startAngB;
let targetAngA;
let targetAngB;
let lastTimeAChanged;
let lastTimeBChanged;
let intAngA;
let intAngB;

let angOffset = -20;

const starRadius = 600;
const bgStarRadius = 700;

let latitude = 0;

let debug = false;

const DEG = Math.PI/180;

let starData;

let initImages=[];
let loopImages=[];
let img;

let imgState = 0; // 0 is default, 1 is init, 2 is loop, 3 is exit
let imgIndex = 0;
let imgDir = 1;
let imgInitSpd = 4;
let imgLoopSpd = 2;
let imgLoopFramesLeft = -1;

let sfxMusic;
let sfxNoise;

let noiseText=[];
let starText;
let imgText;
let textInd = 0;
let lastNoiseTextDisplayed = 0;
let lastStarTextDisplayed = 0;

function preload() {
  starData = loadJSON('data/stars.json');
  for(let i=0;i<80;i++){
    if(i<45){
    img = loadImage(`init_res/Scroll_Init_Res_${i}.png`);
    initImages.push(img);
    }
    else{
    img = loadImage(`loop_res/Scroll_Loop_Res_${i}.png`); 
    loopImages.push(img);
    }
  }
  
  for(let i=0;i<67;i++){
    if(i<66){
      imgText = loadImage(`text/Text1_${i}.png`); 
      noiseText.push(imgText);
    }
    else{
      starText = loadImage(`text/Text2.png`);
    }
  }
  
  sfxMusic = loadSound("audio/interstellar.mp3");
  sfxNoise = loadSound("audio/noise.mp3");
  
  sfxMusic.setVolume(0.5);
  sfxNoise.setVolume(0.4);
}



function setup() {
  // saveStarData();
  loadStarsFromFile();
  // saveStarDataFromBrightness();
  // let coord = convertCoordinates("05h 14m 32.27s","−08° 12′ 05.9″");
  // console.log(coord);

  startAngA=0;
  startAngB=0;
  targetAngA=0;
  targetAngB=0;
  lastTimeAChanged=0;
  lastTimeBChanged=0;
  intAngA=0;
  intAngB=0;
  
  
  
  // createCanvas(displayWidth, displayHeight,WEBGL);
  createCanvas(windowWidth, windowHeight,WEBGL);
  
  
  storedCamera = createCamera();
  // createCanvas(displayWidth, displayHeight);
  frameRate(30);
  
  if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude = position.coords.latitude.toFixed(6);
      // console.log(position);
    }
  )}
  
  
  // DEVICE ORIENTATION
  // Explicitly request device orientation permissions
  
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    // Create a button to request permission
    let permissionButton = createButton('Start!');
    
    permissionButton.size(200, 60);
    permissionButton.style('font-size', '20px');
    permissionButton.style('margin', '0 auto');
    permissionButton.position(width/2-100,height/2-30);
    permissionButton.mousePressed(()=>{
      requestDevicePermission();
      permissionButton.remove();
    });
    noLoop();
  } else {
    // For browsers that don't require explicit permission
    window.addEventListener('deviceorientation', handleOrientation, true);
    window.addEventListener('devicemotion', handleMotion);
    
    console.log("This was intended to work on iPad only, it will not work in other devices (for now)!")
    if(allowOnlyOnIpad)noLoop();
  }
  
}

class Star{
  constructor(rad,thetaX,thetaZ,coord={},star_size=-1,polaris=false){
    this.rad=rad;
    this.thetaX=thetaX;
    this.thetaZ=thetaZ;
    this.w = 4;//random(0.05,0.8);
    this.coord=coord;
    this.star_size = star_size;
    this.polaris = polaris;
    
  }
  
  display(){
    
    push();
    noStroke();
    
    if(this.star_size<3.3){
    fill(140,120,255,calculateStarOpacity(this.star_size));
    }
    else{
      fill(110,100,255,calculateStarOpacity(this.star_size));
    }
    if(this.polaris){
      fill(10,150,255,255);
    }
      
    const r = this.rad*Math.cos(this.thetaZ*DEG);
    
    let x,y,z;
    if(Object.entries(this.coord).length!=0){
      x = this.rad*this.coord.x;
      y = this.rad*this.coord.y;
      z = this.rad*this.coord.z;
    }
    else{
      x = r*Math.cos(this.thetaX*DEG);  
      y = this.rad*Math.sin(this.thetaZ*DEG);
      z = r*Math.sin(this.thetaX*DEG);
    }
    
    let rotateTheta = 0.6*frameCount;
    // earth's rotation around it's axis
    [x,y,z]= rotateVector([x,y,z],[0,1,0],rotateTheta);    


    // rotating wrt to the x axis to orient towards the proper  latitude
    [x,y,z] = rotateVector([x,y,z],[1,0,0],-latitude);
 
    
    
    translate(x,y,z);
    // sphere(this.star_size);
    sphere(this.star_size==-1||this.polaris?this.w:calculateStarSize(this.star_size));
    pop();
  }
}


function draw() {
  
  
  background(0,0,20);
 
  
  
  ambientLight(255);  
  
  let angX,angY;
  
  
  // if(abs(targetAngB-angB)>5){
  //   startAngB = intAngB;
  //   targetAngB = angB;
  //   lastTimeBChanged = frameCount;
  // }
  
  // if(frameCount-1>=lastTimeAChanged){
  //   startAngA = intAngA;
  //   targetAngA = angA;
  //   lastTimeAChanged = frameCount;
  // }
  
  
  // console.log("intA: ",intAngA,"angA: ",angA, ",startA: ",startAngA,",TargetA: ",targetAngA);
  
  // intAngB = interpolatePoints([startAngB],[targetAngB],(frameCount-lastTimeBChanged)/30)[0];
  // intAngA = interpolatePoints([startAngA],[targetAngA],(frameCount-lastTimeAChanged)/1)[0];

  
  intAngA = angA;//+frameCount;
  intAngB = angB;//+frameCount;
  
  angX = -90+intAngB;
  angY = -90+intAngA;
  
  upVal = ((intAngA>(90+angOffset))&&(intAngA<(270-angOffset)))?0:1;


  let focusX = Math.cos(angY*DEG)*Math.cos(angX*DEG);
  let focusY = Math.sin(angY*DEG);
  let focusZ = Math.cos(angY*DEG)*Math.sin(angX*DEG);
  
  angX-=90;
  let refX = Math.cos((angX)*DEG);
  let refY = 0;//Math.sin(angX*DEG);
  let refZ = Math.sin((angX)*DEG);
  
  let [upX,upY,upZ]=crossProduct([focusX,focusY,focusZ],[refX,refY,refZ]);
  
  // [upX,upY,upZ] = rotateVector([upX,upY,upZ],[focusX,focusZ,focusZ],constrain(angG,-30,30)==30||constrain(angG,-30,30)==-30?0:angG);
  
  if(debug){
    resetMatrix();
    // debugMode();
    orbitControl();
    if (true){
    drawLine(focusX,focusY,focusZ,500);
    drawLine(refX,refY,refZ,200,[0,255,0]);
    drawLine(upX,upY,upZ,200,[255,0,0]);
      }
  }
  else{
    
    resetMatrix();
    camera(0,0,0,focusX,focusY,focusZ,-upX,-upY,-upZ);
    let viewAng = map(upVal,0,1,PI/8,PI/3)
    viewAng = PI/3;
    perspective(viewAng, width/height, 0.01, 1000);
  }
  
  
  if(false){
  
  push();

  for(let i=0;i<360;i+=15){
    push();
    translate(100*Math.cos(i*Math.PI/180),0,100*Math.sin(i*Math.PI/180));
    strokeWeight(0.5);
    stroke(200);
  
    fill(200,0,255,150);
    box(20);
    pop();
  }
  pop();
  }
  
  stars.forEach(s=>s.display());
  
  if(true){
  push();
  translate(0,0,0);
  
  // rotate the plane so that it always follows the camera
    // for now
  rotateY(-angX*DEG);
  rotateX(-(180+angY)*DEG);
  translate(0,0,-200);

    
  let planeWidth = 190;//map(upVal,0,1,1000,500);
  let planeHeight = 240;//map(upVal,0,1,1000,500);

    
  let op = upVal>0.5?255:0;
  fill(100,0,150,op);
    
    
    
  // Handle video state by image frames variable manipulation
  if(imgState==0 && upVal==1){
    imgState=1;
    imgIndex = 0;
    imgDir = 1;
    imgInitSpd = 4;
    if(!sfxNoise.isPlaying()){
      sfxNoise.loop();
    }
    if(sfxMusic.isPlaying()){
      sfxMusic.pause();   
    }
    
    textInd = 0;
  }
  if(imgState==1 && imgDir==1 &&upVal==0){
    imgDir = -1;
    imgInitSpd = 6;
  }
  if(imgState==1 && imgDir==-1 && imgIndex+imgInitSpd*imgDir<0){
    imgState = 0;
    imgIndex = 0;
    imgDir = 1;
    imgInitSpd = 2;
    
    
    if(sfxNoise.isPlaying()){
      sfxNoise.pause();   
    }
    if(!sfxMusic.isPlaying()){
      sfxMusic.loop();   
    }
  }
  if(imgState==1 && imgDir==1 && imgIndex>=initImages.length-1){
    imgState = 2;
    imgIndex = 0;
    imgLoopSpd = 2;
  }
    
    
  if(imgState==2 && imgDir==1 && upVal==0){
    imgState = 1;
    imgDir = -1;
    imgIndex = initImages.length;
    imgLoopSpd = 2;
    imgInitSpd = 6;
  }
    

    
  // console.log("imgState:",imgState,"dir:",imgDir,"show?:",upVal,"ind:",imgIndex);
  if(imgState==1){
    imgIndex+=imgInitSpd*imgDir;
  }
  if(imgState==2){
    imgIndex+=imgLoopSpd*imgDir;
  }
    
  
  if(imgState==1)texture(initImages[(imgIndex)%initImages.length]);
  if(imgState==2)texture(loopImages[(imgIndex)%loopImages.length]);
    
  if(imgState==1 || imgState==2){
    if(!sfxNoise.isPlaying()){
      sfxNoise.loop();
    }
    
  }
    
  if(!sfxNoise.isPlaying() && !sfxMusic.isPlaying()){
    sfxMusic.loop();
  }
  
    
    
  // Enable transparency for the entire texture
  textureMode(NORMAL);
  noStroke();
  plane(planeWidth,planeHeight);
    
  if(imgState==1||imgState==2){
    if(frameCount-lastNoiseTextDisplayed>15){
      textInd+=4;
      texture(noiseText[textInd%noiseText.length]);
      translate(0,30,100);
      plane(planeWidth*0.15,planeHeight*0.15);
      if((textInd%noiseText.length+4)>=noiseText.length){
        lastNoiseTextDisplayed = frameCount;
      }
    }
    lastStarTextDisplayed=frameCount;
  }
  else{
    if(frameCount-lastStarTextDisplayed>=5){
      
      let transitionOpacity = 255;
      if(frameCount-lastStarTextDisplayed<20){
         transitionOpacity = constrain(map(frameCount-lastStarTextDisplayed,5,10,0,255),0,255);
      }else if(frameCount-lastStarTextDisplayed>70){
        transitionOpacity = constrain(map(frameCount-lastStarTextDisplayed,70,120,255,0),0,255);
      }
      
      tint(151, 159, 200,transitionOpacity)
      texture(starText,10);
      translate(0,30,100);
      plane(planeWidth*0.35,planeHeight*0.35);
      tint(255,255)
      
      lastNoiseTextDisplayed = frameCount;
    }
  }
    
  
    
  pop();
    
  push();
  translate(0,-400,0);
  // rotateX(90*DEG);
  noStroke();
    
  fill(26, 33, 41,op);
  pop();
    
  
  if(frameCount<=3){
    background(0,0,20);
  }
  }
}


//////////////////////////////////////////////////
// HELPER FUNCTIONS //
//////////////////////////////////////////////////
function crossProduct(v1, v2) {
  return [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0],
  ];
}

function loadStarsFromFile(){
  let num_const = 0;
  Object.keys(starData).forEach(constellation_name=>{
    // console.log("constellation_name: ",constellation_name);
    const prev_cnt = num_const;
    starData[constellation_name].forEach(star=>{
      num_const = prev_cnt+1;
      // console.log("star_name: ",star.name);  
      
      if (star.name=="1Alp UMi"){
        stars.push(new Star(starRadius,0,-90,star.coord,star.apparent_magnitude,true));
      }
      else{
      stars.push(new Star(starRadius,0,-90,star.coord,star.apparent_magnitude));
    }});
    
  })
  
  // console.log("Number of Constellations: ",num_const);
  // console.log("DONE!");
  
}

function calculateStarSize(apparent_magnitude) {
  // More accurate size calculation based on astronomical magnitude scale
  // The Pogson equation: Brightness ratio = 100^((m1 - m2) / 5)
  
  // Reference magnitude (e.g., magnitude 0 as a reference point)
  const minSize = 0.5;
  const maxSize = 2.0;
  
  const referenceMagnitude = 1;
  
  // Base size for reference magnitude
  const baseSize = 10;
  
  // Calculate size based on brightness difference
  // Using a power law to represent the logarithmic nature of magnitude
  let sizeFactor = baseSize * Math.pow(2.512, -(apparent_magnitude - referenceMagnitude));
  
  // Ensure minimum and maximum sizes
  return Math.max(minSize, Math.min(sizeFactor, maxSize));
}

function calculateStarOpacity(apparent_magnitude) {
  // Opacity range
  const maxOpacity = 255;
  const minOpacity = 200; // Reduced for more dynamic range
  
  // Reference magnitude for maximum brightness (adjust for scaling)
  const referenceMagnitude = 2; // Apparent magnitude of the brightest star
  
  // Calculate brightness ratio based on the logarithmic scale
  const brightnessRatio = Math.pow(2.512, referenceMagnitude - apparent_magnitude);
  
  // Normalize the brightness ratio to the opacity range
  const normalizedOpacity = minOpacity + 
    (maxOpacity - minOpacity) * brightnessRatio / (brightnessRatio + 1); // Avoids infinite scaling
  
  // Clamp to ensure opacity stays within the defined range
  return Math.round(Math.max(minOpacity, Math.min(normalizedOpacity, maxOpacity)));
}

function rotateVector(vector,axisVector,rotateAng){
  let [x,y,z]=vector;
  let [vX,vY,vZ]=axisVector;
  let rotateTheta = rotateAng*DEG;
  let oldX = x, oldY = y, oldZ = z;
  x = oldX*Math.cos(rotateTheta) + (oldZ*vY-vZ*oldY)*Math.sin(rotateTheta) + vX*(vX*oldX+vY*oldY+vZ*oldZ)*(1-Math.cos(rotateTheta));
  y = oldY*Math.cos(rotateTheta) + (oldX*vZ-vX*oldZ)*Math.sin(rotateTheta)  + vY*(vX*oldX+vY*oldY+vZ*oldZ)*(1-Math.cos(rotateTheta));
  z = oldZ*Math.cos(rotateTheta) + (oldY*vX-vY*oldX)*Math.sin(rotateTheta)  + vZ*(vX*oldX+vY*oldY+vZ*oldZ)*(1-Math.cos(rotateTheta));
  return [x,y,z];
}

function interpolatePoints(p1, p2, t, method = 'ease_out', power = 2) {
    t = constrain(t, 0, 1);
    
    let factor = 1 - Math.pow(1 - t, power); // easing factor
    
    let ret = p1.reduce((acc,currVal,i)=>{
      acc.push(p1[i] + (p2[i]-p1[i])*factor);
      return acc;
    },[]);
    return ret;
}

function drawLine(x,y,z,s=undefined,c=[]){
    strokeWeight(2);
    const col = c?c:[255,255,255]; 
    const mul = s?s:50;
    stroke(...col,255);
    line(0,0,0,x,y,z);
    stroke(...col,100);
    line(0,0,0,mul*x,mul*y,mul*z);
}

//////////////////////////////////////////////////////
// Permission & Device Sensors Input

function requestDevicePermission() {
  DeviceOrientationEvent.requestPermission()
    .then(response => {
      if (response === 'granted') {
        window.addEventListener('deviceorientation', handleOrientation);
        window.addEventListener('devicemotion', handleMotion);
        fullscreen(true);
        loop();
        // sfxNoise.loop();
        // sfxNoise.loop();
        
      } else {
        console.error('Device orientation permission denied');
      }
    })
    .catch(console.error);
}

function handleOrientation(event) {
  
  orientAlpha = event.alpha;
  orientBeta = event.beta;
  orientGamma = event.gamma;
}

function handleMotion(event) {
  angA += event.rotationRate.alpha*event.interval; 
  angB += event.rotationRate.beta*event.interval; 
  angG += event.rotationRate.gamma*event.interval; 
//   console.log("Alpha: ",event.rotationRate.alpha);
//   console.log("Beta: ",event.rotationRate.beta);
//   console.log("Gamma: ",event.rotationRate.gamma);
//   console.log("t: ",event.interval);
  
//   console.log("A: ",angA);
//   console.log("B: ",angB);
//   console.log("G: ",angG);
}

////////////////////////////////////////////////////////
// Mouse Interaction

function windowResized() {
  // Resize canvas and renderer
  resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked(){
  if(mouseX<200 && mouseY<200){
    fullscreen(!fullscreen());
  }
}

function mouseReleased(){
  sfxNoise.play();
  sfxNoise.stop();
}

function keyPressed(){
  if(key=="d"){
    debug = !debug;
    camera();
    perspective();
  }
}
