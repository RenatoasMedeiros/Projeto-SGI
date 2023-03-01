const canvas = document.getElementById("3dview");

const canvasTamanhoTotal = document.getElementById('canvasTamanhoTotal');
const canvasWrapper = document.getElementById('canvasWrapper');
// select the button element
const buttonAnimation = document.getElementById('animation-button');

const width = canvasWrapper.offsetWidth;
const height = canvasWrapper.offsetHeight;


let camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);

let scene = new THREE.Scene();

// Change scene background color to white
scene.background = new THREE.Color(0xffffff);

// renderer
let renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.autoClear = true;
camera.position.x = 0;
camera.position.y = 80;
camera.position.z = 200;
camera.lookAt(0,100,0);

renderer.setSize(width, height);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// camera orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.autoRotate = false;
controls.autoRotateSpeed = 0.5;
controls.screenSpacePanning = true;


// Set up the camera positions
var cameraPosition1 = new THREE.Vector3(0, 80, 200);
var cameraPosition2 = new THREE.Vector3(-200, 80, 200);
var cameraPosition3 = new THREE.Vector3(200, 80, 200);
var cameraPosition4 = new THREE.Vector3(0, 10, 150);
var cameraPosition5 = new THREE.Vector3(0, 200, 100);

// Get references to the buttons
var view1 = document.getElementById('view1');
var view2 = document.getElementById('view2');
var view3 = document.getElementById('view3');
var view4 = document.getElementById('view4');
var view5 = document.getElementById('view5');

// Add click event listeners to the buttons
view1.addEventListener("click", function() {
  camera.position.copy(cameraPosition1);
  controls.update();
});

view2.addEventListener("click", function() {
  camera.position.copy(cameraPosition2);
  controls.update();
});

view3.addEventListener("click", function() {
  camera.position.copy(cameraPosition3);
});

view4.addEventListener("click", function() {
  camera.position.copy(cameraPosition4);
  controls.update();
});

view5.addEventListener("click", function() {
    camera.position.copy(cameraPosition5);
    controls.update();
});


var ambientLight = new THREE.AmbientLight(0x404040, 1); // soft white light
scene.add(ambientLight);

// Create another point light
var pointLight = new THREE.DirectionalLight(0xffffff,1);
pointLight.position.set(-150, 200, 200);
//Shadow
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.bottom = -200;
pointLight.shadow.camera.left = -150;
pointLight.shadow.camera.right = 130;
pointLight.shadow.camera.top = 130;
pointLight.shadow.camera.near = 0.5;
pointLight.shadow.camera.far = 450;
scene.add(pointLight);

let loader = new THREE.GLTFLoader();

// texture objects variables
let model, textureColor, textureNormal, textureRoughness;

//animation objects variables
let animations, mixer, action;

// set up the raycaster
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

loader.load('/models/desk_recurso_final_mesmo_final.gltf', function (gltf) {

    // Get the scene
    model = gltf.scene;
    animations = gltf.animations;

    //Parede e chão
    changeTexture('wallFabric');
    //Root e Leaves
    model.children[3].material.map = new THREE.TextureLoader().load('/textures/Cube_1_Base_Color.png');
    model.children[4].material.map = new THREE.TextureLoader().load('/textures/Cube_1_Base_Color.png');
    //Pot
    model.children[5].material.map = new THREE.TextureLoader().load('/textures/DefaultMaterial_Base_Color.png');
    //PC
    model.children[6].material.map = new THREE.TextureLoader().load('/textures/Monitor_Default_Albedo.png');
    console.dir(model.children); // debug model
    //console.dir(model.children[5].material.map); //  color texture
    //console.dir(model.)

    mixer = new THREE.AnimationMixer(model);

    gltf.scene.traverse(function (x) {
        if (x instanceof THREE.Light) x.visible = false;
    });
    scene.add(model);

    //ativar as shadows para cada children do model
    model.traverse(function (node) {
        if(node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
        }
    })
    
    // listen for mouse clicks and update the color of the intersected object
    window.onclick = function(evento) {
        var limites = evento.target.getBoundingClientRect()
       
        mouse.x = (evento.clientX - limites.left) / parseInt(canvas.style.width) * 2 - 1
        mouse.y = -(evento.clientY - limites.top) / parseInt(canvas.style.height) * 2 + 1
        // invocar raycaster
        raycaster.setFromCamera( mouse, camera );

        // use the raycaster to determine which objects are intersected by the ray
        var intersects = raycaster.intersectObjects(model.children);
        // if there is an intersected object, change its color
        if ( intersects.length > 0 ) {
            if(intersects[0].object === model.children[11]) {
                playAnimation('drawer1');
            }
            if(intersects[0].object === model.children[9]) {
                playAnimation('door');
            }
            if(intersects[0].object === model.children[10]) {
                playAnimation('drawer2');
            }
            if(intersects[0].object === model.children[7]) {
                playAnimation('drawer3');
            }
        }
      }
    //Animação do vento nas Plantas!
    action = mixer.clipAction(THREE.AnimationClip.findByName( animations, 'LeavesAndRoot' ));
    
    console.log(action);
    action.play();
});

//0 - Fechado | 1 - Aberto
let drawer1 = 0, drawer2 = 0
let drawer3 = 0, door = 1;

