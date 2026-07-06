import { EditorElement } from '../types';

/**
 * Resolves overlaps by recursively pushing colliding elements downwards.
 * The moving element (acting as reference) acts as a fixed anchor and cannot be pushed.
 */
export const resolveCollisions = (
  elements: EditorElement[],
  movingElId: string
): EditorElement[] => {
  const resolved = elements.map(el => ({ ...el }));
  const fixedIds = new Set<string>([movingElId]);
  
  let hasCollision = true;
  let loops = 0;
  
  // Prevent infinite loops by capping iterations
  while (hasCollision && loops < 100) {
    hasCollision = false;
    loops++;
    
    for (let i = 0; i < resolved.length; i++) {
      const elA = resolved[i];
      
      for (let j = 0; j < resolved.length; j++) {
        if (i === j) continue;
        const elB = resolved[j];
        
        // Check 12-column grid intersection
        const isOverlapping = 
          elA.gridX < elB.gridX + elB.gridW &&
          elA.gridX + elA.gridW > elB.gridX &&
          elA.gridY < elB.gridY + elB.gridH &&
          elA.gridY + elA.gridH > elB.gridY;
          
        if (isOverlapping) {
          let elementToPush: EditorElement;
          let referenceElement: EditorElement;
          
          if (fixedIds.has(elA.id)) {
            elementToPush = elB;
            referenceElement = elA;
          } else if (fixedIds.has(elB.id)) {
            elementToPush = elA;
            referenceElement = elB;
          } else {
            // Push B if it is lower/equal vertically, otherwise push A
            if (elB.gridY >= elA.gridY) {
              elementToPush = elB;
              referenceElement = elA;
            } else {
              elementToPush = elA;
              referenceElement = elB;
            }
          }
          
          // Push elementToPush directly under referenceElement
          elementToPush.gridY = referenceElement.gridY + referenceElement.gridH;
          fixedIds.add(elementToPush.id);
          hasCollision = true;
        }
      }
    }
  }
  
  return resolved;
};
