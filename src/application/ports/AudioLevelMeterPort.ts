export interface AudioLevelMeterPort {
  /** Starts listening to the microphone; `onLevel` receives a 0-100 level. */
  start(onLevel: (level: number) => void): Promise<void>;
  stop(): void;
}
