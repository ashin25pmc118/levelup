/**
 * Smartwatch Bluetooth Service (Web Bluetooth API)
 * Directly connects web browsers (Google Chrome on Android & Desktop)
 * to Bluetooth Smartwatches (Noise, boAt, Amazfit, Garmin, etc.)
 * supporting standard Bluetooth GATT Heart Rate Service (0x180D).
 */

export interface SmartwatchConnectionState {
  connected: boolean;
  deviceName: string | null;
  heartRate: number | null;
  lastUpdated: string | null;
  batteryLevel?: number | null;
  error?: string | null;
}

type HeartRateCallback = (bpm: number) => void;
type StatusCallback = (state: SmartwatchConnectionState) => void;

class SmartwatchService {
  private device: any | null = null;
  private server: any | null = null;
  private heartRateCharacteristic: any | null = null;
  private onHeartRateChange: HeartRateCallback | null = null;
  private onStatusChange: StatusCallback | null = null;

  public state: SmartwatchConnectionState = {
    connected: false,
    deviceName: null,
    heartRate: null,
    lastUpdated: null,
    batteryLevel: null,
    error: null
  };

  /**
   * Check if Web Bluetooth is supported by the current browser
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
   * Subscribe to connection state changes
   */
  public setStatusListener(callback: StatusCallback | null) {
    this.onStatusChange = callback;
  }

  private updateState(partial: Partial<SmartwatchConnectionState>) {
    this.state = { ...this.state, ...partial };
    if (this.onStatusChange) {
      this.onStatusChange(this.state);
    }
  }

  /**
   * Request Bluetooth Pairing with Smartwatch
   */
  public async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      const msg = 'Web Bluetooth is not supported in this browser. Please open in Google Chrome on Android.';
      this.updateState({ error: msg });
      alert(msg);
      return false;
    }

    try {
      this.updateState({ error: null });

      // Request Bluetooth device with Heart Rate service or name filter
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] }
        ],
        optionalServices: ['heart_rate', 'battery_service', 0x180D, 0x180F]
      }).catch(async () => {
        // Fallback: accept all devices if standard filter does not show watch
        return await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['heart_rate', 'battery_service', 0x180D, 0x180F]
        });
      });

      if (!device) return false;

      this.device = device;
      this.updateState({ deviceName: device.name || 'Noise Smartwatch' });

      device.addEventListener('gattserverdisconnected', () => {
        this.updateState({
          connected: false,
          heartRate: null,
          error: 'Watch disconnected.'
        });
      });

      // Connect to GATT Server
      const server = await device.gatt.connect();
      this.server = server;

      // Connect to Heart Rate Service (0x180D)
      try {
        const hrService = await server.getPrimaryService('heart_rate');
        const hrChar = await hrService.getCharacteristic('heart_rate_measurement');
        this.heartRateCharacteristic = hrChar;

        // Start Notifications
        await hrChar.startNotifications();
        hrChar.addEventListener('characteristicvaluechanged', (event: any) => {
          const value = event.target.value;
          const bpm = this.parseHeartRate(value);
          this.updateState({
            heartRate: bpm,
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });
          if (this.onHeartRateChange) {
            this.onHeartRateChange(bpm);
          }
        });
      } catch (hrErr) {
        console.warn('Heart rate service not directly accessible on this model:', hrErr);
      }

      this.updateState({ connected: true, error: null });
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
    try {
      if (this.device && this.device.gatt.connected) {
        this.device.gatt.disconnect();
      }
    } catch {}
    this.device = null;
    this.server = null;
    this.heartRateCharacteristic = null;
    this.updateState({
      connected: false,
      heartRate: null,
      deviceName: null,
      error: null
    });
  }

  /**
   * Parse Bluetooth GATT Heart Rate Measurement payload
   */
  private parseHeartRate(value: DataView): number {
    const flags = value.getUint8(0);
    const is16Bit = (flags & 0x01) !== 0;
    if (is16Bit) {
      return value.getUint16(1, true); // Little-endian 16-bit
    } else {
      return value.getUint8(1); // 8-bit integer
    }
  }
}

export const smartwatch = new SmartwatchService();
