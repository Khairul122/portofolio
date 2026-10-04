import { Suspense, useContext, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import { useInView, useReducedMotion } from 'framer-motion'
import * as THREE from 'three'
import { CoveredContext } from '../Shared/CoveredContext'
import styles from './AvatarCanvas.module.css'

const BUSINESS_AVATAR_URL = '/models/business-avatar.glb'
const PINK_SHIRT_AVATAR_URL = '/models/pink-shirt-avatar.glb'
const BROOKLYN_AVATAR_URL = '/models/brooklyn-avatar.glb'

// R3F's implicit default camera auto-aims at the world origin, which is the
// model's feet (not its center) since feet sit at y=0 for ContactShadows to
// work. Re-aim it at the requested vertical fraction so framing is deliberate.
function CameraAim({ targetHeight, aimFraction }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(0, targetHeight * aimFraction, 0)
  }, [camera, targetHeight, aimFraction])
  return null
}

const SPIN_DURATION_MS = 700

// A light that drifts toward the cursor so highlights slide across the model.
function PointerLight({ pointer, color }) {
  const light = useRef()
  useFrame(() => {
    if (!light.current) return
    const { x, y } = pointer.current
    light.current.position.x = THREE.MathUtils.lerp(light.current.position.x, x * 2.6, 0.06)
    light.current.position.y = THREE.MathUtils.lerp(light.current.position.y, 1.3 - y * 1.2, 0.06)
  })
  return <pointLight ref={light} position={[0, 1.3, 2.4]} intensity={1.1} distance={9} color={color} />
}

function Avatar({ pointer, modelUrl, targetHeight, tilt, reduceMotion, reflect }) {
  const group = useRef()
  const { scene } = useGLTF(modelUrl)
  const prevUrlRef = useRef(modelUrl)
  const spinRef = useRef({ active: false, start: 0 })

  // Switching characters (via the roster row) plays a full spin instead of
  // popping straight to the new model.
  useEffect(() => {
    if (prevUrlRef.current !== modelUrl) {
      prevUrlRef.current = modelUrl
      if (!reduceMotion) spinRef.current = { active: true, start: performance.now() }
    }
  }, [modelUrl, reduceMotion])

  // Meshy exports arrive with arbitrary scale/pivot — normalize so the
  // model stands at a consistent height, centered, feet on the floor.
  const model = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    box.getSize(size)
    const scale = targetHeight / (size.y || 1)
    clone.scale.setScalar(scale)

    const centered = new THREE.Box3().setFromObject(clone)
    const center = new THREE.Vector3()
    centered.getCenter(center)
    clone.position.x -= center.x
    clone.position.z -= center.z
    clone.position.y -= centered.min.y

    return clone
  }, [scene, targetHeight])

  // Faint upside-down copy under the feet: a cheap floor reflection that
  // works on a transparent canvas (a real reflector plane would be opaque).
  const mirror = useMemo(() => {
    if (!reflect) return null
    const clone = model.clone(true)
    clone.traverse((node) => {
      if (!node.isMesh) return
      node.material = node.material.clone()
      node.material.transparent = true
      node.material.opacity = 0.1
      node.material.depthWrite = false
    })
    return clone
  }, [model, reflect])

  useFrame(() => {
    if (!group.current) return

    if (spinRef.current.active) {
      const t = Math.min((performance.now() - spinRef.current.start) / SPIN_DURATION_MS, 1)
      const eased = 1 - (1 - t) ** 3 // ease-out cubic
      group.current.rotation.y = eased * Math.PI * 2
      if (t >= 1) {
        spinRef.current.active = false
        group.current.rotation.y = 0
      }
      return
    }

    if (!tilt || reduceMotion) return
    const targetRotY = pointer.current.x * 0.12
    const targetRotX = pointer.current.y * -0.06
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 0.04)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, 0.04)
  })

  return (
    <group ref={group}>
      <primitive object={model} />
      {mirror && (
        <group scale={[1, -1, 1]}>
          <primitive object={mirror} />
        </group>
      )}
    </group>
  )
}

export default function AvatarCanvas({
  modelUrl = BUSINESS_AVATAR_URL,
  targetHeight = 1.85,
  cameraFov = 28,
  frameMargin = 0.859,
  aimFraction = 0.5,
  tilt = true,
  grounded = true,
  live = true,
  accent = '#ff6b5e',
  className,
}) {
  const pointer = useRef({ x: 0, y: 0 })
  const wrapRef = useRef(null)
  const reduceMotion = useReducedMotion()
  // Static thumbnails render on demand; the live canvas stops when scrolled away.
  const inView = useInView(wrapRef)
  const covered = useContext(CoveredContext)
  const frameloop = !live ? 'demand' : inView && !covered ? 'always' : 'never'

  const cameraDistance =
    targetHeight / frameMargin / (2 * Math.tan((cameraFov * Math.PI) / 180 / 2))

  useEffect(() => {
    if (!tilt) return undefined
    function handleMove(e) {
      const el = wrapRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
      const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
      pointer.current.x = THREE.MathUtils.clamp(x, -1, 1)
      pointer.current.y = THREE.MathUtils.clamp(y, -1, 1)
    }
    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [tilt])

  return (
    <div className={`${styles.canvasWrap} ${className ?? ''}`} ref={wrapRef}>
      <Canvas
        frameloop={frameloop}
        camera={{ position: [0, targetHeight * aimFraction, cameraDistance], fov: cameraFov }}
        dpr={[1, 1.5]}
      >
        <CameraAim targetHeight={targetHeight} aimFraction={aimFraction} />
        <ambientLight intensity={live ? 0.5 : 0.9} />
        {live && (
          <Environment resolution={64} environmentIntensity={0.55}>
            <Lightformer form="rect" intensity={2.2} position={[0, 4, 3]} scale={[8, 3, 1]} color="#ffffff" />
            <Lightformer form="rect" intensity={1.4} position={[-5, 1, 1]} scale={[3, 6, 1]} color={accent} />
            <Lightformer form="rect" intensity={0.8} position={[5, 1, -2]} scale={[3, 6, 1]} color="#ffffff" />
          </Environment>
        )}
        <directionalLight position={[3, 5, 4]} intensity={1.4} />
        <directionalLight position={[-4, 2, -2]} intensity={0.6} color={accent} />
        {tilt && !reduceMotion && <PointerLight pointer={pointer} color="#fff1ec" />}
        <Suspense fallback={null}>
          <Avatar
            pointer={pointer}
            modelUrl={modelUrl}
            targetHeight={targetHeight}
            tilt={tilt}
            reduceMotion={reduceMotion}
            reflect={grounded}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload(BUSINESS_AVATAR_URL)
useGLTF.preload(PINK_SHIRT_AVATAR_URL)
useGLTF.preload(BROOKLYN_AVATAR_URL)

export { PINK_SHIRT_AVATAR_URL, BUSINESS_AVATAR_URL, BROOKLYN_AVATAR_URL }
