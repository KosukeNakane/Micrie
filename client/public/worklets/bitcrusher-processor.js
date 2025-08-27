// Simple bitcrusher AudioWorkletProcessor
// Params:
//  - bits (default 16)
//  - downsample (default 1) integer sample-hold factor

class BitcrusherProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'bits', defaultValue: 16, minValue: 1, maxValue: 24, automationRate: 'k-rate' },
      { name: 'downsample', defaultValue: 1, minValue: 1, maxValue: 64, automationRate: 'k-rate' },
    ];
  }

  constructor() {
    super();
    this._lastVals = [];
    this._counters = [];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    if (!input || input.length === 0) return true;

    const bits = Math.max(1, Math.floor(parameters.bits.length > 0 ? parameters.bits[0] : 16));
    const step = 2 / (Math.pow(2, bits) - 1);
    const factor = Math.max(1, Math.floor(parameters.downsample.length > 0 ? parameters.downsample[0] : 1));

    for (let ch = 0; ch < input.length; ch++) {
      const src = input[ch];
      const dst = output[ch] || (output[ch] = new Float32Array(src.length));
      let last = this._lastVals[ch] ?? 0;
      let count = this._counters[ch] ?? 0;
      for (let i = 0; i < src.length; i++) {
        if (count === 0) {
          const x = src[i];
          // Quantize to given bit depth
          const q = Math.round((x + 1) / step) * step - 1; // map -1..1
          last = q;
        }
        dst[i] = last;
        count = (count + 1) % factor;
      }
      this._lastVals[ch] = last;
      this._counters[ch] = count;
    }
    return true;
  }
}

registerProcessor('bitcrusher-processor', BitcrusherProcessor);

