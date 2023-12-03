window.addEventListener('load', initScene) // Evento para que cuando se cargue se inicie la escena

//Array de meteoritos en diferentes posiciones
const fishes = [
    { x: 0, y: 0, z: -3, ry: -90 },
    { x: 0, y: 0, z: 3, ry: 90 },
    { x: 3, y: 0, z: 0, ry: 180 },
    { x: -3, y: 0, z: 0, ry: 0 },
    { x: 2, y: 0, z: 2, ry: 145 },
    { x: 2, y: 0, z: -2, ry: -145 },
    { x: -2, y: 0, z: -2, ry: -60 },
    { x: -2, y: 0, z: 2, ry: 60 }
]

const sharkAnimations = [
    { property: 'position', to: '0 -0.25 -20', dur: 10000, easing: 'linear' },
    { property: 'position', to: '-4 -0.25 -15', dur: 3000, easing: 'linear' },
    { property: 'position', to: '4 -0.25 -10', dur: 3000, easing: 'linear' },
    { property: 'position', to: '0 -0.25 -5', dur: 2000, easing: 'linear' },
    { property: 'position', to: '0 -0.25 -2', dur: 1000, easing: 'linear' },
    { property: 'position', to: '0 -0.25 -1', dur: 1000, easing: 'linear' }
]

const rotacionesTiburonEnGiros = [
    {y: 0},
    {y: -20}, 
    {y: 45}, 
    {y: -40}, 
    {y: 0},
    {y: 0}
]


let fish, tiburon, score = 0, sharkLives=10, indexSegundaAnimacion=1;

//Función para lanzar la escena principal
function initScene() {
    
    let orbits = document.querySelectorAll('.orbit')

    
    orbits.forEach(orbit => {

        
        fishes.forEach(pos => {

            fish = document.createElement('a-entity')
            fish.setAttribute('class', 'pez')
            fish.setAttribute('gltf-model', '#clownFish')
            fish.setAttribute('look-at', '[camera]')
            fish.setAttribute('scale', '2.5 2.5 2.5')
            fish.setAttribute('update-look-at')
            fish.setAttribute('animation-mixer', 'clip:idle')
            fish.object3D.position.set(pos.x, pos.y, pos.z)
            fish.setAttribute('rotation','0 '+pos.ry+' 0')

            fish.setAttribute('shootable', '') 

            orbit.appendChild(fish) 
        })
    })
}

//Función para registrar un nuevo componente a nuestra escena: Shootable
AFRAME.registerComponent('shootable', {
    init: function () {
        this.el.addEventListener('click', () => {
            //console.log('Destruido')
            this.el.parentNode.removeChild(this.el) //Eliminamos el elemento del DOM (se podría ocultar, pero estaría siempre ahí)
            document.querySelector('[text]').setAttribute('value', `${++score} PECES ATRAPADOS`)
            if(score==8){
                enfocarCamara()
                var sonidoTiburon = document.querySelector('#sonidoTiburon');
                sonidoTiburon.components.sound.playSound();
                spawnShark()
            }
        })
    }
})

AFRAME.registerComponent('update-look-at', {
    tick: function () {
      // Obtiene las posiciones de la cámara y del contenedor del pez
      var cameraPosition = document.querySelector('[camera]').object3D.position
      var pezContainerPosition = this.el.object3D.position

      // Calcula la dirección hacia la cámara
      var direction = new THREE.Vector3().subVectors(cameraPosition, pezContainerPosition)

      // Calcula la rotación para que el pez mire hacia la cámara
      var rotation = new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().lookAt(direction, this.el.object3D.up, null))

      // Aplica la rotación al contenedor del pez
      this.el.setAttribute('rotation', {
        x: THREE.Math.radToDeg(rotation.x),
        y: THREE.Math.radToDeg(rotation.y),
        z: THREE.Math.radToDeg(rotation.z)
      })
    }
  })

function spawnShark() {
    tiburon = document.createElement('a-entity')
    tiburon.setAttribute('id','Tiburon')
    tiburon.setAttribute('gltf-model','#Shark')
    tiburon.setAttribute('position','0 -0.25 -100')
    tiburon.setAttribute('scale','0.2 0.2 0.2')
    tiburon.setAttribute('look-at', '[camera]')
    tiburon.setAttribute('animation-mixer', 'clip:swimming')
    tiburon.setAttribute('animation',sharkAnimations[0])
    tiburon.setAttribute('class', 'pez')
    
    tiburon.addEventListener('animationcomplete', function () {
        prepararAnimacion()
    })
    
    tiburon.addEventListener('click', function () {
            sharkLives--;
            var textoVidasTiburon = document.getElementById('vidasTiburon')
            textoVidasTiburon.setAttribute('value', `${sharkLives} VIDAS`)
            if(sharkLives<=0){
                var pantallaVictoria = document.getElementById('winScreen')
                mostrarPantallaVictoriaDerrota()
                pantallaVictoria.setAttribute('visible','true')
                var sonidoVictoria = document.querySelector('#sonidoVictoria');
                sonidoVictoria.components.sound.playSound();
                setTimeout(function() {
                      reiniciarPartida()
                  }, 5000);
            }
    })
    
    document.querySelector('a-scene').appendChild(tiburon)
}

