let stars = [];
let mouseDraggedX = 0;
let mouseDraggedY = 0;
let focusX;
let focusY;
let focusZ = 0;

const starRadius = 600;
const bgStarRadius = 700;

let debug = true;

let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;

const DEG = Math.PI/180;


const constellations_list = "Andromeda,Antlia,Apus,Aquarius,Aquila,Ara,Aries,Auriga,Bootes,Caelum,Camelopardalis,Cancer,Canes Venatici,Canis Major,Canis Minor,Capricornus,Carina,Cassiopeia,Centaurus,Cepheus,Cetus,Chamaeleon,Circinus,Columba,Coma Berenices,Corona Australis,Corona Borealis,Corvus,Crater,Crux,Cygnus,Delphinus,Dorado,Draco,Equuleus,Eridanus,Fornax,Gemini,Grus,Hercules,Horologium,Hydra,Hydrus,Indus,Lacerta,Leo,Leo Minor,Lepus,Libra,Lupus,Lynx,Lyra,Mensa,Microscopium,Monoceros,Musca,Norma,Octans,Ophiuchus,Orion,Pavo,Pegasus,Perseus,Phoenix,Pictor,Pisces,Piscis Austrinus,Puppis,Pyxis,Reticulum,Sagitta,Sagittarius,Scorpius,Sculptor,Scutum,Serpens,Sextans,Taurus,Telescopium,Triangulum,Triangulum Australe,Tucana,Ursa Major,Ursa Minor,Vela,Virgo,Volans,Vulpecula,".split(",").map(s=>(s.trim()));


let starData;

function preload() {
  starData = loadJSON('unique_stars.json');
}



function setup() {
  // saveStarData();
  loadStarsFromFile();
  // saveStarDataFromBrightness();
  // let coord = convertCoordinates("05h 14m 32.27s","−08° 12′ 05.9″");
  // console.log(coord);
  
  createCanvas(displayWidth, displayHeight,WEBGL);
  frameRate(30);
  
  // const s = new Star(100,0,-45);
  // stars.push(s);
  
  for(let i=0;i<4000;i++){
    let Rad = bgStarRadius;
    let angX = random(0,180);
    let angZ = random(0,360);
    const star = new Star(Rad,angX,angZ);
    stars.push(star);
    
  }
}

class Star{
  constructor(rad,thetaX,thetaZ,coord={},star_size=-1){
    this.rad=rad;
    this.thetaX=thetaX;
    this.thetaZ=thetaZ;
    this.w = random(0.05,0.8);
    this.coord=coord;
    this.star_size = star_size;
  }
  
  display(){
    
    push();
    // normalMaterial();
    noStroke();
    // ambientMaterial(150,100,250);
    fill(150,100,250,calculateStarOpacity(this.star_size));
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
    
    translate(x,y,z);
    // sphere(this.star_size);
    sphere(this.star_size==-1?this.w:calculateStarSize(this.star_size));
    pop();
  }
}

function draw() {
  background(20);
  
  orbitControl();
  // debugMode();
  
  ambientLight(255);
  
  let angX = map(mouseDraggedX,0,width,180,0);
  let angY = map(mouseDraggedY,0,height,360,0);
  
  let focusX = Math.cos(angY*DEG)*Math.cos(angX*DEG);
  let focusY = Math.sin(angY*DEG);
  let focusZ = Math.cos(angY*DEG)*Math.sin(angX*DEG);
  
  angX-=90;
  let refX = Math.cos((angX)*DEG);
  let refY = 0;//Math.sin(angX*DEG);
  let refZ = Math.sin((angX)*DEG);
  
  let [upX,upY,upZ]=crossProduct([focusX,focusY,focusZ],[refX,refY,refZ]);
  
//   drawLine(focusX,focusY,focusZ);
//   drawLine(refX,refY,refZ,200,[0,255,255]);
//   drawLine(upX,upY,upZ,-200,[255,255,0]);
  
//   camera(0,0,0,focusX,focusY,focusZ,upX,upY,upZ);
//   perspective(PI/3, width/height, 0.01, 1000);
  
  
  if(true){
  
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
  rotateX(90*DEG);
  translate(0,0,-10);
  
  fill(100,0,150,100);
  noStroke();
  plane(500,500);
  pop();
  
  
  // direction boxes
//   push();
//   fill(0,100,150,150);
//   noStroke();
//   translate(100,0,0);
//   box(40);
//   translate(-200,0,0);
//   box(80);
//   pop();
  
  
//   push();
//   fill(100,150,0,150);
//   noStroke();
//   translate(0,100,0);
//   box(40);
//   translate(0,-200,0);
//   box(80);
//   pop();
    
//   push();
//   fill(0,150,100,150);
//   noStroke();
//   translate(0,0,100);
//   box(40);
//   translate(0,0,-200);
//   box(80);
//   pop();
    }
}