function playAnimation(element) {
    //switch (element.id) {
    switch (element){
        case 'drawer1':

            action = mixer.clipAction(THREE.AnimationClip.findByName( animations, 'deskTopDrawerAction' ));
            action.clampWhenFinished = true; // stops the animation on its last frame.
            action.setLoop(THREE.LoopOnce);
            if (drawer1 == 0) {
                drawer1 = 1;
                action.reset();
                action.timeScale = 5
                console.log(action);
                action.play();
                break;
            } else {
                drawer1 = 0;
                action.paused = false;
                action.timeScale = -action.timeScale;
                action.play();
                break;
            }
            break;
        case 'drawer2':
            action = mixer.clipAction(THREE.AnimationClip.findByName( animations, 'deskMiddleDrawerAction' ));
            action.clampWhenFinished = true; // stops the animation on its last frame.
            action.setLoop(THREE.LoopOnce);
            if (drawer2 == 0) {
                drawer2 = 1;
                action.reset();
                action.timeScale = 5;
                action.play();
                break;
            } else {
                drawer2 = 0;
                action.paused = false;
                action.timeScale = -action.timeScale;
                action.play();
                break;
            }
            break;
        case 'drawer3':
            action = mixer.clipAction(THREE.AnimationClip.findByName( animations, 'deskBottomDrawerAction' ));
            action.clampWhenFinished = true; // stops the animation on its last frame.
            action.setLoop(THREE.LoopOnce);
            if (drawer3 == 0) {
                drawer3 = 1;
                action.reset();
                action.timeScale = 5 
                action.play();
                break;
            } else {
                drawer3 = 0;
                action.paused = false;
                action.timeScale = -action.timeScale;
                action.play();
                break;
            }
            break;
        case 'door':
            action = mixer.clipAction(THREE.AnimationClip.findByName( animations, 'deskDoorAction' ));
            action.clampWhenFinished = true; // stops the animation on its last frame.
            action.setLoop(THREE.LoopOnce);
            if (door == 0) {
                door = 1;
                action.reset();
                action.timeScale = 5;
                action.play();
                break;
            } else {
                door = 0;
                action.paused = false;
                action.timeScale = -action.timeScale;
                action.play();
                break;
            }
            break;
        default:
            console.error('invalid element id trying to execute this animation.');
            break;
    }
}



function changeTexture(texture) {

    switch (texture) {
        case 'bege':
            textureColor = new THREE.TextureLoader().load('/textures/Wood021_2K_Color.jpg');
            textureColor.wrapT = THREE.RepeatWrapping; // partially fix the texture wrapping around the model
            textureColor.wrapS = THREE.RepeatWrapping;
            // change texture of each type from each piece of the model.
            for (var i = 7; i <= 11; i++) {
                model.children[i].material.map = textureColor;
            }

            break;
        case 'smooth':
            textureColor = new THREE.TextureLoader().load('/textures/bege_Color.jpg');
            textureColor.wrapT = THREE.RepeatWrapping; // partially fix the texture wrapping around the model
            textureColor.wrapS = THREE.RepeatWrapping;
            // change texture of each type from each piece of the model.
            for (var i = 7; i <= 11; i++) {
                model.children[i].material.map = textureColor;
            }
            break;
        case 'plain':
            textureColor = new THREE.TextureLoader().load('/textures/plain_Color.jpg');
            textureColor.wrapT = THREE.RepeatWrapping;
            textureColor.wrapS = THREE.RepeatWrapping;
            // change texture of each type from each piece of the model.
            for (var i = 7; i <= 11; i++) {
                model.children[i].material.map = textureColor;
            }

            break;

        case 'orange':
            textureColor = new THREE.TextureLoader().load('/textures/orange_Color.jpg');
            textureColor.wrapT = THREE.RepeatWrapping;
            textureColor.wrapS = THREE.RepeatWrapping;
            // change texture of each type from each piece of the model.
            for (var i = 7; i <= 11; i++) {
                model.children[i].material.map = textureColor;
            }
            break;
        case 'wallFabric':
            textureColor = new THREE.TextureLoader().load('/textures/WallFabric/Fabric048_2K_Color.jpg');
            textureColor.wrapT = THREE.RepeatWrapping; // partially fix the texture wrapping around the model
            textureColor.wrapS = THREE.RepeatWrapping;
            // change texture of each type from each piece of the model.
            for (var i = 1; i <= 2; i++) {
                model.children[i].material.map = textureColor;
                model.children[i].material.name = 'wallFabric';
            }
            break;
        default:
            break;
    }
}

//Utilizado como parametro para o mixer
const clock = new THREE.Clock();

function animate() {
    // update controls
    controls.update();

    // Recursive function
    requestAnimationFrame(animate);

    // Verifica de o mixer já foi instânciado antes de dar update
    if (mixer) {
        mixer.update(clock.getDelta());
    }

    renderer.render(scene, camera);
}


// Model auto rotation
function updateAutoRotate() {
    if (document.querySelector('#model-auto-rotate').checked) {
        controls.autoRotate = true;
    } else {
        controls.autoRotate = false;
    }
}

// Canvas background color
function updateBackgroundColor() {
    const labels = document.querySelectorAll(".controls-label"); // grab the labal elements to change colors

    if (document.querySelector('#change-background').checked) {
        scene.background = new THREE.Color(0xffffff); // white background
        labels.forEach(label => {
            label.style.color = "black";
        });
    } else {
        scene.background = new THREE.Color(0x191919); // black background
        labels.forEach(label => {
            label.style.color = "white";
        });
    }
}


// Recursive function to update the canvas window size
function onWindowResize() {
    const width = canvasWrapper.offsetWidth;
    const height = canvasWrapper.offsetHeight;

    // Update the aspect ratio of the camera
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

window.addEventListener('resize', onWindowResize);

animate();