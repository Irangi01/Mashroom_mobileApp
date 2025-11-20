import serial
import time

# Configure serial port
ser = serial.Serial('COM8', 9600, timeout=1)
time.sleep(2)  # Wait for connection to establish

print("Reading from COM7... Press Ctrl+C to stop\n")

try:
    while True:
        if ser.in_waiting > 0:
            line = ser.readline().decode('utf-8', errors='ignore').rstrip()
            print(line)
except KeyboardInterrupt:
    print("\nStopped by user")
finally:
    ser.close()
    print("Serial port closed")
