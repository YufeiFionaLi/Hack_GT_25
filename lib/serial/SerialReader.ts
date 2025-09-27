/**
 * Web Serial API integration for reading vitals data from Arduino
 */

// Type definitions for Web Serial API
interface SerialPort {
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
}

interface Serial {
  requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
  getPorts(): Promise<SerialPort[]>;
  addEventListener(type: 'connect', listener: (event: Event) => void): void;
  addEventListener(type: 'disconnect', listener: (event: Event) => void): void;
  removeEventListener(type: 'connect', listener: (event: Event) => void): void;
  removeEventListener(type: 'disconnect', listener: (event: Event) => void): void;
}

interface SerialPortRequestOptions {
  filters: SerialPortFilter[];
}

interface SerialPortFilter {
  usbVendorId?: number;
  usbProductId?: number;
}

declare global {
  interface Navigator {
    serial: Serial;
  }
}

export interface SerialData {
  ts: number;
  bp: {
    sys: number;
    dia: number;
  };
  hr: number;
  spo2: number;
  tempC: number;
  weightKg?: number;
}

export class SerialReader {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private isConnected = false;
  private onDataCallback: ((data: SerialData) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  /**
   * Check if Web Serial API is supported
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'serial' in navigator;
  }

  /**
   * Connect to a serial port
   */
  async connect(): Promise<void> {
    if (!SerialReader.isSupported()) {
      throw new Error('Web Serial API is not supported in this browser');
    }

    try {
      // Request port access
      this.port = await (navigator as Navigator & { serial: Serial }).serial.requestPort();
      
      if (!this.port) {
        throw new Error('No port selected');
      }
      
      // Open the port with 115200 baud rate
      await this.port.open({ baudRate: 115200 });
      
      this.isConnected = true;
      
      // Start reading data
      this.startReading();
    } catch (error) {
      this.isConnected = false;
      throw new Error(`Failed to connect to serial port: ${error}`);
    }
  }

  /**
   * Start reading data from the serial port
   */
  private async startReading(): Promise<void> {
    if (!this.port || !this.isConnected) return;

    try {
      const textDecoder = new TextDecoder();
      this.reader = this.port?.readable?.getReader() || null;

      if (!this.reader) {
        throw new Error('Failed to get reader from serial port');
      }

      while (this.isConnected && this.reader) {
        try {
          const { value, done } = await this.reader.read();
          
          if (done) break;

          const chunk = textDecoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
              try {
                const data: SerialData = JSON.parse(trimmedLine);
                this.onDataCallback?.(data);
              } catch {
                // Skip invalid JSON lines
                console.warn('Failed to parse serial data:', trimmedLine);
              }
            }
          }
        } catch (readError) {
          console.error('Error reading from serial port:', readError);
          this.onErrorCallback?.(new Error(`Read error: ${readError}`));
          break;
        }
      }
    } catch (error) {
      this.onErrorCallback?.(new Error(`Serial reading error: ${error}`));
    }
  }

  /**
   * Set callback for data received
   */
  onData(callback: (data: SerialData) => void): void {
    this.onDataCallback = callback;
  }

  /**
   * Set callback for errors
   */
  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Close the serial connection
   */
  async close(): Promise<void> {
    this.isConnected = false;
    
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (error) {
        console.warn('Error closing reader:', error);
      }
      this.reader = null;
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch (error) {
        console.warn('Error closing port:', error);
      }
      this.port = null;
    }
  }

  /**
   * Check if currently connected
   */
  get connected(): boolean {
    return this.isConnected;
  }
}

/**
 * Simulate serial data for testing without hardware
 */
export class SerialSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private onDataCallback: ((data: SerialData) => void) | null = null;
  private isRunning = false;

  /**
   * Start simulating data at ~5-10Hz
   */
  startSimulation(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    const interval = 100 + Math.random() * 100; // 100-200ms intervals

    this.intervalId = setInterval(() => {
      const data: SerialData = this.generateSimulatedData();
      this.onDataCallback?.(data);
    }, interval);
  }

  /**
   * Stop simulation
   */
  stopSimulation(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Set callback for simulated data
   */
  onData(callback: (data: SerialData) => void): void {
    this.onDataCallback = callback;
  }

  /**
   * Generate realistic simulated vitals data
   */
  private generateSimulatedData(): SerialData {
    const now = Date.now();
    
    // Generate realistic vitals with some variation
    const baseBP = { sys: 120, dia: 80 };
    const baseHR = 75;
    const baseSpO2 = 98;
    const baseTemp = 36.8;
    const baseWeight = 70;

    return {
      ts: now,
      bp: {
        sys: Math.round(baseBP.sys + (Math.random() - 0.5) * 20),
        dia: Math.round(baseBP.dia + (Math.random() - 0.5) * 15),
      },
      hr: Math.round(baseHR + (Math.random() - 0.5) * 20),
      spo2: Math.round((baseSpO2 + (Math.random() - 0.5) * 4) * 10) / 10,
      tempC: Math.round((baseTemp + (Math.random() - 0.5) * 0.8) * 10) / 10,
      weightKg: Math.round((baseWeight + (Math.random() - 0.5) * 10) * 10) / 10,
    };
  }

  /**
   * Check if simulation is running
   */
  get running(): boolean {
    return this.isRunning;
  }
}
