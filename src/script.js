import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}

/** Texture Loader*/
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter //to make a perfect gradient

const particleTexture = textureLoader.load('textures/particles/1.png')
particleTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2( 0x000000, 0.1 );
/**
 * Objects
 */

const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture, //the gradient texture reacts to the light
    
})
const objectDistance = 4

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(0.5,0.4,16,60),
    material
)

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(0.5,1,32),
    material
)

const mesh3 = new THREE.Mesh(
    //new THREE.TorusKnotGeometry(0.8,0.35,100,16),
    new THREE.TorusKnotGeometry(0.4,0.2,150,32),
    material
)

scene.add(mesh1, mesh2, mesh3)
mesh1.position.y = -objectDistance * 0
mesh2.position.y = -objectDistance * 1
mesh3.position.y = -objectDistance * 2

mesh1.position.x = 2
mesh2.position.x = -2
mesh3.position.x = 2


const sectionMeshes = [mesh1, mesh2, mesh3]

/**PARTICLES */

//geometry
const particleCount = 200
const particleDimensions = [10,20,10]
const vertices = new Float32Array(particleCount * 3)
for (let i = 0; i < particleCount * 3; i+=3) {
    
    vertices[i] = (Math.random()-0.5) * particleDimensions[0]
    vertices[i+1] = objectDistance * 0.5 - (Math.random()) * objectDistance*3
    vertices[i+2] = (Math.random() - 0.5) * particleDimensions[2]
    
}

const particleGeometry = new THREE.BufferGeometry()
particleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

const particleMaterial = new THREE.PointsMaterial({
    color: '#cccccc', 
    map: particleTexture,
    sizeAttenuation: true,
    alphaTest: 0.5, 
    transparent: true,
    size: 0.2
})

const particles = new THREE.Points(particleGeometry, particleMaterial)




scene.add(particles)



/*
Lights
*/

const directionalLight = new THREE.DirectionalLight('ffffff',1)
directionalLight.position.set(1,1,0)
scene.add(directionalLight)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 7
cameraGroup.add(camera)



/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//SCROLL
//gets the current scroll value, to be converted to camera position
let scrollY = window.scrollY //the current scroll value. 0 at the top
let currentSection = 0

window.addEventListener('scroll', () =>{
    scrollY = window.scrollY

    const newSection = Math.round (scrollY / sizes.height)

    if (newSection != currentSection)
    {
        currentSection = newSection
        
        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5'
            }
        )



    }



})

//CURSOR - to make the parallax effect
const cursor = {
    x : 0,
    y : 0
}

window.addEventListener('mousemove', (event) =>{

    //it goes from 
    cursor.x = (event.clientX/sizes.width-0.5)
    cursor.y = (event.clientY/sizes.height-0.5)

})



/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0
const parallaxAmplitude = 0.3

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    for (const mesh of sectionMeshes)
    {
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    }

    //update camera according to scroll
    //divide by the size of the viewport, since each letter is separated
    //by 1 viewport
    //and each object distance is 4 units from each other
    camera.position.y = - scrollY / sizes.height * objectDistance

    const parallaxX = cursor.x * parallaxAmplitude
    const parallaxY = -cursor.y * parallaxAmplitude

    cameraGroup.position.x +=  (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime




    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)



    
}

tick()


/*GUI*/
gui
    .addColor(parameters, 'materialColor').onChange(()=>{
        material.color.set(parameters.materialColor)
        particleMaterial.color.set(parameters.materialColor)
    })


