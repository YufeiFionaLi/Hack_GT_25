import React, { useState, useEffect } from 'react';
import { SerialReader, SerialSimulator } from '@/lib/serial/SerialReader';
import { useAppStore } from '@/lib/store';
import { Button } from './Button';
import { Card } from './Card';
import { Wifi, WifiOff, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SerialConnect() {
  const [serialReader, setSerialReader] = useState<SerialReader | null>(null);
  const [simulator, setSimulator] = useState<SerialSimulator | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const {
    isSerialConnected,
    isSimulating,
    setSerialConnected,
    setSimulating,
    updateVitalValue,
  } = useAppStore();

  useEffect(() => {
    const reader = new SerialReader();
    const sim = new SerialSimulator();
    
    reader.onData((data) => {
      // Update vitals with received data
      updateVitalValue('bpSys', data.bp.sys);
      updateVitalValue('bpDia', data.bp.dia);
      updateVitalValue('hr', data.hr);
      updateVitalValue('spo2', data.spo2);
      updateVitalValue('tempC', data.tempC);
      if (data.weightKg !== undefined) {
        updateVitalValue('weightKg', data.weightKg);
      }
    });

    reader.onError((err) => {
      setError(err.message);
      setSerialConnected(false);
    });

    sim.onData((data) => {
      // Update vitals with simulated data
      updateVitalValue('bpSys', data.bp.sys);
      updateVitalValue('bpDia', data.bp.dia);
      updateVitalValue('hr', data.hr);
      updateVitalValue('spo2', data.spo2);
      updateVitalValue('tempC', data.tempC);
      if (data.weightKg !== undefined) {
        updateVitalValue('weightKg', data.weightKg);
      }
    });

    setSerialReader(reader);
    setSimulator(sim);

    return () => {
      reader.close();
      sim.stopSimulation();
    };
  }, [updateVitalValue, setSerialConnected]);

  const handleConnect = async () => {
    if (!serialReader) return;
    
    try {
      setError(null);
      await serialReader.connect();
      setSerialConnected(true);
      setSimulating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  };

  const handleDisconnect = async () => {
    if (!serialReader) return;
    
    await serialReader.close();
    setSerialConnected(false);
  };

  const handleSimulate = () => {
    if (!simulator) return;
    
    if (isSimulating) {
      simulator.stopSimulation();
      setSimulating(false);
    } else {
      simulator.startSimulation();
      setSimulating(true);
      setSerialConnected(false);
      if (serialReader) {
        serialReader.close();
      }
    }
  };

  const isWebSerialSupported = SerialReader.isSupported();

  return (
    <Card className="mb-6">
      <h2 className="text-lg font-semibold text-[var(--text-strong)] mb-4">
        Hardware Connection
      </h2>
      
      <div className="space-y-4">
        {/* Web Serial Connection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'p-2 rounded-lg',
              isSerialConnected ? 'bg-green-100' : 'bg-gray-100'
            )}>
              {isSerialConnected ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div>
              <p className="font-medium text-[var(--text-strong)]">
                Arduino Connection
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {isSerialConnected ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>
          
          {isSerialConnected ? (
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleConnect}
              disabled={!isWebSerialSupported}
            >
              Connect Arduino
            </Button>
          )}
        </div>

        {/* Simulation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'p-2 rounded-lg',
              isSimulating ? 'bg-blue-100' : 'bg-gray-100'
            )}>
              {isSimulating ? (
                <Square className="h-5 w-5 text-blue-600" />
              ) : (
                <Play className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div>
              <p className="font-medium text-[var(--text-strong)]">
                Simulation Mode
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {isSimulating ? 'Running simulation' : 'Not running'}
              </p>
            </div>
          </div>
          
          <Button
            variant={isSimulating ? 'secondary' : 'outline'}
            onClick={handleSimulate}
          >
            {isSimulating ? 'Stop Simulation' : 'Simulate'}
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Web Serial support warning */}
        {!isWebSerialSupported && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Web Serial API is not supported in this browser. Use Chrome or Edge for hardware connection.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
