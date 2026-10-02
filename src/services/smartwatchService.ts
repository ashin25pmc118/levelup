/**
 * Smartwatch Bluetooth Service (Web Bluetooth API)
 * Directly connects web browsers (Chrome/Edge on Android & Desktop)
 * to Bluetooth Smartwatches (Noise, boAt, Amazfit, Garmin, Polar, etc.)
 * supporting standard Bluetooth GATT Services:
 * - Heart Rate (0x180D / 0x2A37)
 * - Pulse Oximeter / SpO2 (0x1822 / 0x2A5F, 0x2A5E)
 * - Battery Level (0x180F / 0x2A19)
 * 
 * 100% On-Device & Private — Zero Google Fit, Zero Cloud APIs, Zero Accounts.
 */

export type HRZone = 'rest' | 'warmup' | 'fatburn' | 'cardio' | 'peak' | 'berserk';

export interface BiometricReading {
  time: string;
  bpm: number;
  spO2: number | null;
}

export interface SmartwatchConnectionState {
  connected: boolean;
  deviceName: string | null;
  heartRate: number | null;
  spO2: number | null;
  hrv: number | null; // ms
  hrZone: HRZone;
  batteryLevel: number | null;
  lastUpdated: string | null;
  error: string | null;
  isSimulated?: boolean;
  history: BiometricReading[];
}

type HeartRateCallback = (bpm: number) => void;
type SpO2Callback = (spo2: number) => void;
type StatusCallback = (state: SmartwatchConnectionState) => void;

class SmartwatchService {
  private device: any | null = null;
  private server: any | null = null;
  private hrCharacteristic: any | null = null;
  private spo2Characteristic: any | null = null;
  private batteryCharacteristic: any | null = null;
  private simulatorTimer: any | null = null;

  private onHeartRateChange: HeartRateCallback | null = null;
  private onSpO2Change: SpO2Callback | null = null;
  private onStatusChange: StatusCallback | null = null;

  public state: SmartwatchConnectionState = {
    connected: false,
    deviceName: null,
    heartRate: null,
    spO2: null,
    hrv: null,
    hrZone: 'rest',
    batteryLevel: null,
    lastUpdated: null,
    error: null,
    isSimulated: false,
    history: []
  };

  /**
   * Check if Web Bluetooth is supported by the current browser environment
   */
  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  /**
   * Subscribe to heart rate updates
   */
  public setHeartRateListener(callback: HeartRateCallback | null) {
    this.onHeartRateChange = callback;
  }

  /**
   * Subscribe to SpO2 oxygen updates
   */
  public setSpO2Listener(callback: SpO2Callback | null) {
    this.onSpO2Change = callback;
  }

  /**
   * Subscribe to full connection state changes
   */
  public setStatusListener(callback: StatusCallback | null) {
    this.onStatusChange = callback;
  }

  private calculateZone(bpm: number): HRZone {
    if (bpm < 100) return 'rest';
    if (bpm < 120) return 'warmup';
    if (bpm < 140) return 'fatburn';
    if (bpm < 160) return 'cardio';
    if (bpm < 180) return 'peak';
    return 'berserk';
  }

  private updateState(partial: Partial<SmartwatchConnectionState>) {
    const updated = { ...this.state, ...partial };
    
    // Auto-calculate HR zone if heart rate changed
    if (updated.heartRate) {
      updated.hrZone = this.calculateZone(updated.heartRate);
    } else {
      updated.hrZone = 'rest';
    }

    this.state = updated;
    if (this.onStatusChange) {
      this.onStatusChange(this.state);
    }
  }

  /**
   * Connect to Smartwatch via Web Bluetooth (BLE GATT)
   * Zero Google Connect — Direct Hardware-to-Hardware
   */
  public async connect(): Promise<boolean> {
    this.stopSimulator();

    if (!this.isSupported()) {
      const msg = 'Web Bluetooth is not supported in this browser. Please open in Google Chrome on Android or Desktop.';
      this.updateState({ error: msg });
      alert(msg);
      return false;
    }

    try {
      this.updateState({ error: null });

      const optionalServices = [
        'heart_rate',
        'pulse_oximeter',
        'battery_service',
        'device_information',
        0x180D, // Heart Rate
        0x1822, // Pulse Oximeter
        0x180F, // Battery Service
        0x180A, // Device Information
        0x1800, // Generic Access
        0x1801, // Generic Attribute
        0xFEE0, // Mi / Amazfit / Generic sports band
        0xFEE7  // Health Profile (Noise, boAt, Fire-Boltt, DaFit)
      ];

      // Use acceptAllDevices: true so Chrome displays ALL nearby Bluetooth devices without hiding them
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices
      });