function mousePressed() {
  // Start dragging when mouse is pressed
  isDragging = true;
  previousMouseX = mouseX;
  previousMouseY = mouseY;
}


function mouseDragged() {
  if (isDragging && debug) {
    // Calculate change in mouse position
    let mouseDeltaX = mouseX - previousMouseX;
    let mouseDeltaY = mouseY - previousMouseY;
    
    mouseDraggedX += mouseDeltaX*0.6;
    mouseDraggedY += mouseDeltaY*0.6;
    previousMouseX = mouseX;
    previousMouseY = mouseY;
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

function drawLine(x,y,z,s=undefined,c=[]){
  strokeWeight(2);
  const col = c?c:[255,255,255]; 
  const mul = s?s:50;
  stroke(...col,255);
  line(0,0,0,x,y,z);
  stroke(...col,100);
  line(0,0,0,mul*x,mul*y,mul*z);
}

function mouseClicked(){
  if(mouseX<200 && mouseY<200){
    fullscreen(!fullscreen());
  }
}
function keyPressed(){
  if(key=="d"){
    debug = !debug;
  }
}

function loadStarsFromFile(){
  let num_const = 0;
  Object.keys(starData).forEach(constellation_name=>{
    console.log("constellation_name: ",constellation_name);
    const prev_cnt = num_const;
    starData[constellation_name].forEach(star=>{
      num_const = prev_cnt+1;
      console.log("star_name: ",star.name);
      stars.push(new Star(starRadius,0,-90,star.coord,star.apparent_magnitude));
    });
    
  })
  
  console.log("Number of Constellations: ",num_const);
  console.log("DONE!");
  
}

async function saveStarData(){
  
  const fileContent  = {};
  
  const constellationPromises = constellations_list.map(async (constellation_name) => {
    const starDetailsList = [];
    console.log("Fetching ",constellation_name,",");
    let url = `https://api.api-ninjas.com/v1/stars?constellation=${constellation_name}`;
    
    const response = await fetch(url,{headers:{"X-Api-Key":"Nx4R2DQskLfZE1nXDVFDnw==gxwWIOurNS9xnngY"}});
    if(response.ok){
      const data = await response.json();
    
      data.forEach(star=>{
        const star_size = parseFloat(star.apparent_magnitude);

        console.log("NAME: ",star.name);

        const coord = convertCoordinates(star.right_ascension,star.declination);

        console.log("SIZE:",star_size);

        starDetailsList.push({
          name:star.name,
          apparent_magnitude:star.apparent_magnitude,
          right_ascension:star.right_ascension,
          declination:star.declination,
          coord: coord
        })
        // stars.push(new Star(100,0,-90,coord,star_size));
      });
    }
    
    // fileContent[constellation_name] = starDetailsList;
    
    return { constellation: constellation_name, stars: starDetailsList };
  });
  
  const results = await Promise.all(constellationPromises);
  
  
  results.forEach(result => {
    if (result) {
      fileContent[result.constellation] = result.stars;
    }
  });
  
  const jsonString = JSON.stringify(fileContent);
  saveStrings(jsonString.split('\n'), `star_data.json`);
  console.log("SAVED!");

    
}

async function saveStarDataFromBrightness(){
  
  let fileContent  = {};
  
  const constellationListFromAPI = [];
  
  const starDetailsList = [];
  
  const constellationPromises = [1].map(async (constellation_name) => {
    
    // console.log("Fetching ",constellation_name,",");
    let page = -1;
    while(page<2391){
      page++;
     
    let url = `https://api.api-ninjas.com/v1/stars?max_apparent_magnitude=6&offset=${page}`;
    
    const response = await fetch(url,{headers:{"X-Api-Key":"Nx4R2DQskLfZE1nXDVFDnw==gxwWIOurNS9xnngY"}});
    if(response.ok){
      const data = await response.json();
    
      data.forEach(star=>{
        console.log(`Offset:${page} - NAME: `,star.name);
        let coord = {};
        if(star.right_ascension && star.declination){
          coord = convertCoordinates(star.right_ascension,star.declination);
        }
        else{
          coord = {x:0,y:0,z:0};
        }
        starDetailsList.push({
          name:star.name,
          constellation:star.constellation,
          apparent_magnitude:star.apparent_magnitude,
          right_ascension:star.right_ascension,
          declination:star.declination,
          coord: coord
        });
        if(!constellationListFromAPI.includes(star.constellation)){
          constellationListFromAPI.push(star.constellation);
          console.log("UNIQUE CONSTELLATION: ",star.constellation);
        }
       });
      }
      else{
        console.log("INVALID RESPONSE, BREAK CALLED")
        break;
      }
      }
    return "x";
    // fileContent[constellation_name] = starDetailsList;
    
   
  });
  
  
  const results = await Promise.all(constellationPromises);
  
  // let cnt = 0;
  // results.forEach(result => {
  //   if (result) {
  //     // fileContent[result.constellation] = result.stars;
  //     // cnt++
  //   }
  // });
  fileContent = {stars:starDetailsList};
  
  const jsonString = JSON.stringify(fileContent);
  saveStrings(jsonString.split('\n'), `star_data.json`);
  console.log("SAVED!");

    
}

function convertCoordinates(ra, dec) {
  console.log("input: ra: ",ra,", dec: ",dec);
  // More flexible parsing for Right Ascension
  const raMatch = ra.match(/(\d+)h\s*(\d+)m\s*([\d.]+)s/i);
  if (!raMatch) {
    throw new Error(`Invalid Right Ascension format: ${ra}`);
  }
  console.log("input: ra: ",ra);
  let [, hours, minutes, seconds] = raMatch;
  console.log("h: ",hours,",m: ",minutes,",s: ",seconds);
  let raHours = parseFloat(hours) + parseFloat(minutes) / 60 + parseFloat(seconds) / 3600;
  
  // More flexible parsing for Declination
  const decMatch = dec.match(/([+−])?(\d+)°\s*(\d+)′\s*([\d.]+)″/i);
  if (!decMatch) {
    throw new Error(`Invalid Declination format: ${dec}`);
  }
  
  console.log("input dec: ",dec);
  let [, sign, deg, mint, sec] = decMatch;
  console.log("sign: ",sign,"deg: ",deg,",m: ",mint,",s: ",sec);
  let decDegrees = parseFloat(deg) + parseFloat(mint) / 60 + parseFloat(sec) / 3600;
  
  // Apply sign if present
  if (sign === '−') decDegrees = -decDegrees;
  
  // Convert to spherical coordinates (theta and phi)
  let theta = raHours * 15 * DEG; // RA to degrees (1 hour = 15 degrees)
  let phi = (90 - decDegrees) * DEG; // Celestial coordinate conversion
  
  
  console.log("output:",{
    x: sin(phi) * cos(theta),
    z: sin(phi) * sin(theta),
    y: cos(phi)
  });
  // Convert to Cartesian coordinates
  return {
    x: sin(phi) * cos(theta),
    z: sin(phi) * sin(theta),
    y: cos(phi)
  };
}

function calculateStarSize(apparent_magnitude) {
  // More accurate size calculation based on astronomical magnitude scale
  // The Pogson equation: Brightness ratio = 100^((m1 - m2) / 5)
  
  // Reference magnitude (e.g., magnitude 0 as a reference point)
  const referenceMagnitude = 0;
  
  // Base size for reference magnitude
  const baseSize = 10;
  
  // Calculate size based on brightness difference
  // Using a power law to represent the logarithmic nature of magnitude
  let sizeFactor = baseSize * Math.pow(2.512, -(apparent_magnitude - referenceMagnitude));
  
  // Ensure minimum and maximum sizes
  return Math.max(0.01, Math.min(sizeFactor, 1.4));
}

function calculateStarOpacity(apparent_magnitude) {
  // Opacity calculation also adjusted for logarithmic scale
  const maxOpacity = 255;
  const minOpacity = 200;
  
  // Logarithmic opacity reduction
  let opacityFactor = maxOpacity * Math.pow(2.512, -(apparent_magnitude));
  
  return Math.max(minOpacity, Math.min(opacityFactor, maxOpacity));
}
