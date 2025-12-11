export const angleClamp = (angle: number): number => {
  return angle % (Math.PI * 2);
};

export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
};

export const map = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number => {
  return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
};

export const fract = (value: number): number => {
  return value - Math.floor(value);
};

export const colorcode2array = (colorcode: string): [number, number, number, number] => {
  if (colorcode.startsWith("#")) {
    colorcode = colorcode.slice(1);
  }
  if (colorcode.length === 3) {
    const r = parseInt(colorcode[0] + colorcode[0], 16);
    const g = parseInt(colorcode[1] + colorcode[1], 16);
    const b = parseInt(colorcode[2] + colorcode[2], 16);
    return [r, g, b, 255];
  }
  if (colorcode.length === 4) {
    const r = parseInt(colorcode[0] + colorcode[0], 16);
    const g = parseInt(colorcode[1] + colorcode[1], 16);
    const b = parseInt(colorcode[2] + colorcode[2], 16);
    const a = parseInt(colorcode[3] + colorcode[3], 16);
    return [r, g, b, a];
  }
  if (colorcode.length === 6) {
    const r = parseInt(colorcode.slice(0, 2), 16);
    const g = parseInt(colorcode.slice(2, 4), 16);
    const b = parseInt(colorcode.slice(4, 6), 16);
    return [r, g, b, 255];
  }
  if (colorcode.length === 8) {
    const r = parseInt(colorcode.slice(0, 2), 16);
    const g = parseInt(colorcode.slice(2, 4), 16);
    const b = parseInt(colorcode.slice(4, 6), 16);
    const a = parseInt(colorcode.slice(6, 8), 16);
    return [r, g, b, a];
  }
  throw new Error(`Invalid color code: ${colorcode}`);
};

export const colorcode2rgbArray = (colorcode: string): [number, number, number, number] => {
  const [r, g, b, a] = colorcode2array(colorcode);
  return [r / 255, g / 255, b / 255, a / 255];
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const zigzag = (value: number): number => {
  return Math.abs(value % 2 - 1);
};