      if (!device) return false;

      this.device = device;
      this.updateState({
        deviceName: device.name || 'Bluetooth Smartwatch',
        connected: false
      });

      device.addEventListener('gattserverdisconnected', () => {
        this.updateState({
          connected: false,
          heartRate: null,
          spO2: null,
          hrv: null,
          error: 'Smartwatch disconnected.'
        });
      });

      // Connect to GATT Server
      const server = await device.gatt.connect();
      this.server = server;

      // 1. Connect to Heart Rate Service (0x180D)
      try {
        let hrService: any = null;
        try {
          hrService = await server.getPrimaryService('heart_rate');
        } catch {
          hrService = await server.getPrimaryService(0x180D);
        }

        if (hrService) {
          let hrChar: any = null;
          try {
            hrChar = await hrService.getCharacteristic('heart_rate_measurement');
          } catch {
            hrChar = await hrService.getCharacteristic(0x2A37);
          }

          if (hrChar) {
            this.hrCharacteristic = hrChar;
            await hrChar.startNotifications();
            hrChar.addEventListener('characteristicvaluechanged', (event: any) => {
              const value = event.target.value;
              const { bpm, hrv } = this.parseHeartRatePayload(value);
              const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              const newHistory = [...this.state.history, { time, bpm, spO2: this.state.spO2 }].slice(-40);

              this.updateState({
                heartRate: bpm,
                hrv: hrv !== null ? hrv : this.state.hrv,
                lastUpdated: time,
                history: newHistory
              });

              if (this.onHeartRateChange) {
                this.onHeartRateChange(bpm);
              }
            });
          }
        }
      } catch (hrErr) {
        console.warn('Standard Heart Rate service not available on this watch:', hrErr);
      }

      // 2. Connect to Pulse Oximeter / SpO2 Service (0x1822)
      try {
        let oximeterService: any = null;
        try {
          oximeterService = await server.getPrimaryService('pulse_oximeter');
        } catch {
          try {
            oximeterService = await server.getPrimaryService(0x1822);
          } catch {}
        }

        if (oximeterService) {
          let oximeterChar: any = null;
          try {
            oximeterChar = await oximeterService.getCharacteristic('plx_continuous_measurement_characteristic');
          } catch {
            try {
              oximeterChar = await oximeterService.getCharacteristic('plx_spot_check_measurement_characteristic');
            } catch {
              try {
                oximeterChar = await oximeterService.getCharacteristic(0x2A5F);
              } catch {
                oximeterChar = await oximeterService.getCharacteristic(0x2A5E);
              }
            }
          }

          if (oximeterChar) {
            this.spo2Characteristic = oximeterChar;
            await oximeterChar.startNotifications();
            oximeterChar.addEventListener('characteristicvaluechanged', (event: any) => {
              const value = event.target.value;
              const spo2 = this.parseSpO2Payload(value);
              if (spo2) {
                this.updateState({ spO2: spo2 });
                if (this.onSpO2Change) {
                  this.onSpO2Change(spo2);
                }
              }
            });
          }
        }
      } catch (oxErr) {
        console.info('Standard Pulse Oximeter service not detected.');
      }

      // 3. Connect to Battery Service (0x180F)
      try {
        let batteryService: any = null;
        try {
          batteryService = await server.getPrimaryService('battery_service');
        } catch {
          try {
            batteryService = await server.getPrimaryService(0x180F);
          } catch {}
        }

        if (batteryService) {
          const batteryChar = await batteryService.getCharacteristic('battery_level');
          this.batteryCharacteristic = batteryChar;
          const val = await batteryChar.readValue();
          const level = val.getUint8(0);
          this.updateState({ batteryLevel: level });

          try {
            await batteryChar.startNotifications();
            batteryChar.addEventListener('characteristicvaluechanged', (event: any) => {
              const newLevel = event.target.value.getUint8(0);
              this.updateState({ batteryLevel: newLevel });
            });
          } catch {}
        }
      } catch (batErr) {
        console.info('Battery service not exposed by watch.');
      }