function prepararAnimacion(){
    var tiburon = document.getElementById('Tiburon');
    if (indexSegundaAnimacion < sharkAnimations.length) {
      var animacionActual = sharkAnimations[indexSegundaAnimacion]
      var nuevaRotacion = rotacionesTiburonEnGiros[indexSegundaAnimacion]
      tiburon.setAttribute('animation', animacionActual)
      tiburon.setAttribute('rotation','0 '+nuevaRotacion.y+' 0')
      if(indexSegundaAnimacion==5){
          tiburon.setAttribute('animation-mixer', 'clip:bite')
          setTimeout(function() {
              var pantallaDerrota = document.getElementById('gameOverScreen')
              mostrarPantallaVictoriaDerrota()
              pantallaDerrota.setAttribute('visible','true')
              var sonidoDerrota = document.querySelector('#sonidoDerrota');
              sonidoDerrota.components.sound.playSound();
              pantallaDerrota.addEventListener('click', reiniciarPartida)
              setTimeout(function() {
                      reiniciarPartida()
                  }, 5000);
          }, 900);
      }
      indexSegundaAnimacion++;
      // Llama recursivamente después de la duración de la animación actual
      setTimeout(prepararAnimacion, animacionActual.dur);
    }
}

function enfocarCamara(){
    var camara = document.getElementById('camara')
    var puntero = document.getElementById('puntero')
    var texto = document.getElementById('textoCapturas')
    var harpon = document.getElementById('harpon')
    
    var rotacionInicial = camara.object3D.rotation
    var rotacionEnGrados = {
        x: THREE.MathUtils.radToDeg(rotacionInicial.x),
        y: THREE.MathUtils.radToDeg(rotacionInicial.y),
        z: THREE.MathUtils.radToDeg(rotacionInicial.z)
    }
    
    var cameraAnimation = [
        { property: 'rotation', to: '0 0 0', dur: 700, easing: 'linear' },
        { property: 'rotation', to: `${rotacionEnGrados.x} ${rotacionEnGrados.y} ${rotacionEnGrados.z}`, dur: 700, easing: 'linear' }
    ]
    
    var animacionesBarraSuperior = [
        { property: 'position', to: '0 2.7 0', dur: 500, easing: 'linear' },
        { property: 'position', to: '0 5 0', dur: 500, easing: 'linear' }
    ]
    
     var animacionesBarraInferior = [
        { property: 'position', to: '0 -2.1 0', dur: 500, easing: 'linear' },
        { property: 'position', to: '0 -5 0', dur: 500, easing: 'linear' }
    ]
    
    var barraSuperior = document.createElement('a-plane')
    barraSuperior.setAttribute('color','black')
    barraSuperior.setAttribute('width','30')
    barraSuperior.setAttribute('height','10')
    barraSuperior.setAttribute('position','0 5 0')
    barraSuperior.setAttribute('rotation','90 0 0')
    
    var barraInferior = document.createElement('a-plane')
    barraInferior.setAttribute('color','black')
    barraInferior.setAttribute('width','30')
    barraInferior.setAttribute('height','10')
    barraInferior.setAttribute('position','0 -5 0')
    barraInferior.setAttribute('rotation','-90 0 0')
    
    camara.appendChild(barraSuperior)
    camara.appendChild(barraInferior)
    
    camara.setAttribute('look-controls','enabled',false)
    
    puntero.setAttribute('visible','false')
    texto.setAttribute('visible','false')
    harpon.setAttribute('visible','false')
    
    barraSuperior.setAttribute('animation',animacionesBarraSuperior[0])
    barraInferior.setAttribute('animation',animacionesBarraInferior[0])
    setTimeout(function() {
        camara.setAttribute('animation',cameraAnimation[0])
    }, 300);
    camara.addEventListener('animationcomplete', function () {
        setTimeout(function() {
            camara.setAttribute('animation',cameraAnimation[1])
        }, 1000);
        camara.addEventListener('animationcomplete', function () {
            setTimeout(function() {
                barraSuperior.setAttribute('animation',animacionesBarraSuperior[1])
                barraInferior.setAttribute('animation',animacionesBarraInferior[1])
                camara.setAttribute('look-controls','enabled',true)
                puntero.setAttribute('visible','true')
                harpon.setAttribute('visible','true')
                setTimeout(function() {
                    camara.removeChild(barraSuperior)
                    camara.removeChild(barraInferior)
                    var textoVidasTiburon = document.getElementById('vidasTiburon')
                    textoVidasTiburon.setAttribute('visible','true')
                }, 1000);
            }, 300);
        });
    });
}

function mostrarPantallaVictoriaDerrota(){
    var camara = document.getElementById('camara')
    var scene = document.querySelector('a-scene')
    
    var tiburon = document.getElementById('Tiburon')
    var puntero = document.getElementById('puntero')
    var texto = document.getElementById('textoCapturas')
    var vidasTiburon = document.getElementById('vidasTiburon')
    var harpon = document.getElementById('harpon')
    
    camara.removeChild(puntero)
    camara.removeChild(texto)
    camara.removeChild(vidasTiburon)
    camara.removeChild(harpon)
    
    scene.removeChild(tiburon)
    
    var sonidoTiburon = document.querySelector('#sonidoTiburon');
    sonidoTiburon.components.sound.stopSound();
}   
      
function reiniciarPartida(){
    location.reload();
}      
