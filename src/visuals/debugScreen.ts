import type { VisualRenderContext } from "../types/render";

export class DebugScreen {
  draw(ctx: VisualRenderContext): void {
    const { p, tex, midiManager, audioManager, captureManager, beat, font } = ctx;

    const midiFaders = midiManager.faderValues.map((value: number) => value.toFixed(2)).join(", ");
    const midiToggles = midiManager.faderButtonToggleState
      .map((state: boolean) => (state ? "1" : "0"))
      .join(" ");

    const volume = audioManager?.getVolume() ?? 0;
    const volumeNormalized = Math.min(volume * 8, 1);
    const frequencyData = audioManager?.getFrequencyData() ?? new Uint8Array(0);

    const bandDefinitions = audioManager
      ? (
          [
            { label: "Sub 20-120Hz", min: 20, max: 120, threshold: 0.2 },
            { label: "LoMid 120-400Hz", min: 120, max: 400, threshold: 0.2 },
            { label: "Mid 400-2kHz", min: 400, max: 2000, threshold: 0.18 },
            { label: "Hi 2k-8kHz", min: 2000, max: 8000, threshold: 0.16 },
          ] as const
        ).map((band) => {
          const level = audioManager.getBandLevel(band.min, band.max);
          const triggered = audioManager.getFrequencyTrigger(band.min, band.max, band.threshold);
          return { ...band, level, triggered };
        })
      : [];

    const captureReady = captureManager?.isReady() ?? false;
    const captureTexture = captureManager?.getTexture();

    const margin = tex.width * 0.04;
    const infoWidth = tex.width * 0.48;
    const infoX = margin;
    const infoY = margin;
    const lineHeight = 20;

    const infoLines = [
      "Debug Screen",
      `Beat: ${beat.toFixed(2)}`,
      `MIDI Page: ${midiManager.currentPageIndex}`,
      `MIDI Faders: [${midiFaders}]`,
      `MIDI Toggles: [${midiToggles}]`,
      `Audio Volume RMS: ${volume.toFixed(3)}`,
      `Spectrum Bins: ${frequencyData.length}`,
      ...bandDefinitions.map(
        (band) => `${band.label}: ${band.triggered ? "ON" : "off"} (lvl ${band.level.toFixed(2)})`,
      ),
      `Capture Ready: ${captureReady ? "yes" : "no"}`,
      `Capture Size: ${
        captureTexture ? `${captureTexture.width}x${captureTexture.height}` : "n/a"
      }`,
    ];

    const infoHeight = infoLines.length * lineHeight + 24;

    tex.push();
    tex.noStroke();
    tex.fill(0, 220);
    tex.rect(infoX - 16, infoY - 16, infoWidth + 32, infoHeight, 12);

    tex.fill(255);
    tex.textSize(16);
    tex.textAlign(p.LEFT, p.TOP);
    if (font) {
      tex.textFont(font);
    }

    infoLines.forEach((line, index) => {
      tex.text(line, infoX, infoY + index * lineHeight);
    });
    tex.pop();

    // 音量メーターと帯域メーター（モノクロ）
    tex.push();
    tex.fill(255);
    tex.textSize(14);
    tex.textAlign(p.LEFT, p.TOP);
    if (font) {
      tex.textFont(font);
    }

    let meterY = infoY + infoHeight + 12;
    const meterX = infoX;
    const meterWidth = infoWidth;
    const meterHeight = 14;

    tex.text("Volume", meterX, meterY);
    meterY += lineHeight * 0.7;

    tex.noFill();
    tex.stroke(150);
    tex.rect(meterX, meterY, meterWidth, meterHeight);
    tex.noStroke();
    tex.fill(255);
    tex.rect(meterX, meterY, meterWidth * volumeNormalized, meterHeight);

    meterY += meterHeight + 10;

    bandDefinitions.forEach((band) => {
      tex.fill(255);
      tex.text(`${band.label}`, meterX, meterY);
      meterY += lineHeight * 0.7;

      tex.noFill();
      tex.stroke(150);
      tex.rect(meterX, meterY, meterWidth, meterHeight);
      tex.noStroke();
      tex.fill(band.triggered ? 255 : 120);
      tex.rect(meterX, meterY, meterWidth * Math.min(band.level, 1), meterHeight);

      meterY += meterHeight + 10;
    });
    tex.pop();

    // オーディオスペクトラム可視化
    tex.push();
    const spectrumHeight = tex.height * 0.22;
    const spectrumWidth = tex.width - margin * 2;
    const spectrumX = margin;
    const spectrumY = tex.height - spectrumHeight - margin;

    tex.noFill();
    tex.stroke(80);
    tex.rect(spectrumX, spectrumY, spectrumWidth, spectrumHeight);

    if (frequencyData.length > 0) {
      const barCount = 96;
      const step = Math.max(1, Math.floor(frequencyData.length / barCount));
      const barWidth = spectrumWidth / barCount;

      tex.stroke(255);
      tex.strokeWeight(1);

      for (let i = 0; i < barCount; i++) {
        const startIndex = i * step;
        let sum = 0;
        let count = 0;
        for (let j = 0; j < step && startIndex + j < frequencyData.length; j++) {
          sum += frequencyData[startIndex + j];
          count += 1;
        }
        if (count === 0) {
          continue;
        }
        const level = sum / count / 255;
        const barHeight = spectrumHeight * level;
        const x = spectrumX + i * barWidth;
        tex.line(x, spectrumY + spectrumHeight, x, spectrumY + spectrumHeight - barHeight);
      }
    } else {
      tex.fill(200);
      tex.noStroke();
      tex.textSize(14);
      tex.textAlign(p.CENTER, p.CENTER);
      if (font) {
        tex.textFont(font);
      }
      tex.text("Audio inactive", spectrumX + spectrumWidth / 2, spectrumY + spectrumHeight / 2);
    }
    tex.pop();

    // キャプチャプレビュー（グレースケール）
    const previewWidth = tex.width * 0.28;
    const previewX = tex.width - previewWidth - margin;
    const previewY = margin;

    tex.push();
    if (captureReady && captureTexture) {
      const aspect =
        captureTexture.width > 0 && captureTexture.height > 0
          ? captureTexture.height / captureTexture.width
          : 1;
      const previewHeight = previewWidth * aspect;

      const previewImage = captureTexture.get(0, 0, captureTexture.width, captureTexture.height);
      tex.image(previewImage, previewX, previewY, previewWidth, previewHeight);
      tex.noFill();
      tex.stroke(255);
      tex.rect(previewX, previewY, previewWidth, previewHeight);

      tex.fill(255);
      tex.textSize(14);
      tex.textAlign(p.RIGHT, p.TOP);
      if (font) {
        tex.textFont(font);
      }
      tex.text("Capture Preview", previewX + previewWidth, previewY + previewHeight + 8);
    } else {
      const previewHeight = previewWidth * 0.56;
      tex.noFill();
      tex.stroke(120);
      tex.rect(previewX, previewY, previewWidth, previewHeight);

      tex.fill(200);
      tex.textSize(14);
      tex.textAlign(p.CENTER, p.CENTER);
      if (font) {
        tex.textFont(font);
      }
      tex.text("Capture inactive", previewX + previewWidth / 2, previewY + previewHeight / 2);
    }
    tex.pop();
  }
}
