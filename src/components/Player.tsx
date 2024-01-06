/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.13 .\\public\\models\\Animated Woman.glb -o src/components/Avatar.sx -r public 
*/

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from "three-stdlib"
import { useFrame } from '@react-three/fiber';
import { useGrid } from '../hooks/useGrid';
import * as THREE from "three"

const PLAYER_MODEL_GLB = "models/character.glb";
const MOVEMENT_SPEED = 0.05;
const ANIMATIONS = {
  IDLE: {
    path: "models/animations/M_Standing_Idle_001.glb",
    name: "M_Standing_Idle_001"
  },
  WALK: {
    path: "models/animations/M_Walk_001.glb",
    name: "M_Walk_001",
  },
  DANCE: {
    path: "models/animations/M_Dances_001.glb",
    name: "M_Dances_001",
  },
};

interface PlayerProps {
  externalPath: [];
  position: THREE.Vector3;
}

export function Player({
  externalPath = [],
  position,
}: PlayerProps) {
  const playerPosition = useMemo(() => position, []);
  const avatar = useRef();
  const [ path, setPath ] = useState<THREE.Vector3[]>();
  const { gridToVector3 } = useGrid();
  
  const group = useRef();
  const { scene } = useGLTF( PLAYER_MODEL_GLB );
  
  // Skinned meshes cannot be re-used in threejs without cloning them
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])

  useEffect(() => {
    const newPath: THREE.Vector3[] = [];
    externalPath?.forEach((gridPosition) => {
      newPath.push( gridToVector3(gridPosition) );
    });

    setPath(newPath)
  }, [externalPath]);

  // Load animations
  const { animations: idleAnimation } = useGLTF( ANIMATIONS.IDLE.path );
  const { animations: walkAnimation } = useGLTF( ANIMATIONS.WALK.path );
  const { animations: danceAnimation } = useGLTF( ANIMATIONS.DANCE.path );

  // Rename the name of the animation
  // idleAnimation[0].name = "idle";
  // walkAnimation[0].name = "walk";

  // Use animations
  const { actions } = useAnimations([
    idleAnimation[0],
    walkAnimation[0],
    danceAnimation[0],
  ], avatar);

  // const [isDancing, setIsDancing] = useState(false);
  const [animation, setAnimation] = useState(ANIMATIONS.IDLE.name);

  useEffect(() => {
    actions[animation]?.reset().fadeIn(0.32).play();
    //console.log(animation)
    // actions[animation]?.fadeIn(0.32).play();

    return () => actions[animation]?.fadeOut(0.32);
  }, [animation])

  useFrame((state, delta) => {
    // Some of the ready player me animations are not fixed (they move)
    // so we need to force them not to move
    // the bone of the animation which is causing it is 'Hips'
    if(avatar.current) {
      const hips = avatar.current.getObjectByName("Hips");
      hips.position.set(0, hips.position.y, 0);
    }

    const pos = group.current.position;
    
    if (path?.length && pos.distanceTo(path[0]) > 0.1) {
      const direction = pos
        .clone()
        .sub(path[0])
        .normalize()
        .multiplyScalar(MOVEMENT_SPEED);
      
      group.current.position.sub( direction );
      group.current.lookAt( path[0] );
      setAnimation(ANIMATIONS.WALK.name);
      // setIsDancing(false)
    } else if (path?.length) {
      path.shift();
    } else {
      // if(isDancing) {
      //  setAnimation(ANIMATIONS.DANCE.name)
      //} else {
      setAnimation(ANIMATIONS.IDLE.name); 
      // }
    }

    // Camera to follow character
    state.camera.position.x = pos.x + 7;
    state.camera.position.y = pos.y + 7;
    state.camera.position.z = pos.z + 7;

    // Set look at position
    const lookAtVector = new THREE.Vector3( pos.x, pos.y + 1, pos.z )
    state.camera.lookAt( lookAtVector );
  })

  useEffect(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    })
  }, [])

  return (
    <group ref={group} position={playerPosition} dispose={null} name={"player"}>
      <primitive object={clone} ref={avatar}/>
    </group>
  )
}

//useGLTF.preload(FILE_PATH);
useGLTF.preload(ANIMATIONS.IDLE.path);
useGLTF.preload(ANIMATIONS.WALK.path);
useGLTF.preload(ANIMATIONS.DANCE.path);