      this.updateState({
        connected: true,
        error: null,
        isSimulated: false,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });

      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (!errorMsg.includes('cancelled') && !errorMsg.includes('canceled')) {
        this.updateState({ error: `Connection failed: ${errorMsg}` });
      }
      return false;
    }
  }

  /**
   * Disconnect the active Bluetooth connection
   */
  public disconnect() {
    this.stopSimulator();
    try {
      if (this.device && this.device.gatt?.connected) {
        this.device.gatt.disconnect();
      }
    } catch {}
    this.device = null;
    this.server = null;
    this.hrCharacteristic = null;
    this.spo2Characteristic = null;
    this.batteryCharacteristic = null;
    this.updateState({
      connected: false,
      heartRate: null,
      spO2: null,
      hrv: null,
      deviceName: null,
      batteryLevel: null,
      isSimulated: false,
      error: null
    });
  }

  /**
   * Parse Bluetooth GATT Heart Rate Measurement payload (0x2A37)
   */
  private parseHeartRatePayload(value: DataView): { bpm: number; hrv: number | null } {
    const flags = value.getUint8(0);
    const is16Bit = (flags & 0x01) !== 0;
    let offset = 1;
    let bpm = 0;

    if (is16Bit) {
      bpm = value.getUint16(offset, true);
      offset += 2;
    } else {
      bpm = value.getUint8(offset);
      offset += 1;
    }

    // Energy Expended (bit 3)
    if ((flags & 0x08) !== 0) {
      offset += 2;
    }

    // RR-Intervals (bit 4) for HRV
    let hrv: number | null = null;
    if ((flags & 0x10) !== 0 && offset + 2 <= value.byteLength) {
      const rrIntervalRaw = value.getUint16(offset, true);
      // RR is in units of 1/1024 seconds -> convert to milliseconds
      hrv = Math.round((rrIntervalRaw / 1024) * 1000);
    }

    return { bpm, hrv };
  }

  /**
   * Parse Bluetooth GATT Pulse Oximeter payload (0x2A5F / 0x2A5E)
   */
  private parseSpO2Payload(value: DataView): number | null {
    if (value.byteLength < 2) return null;
    try {
      // Decode IEEE 11073-20601 SFLOAT or integer %
      const raw = value.getUint16(0, true);
      const mantissa = raw & 0x0FFF;
      let spo2 = mantissa;
      if (spo2 > 100) {
        spo2 = value.getUint8(1);
      }
      return spo2 >= 70 && spo2 <= 100 ? spo2 : 98;
    } catch {
      return null;
    }
  }

  /**
   * Start Built-in Biometrics Simulator
   * Allows 1-click real-time testing without physical hardware
   */
  public startSimulator() {
    this.disconnect();

    let simBpm = 76;
    let simSpO2 = 98;
    let simBattery = 92;
    let stepCount = 0;

    this.updateState({
      connected: true,
      isSimulated: true,
      deviceName: 'Hunter Watch (Simulated Live)',
      heartRate: simBpm,
      spO2: simSpO2,
      hrv: 64,
      batteryLevel: simBattery,
      error: null,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    this.simulatorTimer = setInterval(() => {
      stepCount++;
      // Create realistic workout wave: warms up from 76 to 148 BPM, then fluctuates
      const wave = Math.sin(stepCount * 0.15);
      simBpm = Math.round(110 + wave * 35 + (Math.random() * 4 - 2));
      simSpO2 = 97 + (stepCount % 5 === 0 ? 1 : 0);
      const simHrv = Math.round(55 + Math.cos(stepCount * 0.2) * 15);

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newHistory = [...this.state.history, { time, bpm: simBpm, spO2: simSpO2 }].slice(-40);

      this.updateState({
        heartRate: simBpm,
        spO2: simSpO2,
        hrv: simHrv,
        lastUpdated: time,
        history: newHistory
      });

      if (this.onHeartRateChange) {
        this.onHeartRateChange(simBpm);
      }
      if (this.onSpO2Change) {
        this.onSpO2Change(simSpO2);
      }
    }, 1000);
  }

  /**
   * Stop Built-in Biometrics Simulator
   */
  public stopSimulator() {
    if (this.simulatorTimer) {
      clearInterval(this.simulatorTimer);
      this.simulatorTimer = null;
    }
  }
}

export const smartwatch = new SmartwatchService();
