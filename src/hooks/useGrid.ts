import { useAtom } from "jotai"
import * as THREE from "three"
import { mapAtom } from "~/Experience";

export const useGrid = () => {
  const [ map ] = useAtom( mapAtom );

  const vector3ToGrid = (vector3: any) => {
    return [
      Math.floor( vector3.x * map.gridDivision ),
      Math.floor( vector3.z * map.gridDivision ),
    ]
  }
  
  const gridToVector3 = (gridPosition: number[], width = 1, height = 1) => {
    return new THREE.Vector3(
      (width / map.gridDivision / 2) + (gridPosition[0] / map.gridDivision),
      0,
      (height / map.gridDivision / 2) + (gridPosition[1] / map.gridDivision),
    )
  }

  return {
    vector3ToGrid,
    gridToVector3
  }
}