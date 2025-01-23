let scene, camera, renderer, geometry, material, mesh;
let particles = [];
let particleSystem;

// Initialize Three.js scene
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('weirdCanvas'), 
        alpha: true,
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0.9);

    // Create matrix rain effect
    const particleCount = 1000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        // Position
        positions[i * 3] = Math.random() * 100 - 50;     // x
        positions[i * 3 + 1] = Math.random() * 100 - 50; // y
        positions[i * 3 + 2] = Math.random() * 50 - 25;  // z

        // Color (green with variations)
        colors[i * 3] = 0;                               // R
        colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;  // G
        colors[i * 3 + 2] = 0;                          // B

        // Size
        sizes[i] = Math.random() * 2;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom shader material
    const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            pixelRatio: { value: window.devicePixelRatio }
        },
        vertexShader: `
            uniform float time;
            uniform float pixelRatio;
            attribute float size;
            varying vec3 vColor;
            
            void main() {
                vColor = color;
                vec3 pos = position;
                
                // Matrix rain effect
                pos.y = mod(pos.y - time * 5.0, 100.0) - 50.0;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                float dist = length(gl_PointCoord - vec2(0.5));
                if (dist > 0.5) discard;
                
                vec3 color = vColor;
                color *= 1.0 - dist * 2.0;
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        transparent: true,
        vertexColors: true
    });

    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Add some glowing grid lines
    const gridGeometry = new THREE.BufferGeometry();
    const gridPositions = [];
    const gridSize = 50;
    const gridSpacing = 5;

    // Create horizontal and vertical lines
    for (let i = -gridSize; i <= gridSize; i += gridSpacing) {
        // Horizontal lines
        gridPositions.push(-gridSize, i, 0);
        gridPositions.push(gridSize, i, 0);
        // Vertical lines
        gridPositions.push(i, -gridSize, 0);
        gridPositions.push(i, gridSize, 0);
    }

    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
    const gridMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0.1
    });
    const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
    scene.add(grid);

    // Add ambient and point lights
    const ambientLight = new THREE.AmbientLight(0x002200);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ff00, 1, 100);
    pointLight.position.set(0, 0, 20);
    scene.add(pointLight);

    camera.position.z = 50;
}

// Animation loop
function animate(time) {
    requestAnimationFrame(animate);

    if (particleSystem) {
        particleSystem.material.uniforms.time.value = time * 0.001;
        particleSystem.rotation.z += 0.0003;
    }

    // Subtle camera movement
    camera.position.x = Math.sin(time * 0.0002) * 2;
    camera.position.y = Math.cos(time * 0.0002) * 2;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (particleSystem) {
        particleSystem.material.uniforms.pixelRatio.value = window.devicePixelRatio;
    }
});

// Enter button functionality
document.getElementById('enterBtn').addEventListener('click', function() {
    this.style.transform = 'translate(-50%, -50%) scale(20)';
    this.style.opacity = '0';
    
    // Add glitch effect before transition
    document.querySelector('.terminal-container').classList.add('glitch');
    
    setTimeout(() => {
        window.location.href = 'darknet.html';
    }, 1000);
});

// Start the animation
init();
animate(); 