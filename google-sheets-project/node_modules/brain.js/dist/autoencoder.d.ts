import { INeuralNetworkData, INeuralNetworkTrainOptions } from './neural-network';
import { INeuralNetworkState } from './neural-network-types';
export interface IAEOptions {
    binaryThresh: number;
    decodedSize: number;
    hiddenLayers: number[];
}
/**
 * An autoencoder learns to compress input data down to relevant features and reconstruct input data from its compressed representation.
 */
export declare class AE<DecodedData extends INeuralNetworkData, EncodedData extends INeuralNetworkData> {
    private decoder?;
    private readonly denoiser;
    constructor(options?: Partial<IAEOptions>);
    /**
     * Denoise input data, removing any anomalies from the data.
     * @param {DecodedData} input
     * @returns {DecodedData}
     */
    denoise(input: DecodedData): DecodedData;
    /**
     * Decode `EncodedData` into an approximation of its original form.
     *
     * @param {EncodedData} input
     * @returns {DecodedData}
     */
    decode(input: EncodedData): DecodedData;
    /**
     * Encode data to extract features, reduce dimensionality, etc.
     *
     * @param {DecodedData} input
     * @returns {EncodedData}
     */
    encode(input: DecodedData): EncodedData;
    /**
     * Test whether or not a data sample likely contains anomalies.
     * If anomalies are likely present in the sample, returns `true`.
     * Otherwise, returns `false`.
     *
     * @param {DecodedData} input
     * @returns {boolean}
     */
    likelyIncludesAnomalies(input: DecodedData, anomalyThreshold?: number): boolean;
    /**
     * Train the auto encoder.
     *
     * @param {DecodedData[]} data
     * @param {Partial<INeuralNetworkTrainOptions>} options
     * @returns {INeuralNetworkState}
     */
    train(data: DecodedData[], options?: Partial<INeuralNetworkTrainOptions>): INeuralNetworkState;
    /**
     * Create a new decoder from the trained denoiser.
     *
     * @returns {NeuralNetworkGPU<EncodedData, DecodedData>}
     */
    private createDecoder;
    /**
     * Get the layer containing the encoded representation.
     */
    private get encodedLayer();
    /**
     * Get the offset of the encoded layer.
     */
    private get encodedLayerIndex();
}
export default AE;
//# sourceMappingURL=autoencoder.d.ts.map