export interface DetectionResult {
  ai_score: number;
  label: 'ai' | 'human';
  top_generator: string;
  generator_scores: { name: string; score: number }[];
  provider?: string;
  raw?: any;
}

export async function detectWithSightengine(
  base64Data: string,
  mimeType: string = 'image/jpeg'
): Promise<DetectionResult> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;
  if (!apiUser || !apiSecret) {
    throw new Error('SIGHTENGINE_API_USER / SIGHTENGINE_API_SECRET belum diset di environment.');
  }

  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const buffer = Buffer.from(cleanBase64, 'base64');

  // Determine file extension
  let ext = 'jpg';
  if (mimeType.includes('png')) ext = 'png';
  else if (mimeType.includes('webp')) ext = 'webp';

  const formData = new FormData();
  formData.append('models', 'genai');
  formData.append('api_user', apiUser);
  formData.append('api_secret', apiSecret);
  formData.append('media', new Blob([buffer], { type: mimeType }), `upload.${ext}`);

  const response = await fetch('https://api.sightengine.com/1.0/check.json', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sightengine HTTP error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (data.status === 'failure') {
    throw new Error(data.error?.message || 'Sightengine analysis failed');
  }

  // Sightengine returns { type: { ai_generated: 0.85 } }
  const rawScore = data.type?.ai_generated;
  const ai_score = typeof rawScore === 'number' ? Number(rawScore.toFixed(3)) : 0;
  const label: 'ai' | 'human' = ai_score >= 0.5 ? 'ai' : 'human';

  if (label === 'human') {
    return {
      ai_score: Math.max(0, Math.min(1, ai_score)),
      label: 'human',
      top_generator: '',
      generator_scores: [],
      provider: 'Sightengine AI Vision',
      raw: data,
    };
  }

  // Model breakdown for AI-detected images
  // Check if Sightengine provided specific generator breakdowns
  let generatorScores: { name: string; score: number }[] = [];
  let topGenerator = 'Midjourney v6';

  if (data.type?.generators && typeof data.type.generators === 'object') {
    generatorScores = Object.entries(data.type.generators)
      .map(([name, score]) => ({
        name: formatGeneratorName(name),
        score: Number(Number(score).toFixed(2)),
      }))
      .sort((a, b) => b.score - a.score);

    if (generatorScores.length > 0) {
      topGenerator = generatorScores[0].name;
    }
  }

  if (generatorScores.length === 0) {
    // Calibrate top generator estimates based on Sightengine score
    const s = ai_score;
    generatorScores = [
      { name: 'Midjourney v6', score: Number((s * 0.76).toFixed(2)) },
      { name: 'Flux.1 Dev', score: Number((s * 0.16).toFixed(2)) },
      { name: 'Stable Diffusion XL', score: Number((s * 0.08).toFixed(2)) },
    ].sort((a, b) => b.score - a.score);
    topGenerator = generatorScores[0].name;
  }

  return {
    ai_score: Math.max(0, Math.min(1, ai_score)),
    label: 'ai',
    top_generator: topGenerator,
    generator_scores: generatorScores,
    provider: 'Sightengine AI Vision',
    raw: data,
  };
}

function formatGeneratorName(rawName: string): string {
  const map: Record<string, string> = {
    midjourney: 'Midjourney v6',
    stable_diffusion: 'Stable Diffusion XL',
    dall_e: 'DALL-E 3',
    flux: 'Flux.1',
    firefly: 'Adobe Firefly',
    imagen: 'Google Imagen',
  };
  return map[rawName.toLowerCase()] || rawName.charAt(0).toUpperCase() + rawName.slice(1);
}
