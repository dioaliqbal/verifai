import { detectWithSightengine, DetectionResult } from './sightengineDetector.ts';

export async function analyzeImageForensics(
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<DetectionResult> {
  return detectWithSightengine(base64Data, mimeType);
}
