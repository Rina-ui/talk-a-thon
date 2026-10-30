export type SoundEffect = 'tick' | 'freeze' | 'resume' | 'complete';

export interface SoundPlayerPort {
  /** Unlocks audio; call from a user gesture. */
  prime(): void;
  setEnabled(enabled: boolean): void;
  play(effect: SoundEffect): void;
}
